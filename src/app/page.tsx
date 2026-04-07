import Countdown from "@/components/Countdown";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-cream via-background to-blush/30 px-6">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="text-center max-w-3xl mx-auto">
          {/* Small intro */}
          <p className="text-sm uppercase tracking-[0.3em] text-primary-light mb-6">
            Wij gaan trouwen
          </p>

          {/* Names */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-primary-dark leading-tight">
            Jorrit
          </h1>
          <div className="my-3 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-gold" />
            <span className="font-serif text-2xl md:text-3xl italic text-gold">&amp;</span>
            <span className="h-px w-16 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-primary-dark leading-tight">
            Renee
          </h1>

          {/* Date */}
          <div className="mt-10 mb-12">
            <p className="text-lg md:text-xl tracking-[0.15em] text-primary">
              <span className="ornament">2 Juli 2027</span>
            </p>
          </div>

          {/* Countdown */}
          <Countdown />

          {/* Decorative divider */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gold-light" />
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="h-px w-12 bg-gold-light" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce text-gold-light">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-primary-dark mb-4">
            Save the Date
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <p className="text-lg text-primary leading-relaxed mb-6">
            Met grote vreugde nodigen wij jullie uit om onze speciale dag met ons te vieren.
            Meer details over de locatie en het programma volgen binnenkort.
          </p>
          <p className="text-primary-light italic">
            Uitnodiging volgt per post met een persoonlijke QR-code om te registreren.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-cream text-center">
        <p className="text-sm text-primary-light tracking-wide">
          J & R — 02.07.2027
        </p>
      </footer>
    </main>
  );
}
