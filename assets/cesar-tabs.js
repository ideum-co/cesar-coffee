/**
 * Pestañas accesibles.
 *
 * Sigue el patrón de tabs de ARIA: una sola pestaña recibe el foco y las
 * flechas mueven entre ellas. Sin eso, con muchas pestañas habría que tabular
 * por todas para llegar al contenido.
 *
 * El cambio de panel es inmediato y no depende de fotogramas: el efecto de
 * entrada es sólo eso, un efecto.
 */
class CesarTabs extends HTMLElement {
  connectedCallback() {
    this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
    if (this.tabs.length < 2) return;

    this.onClick = (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (!tab || !this.tabs.includes(tab)) return;
      this.select(this.tabs.indexOf(tab));
    };

    this.onKeydown = (event) => {
      const actual = this.tabs.indexOf(event.target);
      if (actual === -1) return;

      const saltos = { ArrowRight: 1, ArrowLeft: -1 };
      let destino = null;

      if (event.key in saltos) {
        // Da la vuelta en los extremos, como espera el patrón de ARIA.
        destino = (actual + saltos[event.key] + this.tabs.length) % this.tabs.length;
      } else if (event.key === 'Home') {
        destino = 0;
      } else if (event.key === 'End') {
        destino = this.tabs.length - 1;
      }

      if (destino === null) return;
      event.preventDefault();
      this.select(destino);
      this.tabs[destino].focus();
    };

    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);

    const inicial = this.tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    this.select(inicial === -1 ? 0 : inicial);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('keydown', this.onKeydown);
  }

  select(indice) {
    this.tabs.forEach((tab, i) => {
      const activa = i === indice;
      tab.setAttribute('aria-selected', String(activa));
      // Sólo la pestaña activa entra en el orden de tabulación; a las demás se
      // llega con las flechas.
      tab.tabIndex = activa ? 0 : -1;
    });

    this.panels.forEach((panel, i) => {
      panel.hidden = i !== indice;
    });
  }
}

if (!customElements.get('cesar-tabs')) {
  customElements.define('cesar-tabs', CesarTabs);
}
