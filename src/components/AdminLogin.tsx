"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      setError("Onjuist wachtwoord");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream via-background to-blush/30 px-6">
      <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-gold-light/50 p-8 md:p-10 max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-primary-dark mb-2">Admin</h1>
          <p className="text-sm text-primary-light">Jorrit & Renee — 2 Juli 2027</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border-2 border-gold-light/50 px-4 py-3 text-primary-dark bg-white focus:border-gold focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Laden..." : "Inloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
