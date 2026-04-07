"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    <div className="flex justify-center gap-4 md:gap-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="text-center"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-bg-card border border-gold-light/40 shadow-sm flex items-center justify-center mb-2">
            <span className="font-serif text-2xl md:text-4xl font-light text-text">
              {mounted ? String(item.value).padStart(2, "0") : "--"}
            </span>
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-text-muted font-sans">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
