"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { uitnodigingTeksten, saveTheDateBericht, saveTheDateTeksten } from "@/lib/teksten";

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
  phone: string | null;
  max_guests: number;
  created_at: string;
  invite_status: InviteStatus;
  save_the_date_at: string | null;
  save_the_date_via: Via | null;
  invited_at: string | null;
  invited_via: Via | null;
  rsvps: Rsvp[];
}

// Verzendstatus: aangemaakt → save_the_date (verzonden) → uitgenodigd (wacht op reactie).
// "Komt" / "Komt niet" volgt uit de rsvp.
type InviteStatus = "aangemaakt" | "save_the_date" | "uitgenodigd";
type Via = "whatsapp" | "email";
type Stap = "save_the_date" | "uitgenodigd";

const STATUS_LABEL: Record<InviteStatus, string> = {
  aangemaakt: "Aangemaakt",
  save_the_date: "Save the date verzonden",
  uitgenodigd: "Wacht op reactie",
};

const STATUS_CLASS: Record<InviteStatus, string> = {
  aangemaakt: "bg-linen text-text-muted",
  save_the_date: "bg-blush-light text-rose-dark",
  uitgenodigd: "bg-gold-light/40 text-text-light",
};

const VIA_LABEL: Record<Via, string> = { whatsapp: "WhatsApp", email: "e-mail" };

const getRsvp = (inv: Invitation) =>
  Array.isArray(inv.rsvps) ? inv.rsvps[0] || null : inv.rsvps || null;

// Wat de WhatsApp/Email-knop nu verstuurt; null = niets meer te versturen (knoppen verborgen)
function volgendeStap(inv: Invitation): Stap | null {
  if (getRsvp(inv)) return null;
  if (inv.invite_status === "aangemaakt") return "save_the_date";
  if (inv.invite_status === "save_the_date") return "uitgenodigd";
  return null;
}

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Opmaak van de e-mail; de inhoud verschilt per stap (save the date of uitnodiging)
function emailHtml(o: { name: string; alineas: string[]; knopTekst: string; knopUrl: string; afsluiting: string }) {
  const p = (t: string) => `<p style="line-height: 1.7; color: #5a4e42;">\n      ${t}\n    </p>`;
  return `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3d3229;">
  <div style="text-align: center; padding: 40px 20px; background: linear-gradient(to bottom, #f5efe6, #fdfbf7); border-radius: 16px 16px 0 0;">
    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #c4967a; margin: 0;">Wij gaan trouwen</p>
    <h1 style="font-size: 36px; font-weight: 300; margin: 16px 0 8px; color: #3d3229;">Jorrit &amp; Renee</h1>
    <p style="font-size: 14px; color: #8a7e72; letter-spacing: 2px;">2 JULI 2027</p>
  </div>

  <div style="padding: 32px 24px; background: #ffffff; border: 1px solid #e5d5b0; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 8px;">Beste ${o.name},</p>

    ${o.alineas.map(p).join("\n\n    ")}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${o.knopUrl}" style="display: inline-block; padding: 14px 36px; background-color: #c4967a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-family: sans-serif;">
        ${o.knopTekst}
      </a>
    </div>

    <p style="font-size: 13px; color: #b5a99a; text-align: center;">
      Of kopieer deze link in je browser:<br/>
      <a href="${o.knopUrl}" style="color: #c4967a; word-break: break-all;">${o.knopUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5d5b0; margin: 32px 0;" />

    ${p(o.afsluiting)}

    ${p("Liefs,<br/>\n      <strong>Jorrit &amp; Renee</strong>")}
  </div>

  <div style="text-align: center; padding: 20px; background: #f5efe6; border-radius: 0 0 16px 16px; border: 1px solid #e5d5b0; border-top: none;">
    <p style="font-size: 12px; color: #b5a99a; margin: 0;">J &amp; R — 02.07.2027</p>
  </div>
</div>`;
}

// Zet elk nummer om naar internationaal formaat (E.164), voor alle landen:
// "06-12345678", "+31 (0)6 1234 5678", "+31 06 12345678" → "+31612345678",
// "0032 0470 12 34 56" → "+32470123456". Zonder landcode wordt Nederland aangenomen.
// Geeft null bij een ongeldig nummer.
function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/\(0\)/g, "").replace(/＋/g, "+").trim();
  let parsed = parsePhoneNumberFromString(cleaned, "NL");
  // "32470123456": landcode zonder + of 00 ervoor
  if (!parsed?.isValid() && /^[1-9]/.test(cleaned)) parsed = parsePhoneNumberFromString(`+${cleaned}`);
  return parsed?.isValid() ? parsed.number : null;
}

const PHONE_ERROR = "Ongeldig nummer. Bijvoorbeeld 06 12345678, of voor het buitenland +32 470 12 34 56";

export default function AdminDashboard() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [qrModal, setQrModal] = useState<{ qr: string; url: string; name: string } | null>(null);
  const [emailModal, setEmailModal] = useState<{ inv: Invitation; stap: Stap } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [editInv, setEditInv] = useState<Invitation | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"dag" | "avond">("dag");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [createError, setCreateError] = useState("");
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
    const phone = newPhone.trim() ? normalizePhone(newPhone) : null;
    if (newPhone.trim() && !phone) { setCreateError(PHONE_ERROR); return; }
    setCreateError("");
    await supabase.from("invitations").insert({
      name: newName, type: newType, email: newEmail || null, phone, max_guests: newMaxGuests,
    });
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewMaxGuests(2); setShowForm(false);
    fetchInvitations();
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze uitnodiging wilt verwijderen?")) return;
    // rsvps verdwijnen via on delete cascade
    await supabase.from("invitations").delete().eq("id", id);
    fetchInvitations();
  }

  // Zet de status één stap verder na het versturen van een save the date of uitnodiging
  async function markSent(inv: Invitation, via: Via, stap: Stap) {
    const now = new Date().toISOString();
    await supabase.from("invitations").update(
      stap === "save_the_date"
        ? { invite_status: "save_the_date", save_the_date_at: now, save_the_date_via: via }
        : { invite_status: "uitgenodigd", invited_at: now, invited_via: via }
    ).eq("id", inv.id);
    fetchInvitations();
  }

  function handleOpenEmail(inv: Invitation) {
    const stap = volgendeStap(inv);
    if (!inv.email || !stap) return;
    const { name, token, type, max_guests } = inv;

    if (stap === "save_the_date") {
      const s = saveTheDateTeksten(max_guests);
      setEmailSubject(s.onderwerp);
      setEmailBody(emailHtml({
        name,
        alineas: [
          "Wij gaan trouwen! Save the date: <strong>2 juli 2027</strong>.",
          `${s.agenda} De officiële uitnodiging met alle details volgt later.`,
        ],
        knopTekst: "Bekijk de website",
        knopUrl: BASE_URL || "https://jorritenrenee.nl",
        afsluiting: s.afsluiting,
      }));
    } else {
      const u = uitnodigingTeksten(max_guests, type);
      const typeTekst = type === "dag" ? "de hele dag" : "het avondfeest";
      setEmailSubject(u.onderwerp);
      setEmailBody(emailHtml({
        name,
        alineas: [
          u.uitnodiging
            .replace("2 juli 2027", "<strong>2 juli 2027</strong>")
            .replace(typeTekst, `<strong>${typeTekst}</strong>`),
          u.verzoekMail,
        ],
        knopTekst: "Aanmelden",
        knopUrl: `${BASE_URL}/rsvp?t=${token}`,
        afsluiting: u.afsluiting,
      }));
    }
    setEmailSent(false);
    setEmailError("");
    setEmailModal({ inv, stap });
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
            to: emailModal.inv.email,
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
      await markSent(emailModal.inv, "email", emailModal.stap);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setEmailSending(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editInv) return;
    const phone = editInv.phone?.trim() ? normalizePhone(editInv.phone) : null;
    if (editInv.phone?.trim() && !phone) { setEditError(PHONE_ERROR); return; }
    setEditSaving(true);
    setEditError("");
    // Status terugzetten wist de verzendgegevens van de latere stappen
    const status = editInv.invite_status;
    const { error } = await supabase.from("invitations").update({
      name: editInv.name,
      type: editInv.type,
      email: editInv.email || null,
      phone,
      max_guests: editInv.max_guests,
      invite_status: status,
      ...(status === "aangemaakt" && { save_the_date_at: null, save_the_date_via: null }),
      ...(status !== "uitgenodigd" && { invited_at: null, invited_via: null }),
    }).eq("id", editInv.id);
    setEditSaving(false);
    if (error) {
      setEditError("Opslaan mislukt, probeer het opnieuw");
      return;
    }
    setEditInv(null);
    fetchInvitations();
  }

  function handleWhatsApp(inv: Invitation) {
    const stap = volgendeStap(inv);
    if (!stap) return;
    const { token, name, type, phone, max_guests } = inv;
    const rsvpUrl = `${BASE_URL}/rsvp?t=${token}`;
    const u = uitnodigingTeksten(max_guests, type);
    const text = stap === "save_the_date"
      ? saveTheDateBericht(name, max_guests)
      : `Beste ${name},\n\n` +
        `Wij gaan trouwen! 💍 ${u.uitnodiging}\n\n` +
        `${u.verzoek}\n${rsvpUrl}\n\n` +
        `Liefs, Jorrit & Renee`;
    // Ook oude, niet-omgezette nummers werken zo
    const number = phone ? normalizePhone(phone)?.slice(1) ?? "" : "";
    // Direct naar api.whatsapp.com: de redirect via wa.me verminkt emoji zoals 💍
    const params = new URLSearchParams({ text });
    if (number) params.set("phone", number);
    window.open(`https://api.whatsapp.com/send?${params.toString()}`, "_blank", "noopener");
    markSent(inv, "whatsapp", stap);
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
  const zonderReactie = invitations.filter((i) => !getRsvp(i));
  const statusTelling = (Object.keys(STATUS_LABEL) as InviteStatus[]).map((s) => ({
    status: s,
    aantal: zonderReactie.filter((i) => i.invite_status === s).length,
  }));

  // Totaal aantal personen dat maximaal kan komen (som van max gasten per uitnodiging)
  const maxGasten = (items: Invitation[]) => items.reduce((s, i) => s + i.max_guests, 0);

  const stats = {
    total: invitations.length,
    responded: invitations.filter((i) => getRsvp(i)).length,
    dag: dagInvitations.filter((i) => getRsvp(i)?.attending).reduce((s, i) => s + (getRsvp(i)?.guest_count || 0), 0),
    avond: avondInvitations.filter((i) => getRsvp(i)?.attending).reduce((s, i) => s + (getRsvp(i)?.guest_count || 0), 0),
    dagMax: maxGasten(dagInvitations),
    avondMax: maxGasten(avondInvitations),
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
            { label: "Daggasten (komt / max)", value: `${stats.dag} / ${stats.dagMax}` },
            { label: "Avondgasten (komt / max)", value: `${stats.avond} / ${stats.avondMax}` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-bg-card rounded-2xl border border-gold-light/30 p-5 text-center">
              <div className="font-serif text-3xl text-text">{stat.value}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-sans mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Verzendstatus (gasten die nog niet gereageerd hebben) */}
        <div className="flex flex-wrap gap-2 justify-center">
          {statusTelling.map(({ status, aantal }) => (
            <span key={status} className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium ${STATUS_CLASS[status]}`}>
              {STATUS_LABEL[status]}: {aantal}
            </span>
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
                  <label className="block text-sm text-text font-sans mb-1">Mobiel nummer (optioneel)</label>
                  <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="06 12345678 of +32 470 12 34 56" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Max gasten</label>
                  <input type="number" min={1} max={10} value={newMaxGuests} onChange={(e) => setNewMaxGuests(Number(e.target.value))} className={inputClass} />
                </div>
                {createError && <p className="md:col-span-2 text-red-500 text-sm">{createError}</p>}
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
                {title} <span className="text-text-muted text-sm font-sans">({items.length} {items.length === 1 ? "uitnodiging" : "uitnodigingen"} · max {maxGasten(items)} personen)</span>
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
                      const stap = volgendeStap(inv);
                      const verzonden = inv.invite_status === "uitgenodigd"
                        ? inv.invited_at && inv.invited_via && `${formatDatum(inv.invited_at)} · ${VIA_LABEL[inv.invited_via]}`
                        : inv.invite_status === "save_the_date"
                          ? inv.save_the_date_at && inv.save_the_date_via && `${formatDatum(inv.save_the_date_at)} · ${VIA_LABEL[inv.save_the_date_via]}`
                          : null;
                      return (
                        <tr key={inv.id} className="hover:bg-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text">{inv.name}</div>
                            {inv.email && <div className="text-xs text-text-muted">{inv.email}</div>}
                            {inv.phone && <div className="text-xs text-text-muted">{inv.phone}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              rsvp ? (rsvp.attending ? "bg-sage-light/40 text-sage-dark" : "bg-red-50 text-red-500")
                                : STATUS_CLASS[inv.invite_status]
                            }`}>
                              {rsvp ? (rsvp.attending ? "Komt" : "Komt niet") : STATUS_LABEL[inv.invite_status]}
                            </span>
                            {!rsvp && verzonden && <div className="text-[11px] text-text-muted mt-1">{verzonden}</div>}
                            {stap && (
                              <div className="text-[11px] text-text-muted mt-1">
                                Volgende: {stap === "save_the_date" ? "save the date" : "uitnodiging"}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-text-light">
                            {rsvp?.attending
                              ? <>{rsvp.guest_count} van {inv.max_guests}{rsvp.guest_names && <div className="text-xs text-text-muted">{rsvp.guest_names}</div>}</>
                              : <span className="text-text-muted">max {inv.max_guests}</span>}
                          </td>
                          <td className="px-6 py-4 text-text-light text-xs">{rsvp?.dietary_notes || "—"}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleShowQr(inv.token, inv.name)}
                                className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">QR</button>
                              {stap && (
                                <button onClick={() => handleWhatsApp(inv)}
                                  className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">WhatsApp</button>
                              )}
                              {stap && inv.email && (
                                <button onClick={() => handleOpenEmail(inv)}
                                  className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">Email</button>
                              )}
                              <button onClick={() => { setEditError(""); setEditInv(inv); }}
                                className="px-3 py-1.5 text-xs bg-cream border border-gold-light/40 text-text rounded-lg hover:bg-gold-light/20 transition-colors">Bewerken</button>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editInv && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setEditInv(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-3xl p-8 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-serif text-xl text-text mb-6">Uitnodiging bewerken</h3>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Naam</label>
                  <input type="text" required value={editInv.name}
                    onChange={(e) => setEditInv({ ...editInv, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Type</label>
                  <select value={editInv.type} onChange={(e) => setEditInv({ ...editInv, type: e.target.value })} className={inputClass}>
                    <option value="dag">Daggast</option>
                    <option value="avond">Avondgast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">E-mail (optioneel)</label>
                  <input type="email" value={editInv.email || ""} placeholder="email@voorbeeld.nl"
                    onChange={(e) => setEditInv({ ...editInv, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Mobiel nummer (optioneel)</label>
                  <input type="tel" value={editInv.phone || ""} placeholder="06 12345678 of +32 470 12 34 56"
                    onChange={(e) => setEditInv({ ...editInv, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Max gasten</label>
                  <input type="number" min={1} max={10} value={editInv.max_guests}
                    onChange={(e) => setEditInv({ ...editInv, max_guests: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-text font-sans mb-1">Status</label>
                  <select value={editInv.invite_status}
                    onChange={(e) => setEditInv({ ...editInv, invite_status: e.target.value as InviteStatus })} className={inputClass}>
                    {(Object.keys(STATUS_LABEL) as InviteStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {getRsvp(editInv) && (
                    <p className="text-xs text-text-muted mt-1">Deze gast heeft al gereageerd; in het overzicht blijft Komt / Komt niet staan.</p>
                  )}
                </div>

                {editError && <p className="text-red-500 text-sm text-center">{editError}</p>}

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setEditInv(null)}
                    className="px-5 py-2.5 border border-gold-light/40 text-text-light rounded-xl text-sm font-sans hover:bg-cream transition-colors">Annuleren</button>
                  <button type="submit" disabled={editSaving}
                    className="px-5 py-2.5 bg-rose text-white rounded-xl text-sm font-sans font-medium hover:bg-rose-dark transition-colors disabled:opacity-50">
                    {editSaving ? "Opslaan..." : "Opslaan"}
                  </button>
                </div>
              </form>
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
              <p className="text-sm text-text-muted font-sans mb-6">
                {emailModal.stap === "save_the_date" ? "Save the date" : "Uitnodiging"} naar: {emailModal.inv.name} ({emailModal.inv.email})
              </p>

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
