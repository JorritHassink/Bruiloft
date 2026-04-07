"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted font-sans text-sm">Laden...</p>
      </div>
    );
  }

  return authenticated ? <AdminDashboard /> : <AdminLogin onLogin={() => setAuthenticated(true)} />;
}
