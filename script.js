    // CONFIGURA TU NÚMERO DE WHATSAPP AQUÍ (incluye código de país, sin +, sin espacios)
    const WHATSAPP_PHONE = "573113093561";
    const WHATSAPP_MSG = "Hola, necesito ayuda con mi compra en NeonGamer.";

    // Utilidades
    const $ = (sel, ctx=document) => ctx.querySelector(sel);
    const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
    const fmt = (n, locale="es-MX", currency="MXN") => {
      try { return new Intl.NumberFormat(locale, {style:"currency", currency}).format(n) }
      catch { return "$" + (n||0).toFixed(2) }
    };
    function buildWaLink(phone, message){
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    function svgDataUrl({w=480,h=320,text="GAMER"}={}){
      const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
  <defs>
    <linearGradient id='lg' x1='0' y1='0' x2='1' y2='1'>
      <stop stop-color='#111827'/>
      <stop offset='1' stop-color='#0b0b0b'/>
    </linearGradient>
    <radialGradient id='rg' cx='50%' cy='50%' r='60%'>
      <stop offset='0%' stop-color='rgba(168,85,247,0.45)'/>
      <stop offset='60%' stop-color='rgba(16,185,129,0.25)'/>
      <stop offset='100%' stop-color='transparent'/>
    </radialGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#lg)'/>
  <circle cx='${w/2}' cy='${h/2}' r='${Math.min(w,h)/2.2}' fill='url(#rg)'/>
  <text x='50%' y='55%' font-family='ui-sans-serif,system-ui' font-size='${Math.min(w,h)/6}' text-anchor='middle' fill='#e5e7eb' opacity='0.9' letter-spacing='2'>${text}</text>
</svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    // Datos de productos
    const HERO_IMG = "img/setup.jpg";
    const PRODUCTS = [
      { id:"kbd-neo65",    name:"Teclado Mecánico Neo65 RGB", price:129.99, tag:"Top", image: "img/Teclado Mecánico Neo65 RGB.png"},
      { id:"mse-viperx",   name:"Mouse ViperX 26K DPI",       price: 89.99, tag:"Nuevo", image: "img/Mouse ViperX 26K DPI.png"},
      { id:"hph-aurora",   name:"Auriculares Aurora 7.1",     price: 99.99, tag:"Oferta", image: "img/Auriculares Aurora 7.1.png"},
      { id:"mic-void",     name:"Micrófono VOID Pro",         price: 79.99               , image: "img/Micrófono VOID Pro.png"},
      { id:"pad-glidexl",  name:"Mousepad Glide XL",          price: 24.99               , image: "img/Mousepad Glide XL.png"},
      { id:"mon-quantum27",name:"Monitor Quantum 27'' 165Hz", price:299.99, tag:"Top"    , image: "img/Monitor Quantum 27'' 165Hz.png"},
      { id:"chr-stellar",  name:"Silla Stellar Ergo",         price:199.99               , image: "img/Silla Stellar Ergo.png"},
      { id:"ltg-neonstrip",name:"Tira LED Neon RGB",          price: 39.99, tag:"Nuevo"  , image: "img/Tira LED Neon RGB.png"},
    ]//.map(p => ({...p, image: svgDataUrl({text: p.name.split(' ')[0].toUpperCase()})}));

    // Estado del carrito
    const STORAGE_KEY = "neon-gamer-cart-v1";
    /** @type {{id:string,name:string,price:number,image:string,quantity:number}[]} */
    let cart = [];
    function loadCart(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        cart = raw ? JSON.parse(raw) : [];
      }catch{ cart = [] }
    }
    function saveCart(){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) }catch{}
    }
    function cartCount(){ return cart.reduce((a,i)=>a+i.quantity,0) }
    function cartTotal(){ return cart.reduce((a,i)=>a+i.quantity*i.price,0) }
    function addToCart(item, qty=1){
      const idx = cart.findIndex(i=>i.id===item.id);
      if(idx>=0) cart[idx].quantity += qty;
      else cart.push({...item, quantity: qty});
      saveCart(); renderCart(); openDrawer();
    }
    function removeFromCart(id){
      cart = cart.filter(i=>i.id!==id); saveCart(); renderCart();
    }
    function increment(id){
      const it = cart.find(i=>i.id===id); if(it){ it.quantity++; saveCart(); renderCart(); }
    }
    function decrement(id){
      const it = cart.find(i=>i.id===id); if(it){ it.quantity = Math.max(1, it.quantity-1); saveCart(); renderCart(); }
    }
    function clearCart(){
      cart = []; saveCart(); renderCart();
    }

    // Render productos
    function renderProducts(){
      const grid = $("#products");
      grid.innerHTML = "";
      const frag = document.createDocumentFragment();
      PRODUCTS.forEach(p=>{
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="card-media">
            <div class="media-wrap">
              ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
              <img alt="Imagen de ${p.name}">
            </div>
          </div>
          <div class="card-body">
            <h3 class="title" title="${p.name}">${p.name}</h3>
            <p class="price">${fmt(p.price)}</p>
          </div>
          <div class="card-footer">
            <button class="btn-primary" aria-label="Añadir ${p.name} al carrito">Añadir al carrito</button>
          </div>
        `;
        card.querySelector("img").src = p.image;
        card.querySelector(".btn-primary").addEventListener("click", ()=> addToCart({
          id: p.id, name: p.name, price: p.price, image: p.image
        }, 1));
        frag.appendChild(card);
      });
      grid.appendChild(frag);
    }

    // Drawer (carrito)
    const drawer = $("#drawer");
    const overlay = $("#overlay");
    function openDrawer(){
      drawer.classList.add("open");
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden","false");
    }
    function closeDrawer(){
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden","true");
    }

    // Render carrito
    function renderCart(){
      const list = $("#cart-list");
      const countEl = $("#cart-count");
      const subEl = $("#subtotal");
      const grandEl = $("#grand");
      const clearBtn = $("#clear-cart");
      const info = $("#drawer-sub");

      countEl.textContent = String(cartCount());
      list.innerHTML = "";
      if(cart.length === 0){
        info.textContent = "Aún no has añadido productos.";
        clearBtn.style.display = "none";
      }else{
        info.textContent = "Revisa tus productos antes de pagar.";
        clearBtn.style.display = "inline-block";
      }

      cart.forEach(item=>{
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <img class="cart-thumb" alt="Imagen de ${item.name}">
          <div style="min-width:0;flex:1">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <div style="min-width:0">
                <p class="cart-name" title="${item.name}">${item.name}</p>
                <p class="cart-price">${fmt(item.price)}</p>
              </div>
              <button class="icon-btn" title="Quitar ${item.name}" aria-label="Quitar ${item.name}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="qty">
              <button aria-label="Disminuir cantidad de ${item.name}">−</button>
              <span aria-live="polite">${item.quantity}</span>
              <button aria-label="Aumentar cantidad de ${item.name}">+</button>
            </div>
          </div>
        `;
        row.querySelector("img").src = item.image;
        const [minus, plus] = row.querySelectorAll(".qty button");
        minus.addEventListener("click", ()=> decrement(item.id));
        plus.addEventListener("click", ()=> increment(item.id));
        row.querySelector(".icon-btn").addEventListener("click", ()=> removeFromCart(item.id));
        list.appendChild(row);
      });

      const total = cartTotal();
      subEl.textContent = fmt(total);
      grandEl.textContent = fmt(total);
    }

    // Búsqueda
    function setupSearch(){
      const input = $("#search");
      if(!input) return;
      input.addEventListener("input", ()=>{
        const q = input.value.trim().toLowerCase();
        const cards = $$("#products .card");
        cards.forEach(card=>{
          const name = card.querySelector(".title")?.textContent?.toLowerCase() || "";
          card.style.display = name.includes(q) ? "" : "none";
        });
      });
    }

    // WhatsApp
    function setupWhatsApp(){
      const link = $("#wa-link");
      const fab = $("#wa-fab");
      const num = $("#wa-number");
      const waUrl = buildWaLink(WHATSAPP_PHONE, WHATSAPP_MSG);
      link.href = waUrl;
      num.textContent = WHATSAPP_PHONE;
      fab.addEventListener("click", ()=> window.open(waUrl, "_blank","noopener"));
      // Hero img
      const heroImg = $("#hero-img"); if(heroImg) heroImg.src = HERO_IMG;
    }

// ------- Checkout -------
    const coOverlay = $("#checkout-overlay");
    const coModal = $("#checkout-modal");
    const coPanel = $("#checkout-panel");
    const coBody = $("#co-body");
    const coForm = $("#checkout-form");
    const coCancel = $("#co-cancel");
    const coClose = $("#co-close");
    const coSubmit = $("#co-submit");
    const sumItems = $("#summary-items");
    const sumSubtotal = $("#sum-subtotal");
    const sumShipping = $("#sum-shipping");
    const sumTotal = $("#sum-total");
    const cardFields = $("#card-fields");

    // Persist buyer info (optional)
    const BUYER_KEY = "neon-gamer-buyer-v1";
    function loadBuyer(){
      try{
        const data = JSON.parse(localStorage.getItem(BUYER_KEY)||"{}");
        for(const [k,v] of Object.entries(data)){ const el = coForm.elements[k]; if(el) el.value = v; }
      }catch{}
    }
    function saveBuyer(){
      const fields = ["firstName","lastName","email","phone","address1","address2","postalCode","city","state","country","notes"];
      const data = {}; fields.forEach(k=>{ const el = coForm.elements[k]; if(el) data[k] = el.value || ""; });
      try{ localStorage.setItem(BUYER_KEY, JSON.stringify(data)) }catch{}
    }

    function getSelectedShippingCost(){
      const sel = coForm.querySelector('input[name="shipping"]:checked');
      return sel ? Number(sel.dataset.cost||0) : 0;
    }

    function updateSummary(){
      // Items
      sumItems.innerHTML = "";
      cart.forEach(i=>{
        const row = document.createElement("div"); row.className="summary-item";
        row.innerHTML = `<img class="summary-thumb" alt="" /><div style="min-width:0;flex:1"><p class="summary-name">${i.quantity}× ${i.name}</p><div class="summary-price">${fmt(i.price)}</div></div><div>${fmt(i.price*i.quantity)}</div>`;
        row.querySelector("img").src = i.image;
        sumItems.appendChild(row);
      });
      if(cart.length===0){ sumItems.innerHTML = `<p class="hint">No hay productos en el carrito.</p>`; }
      // Totals
      const subtotal = cartTotal();
      const shipping = cart.length>0 ? getSelectedShippingCost() : 0;
      sumSubtotal.textContent = fmt(subtotal);
      sumShipping.textContent = fmt(shipping);
      sumTotal.textContent = fmt(subtotal + shipping);
    }

    function openCheckout(){
      if(cart.length===0){ alert("Tu carrito está vacío. Añade productos antes de finalizar."); return; }
      coModal.classList.add("open"); coOverlay.classList.add("open"); coOverlay.setAttribute("aria-hidden","false");
      updateSummary(); loadBuyer(); handlePaymentVisibility(); coForm.classList.remove("processing");
    }
    function closeCheckout(){
      coModal.classList.remove("open"); coOverlay.classList.remove("open"); coOverlay.setAttribute("aria-hidden","true");
      // restore panel if success view was shown
      if($("#success-view")){ // rebuild panel content back to form+summary
        coPanel.innerHTML = "";
        coPanel.appendChild(createCheckoutHeader());
        coPanel.appendChild(coBody);
      }
    }
    function createCheckoutHeader(){
      const header = document.createElement("div"); header.className="co-header";
      header.innerHTML = `<h4 class="co-title">Finalizar compra</h4>`;
      const btn = document.createElement("button"); btn.className="co-close"; btn.id="co-close"; btn.setAttribute("aria-label","Cerrar");
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      btn.addEventListener("click", closeCheckout);
      header.appendChild(btn);
      return header;
    }

    function handlePaymentVisibility(){
      const method = coForm.querySelector('input[name="payment"]:checked')?.value;
      if(method === "card"){
        cardFields.classList.remove("hidden");
      }else{
        cardFields.classList.add("hidden");
      }
    }

    // Basic validation helpers
    function setInvalid(id, invalid){
      const wrap = $("#"+id);
      if(!wrap) return;
      if(invalid) wrap.classList.add("invalid");
      else wrap.classList.remove("invalid");
    }
    function numericOnly(val){ return val.replace(/[^\d]/g,""); }

    function validateForm(){
      let ok = true;
      const get = name => coForm.elements[name];
      const required = ["firstName","lastName","email","phone","address1","postalCode","city","state","country"];
      required.forEach(name=>{
        const el = get(name);
        const valid = el && el.value && (el.type!=="email" || /\S+@\S+\.\S+/.test(el.value));
        setInvalid("f-"+name, !valid); if(!valid) ok=false;
      });
      // phone
      const phone = get("phone").value.trim();
      const phoneValid = /^[0-9()\-\s+]{7,}$/.test(phone);
      setInvalid("f-phone", !phoneValid); if(!phoneValid) ok=false;
      // postal
      const cp = get("postalCode").value.trim();
      const cpValid = /^[0-9]{4,10}$/.test(cp);
      setInvalid("f-postalCode", !cpValid); if(!cpValid) ok=false;

      // Card if needed
      const payMethod = coForm.querySelector('input[name="payment"]:checked')?.value;
      if(payMethod==="card"){
        const cardName = get("cardName").value.trim().length>2;
        const cardNumber = numericOnly(get("cardNumber").value);
        const cardNumberValid = cardNumber.length>=13 && cardNumber.length<=19;
        const exp = get("expiry").value.trim();
        const expValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
        const cvc = get("cvc").value.trim();
        const cvcValid = /^\d{3,4}$/.test(cvc);
        setInvalid("f-cardName", !cardName); if(!cardName) ok=false;
        setInvalid("f-cardNumber", !cardNumberValid); if(!cardNumberValid) ok=false;
        setInvalid("f-expiry", !expValid); if(!expValid) ok=false;
        setInvalid("f-cvc", !cvcValid); if(!cvcValid) ok=false;
      }else{
        ["cardName","cardNumber","expiry","cvc"].forEach(name=> setInvalid("f-"+name, false));
      }
      return ok;
    }

    function showSuccess(orderId, buyer){
      const view = document.createElement("div"); view.id="success-view"; view.className="success";
      view.innerHTML = `
        <div class="success-card">
          <div aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:999px;background:rgba(16,185,129,.15);border:1px solid var(--border)">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="success-title">¡Gracias por tu compra!</h3>
          <p class="success-sub">Pedido <strong>${orderId}</strong> a nombre de <strong>${buyer.firstName} ${buyer.lastName}</strong>. Enviaremos confirmación a <strong>${buyer.email}</strong>.</p>
          <div class="divider" style="margin:12px 0"></div>
          <div style="text-align:left;font-size:14px;color:var(--muted)">
            <p><strong>Envío a:</strong> ${buyer.address1}${buyer.address2?(", "+buyer.address2):""}, ${buyer.city}, ${buyer.state}, ${buyer.postalCode}, ${buyer.country}</p>
          </div>
          <div class="success-actions">
            <button class="btn-secondary" id="success-close">Cerrar</button>
            <button class="btn-primary-lg" id="success-continue">Seguir comprando</button>
          </div>
        </div>`;
      coPanel.innerHTML = ""; // Replace panel with success view
      coPanel.appendChild(view);
      $("#success-close").addEventListener("click", closeCheckout);
      $("#success-continue").addEventListener("click", closeCheckout);
    }

    // Events
    function setupCheckout(){
      // Shipping and payment handlers
      $$('#shipping-method input[name="shipping"]').forEach(r=> r.addEventListener("change", updateSummary));
      $$('#payment-method input[name="payment"]').forEach(r=> r.addEventListener("change", ()=>{ handlePaymentVisibility(); }));

      // Cancel/close
      coCancel.addEventListener("click", closeCheckout);
      coClose.addEventListener("click", closeCheckout);
      coOverlay.addEventListener("click", closeCheckout);
      document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeCheckout(); });

      // Submit
      coForm.addEventListener("submit", async (e)=>{
        e.preventDefault();
        if(cart.length===0){ alert("Tu carrito está vacío."); return; }
        if(!validateForm()){ return; }
        coForm.classList.add("processing");
        saveBuyer();
        // Simulación de procesamiento
        await new Promise(r=>setTimeout(r, 1200));
        const buyer = Object.fromEntries(new FormData(coForm).entries());
        const orderId = "NG-" + (Date.now().toString().slice(-6));
        clearCart();
        renderCart();
        showSuccess(orderId, buyer);
      });
    }

    // Eventos UI
    function setupUI(){
      $("#open-cart")?.addEventListener("click", openDrawer);
      overlay.addEventListener("click", closeDrawer);
      document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeDrawer() });
      $("#clear-cart")?.addEventListener("click", clearCart);
      $("#checkout")?.addEventListener("click", ()=>{
        if(cart.length===0){ alert("Tu carrito está vacío."); return; }
        openCheckout();
      });
    }

    // Init
    loadCart();
    renderProducts();
    renderCart();
    setupSearch();
    setupWhatsApp();
    setupUI();
    setupCheckout();