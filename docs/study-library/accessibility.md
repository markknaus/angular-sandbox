# Accessibility
### WCAG, ARIA, Angular CDK, and Testing

> Everything a senior Angular developer needs to build and verify accessible applications

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [The Legal and Business Case](#the-legal-and-business-case)
- [WCAG 2.1 — All Four Principles with Key Success Criteria](#wcag-21--all-four-principles-with-key-success-criteria)
  - [Perceivable](#perceivable)
  - [Operable](#operable)
  - [Understandable](#understandable)
  - [Robust](#robust)
- [ARIA — Complete Attribute Reference](#aria--complete-attribute-reference)
  - [The First Rule of ARIA](#the-first-rule-of-aria)
  - [Naming Attributes](#naming-attributes)
  - [State Attributes](#state-attributes)
  - [Relationship Attributes](#relationship-attributes)
  - [Live Region Attributes](#live-region-attributes)
  - [Widget Attributes](#widget-attributes)
  - [Common ARIA Patterns in Angular](#common-aria-patterns-in-angular)
- [Angular CDK Accessibility Utilities](#angular-cdk-accessibility-utilities)
  - [FocusTrap](#focustrap)
  - [FocusMonitor](#focusmonitor)
  - [LiveAnnouncer](#liveannouncer)
  - [Key Managers](#key-managers)
  - [CdkListbox, CdkMenu, CdkCombobox](#cdklistbox-cdkmenu-cdkcombobox)
- [Keyboard Navigation Patterns](#keyboard-navigation-patterns)
- [Focus Management](#focus-management)
- [Accessibility Testing Strategy](#accessibility-testing-strategy)
  - [Automated Testing with axe-core and jest-axe](#automated-testing-with-axe-core-and-jest-axe)
  - [Manual Testing Checklist](#manual-testing-checklist)
  - [Screen Reader Testing](#screen-reader-testing)
- [Angular-Specific Accessibility Patterns](#angular-specific-accessibility-patterns)


## The Legal and Business Case

Accessibility is not optional for senior engineers. The legal landscape is real and growing:

- **European Union:** the European Accessibility Act (EAA, effective June 2025) requires all digital products and services to meet WCAG 2.1 AA.
- **United States:** the ADA (Americans with Disabilities Act) has been interpreted to apply to websites — numerous court settlements and an increasing number of lawsuits.
- **United Kingdom:** the Equality Act 2010 requires accessible digital services.
- **Australia:** the Disability Discrimination Act applies.

Many enterprise clients contractually require WCAG AA compliance, often documented in VPATs (Voluntary Product Accessibility Templates). When a job posting mentions "WCAG compliance" or "accessibility", they mean demonstrable, tested compliance — not "we try to use semantic HTML".

Beyond compliance: approximately 15% of the global population has some form of disability. Accessible design benefits everyone — captions help in loud environments, high contrast helps in bright sunlight, keyboard navigation helps power users, clear error messages help everyone. Accessibility testing also surfaces general usability issues that affect all users.

In interviews, accessibility knowledge separates candidates who understand the full quality bar from those who only know the framework API.

---

## WCAG 2.1 — All Four Principles with Key Success Criteria

WCAG 2.1 has four principles (the POUR acronym), 13 guidelines, and 78 success criteria at levels A, AA, and AAA. Level AA is the legal target in most jurisdictions. Know the principles and the most impactful criteria.

### Perceivable

Information must be perceptible to all users — users cannot perceive what they cannot see, hear, or sense.

**1.1.1 Non-text Content (A):** provide text alternatives for all non-text content. Alt text for images (`alt="Company logo"`). Transcripts for audio. Captions for video. Alt text for decorative images: `alt=""` (empty, not omitted — omission leaves the filename announced).

**1.3.1 Info and Relationships (A):** structure conveyed visually must also be conveyed programmatically — use semantic HTML, not CSS alone. A bold label is not a heading unless it is marked up as one.

**1.3.3 Sensory Characteristics (A):** instructions must not rely solely on shape, colour, size, or location. "Click the red button" fails for colour-blind users. "Press the button on the right" fails when layout changes.

**1.4.1 Use of Colour (A):** do not use colour as the ONLY means of conveying information. Add a pattern, icon, or text label alongside colour. Form error states must not rely only on red colouring — add an error icon and text.

**1.4.3 Contrast Minimum (AA):** normal text needs 4.5:1 contrast ratio against its background. Large text (18pt or 14pt bold) needs 3:1. This is commonly violated by placeholder text, disabled states, and greyed-out labels.

**1.4.4 Resize Text (AA):** text must be readable at 200% zoom without loss of content or functionality. Use `rem` units for font sizes — `px` ignores the user's browser font size preference.

**1.4.10 Reflow (AA):** content must work at 320px viewport width without horizontal scrolling. Test your Angular apps at this width.

**1.4.11 Non-text Contrast (AA):** UI components (input borders, button outlines, icons, focus indicators) and graphical objects need 3:1 contrast against adjacent colours.

**1.4.12 Text Spacing (AA):** users must be able to adjust letter-spacing to 0.12em, word-spacing to 0.16em, line-height to 1.5, and paragraph spacing to 2em without loss of content. Use flexible units; avoid fixed-height containers for text.

### Operable

UI components and navigation must be operable by all users — including those who cannot use a mouse.

**2.1.1 Keyboard (A):** all functionality available via mouse must be available via keyboard. No exceptions for "complex interactions" — if you can drag, there must be a keyboard equivalent. Every interactive element must be reachable with Tab, activatable with Enter/Space.

**2.1.2 No Keyboard Trap (A):** keyboard focus must never be trapped in a component — except deliberately in a modal (see 2.1.4). Test by tabbing through every component.

**2.4.3 Focus Order (A):** tab order must be logical and meaningful. Focus should move in a reading order that makes sense for the page. Do not use `tabindex` values above 0 — they create separate tab sequences that are almost impossible to maintain correctly.

**2.4.7 Focus Visible (AA):** keyboard focus indicator must be visible. Never `outline: none` without providing an alternative focus style. WCAG 2.2 strengthens this: focus indicators must have minimum size (2px) and 3:1 contrast ratio.

**2.5.3 Label in Name (A):** the accessible name of a button must contain its visible text label. `aria-label="Close dialog"` on a button with visible text "Close" is fine. `aria-label="Dismiss"` on a button with visible text "Close" fails — the accessible name does not contain the visible text.

**2.5.8 Target Size Minimum (AA, WCAG 2.2):** interactive targets must be at least 24×24 CSS pixels. Touch targets should be at least 44×44 pixels for comfortable mobile use (Apple HIG recommendation).

### Understandable

Information and UI operation must be understandable.

**3.1.1 Language of Page (A):** `lang` attribute on `<html>`. `<html lang="en">`.

**3.1.2 Language of Parts (AA):** mark up content in a different language: `<span lang="fr">Bonjour</span>`.

**3.2.1 On Focus (A):** no unexpected context changes when an element receives focus. Do not open modals, navigate pages, or submit forms when something receives focus.

**3.2.2 On Input (A):** no unexpected context changes when a user enters data — without warning. A select that navigates on change fails unless you warn users.

**3.3.1 Error Identification (A):** errors must be identified in text, not just colour. "This field is required" must be text, not just a red border.

**3.3.2 Labels or Instructions (A):** labels or instructions for form inputs. Every input must have an associated label.

**3.3.3 Error Suggestion (AA):** if an error is detected and a correction is known, suggest it. "Invalid date" should become "Enter the date in DD/MM/YYYY format."

**3.3.4 Error Prevention (AA):** for legal, financial, or data-submission actions — users must be able to review, correct, and confirm their input before final submission, or be able to reverse or correct the submission after.

### Robust

Content must be robust enough to be interpreted by assistive technologies.

**4.1.2 Name, Role, Value (A):** all UI components must have an accessible name, role, and state/property determinable programmatically. Use semantic HTML or correct ARIA. Every custom interactive component must communicate its identity, purpose, and current state to assistive technology.

**4.1.3 Status Messages (AA):** status messages (success notifications, error counts, progress) must be announced to screen readers without receiving focus — use `aria-live` regions. A toast notification that appears visually but is never announced fails this criterion.

---

## ARIA — Complete Attribute Reference

### The First Rule of ARIA

Do not use ARIA if a native HTML element already provides the semantics. `<button>` is always better than `<div role="button">`. `<input type="checkbox">` is always better than `<div role="checkbox">`. ARIA supplements HTML where native semantics are insufficient — primarily for complex custom widgets.

ARIA does not add behaviour — it only adds semantic information. Adding `role="button"` to a div tells the screen reader it is a button, but you must still handle keyboard events (Enter, Space), focus management, and disabled states manually.

### Naming Attributes

**`aria-label`** — provides an accessible name directly. Use when no visible text label exists (icon-only buttons). Overrides all other naming mechanisms including visible text content.

```html
<button aria-label="Close dialog">✕</button>
<button aria-label="Delete Alice Smith">Delete</button>
<!-- The full name contextualises "Delete" for screen reader users -->
```

**`aria-labelledby`** — references one or more elements by `id`; their text content becomes the accessible name. More powerful than `aria-label` because it uses visible text (so the label and the name stay in sync when the text changes) and can reference multiple elements.

```html
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Recent Orders</h2>
  <!-- section's accessible name is "Recent Orders" -->
</section>

<!-- Multiple references -->
<input aria-labelledby="label-id amount-id">
<label id="label-id">Transfer amount</label>
<span id="amount-id">in USD</span>
<!-- Accessible name: "Transfer amount in USD" -->
```

**`aria-describedby`** — references elements providing description beyond the name. Announced after the name. Used for hint text, error messages, supplementary information.

```html
<input id="password"
       aria-describedby="pw-hint pw-error"
       type="password">
<p id="pw-hint">At least 8 characters, one number, one special character</p>
<p id="pw-error" role="alert">Password is too short</p>
```

### State Attributes

**`aria-expanded`** — is a controlled element open? `true` / `false`. Apply to the trigger (button), not the panel. Update dynamically as state changes.

**`aria-pressed`** — is a toggle button pressed? `true` / `false` / `mixed`. For toggle buttons (bold, italic, mute, star/favourite).

**`aria-checked`** — is a checkbox/radio/switch checked? `true` / `false` / `mixed` (for indeterminate checkboxes). Must be used with `role="checkbox"`, `role="radio"`, or `role="switch"`.

**`aria-selected`** — is an item selected? `true` / `false`. Use on items in listbox, grid, tablist, tree. Apply to the item, not the container.

**`aria-current`** — is this the current item? Values: `page` (current navigation link), `step` (current wizard step), `location`, `date`, `time`, `true`. Use `aria-current="page"` on the active nav link.

**`aria-disabled`** — element is disabled but still focusable (unlike the HTML `disabled` attribute which removes it from tab order). Use when you want disabled elements to remain reachable — for example, to show a tooltip explaining why they're disabled.

### Relationship Attributes

**`aria-controls`** — this element controls another element (reference by `id`). Link a disclosure button to its panel.

**`aria-haspopup`** — activating this element opens a popup. Values: `menu`, `listbox`, `tree`, `grid`, `dialog`. Tell screen reader users what kind of popup to expect.

**`aria-owns`** — this element owns the referenced elements, even if not DOM children. Use when you cannot make elements true DOM children due to styling or scripting constraints.

**`aria-activedescendant`** — when focus is on a container, references the currently "active" descendant. Used for keyboard navigation patterns that keep focus on the container (listbox, combobox, grid).

### Live Region Attributes

**`aria-live`** — how urgently should content changes be announced? `off` (default, no announcement), `polite` (wait for user inactivity), `assertive` (interrupt immediately — use sparingly). Use `polite` for status updates. Use `assertive` for critical errors that need immediate attention.

**`aria-atomic`** — when the region updates, announce the entire region (`true`) or just the changed portion (`false`, default). Use `true` for messages where partial announcement would be confusing.

**`role="status"`** — equivalent to `aria-live="polite"` + `aria-atomic="true"`. Use for save confirmations, search result counts, progress updates.

**`role="alert"`** — equivalent to `aria-live="assertive"` + `aria-atomic="true"`. Use for time-sensitive errors. Only add `role="alert"` dynamically — static alert roles on page load are not announced.

```html
<!-- Status region — persistent, announces updates politely -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  {{ statusMessage() }}
  <!-- 'Saved successfully.' 'Showing 5 of 20 results.' -->
</div>

<!-- Alert region — for urgent error messages -->
<div role="alert" *ngIf="criticalError()">
  {{ criticalError() }}
</div>
```

### Widget Attributes

**`aria-hidden="true"`** — removes element from the accessibility tree entirely. Use for: decorative icons, duplicate content, visually hidden elements that should not be read aloud. Never use on focusable elements — keyboard users can still reach them.

**`aria-busy="true"`** — indicates a region is loading. Screen readers may wait before announcing changes.

**`aria-required="true"`** — indicates a required field. Redundant if using the HTML `required` attribute, but useful for custom components.

**`aria-invalid`** — indicates validation state. `true` = invalid. `false` = valid. Pair with `aria-errormessage` (references the error element's id) or `aria-describedby`.

### Common ARIA Patterns in Angular

```html
<!-- Accordion -->
<button type="button"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="panelId">
  {{ title }}
</button>
<div [id]="panelId"
     [hidden]="!isOpen"
     role="region"
     [attr.aria-labelledby]="buttonId">
  {{ content }}
</div>

<!-- Tabs -->
<div role="tablist" aria-label="Account settings">
  <button role="tab"
          [attr.aria-selected]="activeTab === 'profile'"
          [attr.aria-controls]="'panel-profile'"
          id="tab-profile"
          (click)="activeTab = 'profile'"
          (keydown)="onTabKeydown($event)">
    Profile
  </button>
  <!-- more tabs -->
</div>
<div role="tabpanel"
     id="panel-profile"
     aria-labelledby="tab-profile"
     *ngIf="activeTab === 'profile'">
  <!-- tab content -->
</div>

<!-- Complete accessible dialog -->
<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-description"
     cdkTrapFocus
     cdkTrapFocusAutoCapture="true">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-description">
    This will permanently delete {{ user().name }}. This action cannot be undone.
  </p>
  <div class="dialog__actions">
    <button type="button" (click)="cancel()">Cancel</button>
    <button type="button" (click)="confirm()" class="btn--danger">Delete user</button>
  </div>
</div>

<!-- Search combobox -->
<label for="user-search">Search users</label>
<input id="user-search"
       type="text"
       role="combobox"
       [attr.aria-expanded]="showResults"
       aria-autocomplete="list"
       [attr.aria-controls]="resultsId"
       [attr.aria-activedescendant]="activeResultId">
<ul [id]="resultsId"
    role="listbox"
    [hidden]="!showResults">
  <li *ngFor="let user of results"
      role="option"
      [id]="'result-' + user.id"
      [attr.aria-selected]="selectedUser?.id === user.id">
    {{ user.name }}
  </li>
</ul>
```

---

## Angular CDK Accessibility Utilities

The Angular CDK (`@angular/cdk/a11y`) provides battle-tested primitives for accessible custom components. These handle complex mechanics that are easy to get wrong from scratch.

### FocusTrap

Traps keyboard focus within a container when a modal or dialog is open. Tab and Shift+Tab cycle only within the trapped container.

```typescript
import { cdkTrapFocus } from '@angular/cdk/a11y';

// Directive approach — simplest
@Component({
  template: `
    <div cdkTrapFocus cdkTrapFocusAutoCapture="true">
      <!-- focus trapped here when component is visible -->
      <button (click)="close()">Close</button>
    </div>
  `
})
export class DialogComponent {}

// Programmatic approach — more control
import { FocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';

export class DialogComponent implements AfterViewInit, OnDestroy {
  private container = viewChild.required<ElementRef>('dialogContainer');
  private trapFactory = inject(FocusTrapFactory);
  private trap!: FocusTrap;
  private previouslyFocusedElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Remember what was focused before dialog opened
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    // Create and activate the focus trap
    this.trap = this.trapFactory.create(this.container().nativeElement);
    this.trap.focusInitialElementWhenReady();
  }

  ngOnDestroy(): void {
    this.trap.destroy();
    // Return focus to the trigger element
    this.previouslyFocusedElement?.focus();
  }
}
```

### FocusMonitor

Tracks how an element received focus: keyboard, mouse, touch, or program. Use to show focus indicators only for keyboard navigation.

```typescript
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  standalone: true,
  template: `<button [class.keyboard-focused]="isKeyboardFocused()" #btn>Action</button>`,
  styles: [`
    .keyboard-focused {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `]
})
export class AccessibleButtonComponent implements AfterViewInit, OnDestroy {
  private buttonRef = viewChild.required<ElementRef>('btn');
  private focusMonitor = inject(FocusMonitor);
  private destroyRef = inject(DestroyRef);

  isKeyboardFocused = signal(false);

  ngAfterViewInit(): void {
    this.focusMonitor
      .monitor(this.buttonRef().nativeElement)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(origin => {
        this.isKeyboardFocused.set(origin === 'keyboard');
      });
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.buttonRef().nativeElement);
  }
}
// Modern equivalent: CSS :focus-visible pseudo-class does this automatically
// FocusMonitor is still useful for custom components that need programmatic control
```

### LiveAnnouncer

Programmatically announces messages to screen readers via an `aria-live` region, without moving focus.

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private announcer = inject(LiveAnnouncer);

  success(message: string): void {
    this.announcer.announce(message, 'polite');
    // Screen reader user hears the message when idle
    // Example: "File uploaded successfully."
  }

  error(message: string): void {
    this.announcer.announce(message, 'assertive');
    // Screen reader user hears the message immediately
    // Example: "Error: Connection lost. Please check your network."
  }
}

// In a component after an async operation:
async uploadFile(file: File): Promise<void> {
  this.loading.set(true);
  try {
    await firstValueFrom(this.fileService.upload(file));
    this.notification.success(`${file.name} uploaded successfully.`);
  } catch (err) {
    this.notification.error('Upload failed. Please try again.');
  } finally {
    this.loading.set(false);
  }
}
```

### Key Managers

Key managers handle arrow key navigation within a list of items.

**`ActiveDescendantKeyManager`** — keeps focus on the container and uses `aria-activedescendant` to communicate the active item. Correct for: listboxes, comboboxes (focus stays on the input).

**`FocusKeyManager`** — physically moves focus between items. Correct for: menus, toolbars, tab lists (focus moves to each item).

Both handle: arrow key navigation, Home/End to jump to first/last, typeahead search (type "a" to jump to first item starting with "a"), optional wrap-around.

```typescript
import { FocusKeyManager } from '@angular/cdk/a11y';

@Component({
  template: `
    <ul role="menu" (keydown)="onKeydown($event)">
      <li *ngFor="let item of menuItems"
          role="menuitem"
          tabindex="-1"
          #menuItem>
        {{ item.label }}
      </li>
    </ul>
  `
})
export class MenuComponent implements AfterViewInit {
  private items = viewChildren<ElementRef>('menuItem');
  private keyManager!: FocusKeyManager<ElementRef>;

  ngAfterViewInit(): void {
    this.keyManager = new FocusKeyManager(this.items())
      .withWrap()          // wraps from last to first and back
      .withTypeAhead();    // type to jump to item
  }

  onKeydown(event: KeyboardEvent): void {
    this.keyManager.onKeydown(event);
  }
}
```

### CdkListbox, CdkMenu, CdkCombobox

Fully accessible keyboard-navigable widget implementations. Use as the foundation for custom dropdowns, autocomplete, context menus, and navigation menus rather than implementing from scratch. These implement all ARIA patterns correctly and handle keyboard interaction.

```typescript
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';

@Component({
  standalone: true,
  imports: [CdkListbox, CdkOption],
  template: `
    <ul cdkListbox
        [cdkListboxValue]="selected()"
        (cdkListboxValueChange)="selected.set($event.value)">
      <li *ngFor="let option of options"
          [cdkOption]="option.value">
        {{ option.label }}
      </li>
    </ul>
  `
})
export class SelectComponent {
  selected = signal<string[]>([]);
  options = [
    { value: 'admin', label: 'Administrator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ];
}
```

---

## Keyboard Navigation Patterns

These are the expected keyboard interactions for common widget types. Implementing them correctly is non-negotiable for WCAG 2.1.1 compliance.

| Widget | Keys | Behaviour |
|---|---|---|
| Button | Enter, Space | Activate |
| Link | Enter | Follow link |
| Checkbox | Space | Toggle |
| Radio group | Arrow keys | Move selection within group |
| Select/Listbox | Arrow keys | Move focus; Space/Enter to select |
| Tab list | Arrow keys | Move between tabs; Enter/Space to activate |
| Menu | Arrow keys | Navigate items; Enter/Space to activate; Escape to close |
| Combobox | Type | Filter options; Arrow keys to navigate; Enter to select; Escape to clear/close |
| Dialog | Tab/Shift+Tab | Navigate within dialog (focus trapped); Escape to close |
| Accordion | Enter/Space | Toggle panel; Tab to next accordion header |
| Grid/Data table | Arrow keys | Navigate cells; Enter to edit |

```typescript
// Implementing keyboard navigation for a custom tab list
@Component({
  standalone: true,
  template: `
    <div role="tablist">
      <button *ngFor="let tab of tabs; let i = index"
              role="tab"
              [attr.aria-selected]="activeIndex === i"
              [attr.aria-controls]="'panel-' + tab.id"
              [tabindex]="activeIndex === i ? 0 : -1"
              (keydown)="onTabKeydown($event, i)"
              (click)="activeIndex = i">
        {{ tab.label }}
      </button>
    </div>
  `
})
export class TabListComponent {
  tabs = input.required<Tab[]>();
  activeIndex = signal(0);

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs().length;
    let newIndex = index;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (index + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (index - 1 + count) % count;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activeIndex.set(newIndex);
    // Focus the new tab button
    const tabs = event.currentTarget as HTMLElement;
    const parent = tabs.closest('[role="tablist"]');
    (parent?.querySelectorAll('[role="tab"]')[newIndex] as HTMLElement)?.focus();
  }
}
```

---

## Focus Management

Correct focus management is one of the most difficult aspects of building accessible single-page applications. Angular's router changes content without page reloads — the browser's natural focus management (moving focus to the top on navigation) does not apply.

```typescript
// Route-level focus management — move focus to the main heading on navigation
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <nav>...</nav>
    <main>
      <h1 #pageTitle tabindex="-1">{{ pageTitle }}</h1>
      <!-- tabindex="-1" makes the h1 programmatically focusable -->
      <router-outlet />
    </main>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private pageTitle = viewChild<ElementRef>('pageTitle');

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        // Move focus to the page heading after navigation
        // Small delay allows the new view to render
        setTimeout(() => {
          this.pageTitle()?.nativeElement.focus();
        }, 0);
      });
  }
}

// Modal/dialog focus management
@Component({ standalone: true })
export class ModalTriggerComponent {
  private triggerEl = inject(ElementRef);

  openModal(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(() => {
      // Return focus to the button that opened the dialog
      this.triggerEl.nativeElement.focus();
    });
  }
}

// Skip navigation link — must be the first focusable element on the page
// <a class="skip-link" href="#main-content">Skip to main content</a>
// <main id="main-content">...</main>
// .skip-link { position: absolute; transform: translateY(-100%); }
// .skip-link:focus { transform: translateY(0); }
```

---

## Accessibility Testing Strategy

No single testing approach catches all accessibility issues. A mature strategy uses all three layers.

### Automated Testing with axe-core and jest-axe

Automated tools catch roughly 30-40% of WCAG issues — primarily the structural, programmatic ones. They cannot catch: keyboard navigation quality, logical focus order, meaningful alt text, correct ARIA usage in context.

```typescript
// jest-axe setup — add to jest.config.ts or test setup file
import 'jest-axe/extend-expect';

// Component accessibility test
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/angular';

expect.extend(toHaveNoViolations);

describe('LoginFormComponent', () => {
  it('should have no accessibility violations', async () => {
    const { container } = await render(LoginFormComponent);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with error state', async () => {
    const { container, fixture } = await render(LoginFormComponent);
    // Trigger validation errors
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Test specific interactive states
it('modal should have no violations when open', async () => {
  const { container, fixture } = await render(ConfirmDialogComponent, {
    componentProperties: { isOpen: true, message: 'Delete this item?' }
  });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

Run this checklist on every new component and every significant change:

**Keyboard navigation:**
- [ ] Can you reach every interactive element using only Tab / Shift+Tab?
- [ ] Is the tab order logical (roughly top-to-bottom, left-to-right)?
- [ ] Can you activate every button and link with Enter or Space?
- [ ] Are focus indicators visible on every focusable element?
- [ ] When a modal opens, is focus trapped inside it?
- [ ] When a modal closes, does focus return to the trigger?
- [ ] Can you use arrow keys to navigate within widgets (tabs, dropdowns, menus)?

**Visual:**
- [ ] Is all text readable at 200% browser zoom?
- [ ] Does the page work at 320px width without horizontal scrolling?
- [ ] Do colour-only indicators have text or icon alternatives?
- [ ] Are error states communicated with more than just red colour?

**Screen reader (basic manual check):**
- [ ] Is every image's alt text meaningful (or empty for decorative)?
- [ ] Is every form field labelled?
- [ ] Are error messages announced when they appear?
- [ ] Does the page title update on navigation?

### Screen Reader Testing

For thorough screen reader testing:

| Platform | Screen Reader | Browser |
|---|---|---|
| macOS | VoiceOver (built-in) | Safari (best support), Chrome |
| Windows | NVDA (free) | Firefox, Chrome |
| Windows | JAWS (paid, enterprise) | Chrome, Edge |
| iOS | VoiceOver (built-in) | Safari |
| Android | TalkBack (built-in) | Chrome |

**Basic VoiceOver commands (macOS):** turn on with `Cmd+F5`. Navigate by headings with `VO+Cmd+H`. Navigate by landmarks with `VO+Cmd+L`. Navigate by links with `VO+Cmd+L` (Tab). `VO` = Control+Option.

**Basic NVDA commands (Windows):** navigate by headings with `H`. Navigate by landmarks with `D`. Navigate by links with `K`. Forms mode activates automatically when landing on a form field.

---

## Angular-Specific Accessibility Patterns

```typescript
// Dynamic page titles for screen reader page announcements
@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private title = inject(Title);
  private readonly appName = 'My Application';

  setTitle(pageTitle: string): void {
    // Pattern: "Page Name — App Name"
    // Screen readers announce this on page load/navigation
    this.title.setTitle(`${pageTitle} — ${this.appName}`);
  }
}

// Route-level title configuration
const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    title: 'Users — My Application',
    // Or use a TitleStrategy for dynamic titles
  }
];

// Custom TitleStrategy for dynamic titles from route data
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) this.title.setTitle(`${title} — My Application`);
  }
}

// Accessible form field component
@Component({
  standalone: true,
  selector: 'app-field',
  template: `
    <div class="field">
      <label [for]="inputId">
        {{ label() }}
        @if (required()) {
          <span aria-hidden="true"> *</span>
          <span class="sr-only"> (required)</span>
        }
      </label>
      <input
        [id]="inputId"
        [type]="type()"
        [formControl]="control()"
        [attr.aria-required]="required() || null"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy() || null"
      />
      @if (hint()) {
        <p [id]="hintId" class="field__hint">{{ hint() }}</p>
      }
      @if (isInvalid()) {
        <p [id]="errorId" class="field__error" role="alert">
          {{ errorMessage() }}
        </p>
      }
    </div>
  `
})
export class FieldComponent {
  label = input.required<string>();
  type = input('text');
  control = input.required<FormControl>();
  required = input(false);
  hint = input<string | null>(null);

  private readonly uid = crypto.randomUUID().slice(0, 8);
  protected readonly inputId = `field-${this.uid}`;
  protected readonly hintId = `hint-${this.uid}`;
  protected readonly errorId = `error-${this.uid}`;

  protected isInvalid = computed(
    () => this.control().invalid && this.control().touched
  );

  protected describedBy = computed(() =>
    [
      this.hint() ? this.hintId : null,
      this.isInvalid() ? this.errorId : null,
    ].filter(Boolean).join(' ') || null
  );

  protected errorMessage = computed(() => {
    const errors = this.control().errors;
    if (!errors) return null;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  });
}

// Announcing route changes
@Component({ selector: 'app-root', standalone: true })
export class AppComponent implements OnInit {
  private router = inject(Router);
  private announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        const title = document.title.split(' — ')[0];
        this.announcer.announce(`Navigated to ${title}`, 'polite');
      });
  }
}
```

---

*Next: [Angular Core](./angular-core.md)*
