exports.handler = async () => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { statusCode: 500, body: "Missing STRIPE_SECRET_KEY" };

    const idsCsv = process.env.ALLOWED_PRICE_IDS || "";
    const ids = idsCsv.split(",").map(s => s.trim()).filter(Boolean);

    const url = "https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product";
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${key}` } });
    const data = await res.json();
    if (!res.ok) return { statusCode: 400, body: JSON.stringify(data) };

    const filtered = ids.length ? data.data.filter(p => ids.includes(p.id)) : data.data;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(filtered) };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
