"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface RsvpFormProps {
  invitationId: string;
  maxGuests: number;
}

export default function RsvpForm({ invitationId, maxGuests }: RsvpFormProps) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: dbError } = await supabase.from("rsvps").insert({
        invitation_id: invitationId,
        attending,
        guest_count: attending ? guestCount : 0,
        guest_names: attending ? guestNames || null : null,
        dietary_notes: attending ? dietaryNotes || null : null,
        remarks: remarks || null,
      });

      if (dbError) throw new Error(dbError.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-xl text-primary-dark mb-2">
          {attending ? "Bedankt voor jullie aanmelding!" : "Bedankt voor het laten weten."}
        </h3>
        {attending && (
          <p className="text-primary text-sm">We kijken ernaar uit jullie te zien!</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary-dark mb-3">
          Kunnen jullie erbij zijn?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              attending === true
                ? "border-sage bg-sage-light/30 text-primary-dark"
                : "border-gold-light/50 text-primary-light hover:border-gold-light"
            }`}
          >
            Ja, wij komen!
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              attending === false
                ? "border-sage bg-sage-light/30 text-primary-dark"
                : "border-gold-light/50 text-primary-light hover:border-gold-light"
            }`}
          >
            Helaas, wij kunnen niet
          </button>
        </div>
      </div>

      {attending === true && (
        <>
          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Met hoeveel personen?
            </label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-gold-light/50 px-4 py-3 text-primary-dark bg-white focus:border-gold focus:outline-none transition-colors"
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "persoon" : "personen"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Namen van de gasten
            </label>
            <input
              type="text"
              value={guestNames}
              onChange={(e) => setGuestNames(e.target.value)}
              placeholder="bijv. Jan en Petra"
              className="w-full rounded-xl border-2 border-gold-light/50 px-4 py-3 text-primary-dark placeholder:text-primary-light/50 bg-white focus:border-gold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Dieetwensen of allergieën
            </label>
            <textarea
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="bijv. vegetarisch, glutenvrij, notenallergie..."
              rows={2}
              className="w-full rounded-xl border-2 border-gold-light/50 px-4 py-3 text-primary-dark placeholder:text-primary-light/50 bg-white focus:border-gold focus:outline-none transition-colors resize-none"
            />
          </div>
        </>
      )}

      {attending !== null && (
        <div>
          <label className="block text-sm font-medium text-primary-dark mb-2">
            Opmerkingen
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Iets dat je ons wilt laten weten?"
            rows={2}
            className="w-full rounded-xl border-2 border-gold-light/50 px-4 py-3 text-primary-dark placeholder:text-primary-light/50 bg-white focus:border-gold focus:outline-none transition-colors resize-none"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {attending !== null && (
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Verzenden..." : "Registratie bevestigen"}
        </button>
      )}
    </form>
  );
}
