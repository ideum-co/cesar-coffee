# Purchase regression checks

## Automated checks

The regression suite renders the real Liquid purchase snippets with LiquidJS
and runs the real custom elements in Happy DOM. Shopify-only form tags are
replaced with ordinary form elements by the test adapter. This does not test
Shopify's form endpoint, selling-plan enforcement, checkout or app blocks.

Test dependencies are development-only and must not be added to theme assets.
Install `liquidjs@10.30.1` and `happy-dom@21.0.4` in a temporary directory
(tested with Node 24), then run from the
theme root:

```sh
CESAR_TEST_DEPS=/absolute/path/to/test/node_modules node --test design-system/purchase-regression.test.mjs
python3 design-system/validate-templates.py
shopify theme check --fail-level error
```

## Shopify browser verification still required

- Single-option coffee: choose each available size and verify its variant in cart.
- Size plus grind: Choose options leads to PDP without adding a default grind.
- Sold-out coffee: no enabled purchase control.
- Keyboard: focus the product title, then reach sizes and purchase controls.
- Repeat a product in Featured collection and recommendations; verify unique IDs.
- Enable the custom subscription block only on a development product/template.
- Switch sizes with different subscription prices and verify the displayed price.
- Keep a compatible selected frequency across variant changes.
- Change to a variant without that plan; verify one-time purchase is selected.
- Start with no plans, then change to a variant with plans; verify controls appear.
- Subscription-only coffee: no one-time purchase, and cart receives a selling plan.
- Verify cart drawer, quantity, rejected additions and return focus on mobile/desktop.

No subscription app block or merchant template is enabled by this changeset.
