/**
 * Lista propia para el selector de talla.
 *
 * El <select> nativo sigue en el DOM y es quien manda: esta lista sólo escribe
 * en él y lanza `change`, así que la lógica de variantes de Dawn no cambia.
 * Sin JS queda el desplegable nativo, que funciona.
 */
class CesarSizeSelect extends HTMLElement {
  connectedCallback() {
    this.select = this.querySelector('select');
    this.datos = this.querySelector('[data-cesar-options]');
    if (!this.select) return;

    this.construir();
    this.select.addEventListener('change', this.onSelectChange);
    document.addEventListener('click', this.onDocumentClick);
    this.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    this.select?.removeEventListener('change', this.onSelectChange);
    document.removeEventListener('click', this.onDocumentClick);
    this.removeEventListener('keydown', this.onKeyDown);
  }

  get abierto() {
    return this.hasAttribute('open');
  }

  construir() {
    const etiqueta = this.querySelector('.form__label')?.textContent.trim() || '';
    const extras = {};
    if (this.datos) {
      this.datos.content.querySelectorAll('[data-value]').forEach((d) => {
        extras[d.dataset.value] = { imagen: d.dataset.image, disponible: d.dataset.available !== 'false' };
      });
    }

    // Botón que abre la lista. Refleja el valor actual del <select>.
    this.boton = document.createElement('button');
    this.boton.type = 'button';
    this.boton.className = 'cesar-size__trigger';
    this.boton.setAttribute('aria-haspopup', 'listbox');
    this.boton.setAttribute('aria-expanded', 'false');
    this.boton.addEventListener('click', () => this.alternar());

    this.panel = document.createElement('div');
    this.panel.className = 'cesar-size__panel';
    this.panel.hidden = true;

    const cabecera = document.createElement('div');
    cabecera.className = 'cesar-size__header';
    const titulo = document.createElement('span');
    titulo.className = 'cesar-size__title';
    titulo.id = `${this.select.id}-titulo`;
    titulo.textContent = `Select ${etiqueta}`;
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'cesar-size__close';
    cerrar.setAttribute('aria-label', 'Close');
    cerrar.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>';
    cerrar.addEventListener('click', () => this.cerrar(true));
    cabecera.append(titulo, cerrar);

    this.lista = document.createElement('div');
    this.lista.className = 'cesar-size__list';
    this.lista.setAttribute('role', 'listbox');
    this.lista.setAttribute('aria-labelledby', titulo.id);

    [...this.select.options].forEach((opcion, i) => {
      const extra = extras[opcion.value] || {};
      const fila = document.createElement('button');
      fila.type = 'button';
      fila.className = 'cesar-size__option';
      fila.setAttribute('role', 'option');
      fila.dataset.value = opcion.value;
      fila.tabIndex = -1;
      if (extra.disponible === false) fila.classList.add('cesar-size__option--sold-out');

      const miniatura = extra.imagen
        ? `<img class="cesar-size__thumb" src="${extra.imagen}" alt="" loading="lazy" width="48" height="48">`
        : '<span class="cesar-size__thumb cesar-size__thumb--empty"></span>';

      // El nombre de la variante se escribe con textContent y no interpolado en
      // innerHTML: un título que contenga '<' rompería la fila.
      fila.innerHTML = `${miniatura}<span class="cesar-size__option-label"></span><span class="cesar-size__radio" aria-hidden="true"></span>`;
      fila.querySelector('.cesar-size__option-label').textContent = opcion.textContent.trim();

      fila.addEventListener('click', () => this.elegir(opcion.value));
      this.lista.append(fila);
      if (i === 0) this.primera = fila;
    });

    this.panel.append(cabecera, this.lista);
    this.append(this.boton, this.panel);
    this.sincronizar();
  }

  alternar() {
    this.abierto ? this.cerrar(true) : this.abrir();
  }

  abrir() {
    this.setAttribute('open', '');
    this.panel.hidden = false;
    this.boton.setAttribute('aria-expanded', 'true');
    const marcada = this.lista.querySelector('[aria-selected="true"]') || this.primera;
    marcada?.focus();
  }

  cerrar(devolverFoco = false) {
    if (!this.abierto) return;
    this.removeAttribute('open');
    this.panel.hidden = true;
    this.boton.setAttribute('aria-expanded', 'false');
    // Al cerrar con teclado o con la X el foco vuelve al disparador; al elegir
    // una talla no, porque Dawn recarga la sección y el foco se perdería igual.
    if (devolverFoco) this.boton.focus();
  }

  elegir(valor) {
    if (this.select.value !== valor) {
      this.select.value = valor;
      this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.sincronizar();
    this.cerrar();
  }

  onSelectChange = () => this.sincronizar();

  onDocumentClick = (event) => {
    if (this.abierto && !this.contains(event.target)) this.cerrar();
  };

  onKeyDown = (event) => {
    if (!this.abierto) return;
    const filas = [...this.lista.querySelectorAll('.cesar-size__option')];
    const actual = filas.indexOf(document.activeElement);

    if (event.key === 'Escape') {
      event.preventDefault();
      this.cerrar(true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const paso = event.key === 'ArrowDown' ? 1 : -1;
      const siguiente = (actual + paso + filas.length) % filas.length;
      filas[siguiente].focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      (event.key === 'Home' ? filas[0] : filas[filas.length - 1]).focus();
    }
  };

  sincronizar() {
    const valor = this.select.value;
    const opcion = this.select.selectedOptions[0];
    if (this.boton) this.boton.textContent = opcion ? opcion.textContent.trim() : valor;
    this.lista?.querySelectorAll('.cesar-size__option').forEach((fila) => {
      fila.setAttribute('aria-selected', String(fila.dataset.value === valor));
    });
  }
}

if (!customElements.get('cesar-size-select')) {
  customElements.define('cesar-size-select', CesarSizeSelect);
}
