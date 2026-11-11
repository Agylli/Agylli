import "server-only";
import { notificationSupabase } from "@/integrations/supabase/server";
import { emailAddress } from "@/lib/urls";
import { portalOrigin } from "@/lib/reseller/origin";
import { requestEmail } from "./request-message";
import type { RequestItem } from "@/lib/reseller/types";

export async function notifyStore(
  requestId: string,
): Promise<"sent" | "pending" | "failed"> {
  const db = notificationSupabase(),
    origin = portalOrigin();
  const apiKey = process.env.RESEND_API_KEY,
    from = emailAddress(process.env.RESELLER_EMAIL_FROM);
  const to = emailAddress(
    process.env.RESELLER_NOTIFICATION_EMAIL || "adm.agylli@gmail.com",
  );
  if (!db || !apiKey || !from || !to || !origin) return "pending";
  const claim = await db.rpc("portal_claim_email", { p_id: requestId });
  if (claim.error || claim.data !== true) return "pending";
  try {
    const order = await db
      .from("reseller_requests")
      .select(
        "id,user_id,unit_id,notes,reseller_request_items(name,sku,quantity)",
      )
      .eq("id", requestId)
      .single();
    if (order.error || !order.data) throw new Error("request_not_found");
    const profile = await db
      .from("reseller_profiles")
      .select("name,email,phone")
      .eq("id", order.data.user_id)
      .single();
    if (profile.error || !profile.data) throw new Error("profile_not_found");
    const body = requestEmail({
      id: requestId,
      ...profile.data,
      unit: order.data.unit_id,
      items: (order.data.reseller_request_items as RequestItem[]).map(
        (item) => ({ ...item, sku: item.sku ?? "" }),
      ),
      notes: order.data.notes,
      origin,
    });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `agylli-request-${requestId}`,
      },
      body: JSON.stringify({ from: `Agylli <${from}>`, to: [to], ...body }),
    });
    if (!response.ok) throw new Error(`provider_http_${response.status}`);
    const result = (await response.json()) as { id?: string };
    if (typeof result.id !== "string")
      throw new Error("provider_missing_receipt");
    const saved = await db
      .from("reseller_email_notifications")
      .update({
        status: "sent",
        provider_id: result.id,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("request_id", requestId)
      .eq("status", "sending");
    return saved.error ? "pending" : "sent";
  } catch (error) {
    // Store only a short operational code; provider responses can include personal data.
    const code =
      error instanceof Error && /^provider_http_\d{3}$/.test(error.message)
        ? error.message
        : "delivery_failed";
    await db
      .from("reseller_email_notifications")
      .update({
        status: "failed",
        last_error: code,
        updated_at: new Date().toISOString(),
      })
      .eq("request_id", requestId)
      .eq("status", "sending");
    return "failed";
  }
}
