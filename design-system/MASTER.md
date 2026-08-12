# Cesar's Coffee Cup — Design System (MASTER)

Fuente de verdad global del tema. Derivado de la propuesta visual
(`Web_proposal_Cesars_coffee_cup.pdf`: Home, Colección, PDP) y del logo oficial.
Base técnica: **Shopify Dawn v16.0.0**.

> Regla de uso: al construir una página, leer primero este archivo. Si existe
> `design-system/pages/<pagina>.md`, sus reglas **sobrescriben** a las de aquí.

---

## 1. Personalidad de marca

Café colombiano de origen, tostado bajo pedido en North Williamstown, Melbourne.

| Eje | Posición |
|---|---|
| Tono | Directo, artesanal, sin floritura. Habla de fincas y procesos, no de "lifestyle". |
| Densidad visual | Editorial. Tipografía muy grande, mucho aire, imagen a sangre. |
| Temperatura | Cálida (marrón/terracota) contrastada con verde de finca. |
| Anti-patrón | Gradientes, glassmorphism, sombras difusas, iconos emoji, tipografía ligera. |

El diseño es **flat editorial con bloques de color a sangre**: superficies planas,
esquinas suavemente redondeadas, cero sombras decorativas, contraste por color y
escala tipográfica — no por profundidad.

---

## 2. Color

### 2.1 Primitivos

| Token | Hex | Uso |
|---|---|---|
| `--cc-brown-900` | `#2D1206` | Color de marca. Texto principal, footer, botón primario. |
| `--cc-brown-700` | `#4A3120` | Títulos de sección, chips de filtro activos. |
| `--cc-terracotta` | `#CA6C3B` | Tipografía display (hero, listas grandes). **Solo ≥24px bold.** |
| `--cc-terracotta-text` | `#A1562F` | Variante accesible para texto pequeño y enlaces. |
| `--cc-green` | `#558066` | Superficie de sección (banners verdes). |
| `--cc-green-line` | `#3E5F49` | Card de la línea Green. |
| `--cc-gold` | `#C4972E` | Card y badge de la línea Gold. |
| `--cc-silver` | `#5F6A67` | Card y badge de la línea Silver. |
| `--cc-yellow` | `#FDF5A6` | Announcement bar, titulares sobre verde. |
| `--cc-cream` | `#FBF8EC` | Fondo de chips de filtro, superficies suaves. |
| `--cc-bg` | `#EBEBED` | Fondo de página. |
| `--cc-surface` | `#FFFFFF` | Cards de producto. |

### 2.2 Desviaciones respecto al comprobado del diseño

Tres pares del mockup no alcanzaban WCAG AA. Se corrigieron al valor **mínimo**
que cumple, preservando tono y saturación (cambio visualmente imperceptible):

| Caso | Diseño original | Ratio | Corregido | Ratio |
|---|---|---|---|---|
| Verde de sección con texto blanco | `#5C8A6E` | 3.95:1 ✗ | `#558066` | **4.50:1** ✓ |
| Texto de la card Gold Line | blanco s/ `#C4972E` | 2.69:1 ✗ | `#2D1206` s/ gold | **6.51:1** ✓ |
| Terracota en texto pequeño | `#CA6C3B` | 3.08:1 ✗ | `#A1562F` | **4.54:1** ✓ |

`--cc-terracotta` (`#CA6C3B`) se conserva intacto para el display grande, donde
3.08:1 cumple el mínimo de 3:1 para texto grande.

### 2.3 Color schemes de Dawn

Los `color_scheme` de Dawn se mapean así, para que los componentes nativos del
tema (cards, botones, formularios) hereden la marca sin CSS extra:

| Scheme | Fondo | Texto | Botón | Label botón | Uso |
|---|---|---|---|---|---|
| `scheme-1` | `#EBEBED` | `#2D1206` | `#2D1206` | `#FFFFFF` | Página por defecto |
| `scheme-2` | `#FFFFFF` | `#2D1206` | `#2D1206` | `#FFFFFF` | Cards de producto |
| `scheme-3` | `#558066` | `#FFFFFF` | `#2D1206` | `#FFFFFF` | Bloques verdes |
| `scheme-4` | `#2D1206` | `#EBEBED` | `#EBEBED` | `#2D1206` | Footer, bloques oscuros |
| `scheme-5` | `#FDF5A6` | `#2D1206` | `#2D1206` | `#FFFFFF` | Announcement, acentos |

---

## 3. Tipografía

Grotesca neo (familia Helvetica) en todo el sitio. Una sola superfamilia,
diferenciada por peso y ancho — no por mezcla de familias.

| Rol | Familia | Peso | Uso |
|---|---|---|---|
| Display | **Bebas Neue** | 400 | Hero. Mayúsculas, `line-height: 0.9`. Sólo tiene un peso: pedirle 700 lo engorda sintéticamente. |
| Heading | **Helvetica Neue** → Inter | 700–800 | Títulos. `letter-spacing: -0.03em`, `line-height: 0.88`. |
| Body | **Helvetica Neue** → Inter | 400 | Texto corrido. `line-height: 1.55`. |
| Label | Helvetica Neue → Inter | 500–700 | Nav, botones, chips. |

Helvetica Neue resuelve en Apple sin descarga. **Inter** es el sustituto en el
resto de plataformas: grotesca de métrica casi idéntica. Bebas Neue e Inter se
cargan desde Google Fonts.

### Por qué las fuentes no salen de los ajustes del tema

Helvetica Neue no está en el selector de fuentes de Shopify, y
`config/settings_data.json` **no se puede escribir en un tema conectado a
GitHub** (ni por sync ni por CLI; ver §7). Por eso las familias se declaran en
`assets/cesar-tokens.css`, que carga después del `<style>` de `theme.liquid` y
sobrescribe también `--font-body-family` y `--font-heading-family` de Dawn,
para que los componentes nativos usen la misma tipografía.

### Cuidado con `rem` en este tema

Dawn pone `font-size: 62.5%` en `<html>`, así que **1rem son 10px, no 16px**.
Toda la escala tipográfica está en **px a propósito**: en rem salía a un 62%
del tamaño previsto y el sitio entero se veía pequeño.

Si algún día se añade un token en rem, hay que multiplicar por 1.6
(16px = `1.6rem`). Lo mismo aplica al harness de previsualización: tiene que
replicar ese `62.5%` o miente sobre los tamaños reales.

### Escala (desktop → móvil)

| Token | Móvil | Desktop |
|---|---|---|
| `--cc-text-display` | 56px | hasta 168px |
| `--cc-text-h1` | 40px | hasta 104px |
| `--cc-text-h2` | 32px | hasta 60px |
| `--cc-text-h3` | 22px | hasta 30px |
| `--cc-text-body-lg` | 18px | 18px |
| `--cc-text-body` | 16px | 16px |
| `--cc-text-sm` | 14px | 14px |
| `--cc-text-xs` | 12px | 12px |

Todos con `clamp()`, así que escalan solos entre esos extremos.

El cuerpo se fija en 16px en todos los tamaños: Dawn lo deja en 15px por debajo
de 750px, y por debajo de 16px iOS hace zoom solo al enfocar un input.

---

## 4. Layout, forma y espaciado

### Sistema de layout

El layout es **a sangre, sin tope de ancho**, con gutters constantes. Medido
sobre la referencia que marcó el cliente ([sunbum.com](https://www.sunbum.com)):

| Medida | 1440px | 1920px | Adoptado |
|---|---|---|---|
| Gutter lateral | 21px | 23px | `--cc-gutter: 24px` (20px en móvil) |
| Hueco del grid (col y fila) | ~21px | 23px | mismo `--cc-gutter` |
| Columnas de producto | 4 | 4 | 4 desktop / 2 móvil |
| Ancho de card | 334px | 452px | fluido |
| Título de página | 88px | 96px | `--cc-text-h1` fluido |

El gutter, el hueco horizontal y el vertical son **la misma unidad**. Esa es la
clave del ritmo de la referencia: no hay tres valores distintos.

`.cc-container` y el `.page-width` de Dawn comparten ese gutter, para que las
secciones nativas y las propias se alineen.

### Botones

Sistema tomado del `.cta` de la referencia, normalizado a la base de 1440px
(donde su `font-size` es 16px). **Los colores salen del PDF, no de ahí.**

| Token | Valor | Origen |
|---|---|---|
| `--cc-cta-padding-y` | 8px | `1.3rem × (8/20.8)` |
| `--cc-cta-padding-x` | 10.4px | `0.65rem` |
| `--cc-cta-radius` | 8px | `1.3rem × (8/20.8)` |
| `--cc-cta-font-size` | 16px | `--font-size` |
| `--cc-cta-line` | 1.3 | `--base-line: 1.3rem` |
| `--cc-cta-weight` | 700 | `--font-bold` |
| `--cc-cta-transition` | 0.35s | `--transition-speed` |

Da un botón de **37px de alto**, igual que la referencia. Como está por debajo
del mínimo táctil, `.cc-btn::after` extiende el área de toque a 44px sin tocar
el tamaño visual ni el layout.

Los botones nativos de Dawn comparten estos tokens. Se les quita el
`min-width: 120px` que traen (deforma los botones cortos del diseño) y se les
deja `min-height: 44px`, porque ahí no hay un pseudo-elemento libre que usar.

### Titulares

Interlineado **0.88** y tracking **-0.03em** en los titulares grandes (la
referencia usa 0.85 y -0.03em). Peso 800–900.

| Token | Valor | Uso |
|---|---|---|
| `--cc-radius-sm` | 8px | Botones, chips de filtro |
| `--cc-radius-md` | 14px | Cards de producto |
| `--cc-radius-lg` | 22px | Cards de sección, banners |
| `--cc-radius-pill` | 999px | Chips activos, badges |

Espaciado en ritmo de 4/8px: `4 8 12 16 24 32 48 64 96 128`.
Separación vertical entre secciones: 96px desktop / 56px móvil.
Ancho de contenido: 1400px (el diseño usa layouts anchos, no los 1200 de Dawn).

Sin sombras decorativas. Las cards se separan del fondo por color
(`#FFFFFF` sobre `#EBEBED`), no por elevación.

---

## 5. Componentes clave

- **Badge de línea** — círculo (Gold/Green/Silver) en la esquina superior derecha
  de cada card de producto. SVG de marca, no generado por CSS.
- **Card de producto** — fondo blanco, radio `md`, imagen sobre blanco, título,
  notas de cata en gris, rating con estrellas, precio. Sin sombra.
- **Chip de filtro** — píldora. Inactivo: `--cc-cream` con texto marrón.
  Activo: `--cc-brown-700` con texto blanco y una "×" para limpiar.
- **Botón primario** — marrón `#2D1206`, texto blanco, radio `sm`, padding 12/24.
- **Botón secundario** — borde de 1.5px marrón sobre transparente.
- **Banner de sección** — bloque a sangre con titular en `--cc-yellow` sobre verde.

---

## 6. Movimiento

Duración 150–300ms, `ease-out` al entrar. Solo `transform` y `opacity`.
Sin parallax. `prefers-reduced-motion` desactiva toda animación de entrada
(Dawn ya trae `animations_reveal_on_scroll`; se respeta el media query).

---

## 7. Limitación conocida: `config/settings_data.json`

**Este archivo no se puede desplegar.** Está comprobado sobre la tienda:

| Vía | Resultado |
|---|---|
| Commit a `main` (sync de GitHub) | no se aplica |
| `shopify theme push --only config/settings_data.json` | **rechazado** |
| `shopify theme push` de `settings_schema.json` o de un asset | correcto |

Shopify protege `settings_data.json` en los temas conectados a GitHub: es dato
del comerciante y sólo se escribe desde el editor de temas. El flujo es de la
tienda al repo, nunca al revés.

**Consecuencia:** los `color_schemes`, la tipografía y el resto de ajustes
globales del repo no llegan a la tienda. El editor muestra *"Unable to display
color schemes"* porque el `current` de la tienda quedó reducido a
`{logo, content_for_index}`.

**Salida recomendada:** crear un tema nuevo desde el repo (Admin → Temas →
Añadir → GitHub, rama `main`) y publicarlo. Al crearse, Shopify inicializa
`settings_data.json` desde el repositorio, con los esquemas ya dentro.

Mientras tanto, el tema no depende de esos ajustes para verse bien: los colores
y las tipografías de marca viven en `assets/cesar-tokens.css`, que sí despliega.

## 8. Decisiones abiertas

1. **Imágenes** — las sube el cliente. El mockup usa bolsas en blanco de
   relleno; falta fotografía real de packaging, y una versión del logo en
   blanco para el footer.
2. **Suscripciones** — se usa Shopify Subscriptions (nativa). El selector lo
   aporta la app como bloque de app en la PDP.
3. **Catálogo** — aún no hay productos. Ver `DATA-MODEL.md` para lo que hay que
   crear antes de cargarlos.
