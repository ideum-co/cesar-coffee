/**
 * Compra única frente a suscripción en la ficha de producto.
 * Escribe el plan elegido en el campo que viaja con el formulario y muestra el
 * detalle de la suscripción sólo cuando está seleccionada.
 */
class CesarPurchaseOptions extends HTMLElement {
  connectedCallback() {
    this.hidden_input = this.querySelector('[data-selling-plan]');
    this.detail = this.querySelector('[data-detail]');
    this.frequency = this.querySelector('[data-frequency]');
    this.subPrice = this.querySelector('[data-sub-price]');
    if (!this.hidden_input) return;

    this.addEventListener('change', this.onChange);
    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
  }

  onChange = (event) => {
    // Al cambiar la frecuencia, la opción de suscripción pasa a estar elegida:
    // tocar el desplegable sin marcar el radio dejaría un estado ambiguo.
    if (event.target === this.frequency) {
      const radio = this.querySelector('input[data-plan]:not([data-plan=""])');
      if (radio) radio.checked = true;
    }
    this.sync();
  };

  sync() {
    const selected = this.querySelector('input[type="radio"]:checked');
    const isSubscription = !!(selected && selected.dataset.plan);

    let plan = isSubscription ? selected.dataset.plan : '';

    if (isSubscription && this.frequency) {
      plan = this.frequency.value;
      const option = this.frequency.selectedOptions[0];
      if (option && this.subPrice && option.dataset.price) {
        this.subPrice.textContent = option.dataset.price;
      }
    }

    this.hidden_input.value = plan;
    if (this.detail) this.detail.hidden = !isSubscription;
  }
}

if (!customElements.get('cesar-purchase-options')) {
  customElements.define('cesar-purchase-options', CesarPurchaseOptions);
}
