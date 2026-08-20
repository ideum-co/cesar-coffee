/**
 * Recorta un bloque de texto a un número de líneas y lo despliega con una
 * transición de alto.
 *
 * El recorte lo activa este script (clase --ready): sin JavaScript el texto se
 * ve entero en vez de quedar cortado con un botón muerto.
 *
 * La transición va sobre max-height con un valor medido en px y no sobre
 * height:auto, porque 'auto' no es interpolable y el bloque daría un salto seco.
 */
class CesarReadMore extends HTMLElement {
  connectedCallback() {
    this.content = this.querySelector('[data-readmore-content]');
    this.toggle = this.querySelector('[data-readmore-toggle]');
    this.labelMore = this.querySelector('[data-readmore-more]');
    this.labelLess = this.querySelector('[data-readmore-less]');
    if (!this.content || !this.toggle) return;

    this.classList.add('cesar-readmore--ready');

    this.onToggle = () => this.setOpen(!this.open);
    this.toggle.addEventListener('click', this.onToggle);

    // Al tabular, el foco puede caer en un enlace del texto recortado. Como el
    // contenedor tiene overflow:hidden no puede desplazarse hasta él y el
    // usuario quedaría navegando a ciegas. Se despliega sin animación.
    this.onFocusIn = (event) => {
      if (!this.open && event.target !== this.toggle) this.setOpen(true, { animate: false });
    };
    this.addEventListener('focusin', this.onFocusIn);

    // Cuántas líneas ocupa el texto depende del ancho: al cambiar de tamaño un
    // párrafo que antes sobraba puede caber entero, o al revés.
    if ('ResizeObserver' in window) {
      this.observer = new ResizeObserver(() => this.refresh());
      this.observer.observe(this);
    }

    this.refresh();
  }

  disconnectedCallback() {
    this.toggle?.removeEventListener('click', this.onToggle);
    this.removeEventListener('focusin', this.onFocusIn);
    this.observer?.disconnect();
  }

  get open() {
    return this.hasAttribute('open');
  }

  /** Oculta el botón si el texto ya se ve entero: no hay nada que desplegar. */
  refresh() {
    if (this.open) return;
    this.toggle.hidden = this.content.scrollHeight - this.content.clientHeight <= 1;
  }

  setOpen(open, { animate = true } = {}) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // El alto de partida se mide antes de tocar nada: al abrir es el recortado
    // y al cerrar el completo.
    const desde = this.content.getBoundingClientRect().height;

    this.toggleAttribute('open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    if (this.labelMore) this.labelMore.hidden = open;
    if (this.labelLess) this.labelLess.hidden = !open;

    if (!animate || reduce) {
      // Abierto se suelta el tope; cerrado se devuelve el control a la hoja de
      // estilos, que es donde vive el alto recortado.
      this.content.style.maxHeight = open ? 'none' : '';
      return;
    }

    this.content.style.maxHeight = `${desde}px`;

    // Doble rAF: el primero deja asentar el valor de partida y el segundo
    // aplica el destino. Con uno solo el navegador agrupa ambos cambios en el
    // mismo fotograma y no hay transición que ver.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.content.style.maxHeight = open ? `${this.content.scrollHeight}px` : '';
      });
    });

    if (open) {
      // Al terminar se suelta el tope: si no, un cambio posterior de ancho
      // recortaría el texto contra un alto medido para el ancho anterior.
      this.content.addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'max-height' && this.open) this.content.style.maxHeight = 'none';
        },
        { once: true }
      );
    }
  }
}

if (!customElements.get('cesar-read-more')) {
  customElements.define('cesar-read-more', CesarReadMore);
}
