/**
 * Vídeo de fondo del hero.
 *
 * Se ocupa de dos cosas que no se pueden resolver en el markup:
 *
 *  - Detener la reproducción cuando el sistema pide menos movimiento. Eso no se
 *    sabe al generar la página, así que el atributo autoplay se queda y aquí se
 *    revierte en cuanto el elemento existe.
 *  - El botón de pausa. Un fondo en movimiento de más de cinco segundos tiene
 *    que poder detenerse.
 *
 * Con el vídeo alojado basta con pause(). Con YouTube o Vimeo haría falta su
 * API para controlarlo desde fuera, así que se le retira el src: la
 * reproducción se detiene y queda a la vista el póster, que es lo que se
 * espera de una pausa en un fondo decorativo.
 */
class CesarHeroVideo extends HTMLElement {
  connectedCallback() {
    this.video = this.querySelector('video');
    this.iframe = this.querySelector('iframe');
    this.toggle = this.querySelector('[data-hero-toggle]');
    this.label = this.querySelector('[data-hero-toggle-label]');
    if (!this.video && !this.iframe) return;

    this.textos = {
      pausar: this.label?.textContent.trim() || 'Pause background video',
      reanudar: 'Play background video',
    };

    if (this.toggle) {
      this.onToggle = () => this.setPaused(!this.paused);
      this.toggle.addEventListener('click', this.onToggle);
    }

    // El movimiento arranca sólo si el sistema no pide lo contrario.
    this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotionChange = () => {
      if (this.motion.matches) this.setPaused(true);
    };
    this.motion.addEventListener('change', this.onMotionChange);

    if (this.motion.matches) this.setPaused(true);
  }

  disconnectedCallback() {
    this.toggle?.removeEventListener('click', this.onToggle);
    this.motion?.removeEventListener('change', this.onMotionChange);
  }

  get paused() {
    return this.hasAttribute('paused');
  }

  setPaused(paused) {
    this.toggleAttribute('paused', paused);

    if (this.video) {
      // play() devuelve una promesa que se rechaza si el navegador bloquea la
      // reproducción automática. Sin capturarla, esa promesa queda sin manejar
      // y ensucia la consola con un error que no aporta nada.
      if (paused) this.video.pause();
      else this.video.play().catch(() => {});
    }

    if (this.iframe) {
      if (paused) {
        this.iframe.removeAttribute('src');
      } else if (this.iframe.dataset.src) {
        this.iframe.src = this.iframe.dataset.src;
      }
    }

    if (this.toggle) {
      this.toggle.setAttribute('aria-pressed', String(paused));
      if (this.label) this.label.textContent = paused ? this.textos.reanudar : this.textos.pausar;
    }
  }
}

if (!customElements.get('cesar-hero-video')) {
  customElements.define('cesar-hero-video', CesarHeroVideo);
}
