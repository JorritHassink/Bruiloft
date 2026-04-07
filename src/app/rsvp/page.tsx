"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RsvpForm from "@/components/RsvpForm";
import { Suspense } from "react";

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
      if (!token) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: inv } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (!inv) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setInvitation(inv);

      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("*")
        .eq("invitation_id", inv.id)
        .single();

      if (rsvpData) setRsvp(rsvpData);
      setLoading(false);
    }

    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary-light">Laden...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary-light">Uitnodiging niet gevonden.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-background to-blush/30">
      <div className="pt-16 pb-8 text-center px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary-light mb-4">
          Bruiloft
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-primary-dark font-light">
          Jorrit & Renee
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-gold" />
          <span className="font-serif text-lg italic text-gold">2 Juli 2027</span>
          <span className="h-px w-12 bg-gold" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-gold-light/50 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-dark mb-2">
              Beste {invitation!.name}
            </h2>
            <p className="text-primary">
              {invitation!.type === "dag"
                ? "Wat fijn dat jullie erbij zijn! Jullie zijn uitgenodigd voor de hele dag."
                : "Wat fijn dat jullie erbij zijn! Jullie zijn uitgenodigd voor het avondfeest."}
            </p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-sage-light/50 text-sage">
              {invitation!.type === "dag" ? "Daggast" : "Avondgast"}
            </div>
          </div>

          {rsvp ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-primary-dark mb-2">
                {rsvp.attending
                  ? "Jullie zijn aangemeld!"
                  : "Jammer dat jullie er niet bij kunnen zijn"}
              </h3>
              {rsvp.attending && (
                <p className="text-primary text-sm">
                  {rsvp.guest_count} {rsvp.guest_count === 1 ? "persoon" : "personen"}
                  {rsvp.dietary_notes && ` — Dieetwensen: ${rsvp.dietary_notes}`}
                </p>
              )}
              <p className="text-primary-light text-sm mt-4 italic">
                Wil je je registratie wijzigen? Neem contact met ons op.
              </p>
            </div>
          ) : (
            <RsvpForm
              invitationId={invitation!.id}
              maxGuests={invitation!.max_guests}
            />
          )}
        </div>
      </div>

      <footer className="py-8 bg-cream text-center">
        <p className="text-sm text-primary-light tracking-wide">
          J & R — 02.07.2027
        </p>
      </footer>
    </main>
  );
}

export default function RsvpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary-light">Laden...</p>
      </div>
    }>
      <RsvpContent />
    </Suspense>
  );
}
