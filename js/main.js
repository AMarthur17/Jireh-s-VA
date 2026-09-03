/* ═══════════════════════════════════════════════════════════════
   main.js — Orquestación

   Cada librería tiene un trabajo, no se solapan:
     · GSAP + ScrollTrigger → secuencia de carga y revelados al scroll
     · anime.js             → los iconos se DIBUJAN, como un boceto
     · motion.dev           → muelles reales: cursor, botones, fichas
     · scene.js / Three.js  → la joya y su grabado en vivo

   Todo degrada: si una CDN no responde, la página sigue usable.
   ═══════════════════════════════════════════════════════════════ */

const q = (sel, root = document) => [...root.querySelectorAll(sel)];
const gsap = window.gsap;
const anime = window.anime;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fino = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Las librerías se sirven desde el propio dominio (js/vendor), pero
   siguen siendo opcionales: si alguna no cargara, la página funciona
   igual, solo sin esa capa. */
const animate = window.Motion ? window.Motion.animate : null;

const jv = () => window.jvScene;
if (!jv()) document.body.classList.add("no-3d");

document.getElementById("year").textContent = new Date().getFullYear();

if (gsap) gsap.registerPlugin(window.ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   1 · ESTADO INICIAL
   Se fija desde JS para que, sin JS, todo se vea de una vez.
   ───────────────────────────────────────────────────────────── */
const lineas = q(".line > span");
const revelables = q(".reveal");
const trazos = q(".step__ico .d, .form__done .d");

/* Nota: el estado oculto vive en el CSS (evita el parpadeo sin JS) y
   cada animacion usa fromTo para fijar su propio punto de partida:
   asi GSAP nunca depende de como interprete el porcentaje del CSS. */
const ocultoLinea = { yPercent: 140, y: 0 };   // y:0 anula el translateY del CSS, que GSAP lee como px
const ocultoItem = { opacity: 0, y: 24 };
if (!gsap || reduced) document.documentElement.classList.remove("js");

if (anime && !reduced) {
  anime.set(trazos, {
    strokeDasharray: (el) => el.getTotalLength(),
    strokeDashoffset: (el) => el.getTotalLength()
  });
}

/* ─────────────────────────────────────────────────────────────
   2 · CARGA: el logo se dibuja, luego entra el hero
   ───────────────────────────────────────────────────────────── */
const loader = document.getElementById("loader");

function entradaHero() {
  return gsap.timeline()
    .add(() => jv()?.reveal())
    .fromTo(q(".hero__title .line > span"), ocultoLinea,
      { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.085 })
    .fromTo(q(".hero .reveal"), ocultoItem,
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09 }, "-=0.75");
}

function arrancar() {
  if (document.documentElement.classList.contains("is-ready")) return;
  document.documentElement.classList.add("is-ready");

  if (!gsap || reduced) {
    loader?.remove();
    q(".hero .reveal").forEach(el => el.style.cssText = "opacity:1;transform:none");
    jv()?.reveal();
    return;
  }

  // el monograma se dibuja trazo a trazo (anime.js)
  if (anime) {
    const marca = q("#jvMarkPaths path");
    anime.set(marca, {
      strokeDasharray: (el) => el.getTotalLength(),
      strokeDashoffset: (el) => el.getTotalLength()
    });
    anime({
      targets: marca,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: "easeInOutSine",
      duration: 1500,
      delay: anime.stagger(180)
    });
  }

  gsap.timeline({ defaults: { ease: "power2.inOut" } })
    .to(".loader__bar i", { width: "100%", duration: 1.6, ease: "power1.inOut" })
    .to(".loader__inner", { opacity: 0, y: -18, duration: 0.5 }, "-=0.15")
    .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.2")
    .set(loader, { display: "none" })
    .add(entradaHero(), "-=0.6");
}

/* El modulo puede terminar de evaluarse despues del evento load
   (la importacion de motion.dev es asincrona): comprobamos el estado. */
if (document.readyState === "complete") arrancar();
else addEventListener("load", arrancar);
setTimeout(() => {
  if (!document.documentElement.classList.contains("is-ready")) arrancar();
}, 3500);

/* ─────────────────────────────────────────────────────────────
   3 · SCROLL: revelados, cabecera, progreso y la joya
   ───────────────────────────────────────────────────────────── */
if (gsap && window.ScrollTrigger && !reduced) {
  const ST = window.ScrollTrigger;

  q(".section").forEach((sec) => {
    const l = q(".line > span", sec);
    const r = q(".reveal", sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 76%" } });
    if (l.length) tl.fromTo(l, ocultoLinea,
      { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.08 }, 0);
    if (r.length) tl.fromTo(r, ocultoItem,
      { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.08 }, 0.15);
  });

  // las piezas entran con desfase
  gsap.from(q(".pieza"), {
    opacity: 0, y: 46, duration: 1, ease: "power3.out", stagger: 0.07,
    scrollTrigger: { trigger: ".piezas__grid", start: "top 82%" }
  });
  gsap.from(q(".step"), {
    opacity: 0, y: 38, duration: 0.9, ease: "power3.out", stagger: 0.12,
    scrollTrigger: { trigger: ".steps", start: "top 82%" }
  });

  // barra de progreso
  gsap.to("#progressBar", {
    width: "100%", ease: "none",
    scrollTrigger: { start: 0, end: () => document.body.scrollHeight - innerHeight, scrub: 0.3 }
  });

  // cabecera compacta
  ST.create({
    start: 60,
    onUpdate: (s) => document.getElementById("header").classList.toggle("is-stuck", s.scroll() > 60)
  });

  // el scroll aleja y gira la joya
  ST.create({
    trigger: ".hero", start: "top top", end: "bottom top",
    onUpdate: (s) => jv()?.setScroll(s.progress)
  });

  // marquesina infinita
  gsap.to("#marquee", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

  // el logo lateral respira con el scroll
  gsap.to(".historia__logo", {
    yPercent: -14, ease: "none",
    scrollTrigger: { trigger: ".historia", start: "top bottom", end: "bottom top", scrub: 0.6 }
  });
} else {
  document.getElementById("header").classList.add("is-stuck");
}

/* ─────────────────────────────────────────────────────────────
   4 · anime.js — los iconos se dibujan al entrar en pantalla
   ───────────────────────────────────────────────────────────── */
if (anime && !reduced && "IntersectionObserver" in window) {
  const dibujar = new IntersectionObserver((entradas, obs) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      anime({
        targets: q(".d", e.target),
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: "easeInOutQuart",
        duration: 1250,
        delay: anime.stagger(110)
      });
      obs.unobserve(e.target);
    }
  }, { threshold: 0.35 });

  q(".step__ico").forEach((el) => dibujar.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   5 · motion.dev — física: cursor, botones magnéticos, fichas
   ───────────────────────────────────────────────────────────── */
if (fino && !reduced) {
  /* El cursor SIGUE al puntero de forma continua. Lanzar una animacion
     nueva en cada fotograma (60/s) es justo lo que atasca la pagina, asi
     que aqui integramos el muelle a mano —misma fisica, un solo bucle y
     cero asignaciones— y dejamos motion.dev para los gestos discretos,
     que es donde un muelle interrumpible aporta de verdad. */
  const cursor = document.getElementById("cursor");
  const punto = cursor.querySelector(".cursor__dot");
  const aro = cursor.querySelector(".cursor__ring");
  const nucleo = aro.firstElementChild;

  const raton = { x: innerWidth / 2, y: innerHeight / 2 };
  const muelles = [
    { el: punto, x: raton.x, y: raton.y, vx: 0, vy: 0, k: 1900, c: 78 },
    { el: aro,   x: raton.x, y: raton.y, vx: 0, vy: 0, k: 340,  c: 33 }
  ];
  let visto = false;

  addEventListener("pointermove", (e) => {
    raton.x = e.clientX; raton.y = e.clientY;
    if (!visto) { visto = true; cursor.style.opacity = "1"; }
  }, { passive: true });

  /* Bucle unico compartido: cursor + iman + inclinacion.
     Los eventos solo anotan coordenadas; el trabajo ocurre una vez
     por fotograma. */
  const pendientes = new Set();
  let ultimo = performance.now();

  (function bucle(ahora) {
    requestAnimationFrame(bucle);
    const dt = Math.min((ahora - ultimo) / 1000, 0.05) || 0.016;
    ultimo = ahora;

    for (const m of muelles) {
      m.vx += (-m.k * (m.x - raton.x) - m.c * m.vx) * dt;
      m.vy += (-m.k * (m.y - raton.y) - m.c * m.vy) * dt;
      m.x += m.vx * dt; m.y += m.vy * dt;
      m.el.style.transform = `translate3d(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px,0)`;
    }

    for (const tarea of pendientes) tarea();
    pendientes.clear();
  })(ultimo);

  const muelleSuave = { type: "spring", stiffness: 300, damping: 24 };
  const muelleRebote = { type: "spring", stiffness: 190, damping: 12, mass: 0.9 };

  // El nucleo del aro crece sobre lo tocable (motion.dev, con muelle)
  if (animate) {
    q("a, button, input, select, textarea, [data-tilt]").forEach((el) => {
      el.addEventListener("pointerenter", () =>
        animate(nucleo, { scale: 1.85, opacity: 0.4 }, muelleSuave));
      el.addEventListener("pointerleave", () =>
        animate(nucleo, { scale: 1, opacity: 1 }, muelleRebote));
    });

    // Botones magneticos: el rebote al soltar es masa/rigidez, no un easing
    q("[data-magnetic]").forEach((el) => {
      let ev = null;
      el.addEventListener("pointermove", (e) => {
        ev = e;
        pendientes.add(function iman() {
          const r = el.getBoundingClientRect();
          animate(el, {
            x: (ev.clientX - r.left - r.width / 2) * 0.3,
            y: (ev.clientY - r.top - r.height / 2) * 0.42
          }, { type: "spring", stiffness: 380, damping: 24, mass: 0.6 });
        });
      });
      el.addEventListener("pointerleave", () => animate(el, { x: 0, y: 0 }, muelleRebote));
    });

    // Inclinacion 3D de las fichas
    q("[data-tilt]").forEach((card) => {
      let ev = null;
      card.addEventListener("pointermove", (e) => {
        ev = e;
        pendientes.add(function inclinar() {
          const r = card.getBoundingClientRect();
          animate(card, {
            rotateX: -((ev.clientY - r.top) / r.height - 0.5) * 8,
            rotateY: ((ev.clientX - r.left) / r.width - 0.5) * 10,
            y: -8
          }, muelleSuave);
        });
      });
      card.addEventListener("pointerleave", () =>
        animate(card, { rotateX: 0, rotateY: 0, y: 0 }, muelleRebote));
    });
  }
}

/* ─────────────────────────────────────────────────────────────
   6 · FIRMA — grabado en vivo sobre el aro 3D
   ───────────────────────────────────────────────────────────── */
const campoGrabado = document.getElementById("engrave");
if (campoGrabado) {
  let t = 0;
  campoGrabado.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => jv()?.engrave(campoGrabado.value), 60);
    if (animate && !reduced) {
      animate(campoGrabado, { opacity: [0.55, 1] }, { duration: 0.35 });
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   6b · VITRINA — filtrar por tipo y buscar por texto
   Un solo criterio combinado: la ficha activa Y el texto escrito.
   ───────────────────────────────────────────────────────────── */
const grid = document.getElementById("piezasGrid");
if (grid) {
  const piezas = q(".pieza", grid);
  const chips = q(".chip");
  const busca = document.getElementById("busca");
  const vacio = document.getElementById("piezasVacio");
  let tipo = "todas";

  function aplicar() {
    const texto = (busca.value || "").trim().toLowerCase();
    let visibles = 0;

    for (const pieza of piezas) {
      const coincide =
        (tipo === "todas" || pieza.dataset.tipo === tipo) &&
        (!texto || pieza.dataset.busca.includes(texto));

      if (coincide) {
        visibles++;
        if (pieza.hidden) {
          pieza.hidden = false;
          if (animate && !reduced) {
            animate(pieza, { opacity: [0, 1], y: [14, 0] },
              { type: "spring", stiffness: 260, damping: 26 });
          }
        }
      } else {
        pieza.hidden = true;
      }
    }

    vacio.hidden = visibles > 0;
    // La rejilla cambia de alto: hay que recalcular los disparadores.
    window.ScrollTrigger?.refresh();
  }

  chips.forEach((chip) => chip.addEventListener("click", () => {
    tipo = chip.dataset.filtro;
    chips.forEach((c) => {
      const activo = c === chip;
      c.classList.toggle("is-on", activo);
      c.setAttribute("aria-pressed", String(activo));
    });
    aplicar();
  }));

  let espera = 0;
  busca.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(aplicar, 120);
  });
}

/* ─────────────────────────────────────────────────────────────
   7 · MENÚ MÓVIL
   ───────────────────────────────────────────────────────────── */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const cerrarMenu = () => {
  nav.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Abrir menú");
  document.body.style.overflow = "";
};
burger.addEventListener("click", () => {
  const abierto = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(abierto));
  burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  document.body.style.overflow = abierto ? "hidden" : "";
});
q("a", nav).forEach((a) => a.addEventListener("click", cerrarMenu));
addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

/* ─────────────────────────────────────────────────────────────
   8 · FORMULARIO (solo front: no envía datos a ningún servidor)
   ───────────────────────────────────────────────────────────── */
const form = document.getElementById("form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let falla = null;

    q(".field", form).forEach((campo) => {
      const ctrl = campo.querySelector("input, select, textarea");
      // El email además tiene que tener forma de email (validity del navegador)
      const mal = !ctrl.value.trim() || (ctrl.type === "email" && !ctrl.checkValidity());
      campo.classList.toggle("is-bad", mal);
      if (mal && !falla) falla = campo;
    });

    if (falla) {
      falla.querySelector("input, select, textarea").focus();
      if (animate) {
        animate(falla, { x: [0, -9, 8, -5, 0] }, { duration: 0.42, ease: "easeOut" });
      }
      return;
    }

    document.getElementById("doneName").textContent =
      form.nombre.value.trim().split(" ")[0];

    const done = document.getElementById("formDone");
    done.hidden = false;

    if (gsap && !reduced) {
      gsap.fromTo(done, { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
    }
    if (anime && !reduced) {
      anime({
        targets: q(".d", done),
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: "easeOutQuart", duration: 900, delay: anime.stagger(220)
      });
    }
  });

  q(".field input, .field select, .field textarea", form).forEach((ctrl) =>
    ctrl.addEventListener("input", () => ctrl.closest(".field").classList.remove("is-bad")));
}
