/**
 * Preselecciona el tipo de consulta a partir de la url.
 *
 * Las páginas de wholesale y co-roasting mandan a /pages/contact?enquiry=Wholesale.
 * Sin esto habría que pedirle a la persona que busque la opción a mano, que es
 * justo el paso donde se abandona un formulario.
 *
 * Si el parámetro no viene o no coincide con ninguna opción, no se toca nada:
 * el desplegable se queda en su primer valor.
 */
(() => {
  const seleccionar = () => {
    const campo = document.querySelector('[data-cesar-enquiry]');
    if (!campo) return;

    const pedido = new URLSearchParams(window.location.search).get('enquiry');
    if (!pedido) return;

    // Se compara sin distinguir mayúsculas ni espacios de sobra: el enlace lo
    // escribe una persona en el personalizador, no el propio formulario.
    const normalizar = (texto) => texto.trim().toLowerCase();
    const buscado = normalizar(pedido);

    const opcion = [...campo.options].find((o) => normalizar(o.value) === buscado);
    if (opcion) campo.value = opcion.value;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seleccionar);
  } else {
    seleccionar();
  }
})();
