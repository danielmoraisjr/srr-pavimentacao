/* S.R.R. · interações
   1) topo: a capa nova avança sobre o asfalto gasto (entrada automática até ~40%, depois o scroll)
   2) processo: o corte do pavimento é montado conforme os passos passam
   3) orçamento: formulário que monta a mensagem e abre o WhatsApp */
(() => {
  const d = document;
  const root = d.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("no-motion");

  const WA = "5514997217335";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const $ = (s, el = d) => el.querySelector(s);

  const bar = $("#bar");
  const dock = $("#dock");
  const hero = $(".hero");
  const road = $(".road");
  const orc = $("#orcamento");

  /* ---------- 1 · topo ---------- */
  const INTRO = 0.42;
  let intro = reduce ? 1 : 0;

  function heroScroll() {
    const track = hero.offsetHeight - innerHeight;
    return track > 0 ? clamp(-hero.getBoundingClientRect().top / track) : 0;
  }

  function renderHero() {
    const s = heroScroll();
    const p = reduce ? 0.5 : clamp(INTRO * easeOut(intro) + (1 - INTRO) * clamp(s / 0.85));
    const w = road.clientWidth;
    const x = p * w;
    road.style.setProperty("--x", x.toFixed(1) + "px");
    road.classList.toggle("is-start", p < 0.06);
    road.classList.toggle("is-done", p > 0.95);
    hero.classList.toggle("is-far", s > 0.08);
  }

  function playIntro() {
    if (reduce) return;
    const dur = 1900, delay = 350;
    let t0 = 0;
    const tick = (now) => {
      if (!t0) t0 = now;
      intro = clamp((now - t0 - delay) / dur);
      renderHero();
      if (intro < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 2 · processo ---------- */
  const track = $("#track");
  const steps = [...d.querySelectorAll(".step")];
  const dots = [...d.querySelectorAll(".cut__dots li")];
  const svg = $(".cut__svg");
  const cut = {
    measure: $(".st-measure", svg),
    debris: $(".st-debris", svg),
    fill: $(".st-fill", svg),
    tack: $("#tack-clip", svg),
    tagTack: $(".st-tag-tack", svg),
    matClip: $("#mat-clip", svg),
    mat: $("#mat-path", svg),
    tagNew: $(".st-tag-new", svg),
    steam: $("#steam", svg),
    roller: $("#roller", svg),
    drum: $("#drum", svg),
    lane: [...d.querySelectorAll(".st-lane rect")],
  };
  const L = 0, W = 1000, TOP = 214, PRESSED = 222, R = 58;

  function processP() {
    const r = track.getBoundingClientRect();
    const barH = bar.offsetHeight;
    const total = track.offsetHeight - (innerHeight - barH);
    return total > 0 ? clamp((barH - r.top) / total) * steps.length : 0;
  }

  // no celular o corte é enquadrado mais perto
  let narrow = null;
  function frameCut() {
    const n = innerWidth < 900;
    if (n === narrow) return;
    narrow = n;
    svg.setAttribute("viewBox", n ? "130 80 740 420" : "0 80 1000 420");
    svg.setAttribute("preserveAspectRatio", n ? "xMidYMid meet" : "xMidYMax slice");
  }

  let lastStep = -1;
  function renderProcess() {
    const P = processP();
    const u = (i) => clamp(P - i);                       // progresso cru do passo i
    const t = (i) => reduce ? (u(i) > 0.15 ? 1 : 0) : smooth(0.12, 0.72, u(i));

    const op = (el, v) => { el.style.opacity = v.toFixed(3); };

    // 01 medição
    op(cut.measure, reduce ? (P >= 0.15 && P < 1.15 ? 1 : 0) : smooth(0.05, 0.4, u(0)) * (1 - smooth(0, 0.3, u(1))));
    // 02 limpeza e reparo
    const t1 = t(1);
    op(cut.debris, 1 - smooth(0, 0.6, t1));
    cut.debris.style.transform = `translateX(${(t1 * 36).toFixed(1)}px)`;
    op(cut.fill, smooth(0.4, 1, t1));
    // 03 pintura de ligação
    const t2 = t(2);
    cut.tack.setAttribute("width", (W * t2).toFixed(1));
    op(cut.tagTack, t2 * (1 - smooth(0, 0.3, t(3))));
    // 04 capa nova
    const t3 = t(3);
    cut.matClip.setAttribute("width", (W * t3 + 1).toFixed(1));
    op(cut.tagNew, smooth(0.2, 0.8, t3));
    // 05 compactação
    const t4 = t(4);
    const rx = L + W * t4;
    cut.mat.setAttribute("d", t4 <= 0
      ? `M${L} 274V${TOP}H${L + W}V274Z`
      : rx >= L + W - 24
        ? `M${L} 274V${PRESSED}H${L + W}V274Z`
        : `M${L} 274V${PRESSED}H${rx.toFixed(1)}L${(rx + 24).toFixed(1)} ${TOP}H${L + W}V274Z`);
    const rollerOp = reduce ? 0 : smooth(0, 0.05, t4) * (1 - smooth(0.93, 1, t4));
    op(cut.roller, rollerOp);
    cut.roller.setAttribute("transform", `translate(${rx.toFixed(1)} ${PRESSED - R})`);
    cut.drum.setAttribute("transform", `rotate(${((rx / R) * 57.3).toFixed(1)})`);
    cut.lane.forEach((r) => {
      const f = (+r.getAttribute("x") + 60 - L) / W;
      op(r, smooth(f + 0.04, f + 0.1, t4));
    });
    // vapor: acompanha a massa quente, e depois o rolo
    const steamX = t4 > 0 ? rx : L + W * t3;
    const steamOp = reduce ? 0 : (t3 > 0 && t3 < 1 ? 1 : 0) * smooth(0, 0.05, t3) * (1 - smooth(0.95, 1, t3)) + rollerOp * 0.5;
    op(cut.steam, steamOp);
    cut.steam.setAttribute("transform", `translate(${steamX.toFixed(1)} ${t4 > 0 ? -60 : 0})`);

    const active = Math.min(steps.length - 1, Math.floor(P));
    if (active !== lastStep) {
      lastStep = active;
      steps.forEach((s, i) => s.classList.toggle("is-on", i === active));
      dots.forEach((s, i) => s.classList.toggle("is-on", i <= active));
    }
  }

  /* ---------- barra e dock ---------- */
  function renderChrome() {
    const hr = hero.getBoundingClientRect();
    bar.classList.toggle("is-solid", hr.bottom <= bar.offsetHeight + 1);
    const or = orc.getBoundingClientRect();
    const orcVisible = or.top < innerHeight && or.bottom > 0;
    dock.classList.toggle("is-on", hr.bottom < innerHeight * 0.5 && !orcVisible);
  }

  let queued = false;
  function frame() {
    queued = false;
    renderHero();
    frameCut();
    renderProcess();
    renderChrome();
  }
  function request() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  frame();
  playIntro();

  /* ---------- 3 · orçamento ---------- */
  const form = $("#form");
  const err = $("#form-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const v = (k) => String(f.get(k) || "").trim();
    const missing = ["nome", "cidade"].filter((k) => !v(k));
    ["nome", "cidade"].forEach((k) => form.elements[k].setAttribute("aria-invalid", String(missing.includes(k))));
    if (missing.length) {
      err.hidden = false;
      form.elements[missing[0]].focus();
      return;
    }
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
    if (v("msg")) lines.push(`*Obs.:* ${v("msg")}`);
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;
    const w = window.open(url, "_blank");
    if (w) w.opener = null; else location.href = url;
  });

  $("#year").textContent = new Date().getFullYear();
})();
