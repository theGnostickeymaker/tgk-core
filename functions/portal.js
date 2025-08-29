// /functions/portal.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

function getBase(headers = {}) {
  if (headers.origin) return headers.origin;
  const proto = headers["x-forwarded-proto"] || "https";
  const host  = headers["x-forwarded-host"] || headers.host || "tgk-staging.netlify.app";
  return `${proto}://${host}`;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { customerId, returnUrl } = JSON.parse(event.body || "{}");
    if (!customerId) return { statusCode: 400, body: JSON.stringify({ error: "Missing customerId" }) };

    const base = getBase(event.headers);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${base}/dashboard/`
    });

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("[portal] error", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};
