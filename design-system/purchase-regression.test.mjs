import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

const dependencies = process.env.CESAR_TEST_DEPS;
if (!dependencies) throw new Error('Set CESAR_TEST_DEPS to a directory containing liquidjs and happy-dom.');
const { Liquid } = await import(pathToFileURL(resolve(dependencies, 'liquidjs/dist/liquid.node.mjs')));
const { Window } = await import(pathToFileURL(resolve(dependencies, 'happy-dom/lib/index.js')));
const engine = new Liquid({ root: resolve('snippets'), extname: '.liquid' });
const messages = {
  'products.product.choose_options': 'Choose options',
  'products.product.add_to_cart': 'Add to cart',
  'products.product.sold_out': 'Sold out',
};
engine.registerFilter('t', (key) => messages[key] || key);
engine.registerFilter('money', (price) => `$${(price / 100).toFixed(2)}`);
engine.registerFilter('inline_asset_content', () => '');

async function render(name, context) {
  const source = readFileSync(`snippets/${name}.liquid`, 'utf8')
    .replace(/{%-?\s*form\s[^%]*%}/g, '<form>')
    .replace(/{%-?\s*endform\s*-?%}/g, '</form>');
  const window = new Window();
  window.document.body.innerHTML = await engine.parseAndRender(source, context);
  return window;
}

function product(overrides = {}) {
  return {
    id: 101, title: 'Test coffee', url: '/products/test-coffee', available: true,
    options_with_values: [{ name: 'Size', position: 1, values: ['250 g', '1 kg'] }],
    variants: [
      { id: 11, available: true, options: ['250 g'] },
      { id: 12, available: true, options: ['1 kg'] },
    ],
    selected_or_first_available_variant: { id: 11 }, media: [], ...overrides,
  };
}

test('quick purchase controls are not inside an aria-hidden region', async () => {
  const w = await render('cesar-card-hover', { card_product: product(), section_id: 'home' });
  assert.ok(!w.document.querySelector('[data-submit]').closest('[aria-hidden="true"]'), 'Purchase controls must be exposed to assistive technology');
});

test('products with size and grind lead to PDP instead of silently choosing grind', async () => {
  const p = product({ options_with_values: [
    { name: 'Size', position: 1, values: ['250 g', '1 kg'] },
    { name: 'Grind', position: 2, values: ['Whole beans', 'Filter'] },
  ] });
  const w = await render('cesar-card-hover', { card_product: p, section_id: 'home' });
  const link = w.document.querySelector('.cesar-pcard__submit[href]');
  assert.ok(link, 'Multi-option coffee must have a Choose options link');
  assert.equal(link.getAttribute('href'), '/products/test-coffee');
  assert.ok(!w.document.querySelector('form'), 'Multi-option card must not submit a default variant');
});

test('subscription-only products cannot be added without choosing a selling plan', async () => {
  const w = await render('cesar-card-hover', { card_product: product({ requires_selling_plan: true }), section_id: 'home' });
  assert.ok(!w.document.querySelector('form'), 'A selling plan must be selected on PDP first');
  assert.ok(w.document.querySelector('a[href="/products/test-coffee"]'));
});

test('single-option cards still enable Add to cart for the exact selected variant', async () => {
  const w = await render('cesar-card-hover', { card_product: product(), section_id: 'home' });
  w.eval(readFileSync('assets/cesar-card-picker.js', 'utf8'));
  const radio = w.document.querySelector('input[data-variant="12"]');
  radio.checked = true;
  radio.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(w.document.querySelector('[data-variant-id]').value, '12');
  assert.equal(w.document.querySelector('[data-submit]').disabled, false);
  assert.equal(w.document.querySelector('[data-submit] span').textContent, 'Add to cart');
});

test('sold-out products never offer an enabled quick purchase', async () => {
  const w = await render('cesar-card-hover', { card_product: product({ available: false }), section_id: 'home' });
  assert.equal(w.document.querySelector('[data-submit]').disabled, true);
});

function purchaseContext(allocations = []) {
  return {
    product: { selected_or_first_available_variant: { price: 4200, selling_plan_allocations: allocations } },
    section_id: 'main', product_form_id: 'product-form-main',
    block: { id: 'purchase', settings: { one_time_label: 'One-time purchase', subscribe_label: 'Subscribe' } },
  };
}

test('subscription component remains available to receive a variant that gains plans', async () => {
  const w = await render('cesar-purchase-options', purchaseContext());
  assert.ok(w.document.querySelector('cesar-purchase-options'));
  assert.equal(w.document.querySelector('cesar-purchase-options').hidden, true);
});

test('variant changes replace stale subscription prices and preserve a compatible chosen plan', async () => {
  const allocation = { price: 3800, compare_at_price: 4200, selling_plan: { id: 7, name: 'Monthly' } };
  const w = await render('cesar-purchase-options', purchaseContext([allocation]));
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8') + '\nwindow.testPublish = publish;');
  const component = w.document.querySelector('cesar-purchase-options');
  const subscription = component.querySelector('input[data-plan="7"]');
  subscription.checked = true;
  subscription.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(component.querySelector('[data-selling-plan]').value, '7', 'Selecting subscription must populate the submitted plan');
  const updated = await render('cesar-purchase-options', purchaseContext([{ ...allocation, price: 7200 }]));
  await w.testPublish('variant-change', { data: { sectionId: 'main', variant: { id: 12 }, html: updated.document } });
  assert.equal(component.querySelector('[data-sub-price]').textContent, '$72.00');
  assert.equal(component.querySelector('[data-selling-plan]').value, '7');
});

test('a variant without plans removes the previous selling plan from submission', async () => {
  const allocation = { price: 3800, selling_plan: { id: 7 } };
  const w = await render('cesar-purchase-options', purchaseContext([allocation]));
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8') + '\nwindow.testPublish = publish;');
  const component = w.document.querySelector('cesar-purchase-options');
  const sub = component.querySelector('[data-plan="7"]');
  sub.checked = true;
  sub.dispatchEvent(new w.Event('change', { bubbles: true }));
  const updated = await render('cesar-purchase-options', purchaseContext());
  await w.testPublish('variant-change', { data: { sectionId: 'main', variant: { id: 13 }, html: updated.document } });
  assert.ok(!component.querySelector('[name="selling_plan"]'), 'Stale selling plan input must be removed');
  assert.equal(component.hidden, true);
});

test('a newly selected variant can reveal plans when the initial variant had none', async () => {
  const w = await render('cesar-purchase-options', purchaseContext());
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8') + '\nwindow.testPublish = publish;');
  const component = w.document.querySelector('cesar-purchase-options');
  const updated = await render('cesar-purchase-options', purchaseContext([{ price: 3800, selling_plan: { id: 7 } }]));
  await w.testPublish('variant-change', { data: { sectionId: 'main', variant: { id: 14 }, html: updated.document } });
  assert.equal(component.hidden, false);
  assert.equal(component.querySelector('[data-sub-price]').textContent, '$38.00');
  assert.equal(component.querySelector('[data-selling-plan]').value, '');
});

test('subscription-only products do not offer a one-time purchase', async () => {
  const context = purchaseContext([{ price: 3800, selling_plan: { id: 7 } }]);
  context.product.requires_selling_plan = true;
  const w = await render('cesar-purchase-options', context);
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8'));
  assert.ok(!w.document.querySelector('input[data-plan=""]'));
  assert.equal(w.document.querySelector('[data-selling-plan]').value, '7');
});

test('a removed plan resets to one-time instead of selecting a different subscription', async () => {
  const w = await render('cesar-purchase-options', purchaseContext([{ price: 3800, selling_plan: { id: 7 } }]));
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8') + '\nwindow.testPublish = publish;');
  const component = w.document.querySelector('cesar-purchase-options');
  const radio = component.querySelector('[data-plan="7"]');
  radio.checked = true;
  radio.dispatchEvent(new w.Event('change', { bubbles: true }));
  const updated = await render('cesar-purchase-options', purchaseContext([{ price: 3500, selling_plan: { id: 9 } }]));
  await w.testPublish('variant-change', { data: { sectionId: 'main', variant: { id: 15 }, html: updated.document } });
  assert.equal(component.querySelector('[data-selling-plan]').value, '');
  assert.equal(component.querySelector('input[data-plan=""]').checked, true);
});

test('a variant update from another product section cannot change the purchase selection', async () => {
  const w = await render('cesar-purchase-options', purchaseContext([{ price: 3800, selling_plan: { id: 7 } }]));
  w.eval(readFileSync('assets/constants.js', 'utf8') + '\n' + readFileSync('assets/pubsub.js', 'utf8') + '\n' + readFileSync('assets/cesar-purchase-options.js', 'utf8') + '\nwindow.testPublish = publish;');
  const updated = await render('cesar-purchase-options', purchaseContext());
  await w.testPublish('variant-change', { data: { sectionId: 'other-product', variant: { id: 13 }, html: updated.document } });
  assert.equal(w.document.querySelector('[data-sub-price]').textContent, '$38.00');
});
