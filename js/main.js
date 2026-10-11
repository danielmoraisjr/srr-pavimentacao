/* S.R.R. · interações (JS puro, sem bibliotecas) */
(() => {
  const d = document;
  const $ = (s, el = d) => el.querySelector(s);
  const $$ = (s, el = d) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WA = "5514997217335";
  const waURL = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  /* Fotos das obras: coloque os arquivos em assets/obras/ e liste aqui.
     Ex.: { src: "assets/obras/01.webp", legenda: "Recapeamento · Rua X, Bauru" } */
  const OBRAS = [];

  /* ---------- links de WhatsApp com mensagem pronta ---------- */
  $$("[data-wa]").forEach((a) => { a.href = waURL(a.dataset.wa); });

  /* ---------- barra e menu ---------- */
  const bar = $("#bar");
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  d.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- topo: entrada e leve profundidade no scroll ---------- */
  const hero = $(".hero");
  const art = $(".hero__art");
  const start = () => requestAnimationFrame(() => hero.classList.add("is-in"));
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 900);

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    bar.classList.toggle("is-scrolled", y > 8);
    if (!reduce && y < innerHeight * 1.2 && innerWidth > 999) {
      art.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
    }
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- galeria de obras ---------- */
  const gal = $("#gal");
  if (OBRAS.length) {
    gal.innerHTML = OBRAS.map((o, i) =>
      `<figure class="slide"><img src="${o.src}" alt="${o.legenda || `Obra da S.R.R. ${i + 1}`}" loading="lazy" decoding="async">${o.legenda ? `<figcaption>${o.legenda}</figcaption>` : ""}</figure>`
    ).join("");
  } else {
    gal.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<figure class="slide slide--empty"><span class="slide__n">${String(i + 1).padStart(2, "0")}</span><svg aria-hidden="true"><use href="#i-cam"/></svg><b>Foto da obra</b><span>Espaço reservado para as fotos reais das obras da S.R.R.</span></figure>`
    ).join("");
  }

  /* ---------- carrosséis ---------- */
  $$(".track").forEach((track) => {
    const id = track.id;
    const prev = $(`[data-prev="${id}"]`);
    const next = $(`[data-next="${id}"]`);
    const barEl = $(`#${id}-bar`);
    const step = () => {
      const item = track.firstElementChild;
      return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 18) : 300;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      const pos = max > 0 ? track.scrollLeft / max : 0;
      if (barEl) {
        barEl.style.width = `${(ratio * 100).toFixed(1)}%`;
        barEl.style.transform = `translateX(${(pos * (1 / ratio - 1) * 100).toFixed(1)}%)`;
      }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();

    // arrastar com o mouse (no toque o navegador já faz)
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add("is-drag"); }
      if (moved) track.scrollLeft = sl - dx;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove("is-drag");
        const s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: "smooth" });
      }
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next && next.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev && prev.click(); }
    });
  });

  /* ---------- antes e depois ---------- */
  const ba = $("#ba");
  const range = $(".ba__range", ba);
  let touched = false;
  const setP = (v) => ba.style.setProperty("--p", `${v}%`);
  range.addEventListener("input", () => { touched = true; setP(range.value); });
  range.addEventListener("pointerdown", () => ba.classList.add("is-drag"));
  addEventListener("pointerup", () => ba.classList.remove("is-drag"));

  // uma demonstração curta ao aparecer, para mostrar que dá para arrastar
  const hint = () => {
    if (reduce || touched) return;
    const keys = [[0, 50], [0.35, 26], [0.75, 72], [1, 50]];
    const dur = 1900;
    let t0;
    const tick = (now) => {
      if (touched) return;
      t0 = t0 || now;
      const t = Math.min(1, (now - t0) / dur);
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const [ta, va] = keys[i], [tb, vb] = keys[i + 1];
      const k = (t - ta) / (tb - ta);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = va + (vb - va) * e;
      setP(v.toFixed(2)); range.value = v;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- aparições ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      if (en.target === ba) setTimeout(hint, 400);
      else en.target.classList.add("is-in");
    });
  }, { threshold: 0.35 });
  io.observe(ba);
  io.observe($("#steps"));

  /* ---------- orçamento ---------- */
  const form = $("#form");
  const err = $("#form-err");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const v = (k) => String(f.get(k) || "").trim();
    const missing = ["nome", "cidade"].filter((k) => !v(k));
    ["nome", "cidade"].forEach((k) => form.elements[k].setAttribute("aria-invalid", String(missing.includes(k))));
    if (missing.length) { err.hidden = false; form.elements[missing[0]].focus(); return; }
    err.hidden = true;
    const lines = [
      "Olá, Rafael! Vim pelo site da S.R.R. e quero um orçamento.",
      "",
      `*Nome:* ${v("nome")}`,
      `*Cidade e bairro:* ${v("cidade")}`,
      `*Serviço:* ${v("servico")}`,
      `*Local:* ${v("local")}`,
    ];
    if (v("area")) lines.push(`*Tamanho aproximado:* ${v("area")}`);
    const url = waURL(lines.join("\n"));
    const w = window.open(url, "_blank");
    if (w) w.opener = null; else location.href = url;
  });

  /* ---------- WhatsApp flutuante: aviso uma vez por visita ---------- */
  const tip = $("#fab-tip");
  let seen = false;
  try { seen = sessionStorage.getItem("srr-tip") === "1"; } catch (_) {}
  const hideTip = () => { tip.hidden = true; try { sessionStorage.setItem("srr-tip", "1"); } catch (_) {} };
  if (!seen) setTimeout(() => { if (scrollY > 200 || innerWidth > 999) tip.hidden = false; }, 9000);
  $("#fab-x").addEventListener("click", hideTip);
  $(".fab__btn").addEventListener("click", hideTip);

  // no celular o topo já tem botão de WhatsApp; o flutuante entra quando ele sai da tela
  const fab = $("#fab");
  new IntersectionObserver(([en]) => fab.classList.toggle("is-away", en.isIntersecting && innerWidth < 1000))
    .observe($(".quick"));

  $("#year").textContent = new Date().getFullYear();
})();
