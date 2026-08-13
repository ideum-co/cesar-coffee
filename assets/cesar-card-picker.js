/**
 * Selector de tamaño dentro de la card de producto.
 * Al marcar un tamaño escribe su variante en el campo oculto del formulario y
 * habilita el botón, que hasta entonces dice "Pick a size".
 */
class CesarCardPicker extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.variantInput = this.querySelector('[data-variant-id]');
    this.submit = this.querySelector('[data-submit]');
    if (!this.form || !this.variantInput || !this.submit) return;

    this.addEventListener('change', this.onSizeChange);
    // La card entera es un enlace al producto: dentro del panel, los clics no
    // deben navegar, sólo operar el selector.
    this.addEventListener('click', (event) => event.stopPropagation());
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onSizeChange);
  }

  onSizeChange = (event) => {
    const radio = event.target.closest('input[type="radio"]');
    if (!radio) return;

    const variantId = radio.dataset.variant;
    if (!variantId) return;

    this.variantInput.value = variantId;
    this.submit.disabled = false;

    const addLabel = this.submit.dataset.labelAdd;
    if (addLabel) this.submit.textContent = addLabel;
  };
}

if (!customElements.get('cesar-card-picker')) {
  customElements.define('cesar-card-picker', CesarCardPicker);
}
