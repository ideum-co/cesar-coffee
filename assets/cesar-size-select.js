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
    window.removeEventListener('scroll', this.colocar);
    window.removeEventListener('resize', this.colocar);
    clearTimeout(this.tempSalida);
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

    // La capa superior del navegador: ahí el panel se pinta por encima de todo
    // el documento, sin depender de z-index ni de qué ancestro haya creado un
    // contexto de apilado. Sin soporte, el panel se queda donde está y se
    // apoya en el z-index de la hoja.
    this.enCapaSuperior = typeof this.panel.showPopover === 'function';
    if (this.enCapaSuperior) this.panel.setAttribute('popover', 'manual');

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
    this.panel.hidden = false;
    if (this.enCapaSuperior) {
      this.panel.showPopover();
      // Se coloca antes de marcar `open`: la animación de entrada tiene que
      // arrancar desde el sitio definitivo, o el panel cruzaría la pantalla.
      this.colocar();
      // En la capa superior el panel ya no se mueve con la página: hay que
      // recolocarlo mientras esté abierto.
      window.addEventListener('scroll', this.colocar, { passive: true });
      window.addEventListener('resize', this.colocar);
    }
    this.setAttribute('open', '');
    this.boton.setAttribute('aria-expanded', 'true');

    // preventScroll: el foco se mueve por accesibilidad, no para llevar la
    // página a ningún sitio. Sin esto el navegador salta al abrir con ratón.
    const marcada = this.lista.querySelector('[aria-selected="true"]') || this.primera;
    marcada?.focus({ preventScroll: true });
  }

  /** Coloca el panel bajo el disparador, en coordenadas de la ventana. */
  colocar = () => {
    // Se comprueba el panel y no el atributo `open` del elemento: al abrir hay
    // que colocarlo ANTES de marcar `open`, para que la animación de entrada
    // arranque ya en su sitio. Con la condición sobre `open` no se colocaba.
    if (!this.enCapaSuperior || !this.panel.matches(':popover-open')) return;

    const b = this.boton.getBoundingClientRect();
    const alto = this.panel.offsetHeight;
    const ancho = this.panel.offsetWidth;
    const margen = 8;

    // Si no cabe por abajo, se abre hacia arriba; y nunca se sale por los lados.
    const cabeAbajo = b.bottom + margen + alto <= window.innerHeight;
    const top = cabeAbajo ? b.bottom + margen : Math.max(margen, b.top - margen - alto);
    const left = Math.min(Math.max(margen, b.left), Math.max(margen, window.innerWidth - ancho - margen));

    // El sentido lo lee el CSS para que el panel nazca del lado del
    // disparador y no contra él.
    this.panel.dataset.dir = cabeAbajo ? 'down' : 'up';
    this.panel.style.top = `${Math.round(top)}px`;
    this.panel.style.left = `${Math.round(left)}px`;
  };

  cerrar(devolverFoco = false) {
    if (!this.abierto) return;
    // Quitar `open` dispara la salida; el panel sigue visible hasta que la
    // transición termina, porque `display` y `overlay` van con allow-discrete.
    this.removeAttribute('open');

    if (this.enCapaSuperior) {
      this.panel.hidePopover();
      window.removeEventListener('scroll', this.colocar);
      window.removeEventListener('resize', this.colocar);
    } else {
      // Sin capa superior no hay allow-discrete que valga: se espera a que la
      // transición acabe para esconderlo, o la salida no se vería.
      this.esperarSalida();
    }

    this.boton.setAttribute('aria-expanded', 'false');
    // Al cerrar con teclado o con la X el foco vuelve al disparador; al elegir
    // una talla no, porque Dawn recarga la sección y el foco se perdería igual.
    if (devolverFoco) this.boton.focus();
  }

  /** Esconde el panel cuando termina la animación de salida. */
  esperarSalida() {
    clearTimeout(this.tempSalida);
    const fin = () => {
      if (!this.abierto) this.panel.hidden = true;
    };
    this.panel.addEventListener('transitionend', fin, { once: true });
    // Reserva por si la transición no llega a correr (pestaña oculta, menos
    // movimiento pedido): el panel tiene que esconderse igual.
    this.tempSalida = setTimeout(fin, 320);
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
