import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

if (!process.env.CESAR_TEST_DEPS) throw new Error('Set CESAR_TEST_DEPS to the test dependencies directory.');
const { Window } = await import(pathToFileURL(resolve(process.env.CESAR_TEST_DEPS, 'happy-dom/lib/index.js')));

function fixture(markup, assets = [], width = 1440) {
  const window = new Window({ width, height: 900 });
  const reset = window.document.createElement('style');
  reset.textContent = ':root { --font-body-scale:1; --inputs-border-width:1px; } *, *::before, *::after { box-sizing:inherit; } html { box-sizing:border-box; font-size:62.5%; }';
  window.document.head.append(reset);
  for (const asset of ['base.css', 'cesar-tokens.css', ...assets]) {
    const style = window.document.createElement('style');
    style.textContent = readFileSync(`assets/${asset}`, 'utf8');
    window.document.head.append(style);
  }
  window.document.body.innerHTML = markup;
  return (selector) => window.getComputedStyle(window.document.querySelector(selector));
}

test('brand and native CTAs share a 44px minimum without changing their 16px type', () => {
  const css = fixture('<a class="cc-btn">Shop</a><button class="button">Shop</button>');
  assert.equal(css('.cc-btn').minHeight, '44px');
  assert.equal(css('.button').minHeight, '44px');
  assert.equal(css('.cc-btn').fontSize, '16px');
  assert.equal(css('.cc-btn').boxSizing, 'border-box');
  assert.equal(css('.button').boxSizing, 'border-box');
});

test('search input and submit use the same 44px control height', () => {
  const css = fixture('<div class="search-modal__content"><form class="search search-modal__form"><div class="field"><input class="search__input field__input"><button class="search__button field__button">Search</button></div></form></div>', ['cesar-search.css', 'component-search.css']);
  assert.equal(css('.search__input').height, '44px');
  assert.equal(css('.search__button').height, '44px');
});

test('contact fields and submit share the 48px form minimum', () => {
  const css = fixture('<div class="cesar-contact"><input class="field__input"><select class="select__select"></select><button class="cesar-contact__submit">Send</button></div>', ['cesar-contact.css']);
  assert.equal(css('.field__input').minHeight, '48px');
  assert.equal(css('.select__select').minHeight, '48px');
  assert.equal(css('.cesar-contact__submit').minHeight, '48px');
});

test('newsletter input and submit share 48px form minimum and 16px action text', () => {
  const css = fixture('<input class="cesar-newsletter__input"><button class="cesar-newsletter__button">Subscribe</button>', ['cesar-footer.css']);
  assert.equal(css('input').minHeight, '48px');
  assert.equal(css('button').minHeight, '48px');
  assert.equal(css('button').fontSize, '16px');
});

test('PDP buy controls retain their matched height and support a merchant override', () => {
  for (const [style, expected] of [['', '56px'], ['--cesar-buy-height:64px', '64px']]) {
    const css = fixture(`<div class="product__info-container" style="${style}"><div class="product-form__quantity"><div class="quantity"></div></div><div class="cesar-buybox"><button class="button product-form__submit">Add to cart</button></div></div>`, ['cesar-product.css']);
    assert.equal(css('.quantity').height, expected);
    assert.equal(css('.product-form__submit').height, expected);
  }
});

test('shared editorial headings have readable leading while the hero keeps its display treatment', () => {
  const css = fixture('<h2 class="cc-h2">Long heading</h2><h2 class="h1">Native heading</h2><h1 class="cc-display">Hero</h1><p class="cc-body">Body</p>');
  assert.equal(css('.cc-h2').lineHeight, '1.1');
  assert.equal(css('.h1').lineHeight, '1.1');
  assert.equal(css('.cc-display').lineHeight, '0.9');
  assert.equal(css('.cc-body').lineHeight, '1.55');
});

test('shared section rhythm remains 96px on desktop and 56px on mobile', () => {
  assert.equal(fixture('<section class="cc-section"></section>')('section').paddingBlock, '96px');
  assert.equal(fixture('<section class="cc-section"></section>', [], 390)('section').paddingBlock, '56px');
});

test('product card keeps its approved height and title size', () => {
  const css = fixture('<div class="card-wrapper product-card-wrapper"><div class="card"><h3 class="card__heading">Coffee</h3></div></div>', ['cesar-product-card.css']);
  assert.equal(css('.card').height, '413px');
  assert.equal(css('.card__heading').fontSize, '14px');
});

test('contact textarea retains its native multiline minimum instead of becoming a 48px field', () => {
  const markup = '<div class="cesar-contact"><textarea class="text-area field__input"></textarea></div>';
  const baseline = fixture(markup, ['section-contact-form.css']);
  const changed = fixture(markup, ['section-contact-form.css', 'cesar-contact.css']);
  assert.equal(changed('textarea').minHeight, baseline('textarea').minHeight);
  assert.equal(changed('textarea').height, baseline('textarea').height);
  assert.notEqual(changed('textarea').minHeight, '48px');
});

test('card subsection heading retains its approved weight and leading', () => {
  const css = fixture('<h3 class="cc-h3">Coffee story</h3>');
  assert.equal(css('h3').fontWeight, '700');
  assert.equal(css('h3').lineHeight, '1.2');
});

test('tiers and editorial cards share a 32px heading-to-content gap', () => {
  const css = fixture('<div class="cesar-tiers__header"></div><h2 class="cesar-cards__heading">Cards</h2>', ['cesar-tiers.css', 'cesar-cards.css']);
  assert.equal(css('.cesar-tiers__header').marginBottom, '32px');
  assert.equal(css('.cesar-cards__heading').marginBottom, '32px');
});

test('merchant PDP heading size and text colour still take precedence', () => {
  const css = fixture('<div class="cesar-sec product__info-container" style="--cesar-sec-heading-size:46px;--cesar-sec-heading:#558066"><div class="product__title"><h1>Custom title</h1></div></div>', ['cesar-product.css']);
  assert.equal(css('h1').fontSize, '46px');
  assert.equal(css('h1').color, '#558066');
});
