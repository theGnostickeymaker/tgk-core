(async () => {
  const btns = [...document.querySelectorAll('.subscribe[data-price]')];
  if (!btns.length) return;

  const pub = await fetch('/.netlify/functions/public-prices')
    .then(r => r.json())
    .catch(() => ({}));

  const get = (k) => pub?.[k] || '';

  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const envKey = btn.getAttribute('data-price');
      const price = get(envKey);
      if (!price) { btn.disabled = false; return alert('Price not configured.'); }

      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ price })
      });
      const { url, error } = await res.json();
      btn.disabled = false;
      if (error || !url) return alert(error || 'Checkout error.');
      location.href = url;
    });
  });
})();
