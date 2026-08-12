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
| Display | Archivo Narrow (condensada) | 700 | Hero. Mayúsculas, `letter-spacing: -0.01em`, `line-height: 0.92`. |
| Heading | Archivo | 800–900 | Títulos de sección. `letter-spacing: -0.02em`, `line-height: 1.05`. |
| Body | Archivo | 400 | Texto corrido. `line-height: 1.55`. |
| Label | Archivo | 500–600 | Nav, botones, chips. Mayúsculas + `letter-spacing: 0.06em` en la nav. |

Archivo / Archivo Narrow son OFL (auto-hospedables sin coste). Sustituyen a la
Helvetica Now del mockup, que es de licencia comercial — ver §7.

### Escala (desktop → móvil)

| Token | Desktop | Móvil |
|---|---|---|
| `--cc-text-display` | 112px | 52px |
| `--cc-text-h1` | 64px | 38px |
| `--cc-text-h2` | 44px | 30px |
| `--cc-text-h3` | 28px | 22px |
| `--cc-text-body-lg` | 18px | 17px |
| `--cc-text-body` | 16px | 16px |
| `--cc-text-sm` | 14px | 14px |
| `--cc-text-xs` | 12px | 12px |

Mínimo de 16px en body móvil (evita el auto-zoom de iOS).

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

## 7. Decisiones abiertas

1. **Tipografía** — el mockup usa una grotesca de licencia comercial
   (Helvetica Now / similar). Se implementa con **Archivo + Archivo Narrow**
   (OFL, gratis, auto-hospedadas). Si se compra la licencia original, el cambio
   es una sola variable en `assets/cesar-tokens.css`.
2. **Imágenes de producto** — el mockup muestra bolsas en blanco (placeholder).
   Falta fotografía real de packaging.
3. **Suscripciones** — el diseño asume una app de suscripción en la PDP
   (Recharge, Seal, Awtomic…). Define la integración antes de construir el bloque.
