"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";

interface Rsvp {
  id: string;
  attending: boolean;
  guest_count: number;
  guest_names: string | null;
  dietary_notes: string | null;
  remarks: string | null;
}

interface Invitation {
  id: string;
  token: string;
  name: string;
  type: string;
  email: string | null;
  max_guests: number;
  created_at: string;
  rsvps: Rsvp[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function AdminDashboard() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [qrModal, setQrModal] = useState<{ qr: string; url: string; name: string } | null>(null);
  const [emailModal, setEmailModal] = useState<{ to: string; name: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"dag" | "avond">("dag");
  const [newEmail, setNewEmail] = useState("");
  const [newMaxGuests, setNewMaxGuests] = useState(2);

  const fetchInvitations = useCallback(async () => {
    const { data } = await supabase
      .from("invitations").select("*, rsvps(*)").order("created_at", { ascending: false });
    setInvitations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("invitations").insert({
      name: newName, type: newType, email: newEmail || null, max_guests: newMaxGuests,
    });
    setNewName(""); setNewEmail(""); setNewMaxGuests(2); setShowForm(false);
    fetchInvitations();
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze uitnodiging wilt verwijderen?")) return;
    await supabase.from("rsvps").delete().eq("invitation_id", id);
    await supabase.from("invitations").delete().eq("id", id);
    fetchInvitations();
  }

  function handleOpenEmail(email: string, name: string) {
    setEmailSubject("Bruiloft Jorrit & Renee — 2 Juli 2027");
    setEmailBody(`<p>Beste ${name},</p>\n<p></p>\n<p>Met vriendelijke groet,<br/>Jorrit & Renee</p>`);
    setEmailSent(false);
    setEmailError("");
    setEmailModal({ to: email, name });
  }

  async function handleSendEmail() {
    if (!emailModal) return;
    setEmailSending(true);
    setEmailError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            to: emailModal.to,
            subject: emailSubject,
            body: emailBody,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verzenden mislukt");
      }

      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setEmailSending(false);
    }
  }

  async function handleShowQr(token: string, name: string) {
    const rsvpUrl = `${BASE_URL}/rsvp?t=${token}`;
    const qr = await QRCode.toDataURL(rsvpUrl, {
      width: 400, margin: 2,
      color: { dark: "#3d3229", light: "#fdfbf7" },
    });
    setQrModal({ qr, url: rsvpUrl, name });
  }

  const dagInvitations = invitations.filter((i) => i.type === "dag");
  const avondInvitations = invitations.filter((i) => i.type === "avond");
  const getRsvp = (inv: Invitation) =>
    Array.isArray(inv.rsvps) ? inv.rsvps[0] || null : inv.rsvps || null;

  const stats = {
    total: invitations.length,
    responded: invitations.filter((i) => getRsvp(i)).length,
    dag: dagInvitations.filter((i) => getRsvp(i)?.attending).reduce((s, i) => s + (getRsvp(i)?.guest_count || 0), 0),
    avond: avondInvitations.filter((i) => getRsvp(i)?.attending).reduce((s, i) => s + (getRsvp(i)?.guest_count || 0), 0),
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg"><p className="text-text-muted font-sans text-sm">Laden...</p></div>;
  }

  const inputClass = "w-full rounded-lg border border-gold-light/40 bg-bg px-3 py-2 text-sm text-text font-sans focus:border-rose-light focus:outline-none transition-all";

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg-card border-b border-gold-light/30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-text">Admin Dashboard</h1>
            <p className="text-sm text-text-muted font-sans">Jorrit & Renee — 2 Juli 2027</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-rose text-white rounded-xl text-sm font-sans font-medium hover:bg-rose-dark transition-colors">
              + Uitnodiging
            </motion.button>
            <button onClick={() => supabase.auth.signOut()}
              className="px-5 py-2.5 border border-gold-light/40 text-text-light rounded-xl text-sm font-sans hover:bg-cream transition-colors">
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Uitnodigingen", value: stats.total },
            { label: "Gereageerd", value: `${stats.responded}/${stats.total}` },
            { label: "Daggasten", value: stats.dag },
            { label: "Avondgasten", value: stats.avond },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-bg-card rounded-2xl border border-gold-light/30 p-5 text-center">
              <div className="font-serif text-3xl text-text">{stat.value}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-sans mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="bg-bg-card rounded-2xl border border-gold-light/30 p-6 overflow-hidden">
              <h2 className="font-serif text-lg text-text mb-4">Nieuwe uitnodiging</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Naam</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="bijv. Jan & Petra" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as "dag" | "avond")} className={inputClass}>
                    <option value="dag">Daggast</option>
                    <option value="avond">Avondgast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">E-mail (optioneel)</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@voorbeeld.nl" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Max gasten</label>
                  <input type="number" min={1} max={10} value={newMaxGuests} onChange={(e) => setNewMaxGuests(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="px-5 py-2 bg-rose text-white rounded-lg text-sm font-sans font-medium hover:bg-rose-dark transition-colors">Toevoegen</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gold-light/40 text-text-light rounded-lg text-sm font-sans hover:bg-cream transition-colors">Annuleren</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tables */}
        {[
          { title: "Daggasten", items: dagInvitations },
          { title: "Avondgasten", items: avondInvitations },
        ].map(({ title, items }) => (
          <div key={title} className="bg-bg-card rounded-2xl border border-gold-light/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-linen">
              <h2 className="font-serif text-lg text-text">
                {title} <span className="text-text-muted text-sm font-sans">({items.length})</span>
              </h2>
            </div>
            {items.length === 0 ? (
              <p className="px-6 py-8 text-center text-text-muted text-sm font-sans">Nog geen {title.toLowerCase()} toegevoegd</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="bg-cream/50 text-left">
                      {["Naam", "Status", "Gasten", "Dieet", "Acties"].map((h) => (
                        <th key={h} className="px-6 py-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linen/50">
                    {items.map((inv) => {
                      const rsvp = getRsvp(inv);
                      return (
                        <tr key={inv.id} className="hover:bg-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text">{inv.name}</div>
                            {inv.email && <div className="text-xs text-text-muted">{inv.email}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                              rsvp ? (rsvp.attending ? "bg-sage-light/40 text-sage-dark" : "bg-blush/50 text-rose-dark")
                                : "bg-gold-light/30 text-text-muted"
                            }`}>
                              {rsvp ? (rsvp.attending ? "Komt" : "Komt niet") : "Wacht op reactie"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-light">
                            {rsvp?.attending ? `${rsvp.guest_count} ${rsvp.guest_names ? `(${rsvp.guest_names})` : ""}` : "—"}
                          </td>
                          <td className="px-6 py-4 text-text-light text-xs">{rsvp?.dietary_notes || "—"}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleShowQr(inv.token, inv.name)}
                                className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">QR</button>
                              {inv.email && (
                                <button onClick={() => handleOpenEmail(inv.email!, inv.name)}
                                  className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">Email</button>
                              )}
                              <button onClick={() => handleDelete(inv.id)}
                                className="px-3 py-1.5 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Verwijder</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {qrModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setQrModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-serif text-xl text-text mb-1">QR Code</h3>
              <p className="text-sm text-text-muted font-sans mb-6">{qrModal.name}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrModal.qr} alt="QR Code" className="mx-auto mb-4 rounded-2xl" />
              <p className="text-[10px] text-text-muted break-all mb-6 font-sans">{qrModal.url}</p>
              <div className="flex gap-3 justify-center">
                <a href={qrModal.qr} download={`qr-${qrModal.name.replace(/\s+/g, "-").toLowerCase()}.png`}
                  className="px-5 py-2.5 bg-rose text-white rounded-xl text-sm font-sans font-medium hover:bg-rose-dark transition-colors">Download</a>
                <button onClick={() => setQrModal(null)}
                  className="px-5 py-2.5 border border-gold-light/40 text-text-light rounded-xl text-sm font-sans hover:bg-cream transition-colors">Sluiten</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {emailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setEmailModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-3xl p-8 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-serif text-xl text-text mb-1">E-mail versturen</h3>
              <p className="text-sm text-text-muted font-sans mb-6">Naar: {emailModal.name} ({emailModal.to})</p>

              {emailSent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-sage-light/40 flex items-center justify-center">
                    <svg className="w-7 h-7 text-sage-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-serif text-lg text-text">E-mail verzonden!</p>
                  <button onClick={() => setEmailModal(null)}
                    className="mt-4 px-5 py-2 border border-gold-light/40 text-text-light rounded-xl text-sm font-sans hover:bg-cream transition-colors">Sluiten</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text font-sans mb-1">Onderwerp</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-lg border border-gold-light/40 bg-bg px-3 py-2 text-sm text-text font-sans focus:border-rose-light focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-text font-sans mb-1">Bericht (HTML)</label>
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={8}
                      className="w-full rounded-lg border border-gold-light/40 bg-bg px-3 py-2 text-sm text-text font-sans focus:border-rose-light focus:outline-none resize-none" />
                  </div>

                  {emailError && <p className="text-red-500 text-sm text-center">{emailError}</p>}

                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setEmailModal(null)}
                      className="px-5 py-2.5 border border-gold-light/40 text-text-light rounded-xl text-sm font-sans hover:bg-cream transition-colors">Annuleren</button>
                    <button onClick={handleSendEmail} disabled={emailSending}
                      className="px-5 py-2.5 bg-rose text-white rounded-xl text-sm font-sans font-medium hover:bg-rose-dark transition-colors disabled:opacity-50">
                      {emailSending ? "Verzenden..." : "Verstuur e-mail"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
