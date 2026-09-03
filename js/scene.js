/* ═══════════════════════════════════════════════════════════════
   scene.js — La joya en 3D (Three.js)
   Anillo solitario procedural: aro de oro + gema tallada con
   material físico (transmisión + iridiscencia). Reacciona al
   puntero con amortiguación y al scroll a través de la API
   window.jvScene, que consume main.js (GSAP ScrollTrigger).
   ═══════════════════════════════════════════════════════════════ */
import * as THREE from "three";

const canvas = document.getElementById("jewel");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance"
    });
  } catch (e) {
    document.body.classList.add("no-3d");
    return;
  }

  /* ── Calidad adaptativa ─────────────────────────────────────── */
  const coarse = matchMedia("(pointer: coarse)").matches;
  const lowEnd = coarse || (navigator.hardwareConcurrency || 8) <= 4;
  const maxDPR = lowEnd ? 1.25 : 1.75;

  renderer.setPixelRatio(Math.min(devicePixelRatio, maxDPR));
  // La transmision se renderiza en un buffer aparte: a media resolucion
  // es indistinguible y ahorra la mitad del coste por fotograma.
  if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.55;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  /* ── Entorno generado por código (sin assets externos) ──────── */
  const env = buildEnvironment(renderer);
  scene.environment = env;

  /* ── Materiales ─────────────────────────────────────────────── */
  const oro = new THREE.MeshStandardMaterial({
    color: 0xC9A45C, metalness: 1, roughness: 0.17,
    envMap: env, envMapIntensity: 1.5
  });

  const gema = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    metalness: 0,
    roughness: 0.02,
    transmission: lowEnd ? 0 : 1,      // la transmisión es cara: se apaga en equipos modestos
    thickness: 0.95,
    ior: 2.42,                          // índice de refracción del diamante
    iridescence: 0.35,          // un guiño de fuego, no un arcoiris
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [180, 380],
    envMap: env,
    envMapIntensity: 3.1,
    opacity: lowEnd ? 0.6 : 1,
    transparent: lowEnd,
    flatShading: true,
    side: THREE.DoubleSide
  });

  /* ── FIRMA: textura de grabado sobre el aro ─────────────────
     Un canvas 2D (negro = espejo, blanco = mate) alimenta a la vez
     el bumpMap —relieve— y el roughnessMap —acabado— del aro. Es
     literalmente cómo se ve una letra grabada en oro pulido.      */
  const grabCanvas = document.createElement("canvas");
  grabCanvas.width = 2048; grabCanvas.height = 180;
  const grabCtx = grabCanvas.getContext("2d");

  const grabTex = new THREE.CanvasTexture(grabCanvas);
  grabTex.wrapS = grabTex.wrapT = THREE.RepeatWrapping;
  grabTex.offset.y = 0.5;              // lleva el texto a la cara exterior del aro
  grabTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const oroAro = oro.clone();
  oroAro.roughness = 0.62;             // el mapa devuelve el brillo espejo al fondo
  oroAro.bumpMap = grabTex;
  oroAro.bumpScale = 0.08;
  oroAro.roughnessMap = grabTex;

  function grabar(texto) {
    const t = String(texto || "").trim().toUpperCase().slice(0, 12);
    grabCtx.fillStyle = "#000";
    grabCtx.fillRect(0, 0, 2048, 180);
    if (t) {
      grabCtx.fillStyle = "#fff";
      grabCtx.font = '500 86px "Bodoni Moda", Didot, "Bodoni MT", Georgia, serif';
      grabCtx.textBaseline = "middle";
      const paso = 2048 / 3;           // se repite 3 veces alrededor del aro
      for (let i = 0; i < 3; i++) escribirEspaciado(grabCtx, t, paso * (i + 0.5), 90, 12);
    }
    grabTex.needsUpdate = true;
  }
  grabar("JIREH");

  /* ── La joya ────────────────────────────────────────────────── */
  const joya = new THREE.Group();

  // 'pieza' agrupa aro + gema y se desplaza para que el centro visual
  // del conjunto coincida con el origen de 'joya' (encuadre limpio).
  const pieza = new THREE.Group();
  pieza.position.y = -0.36;   // centro visual del conjunto aro+gema
  joya.add(pieza);

  const aro = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.115, 28, 220), oroAro);
  pieza.add(aro);

  // Talla brillante: corona troncocónica + pabellón en punta
  const gemGroup = new THREE.Group();
  gemGroup.position.y = 1.88;

  const corona = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.45, 0.18, 12), gema);
  corona.position.y = 0.15;
  const cinta = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.44, 0.05, 12), gema);
  cinta.position.y = 0.035;
  const pabellon = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.55, 12), gema);
  pabellon.position.y = -0.265;
  pabellon.rotation.x = Math.PI;
  gemGroup.add(corona, cinta, pabellon);

  // Garras que sujetan la gema
  const garra = new THREE.CylinderGeometry(0.026, 0.034, 0.46, 8);
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Mesh(garra, oro);
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    g.position.set(Math.cos(a) * 0.38, -0.06, Math.sin(a) * 0.38);
    g.rotation.z = Math.cos(a) * 0.22;
    g.rotation.x = -Math.sin(a) * 0.22;
    gemGroup.add(g);
  }

  // Engaste
  const engaste = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.30, 16), oro);
  engaste.position.y = -0.62;
  gemGroup.add(engaste);

  pieza.add(gemGroup);
  joya.rotation.set(-0.12, 0, 0.14);
  scene.add(joya);

  /* ── Destellos flotantes ────────────────────────────────────── */
  const chispas = buildSparkles(lowEnd ? 30 : 60);
  scene.add(chispas);

  /* ── Luces ──────────────────────────────────────────────────── */
  const key = new THREE.DirectionalLight(0xFFE7B8, 2.6); key.position.set(3, 4, 5);
  const fill = new THREE.DirectionalLight(0xA8E0CC, 0.45); fill.position.set(-4, -1, 2);
  const rim = new THREE.PointLight(0xFFD79A, 22, 14); rim.position.set(-2.4, 2.2, -2.6);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xFFFFFF, 0.35));

  /* ── Puntero: objetivo + amortiguación (inercia) ────────────── */
  const puntero = { x: 0, y: 0 };
  const suave = { x: 0, y: 0 };
  if (!coarse) {
    addEventListener("pointermove", (e) => {
      puntero.x = (e.clientX / innerWidth) * 2 - 1;
      puntero.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ── API pública para GSAP ──────────────────────────────────── */
  const estado = { scroll: 0, entrada: reduced ? 1 : 0, pulso: 0 };
  window.jvScene = {
    setScroll: (p) => { estado.scroll = p; },
    reveal: () => { if (!reduced) estado.entrada = 0.0001; },
    engrave: (txt) => { grabar(txt); estado.pulso = 1; },
    listo: true
  };

  /* ── Medidas / responsive ───────────────────────────────────── */
  let ancho = 0, alto = 0, offsetX = 0, base = 0.95;
  function medir() {
    const r = canvas.getBoundingClientRect();
    ancho = r.width; alto = r.height;
    renderer.setSize(ancho, alto, false);
    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();

    const compacto = ancho < 900;
    base = compacto ? (ancho < 620 ? 0.36 : 0.44) : ancho > 1500 ? 0.72 : 0.64;

    // El desplazamiento se calcula desde el encuadre real de la camara,
    // no con numeros fijos: asi la joya nunca se corta, sea cual sea la
    // relacion de aspecto del hero.
    const medioAncho = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z * camera.aspect;
    const radio = 1.4 * base;
    offsetX = compacto ? 0 : Math.min(2.6, Math.max(1.05, medioAncho - radio - 0.3));

    joya.scale.setScalar(base);
    joya.position.y = compacto ? -0.15 : 0;
  }
  medir();
  // ResizeObserver: el hero cambia de alto al retirarse el preloader,
  // y eso no dispara un evento resize.
  if ("ResizeObserver" in window) new ResizeObserver(debounce(medir, 120)).observe(canvas);
  else addEventListener("resize", debounce(medir, 150));

  /* ── Solo dibujamos si el hero está a la vista ──────────────── */
  let visible = true;
  new IntersectionObserver(
    ([e]) => { visible = e.isIntersecting; },
    { threshold: 0 }
  ).observe(canvas);

  /* ── Bucle ──────────────────────────────────────────────────── */
  const reloj = new THREE.Clock();

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;

    // Ojo: getDelta() ya acumula elapsedTime. Llamar antes a
    // getElapsedTime() dejaria el delta en cero.
    const dt = Math.min(reloj.getDelta(), 0.05);
    const t = reloj.elapsedTime;

    if (!reduced) {
      // entrada: la joya "aterriza" al terminar el preloader
      if (estado.entrada > 0 && estado.entrada < 1) {
        estado.entrada = Math.min(1, estado.entrada + dt * 0.85);
      }
      // amortiguación tipo muelle hacia el puntero
      suave.x += (puntero.x - suave.x) * 0.055;
      suave.y += (puntero.y - suave.y) * 0.055;
    }

    const e = easeOut(estado.entrada);
    const s = estado.scroll;

    joya.rotation.y = suave.x * 0.85 + t * 0.16 + s * 2.4;
    joya.rotation.x = -0.12 + suave.y * 0.42 - s * 0.5;
    joya.rotation.z = 0.14 + Math.sin(t * 0.45) * 0.035;

    joya.position.x = offsetX + suave.x * 0.28;
    joya.position.y = (offsetX ? 0 : -0.15)
                    + Math.sin(t * 0.7) * 0.075     // flotación
                    - suave.y * 0.16
                    - s * 1.6
                    + (1 - e) * 3.2;                // entrada desde arriba

    // micro-pulso al grabar una letra nueva
    if (estado.pulso > 0) estado.pulso = Math.max(0, estado.pulso - dt * 3.2);
    const pulso = 1 + Math.sin(estado.pulso * Math.PI) * 0.035;

    joya.scale.setScalar(base * (0.86 + e * 0.14) * pulso);

    chispas.rotation.y = t * 0.05 - suave.x * 0.2;
    chispas.rotation.x = -suave.y * 0.12;
    chispas.material.opacity = 0.55 * e * (1 - s * 1.2);

    rim.position.x = -2.4 + suave.x * 1.6;
    rim.position.y = 2.2 - suave.y * 1.4;

    renderer.render(scene, camera);
  }
  frame();

  /* ── Utilidades locales ─────────────────────────────────────── */
  function buildSparkles(n) {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 2.6 + Math.random() * 3.4;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(a) * r * 0.7 - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.055, color: 0xF4E2B2, map: dotTexture(),
      transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
  }

  function dotTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,235,190,.75)");
    g.addColorStop(1, "rgba(255,215,150,0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
}

/* Entorno HDR falso, pintado en un canvas: bandas de luz cálida
   sobre fondo oscuro — es lo que da a la gema sus reflejos. */
function buildEnvironment(renderer) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const x = c.getContext("2d");

  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.00, "#241d13");
  g.addColorStop(0.34, "#6b5330");
  g.addColorStop(0.50, "#fff0cf");
  g.addColorStop(0.62, "#3d3121");
  g.addColorStop(1.00, "#08110e");
  x.fillStyle = g; x.fillRect(0, 0, 512, 256);

  // focos de estudio
  const focos = [[110, 70, 70], [330, 52, 46], [430, 150, 58], [200, 190, 40]];
  for (const [px, py, r] of focos) {
    const rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, "rgba(255,244,214,.95)");
    rg.addColorStop(1, "rgba(255,244,214,0)");
    x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  // toque esmeralda
  const eg = x.createRadialGradient(60, 210, 0, 60, 210, 90);
  eg.addColorStop(0, "rgba(60,190,150,.5)");
  eg.addColorStop(1, "rgba(60,190,150,0)");
  x.fillStyle = eg; x.fillRect(0, 120, 180, 136);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

/* Dibuja texto con tracking manual y centrado (no todos los
   navegadores aceptan ctx.letterSpacing). */
function escribirEspaciado(ctx, texto, cx, cy, tracking) {
  const letras = [...texto];
  const ancho = letras.reduce((w, l) => w + ctx.measureText(l).width + tracking, -tracking);
  let x = cx - ancho / 2;
  for (const l of letras) {
    ctx.fillText(l, x, cy);
    x += ctx.measureText(l).width + tracking;
  }
}

function easeOut(t) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

function debounce(fn, ms) {
  let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
}
