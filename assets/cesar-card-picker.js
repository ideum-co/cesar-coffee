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

    // El texto vive en un <span> porque el botón lleva además el spinner que
    // ProductForm necesita.
    this.submitLabel = this.submit.querySelector('span') || this.submit;

    this.addEventListener('change', this.onSizeChange);
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

    // textContent sobre el botón entero borraría el spinner que ProductForm
    // busca luego, así que sólo se toca la etiqueta.
    const addLabel = this.submit.dataset.labelAdd;
    if (addLabel) this.submitLabel.textContent = addLabel;
  };
}

if (!customElements.get('cesar-card-picker')) {
  customElements.define('cesar-card-picker', CesarCardPicker);
}
