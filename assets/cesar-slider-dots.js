/**
 * Puntos de paginación para cualquier carrusel del tema.
 *
 * Se engancha al <slider-component> de Dawn en vez de reimplementar el
 * carrusel: lee su totalPages, escucha su evento slideChanged y, al pulsar un
 * punto, le pide que desplace. Así funciona igual en las secciones propias y
 * en las nativas (productos recomendados, vistos recientemente, etc.).
 *
 * Uso:
 *   <slider-component>
 *     <ul class="slider">...</ul>
 *     <cesar-slider-dots></cesar-slider-dots>
 *   </slider-component>
 */
class CesarSliderDots extends HTMLElement {
  connectedCallback() {
    this.slider = this.closest('slider-component');
    if (!this.slider) return;

    this.onSlideChanged = (event) => this.setActive(event.detail.currentPage);
    this.slider.addEventListener('slideChanged', this.onSlideChanged);

    // El slider calcula totalPages en su propio ResizeObserver, que corre
    // después de este connectedCallback. Se observa el mismo elemento para
    // reconstruir cuando ya tenga el dato: con un requestAnimationFrame suelto
    // se leía totalPages todavía indefinido y los puntos no llegaban a pintarse.
    const track = this.slider.slider;
    if (track && 'ResizeObserver' in window) {
      this.observer = new ResizeObserver(() => this.build());
      this.observer.observe(track);
    }

    this.build();
  }

  disconnectedCallback() {
    if (this.slider) this.slider.removeEventListener('slideChanged', this.onSlideChanged);
    if (this.observer) this.observer.disconnect();
  }

  build() {
    const total = this.slider.totalPages;

    // Todavía sin calcular: se espera a la siguiente pasada en vez de dar por
    // hecho que no hay páginas.
    if (typeof total !== 'number') return;

    // Con una sola página no hay nada que paginar: se retira del árbol de
    // accesibilidad en vez de dejar un control inútil.
    if (total < 2) {
      this.hidden = true;
      this.innerHTML = '';
      this.buttons = null;
      return;
    }

    this.hidden = false;
    if (this.buttons && this.buttons.length === total) {
      this.setActive(this.slider.currentPage || 1);
      return;
    }

    this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Paginación del carrusel');

    this.innerHTML = '';
    for (let i = 1; i <= total; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cesar-dot';
      button.setAttribute('aria-label', `Ir a la diapositiva ${i} de ${total}`);
      button.addEventListener('click', () => this.goTo(i));
      this.appendChild(button);
    }

    this.buttons = Array.from(this.children);
    this.setActive(this.slider.currentPage || 1);
  }

  goTo(page) {
    const slider = this.slider.slider;
    if (!slider) return;
    slider.scrollTo({
      left: (page - 1) * this.slider.sliderItemOffset,
      // Se respeta la preferencia de menos movimiento del sistema.
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  setActive(page) {
    if (!this.buttons) return;
    this.buttons.forEach((button, index) => {
      const isActive = index === page - 1;
      button.classList.toggle('cesar-dot--active', isActive);
      // aria-current marca cuál es la diapositiva en curso para el lector.
      if (isActive) {
        button.setAttribute('aria-current', 'true');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }
}

customElements.define('cesar-slider-dots', CesarSliderDots);
