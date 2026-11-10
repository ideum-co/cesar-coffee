if (!customElements.get('cesar-story-cards')) {
  customElements.define('cesar-story-cards', class extends HTMLElement {
    connectedCallback() {
      this.abort?.abort();
      this.abort = new AbortController();
      this.addEventListener('click', (event) => {
        const navigation = event.target.closest('[data-story-direction]');
        if (navigation) {
          const cards = [...this.querySelectorAll('[data-story-card]')];
          const index = cards.findIndex((card) => card.classList.contains('is-open'));
          const next = cards[index + Number(navigation.dataset.storyDirection)];
          if (next) this.open(next);
          return;
        }
        const button = event.target.closest('[data-story-toggle]');
        if (button) this.open(button.closest('[data-story-card]'));
      }, { signal: this.abort.signal });
      this.updateNavigation();
      requestAnimationFrame(() => this.reveal(this.querySelector('.is-open'), false));
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
      this.updateNavigation();
      this.reveal(selected, true);
    }
    updateNavigation() {
      const cards = [...this.querySelectorAll('[data-story-card]')];
      const index = cards.findIndex((card) => card.classList.contains('is-open'));
      this.querySelectorAll('[data-story-direction]').forEach((button) => {
        button.disabled = Number(button.dataset.storyDirection) < 0 ? index <= 0 : index >= cards.length - 1;
      });
    }
    reveal(selected, animate) {
      if (!selected) return;
      const track = this.querySelector('.cesar-story__track');
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = [...track.children];
      const index = cards.indexOf(selected);
      const target = index === cards.length - 1 && index > 0 ? cards[index - 1] : selected;
      track.scrollTo({ left: target.offsetLeft, behavior: !animate || reduced ? 'instant' : 'smooth' });
    }
  });
}
