"use client";

import { motion } from "framer-motion";

export default function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`flex items-center justify-center gap-4 my-8 ${className}`}
    >
      <svg width="60" height="20" viewBox="0 0 60 20" className="text-gold-muted">
        <path
          d="M0 10 Q15 0 30 10 Q45 20 60 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" className="text-rose">
        <path
          fill="currentColor"
          d="M12 2C9.5 2 7.5 3.5 7.5 5.5c0 1 .4 2 1 2.7L12 21l3.5-12.8c.6-.7 1-1.7 1-2.7C16.5 3.5 14.5 2 12 2z"
          opacity="0.6"
        />
      </svg>
      <svg width="60" height="20" viewBox="0 0 60 20" className="text-gold-muted rotate-180">
        <path
          d="M0 10 Q15 0 30 10 Q45 20 60 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
      </svg>
    </motion.div>
  );
}
