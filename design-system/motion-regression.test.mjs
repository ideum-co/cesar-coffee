import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

if (!process.env.CESAR_TEST_DEPS) throw new Error('Set CESAR_TEST_DEPS to the test dependencies directory.');
const { Window } = await import(pathToFileURL(resolve(process.env.CESAR_TEST_DEPS, 'happy-dom/lib/index.js')));

function page(t, markup, assets = [], reduced = false) {
  const w = new Window({ settings: { device: { prefersReducedMotion: reduced ? 'reduce' : 'no-preference' } } });
  t.after(() => w.happyDOM.close());
  for (const asset of ['cesar-tokens.css', ...assets]) {
    const style = w.document.createElement('style');
    style.textContent = readFileSync(`assets/${asset}`, 'utf8');
    w.document.head.append(style);
  }
  w.document.body.innerHTML = markup;
  return w;
}

function boot(w, asset) {
  w.eval(readFileSync(`assets/${asset}`, 'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
}

test('section reveals finish within 600ms rather than holding content for 900ms', (t) => {
  const w = page(t, '<div data-cesar-reveal="fade-up"></div>', ['cesar-motion.css']);
  w.document.documentElement.classList.add('cesar-motion');
  const transition = w.getComputedStyle(w.document.querySelector('div')).transition;
  const durations = [...transition.matchAll(/\b(\d*\.?\d+)(ms|s)\b/g)].map((match) => Number(match[1]) * (match[2] === 's' ? 1000 : 1));
  assert.ok(durations.length >= 2);
  assert.ok(durations.every((duration) => duration <= 600));
});

test('long card lists do not accumulate more than 240ms of stagger delay', (t) => {
  const w = page(t, '<div data-cesar-reveal="fade-up" data-cesar-reveal-i="12"></div>');
  boot(w, 'cesar-motion.js');
  const delay = parseFloat(w.document.querySelector('div').style.getPropertyValue('--cesar-reveal-delay'));
  assert.ok(delay <= 240, `Unexpected reveal delay: ${delay}ms`);
});

test('keyboard focus immediately reveals a hidden animation ancestor', (t) => {
  const w = page(t, '<div data-cesar-reveal="fade-up"><a href="#product">Shop</a></div>', ['cesar-motion.css']);
  boot(w, 'cesar-motion.js');
  w.document.querySelector('a').focus();
  assert.equal(w.getComputedStyle(w.document.querySelector('div')).opacity, '1');
});

test('reduced motion CSS keeps content visible even if the motion boot class is present', (t) => {
  const w = page(t, '<div data-cesar-reveal="fade-up"></div>', ['cesar-motion.css'], true);
  w.document.documentElement.classList.add('cesar-motion');
  const css = w.getComputedStyle(w.document.querySelector('div'));
  assert.equal(css.opacity, '1');
  assert.equal(css.transform, 'none');
});

function rail(t, reduced) {
  const w = page(t, '<cesar-filter-rail><button data-rail-prev>Previous</button><div class="facets__wrapper"></div><button data-rail-next>Next</button></cesar-filter-rail>', [], reduced);
  const calls = [];
  w.document.querySelector('.facets__wrapper').scrollBy = (options) => calls.push(options);
  boot(w, 'cesar-filter-rail.js');
  return { w, calls, element: w.document.querySelector('cesar-filter-rail') };
}

test('filter arrows scroll instantly when reduced motion is requested', (t) => {
  const { element, calls } = rail(t, true);
  element.desplazar(1);
  assert.equal(calls.at(-1).behavior, 'instant');
  assert.equal(calls.at(-1).left, 200);
});

test('reconnecting a filter rail does not multiply its arrow click handlers', (t) => {
  const { w, element, calls } = rail(t, false);
  element.remove();
  w.document.body.append(element);
  element.querySelector('[data-rail-next]').click();
  assert.equal(calls.length, 1);
});

function stories(t, reduced = false) {
  const markup = `<cesar-story-cards class="cesar-story" data-more="See more" data-less="Currently reading"><div class="cesar-story__track">${[0, 1, 2].map((i) => `<article data-story-card class="cesar-story__card${i === 0 ? ' is-open' : ''}"><div class="cesar-story__body">Long story ${i}</div><p class="cesar-story__preview">Excerpt</p><button class="cesar-story__toggle" data-story-toggle aria-expanded="${i === 0}"><span data-story-label>See more</span><span>+</span></button></article>`).join('')}</div><div class="cesar-story__navigation"><button data-story-direction="-1">Previous</button><button data-story-direction="1">Next</button></div></cesar-story-cards>`;
  const w = page(t, markup, ['cesar-story-cards.css'], reduced);
  const calls = [];
  w.document.querySelector('.cesar-story__track').scrollTo = (options) => calls.push(options);
  return { w, calls };
}

test('story text remains readable without JavaScript and dead controls are hidden', (t) => {
  const { w } = stories(t);
  const closed = w.document.querySelectorAll('[data-story-card]')[1];
  assert.notEqual(w.getComputedStyle(closed.querySelector('.cesar-story__body')).display, 'none');
  assert.equal(w.getComputedStyle(closed.querySelector('[data-story-toggle]')).display, 'none');
});

test('story carousel realigns after its width transition reaches the final geometry', (t) => {
  const { w, calls } = stories(t);
  const cards = w.document.querySelectorAll('[data-story-card]');
  let position = 120;
  Object.defineProperty(cards[1], 'offsetLeft', { get: () => position });
  boot(w, 'cesar-story-cards.js');
  cards[1].querySelector('button').click();
  position = 360;
  const event = new w.Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', { value: 'flex-basis' });
  cards[1].dispatchEvent(event);
  assert.equal(calls.at(-1).left, 360);
  assert.equal(cards[0].classList.contains('is-open'), false);
  assert.equal(cards[1].querySelector('button').getAttribute('aria-expanded'), 'true');
});

test('story opening is instantaneous under reduced motion', (t) => {
  const { w, calls } = stories(t, true);
  boot(w, 'cesar-story-cards.js');
  w.document.querySelectorAll('[data-story-card]')[1].querySelector('button').click();
  assert.equal(calls.at(-1).behavior, 'instant');
});

test('CTA transitions name visual properties instead of animating layout with all', (t) => {
  const w = page(t, '<button class="cc-btn">Shop</button><button class="button">Send</button>');
  for (const button of w.document.querySelectorAll('button')) {
    assert.ok(!/\ball\b/.test(w.getComputedStyle(button).transition));
  }
});

test('reduced motion disables CTA transitions', (t) => {
  const w = page(t, '<button class="cc-btn">Shop</button>', [], true);
  assert.equal(w.getComputedStyle(w.document.querySelector('button')).transition, 'none');
});
