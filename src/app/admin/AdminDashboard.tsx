"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";

interface Rsvp {
  id: string;
  attending: boolean;
  guest_count: number;
  guest_names: string | null;
  dietary_notes: string | null;
  remarks: string | null;
  created_at: string;
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

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"dag" | "avond">("dag");
  const [newEmail, setNewEmail] = useState("");
  const [newMaxGuests, setNewMaxGuests] = useState(2);

  const fetchInvitations = useCallback(async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*, rsvps(*)")
      .order("created_at", { ascending: false });
    setInvitations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("invitations").insert({
      name: newName,
      type: newType,
      email: newEmail || null,
      max_guests: newMaxGuests,
    });
    setNewName("");
    setNewEmail("");
    setNewMaxGuests(2);
    setShowForm(false);
    fetchInvitations();
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze uitnodiging wilt verwijderen?")) return;
    await supabase.from("rsvps").delete().eq("invitation_id", id);
    await supabase.from("invitations").delete().eq("id", id);
    fetchInvitations();
  }

  async function handleShowQr(token: string, name: string) {
    const rsvpUrl = `${BASE_URL}/rsvp?t=${token}`;
    const qr = await QRCode.toDataURL(rsvpUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#2c2c2c", light: "#faf8f5" },
    });
    setQrModal({ qr, url: rsvpUrl, name });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const dagInvitations = invitations.filter((i) => i.type === "dag");
  const avondInvitations = invitations.filter((i) => i.type === "avond");

  const getRsvp = (inv: Invitation) => inv.rsvps?.[0] || null;

  const stats = {
    totalInvitations: invitations.length,
    totalResponded: invitations.filter((i) => getRsvp(i)).length,
    dagGuests: dagInvitations
      .filter((i) => getRsvp(i)?.attending)
      .reduce((sum, i) => sum + (getRsvp(i)?.guest_count || 0), 0),
    avondGuests: avondInvitations
      .filter((i) => getRsvp(i)?.attending)
      .reduce((sum, i) => sum + (getRsvp(i)?.guest_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary-light">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gold-light/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-primary-dark">Admin Dashboard</h1>
            <p className="text-sm text-primary-light">Jorrit & Renee — 2 Juli 2027</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              + Uitnodiging toevoegen
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-gold-light/50 text-primary rounded-xl text-sm hover:bg-cream transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Uitnodigingen", value: stats.totalInvitations },
            { label: "Gereageerd", value: `${stats.totalResponded}/${stats.totalInvitations}` },
            { label: "Daggasten", value: stats.dagGuests },
            { label: "Avondgasten", value: stats.avondGuests },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gold-light/50 p-5 text-center">
              <div className="font-serif text-3xl text-primary-dark">{stat.value}</div>
              <div className="text-xs text-primary-light uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gold-light/50 p-6">
            <h2 className="font-serif text-lg text-primary-dark mb-4">Nieuwe uitnodiging</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-primary-dark mb-1">Naam</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="bijv. Jan & Petra de Vries"
                  className="w-full rounded-lg border border-gold-light/50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-primary-dark mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "dag" | "avond")}
                  className="w-full rounded-lg border border-gold-light/50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                >
                  <option value="dag">Daggast</option>
                  <option value="avond">Avondgast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-primary-dark mb-1">E-mail (optioneel)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@voorbeeld.nl"
                  className="w-full rounded-lg border border-gold-light/50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-primary-dark mb-1">Max gasten</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newMaxGuests}
                  onChange={(e) => setNewMaxGuests(Number(e.target.value))}
                  className="w-full rounded-lg border border-gold-light/50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 border border-gold-light/50 text-primary rounded-lg text-sm hover:bg-cream transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tables */}
        {[
          { title: "Daggasten", items: dagInvitations },
          { title: "Avondgasten", items: avondInvitations },
        ].map(({ title, items }) => (
          <div key={title} className="bg-white rounded-xl border border-gold-light/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-light/30">
              <h2 className="font-serif text-lg text-primary-dark">
                {title} <span className="text-primary-light text-sm font-sans">({items.length})</span>
              </h2>
            </div>
            {items.length === 0 ? (
              <p className="px-6 py-8 text-center text-primary-light text-sm">
                Nog geen {title.toLowerCase()} toegevoegd
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream/50 text-left">
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-primary-light font-medium">Naam</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-primary-light font-medium">Status</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-primary-light font-medium">Gasten</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-primary-light font-medium">Dieet</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-primary-light font-medium">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-light/20">
                    {items.map((inv) => {
                      const rsvp = getRsvp(inv);
                      return (
                        <tr key={inv.id} className="hover:bg-cream/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-primary-dark">{inv.name}</div>
                            {inv.email && <div className="text-xs text-primary-light">{inv.email}</div>}
                          </td>
                          <td className="px-6 py-4">
                            {rsvp ? (
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                  rsvp.attending
                                    ? "bg-sage-light/50 text-sage"
                                    : "bg-blush/50 text-primary"
                                }`}
                              >
                                {rsvp.attending ? "Komt" : "Komt niet"}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gold-light/30 text-primary-light">
                                Wacht op reactie
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-primary">
                            {rsvp?.attending
                              ? `${rsvp.guest_count} ${rsvp.guest_names ? `(${rsvp.guest_names})` : ""}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-primary text-xs">
                            {rsvp?.dietary_notes || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleShowQr(inv.token, inv.name)}
                                className="px-3 py-1.5 text-xs bg-cream border border-gold-light/50 text-primary-dark rounded-lg hover:bg-gold-light/30 transition-colors"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => handleDelete(inv.id)}
                                className="px-3 py-1.5 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Verwijder
                              </button>
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
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="font-serif text-xl text-primary-dark mb-2">QR Code</h3>
            <p className="text-sm text-primary-light mb-6">{qrModal.name}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrModal.qr} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
            <p className="text-xs text-primary-light break-all mb-6">{qrModal.url}</p>
            <div className="flex gap-3 justify-center">
              <a
                href={qrModal.qr}
                download={`qr-${qrModal.name.replace(/\s+/g, "-").toLowerCase()}.png`}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Download
              </a>
              <button
                onClick={() => setQrModal(null)}
                className="px-5 py-2 border border-gold-light/50 text-primary rounded-xl text-sm hover:bg-cream transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
