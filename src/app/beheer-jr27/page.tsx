"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    async function check(session: Session | null) {
      if (!session) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) {
        setDenied(false);
        setAuthenticated(true);
      } else {
        setDenied(true);
        setAuthenticated(false);
        await supabase.auth.signOut();
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => check(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase-calls niet direct in de callback awaiten (deadlock-risico)
      setTimeout(() => check(session), 0);
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

  return authenticated
    ? <AdminDashboard />
    : <AdminLogin key={String(denied)} error={denied ? "Dit account heeft geen toegang" : undefined} />;
}
