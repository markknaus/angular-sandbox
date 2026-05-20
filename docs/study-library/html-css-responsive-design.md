# HTML, CSS & Responsive Design
### A Senior Developer's Complete Reference

> Semantic HTML, CSS Flexbox, CSS Grid, custom properties, responsive design, container queries, CSS animations, UI/UX principles, and Figma for developers

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Why the Web Platform Matters for Angular Developers](#why-the-web-platform-matters-for-angular-developers)
- [Semantic HTML](#semantic-html)
  - [Document Structure Elements](#document-structure-elements)
  - [Heading Hierarchy — The Page Outline](#heading-hierarchy--the-page-outline)
  - [Interactive Elements — Buttons vs Links vs Custom Controls](#interactive-elements--buttons-vs-links-vs-custom-controls)
  - [Forms — Accessible Markup That Works With Angular](#forms--accessible-markup-that-works-with-angular)
  - [Tables](#tables)
  - [HTML Attributes vs DOM Properties](#html-attributes-vs-dom-properties)
- [CSS Flexbox — Complete Mastery](#css-flexbox--complete-mastery)
  - [The Flexbox Formatting Context](#the-flexbox-formatting-context)
  - [Container Properties](#container-properties)
  - [Item Properties](#item-properties)
- [CSS Grid — Complete Mastery](#css-grid--complete-mastery)
  - [Grid vs Flexbox — The Decision Framework](#grid-vs-flexbox--the-decision-framework)
  - [Container Properties](#container-properties)
  - [Item Properties](#item-properties)
- [CSS Custom Properties (Variables)](#css-custom-properties-variables)
- [Responsive Design](#responsive-design)
  - [Mobile-First — The Correct Mental Model](#mobile-first--the-correct-mental-model)
  - [CSS Units — When to Use Each](#css-units--when-to-use-each)
  - [Container Queries — Component-Level Responsiveness](#container-queries--component-level-responsiveness)
- [CSS Animations and Transitions](#css-animations-and-transitions)
- [The Cascade, Specificity, and Inheritance](#the-cascade-specificity-and-inheritance)
- [UI/UX Design Principles for Developers](#uiux-design-principles-for-developers)
- [Figma for Developers](#figma-for-developers)


## Why the Web Platform Matters for Angular Developers

Angular renders HTML. Every component you write produces a fragment of the document. The quality of your application's markup, visual design, responsiveness, and — critically — accessibility is a direct function of how well you understand the web platform itself. Senior Angular roles increasingly require engineers who own the full quality bar: semantic structure, responsive behaviour, and WCAG compliance. Angular itself does not enforce semantic markup or correct CSS — the engineer does. Every template you write is a semantic decision.

---

## Semantic HTML

Semantic HTML is HTML where element choice communicates the meaning and purpose of content, not just its appearance. A `<nav>` and a `<div class="nav">` might look identical on screen, but they carry vastly different information to browsers, screen readers, search engines, and automated testing tools.

Screen readers (VoiceOver, NVDA, JAWS) expose semantic information to blind or low-vision users. A page with correct landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`) allows a screen reader user to jump directly to the main content or any landmark — without reading every word. A page built entirely from divs forces linear reading from top to bottom every time.

Search engines use semantic elements and heading hierarchies to understand page structure. Automated accessibility tools (axe-core, Lighthouse, WAVE) check semantic correctness — missing alt text, inputs without labels, heading order violations, missing `lang` attributes.

### Document Structure Elements

- **`<html lang="en">`** — the `lang` attribute tells screen readers and translation tools the page language. Use IETF tags: `en`, `en-US`, `fr`, `de`, `ja`. WCAG 3.1.1 (Level A) requires this. In Angular: set in `index.html`. For multilingual apps: `inject(DOCUMENT).documentElement.lang = 'fr'`.
- **`<title>`** — page title in browser tabs and announced by screen readers on page load. WCAG 2.4.2 (Level A) requires descriptive titles. Angular: update dynamically using the `Title` service. Pattern: `inject(Title).setTitle(pageName + ' — ' + appName)`.
- **`<main>`** — primary unique content of the page. One per page. In Angular: your shell component's `<router-outlet>` should be inside `<main>`.
- **`<header>`** — introductory content for the page (logo, site name, primary nav) or for a sectioning element. Multiple `<header>` elements are valid in different sectioning contexts.
- **`<footer>`** — supplementary content: copyright, legal links, contact info. Multiple footers are valid.
- **`<nav>`** — major navigation sections. Label multiple navs: `<nav aria-label="Primary">` and `<nav aria-label="Breadcrumb">`. Do not use for every group of links.
- **`<article>`** — self-contained content that makes sense independently: blog post, news story, product listing, user comment. Should have a heading.
- **`<section>`** — thematic grouping within a document. Should have a heading. Not a generic container — that's what `<div>` is for.
- **`<aside>`** — tangentially related content: sidebars, pull quotes, related articles. Announced as "complementary" by screen readers.
- **`<figure>` and `<figcaption>`** — wraps self-contained content referenced from the main flow: images, code samples, charts. `<figcaption>` provides a caption.

### Heading Hierarchy — The Page Outline

Headings (h1–h6) create the structural outline of your page. Screen reader users navigate by headings — pressing H to jump between them or 1–6 to jump to specific levels.

**Rules:** one `<h1>` per page, describing the page's primary topic. Never skip levels — `h2` subsections use `h3`, not `h4`. Do not choose heading levels for visual size — use CSS for that.

**Angular implications:** each lazy-loaded route represents a new "page". The route's content should begin with an `h1`. The `Title` service should reflect the route. When a modal opens, its heading should be `h2` and focus should move to it.

```html
<!-- Wrong: headings chosen for visual appearance, levels skipped -->
<h3>User Management</h3>
<h5>Active Users</h5>

<!-- Right: headings reflect semantic hierarchy -->
<h1>User Management</h1>
  <h2>Active Users</h2>
    <h3>Administrators</h3>
    <h3>Editors</h3>
  <h2>Pending Invitations</h2>
```

### Interactive Elements — Buttons vs Links vs Custom Controls

The most common accessibility mistake in Angular applications is using the wrong element for interactions.

**`<button>` — for actions:** any action that does not navigate to a new URL: submit form, toggle panel, open modal, delete item, add to cart. Native buttons are keyboard-focusable by default, fire click on Enter and Space, announce "button" to screen readers, support `disabled` correctly. Use `type="button"` to prevent accidental form submission.

**`<a href="...">` — for navigation:** any navigation to a URL (internal or external). Angular's `routerLink` generates proper `<a>` elements. `href` is required — `<a>` without `href` is not keyboard-focusable and announces as "text" not "link".

**Never `<div>` or `<span>` for interactions:** divs and spans have no implicit role, no keyboard focus, no Enter/Space handling. Adding `tabindex="0"` makes them focusable but you must manually add all keyboard handlers. Adding `role="button"` announces it as a button but you still must handle Enter/Space. There is essentially never a valid reason to use a div for a button.

```html
<!-- Wrong — these miss keyboard, role, and state semantics -->
<div (click)="delete()">Delete</div>
<a href="#" (click)="openModal($event)">Open</a>

<!-- Right — native elements with full semantics -->
<button type="button" (click)="delete()" [disabled]="isDeleting">
  Delete
</button>
<button type="button"
        [attr.aria-pressed]="isActive"
        (click)="toggle()">
  {{ isActive ? 'Active' : 'Inactive' }}
</button>
<a routerLink="/users/123">View profile</a>
```

### Forms — Accessible Markup That Works With Angular

**`<label>` — always required:** every `<input>`, `<textarea>`, and `<select>` must have an accessible label. Two correct methods: (1) for/id pairing — `<label for="email">Email</label><input id="email" type="email">`. The `for` value must exactly match the input's `id`. (2) Wrapping — `<label>Email <input type="email"></label>`. The `placeholder` attribute is NOT a label replacement — it disappears when typing and has insufficient contrast in most browsers.

**`type` attribute:** much more than appearance. `type="email"` triggers email keyboard on mobile (shows @). `type="tel"` triggers numeric keypad. `type="number"` adds increment/decrement. `type="password"` masks and disables most autofill. `type="date"` shows native date picker. Always use the most specific type.

**`<fieldset>` and `<legend>`:** required for grouping related controls, especially radio buttons and checkboxes. Without `<legend>`, "Yes" and "No" radio buttons have no context. With it, screen readers announce "Are you a resident? Yes" and "Are you a resident? No".

**`autocomplete` attribute:** helps browser autofill. On personal data fields: `autocomplete="name"`, `"email"`, `"tel"`, `"street-address"`, `"current-password"`, `"one-time-code"`. WCAG 1.3.5 (AA) requires autocomplete on personal data fields.

```html
<!-- Complete accessible Angular reactive form field -->
<div class="field">
  <label [for]="fieldId">
    {{ label }}
    <span aria-hidden="true" *ngIf="required"> *</span>
    <span class="sr-only" *ngIf="required">(required)</span>
  </label>
  <input
    [id]="fieldId"
    [type]="type"
    [autocomplete]="autocomplete"
    [formControl]="control"
    [attr.aria-required]="required || null"
    [attr.aria-invalid]="control.invalid && control.touched ? 'true' : null"
    [attr.aria-describedby]="[hintId, errorId].filter(Boolean).join(' ') || null"
  />
  <p [id]="hintId" class="field__hint" *ngIf="hint">{{ hint }}</p>
  <p [id]="errorId"
     class="field__error"
     role="alert"
     *ngIf="control.invalid && control.touched">
    {{ errorMessage() }}
  </p>
</div>
```

### Tables

Tables display tabular data — rows and columns with a meaningful relationship. Do not use tables for layout.

```html
<table>
  <caption>Monthly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Revenue</th>
      <th scope="col">Orders</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$24,500</td>
      <td>142</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>$24,500</td>
      <td>142</td>
    </tr>
  </tfoot>
</table>
```

### HTML Attributes vs DOM Properties

This distinction is critical in Angular. HTML attributes are what you write in source HTML — they initialise DOM properties. DOM properties are the live values the browser works with. After page load, changing an attribute does not always change the property, and vice versa.

```typescript
// In Angular templates:
[value]="someExpression"    // binds to the DOM property
[attr.colspan]="2"         // binds to the HTML attribute (for attributes with no property)
[disabled]="isDisabled"    // boolean property — sets disabled=true or removes it
[class.active]="isActive"  // adds/removes 'active' class
[style.color]="textColor"  // sets style.color property
```

---

## CSS Flexbox — Complete Mastery

### The Flexbox Formatting Context

When you write `display: flex` on an element, you create a flex formatting context. The element becomes a **flex container**. Its **direct children** become flex items — critically, only direct children. A grandchild is not a flex item unless its parent is also a flex container.

The flex container controls layout along two axes. The **main axis** runs in the direction set by `flex-direction`. The **cross axis** is perpendicular. Every flex property operates on one of these axes.

With `flex-direction: row` (default), the main axis is horizontal. `justify-content` distributes items horizontally. `align-items` aligns items vertically.

With `flex-direction: column`, the main axis is vertical — all alignment properties rotate 90 degrees.

### Container Properties

**`display: flex | inline-flex`** — `flex` creates a block-level container (full width, new line). `inline-flex` creates an inline container (sized by content, flows with text).

**`flex-direction: row | row-reverse | column | column-reverse`** — sets the main axis direction. ⚠️ `row-reverse` and `column-reverse` reverse visual order WITHOUT changing DOM order — keyboard navigation and screen reader order mismatch visual order. An accessibility violation for meaningful content.

**`flex-wrap: nowrap | wrap | wrap-reverse`** — `nowrap` (default): all items on one line, shrink or overflow. `wrap`: items wrap to additional lines. Use `wrap` for responsive grids.

**`justify-content`** — distributes items along the main axis: `flex-start` (default), `flex-end`, `center`, `space-between` (equal space between items, edges flush), `space-around` (equal space on each side of every item), `space-evenly` (perfectly equal gaps including edges).

**`align-items`** — aligns items on the cross axis within each row: `stretch` (default — items fill cross-axis), `flex-start`, `flex-end`, `center`, `baseline` (text baselines align — essential for mixed-size nav items).

**`align-content`** — aligns multiple flex lines within the container's cross-axis space. Only has effect with `flex-wrap: wrap` AND multiple lines. Confused with `align-items`: `align-items` aligns items within a single line; `align-content` distributes the lines themselves.

**`gap / row-gap / column-gap`** — modern spacing between items, replaces margin hacks. `gap: 16px` sets both. `gap: 16px 8px` sets row-gap and column-gap separately. Applies between items, not at edges.

```css
/* Common Flexbox patterns */

/* Navbar */
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav__logo { margin-right: auto; }  /* pushes everything after it to the right */

/* Centred card */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
}

/* Sticky footer */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.layout__content { flex: 1; }  /* grows to fill available space */
```

### Item Properties

**`flex-grow: <number>`** — how much the item grows when there is leftover space. `0` (default): does not grow. `1`: takes one share of extra space. If one item has `flex-grow: 2` and another `flex-grow: 1`, the first gets twice as much extra space.

**`flex-shrink: <number>`** — how much the item shrinks when space is insufficient. `1` (default): shrinks proportionally. `0`: refuses to shrink — will overflow rather than compress.

**`flex-basis: <size>`** — the initial size of the item along the main axis before growing or shrinking. `auto` (default): size from width/height. `0`: start from nothing, then grow/shrink. `200px`, `30%`: explicit basis.

**`flex: <grow> <shrink> <basis>`** — shorthand. Common values: `flex: 1` = `flex: 1 1 0` (equal flexible distribution). `flex: none` = `flex: 0 0 auto` (rigid, no flex). `flex: auto` = `flex: 1 1 auto` (flexible, starts from content size).

**`align-self`** — overrides `align-items` for one specific item: `auto`, `flex-start`, `flex-end`, `center`, `stretch`, `baseline`.

**`order: <integer>`** — changes visual order without changing DOM order. Default: `0`. Lower numbers appear first. ⚠️ Same accessibility concern as `row-reverse`: keyboard and screen reader order mismatch.

---

## CSS Grid — Complete Mastery

### Grid vs Flexbox — The Decision Framework

**Use Grid when:** you control layout in two dimensions simultaneously. You know the structure before placing items. You're creating a page-level layout (header, sidebar, main, footer). You need items in one row to align with items in another row.

**Use Flexbox when:** you control layout in one dimension. You want items to determine their own size and the container adapts. You're laying out a nav bar, a row of buttons, or a card's internal structure.

Both tools are valid for many layouts. Prefer Flexbox for component internals, Grid for page-level structure. They can nest — a Grid item can be a Flex container.

### Container Properties

**`display: grid | inline-grid`** — creates the grid formatting context.

**`grid-template-columns`** — defines column tracks. `repeat(3, 1fr)` = three equal columns. `200px auto 200px` = fixed, flexible, fixed. `repeat(auto-fit, minmax(250px, 1fr))` = responsive columns (the most powerful single CSS pattern).

**`grid-template-rows`** — defines row tracks. `auto` rows size to content. `minmax(100px, auto)` = minimum 100px, grows with content.

**`grid-template-areas`** — named layout definition:
```css
.layout {
  grid-template-areas:
    "header header header"
    "sidebar main  main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

**`gap / row-gap / column-gap`** — spacing between grid tracks. Same syntax as Flexbox gap.

**`justify-items`** — aligns items within their cell horizontally: `start`, `end`, `center`, `stretch` (default).

**`align-items`** — aligns items within their cell vertically: `start`, `end`, `center`, `stretch` (default).

**`justify-content`** — distributes the entire grid within the container horizontally when tracks don't fill it: `start`, `end`, `center`, `space-between`, `space-around`, `space-evenly`.

**`align-content`** — distributes grid tracks within the container vertically.

### Item Properties

**`grid-column: <start> / <end>`** — places item from column line `<start>` to `<end>`. Lines numbered from 1. Negative values count from the right (`-1` = last line). `grid-column: 1 / -1` = full width. `grid-column: span 2` = span 2 columns from auto-placed position.

**`grid-row: <start> / <end>`** — same but for rows.

**`grid-area: <name>`** — assigns to a named area from `grid-template-areas`. Or shorthand: `grid-area: 2 / 1 / 4 / 3` (row-start / col-start / row-end / col-end).

**`justify-self / align-self`** — override `justify-items` / `align-items` for one item.

```css
/* The most powerful responsive pattern in CSS */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
/* auto-fit: collapses empty tracks so items expand to fill the row */
/* auto-fill: keeps empty tracks (items don't expand past their max) */
/* Result: 4 cols on desktop, 3 on medium, 2 on tablet, 1 on mobile — zero media queries */

/* Featured item spanning full width */
.card-grid__featured { grid-column: 1 / -1; }

/* Subgrid — align grandchildren to grandparent's grid */
.card {
  display: grid;
  grid-row: span 3;            /* span 3 parent rows */
  grid-template-rows: subgrid; /* inherit parent's row definitions */
}
/* All card footers align with each other regardless of card content length */
```

---

## CSS Custom Properties (Variables)

CSS custom properties enable design tokens, theming, and component-level customisation.

```css
/* Define at root for global access */
:root {
  /* Spacing scale */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;

  /* Typography */
  --font-xs:   clamp(0.75rem, 1.5vw, 0.875rem);
  --font-sm:   clamp(0.875rem, 2vw, 1rem);
  --font-base: clamp(1rem, 2.5vw, 1.125rem);
  --font-lg:   clamp(1.125rem, 3vw, 1.5rem);
  --font-xl:   clamp(1.5rem, 4vw, 2rem);

  /* Colours (light mode) */
  --color-primary:    #2E75B6;
  --color-surface:    #ffffff;
  --color-on-surface: #1a1a1a;
  --color-error:      #B91C1C;
  --color-success:    #15803D;

  /* Elevation */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.10);

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}

/* Dark mode via media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:    #1a1a2e;
    --color-on-surface: #e8e8f0;
  }
}

/* Or via class (user-controlled) */
[data-theme="dark"] {
  --color-surface:    #1a1a2e;
  --color-on-surface: #e8e8f0;
}

/* Component-level custom properties */
.button {
  --btn-bg: var(--color-primary);
  --btn-text: white;
  --btn-padding: var(--space-sm) var(--space-md);
  --btn-radius: var(--radius-md);

  background: var(--btn-bg);
  color: var(--btn-text);
  padding: var(--btn-padding);
  border-radius: var(--btn-radius);
}
/* Override for variants */
.button--danger { --btn-bg: var(--color-error); }
.button--large  { --btn-padding: var(--space-md) var(--space-lg); }

/* Angular: update via component host */
/* In component.ts: this.el.nativeElement.style.setProperty('--btn-bg', '#custom'); */
```

---

## Responsive Design

### Mobile-First — The Correct Mental Model

Mobile-first means writing base CSS for the smallest viewport and progressively enhancing with `min-width` media queries for larger viewports. This is the correct approach for modern development.

**Performance:** base styles load on every device. Mobile-first ensures the simplest styles are the base — no extra code downloaded and overridden for mobile users.

**Mindset:** mobile layouts are simpler. Starting with a single column and adding complexity for larger screens is progressive enhancement. Problems are easier to solve in order of increasing complexity.

```css
/* Mobile-first */
.component {
  display: flex;
  flex-direction: column;  /* vertical stack on mobile */
  gap: 1rem;
  padding: 1rem;
}
@media (min-width: 600px) {
  .component {
    flex-direction: row;   /* horizontal at 600px+ */
    padding: 1.5rem;
  }
}
@media (min-width: 960px) {
  .component { padding: 2rem; gap: 2rem; }
}

/* Desktop-first — avoid */
.component {
  display: flex;
  flex-direction: row;
  padding: 2rem;
}
@media (max-width: 959px) { .component { padding: 1.5rem; } }
@media (max-width: 599px) { .component { flex-direction: column; padding: 1rem; } }
/* Mobile overrides buried at the end, lower priority, harder to maintain */
```

### CSS Units — When to Use Each

| Unit | Best for | Avoid for |
|---|---|---|
| `px` | Borders, box shadows, values that must NOT scale | Font sizes, most spacing |
| `rem` | Font sizes, most spacing | Values that should NOT scale with font size |
| `em` | Spacing proportional to the element's own font size | Anything deeply nested (cascades unexpectedly) |
| `%` | Widths in liquid layouts | Most heights (percentage heights need a parent height) |
| `fr` | CSS Grid track sizes | Flexbox (use `flex: 1` there) |
| `vw / vh` | Large viewport-relative layouts | `100vh` on mobile (use `100dvh` instead) |
| `dvh / dvw` | Full-viewport layouts on mobile | Desktop-only layouts |
| `clamp(min, pref, max)` | Fluid typography, fluid spacing | — |

**`rem` for font sizes and spacing** — respects user font preference changes. If a user sets their browser default font to 20px, 1rem = 20px and all rem-based layout scales correctly. This is an accessibility requirement (WCAG 1.4.4).

**`clamp(min, preferred, max)`** — fluid value between a minimum and maximum. `font-size: clamp(1rem, 2.5vw, 2rem)` never goes below 1rem, never above 2rem, scales smoothly with viewport. Eliminates most font-size breakpoints.

```css
/* Typography scale using clamp — smooth scaling, zero breakpoints */
:root {
  --font-xs:   clamp(0.75rem,  1.5vw,  0.875rem);
  --font-sm:   clamp(0.875rem, 2vw,    1rem);
  --font-base: clamp(1rem,     2.5vw,  1.125rem);
  --font-lg:   clamp(1.125rem, 3vw,    1.5rem);
  --font-xl:   clamp(1.5rem,   4vw,    2rem);
  --font-2xl:  clamp(2rem,     5vw,    3rem);
}
/* h1 { font-size: var(--font-2xl); } — no media queries needed */
```

### Container Queries — Component-Level Responsiveness

Container queries allow a component to respond to the size of its **containing element** rather than the viewport. Media queries answer "is the window wide?". Container queries answer "is the space available for this component wide?"

This is the most significant CSS feature for component-based architecture. An Angular component is designed to be reusable. With media queries, a card that looks good in a 4-column grid breaks in a sidebar — because the media query sees the full viewport, not the sidebar's width. With container queries, the card adapts to whatever space its parent provides.

```css
/* The containing element declares container-type */
.card-wrapper {
  container-type: inline-size;   /* respond to width changes */
  container-name: card;           /* optional name for targeting */
}

/* The component's styles use @container instead of @media */
.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
@container card (min-width: 400px) {
  .card {
    flex-direction: row;
    padding: 1.5rem;
  }
  .card__image { width: 40%; flex-shrink: 0; }
  .card__content { flex: 1; }
}

/* Angular: set container-type on the host element */
:host {
  display: block;
  container-type: inline-size;
}
/* Now children can query this component's width */

/* Container query units */
@container card (min-width: 600px) {
  .card__title { font-size: clamp(1.25rem, 4cqi, 2rem); }
  /* cqi: 1% of the container's inline size — text scales with the container */
}
```

---

## CSS Animations and Transitions

```css
/* Transitions — smooth state changes */
.button {
  background: var(--color-primary);
  transform: scale(1);
  transition:
    background 200ms ease,
    transform 150ms ease,
    box-shadow 200ms ease;
}
.button:hover {
  background: #1a5c99;
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}
.button:active { transform: scale(0.98); }

/* Always respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .button { transition: none; }
  /* Remove all animations for users who prefer no motion */
}

/* Keyframe animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dialog { animation: fade-in 200ms ease forwards; }
.drawer { animation: slide-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.spinner { animation: spin 1s linear infinite; }

/* Performance-safe properties to animate:
   transform (translate, scale, rotate) — composited, no layout
   opacity                              — composited, no layout
   filter                               — composited (watch GPU memory)
   
   Avoid animating these (cause layout recalculation):
   width, height, top, left, margin, padding, border
   Use transform: translate() instead of left/top
   Use transform: scale() instead of width/height when possible */

/* Angular animations integration */
/* For complex multi-step animations, use Angular's @angular/animations package */
/* For simple transitions triggered by class changes, plain CSS transitions are enough */
/* prefer CSS for: hover states, focus styles, simple enter/leave */
/* prefer Angular animations for: route transitions, complex sequenced animations */
```

---

## The Cascade, Specificity, and Inheritance

Understanding these is essential for debugging CSS. Every CSS rule conflict is resolved by the cascade.

**The cascade order** (later wins when specificity is equal): browser defaults → `<link>` stylesheets (in order) → `<style>` blocks → `style=""` attributes → `!important` declarations.

**Specificity** — calculated as a three-part score `(id, class/attr/pseudo-class, element/pseudo-element)`:

| Selector | Score |
|---|---|
| `*` | (0, 0, 0) |
| `p`, `div`, `::before` | (0, 0, 1) |
| `.card`, `[type="text"]`, `:hover` | (0, 1, 0) |
| `#header` | (1, 0, 0) |
| `style=""` | Beats everything except `!important` |

```css
/* Specificity examples */
p           { color: blue;  }  /* (0,0,1) */
.card p     { color: red;   }  /* (0,1,1) — wins */
#main p     { color: green; }  /* (1,0,1) — wins over .card p */

/* Angular component encapsulation adds an attribute selector to all rules */
/* In Angular, p becomes p[_ngcontent-xyz], adding (0,1,1) to every rule */
/* Use :host for component-level styles, avoid deep nesting for specificity reasons */
```

**Inheritance** — some CSS properties inherit from parent to children (text-related: `color`, `font-*`, `line-height`, `text-align`). Others do not (box-related: `width`, `height`, `padding`, `border`, `background`). Use `inherit` to explicitly inherit a non-inheriting property, `initial` to reset to browser default, `unset` to reset to inherited value if the property inherits, or initial if not.

---

## UI/UX Design Principles for Developers

You do not need to be a designer, but understanding these principles makes you a better collaborator with design teams and helps you implement designs correctly rather than approximating them.

**Visual hierarchy:** Users scan pages, not read them linearly. The primary action on a page should be visually dominant. Secondary actions should be subordinate. Developers implement hierarchy through font weights, sizes, colour contrast, and spacing — all specified in the design system.

**Spacing systems:** Professional designs use a spacing scale rather than arbitrary pixel values. Common scales: multiples of 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64) or multiples of 8px. When implementing, every margin, padding, and gap should come from this scale. Using `margin: 7px` instead of `8px` signals implementation drift.

**Typography scale:** Designs use defined text styles — `heading-xl`, `heading-lg`, `body-lg`, `body-md`, `caption`, `label` — with specific font sizes, weights, line heights, and letter spacing. Never hardcode sizes that deviate from the scale without asking the designer.

**Colour system:** Designs use semantic colour names — `primary`, `secondary`, `surface`, `on-surface`, `error`, `warning`, `success` — not raw hex values. Implement via CSS custom properties to keep themes maintainable.

**Affordance:** Elements should look like what they do. Buttons look clickable. Input fields look editable. When you style a non-standard element as interactive, ensure it communicates its interactivity visually (cursor, hover state, focus style) and semantically (ARIA role, keyboard handling).

**Feedback:** Users need to know their actions were registered. Button press feedback, loading states for submissions, success and error messages. Implementing interactions without these states is incomplete even if the logic works.

---

## Figma for Developers

Figma is the dominant design tool. As a developer you use it to inspect designs rather than create them.

**Navigating a Figma file:** files are organised into Pages (top of screen) and Frames (artboards representing screens or components). The left panel shows layers (element tree). The right panel shows properties of the selected element. Components are reusable design elements — equivalent to Angular components.

**Dev Mode** (activated from the toolbar): shows exact CSS properties for any selected element (font-size, colour, padding, border-radius), distance measurements between elements, asset exports, and component specifications.

**Inspecting spacing:** click an element, then hold Option/Alt and hover over another to see the distance between them. This gives you exact padding and margin values.

**Inspecting colours:** click any filled element and the right panel shows the exact colour — copy as hex, HSL, or the design token name if the design uses a colour library.

**Inspecting typography:** click any text element to see font family, size, weight, line height, letter spacing, and text alignment.

**Extracting assets:** click an image or icon prepared for export and the right panel "Export" section lets you download as PNG (multiple resolutions) or SVG.

**Component variants:** click a component instance and the right panel shows "Component properties" — the available variants (size, state, colour). Understanding which variants exist tells you what CSS classes or Angular Input properties you need to implement.

**What to do when designs are ambiguous:** ask before implementing. Common situations:
- Spacing values not on the grid (13px when the scale uses 12px and 16px) — ask if intentional
- An animation specified that would cause performance issues on mobile — flag it and propose an alternative
- A font not licensed for web use — raise it before implementation, not after

---

*Next: [Accessibility](./accessibility.md)*
