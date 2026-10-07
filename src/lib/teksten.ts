// Gastteksten in "je"-vorm (uitnodiging voor 1 persoon) of "jullie"-vorm (meer personen).

export function isSolo(maxGuests: number) {
  return maxGuests <= 1;
}

export function gastTeksten(maxGuests: number) {
  const solo = isSolo(maxGuests);
  return solo
    ? {
        intro: (type: string) =>
          `Je bent van harte uitgenodigd voor ${type === "dag" ? "de hele dag" : "het avondfeest"} van onze bruiloft.`,
        vraag: "Kun je erbij zijn?",
        jaKnop: "Ja, ik kom!",
        naJa: "🎉 Wat fijn! Vul hieronder nog een paar gegevens in.",
        naNee: "Wat jammer dat je er niet bij kunt zijn. Laat gerust nog een berichtje voor ons achter.",
        bedanktJa: "Bedankt voor je aanmelding!",
        uitkijken: "We kijken ernaar uit je te zien!",
        aangemeld: "Je bent aangemeld!",
        nietAanwezig: "Jammer dat je er niet bij kunt zijn",
        alGereageerd: "Je hebt al gereageerd. Wil je iets wijzigen? Neem contact met ons op:",
      }
    : {
        intro: (type: string) =>
          `Jullie zijn van harte uitgenodigd voor ${type === "dag" ? "de hele dag" : "het avondfeest"} van onze bruiloft.`,
        vraag: "Kunnen jullie erbij zijn?",
        jaKnop: "Ja, wij komen!",
        naJa: "🎉 Wat fijn! Vul hieronder nog een paar gegevens in.",
        naNee: "Wat jammer dat jullie er niet bij kunnen zijn. Laat gerust nog een berichtje voor ons achter.",
        bedanktJa: "Bedankt voor jullie aanmelding!",
        uitkijken: "We kijken ernaar uit jullie te zien!",
        aangemeld: "Jullie zijn aangemeld!",
        nietAanwezig: "Jammer dat jullie er niet bij kunnen zijn",
        alGereageerd: "Jullie hebben al gereageerd. Wil je iets wijzigen? Neem contact met ons op:",
      };
}

// Teksten voor de uitnodiging per WhatsApp en e-mail
export function uitnodigingTeksten(maxGuests: number, type: string) {
  const solo = isSolo(maxGuests);
  const welk = type === "dag" ? "de hele dag" : "het avondfeest";
  return solo
    ? {
        onderwerp: "Je bent uitgenodigd! — Bruiloft Jorrit & Renee",
        uitnodiging: `Met grote vreugde nodigen wij je uit voor onze bruiloft op 2 juli 2027. Je bent van harte welkom voor ${welk}.`,
        verzoek: "Laat je via deze link weten of je erbij kunt zijn?",
        verzoekMail: "Wij zouden het heel fijn vinden als je wilt laten weten of je erbij kunt zijn. Dit kan eenvoudig via de onderstaande knop.",
        afsluiting: "We kijken er ontzettend naar uit om deze bijzondere dag met je te delen!",
      }
    : {
        onderwerp: "Jullie zijn uitgenodigd! — Bruiloft Jorrit & Renee",
        uitnodiging: `Met grote vreugde nodigen wij jullie uit voor onze bruiloft op 2 juli 2027. Jullie zijn van harte welkom voor ${welk}.`,
        verzoek: "Laten jullie via deze link weten of jullie erbij kunnen zijn?",
        verzoekMail: "Wij zouden het heel fijn vinden als jullie willen laten weten of jullie erbij kunnen zijn. Dit kan eenvoudig via de onderstaande knop.",
        afsluiting: "We kijken er ontzettend naar uit om deze bijzondere dag met jullie te delen!",
      };
}

// Contact voor gasten die iets willen wijzigen
export const CONTACT = {
  weergave: "06 20442904",
  tel: "+31620442904",
  whatsapp: "https://api.whatsapp.com/send?phone=31620442904",
};

// Welke boodschap de WhatsApp-knop verstuurt:
// "save-the-date" = link naar de homepage, "uitnodiging" = persoonlijke RSVP-link
export const FASE: "save-the-date" | "uitnodiging" = "save-the-date";

export function saveTheDateBericht(name: string, maxGuests: number) {
  const solo = isSolo(maxGuests);
  return (
    `Beste ${name},\n\n` +
    `Wij gaan trouwen! 💍\n\n` +
    `Save the date: *2 juli 2027*. ` +
    (solo ? "Zet je de datum alvast in je agenda? " : "Zetten jullie de datum alvast in de agenda? ") +
    `De officiële uitnodiging volgt later.\n\n` +
    `https://jorritenrenee.nl\n\n` +
    `Liefs, Jorrit & Renee`
  );
}
