/**
 * Carril horizontal de los filtros.
 *
 * Con muchos filtros la fila saltaba a una segunda línea y empujaba la rejilla
 * hacia abajo. Aquí se queda en una sola y se desplaza, con una flecha a cada
 * lado que aparece sólo si queda contenido en esa dirección.
 *
 * El desplazamiento lo lleva el propio contenedor con overflow, no el script:
 * así funciona igual con rueda, con gesto táctil y con teclado, y sin JS el
 * carril sigue desplazándose aunque no haya flechas.
 */
const MARGEN = 2; // holgura en px para no encender una flecha por un redondeo

class CesarFilterRail extends HTMLElement {
  connectedCallback() {
    this.carril = this.querySelector('.facets__wrapper');
    this.prev = this.querySelector('[data-rail-prev]');
    this.next = this.querySelector('[data-rail-next]');
    if (!this.carril) return;

    this.onScroll = () => {
      this.actualizar();
      // Al desplazar, el filtro abierto se va de sitio. Se cierra en vez de
      // perseguirlo: un panel flotando sobre un filtro que ya no está debajo
      // desorienta más que desaparecer.
      const abierto = this.querySelector('details[open]');
      if (abierto) abierto.open = false;
    };
    this.carril.addEventListener('scroll', this.onScroll, { passive: true });

    this.prev?.addEventListener('click', () => this.desplazar(-1));
    this.next?.addEventListener('click', () => this.desplazar(1));

    // El ancho disponible cambia al redimensionar, y el del contenido al
    // aplicar un filtro: la fila de resultados se vuelve a pintar con otros
    // recuentos y las píldoras cambian de ancho.
    if ('ResizeObserver' in window) {
      this.observer = new ResizeObserver(() => this.actualizar());
      this.observer.observe(this.carril);
      Array.from(this.carril.children).forEach((hijo) => this.observer.observe(hijo));
    }

    // El panel de cada filtro se saca del carril al abrirse. Dentro quedaría
    // recortado: un contenedor que se desplaza recorta a sus hijos, y por
    // especificación overflow-x: auto arrastra el eje vertical a auto por mucho
    // que se le pida visible.
    this.onToggle = (event) => {
      const detalle = event.target;
      if (!(detalle instanceof HTMLDetailsElement) || !this.contains(detalle)) return;
      if (detalle.open) this.colocarPanel(detalle);
    };
    // toggle no burbujea, así que se escucha en fase de captura.
    this.addEventListener('toggle', this.onToggle, true);

    this.onViewportChange = () => {
      const abierto = this.querySelector('details[open]');
      if (abierto) this.colocarPanel(abierto);
    };
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, { passive: true });

    this.actualizar();
  }

  disconnectedCallback() {
    this.carril?.removeEventListener('scroll', this.onScroll);
    this.removeEventListener('toggle', this.onToggle, true);
    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange);
    this.observer?.disconnect();
  }

  /** Alinea el panel bajo su filtro, en coordenadas de ventana. */
  colocarPanel(detalle) {
    const panel = detalle.querySelector('.facets__display');
    const resumen = detalle.querySelector('summary');
    if (!panel || !resumen) return;

    const r = resumen.getBoundingClientRect();
    panel.style.top = `${r.bottom + 8}px`;

    // Alineado a la izquierda del filtro, salvo que así se saliera por la
    // derecha de la ventana: entonces se pega al borde con un margen.
    const ancho = panel.offsetWidth;
    const margen = 16;
    const maximo = window.innerWidth - ancho - margen;
    panel.style.left = `${Math.max(margen, Math.min(r.left, maximo))}px`;
  }

  /** Un paso deja a la vista algo de lo ya visto, para no perder el hilo. */
  desplazar(sentido) {
    const paso = Math.max(this.carril.clientWidth * 0.8, 200);
    this.carril.scrollBy({ left: paso * sentido, behavior: 'smooth' });
  }

  actualizar() {
    const sobrante = this.carril.scrollWidth - this.carril.clientWidth;
    const x = this.carril.scrollLeft;

    // hidden y no una clase: además de ocultarlas, las saca del orden de
    // tabulación, que es lo que corresponde a un control sin función.
    if (this.prev) this.prev.hidden = x <= MARGEN;
    if (this.next) this.next.hidden = x >= sobrante - MARGEN;

    // Sin nada que desplazar, el carril no debería anunciarse como región
    // desplazable ni capturar el foco al tabular.
    const hayDesbordamiento = sobrante > MARGEN;
    this.toggleAttribute('data-overflow', hayDesbordamiento);
    this.carril.tabIndex = hayDesbordamiento ? 0 : -1;
  }
}

if (!customElements.get('cesar-filter-rail')) {
  customElements.define('cesar-filter-rail', CesarFilterRail);
}
