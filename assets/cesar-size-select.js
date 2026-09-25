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

    // Toda la píldora abre el selector, no sólo el texto: el botón mide lo que
    // mide su contenido, así que en el campo ancho la mayor parte del recuadro
    // quedaba muerta. El contenedor es de Dawn y no se puede envolver, así que
    // se escucha en él.
    this.pildora = this.closest('.product-form__input--dropdown') || this;
    this.pildora.addEventListener('click', this.onPildoraClick);

    this.select.addEventListener('change', this.onSelectChange);
    document.addEventListener('click', this.onDocumentClick);
    this.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    this.pildora?.removeEventListener('click', this.onPildoraClick);
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
    this.yaDesplazado = false;
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
    // La clase va en la píldora, que es el padre: el estilo del aro no puede
    // depender de :has() sobre un atributo que cambia en caliente, porque el
    // navegador no siempre reevalúa la regla.
    this.pildora?.classList.add('cesar-dropdown--open');
    this.boton.setAttribute('aria-expanded', 'true');

    // preventScroll: el foco se mueve por accesibilidad, no para llevar la
    // página a ningún sitio. Sin esto el navegador salta al abrir con ratón.
    const marcada = this.lista.querySelector('[aria-selected="true"]') || this.primera;
    marcada?.focus({ preventScroll: true });
  }

  /**
   * Coloca el panel pegado bajo el disparador, en coordenadas de la ventana.
   *
   * Siempre debajo, nunca arriba: abrirlo hacia el otro lado según el hueco
   * hacía que la lista apareciera cada vez en un sitio distinto —a veces
   * encima de la cabecera— y se perdía la relación con el campo que se está
   * eligiendo. Cuando no cabe entero, en vez de darle la vuelta se recorta su
   * alto y la lista se desplaza por dentro.
   */
  colocar = () => {
    // Se comprueba el panel y no el atributo `open` del elemento: al abrir hay
    // que colocarlo ANTES de marcar `open`, para que la animación de entrada
    // arranque ya en su sitio. Con la condición sobre `open` no se colocaba.
    if (!this.enCapaSuperior || !this.panel.matches(':popover-open')) return;

    const margen = 8;
    let b = this.boton.getBoundingClientRect();

    // Con muy poco hueco por debajo el panel quedaría en una rendija. Antes de
    // colocarlo se sube la página para dejarle sitio; el disparador queda a un
    // tercio de la pantalla, que es donde se espera encontrarlo.
    const hueco = () => window.innerHeight - b.bottom - margen * 2;
    if (hueco() < CesarSizeSelect.ALTO_MINIMO && !this.yaDesplazado) {
      this.yaDesplazado = true;
      window.scrollBy({ top: b.top - window.innerHeight / 3, behavior: 'instant' });
      b = this.boton.getBoundingClientRect();
    }

    // El alto disponible manda sobre el tope del diseño: la lista se desplaza
    // por dentro y el panel nunca se sale de la pantalla. Se mide DESPUÉS del
    // posible desplazamiento, y sin forzar el mínimo: si la página ya estaba
    // al final y no se pudo subir más, vale más un panel bajo que uno que se
    // sale de la pantalla.
    this.panel.style.setProperty('--cesar-size-hueco', `${Math.max(0, Math.round(hueco()))}px`);

    const ancho = this.panel.offsetWidth;
    const left = Math.min(Math.max(margen, b.left), Math.max(margen, window.innerWidth - ancho - margen));

    this.panel.style.top = `${Math.round(b.bottom + margen)}px`;
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

    this.pildora?.classList.remove('cesar-dropdown--open');
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

  onPildoraClick = (event) => {
    // El botón y el panel se manejan solos: aquí sólo llega lo que queda de
    // píldora alrededor (el relleno y la etiqueta).
    if (event.target.closest('.cesar-size__trigger, .cesar-size__panel')) return;
    this.alternar();
  };

  onDocumentClick = (event) => {
    if (!this.abierto) return;
    // La píldora es el PADRE del elemento, así que un clic en su relleno cae
    // fuera de `this`: sin contarla, abrir desde ahí cerraba en el mismo
    // gesto. El panel sí es descendiente aunque viva en la capa superior.
    const dentro = this.contains(event.target) || this.pildora?.contains(event.target);
    if (!dentro) this.cerrar();
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

/** Alto mínimo utilizable del panel: por debajo, se le hace sitio. */
CesarSizeSelect.ALTO_MINIMO = 240;

if (!customElements.get('cesar-size-select')) {
  customElements.define('cesar-size-select', CesarSizeSelect);
}
