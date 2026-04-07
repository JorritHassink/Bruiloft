"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light/40 flex items-center justify-center">
          <svg className="w-8 h-8 text-sage-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-text mb-2">
          {attending ? "Bedankt voor jullie aanmelding!" : "Bedankt voor het laten weten."}
        </h3>
        {attending && (
          <p className="text-text-light">We kijken ernaar uit jullie te zien!</p>
        )}
      </motion.div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gold-light/40 bg-bg px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-rose-light focus:ring-1 focus:ring-rose-light/30 focus:outline-none transition-all font-sans text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-sans font-medium text-text mb-3">
          Kunnen jullie erbij zijn?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true, label: "Ja, wij komen!", icon: "🎉" },
            { value: false, label: "Helaas niet", icon: "😔" },
          ].map((opt) => (
            <motion.button
              key={String(opt.value)}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAttending(opt.value)}
              className={`py-4 px-4 rounded-xl border-2 text-sm font-sans transition-all ${
                attending === opt.value
                  ? "border-rose bg-blush-light/40 text-text"
                  : "border-gold-light/30 text-text-light hover:border-gold-light"
              }`}
            >
              <span className="text-xl block mb-1">{opt.icon}</span>
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {attending === true && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5 overflow-hidden"
          >
            <div>
              <label className="block text-sm font-sans font-medium text-text mb-2">
                Met hoeveel personen?
              </label>
              <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className={inputClass}>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "persoon" : "personen"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-text mb-2">
                Namen van de gasten
              </label>
              <input
                type="text"
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
                placeholder="bijv. Jan en Petra"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-text mb-2">
                Dieetwensen of allergieën
              </label>
              <textarea
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="bijv. vegetarisch, glutenvrij..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {attending !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-sm font-sans font-medium text-text mb-2">
                Opmerkingen
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Iets dat je ons wilt laten weten?"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-6 rounded-xl bg-rose text-white font-sans font-medium text-sm hover:bg-rose-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Verzenden..." : "Registratie bevestigen"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
