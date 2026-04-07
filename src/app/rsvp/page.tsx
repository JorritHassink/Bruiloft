"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import RsvpForm from "@/components/RsvpForm";

interface Invitation {
  id: string;
  token: string;
  name: string;
  type: string;
  max_guests: number;
}

interface Rsvp {
  attending: boolean;
  guest_count: number;
  dietary_notes: string | null;
}

function RsvpContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) { setNotFound(true); setLoading(false); return; }

      const { data: inv } = await supabase
        .from("invitations").select("*").eq("token", token).single();
      if (!inv) { setNotFound(true); setLoading(false); return; }

      setInvitation(inv);
      const { data: rsvpData } = await supabase
        .from("rsvps").select("*").eq("invitation_id", inv.id).single();
      if (rsvpData) setRsvp(rsvpData);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <p className="text-text-muted font-sans text-sm tracking-wide">Laden...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="font-serif text-2xl text-text mb-2">Uitnodiging niet gevonden</h2>
          <p className="text-text-light text-sm">Controleer of je de juiste link hebt gebruikt.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-bg to-bg-warm">
      {/* Header */}
      <div className="pt-16 pb-8 text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.35em] text-rose font-sans font-medium mb-4"
        >
          Bruiloft
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl md:text-5xl text-text font-light"
        >
          Jorrit & Renee
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center justify-center gap-3"
        >
          <span className="h-px w-12 bg-gold" />
          <span className="font-serif text-lg italic text-gold">2 Juli 2027</span>
          <span className="h-px w-12 bg-gold" />
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="max-w-lg mx-auto px-6 pb-16"
      >
        <div className="bg-bg-card rounded-3xl shadow-lg shadow-rose/5 border border-gold-light/30 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-text mb-2">
              Beste {invitation!.name}
            </h2>
            <p className="text-text-light text-sm leading-relaxed">
              {invitation!.type === "dag"
                ? "Wat fijn dat jullie erbij zijn! Jullie zijn uitgenodigd voor de hele dag."
                : "Wat fijn dat jullie erbij zijn! Jullie zijn uitgenodigd voor het avondfeest."}
            </p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-sans bg-blush-light/60 text-rose-dark">
              {invitation!.type === "dag" ? "Daggast" : "Avondgast"}
            </div>
          </div>

          {rsvp ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-sage-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-text mb-2">
                {rsvp.attending ? "Jullie zijn aangemeld!" : "Jammer dat jullie er niet bij kunnen zijn"}
              </h3>
              {rsvp.attending && (
                <p className="text-text-light text-sm">
                  {rsvp.guest_count} {rsvp.guest_count === 1 ? "persoon" : "personen"}
                  {rsvp.dietary_notes && ` — ${rsvp.dietary_notes}`}
                </p>
              )}
              <p className="text-text-muted text-sm mt-4 italic">
                Wil je iets wijzigen? Neem contact met ons op.
              </p>
            </div>
          ) : (
            <RsvpForm invitationId={invitation!.id} maxGuests={invitation!.max_guests} />
          )}
        </div>
      </motion.div>

      <footer className="py-8 text-center">
        <p className="text-xs text-text-muted tracking-[0.2em] font-sans">J & R — 02.07.2027</p>
      </footer>
    </main>
  );
}

export default function RsvpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted font-sans text-sm">Laden...</p>
      </div>
    }>
      <RsvpContent />
    </Suspense>
  );
}
