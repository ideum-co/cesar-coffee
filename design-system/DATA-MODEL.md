# Modelo de datos — Cesar's Coffee Cup

Qué hay que crear en Shopify para que el diseño funcione. Cada campo de aquí
sale de un elemento concreto de la propuesta visual: los badges de línea, los
filtros de la colección y los bloques de la PDP.

Namespace de todos los metafields: **`cesar`**.

---

## 1. Opciones de variante

Van como opciones de producto, no como metafields — definen precio e inventario.

| Opción | Valores | De dónde sale |
|---|---|---|
| **Size** | `100g`, `200g`, `250g`, `500g`, `1000g` | Selector de tamaño de la card y de la PDP |
| **Grind** *(opcional)* | `Whole bean`, `Espresso`, `Filter`, `Plunger` | FAQ de la PDP: "What grind should I choose?" |

En el diseño, el Flight se vende como `4 × 100g`: es un valor de Size más, no
un producto aparte.

---

## 2. Metafields de producto

| Key | Tipo | Filtrable | Uso en el diseño |
|---|---|---|---|
| `cesar.line` | Single line text | **Sí** → filtro *Tier* | Badge Green/Silver/Gold en cada card. Valores exactos: `green`, `silver`, `gold` |
| `cesar.tasting_notes` | List of single line text | No | Línea bajo el título de la card: "Milk chocolate · Toffee · Red apple" |
| `cesar.process` | Single line text | **Sí** → filtro *Process* | `Washed`, `Natural`, `Honey`, `Anaerobic` |
| `cesar.origin` | Single line text | No | Línea sobre el título de la PDP: "Hero varietal · Cauca, Colombia" |
| `cesar.varietal` | Single line text | No | "Bourbon Rosado" |
| `cesar.altitude` | Single line text | No | Ficha de origen |
| `cesar.farm` | Metaobject reference → `farm` | No | Bloque "See Our Farms" |
| `cesar.roast_profile` | Single line text | Sí | `Espresso` / `Filter` — el diseño lo menciona en Silver Line |

### Sobre `cesar.line`

El snippet `cesar-line-badge.liquid` lee este metafield y, si no existe, cae a
las etiquetas `green-line` / `silver-line` / `gold-line`.

**Se recomienda el metafield**, no las etiquetas: es filtrable como faceta
limpia y no ensucia la nube de tags. El fallback existe sólo por si se carga
catálogo rápido con tags antes de definir el metafield.

---

## 3. Metaobjeto `farm`

Alimenta "See Our Farms" y "Directly from origin". Un registro por finca.

| Campo | Tipo |
|---|---|
| `name` | Single line text |
| `producer` | Single line text |
| `region` | Single line text |
| `altitude` | Single line text |
| `photo` | File reference (imagen) |
| `story` | Multi line text |

---

## 4. Filtros de la colección

El diseño muestra: **Sort by · Process · Price · Tier · Size · Availability ·
Available for Subscription**.

Sort, Price, Availability y Size (por ser opción de variante) los da Shopify de
serie. **Process** y **Tier** requieren dos pasos:

1. Crear los metafields con acceso de storefront activado.
2. Instalar la app **Search & Discovery** (gratuita, de Shopify) y añadir ahí
   los filtros por metafield.

Sin ese segundo paso los metafields existen pero no aparecen como filtros.

*Available for Subscription* lo aporta Shopify Subscriptions al crear los
selling plans.

---

## 5. Orden recomendado de carga

1. Definiciones de metafields y del metaobjeto `farm`.
2. Un par de fincas de ejemplo.
3. Productos con Size como opción, y `line`, `process` y `tasting_notes` llenos.
4. Search & Discovery: añadir los filtros Process y Tier.
5. Shopify Subscriptions: planes con el 10% de descuento del diseño.
6. Colección `bestsellers` (la del mockup) y las de cada línea.
