"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import FloralDivider from "@/components/FloralDivider";
import Countdown from "@/components/Countdown";

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <FadeIn className="text-center mb-12">
      {subtitle && (
        <p className="text-xs uppercase tracking-[0.35em] text-rose mb-3 font-sans font-medium">
          {subtitle}
        </p>
      )}
      <h2 className="font-serif text-4xl md:text-5xl font-light text-text leading-tight">
        {children}
      </h2>
      <FloralDivider className="mt-6 mb-0" />
    </FadeIn>
  );
}


export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cream via-bg to-bg-warm px-6">
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
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-gold-muted">
              <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Save the Date ── */}
      <section className="py-24 md:py-32 px-6 bg-bg-warm">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="Save the date">
            Vier dit met ons
          </SectionTitle>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-text-light leading-relaxed font-light">
              Met grote vreugde nodigen wij jullie uit voor de mooiste dag van ons leven.
              Op <span className="text-text font-normal">2 juli 2027</span> geven wij elkaar het jawoord,
              en niets zou ons gelukkiger maken dan dit moment met jullie te delen.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Programma ── */}
      <section className="py-24 md:py-32 px-6 bg-bg">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="Het programma">
            De mooiste dag
          </SectionTitle>
          <FadeIn delay={0.2}>
            <div className="bg-bg-card rounded-3xl border border-gold-light/30 p-8 md:p-12 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blush-light/40 flex items-center justify-center text-3xl">
                🥂
              </div>
              <p className="text-lg md:text-xl text-text-light leading-relaxed font-light mb-6">
                Een dag vol liefde, lachen en mooie momenten — van een
                ontroerende ceremonie tot een onvergetelijk feest.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { icon: "💍", label: "Ceremonie" },
                  { icon: "🍽️", label: "Diner" },
                  { icon: "🎶", label: "Feest" },
                ].map((item, i) => (
                  <FadeIn key={item.label} delay={0.3 + i * 0.1}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="text-xs uppercase tracking-[0.15em] text-text-muted font-sans">{item.label}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-linen">
                <p className="text-sm text-text-muted italic">
                  Het volledige programma met tijden ontvangen jullie met de uitnodiging
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Locatie ── */}
      <section className="py-24 md:py-32 px-6 bg-bg-warm">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="Locatie">
            Waar & Wanneer
          </SectionTitle>
          <FadeIn delay={0.2}>
            <div className="bg-bg-card rounded-3xl border border-gold-light/30 p-8 md:p-12 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blush-light/50 flex items-center justify-center text-2xl">
                📍
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-text mb-2">
                Locatie volgt binnenkort
              </h3>
              <p className="text-text-light leading-relaxed">
                De exacte locatie maken we binnenkort bekend.
                Houd je uitnodiging in de gaten!
              </p>
              <div className="mt-8 pt-8 border-t border-linen text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted font-sans mb-1">Datum</p>
                <p className="font-serif text-lg text-text">2 Juli 2027</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Dresscode ── */}
      <section className="py-24 md:py-32 px-6 bg-bg">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="Dresscode">
            Summer Chique
          </SectionTitle>
          <FadeIn delay={0.2}>
            <p className="text-lg text-text-light leading-relaxed mb-10">
              Wij houden van een feestelijke maar ontspannen sfeer.
              Denk aan elegante zomeroutfits in zachte, warme tinten.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <FadeIn delay={0.3}>
              <div className="bg-bg-card rounded-2xl border border-gold-light/30 p-6 shadow-sm">
                <div className="text-3xl mb-3">👗</div>
                <h3 className="font-serif text-lg text-text mb-2">Dames</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Zomerjurk, jumpsuit of chique ensemble in pastelkleuren
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="bg-bg-card rounded-2xl border border-gold-light/30 p-6 shadow-sm">
                <div className="text-3xl mb-3">🤵</div>
                <h3 className="font-serif text-lg text-text mb-2">Heren</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Licht pak of nette broek met overhemd, linnen mag!
                </p>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.5}>
            <div className="mt-8 flex justify-center gap-3">
              {["#f0ddd2", "#e8cfc0", "#d4dece", "#e5d5b0", "#f5efe6"].map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-3 tracking-wide">Suggesties voor kleurpalet</p>
          </FadeIn>
        </div>
      </section>

      {/* ── Cadeau ── */}
      <section className="py-24 md:py-32 px-6 bg-bg-warm">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="Cadeautip">
            Jullie aanwezigheid
          </SectionTitle>
          <FadeIn delay={0.2}>
            <div className="bg-bg-card rounded-3xl border border-gold-light/30 p-8 md:p-12 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blush-light/50 flex items-center justify-center text-2xl">
                🎁
              </div>
              <p className="text-lg text-text-light leading-relaxed">
                Het allerbelangrijkste cadeau is jullie aanwezigheid op onze dag.
                Willen jullie toch iets geven? Dan dragen wij graag bij aan onze
                <span className="text-text font-normal"> huwelijksreis</span>.
              </p>
              <div className="mt-8 p-4 bg-cream rounded-xl">
                <p className="text-sm text-text-muted italic">
                  Meer details volgen in de uitnodiging
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── RSVP Teaser ── */}
      <section className="py-24 md:py-32 px-6 bg-bg">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle subtitle="RSVP">
            Laat het ons weten
          </SectionTitle>
          <FadeIn delay={0.2}>
            <p className="text-lg text-text-light leading-relaxed mb-8">
              Binnenkort ontvangen jullie een uitnodiging per post met een
              persoonlijke QR-code. Scan de code om je aan te melden voor de
              bruiloft.
            </p>
            <div className="inline-flex items-center gap-3 bg-bg-card border border-gold-light/30 rounded-2xl px-6 py-4 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-rose" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="3" height="3" rx="0.5" />
                <rect x="18" y="14" width="3" height="3" rx="0.5" />
                <rect x="14" y="18" width="3" height="3" rx="0.5" />
                <rect x="18" y="18" width="3" height="3" rx="0.5" />
              </svg>
              <span className="text-sm text-text-light">Scan je persoonlijke QR-code uit de uitnodiging</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 bg-cream text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="font-serif text-3xl text-text font-light mb-2">J & R</p>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">02 . 07 . 2027</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-muted" />
            <svg width="12" height="12" viewBox="0 0 24 24" className="text-rose-light" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="h-px w-8 bg-gold-muted" />
          </div>
        </motion.div>
      </footer>
    </main>
  );
}
