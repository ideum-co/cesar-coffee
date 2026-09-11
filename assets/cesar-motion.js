/**
 * Entradas al hacer scroll y parallax.
 *
 * Entradas: cada elemento con data-cesar-reveal se marca con .is-in cuando
 * entra en pantalla, y el CSS hace la transición. El retardo del escalonado
 * sale de data-cesar-reveal-i. Se hace una sola vez: lo que ya entró no vuelve
 * a esconderse al subir.
 *
 * Parallax: el contenedor lleva data-cesar-parallax con la fuerza (0.1 = la
 * imagen recorre un 10% del alto del contenedor entre que entra por abajo y
 * sale por arriba). Se mueve lo que indique data-cesar-parallax-target, o la
 * imagen o vídeo hijo si no se indica. Sólo se calcula para lo que está en
 * pantalla, y sólo en un fotograma por evento de scroll.
 *
 * Todo se desactiva si el sistema pide menos movimiento: entonces el html no
 * lleva la clase cesar-motion, el CSS no esconde nada y no hay parallax.
 */
(() => {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducido.matches || !('IntersectionObserver' in window)) return;

  const html = document.documentElement;
  html.classList.add('cesar-motion');
  // Avisa al guardián de theme.liquid de que el script ha llegado.
  window.cesarMotionReady = true;

  const PASO_MS = 90;

  /* ---------- Entradas ---------- */

  const mostrar = (el) => {
    el.classList.add('is-in');
    // Tras la transición se retira, para que el elemento vuelva a ser un
    // elemento normal (hover, marquesina...) sin arrastrar estos 0.9s.
    el.addEventListener('transitionend', () => el.classList.add('is-done'), { once: true });
    // Reserva por si no llega el evento (elemento sin transición visible).
    setTimeout(() => el.classList.add('is-done'), 1400);
  };

  const observadorEntrada = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        mostrar(entrada.target);
        observadorEntrada.unobserve(entrada.target);
      });
    },
    // Se dispara cuando asoma un 12%: bastante para que el movimiento se vea,
    // no tanto como para que el elemento llegue ya quieto.
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  const prepararEntradas = (raiz) => {
    raiz.querySelectorAll('[data-cesar-reveal]').forEach((el) => {
      if (el.dataset.cesarReveal === 'none' || el.classList.contains('is-in')) return;

      const i = parseInt(el.dataset.cesarRevealI, 10);
      if (!Number.isNaN(i)) el.style.setProperty('--cesar-reveal-delay', `${i * PASO_MS}ms`);

      // Lo que ya está en pantalla al cargar se muestra en cuanto el
      // observador lo vea; lo que está por debajo espera al scroll.
      observadorEntrada.observe(el);
    });
  };

  /* ---------- Parallax ---------- */

  const activos = new Set();
  let pendiente = false;

  const objetivos = (cont) => {
    const sel = cont.dataset.cesarParallaxTarget;
    const lista = sel ? cont.querySelectorAll(sel) : cont.querySelectorAll(':scope > img, :scope > video');
    return [...lista];
  };

  const pintar = () => {
    pendiente = false;
    const vh = window.innerHeight;
    activos.forEach((cont) => {
      const r = cont.getBoundingClientRect();
      if (!r.height) return;
      // -1 cuando el contenedor acaba de entrar por abajo, +1 cuando sale por
      // arriba; 0 centrado en pantalla.
      const p = (r.top + r.height / 2 - vh / 2) / ((vh + r.height) / 2);
      const fuerza = parseFloat(cont.dataset.cesarParallax) || 0.1;
      const y = Math.round(p * fuerza * r.height * 10) / 10;
      cont.style.setProperty('--cesar-py', `${y}px`);
    });
  };

  const programar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(pintar);
  };

  const observadorParallax = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) activos.add(entrada.target);
      else activos.delete(entrada.target);
    });
    programar();
  });

  const prepararParallax = (raiz) => {
    raiz.querySelectorAll('[data-cesar-parallax]').forEach((cont) => {
      if (cont.dataset.cesarParallaxListo) return;
      const els = objetivos(cont);
      if (!els.length) return;

      const fuerza = parseFloat(cont.dataset.cesarParallax) || 0.1;
      els.forEach((el) => el.setAttribute('data-cesar-parallax-el', ''));
      // Ampliación justa para cubrir el recorrido por arriba y por abajo.
      cont.style.setProperty('--cesar-pscale', (1 + fuerza * 2 + 0.02).toFixed(3));
      cont.dataset.cesarParallaxListo = 'true';
      observadorParallax.observe(cont);
    });
  };

  window.addEventListener('scroll', programar, { passive: true });
  window.addEventListener('resize', programar);

  /* ---------- Arranque ---------- */

  const preparar = (raiz) => {
    prepararEntradas(raiz);
    prepararParallax(raiz);
  };

  const arrancar = () => preparar(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }

  // En el editor de temas cada cambio vuelve a pintar la sección; lo nuevo
  // se muestra de golpe, sin esperar al scroll, y se vuelve a preparar.
  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll('[data-cesar-reveal]').forEach((el) => el.classList.add('is-in', 'is-done'));
    prepararParallax(event.target);
  });

  // Si la preferencia cambia con la página abierta, se apaga todo: se enseña
  // lo que quede oculto y se detiene el parallax.
  reducido.addEventListener?.('change', (e) => {
    if (!e.matches) return;
    document.querySelectorAll('[data-cesar-reveal]').forEach((el) => el.classList.add('is-in', 'is-done'));
    activos.clear();
    html.classList.remove('cesar-motion');
  });
})();
