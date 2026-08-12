# Cesar's Coffee Cup — tema Shopify

Tema de la tienda de Cesar's Coffee Cup. Base: **Shopify Dawn v16.0.0**.
El sistema de diseño está documentado en [`design-system/MASTER.md`](design-system/MASTER.md).

---

## Principio de arquitectura

> Reutilizar secciones de Dawn donde el diseño encaja. Crear secciones a medida
> sólo para las piezas firma de la marca.

Esto mantiene el tema modular, actualizable con las versiones nuevas de Dawn y
totalmente editable desde el personalizador de Shopify.

**Nada está hardcodeado.** Todo lo que el cliente puede querer cambiar vive en
el personalizador o en el admin:

| Elemento | Dónde se gestiona |
|---|---|
| Logo | Personalizador → Configuración del tema → Logo |
| Items y estructura del menú | Admin → Tienda online → Navegación (`main-menu`) |
| Añadir / quitar / ocultar / reordenar secciones | Personalizador (todas las secciones traen `presets`) |
| Contenido de cada sección | Personalizador → ajustes de la sección |
| Items dentro de una sección | Bloques (se añaden, quitan y reordenan) |
| Colores | Personalizador → Color schemes (`scheme-1` … `scheme-5`) |
| Tipografías | Personalizador → Tipografía (incluye la fuente display) |

Para **ocultar** una sección sin borrarla, se usa el ojo del personalizador.
Para **vaciar** un campo (titular, botón, imagen), basta con dejarlo en blanco:
las secciones a medida no renderizan los elementos vacíos.

---

## Secciones a medida

| Sección | Archivo | Bloques |
|---|---|---|
| Cesar · Hero | `sections/cesar-hero.liquid` | — |
| Cesar · Tiers | `sections/cesar-tiers.liquid` | `tier` (máx. 3) |
| Cesar · Lista destacada | `sections/cesar-link-list.liquid` | `link` (ilimitados) |

Secciones de Dawn reutilizadas en la home: `image-with-text`,
`featured-collection`, `image-banner`, `multicolumn`.

## Snippets

| Snippet | Uso |
|---|---|
| `cesar-line-badge.liquid` | Badge de línea (Green / Silver / Gold) sobre las cards |

El badge lee `product.metafields.cesar.line` y, si no existe, cae a las
etiquetas `green-line` / `silver-line` / `gold-line`. Si el producto no tiene
línea, no renderiza nada.

## Suscripciones

Se usa **Shopify Subscriptions** (la app nativa). Dawn no trae selector de
selling plans en la PDP: lo aporta la app como **bloque de app**.

Para activarlo: Personalizador → plantilla de producto → *Añadir bloque* →
bloque de Shopify Subscriptions, y se coloca donde toque (en el diseño va
entre el selector de tamaño y el botón de añadir al carrito).

`assets/cesar-product.css` ya le da el contenedor de marca al widget. Los
planes (frecuencia y el descuento del 10%) se configuran en la app, no aquí.

## CSS

`assets/cesar-tokens.css` define los tokens y se carga después de `base.css`.
Cada sección a medida trae su propio CSS (`cesar-<seccion>.css`), cargado por
la propia sección.

Las familias tipográficas (`--cc-font-sans`, `--cc-font-display`) las inyecta
`layout/theme.liquid` desde los ajustes del tema — no se declaran en el CSS,
que carga después y las pisaría.

---

## Desarrollo

```bash
shopify theme dev --store <tienda>.myshopify.com
```

```bash
shopify theme check
```

## Actualizar Dawn

El remote `dawn` apunta al repositorio original, para poder traer versiones
nuevas y resolver conflictos sólo en los archivos tocados:

```bash
git fetch dawn --tags && git merge v17.0.0
```
