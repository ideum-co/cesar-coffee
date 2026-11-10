if (!customElements.get('cesar-story-cards')) {
  customElements.define('cesar-story-cards', class extends HTMLElement {
    connectedCallback() {
      this.abort?.abort();
      this.abort = new AbortController();
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-story-toggle]');
        if (button) this.open(button.closest('[data-story-card]'));
      }, { signal: this.abort.signal });
      this.addEventListener('shopify:block:select', (event) => {
        const card = event.target.closest('[data-story-card]');
        if (card) this.open(card);
      }, { signal: this.abort.signal });
    }
    disconnectedCallback() { this.abort?.abort(); }
    open(selected) {
      if (selected.classList.contains('is-open')) return;
      this.querySelectorAll('[data-story-card]').forEach((card) => {
        const active = card === selected;
        card.classList.toggle('is-open', active);
        const button = card.querySelector('[data-story-toggle]');
        button.setAttribute('aria-expanded', String(active));
        button.querySelector('[data-story-label]').textContent = active ? this.dataset.less : this.dataset.more;
        card.querySelector('.cesar-story__body').classList.toggle('is-entering', active);
      });
      const track = this.querySelector('.cesar-story__track');
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: selected.offsetLeft - track.offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
    }
  });
}
