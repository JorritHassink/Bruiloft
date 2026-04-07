"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Onjuiste inloggegevens");
      setLoading(false);
    } else {
      onLogin();
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gold-light/40 bg-bg px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-rose-light focus:ring-1 focus:ring-rose-light/30 focus:outline-none transition-all font-sans text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream via-bg to-bg-warm px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card rounded-3xl shadow-lg shadow-rose/5 border border-gold-light/30 p-8 md:p-10 max-w-sm w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-text mb-1">Admin</h1>
          <p className="text-sm text-text-muted font-sans">Jorrit & Renee — 2 Juli 2027</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-sans font-medium text-text mb-2">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-text mb-2">Wachtwoord</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-6 rounded-xl bg-rose text-white font-sans font-medium text-sm hover:bg-rose-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Laden..." : "Inloggen"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
