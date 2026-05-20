# Angular Core
### The Complete Senior Developer Reference

> Standalone components, Signals, inputs/outputs/queries, change detection, lifecycle hooks, control flow, directives, pipes, dependency injection, routing, and reactive forms

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Standalone Components — The Architecture Shift](#standalone-components--the-architecture-shift)
- [Signals — Technical Internals and Every API](#signals--technical-internals-and-every-api)
  - [Signal Inputs, Outputs, Model, and Queries](#signal-inputs-outputs-model-and-queries)
  - [toSignal and toObservable](#tosignal-and-toobservable)
- [Change Detection — Complete Technical Model](#change-detection--complete-technical-model)
- [Lifecycle Hooks — Deep Dive with Edge Cases](#lifecycle-hooks--deep-dive-with-edge-cases)
- [Control Flow — @if, @for, @switch, @defer](#control-flow--if-for-switch-defer)
- [Directives](#directives)
  - [Attribute Directives — Full Implementation Guide](#attribute-directives--full-implementation-guide)
  - [Structural Directives — How They Work Internally](#structural-directives--how-they-work-internally)
- [Pipes — Pure, Impure, Async, and Custom](#pipes--pure-impure-async-and-custom)
- [Dependency Injection — Architecture](#dependency-injection--architecture)
  - [The Injector Hierarchy](#the-injector-hierarchy)
  - [inject() Function — Modern DI Pattern](#inject-function--modern-di-pattern)
  - [InjectionToken — Type-Safe Configuration](#injectiontoken--type-safe-configuration)
  - [All Provider Types](#all-provider-types)
- [Routing — Complete Reference](#routing--complete-reference)
  - [provideRouter — All Configuration Options](#providerouter--all-configuration-options)
  - [Route Configuration — Every Option](#route-configuration--every-option)
  - [Guards — Every Type](#guards--every-type)
  - [Custom Preloading Strategy](#custom-preloading-strategy)
- [Reactive Forms — Complete Reference](#reactive-forms--complete-reference)
  - [Typed Forms — Every Type Explained](#typed-forms--every-type-explained)
  - [Validators and Async Validators](#validators-and-async-validators)
  - [ControlValueAccessor — Complete Implementation](#controlvalueaccessor--complete-implementation)
  - [Dynamic FormArrays](#dynamic-formarrays)
- [Production Signal Store Pattern](#production-signal-store-pattern)


## Standalone Components — The Architecture Shift

Angular 14 introduced standalone components as opt-in. Angular 17 made them the default. This is the most significant architectural change in Angular's history — it eliminates NgModule as a required compilation boundary. Every component is now self-describing: it declares its own `imports`, and the Angular compiler resolves dependencies per-component rather than per-module.

**Before standalone:** a component belonged to exactly one NgModule. The module declared the component and imported other modules whose exports the component could use. Changes to one module's imports could affect unrelated components. Testing required importing an entire NgModule.

**After standalone:** each component imports only what it uses. Testing is simpler — import only the dependencies your test needs. Tree-shaking is more effective — the bundler can see exactly what each component uses. Lazy loading is more granular — `loadComponent()` lazy-loads a single component.

```typescript
// Minimal standalone component
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  template: `<span class="badge" [attr.data-variant]="variant()">{{ label() }}</span>`,
  styles: [`.badge { padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; }`]
})
export class BadgeComponent {
  label = input.required<string>();
  variant = input<'info' | 'success' | 'warning' | 'error'>('info');
}

// Feature-rich standalone component
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, AsyncPipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="product-card" [class.out-of-stock]="!product().inStock">
      <div class="product-card__body">
        <h3>
          <a [routerLink]="['/products', product().id]">{{ product().name }}</a>
        </h3>
        <p>{{ product().price | currency }}</p>
        @if (product().discount) {
          <app-badge [label]="product().discount + '% off'" variant="success" />
        }
      </div>
      <footer>
        <button
          type="button"
          [disabled]="!product().inStock"
          (click)="addToCart.emit(product())"
          [attr.aria-label]="'Add ' + product().name + ' to cart'">
          Add to cart
        </button>
      </footer>
    </article>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();
}
```

---

## Signals — Technical Internals and Every API

Signals are Angular's fine-grained reactivity system. Unlike Zone.js which patches ALL async operations and triggers change detection for the ENTIRE component tree, signals create a directed acyclic graph of dependencies. Angular tracks which template bindings read which signals during rendering. When a signal's value changes, only the templates and `computed()` values that depend on that signal are re-evaluated.

**Internally:** a signal is an object with a stored value, a version counter (increments on every write), and a set of consumers (computed signals and effects that have read it). When a `computed()` or `effect()` runs, Angular sets a global "active consumer" pointer. Every `signal.read()` operation checks this pointer and, if set, registers itself as a dependency of that consumer. This is fully automatic — no subscriptions, no manual dependency declarations.

**Glitch-free updates:** a "glitch" in reactive systems occurs when a derived value is read before all its dependencies have updated, producing an intermediate incorrect value. Angular prevents this with lazy evaluation: `computed()` marks itself "dirty" when dependencies change but does not recompute until the value is actually read. This ensures templates always see a consistent snapshot.

```typescript
import { signal, computed, effect, untracked, isSignal, toSignal, toObservable } from '@angular/core';

// signal() — WritableSignal<T>
const count = signal(0);
const user = signal<User | null>(null);
const tags = signal<string[]>([]);

// Reading — always call as a function
count()          // 0   — current value
user()?.name     // safe property access on nullable signal
tags().length

// Writing
count.set(5);                          // replace
count.update(n => n + 1);             // derive from current
tags.update(t => [...t, 'angular']);  // immutable update
user.set({ id: '1', name: 'Alice', role: 'admin' });

// asReadonly() — expose read-only version to consumers
// Never expose writable signals directly from services
export class UserStore {
  private _count = signal(0);
  readonly count = this._count.asReadonly(); // Signal<number> — no .set()
}

// computed() — Signal<T>, read-only, lazy, memoized
const doubled = computed(() => count() * 2);
const isAdmin = computed(() => user()?.role === 'admin');
// Only re-runs when a tracked dependency changes
// Caches result — multiple reads don't recompute

// Chained computed — builds the dependency graph
const activeUsers = computed(() => allUsers().filter(u => u.active));
const adminCount  = computed(() => activeUsers().filter(u => u.role === 'admin').length);
// adminCount → activeUsers → allUsers (chain)

// effect() — runs side effects in response to signal changes
// Runs once immediately, then whenever any tracked signal changes
const stopSync = effect(() => {
  const currentUser = user();  // tracked dependency
  if (currentUser) {
    localStorage.setItem('lastUserId', currentUser.id);
  }
});
// Later: stopSync() — removes the effect

// effect() with cleanup — runs before the next effect execution
effect((onCleanup) => {
  const ws = new WebSocket(`wss://api.example.com/user/${user()?.id}`);
  ws.onmessage = (e) => updateUserData(JSON.parse(e.data));
  onCleanup(() => ws.close());  // closes previous connection before reconnecting
});

// untracked() — read a signal's value without creating a dependency
effect(() => {
  const query = searchQuery();           // TRACKED — effect reruns on change
  const cache = untracked(cachedData);  // NOT tracked — just reading current value
  if (cache.has(query)) return;
  fetchAndCache(query);
});
```

> 💡 Two common `effect()` mistakes: (1) Writing to a signal inside an effect without `untracked()` creates a circular dependency — Angular throws a runtime error. (2) Calling `effect()` inside `ngOnInit` instead of a class field initializer or constructor — it must be called in an injection context.

### Signal Inputs, Outputs, Model, and Queries

Angular 17.1 stabilised the signal-based equivalents of `@Input`, `@Output`, `@ViewChild`, and `@ContentChild`. These integrate with the signal graph — parent signal changes flow automatically into child updates without Zone.js.

```typescript
import { input, output, model, viewChild, viewChildren, contentChild } from '@angular/core';

@Component({ standalone: true })
export class MyComponent {
  // input() — replaces @Input()
  name  = input<string>();                 // InputSignal<string | undefined>
  name2 = input('default');                // InputSignal<string> — inferred non-nullable
  name3 = input.required<string>();        // InputSignal<string> — never undefined

  // input with transform — coerce HTML string attributes
  disabled = input(false, { transform: booleanAttribute });
  size     = input(16, { transform: numberAttribute });
  label    = input('', { transform: (v: string) => v.trim() });

  // output() — replaces @Output() EventEmitter
  clicked     = output<void>();
  valueChange = output<string>();
  // emit: this.clicked.emit();  this.valueChange.emit('new value');
  // NOT an Observable — use (clicked)="handler()" in template, not subscribe()

  // model() — two-way binding signal (replaces @Input + @Output pair)
  // Parent: <app-input [(value)]="myField" />
  // When child calls value.set('new'), the parent's binding updates automatically
  value   = model<string>('');
  checked = model(false);

  // viewChild() — replaces @ViewChild
  canvas         = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  // ^ Signal<ElementRef<...> | undefined>
  canvasRequired = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  // ^ Signal<ElementRef<...>> — never undefined

  // viewChildren() — replaces @ViewChildren
  listItems = viewChildren(ListItemComponent);
  // ^ Signal<readonly ListItemComponent[]>

  // contentChild() — replaces @ContentChild
  headerSlot = contentChild<TemplateRef<any>>(TemplateRef);

  ngAfterViewInit(): void {
    const el = this.canvasRequired();  // ElementRef<HTMLCanvasElement>
    const ctx = el.nativeElement.getContext('2d');
    this.initChart(ctx);
  }
}
```

### toSignal and toObservable

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';

// toSignal() — bridge from Observable to Signal
// Must be called in an injection context (class field, constructor)
// Auto-unsubscribes when the injection context is destroyed
const users = toSignal(this.userService.getAll(), { initialValue: [] as User[] });
const route  = toSignal(this.route.params, { initialValue: {} });
const userId = computed(() => route()['id'] as string);

// toObservable() — bridge from Signal to Observable
const count$ = toObservable(count);  // emits whenever count changes
// Useful for piping signal changes through RxJS operators:
const debounced$ = toObservable(searchQuery).pipe(debounceTime(300));
// Then load data as the search changes:
const results$ = debounced$.pipe(switchMap(q => this.search(q)));
const results = toSignal(results$, { initialValue: [] });
```

---

## Change Detection — Complete Technical Model

Angular's change detection is a tree traversal algorithm. It starts at the root component and works downward, evaluating template binding expressions and comparing results against previous values.

**Default (CheckAlways) strategy:** the component is visited during every change detection run regardless of whether its inputs changed. Safe and predictable but scales poorly — a single `setTimeout` callback checks every component in the entire tree.

**OnPush strategy:** the component is marked "clean" after each check. Angular skips it on subsequent runs UNLESS one of four conditions is met:
1. An `@Input` / `input()` value changed by reference. For signal inputs, Angular automatically marks the component when the signal value changes. For decorator `@Input`, the parent binding must produce a different reference — mutating an existing object does not trigger it.
2. An event originated from this component or any descendant (click, input, keydown, submit, etc.).
3. The `async` pipe inside this component received a new emission and called `markForCheck()` internally.
4. `ChangeDetectorRef.markForCheck()` was called explicitly.

**Zoneless (Angular 18+):** Zone.js is not used at all. The only way to schedule change detection is: signal changes, `markForCheck()` calls, or async pipe emissions. Applications must be fully OnPush and use signals or async pipe.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Name: {{ name() }}</p>
    <p>Async: {{ data$ | async }}</p>
    <button (click)="onClick()">Click</button>
  `
})
export class DemoComponent {
  name  = input.required<string>();   // Trigger 1: signal input change
  count = signal(0);                   // Trigger 2: local signal change marks dirty
  data$ = inject(DataService).stream$; // Trigger 3: async pipe calls markForCheck

  onClick(): void { this.count.update(n => n + 1); } // Trigger 4: event from component
}
```

> ⚠️ The most common OnPush bug: passing an object as an `@Input` and mutating it in the parent. Because the reference does not change, Angular never marks the child dirty. Always return new object/array references for Input data. Signal inputs solve this — signals track value changes, not reference changes.

---

## Lifecycle Hooks — Deep Dive with Edge Cases

**The complete creation sequence:** `constructor` → `ngOnChanges` (if @Input set) → `ngOnInit` → `ngDoCheck` → `ngAfterContentInit` → `ngAfterContentChecked` → `ngAfterViewInit` → `ngAfterViewChecked`.

**On each subsequent change detection run:** `ngOnChanges` (if inputs changed) → `ngDoCheck` → `ngAfterContentChecked` → `ngAfterViewChecked`.

**On destroy:** `ngOnDestroy`.

**`constructor`** — injected dependencies are available. Nothing else is. Do not access `@Input` values, call service methods that depend on inputs, access DOM elements, or access `@ViewChild`. Do: assign injected services to private fields, call `inject()`.

**`ngOnChanges(changes: SimpleChanges)`** — called before `ngOnInit` and after every `@Input` reference change. `SimpleChanges` is a dictionary of `{ propertyName: SimpleChange }` — each with `previousValue`, `currentValue`, and `firstChange`. Only called for `@Input` decorator properties — NOT for `input()` signals (signal inputs react immediately when the signal changes).

**`ngOnInit`** — all `@Input` values are set. Start async operations: HTTP requests, subscriptions, effects that depend on inputs. This is where most initialization logic lives. Prefer `toSignal()` and reactive patterns over imperative subscriptions.

**`ngDoCheck`** — runs on EVERY change detection cycle regardless of OnPush. Expensive. Use only when you need to detect mutations that Angular's default checks cannot detect. If you find yourself writing `ngDoCheck`, consider using signals instead.

**`ngAfterContentInit` / `ngAfterContentChecked`** — called after `<ng-content>` projected content is initialized. `@ContentChild` / `contentChild()` queries are resolved.

**`ngAfterViewInit`** — the component's own view and all child component views are fully rendered. `@ViewChild` / `viewChild()` queries are resolved. Correct place for: canvas initialization, third-party DOM libraries, programmatic focus management, measuring element sizes. Do NOT modify the view synchronously here — it causes `ExpressionChangedAfterItHasBeenChecked` in dev mode. Use signal updates or `setTimeout()`.

**`ngOnDestroy`** — mandatory cleanup. Clean up: `setInterval` / `setTimeout` IDs, external `addEventListener` calls (not Angular event bindings), third-party library instances (charts, maps, editors), `DestroyRef` callbacks.

```typescript
export class MapComponent implements OnInit, OnDestroy {
  private map!: MapLibrary;
  private intervalId!: ReturnType<typeof setInterval>;
  private resizeHandler = () => this.map?.resize();  // same reference for add/remove
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // takeUntilDestroyed handles RxJS cleanup automatically
    this.store.location$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loc => this.map?.flyTo(loc));
    this.intervalId = setInterval(() => this.map?.refresh(), 30_000);
    window.addEventListener('resize', this.resizeHandler);
  }

  ngAfterViewInit(): void {
    this.map = new MapLibrary(this.mapContainer().nativeElement);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    window.removeEventListener('resize', this.resizeHandler);
    this.map?.destroy();
  }
}
```

---

## Control Flow — @if, @for, @switch, @defer

Angular 17 introduced built-in control flow syntax compiled directly by the Angular template compiler. No imports required. These replace structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) with more expressive, more efficient syntax.

```html
<!-- @if — replaces *ngIf -->
@if (user()) {
  <div>Hello {{ user()!.name }}</div>
} @else if (loading()) {
  <app-skeleton />
} @else {
  <p>Please log in</p>
}

<!-- 'as' alias — captures value for use in the block -->
@if (user(); as u) {
  <p>{{ u.name }} — {{ u.email }}</p>
}

<!-- @for — replaces *ngFor, track is REQUIRED (compile error if omitted) -->
@for (item of items(); track item.id; let i = $index; let last = $last) {
  <li [class.last]="last" [attr.data-index]="i">{{ item.name }}</li>
} @empty {
  <li class="empty-state">No items found</li>
}
<!-- Available implicit variables: $index, $count, $first, $last, $even, $odd -->

<!-- @switch — replaces *ngSwitch -->
@switch (user().role) {
  @case ('admin')  { <app-admin-panel /> }
  @case ('editor') { <app-editor-panel /> }
  @default         { <app-viewer-panel /> }
}

<!-- @defer — lazy loading with automatic code splitting -->
@defer (on viewport; prefetch on idle) {
  <app-analytics-dashboard [data]="chartData()" />
  <!-- This component is in a separate JS bundle
       Downloaded when the placeholder enters the viewport
       Pre-fetched during idle time (before user scrolls) -->
} @placeholder (minimum 100ms) {
  <div class="chart-placeholder" style="height: 400px"></div>
} @loading (minimum 300ms; after 100ms) {
  <app-loading-spinner />
} @error {
  <p>Dashboard unavailable. <button (click)="retryLoad()">Retry</button></p>
}

<!-- All @defer trigger types -->
@defer (on viewport)        { ... }  <!-- IntersectionObserver -->
@defer (on idle)            { ... }  <!-- requestIdleCallback -->
@defer (on immediate)       { ... }  <!-- after stable, no user action -->
@defer (on interaction)     { ... }  <!-- click or keydown on placeholder -->
@defer (on hover)           { ... }  <!-- mouseenter on placeholder -->
@defer (on timer(5000))     { ... }  <!-- after 5 second delay -->
@defer (when isExpanded())  { ... }  <!-- when signal/expression is truthy -->
```

---

## Directives

### Attribute Directives — Full Implementation Guide

An attribute directive modifies the appearance or behaviour of an existing element without adding a template. Applied as an HTML attribute. Prefer the `host` metadata object over `@HostBinding`/`@HostListener` decorators — cleaner and works with signal inputs.

**`Renderer2` vs `ElementRef.nativeElement`:** always prefer `Renderer2` for DOM manipulation. Its methods work correctly in Angular Universal (SSR), Web Workers, and non-browser environments. Use `ElementRef` for reading (measurement, query), `Renderer2` for writing.

```typescript
@Directive({
  selector: '[appRequiresPermission]',
  standalone: true,
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[class.permission-denied]': 'denied()',
    '(click)': 'onClick($event)',
  }
})
export class RequiresPermissionDirective {
  permission = input.required<string>('appRequiresPermission');
  fallback   = input<'hide' | 'disable'>('disable');

  private authService = inject(AuthService);
  private el          = inject(ElementRef);
  private renderer    = inject(Renderer2);

  protected denied   = computed(() => !this.authService.hasPermission(this.permission()));
  protected disabled = computed(() => this.denied() && this.fallback() === 'disable');

  constructor() {
    effect(() => {
      if (this.denied() && this.fallback() === 'hide') {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
      } else {
        this.renderer.removeStyle(this.el.nativeElement, 'display');
      }
    });
  }

  protected onClick(event: Event): void {
    if (this.disabled()) event.stopPropagation();
  }
}
<!-- Usage: -->
<!-- <button [appRequiresPermission]="'delete:users'" fallback="disable">Delete</button> -->
```

### Structural Directives — How They Work Internally

Structural directives manipulate the DOM by adding, removing, or replacing elements. Angular identifies them by the asterisk prefix. The asterisk is syntactic sugar — Angular desugars it into an explicit `<ng-template>` binding.

```html
<!-- *ngIf syntactic sugar — what you write: -->
<div *ngIf="user; else loading">{{ user.name }}</div>

<!-- What Angular compiles it to: -->
<ng-template [ngIf]="user" [ngIfElse]="loading">
  <div>{{ user.name }}</div>
</ng-template>
```

A custom structural directive receives a `TemplateRef` (the template to stamp) and a `ViewContainerRef` (where to insert it). The directive decides when and how many times to create the view.

```typescript
// Custom structural directive: *appRepeat="3" — renders template N times
@Directive({ selector: '[appRepeat]', standalone: true })
export class RepeatDirective implements OnInit {
  private templateRef    = inject(TemplateRef<{ $implicit: number; index: number }>);
  private viewContainer  = inject(ViewContainerRef);
  private count          = input.required<number>('appRepeat');

  ngOnInit(): void {
    for (let i = 0; i < this.count(); i++) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: i + 1,   // available as 'let n'
        index: i,            // available as 'let i = index'
      });
    }
  }
}
<!-- <app-skeleton-row *appRepeat="5; let n; let i = index">Row {{ n }}</app-skeleton-row> -->
```

---

## Pipes — Pure, Impure, Async, and Custom

Pipes transform template values for display: `{{ value | pipeName:arg1:arg2 }}`. Chainable: `{{ date | timezone:'EST' | date:'medium' }}`.

**Pure pipes (default):** Angular only calls `transform()` when the input value or argument changes by reference. Same reference → same result (memoized). Works correctly with immutable data. Does NOT work for mutated objects — if you push to an array without changing the reference, the pipe does not re-run. Always pure by default; override only when necessary.

**Impure pipes (`pure: false`):** Angular calls `transform()` on every change detection run. Use only when: transformation depends on external state (locale, current time, feature flags), or the input is genuinely mutable. The `AsyncPipe` is an impure pipe — it needs to check each cycle whether the Observable has emitted.

```typescript
// Pure pipe — only re-runs when inputs change by reference
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength = 100, ellipsis = '...'): string {
    if (!value || value.length <= maxLength) return value;
    return value.slice(0, maxLength - ellipsis.length).trimEnd() + ellipsis;
  }
}

// Generic pipe with type safety
@Pipe({ name: 'filterBy', standalone: true })
export class FilterByPipe implements PipeTransform {
  transform<T>(items: ReadonlyArray<T>, key: keyof T, value: T[keyof T]): T[] {
    if (!items?.length) return [];
    return [...items].filter(item => item[key] === value);
  }
}
<!-- {{ products | filterBy:'category':'electronics' | filterBy:'inStock':true }} -->

// Impure pipe — re-runs every change detection cycle
@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date | string | number): string {
    const ms = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  }
}

// Pipe that uses injection — services injected in constructor
@Pipe({ name: 'localDate', standalone: true, pure: false })
export class LocalDatePipe implements PipeTransform {
  private i18n = inject(I18nService);
  transform(date: Date | string | number, format: 'short' | 'medium' | 'long' = 'medium'): string {
    return new Intl.DateTimeFormat(this.i18n.currentLocale(), { dateStyle: format })
      .format(new Date(date));
  }
}
```

> 💡 Interview: "When would you use an impure pipe?" When the transformation result depends on state outside the input value — current time, locale, user preferences, feature flags. Warn that impure pipes run every change detection cycle — prefer signals for reactive state-dependent transformations and reserve impure pipes for cases where pipe syntax is required in templates.

---

## Dependency Injection — Architecture

### The Injector Hierarchy

Angular's injector tree is one of its most powerful architectural features. It has four distinct levels:

**Platform Injector** — created once when the Angular platform boots. Contains: `PlatformLocation`, `DOCUMENT`, `PLATFORM_ID`. Shared across multiple Angular applications on the same HTML page.

**Root (Application) Injector** — created when `bootstrapApplication()` runs. Services with `@Injectable({ providedIn: 'root' })` live here — true singletons for the entire application lifetime. Tree-shakable: if nothing injects a root-provided service, it is excluded from the bundle.

**Environment Injector (per lazy route)** — Angular creates a dedicated environment injector for each lazy-loaded route group. Providers in a route's `providers` array live here. Lifetime: created when the lazy route first loads, destroyed when the user navigates away. Services scoped here get fresh instances on each navigation to the feature and are destroyed (with `ngOnDestroy` called) on navigation away. Perfect for wizard state or per-feature caches that should reset on re-entry.

**Element (Component) Injector** — each component instance has its own element injector. Providers in a component's `providers: []` array create instances scoped to that specific component and all its descendants. Created with the component, destroyed with it.

```typescript
// Element-level scoping: per-component service instance
@Injectable()  // no providedIn — must be provided explicitly
export class WizardStateService {
  private steps = signal<StepData[]>([]);
  private currentStep = signal(0);
  readonly progress = computed(() => ({
    current: this.currentStep(),
    total: this.steps().length,
    percent: this.steps().length > 0
      ? Math.round((this.currentStep() / this.steps().length) * 100) : 0
  }));
}

@Component({
  providers: [WizardStateService],  // each WizardComponent gets its own instance
  template: `...`
})
export class WizardComponent {
  state = inject(WizardStateService);  // this instance
}
// WizardStepComponent (child) injects WizardStateService and gets the SAME instance
// as its parent WizardComponent — not the root singleton
```

### inject() Function — Modern DI Pattern

The `inject()` function is the modern alternative to constructor injection. It resolves a token from the current injection context. It can be called: in class field initializers, in the constructor body, in factory providers, and in helper functions called from those contexts. It cannot be called in `ngOnInit`, `ngOnChanges`, event handlers, or async callbacks.

```typescript
@Component({ standalone: true })
export class UserProfileComponent {
  private userService  = inject(UserService);
  private router       = inject(Router);
  private destroyRef   = inject(DestroyRef);
  private cdr          = inject(ChangeDetectorRef);
  private config       = inject(APP_CONFIG);          // InjectionToken

  // Optional injection — returns null if not provided
  private analytics    = inject(AnalyticsService, { optional: true });
  // Skip self — resolve from parent injector
  private parentTheme  = inject(ThemeService, { skipSelf: true, optional: true });
  // Self only — throw if not in this component's own injector
  private formState    = inject(FormStateService, { self: true });

  // Route-derived state from injection context
  private route   = inject(ActivatedRoute);
  private userId  = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id') ?? '')),
    { initialValue: '' }
  );

  user = toSignal(
    toObservable(this.userId).pipe(
      switchMap(id => id ? this.userService.getUser(id) : EMPTY),
    ),
    { initialValue: null }
  );
}
```

> 💡 `inject()` is preferred over constructor injection: (1) No `super()` call required in derived classes — services injected in the base class are inherited automatically. (2) More readable — dependency declared alongside the field that uses it. (3) Enables inject() in helper functions called from an injection context, making composition functions like `takeUntilDestroyed()` possible.

### InjectionToken — Type-Safe Configuration

`InjectionToken` creates a DI token that is not a class. The correct way to inject primitive values, configuration objects, factory functions, or any value that cannot be represented as a class.

```typescript
export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  featureFlags: Record<string, boolean>;
  maxRetries: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig', {
  providedIn: 'root',
  factory: () => ({
    apiBaseUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3001',
    featureFlags: {},
    maxRetries: 3,
  }),
});

// Override in app.config.ts for production:
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: environment.appConfig },
  ]
};

// Usage — fully typed, no casting needed
const config = inject(APP_CONFIG);  // type: AppConfig
const apiUrl = config.apiBaseUrl;   // string

// Multi-provider tokens — multiple values for the same token
export const VALIDATORS_TOKEN = new InjectionToken<ValidatorFn[]>('Validators');
{ provide: VALIDATORS_TOKEN, useValue: requiredValidator, multi: true },
{ provide: VALIDATORS_TOKEN, useValue: emailValidator,    multi: true },
// inject(VALIDATORS_TOKEN) returns [requiredValidator, emailValidator]
```

### All Provider Types

- **`useClass`** — provide an instance of the given class. Angular instantiates it and injects its dependencies. Most common. Use to swap real vs mock implementations.
- **`useExisting`** — alias — redirect one token to another already registered. Both tokens resolve to the same instance. Use for backwards compatibility or when a component expects a different interface.
- **`useValue`** — provide a literal value (object, array, string, number, function) directly without instantiation. Also used for `NG_VALUE_ACCESSOR` registration.
- **`useFactory`** — provide the result of a function call. The factory can inject other services via `inject()`. Use when the provided value requires computation or depends on runtime values.

```typescript
// useFactory examples
{
  provide: Logger,
  useFactory: () => {
    const config = inject(APP_CONFIG);
    return config.production ? new ProductionLogger() : new DevelopmentLogger();
  }
}

// Platform-specific implementation (browser vs SSR)
{
  provide: StorageService,
  useFactory: () => {
    const platformId = inject(PLATFORM_ID);
    return isPlatformBrowser(platformId)
      ? new BrowserStorageService()  // uses localStorage
      : new ServerStorageService();  // uses in-memory map
  }
}
```

---

## Routing — Complete Reference

### provideRouter — All Configuration Options

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(SelectivePreloadingStrategy),
      withComponentInputBinding(),       // route data flows to component inputs
      withViewTransitions(),             // View Transitions API for animated route changes
      withInMemoryScrollingOptions({ scrollPositionRestoration: 'enabled' }),
      withRouterConfig({
        onSameUrlNavigation: 'reload',  // re-run guards/resolvers on same URL
        paramsInheritanceStrategy: 'always', // child routes inherit parent params
      }),
    ),
  ]
};
```

### Route Configuration — Every Option

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — MyApp',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [authGuard],
  },

  {
    path: 'products/:productId',
    loadComponent: () => import('./products/detail/product-detail.component')
      .then(m => m.ProductDetailComponent),
    title: (route) => `Product ${route.paramMap.get('productId')} — MyApp`,
    canActivate: [authGuard],
    canMatch: [premiumGuard],
    resolve: { product: productResolver },
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard],
    canActivateChild: [adminRoleGuard],
    data: { breadcrumb: 'Admin' },
  },

  // Named router outlet — for modals, panels, sidebars
  { path: 'user/:id', component: UserPanelComponent, outlet: 'panel' },

  { path: '**', loadComponent: () => import('./not-found/not-found.component') },
];

// withComponentInputBinding() — route data flows to component inputs directly
// In the component: no need to inject ActivatedRoute
@Component({ standalone: true })
export class ProductDetailComponent {
  productId = input<string>();    // from :productId route param
  tab       = input<string>();    // from ?tab=reviews query param
  product   = input<Product>();   // from resolve: { product: productResolver }
  breadcrumb = input<string>();   // from data: { breadcrumb: '...' }
}
```

### Guards — Every Type

```typescript
// canActivate — prevent navigation to a route
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  // Return UrlTree to redirect — cleaner than router.navigate() which races
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
    queryParamsHandling: 'merge'
  });
};

// canActivateChild — guard applies to all children
export const adminGuard: CanActivateChildFn = (childRoute, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'admin') return true;
  return router.createUrlTree(['/unauthorized']);
};

// canDeactivate — prevent leaving a route (unsaved changes)
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  return inject(ConfirmDialogService).confirm(
    'Discard unsaved changes?',
    'Your changes will be lost if you leave this page.'
  );
};

// canMatch — determine whether to match a route at all (before canActivate)
export const premiumGuard: CanMatchFn = (route, segments) => {
  return inject(SubscriptionService).isPremium();
};

// resolve — fetch data before the component renders
export const productResolver: ResolveFn<Product> = (route) => {
  const id = route.paramMap.get('productId')!;
  return inject(ProductService).getProduct(id).pipe(
    catchError(() => {
      inject(Router).navigate(['/not-found']);
      return EMPTY;
    })
  );
};
```

### Custom Preloading Strategy

```typescript
// Mark routes for preloading in route config:
{ path: 'products', loadChildren: ..., data: { preload: true } }
{ path: 'reports',  loadChildren: ..., data: { preload: false } }

@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data?.['preload'] === true ? load() : EMPTY;
  }
}

// Register: provideRouter(routes, withPreloading(SelectivePreloadingStrategy))
```

---

## Reactive Forms — Complete Reference

### Typed Forms — Every Type Explained

Angular 14 introduced fully typed forms. Every `FormGroup`, `FormControl`, and `FormArray` now has type parameters reflecting the shape of the form value.

```typescript
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Typed form group using FormBuilder.nonNullable
private fb = inject(FormBuilder);

const form = this.fb.nonNullable.group({
  email:    ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  role:     ['viewer' as const, Validators.required],
  profile: this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
  }),
});

// Types:
// form.value              → { email: string; password: string; role: 'viewer'; profile: {...} }
// form.controls.email     → FormControl<string>
// form.controls.role      → FormControl<'viewer'>
// form.getRawValue()      → always returns all values including disabled controls
// form.value              → returns only enabled controls' values

// Access controls without string indexing
form.controls.email.value;
form.controls.profile.controls.firstName.value;
```

### Validators and Async Validators

```typescript
// Custom synchronous validator
export function forbiddenValueValidator(forbidden: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = /admin/.test(control.value);
    return forbidden ? { forbiddenValue: { value: control.value } } : null;
  };
}

// Cross-field validator — applied to the group, not individual control
export function passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const password    = group.get('password')?.value;
  const confirmPw   = group.get('confirmPassword')?.value;
  return password === confirmPw ? null : { passwordMismatch: true };
};

const registrationForm = this.fb.nonNullable.group({
  password:        ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
}, { validators: passwordMatchValidator });

// Async validator — check username availability
export function usernameAvailableValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return timer(400).pipe(
      // Debounce: wait 400ms after last keystroke
      switchMap(() => userService.checkUsername(control.value)),
      map(available => available ? null : { usernameTaken: true }),
      catchError(() => of(null))  // don't invalidate on network error
    );
  };
}

// Usage: while pending, control.status === 'PENDING'
username: ['', [Validators.required, Validators.minLength(3)],
               [usernameAvailableValidator(inject(UserService))]]
```

### ControlValueAccessor — Complete Implementation

`ControlValueAccessor` is the interface that allows a custom component to integrate with Angular's reactive forms. Implementing it makes your component work with `formControl`, `formControlName`, and `ngModel`.

```typescript
// Phone input component — combines country code + local number into one form value
@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="phone-input">
      <select [formControl]="countryCodeControl">
        <option value="+1">🇺🇸 +1</option>
        <option value="+44">🇬🇧 +44</option>
        <option value="+61">🇦🇺 +61</option>
      </select>
      <input [formControl]="numberControl" type="tel" placeholder="Phone number">
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, OnInit {
  countryCodeControl = new FormControl('+1', { nonNullable: true });
  numberControl      = new FormControl('', { nonNullable: true });
  isDisabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    combineLatest([this.countryCodeControl.valueChanges, this.numberControl.valueChanges])
      .pipe(takeUntilDestroyed())
      .subscribe(([code, number]) => {
        this.onChange(`${code}${number.replace(/\D/g, '')}`);
      });
  }

  writeValue(value: string | null): void {
    if (!value) {
      // { emitEvent: false } is CRITICAL — prevents circular updates
      this.countryCodeControl.setValue('+1', { emitEvent: false });
      this.numberControl.setValue('', { emitEvent: false });
      return;
    }
    const parsed = parsePhoneNumber(value);
    this.countryCodeControl.setValue(parsed.countryCode, { emitEvent: false });
    this.numberControl.setValue(parsed.nationalNumber, { emitEvent: false });
  }

  registerOnChange(fn: (v: string) => void): void  { this.onChange = fn; }
  registerOnTouched(fn: () => void): void          { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
    disabled ? this.countryCodeControl.disable() : this.countryCodeControl.enable();
    disabled ? this.numberControl.disable()      : this.numberControl.enable();
  }
}
```

> ⚠️ The most common CVA mistake: forgetting `{ emitEvent: false }` in `writeValue()`. Without it, `setValue()` triggers `valueChanges`, which calls `onChange()`, which the outer form interprets as a user change — potentially triggering validators and change events incorrectly.

### Dynamic FormArrays

```typescript
@Component({ standalone: true, imports: [ReactiveFormsModule, CurrencyPipe] })
export class InvoiceFormComponent {
  private fb = inject(FormBuilder);

  invoiceForm = this.fb.nonNullable.group({
    invoiceNumber: ['', Validators.required],
    dueDate: ['', Validators.required],
    lineItems: this.fb.array([this.createLineItem()]),
  });

  get lineItems(): FormArray {
    return this.invoiceForm.controls.lineItems;
  }

  createLineItem(): FormGroup {
    return this.fb.nonNullable.group({
      description: ['', Validators.required],
      quantity:    [1, [Validators.required, Validators.min(1)]],
      unitPrice:   [0, [Validators.required, Validators.min(0)]],
    });
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  getSubtotal(index: number): number {
    const item = this.lineItems.at(index).getRawValue();
    return item.quantity * item.unitPrice;
  }

  invoiceTotal = computed(() =>
    this.lineItems.controls.reduce((sum, control) => {
      const { quantity, unitPrice } = control.getRawValue();
      return sum + quantity * unitPrice;
    }, 0)
  );
}
```

---

## Production Signal Store Pattern

```typescript
// Complete production-grade signal store with filtering, sorting, pagination,
// optimistic updates, and pessimistic updates
@Injectable({ providedIn: 'root' })
export class UserStore {
  private api        = inject(UserApiService);
  private destroyRef = inject(DestroyRef);

  // Private state signal — never expose writable version
  private _state = signal<UserStoreState>({
    users: [],
    selectedIds: new Set(),
    filters: { search: '', role: 'all', active: 'all' },
    pagination: { page: 1, pageSize: 25, totalItems: 0 },
    sortField: 'name',
    sortDir: 'asc',
    loadStatus: 'idle',
    error: null,
    pendingOperations: new Map(),
  });

  // Public read-only slices
  readonly users      = computed(() => this._state().users);
  readonly filters    = computed(() => this._state().filters);
  readonly pagination = computed(() => this._state().pagination);
  readonly isLoading  = computed(() => this._state().loadStatus === 'loading');
  readonly hasError   = computed(() => this._state().loadStatus === 'error');
  readonly error      = computed(() => this._state().error);

  // Derived computed signals
  readonly filteredUsers = computed(() => {
    const { search, role, active } = this.filters();
    let result = this.users();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (role !== 'all')   result = result.filter(u => u.role === role);
    if (active !== 'all') result = result.filter(u => u.active === active);
    return result;
  });

  readonly sortedUsers = computed(() => {
    const field = this._state().sortField;
    const dir   = this._state().sortDir;
    return [...this.filteredUsers()].sort((a, b) => {
      const av = a[field], bv = b[field];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  readonly pagedUsers = computed(() => {
    const { page, pageSize } = this.pagination();
    const start = (page - 1) * pageSize;
    return this.sortedUsers().slice(start, start + pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredUsers().length / this.pagination().pageSize)
  );

  // Actions
  load(force = false): void {
    if (this.isLoading()) return;
    if (this._state().loadStatus === 'success' && !force) return;
    this.patch({ loadStatus: 'loading', error: null });
    this.api.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: users => this.patch({ users, loadStatus: 'success' }),
        error: err  => this.patch({ loadStatus: 'error', error: err.message }),
      });
  }

  setFilters(filters: Partial<UserFilters>): void {
    this._state.update(s => ({
      ...s,
      filters: { ...s.filters, ...filters },
      pagination: { ...s.pagination, page: 1 },  // reset to page 1 on filter change
    }));
  }

  setPage(page: number): void {
    this._state.update(s => ({ ...s, pagination: { ...s.pagination, page } }));
  }

  // Optimistic update — apply immediately, roll back on error
  updateUser(id: string, changes: Partial<User>): void {
    const snapshot = this.users();
    this._state.update(s => ({
      ...s,
      users: s.users.map(u => u.id === id ? { ...u, ...changes } : u),
      pendingOperations: new Map(s.pendingOperations).set(id, 'update'),
    }));
    this.api.update(id, changes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => this._state.update(s => ({
          ...s,
          users: s.users.map(u => u.id === id ? updated : u),
          pendingOperations: (() => {
            const ops = new Map(s.pendingOperations);
            ops.delete(id);
            return ops;
          })(),
        })),
        error: () => this._state.update(s => ({
          ...s,
          users: snapshot,  // roll back to pre-optimistic state
          pendingOperations: (() => {
            const ops = new Map(s.pendingOperations);
            ops.delete(id);
            return ops;
          })(),
        })),
      });
  }

  // Private helper — partial state update
  private patch(partial: Partial<UserStoreState>): void {
    this._state.update(s => ({ ...s, ...partial }));
  }
}
```

---

*Next: [RxJS & State Management](./rxjs-and-state-management.md)*
