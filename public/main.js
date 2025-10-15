// If your static frontend is served from a different origin (eg. Live Server on :5500),
// set API_BASE to the URL of the running Node server (example: http://localhost:3003)
const API_BASE = window.API_BASE || (window.location.port === '5500' ? 'http://localhost:3003' : '');

async function safeFetch(url, opts) {
  const fullUrl = (typeof url === 'string' && url.startsWith('/api') && API_BASE) ? (API_BASE + url) : url;
  // console.log('safeFetch', fullUrl);
  const res = await fetch(fullUrl, opts);
  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    try { body = await res.json(); } catch (e) { body = null; }
  } else {
    // try text for debugging
    try { body = await res.text(); } catch (e) { body = null; }
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status; err.body = body;
    throw err;
  }
  return body;
}

const api = {
  getProducts: () => safeFetch('/api/products'),
  signup: (data) => safeFetch('/api/auth/signup', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}),
  login: (data) => safeFetch('/api/auth/login', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}),
  contact: (data) => safeFetch('/api/contact', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}),
  addProduct: (data, token) => safeFetch('/api/products', {method:'POST',headers:{'content-type':'application/json', Authorization: 'Bearer '+token},body:JSON.stringify(data)})
};

function el(q) { return document.querySelector(q); }

async function loadProducts(){
  const list = el('#product-list');
  if (!list) return; // only run on the products page
  list.innerHTML = 'Loading...';
  try{
    const products = await api.getProducts();
    list.innerHTML = products.map(p=>`<a class="product-link" href="product.html?id=${p._id}"><div class="card"><img src="${p.image||'https://picsum.photos/400?random='+p._id}" alt="${p.title}" /><h4>${p.title}</h4><p>${p.description||''}</p><p><strong>$${(p.price||0).toFixed(2)}</strong></p></div></a>`).join('');
  }catch(e){ list.innerHTML = 'Failed to load'; }
}

// Signup
if (el('#signup-form')) {
  el('#signup-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const form = e.target;
    const data = { name: form.name.value, email: form.email.value, password: form.password.value };
    const res = await api.signup(data);
    if (res.token) { localStorage.setItem('token', res.token); el('#signup-msg').innerText = 'Signed up!'; } else { el('#signup-msg').innerText = res.message || 'Error'; }
  });
}

// Login
if (el('#login-form')) {
  el('#login-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const form = e.target;
    const data = { email: form.email.value, password: form.password.value };
    const res = await api.login(data);
    if (res.token) {
      localStorage.setItem('token', res.token);
      el('#login-msg').innerText = 'Logged in!';
      checkAdmin();
      // redirect to products page after successful login
      window.location.href = 'products.html';
    } else { el('#login-msg').innerText = res.message || 'Error'; }
  });
}

// Contact
if (el('#contact-form')) {
  el('#contact-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const f = e.target;
    console.log('contact-form submit', f);
    const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; }
    const data = { name: f.name.value, email: f.email.value, message: f.message.value };
    try {
      el('#contact-msg').innerText = 'Submitting...';
      const res = await api.contact(data);
      console.log('contact response', res);
      el('#contact-msg').innerText = res.message || 'Thanks!';
      f.reset();
    } catch (err) {
      console.error('contact submit error', err);
      el('#contact-msg').innerText = 'Network error. See console.';
    } finally {
      if (submitBtn) { submitBtn.disabled = false; }
    }
  });
}

// Contact page form (separate page)
if (el('#contact-page-form')) {
  el('#contact-page-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const f = e.target;
    console.log('contact-page-form submit', f);
    const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; }
    const data = { name: f.name.value, email: f.email.value, message: f.message.value };
    try {
      el('#contact-page-msg').innerText = 'Submitting...';
      const res = await api.contact(data);
      console.log('contact-page response', res);
      el('#contact-page-msg').innerText = res.message || 'Thanks for reaching out!';
      f.reset();
    } catch (err) {
      console.error('contact-page submit error', err);
      el('#contact-page-msg').innerText = 'Network error. See console.';
    } finally {
      if (submitBtn) { submitBtn.disabled = false; }
    }
  });
}

// Complaint form on contact page
if (el('#complaint-form')) {
  el('#complaint-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const f = e.target;
    console.log('complaint-form submit', f);
    const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; }
    const orderVal = f.orderId ? f.orderId.value : (f.orderId === undefined ? (f.querySelector('[name="orderId"]') && f.querySelector('[name="orderId"]').value) : '');
    const data = { name: f.name.value, email: f.email.value, message: `${orderVal ? 'OrderID: '+orderVal + ' - ' : ''}${f.message.value}` };
    try {
      el('#complaint-msg').innerText = 'Submitting...';
      const res = await api.contact(data);
      console.log('complaint response', res);
      el('#complaint-msg').innerText = res.message || 'Complaint submitted, we will get back to you.';
      f.reset();
    } catch (err) {
      console.error('complaint submit error', err);
      el('#complaint-msg').innerText = 'Network error. See console.';
    } finally {
      if (submitBtn) { submitBtn.disabled = false; }
    }
  });
}

// Feedback form
if (el('#feedback-form')) {
  el('#feedback-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const f = e.target; const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    const data = { type: f.type.value, rating: f.rating.value ? parseInt(f.rating.value,10) : undefined, message: f.message.value, email: f.email.value };
    try {
      el('#feedback-msg').innerText = 'Submitting...';
      const res = await safeFetch('/api/feedback', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(data) });
      console.log('feedback response', res);
      el('#feedback-msg').innerText = res.message || 'Thanks for the feedback!';
      f.reset();
    } catch (err) {
      console.error('feedback submit error', err);
      el('#feedback-msg').innerText = (err.body && err.body.message) ? err.body.message : 'Network/server error';
    } finally { if (submitBtn) submitBtn.disabled = false; }
  });
}

// Admin add product
if (el('#product-form')) {
  el('#product-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return el('#admin-msg').innerText = 'Login as admin first';
    const f = e.target; const data = { title: f.title.value, price: parseFloat(f.price.value), category: f.category.value, image: f.image.value, description: f.description.value };
    const res = await api.addProduct(data, token);
    if (res._id) { el('#admin-msg').innerText = 'Product added'; f.reset(); loadProducts(); } else { el('#admin-msg').innerText = res.message || 'Error'; }
  });
}

function checkAdmin(){
  // crude check: decode token payload
  const token = localStorage.getItem('token');
  if (!token) return;
  try{
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.isAdmin) { el('#admin-panel').style.display='block'; }
  }catch(e){}
}

// initial
// manage auth nav state (login/logout)
function updateAuthNav(){
  const token = localStorage.getItem('token');
  const loginLink = el('#login-link');
  const signupLink = el('#signup-link');
  if (!loginLink) return;
  if (token) {
    // show logout
    loginLink.textContent = 'Logout';
    loginLink.href = '#';
    loginLink.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      // hide admin panel if visible
      if (el('#admin-panel')) el('#admin-panel').style.display = 'none';
      // update nav and admin checks
      updateAuthNav();
      checkAdmin();
      // reload to refresh page state
      window.location.reload();
    };
    if (signupLink) signupLink.style.display = 'none';
  } else {
    loginLink.textContent = 'Login';
    loginLink.href = 'login.html';
    loginLink.onclick = null;
    if (signupLink) signupLink.style.display = '';
  }
}

loadProducts(); updateAuthNav(); checkAdmin();

// Product detail page loader: if on product.html with ?id=..., fetch and render
if (location.pathname.endsWith('product.html')) {
  (async function(){
    const qs = new URLSearchParams(location.search);
    const id = qs.get('id');
    const container = el('#product-detail');
    if (!id || !container) return;
    container.innerHTML = 'Loading...';
    try{
      const p = await safeFetch(`/api/products/${id}`);
      container.innerHTML = `
        <div class="product-grid">
          <div class="product-image"><img src="${p.image||'https://picsum.photos/600?random='+p._id}" alt="${p.title}" /></div>
          <div class="product-info">
            <h2>${p.title}</h2>
            <p class="price"><strong>$${(p.price||0).toFixed(2)}</strong></p>
            <p class="desc">${p.description||''}</p>
            <p class="category">Category: ${p.category||'General'}</p>
          </div>
        </div>
      `;
    }catch(err){ console.error('product load err', err); container.innerHTML = 'Failed to load product.'; }
  })();
}

// fallback: ensure contact nav link works even if some overlay blocks pointer events
document.addEventListener('click', function(e){
  const target = e.target.closest && e.target.closest('a');
  if (!target) return;
  const href = target.getAttribute('href');
  if (!href) return;
  // If link points to a plain html page (contact.html, cart.html, products.html, etc.)
  // some overlays or scripts can prevent the default navigation; as a safe fallback
  // force navigation shortly after click if the pathname didn't change.
  if (/^[^#].*\.html$/.test(href) || href.endsWith('.html')) {
    setTimeout(()=>{
      // If already navigated, do nothing
      const hrefPath = href.split('?')[0].split('#')[0];
      if (location.pathname.endsWith(hrefPath) || location.pathname.endsWith('/'+hrefPath)) return;
      // Otherwise try to navigate directly
      window.location.href = href;
    }, 10);
  }
});
