# Modelo de datos — Cesar's Coffee Cup

Qué crear en Shopify para que el diseño funcione. Cada campo sale de algo
concreto: los badges de línea, los filtros de la colección o los bloques de la
PDP.

Todo va en el namespace **`cesar`**.

---

## Resumen: qué es qué

| Dato | Dónde vive | Por qué |
|---|---|---|
| Size (100g, 250g…) | **Opción de variante** | Cambia precio e inventario. No es un metafield. |
| Línea (Green/Silver/Gold) | **Metaobjeto** + referencia | Vocabulario cerrado. Lleva su badge y su color. |
| Proceso (Washed, Natural…) | **Metaobjeto** + referencia | Vocabulario cerrado. Lleva su descripción para la PDP. |
| Notas de cata | **Metaobjeto** + lista de referencias | Se repiten entre productos; conviene que estén escritas igual. |
| Finca | **Metaobjeto** + referencia | Tiene entidad propia: foto, productor, historia. |
| Origen, varietal, altitud | Metafields de texto | Son texto libre por producto. |

**Regla:** si un valor se repite entre productos y no quieres que nadie lo
escriba con una variante distinta, va en metaobjeto. Si es propio de un solo
producto, va en metafield de texto.

Un `single_line_text_field` con "Washed" y otro con "washed " (con espacio) son
dos filtros distintos en la tienda. Con metaobjetos eso no puede pasar.

---

## 1. Opciones de variante

| Opción | Valores |
|---|---|
| **Size** | `100g`, `250g`, `500g`, `1kg` |
| **Grind** *(opcional)* | `Whole bean`, `Espresso`, `Filter`, `Plunger` |

El Flight del diseño (`4 × 100g`) es **un valor más de Size**, no un producto
aparte. Así entra solo en el filtro de tamaño.

Shopify genera el filtro *Size* automáticamente a partir de la opción. No hay
que hacer nada más.

---

## 2. Metaobjetos

Crear en **Configuración → Metaobjetos → Añadir definición**.
En cada uno hay que marcar **"Storefront access"** (acceso desde la tienda) o el
tema no podrá leerlos.

### 2.1 `coffee_line` — la línea

Tres entradas: Green, Silver, Gold.

| Campo | Tipo | Ejemplo |
|---|---|---|
| `name` | Single line text | `Green Line` |
| `handle` | *(el del propio metaobjeto)* | `green` |
| `badge` | File reference (imagen) | `cesar-badge-green-line.svg` |
| `color` | Color | `#3E5F49` |
| `description` | Multi line text | `Everyday espresso, always on.` |
| `position` | Integer | `1` (ordena las tres en la web) |

**Handles exactos:** `green`, `silver`, `gold`. El snippet
`cesar-line-badge.liquid` los usa para elegir el badge.

### 2.2 `process` — el proceso

Cuatro entradas.

| Campo | Tipo | Ejemplo |
|---|---|---|
| `name` | Single line text | `Washed` |
| `description` | Multi line text | `Limpio y floral.` |
| `position` | Integer | `1` |

Entradas: `washed`, `natural`, `honey`, `anaerobic`.

### 2.3 `tasting_note` — nota de cata

Una entrada por nota. Se empieza con las del diseño y se amplía según el
catálogo.

| Campo | Tipo | Ejemplo |
|---|---|---|
| `name` | Single line text | `Milk chocolate` |

Iniciales: `milk-chocolate`, `toffee`, `red-apple`, `caramel`, `citrus`,
`stone-fruit`, `berry`, `nutty`, `floral`.

### 2.4 `farm` — la finca

Alimenta "See Our Farms" y el bloque de origen.

| Campo | Tipo |
|---|---|
| `name` | Single line text |
| `producer` | Single line text |
| `region` | Single line text |
| `altitude` | Single line text |
| `photo` | File reference (imagen) |
| `story` | Multi line text |

---

## 3. Metafields de producto

Crear en **Configuración → Metafields y metaobjetos → Productos**.

| Namespace y clave | Tipo | Filtrable | Uso |
|---|---|---|---|
| `cesar.line` | Metaobject reference → `coffee_line` | **Sí** (*Tier*) | Badge de la card y de la PDP |
| `cesar.process` | Metaobject reference → `process` | **Sí** (*Process*) | Filtro y ficha de la PDP |
| `cesar.tasting_notes` | **List of** metaobject references → `tasting_note` | Opcional | Línea bajo el título de la card |
| `cesar.farm` | Metaobject reference → `farm` | No | Bloque "See Our Farms" |
| `cesar.origin` | Single line text | No | `Cauca, Colombia` |
| `cesar.varietal` | Single line text | No | `Bourbon Rosado` |
| `cesar.altitude` | Single line text | No | `1.750–1.900 msnm` |
| `cesar.roast_profile` | Single line text | Sí | `Espresso` / `Filter` |

En todos: **marcar "Storefront access"**.

---

## 4. Cómo se convierten en filtros

El diseño muestra: **Sort by · Process · Price · Tier · Size · Availability ·
Available for Subscription**.

| Filtro | De dónde sale | Hay que hacer algo |
|---|---|---|
| Sort by | Nativo | No |
| Price | Nativo | No |
| Availability | Nativo | No |
| Size | Opción de variante | No |
| **Process** | `cesar.process` | **Sí, ver abajo** |
| **Tier** | `cesar.line` | **Sí, ver abajo** |
| Available for Subscription | Shopify Subscriptions | Crear los planes |

Para Process y Tier:

1. Instalar la app **Search & Discovery** (gratuita, de Shopify).
2. Search & Discovery → **Filters** → **Add filter** → elegir el metafield.
3. Renombrar la etiqueta a *Process* y *Tier* (es lo que ve el cliente).

**Los metafields por sí solos no crean filtros.** Sin ese paso existen y el tema
los lee, pero no aparecen en la colección.

> Comprobar al llegar aquí: si Search & Discovery no ofreciera los metafields de
> tipo *metaobject reference* como filtro, la alternativa es cambiar
> `cesar.line` y `cesar.process` a `single_line_text_field` con los mismos
> valores. Se pierde el vocabulario cerrado, pero el filtro funciona igual. El
> resto del modelo no cambia.

---

## 5. Orden de carga

1. Metaobjetos: `coffee_line`, `process`, `tasting_note`, `farm`.
2. Sus entradas (3 líneas, 4 procesos, las notas, las fincas).
3. Definiciones de metafield de producto.
4. Productos, con Size como opción y `line`, `process` y `tasting_notes` llenos.
5. Search & Discovery: añadir los filtros Process y Tier.
6. Shopify Subscriptions: planes con el 10% del diseño.
7. Colecciones: `bestsellers` (la del mockup) y una por línea.

---

## 6. Qué hace el tema con esto

- `snippets/cesar-line-badge.liquid` lee `cesar.line` y pinta el badge. Acepta
  tanto la referencia a metaobjeto como texto plano, y como último recurso las
  etiquetas `green-line` / `silver-line` / `gold-line`, por si se carga catálogo
  antes de tener los metaobjetos.
- Si un producto no tiene línea, **no se pinta badge**. No falla.
- Las notas de cata salen bajo el título de la card, separadas por `·`.
