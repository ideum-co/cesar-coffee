/**
 * Marquesina de cards.
 *
 * El movimiento lo hace una animación de CSS. Aquí sólo:
 *  - se ajusta la duración al ancho real de la pista, para que la velocidad
 *    (px/s) sea la misma con tres cards que con diez;
 *  - si las cards no llenan la pantalla, se repiten hasta que la llenen: si no,
 *    el bucle mostraría un hueco cada vuelta;
 *  - se maneja el botón de pausa.
 *
 * No hay bucle de animación propio: un requestAnimationFrame no corre en una
 * pestaña en segundo plano y la animación de CSS sí se recupera sola.
 */
class CesarLineMarquee extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-mq-track]');
    this.lista = this.querySelector('[data-mq-list]');
    this.copia = this.querySelector('[data-mq-clone]');
    this.boton = this.querySelector('[data-mq-toggle]');
    if (!this.track || !this.lista || !this.copia) return;

    this.velocidad = parseFloat(this.dataset.speed) || 50;
    this.boton?.addEventListener('click', () => this.alternar());

    // Las imágenes cambian el ancho de la pista al cargar, y el editor lo
    // cambia al abrir su panel: se observa la lista, no window.
    if ('ResizeObserver' in window) {
      this.observador = new ResizeObserver(() => this.ajustar());
      this.observador.observe(this.lista);
      this.observador.observe(this);
    } else {
      window.addEventListener('resize', this.ajustar);
    }

    this.ajustar();
  }

  disconnectedCallback() {
    this.observador?.disconnect();
    window.removeEventListener('resize', this.ajustar);
  }

  ajustar = () => {
    this.rellenar();

    const mitad = this.lista.getBoundingClientRect().width;
    if (!mitad) return;

    // Duración = distancia de una vuelta / velocidad. Se redondea a décimas
    // para no reiniciar la animación por cambios de ancho de un píxel.
    const segundos = Math.max(1, Math.round((mitad / this.velocidad) * 10) / 10);
    const actual = parseFloat(this.track.style.getPropertyValue('--cesar-mq-duration')) || 0;
    if (Math.abs(actual - segundos) > 0.2) {
      this.track.style.setProperty('--cesar-mq-duration', `${segundos}s`);
    }
  };

  /**
   * Repite las cards hasta que una mitad de la pista sea al menos tan ancha
   * como la marquesina. Con tope: si una card mide cero (aún sin pintar) no
   * hay que clonar sin fin.
   */
  rellenar() {
    const originales = [...this.lista.children].filter((li) => !li.dataset.mqRelleno);
    if (!originales.length) return;

    let vueltas = 0;
    while (this.lista.getBoundingClientRect().width < this.clientWidth && vueltas < 6) {
      originales.forEach((li) => {
        this.lista.appendChild(this.duplicar(li));
        this.copia.appendChild(this.duplicar(li));
      });
      vueltas += 1;
    }
  }

  duplicar(li) {
    const clon = li.cloneNode(true);
    clon.dataset.mqRelleno = 'true';
    // Repetición: no es contenido nuevo, así que ni se anuncia ni se enfoca.
    clon.setAttribute('aria-hidden', 'true');
    clon.querySelectorAll('a, button').forEach((el) => (el.tabIndex = -1));
    // El editor de temas identifica los bloques por este atributo; en una
    // copia sólo confundiría al hacer clic.
    clon.removeAttribute('data-shopify-editor-block');
    return clon;
  }

  alternar() {
    const pausado = !this.hasAttribute('data-paused');
    this.toggleAttribute('data-paused', pausado);
    this.boton.setAttribute('aria-pressed', String(pausado));

    const etiqueta = this.boton.querySelector('[data-mq-toggle-label]');
    if (etiqueta) etiqueta.textContent = pausado ? 'Play animation' : 'Pause animation';
  }
}

if (!customElements.get('cesar-line-marquee')) {
  customElements.define('cesar-line-marquee', CesarLineMarquee);
}
