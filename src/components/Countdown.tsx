"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2027-07-02T14:00:00");

function getTimeLeft() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items = [
    { label: "Dagen", value: timeLeft.days },
    { label: "Uren", value: timeLeft.hours },
    { label: "Minuten", value: timeLeft.minutes },
    { label: "Seconden", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-6 md:gap-10 justify-center">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="font-serif text-4xl md:text-6xl text-primary-dark font-light">
            {mounted ? String(item.value).padStart(2, "0") : "--"}
          </div>
          <div className="text-xs md:text-sm uppercase tracking-[0.2em] text-primary mt-2">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
