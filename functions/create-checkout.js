// CJS style; Node 18+ has global fetch
const qs = (o) => new URLSearchParams(o).toString();

exports.handler = async (event) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { statusCode: 500, body: "Missing STRIPE_SECRET_KEY" };

    // validate allowed prices (CSV in env)
    const idsCsv = process.env.ALLOWED_PRICE_IDS || "";
    const allowed = idsCsv.split(",").map(s => s.trim()).filter(Boolean);

    const proto  = event.headers["x-forwarded-proto"] || "https";
    const host   = event.headers.host;
    const origin = `${proto}://${host}`;

    const params = event.httpMethod === "POST"
      ? JSON.parse(event.body || "{}")
      : Object.fromEntries(new URLSearchParams(event.rawQuery || event.queryStringParameters || {}));

    const price = params.price || params.priceId;
    const mode  = params.mode === "payment" ? "payment" : "subscription"; // default to subscription
    const qty   = Number(params.quantity || 1);
    const promo = params.promo || params.promotion_code;

    if (!price) return { statusCode: 400, body: "Missing ?price=price_xxx" };
    if (allowed.length && !allowed.includes(price)) {
      return { statusCode: 400, body: "Price not allowed" };
    }

    const body = new URLSearchParams();
    body.append("mode", mode);
    body.append("line_items[0][price]", price);
    body.append("line_items[0][quantity]", String(qty));
    body.append("success_url", `${origin}/thank-you/?session_id={CHECKOUT_SESSION_ID}`);
    body.append("cancel_url",  `${origin}/pricing/?canceled=1`);
    body.append("allow_promotion_codes", "true");
    if (promo) body.append("discounts[0][promotion_code]", promo);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = (data && data.error && data.error.message) || JSON.stringify(data);
      return { statusCode: 400, body: `Stripe error: ${msg}` };
    }
    return { statusCode: 303, headers: { Location: data.url } };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};
