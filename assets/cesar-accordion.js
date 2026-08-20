/**
 * Anima la apertura y el cierre de un grupo de <details>.
 *
 * <details> abre y cierra de golpe: el navegador saca el contenido del flujo en
 * el mismo fotograma, así que no hay nada que transicionar. Aquí se intercepta
 * el clic para controlar cuándo cambia el atributo 'open' y animar el alto.
 *
 * La animación va por la API de animaciones y no por requestAnimationFrame: en
 * una pestaña de fondo rAF no llega a ejecutarse, y una versión anterior de
 * esto dejaba el panel marcado como abierto pero con alto cero. El estado final
 * se fija siempre, con animación o sin ella.
 */
const DURACION = 400;
const CURVA = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

class CesarAccordion extends HTMLElement {
  connectedCallback() {
    this.items = Array.from(this.querySelectorAll('details'));
    if (!this.items.length) return;

    this.onClick = (event) => {
      const summary = event.target.closest('summary');
      if (!summary || !this.contains(summary)) return;

      const item = summary.parentElement;
      if (!this.items.includes(item)) return;

      // El navegador cambiaría 'open' al instante; aquí lo lleva el script.
      event.preventDefault();
      this.setOpen(item, !item.open);
    };
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }

  panelOf(item) {
    return item.querySelector('[data-accordion-panel]');
  }

  setOpen(item, open) {
    if (open && this.hasAttribute('data-one-at-a-time')) {
      this.items.forEach((otro) => {
        if (otro !== item && otro.open) this.setOpen(otro, false);
      });
    }

    const panel = this.panelOf(item);
    const anima = panel && typeof panel.animate === 'function' && !this.reduceMotion;

    if (!anima) {
      item.open = open;
      return;
    }

    // Una animación a medias dejaría el alto congelado en un valor intermedio.
    panel.getAnimations().forEach((a) => a.cancel());

    if (open) {
      // Primero se abre: con el details cerrado el panel no tiene alto que medir.
      // Como el estado correcto queda fijado ya, si la animación no llega a
      // correr lo único que se pierde es el efecto.
      item.open = true;
      const destino = panel.getBoundingClientRect().height;
      panel.animate({ height: ['0px', `${destino}px`] }, { duration: DURACION, easing: CURVA });
      return;
    }

    // Al cerrar hay que animar antes de quitar 'open', o el contenido
    // desaparecería de golpe y se vería encogerse una caja vacía.
    const desde = panel.getBoundingClientRect().height;
    const animacion = panel.animate({ height: [`${desde}px`, '0px'] }, {
      duration: DURACION,
      easing: CURVA,
      fill: 'forwards',
    });

    const cerrar = () => {
      animacion.cancel();
      item.open = false;
    };

    // Dos caminos hacia el mismo final, y llamarlo dos veces no hace daño: si
    // la pestaña está en segundo plano la animación puede no terminar nunca,
    // pero el temporizador sí se dispara y el estado converge igual.
    animacion.finished.then(cerrar, () => {});
    setTimeout(cerrar, DURACION + 100);
  }

  get reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

if (!customElements.get('cesar-accordion')) {
  customElements.define('cesar-accordion', CesarAccordion);
}
