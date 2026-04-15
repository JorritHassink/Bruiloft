import "@supabase/functions-js/edge-runtime.d.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const ALLOWED_ORIGIN = "https://jorritenrenee.nl";
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limit store (resets on cold start, good enough for this use case)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

function sanitizeHtml(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return escapeHtml(html);

    // Remove dangerous elements
    const dangerous = doc.querySelectorAll("script, iframe, object, embed, form, input, link, meta, style");
    dangerous.forEach((el: { remove: () => void }) => el.remove());

    // Remove event handler attributes from all elements
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el: { getAttributeNames: () => string[]; removeAttribute: (name: string) => void; getAttribute: (name: string) => string | null; setAttribute: (name: string, value: string) => void }) => {
      for (const attr of el.getAttributeNames()) {
        if (attr.startsWith("on") || attr === "srcdoc") {
          el.removeAttribute(attr);
        }
        // Remove javascript: URLs
        const val = el.getAttribute(attr);
        if (val && val.trim().toLowerCase().startsWith("javascript:")) {
          el.removeAttribute(attr);
        }
      }
    });

    return doc.body?.innerHTML || escapeHtml(html);
  } catch {
    return escapeHtml(html);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  // Check origin
  const origin = req.headers.get("origin") || "";
  const headers = origin === ALLOWED_ORIGIN || origin === "http://localhost:3000"
    ? { ...corsHeaders, "Content-Type": "application/json" }
    : { "Access-Control-Allow-Origin": "", "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Niet ingelogd" }), { status: 401, headers });
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "Te veel e-mails verstuurd. Probeer het later opnieuw." }), { status: 429, headers });
    }

    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: "to, subject en body zijn verplicht" }), { status: 400, headers });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(JSON.stringify({ error: "Ongeldig e-mailadres" }), { status: 400, headers });
    }

    // Sanitize HTML body
    const safeBody = sanitizeHtml(body);

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: Deno.env.get("GMAIL_USER")!,
          password: Deno.env.get("GMAIL_APP_PASSWORD")!,
        },
      },
    });

    await client.send({
      from: Deno.env.get("GMAIL_USER")!,
      to,
      subject,
      content: safeBody.replace(/<[^>]*>/g, ""), // plain text fallback
      html: safeBody,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "Er ging iets mis bij het versturen" }), { status: 500, headers });
  }
});
