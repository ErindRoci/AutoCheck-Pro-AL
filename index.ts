// Supabase Edge Function "submit": saves booking / diagnostic request, emails the admin.
// Secrets are read from server environment only; nothing secret is in the HTML.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*", // set to your domain
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const ref = (p: string) => p + "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

const REQUIRED: Record<string, string[]> = {
  Rezervim: ["emri", "tel", "email", "marka", "model", "viti", "sherbim", "data", "ora"],
  Diagnostikim: ["emri", "tel", "veh", "simp"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  const kind = String(body.kind);
  if (!REQUIRED[kind]) return json({ error: "bad kind" }, 400);
  const { kind: _k, ...data } = body;
  for (const f of REQUIRED[kind]) {
    if (!String(data[f] ?? "").trim()) return json({ error: "missing " + f }, 400);
  }
  // Basic size limit against abuse
  if (JSON.stringify(data).length > 10000) return json({ error: "too large" }, 413);

  const isBooking = kind === "Rezervim";
  const reference = ref(isBooking ? "ACP" : "DX");
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await db
    .from(isBooking ? "bookings" : "diagnostic_requests")
    .insert({ ref: reference, data, status: "E re" });
  if (error) { console.error(error); return json({ error: "save failed" }, 500); }

  // Admin email via Resend (if the email fails, the record is still saved)
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join("");
  const mail = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("MAIL_FROM"),            // e.g. "AutoCheck Pro AL <noreply@yourdomain.com>"
      to: [Deno.env.get("ADMIN_EMAIL")],           // erind.roci26@icloud.com
      subject: `${isBooking ? "Rezervim i ri" : "Kërkesë e re diagnostikimi"} ${reference}`,
      html: `<h2>${esc(kind)} ${esc(reference)}</h2><table cellpadding="6">${rows}</table>`,
    }),
  });
  if (!mail.ok) console.error("resend", await mail.text());

  return json({ reference });
});
