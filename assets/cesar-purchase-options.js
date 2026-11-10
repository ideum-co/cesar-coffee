/**
 * Compra única frente a suscripción en la ficha de producto.
 * Escribe el plan elegido en el campo que viaja con el formulario y mantiene el
 * precio de la suscripción al día con la frecuencia elegida.
 *
 * El color de la tarjeta elegida no lo pone este script: lo resuelve el CSS con
 * :has(input:checked), de modo que lo que se ve y lo que envía el formulario
 * salen del mismo sitio y no pueden discrepar.
 */
class CesarPurchaseOptions extends HTMLElement {
  connectedCallback() {
    this.bindControls();
    this.addEventListener('change', this.onChange);
    this.unsubscribeVariant?.();
    this.unsubscribeVariant = subscribe(PUB_SUB_EVENTS.variantChange, this.onVariantChange);
  }

  bindControls() {
    this.hidden_input = this.querySelector('[data-selling-plan]');
    this.detail = this.querySelector('[data-detail]');
    this.frequency = this.querySelector('[data-frequency]');
    this.subPrice = this.querySelector('[data-sub-price]');
    if (!this.hidden_input) return;

    this.sync();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.unsubscribeVariant?.();
  }

  onVariantChange = ({ data }) => {
    if (String(data.sectionId) !== this.dataset.section) return;
    const updated = data.html.getElementById(this.id);
    if (!updated) return;
    const previousPlan = this.hidden_input?.value;
    this.innerHTML = updated.innerHTML;
    this.hidden = updated.hidden;
    this.bindControls();
    if (!previousPlan || !this.hidden_input) return;
    const radio = [...this.querySelectorAll('input[data-plan]')].find((input) => input.dataset.plan === previousPlan);
    const option = this.frequency && [...this.frequency.options].find((item) => item.value === previousPlan);
    if (radio || option) {
      if (option) this.frequency.value = previousPlan;
      const subscription = radio || this.querySelector('input[data-plan]:not([data-plan=""])');
      if (subscription) subscription.checked = true;
      this.sync();
    }
  };

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
    if (!this.hidden_input) return;
    const selected = [...this.querySelectorAll('input[type="radio"]')].find((input) => input.checked);
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
  }
}

if (!customElements.get('cesar-purchase-options')) {
  customElements.define('cesar-purchase-options', CesarPurchaseOptions);
}
