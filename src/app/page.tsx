"use client";

// Save-the-date homepage. De volledige homepage staat in src/app/_archief/volledige-homepage.tsx.

import { motion } from "framer-motion";
import FloralDivider from "@/components/FloralDivider";
import Countdown from "@/components/Countdown";

const GOOGLE_AGENDA =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Bruiloft Jorrit & Renee") +
  "&dates=20270702/20270703" +
  "&details=" + encodeURIComponent("Save the date! De officiële uitnodiging volgt later. Meer info: jorritenrenee.nl");

export default function Home() {
  const buttonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-sans font-medium transition-colors";

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cream via-bg to-bg-warm px-6 py-20">
        {/* Decorative background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blush-light/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sage-light/20 rounded-full blur-3xl" />
        </div>

        {/* Top gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <div className="relative text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs uppercase tracking-[0.4em] text-rose font-sans font-medium mb-8"
          >
            Wij gaan trouwen
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-text leading-[0.9]"
          >
            Jorrit
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="my-4 md:my-6 flex items-center justify-center gap-5"
          >
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-gold" />
            <span className="font-serif text-3xl md:text-4xl italic text-gold">&</span>
            <span className="h-px w-20 bg-gradient-to-l from-transparent to-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-text leading-[0.9]"
          >
            Renee
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-10 md:mt-14"
          >
            <p className="font-sans text-sm md:text-base tracking-[0.2em] text-text-light uppercase">
              2 Juli 2027
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-12"
          >
            <Countdown />
          </motion.div>

          {/* Save the date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.9 }}
            className="mt-14 bg-bg-card/80 backdrop-blur-sm rounded-3xl border border-gold-light/30 shadow-sm px-6 py-8 md:px-12 md:py-10 max-w-xl mx-auto"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-light italic text-text">Save the date!</h2>
            <FloralDivider className="my-5" />
            <p className="text-base md:text-lg text-text-light leading-relaxed font-light">
              Zet <span className="text-text font-normal">2 juli 2027</span> alvast in de agenda.
              De officiële uitnodiging met alle details volgt later.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/save-the-date.ics" download="bruiloft-jorrit-renee.ics"
                className={`${buttonClass} bg-rose text-white hover:bg-rose-dark`}>
                <span aria-hidden>📅</span> Zet in mijn agenda
              </a>
              <a href={GOOGLE_AGENDA} target="_blank" rel="noopener noreferrer"
                className={`${buttonClass} border border-gold-light/40 text-text-light hover:bg-cream`}>
                Google Agenda
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-cream text-center">
        <p className="font-serif text-3xl text-text font-light mb-2">J & R</p>
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">02 . 07 . 2027</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold-muted" />
          <svg width="12" height="12" viewBox="0 0 24 24" className="text-rose-light" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="h-px w-8 bg-gold-muted" />
        </div>
      </footer>
    </main>
  );
}
