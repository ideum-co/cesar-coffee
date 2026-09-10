/**
 * Abre el formulario de preguntas en un <dialog> nativo.
 *
 * El diálogo hace por su cuenta lo que cuesta hacer bien a mano: atrapa el foco
 * dentro, cierra con Escape, vuelve el foco al botón al cerrarse y deja inerte
 * lo que hay detrás. Aquí sólo hace falta abrirlo y reabrirlo tras el envío.
 */
(() => {
  const abrir = (dialogo, disparador) => {
    if (typeof dialogo.showModal !== 'function') {
      // Sin soporte de <dialog> el formulario sigue existiendo en la página:
      // se le quita el atributo para que quede visible y utilizable.
      dialogo.setAttribute('open', '');
      dialogo.scrollIntoView({ block: 'center' });
      return;
    }
    dialogo.showModal();
    dialogo.querySelector('input, textarea')?.focus();
    if (disparador) dialogo.dataset.volverA = disparador.id || '';
  };

  document.addEventListener('click', (event) => {
    const disparador = event.target.closest('[data-qa-open]');
    if (!disparador) return;

    const id = disparador.getAttribute('aria-controls');
    const dialogo = id && document.getElementById(id);
    if (dialogo) abrir(dialogo, disparador);
  });

  // Tras enviar, Shopify recarga la página con el resultado en la url. El
  // diálogo se vuelve a abrir para que la confirmación o el error se lean donde
  // se escribió la pregunta, y no en una página que parece no haber hecho nada.
  if (window.location.search.includes('contact_posted')) {
    document.addEventListener('DOMContentLoaded', () => {
      const dialogo = document.querySelector('[data-qa-dialog]:has(.cesar-rt__form-ok, .cesar-rt__form-error)');
      if (dialogo) abrir(dialogo);
    });
  }
})();
