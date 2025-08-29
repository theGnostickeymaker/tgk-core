// /functions/stripe-webhook.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return { statusCode: 400, body: JSON.stringify({ error: "Webhook signature verification failed" }) };
  }

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const s = stripeEvent.data.object;
        console.log("CHECKOUT COMPLETED", { customer: s.customer, email: s.customer_details?.email, mode: s.mode });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = stripeEvent.data.object;
        console.log("SUB UPSERT", {
          customer: sub.customer,
          status: sub.status,
          price: sub.items?.data?.[0]?.price?.id
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object;
        console.log("SUB DELETE", { customer: sub.customer });
        break;
      }
      default:
        // no-op
        break;
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("[webhook] handler error", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Webhook handler error" }) };
  }
};
