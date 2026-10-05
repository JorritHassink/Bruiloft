import { CONTACT } from "@/lib/teksten";

// Bel- en WhatsApp-knop voor gasten die iets willen wijzigen
export default function ContactLinks() {
  const linkClass =
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold-light/40 bg-bg text-sm text-text font-sans hover:bg-cream transition-colors";
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <a href={`tel:${CONTACT.tel}`} className={linkClass}>
        <span aria-hidden>📞</span> {CONTACT.weergave}
      </a>
      <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <span aria-hidden>💬</span> WhatsApp
      </a>
    </div>
  );
}
