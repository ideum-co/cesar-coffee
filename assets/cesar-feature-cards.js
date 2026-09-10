/**
 * Flechas de la fila de cards.
 *
 * La fila se desplaza sola con el dedo y con el teclado; esto sólo añade los
 * botones y mantiene su estado. No hay bucle de animación: el desplazamiento
 * suave lo hace el CSS, y aquí se escucha `scroll` y `resize`. Un requestAnimationFrame
 * no se ejecuta en una pestaña en segundo plano, y las flechas se quedarían
 * mintiendo sobre dónde está la fila.
 */
class CesarFeatureCards extends HTMLElement {
  connectedCallback() {
    this.rail = this.querySelector('[data-fc-rail]');
    this.nav = this.querySelector('[data-fc-nav]');
    this.prev = this.querySelector('[data-fc-prev]');
    this.next = this.querySelector('[data-fc-next]');
    if (!this.rail || !this.nav) return;

    this.prev?.addEventListener('click', () => this.mover(-1));
    this.next?.addEventListener('click', () => this.mover(1));
    this.rail.addEventListener('scroll', this.actualizar, { passive: true });

    // El ancho de la fila cambia sin que cambie el de la ventana: al abrirse
    // el panel del editor, por ejemplo. Se observa la fila, no window.
    if ('ResizeObserver' in window) {
      this.observador = new ResizeObserver(this.actualizar);
      this.observador.observe(this.rail);
    } else {
      window.addEventListener('resize', this.actualizar);
    }

    this.actualizar();
  }

  disconnectedCallback() {
    this.observador?.disconnect();
    window.removeEventListener('resize', this.actualizar);
  }

  /** Ancho de una tarjeta más el hueco: lo que hay que avanzar por golpe. */
  get paso() {
    const tarjeta = this.rail.querySelector('.cesar-fc__item');
    if (!tarjeta) return this.rail.clientWidth;

    const hueco = parseFloat(getComputedStyle(this.rail).columnGap) || 0;
    return tarjeta.getBoundingClientRect().width + hueco;
  }

  mover(direccion) {
    // Sin `behavior`: lo decide la hoja de estilos, que ya lo pone en suave y
    // lo quita cuando el sistema pide menos movimiento. Pedirlo aquí a mano
    // pasaría por encima de esa preferencia.
    this.rail.scrollBy({ left: this.paso * direccion });
  }

  actualizar = () => {
    const { scrollLeft, scrollWidth, clientWidth } = this.rail;
    const sobra = scrollWidth - clientWidth;

    // Sin nada que desplazar las flechas no llevan a ninguna parte.
    this.nav.hidden = sobra < 2;
    if (this.nav.hidden) return;

    // Un margen de un píxel: el desplazamiento devuelve decimales y el extremo
    // rara vez cae en un número redondo.
    if (this.prev) this.prev.disabled = scrollLeft <= 1;
    if (this.next) this.next.disabled = scrollLeft >= sobra - 1;
  };
}

if (!customElements.get('cesar-feature-cards')) {
  customElements.define('cesar-feature-cards', CesarFeatureCards);
}
