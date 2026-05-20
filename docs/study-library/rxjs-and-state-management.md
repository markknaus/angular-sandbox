# RxJS & State Management
### The Complete Senior Developer Reference

> Observable contract, cold/hot streams, multicasting, all Subject types, subscription management, all four flattening operators, combination operators, filtering and transformation, error handling, schedulers, marble testing, Zone.js internals, Signal Store, NgRx classic, NgRx Signals Store, state management decision framework

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [The Observable Contract](#the-observable-contract)
- [Creating Observables — Every Creation Operator](#creating-observables--every-creation-operator)
- [Cold vs Hot — The Complete Mental Model](#cold-vs-hot--the-complete-mental-model)
- [Subjects — All Four Types](#subjects--all-four-types)
- [Subscription Management — All Patterns](#subscription-management--all-patterns)
- [The Four Flattening Operators](#the-four-flattening-operators)
- [Combination Operators](#combination-operators)
- [Filtering and Transformation Operators](#filtering-and-transformation-operators)
- [Error Handling — Production Patterns](#error-handling--production-patterns)
- [RxJS Schedulers](#rxjs-schedulers)
- [Marble Testing](#marble-testing)
- [Zone.js — The Complete Internals](#zonejs--the-complete-internals)
- [Angular Compilation — What Happens at Build Time](#angular-compilation--what-happens-at-build-time)
- [HttpClient — The Complete API](#httpclient--the-complete-api)
- [Performance — Core Web Vitals in Depth](#performance--core-web-vitals-in-depth)
- [State Management — Signal Store](#state-management--signal-store)
- [NgRx — Classic Pattern](#ngrx--classic-pattern)
- [NgRx Signals Store](#ngrx-signals-store)
- [State Management Decision Framework](#state-management-decision-framework)


## The Observable Contract

An Observable is a lazy, potentially asynchronous data source governed by a strict behavioural contract. The contract gives operators and consumers predictable guarantees:

- **Lazy** — no work begins until `subscribe()` is called. An Observable is a blueprint, not an execution. This is the fundamental difference from a Promise, which executes immediately on construction. `http.get('/api/users')` creates an Observable — no HTTP request fires until you subscribe.
- **Zero or more values** — an Observable can emit nothing (`EMPTY`), one value and complete (like an HTTP call), or infinite values (like a timer). There is no fixed count.
- **next / error / complete** — exactly one of `error` or `complete` can terminate the stream. After either, no more `next` emissions occur.
- **Cancellable** — subscribing returns a `Subscription`. Calling `subscription.unsubscribe()` cancels the subscription. For HTTP requests, this actually cancels the in-flight XHR request — a significant advantage over Promises.
- **Unicast by default** — a cold Observable creates a new producer for each subscriber. `shareReplay()`, `share()`, and Subjects convert unicast to multicast.

```typescript
// The Observable contract demonstrated:
const request$ = this.http.get<User[]>('/api/users');
// No HTTP request yet — Observable is just a description

const sub1 = request$.subscribe(users => console.log('Sub1:', users));
// First HTTP request fires NOW
const sub2 = request$.subscribe(users => console.log('Sub2:', users));
// Second independent HTTP request fires NOW (cold = unicast)

sub1.unsubscribe();  // actually cancels the XHR

// Fix duplicate requests with shareReplay:
const shared$ = this.http.get<User[]>('/api/users').pipe(shareReplay(1));
shared$.subscribe(u => console.log('A:', u));  // ONE request fires
shared$.subscribe(u => console.log('B:', u));  // Gets cached response
```

---

## Creating Observables — Every Creation Operator

- **`of(...values)`** — emits given values synchronously then completes. `of(1, 2, 3)` emits 1, 2, 3, then completes. Use for wrapping synchronous values in Observable streams.
- **`from(iterable | promise | observable)`** — converts arrays, iterables, Promises, or other Observables. `from([1,2,3])` emits each element. `from(fetch('/api'))` wraps a fetch Promise.
- **`fromEvent(target, eventName)`** — creates an Observable from DOM events. `fromEvent(button, 'click')`. HOT — the event listener exists independently of subscriptions.
- **`interval(ms)`** — emits an incrementing integer every `ms` milliseconds starting from 0. Cold — each subscriber gets their own counter.
- **`timer(delay, interval?)`** — emits once after `delay` ms, then optionally at `interval` ms thereafter. `timer(0)` emits once immediately.
- **`EMPTY`** — completes immediately without emitting. Use as a 'do nothing' return in `catchError` or guards.
- **`NEVER`** — never emits and never completes. Use in testing to simulate infinite pending streams.
- **`throwError(() => error)`** — immediately errors. Note the factory function signature — the error is created lazily.
- **`defer(() => Observable)`** — creates a new inner Observable for each subscriber using a factory. Ensures cold behaviour for Observables that would otherwise be created once.
- **`new Observable(subscriber => {...})`** — manual creation. Return a teardown function for cleanup on unsubscribe.

```typescript
// Manual Observable — complete control over emissions and cleanup
const websocket$ = new Observable<ServerMessage>(subscriber => {
  const ws = new WebSocket('wss://api.example.com/events');
  ws.onmessage = event => subscriber.next(JSON.parse(event.data));
  ws.onerror = error => subscriber.error(error);
  ws.onclose = () => subscriber.complete();
  // Teardown — runs on unsubscribe or completion
  return () => {
    if (ws.readyState === WebSocket.OPEN) ws.close();
  };
});
```

---

## Cold vs Hot — The Complete Mental Model

**Cold Observable — producer inside:** the factory creates the producer when `subscribe()` is called and tears it down when unsubscribed. Each subscriber gets their own producer, running from the beginning. Examples: `HttpClient.get()`, `interval()`, `of()`.

**Hot Observable — producer outside:** the producer exists independently of subscriptions. Subscribers tap into an ongoing stream — they only see events that occur after they subscribe. Examples: `fromEvent(button, 'click')`, `Subject.asObservable()`.

**Multicasting — making cold hot:**

```typescript
// share() — reference counted: starts when first subscriber joins,
//           stops when last subscriber leaves, resets when re-subscribed
const clicks$ = fromEvent(document, 'click').pipe(share());

// shareReplay(bufferSize) — replays last N values to late subscribers
const config$ = this.http.get<Config>('/api/config').pipe(shareReplay(1));
config$.subscribe(c => this.applyConfig(c));    // fires HTTP request
config$.subscribe(c => this.logConfig(c));      // gets cached value

// shareReplay with refCount:true — stops source when no subscribers
const safeCache$ = http.get('/api/data').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
// Use refCount:false (default) only when the cache should survive unsubscription
```

---

## Subjects — All Four Types

**`Subject<T>`** — the simplest Subject. `next()`, `error()`, `complete()` are public. New subscribers only receive future emissions — they miss anything emitted before subscribing. Always hide the Subject behind `asObservable()` in the public API to prevent external code from calling `next()`.

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationBus {
  private _notification$ = new Subject<Notification>();
  readonly notification$ = this._notification$.asObservable();
  emit(notification: Notification): void { this._notification$.next(notification); }
}
```

**`BehaviorSubject<T>(initialValue)`** — requires an initial value. New subscribers immediately receive the current value, then future values. `getValue()` returns the current value synchronously. The canonical way to hold observable state in Angular services.

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items.asObservable();
  readonly count$ = this.items$.pipe(map(items => items.length));
  readonly total$ = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + item.price * item.qty, 0))
  );
  readonly items = toSignal(this.items$, { initialValue: [] as CartItem[] });
  readonly count = computed(() => this.items().length);

  addItem(item: CartItem): void {
    const current = this._items.getValue();
    const existing = current.find(i => i.productId === item.productId);
    if (existing) {
      this._items.next(current.map(i =>
        i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
      ));
    } else {
      this._items.next([...current, item]);
    }
  }
  removeItem(productId: string): void {
    this._items.next(this._items.getValue().filter(i => i.productId !== productId));
  }
  clear(): void { this._items.next([]); }
}
```

**`ReplaySubject<T>(bufferSize, windowTime?)`** — buffers the last N emissions. New subscribers receive all buffered values immediately in order, then future values. Use for caching recent data that late-joining subscribers need, implementing undo/redo histories.

```typescript
const log$ = new ReplaySubject<LogEntry>(50); // replay last 50 entries
// A debug panel that opens late gets the last 50 entries then continues live
```

**`AsyncSubject<T>`** — only emits the LAST value, and only when `complete()` is called. Acts exactly like a Promise: one final result. Rarely needed directly — Angular uses it internally in route resolvers.

---

## Subscription Management — All Patterns

An unmanaged subscription to an infinite Observable is a classic Angular memory leak. The subscription holds a reference from the Observable's producer to your callback. If the component is destroyed but the subscription is alive, the callback runs on a garbage-collected component.

**Pattern 1: `async` pipe (best for templates)** — the template engine subscribes and unsubscribes automatically. Triggers `markForCheck()` on new values. Zero boilerplate.

```typescript
// Template: {{ users$ | async }} or @if (loading$ | async) {
// Combine with 'as' to avoid multiple subscriptions:
// @if (userState$ | async; as state) { ... state.user ... state.loading ... }
```

**Pattern 2: `toSignal()` (best for bridging to signals)** — converts an Observable to a Signal with automatic subscription management. The subscription is tied to the injection context where `toSignal()` is called.

```typescript
users = toSignal(this.userService.getAll(), { initialValue: [] as User[] });
// Access in template: {{ users() }} — no async pipe needed
```

**Pattern 3: `takeUntilDestroyed()` (best for TypeScript subscriptions)** — ties the subscription to a component's lifetime. Must be called in an injection context (class field initializer or constructor, not `ngOnInit`).

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class DashboardComponent {
  // In class field (injection context):
  private trackingSubscription = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    takeUntilDestroyed(),
  ).subscribe(e => this.analytics.trackPage(e.url));

  // In constructor (also injection context):
  constructor() {
    this.store.alerts$.pipe(
      takeUntilDestroyed(),
    ).subscribe(alerts => this.notificationService.showAlerts(alerts));
  }

  ngOnInit(): void {
    // takeUntilDestroyed() CANNOT be called here — ngOnInit is not an injection context
    // Inject DestroyRef in the constructor and pass it instead:
    this.dataService.stream$.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.processData(data));
  }
}
```

**Pattern 4: `takeUntil(destroy$)` — classic pre-Angular 16 pattern** — a Subject that emits once in `ngOnDestroy` serves as a termination signal.

```typescript
private destroy$ = new Subject<void>();
ngOnInit(): void {
  this.data$.pipe(takeUntil(this.destroy$)).subscribe(this.handleData.bind(this));
}
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## The Four Flattening Operators

These operators convert each outer emission into an inner Observable and manage the relationship between concurrent inner Observables. Choosing the wrong one produces subtle bugs: duplicate requests, missed responses, or locked UI states.

The key question: **When a NEW outer value arrives while an inner Observable is already running — what happens?**

**`switchMap` — cancel previous, subscribe to new:** unsubscribes from the currently active inner Observable and immediately subscribes to a new one derived from the new outer value. Only the last inner Observable survives.

Use when: only the latest result matters and stale results should be discarded. Search-as-you-type, route parameter changes, auto-save on keystroke.

```typescript
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(q => q.trim().length >= 2),
  switchMap(query =>
    this.searchApi.search(query).pipe(
      catchError(() => of({ results: [], error: true }))
    )
  ),
  takeUntilDestroyed(),
).subscribe(response => this.results.set(response.results));
```

**`mergeMap` — all concurrent, order not preserved:** subscribes to every new inner Observable without cancelling existing ones. All run simultaneously. Results arrive in completion order.

Use when: ALL results matter and can run in parallel, order is unimportant. Uploading multiple files, sending multiple notifications, prefetching route bundles.

```typescript
from(filesToUpload).pipe(
  mergeMap(
    file => this.uploadService.upload(file).pipe(
      catchError(err => of({ file: file.name, error: err.message, success: false }))
    ),
    4,  // maximum 4 concurrent uploads
  ),
  toArray(),
).subscribe(allResults => this.showUploadSummary(allResults));
```

**`concatMap` — queue and serialize, order preserved:** if no inner is running, subscribes immediately; otherwise queues. Processes inners one at a time, in emission order.

Use when: ALL results matter AND order matters AND concurrency is not allowed. Command queues, sequential database writes, playlist download in order.

```typescript
commandSubject.pipe(
  concatMap(cmd =>
    this.commandService.execute(cmd).pipe(
      retry(2),
      catchError(err => {
        this.commandError$.next({ cmd, error: err });
        return EMPTY;  // continue processing queue after error
      })
    )
  )
).subscribe(result => this.processCommandResult(result));
```

**`exhaustMap` — ignore while busy:** if an inner IS running, the new outer emission is silently dropped. Only when the current inner completes will the next outer emission be processed.

Use when: duplicate requests must be prevented. Login button, form submit, pay button, print button — any action where a second click while the first is in-flight means do nothing.

```typescript
fromEvent<MouseEvent>(this.loginBtn.nativeElement, 'click').pipe(
  exhaustMap(() => {
    const { email, password } = this.loginForm.getRawValue();
    return this.authService.login(email, password).pipe(
      tap(result => {
        this.tokenService.store(result.token);
        this.router.navigate([result.redirectUrl || '/dashboard']);
      }),
      catchError(err => {
        this.loginError.set(err.status === 401 ? 'Invalid credentials' : 'Login failed');
        return EMPTY;  // EMPTY completes the inner — exhaustMap unlocks
      })
    );
  }),
  takeUntilDestroyed(),
).subscribe();
```

> The `exhaustMap` gotcha: returning `EMPTY` in `catchError` is essential. If you return `throwError()`, the exhaustMap outer stream errors and terminates — the button permanently stops working after the first error.

---

## Combination Operators

**`combineLatest([a$, b$, c$])`** — emits `[latestA, latestB, latestC]` whenever ANY source emits. Requires ALL sources to have emitted at least once before emitting. Use for view models combining multiple data streams.

```typescript
combineLatest({
  user: this.authStore.user$,
  permissions: this.permissionService.permissions$,
  features: this.featureFlagService.flags$,
  locale: this.i18nService.currentLocale$,
}).pipe(
  map(({ user, permissions, features, locale }) => ({
    displayName: user?.displayName ?? 'Guest',
    canExport: permissions.includes('data:export'),
    showBetaFeature: features['beta-dashboard'] === true,
    dateFormat: locale.dateFormat,
  })),
  distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  takeUntilDestroyed(),
).subscribe(vm => this.viewModel.set(vm));
```

**`forkJoin({ key: obs$ })`** — waits until ALL source Observables complete, then emits one object. Like `Promise.all()` but for Observables. Important: if any source never completes (like a `BehaviorSubject`), `forkJoin` never emits. If any source errors, `forkJoin` immediately errors.

```typescript
this.loading.set(true);
forkJoin({
  profile: this.userService.getProfile(this.userId),
  preferences: this.prefsService.getPreferences(this.userId),
  subscriptions: this.subService.getSubscriptions(this.userId),
  availablePlans: this.plansService.getPlans(),
}).pipe(
  takeUntilDestroyed(this.destroyRef),
  finalize(() => this.loading.set(false)),
).subscribe({
  next: ({ profile, preferences, subscriptions, availablePlans }) => {
    this.profile.set(profile);
    this.preferences.set(preferences);
    this.subscriptions.set(subscriptions);
    this.availablePlans.set(availablePlans);
  },
  error: err => this.error.set(err.message),
});
```

**`withLatestFrom(b$)`** — when the SOURCE emits, pair its value with the latest from `b$`. `b$` does not trigger combinations — only source emissions do. Use when you need another stream's current value at the moment of an event.

```typescript
this.submitClicks$.pipe(
  withLatestFrom(this.activeFilters$, this.sortState$),
  switchMap(([_, filters, sort]) =>
    this.reportService.generate({ filters, sort })
  ),
).subscribe(report => this.downloadReport(report));
```

**`merge(a$, b$, c$)`** — every emission from any source passes through. Use for combining event streams from multiple sources: `merge(keyboardSave$, autoSaveTick$, blurSave$)`.

**`zip([a$, b$])`** — pairs the Nth emission from `a$` with the Nth from `b$`. Waits for both to emit their Nth value.

**`race([a$, b$])`** — whichever Observable emits first wins; the others are unsubscribed. Use for timeout patterns alongside `timer()`.

---

## Filtering and Transformation Operators

- **`debounceTime(ms)`** — emits a value only after the source is silent for `ms` ms. On each new emission, the timer resets. Use for: search inputs, resize events, scroll events.
- **`throttleTime(ms, {leading, trailing})`** — emits the first value, then ignores for `ms`. Use for: button clicks throttled to once per second, scroll position tracking.
- **`auditTime(ms)`** — ignores emissions for `ms`, then emits the last value seen. Like `throttleTime` but emits the last instead of the first.
- **`distinctUntilChanged(compareFn?)`** — only emits when the current value differs from the previous. Pass a custom comparator for objects: `distinctUntilChanged((a, b) => a.id === b.id)`.
- **`filter(predicate)`** — only emit values where predicate returns true. Essential for routing events: `filter(e => e instanceof NavigationEnd)`.
- **`take(n)`** — take the first n values then complete. `take(1)` for 'fire once' patterns.
- **`takeWhile(predicate, inclusive?)`** — emit while predicate is truthy, then complete.
- **`skip(n)`** — skip the first n values. Use with `BehaviorSubject` to skip the initial value.
- **`map(fn)`** — transform each emission. The fundamental operator.
- **`scan(accumulator, seed)`** — running reduce — emits each intermediate accumulated value. Use for: shopping cart totals, undo stacks, page-accumulated results, state machines.
- **`tap(fn)`** — side effects without altering the stream. Use for logging, debugging, `localStorage` writes, analytics. Does not transform values.
- **`pairwise()`** — emit `[previous, current]` on each emission. Detect value changes.
- **`startWith(value)`** — prepend a value to the stream. Essential with `combineLatest` to provide initial values before the first emission.
- **`bufferTime(ms) / bufferCount(n)`** — accumulate emissions into arrays. Use for batching API calls or analytics events.

---

## Error Handling — Production Patterns

Errors in RxJS permanently terminate the stream if unhandled. For long-lived streams like search inputs or WebSocket connections, a single unhandled error means the feature stops working for the rest of the user's session.

```typescript
// Pattern 1: recover with fallback value
http.get<User[]>('/api/users').pipe(
  catchError(err => {
    this.errorStore.record(err);
    return of([] as User[]);  // stream continues with empty array
  })
)

// Pattern 2: protect long-lived stream — inner catchError per request
// The outer stream (searchQuery$) NEVER errors
this.searchQuery$.pipe(
  switchMap(query =>
    this.api.search(query).pipe(
      catchError(() => of({ results: [], query, error: true }))  // inner catchError
    )
  ),
).subscribe(response => this.updateResults(response));

// Pattern 3: retry with exponential backoff
http.get<Config>('/api/config').pipe(
  retry({
    count: 4,
    delay: (error: HttpErrorResponse, retryIndex: number) => {
      if (error.status === 0 || error.status >= 500) {
        const backoffMs = Math.min(500 * Math.pow(2, retryIndex - 1), 30_000);
        return timer(backoffMs);
      }
      return throwError(() => error);  // 4xx: don't retry
    },
    resetOnSuccess: true,
  }),
  catchError(() => of(DEFAULT_CONFIG))
)

// Pattern 4: timeout — fail if no response within N seconds
http.get('/api/data').pipe(
  timeout({ each: 10_000 }),
  catchError(err => {
    if (err instanceof TimeoutError) return of({ timedOut: true, data: null });
    return throwError(() => err);
  })
)
```

---

## RxJS Schedulers

A scheduler controls when subscriptions are made and when notifications are delivered. Most developers never use schedulers directly, but understanding them explains some RxJS timing behaviour and schedulers are essential when testing time-dependent operators.

- **`asyncScheduler`** — uses `setTimeout`/`setInterval`. Operators that default to this: `timer()`, `interval()`, `debounceTime()`, `throttleTime()`, `delay()`, `bufferTime()`. In tests, use `TestScheduler` or `jest.useFakeTimers()`.
- **`asapScheduler`** — uses the microtask queue (`queueMicrotask`). Faster than `asyncScheduler` for short delays.
- **`queueScheduler`** — synchronous FIFO queue. Used for recursive operations that should not overflow the call stack.
- **`animationFrameScheduler`** — uses `requestAnimationFrame`. Ideal for animations: `observeOn(animationFrameScheduler)` ensures values are processed in sync with the browser's repaint cycle.

```typescript
// Smooth animation: process position updates in sync with RAF
mousePosition$.pipe(
  observeOn(animationFrameScheduler),
  distinctUntilChanged((a, b) => a.x === b.x && a.y === b.y),
).subscribe(pos => {
  element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
});
```

---

## Marble Testing

Marble diagrams represent Observable behaviour as a string of characters on a timeline. Each character position represents a 10ms frame in the TestScheduler's virtual time.

**Marble syntax:**
- `-` — one empty frame (10ms)
- `a-z` — an emission with value from the `values` object
- `|` — completion
- `#` — error
- `( )` — group synchronous emissions
- `^` — subscription point (hot observables)
- `!` — unsubscription point

```typescript
// Reading marble diagrams:
'a---b--c---|'
// a at frame 0, b at frame 40, c at frame 70, complete at 110

'--#'
// Error at frame 20

'(ab)--c|'
// a and b emit synchronously at frame 0, c at frame 30, complete at 40

// Full marble test example
describe('debounce operator', () => {
  it('should emit last value after silence period', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
    scheduler.run(({ cold, expectObservable, time }) => {
      const source = cold('a-b--c---|');
      const debounced = source.pipe(debounceTime(time('--|'), scheduler));
      expectObservable(debounced).toBe('------c--|');
    });
  });
});

// switchMap marble test
scheduler.run(({ cold, hot, expectObservable }) => {
  const outer = cold('a----b----c---|', { a: 'x', b: 'y', c: 'z' });
  const inner = cold('1-2-3|');
  const result = outer.pipe(switchMap(() => inner));
  expectObservable(result).toBe('1----1----1-2-3|', { '1': '1', '2': '2', '3': '3' });
});
```

---

## Zone.js — The Complete Internals

Zone.js creates execution contexts called 'zones'. Angular uses exactly one zone: NgZone. Zone.js works by monkey-patching the global async APIs with zone-aware versions. The specific APIs Zone.js patches: `setTimeout`, `setInterval`, `Promise`, `fetch`, `XMLHttpRequest`, `addEventListener`, `MutationObserver`, `requestAnimationFrame`, `WebSocket`, and others.

`NgZone.onMicrotaskEmpty` fires when the microtask queue drains — this is when Angular runs change detection. `runOutsideAngular()` executes a function in a zone where callbacks do not trigger change detection — essential for animation loops, WebSocket connections, and high-frequency DOM operations.

```typescript
@Component({ template: `<p>{{ value }}</p>` })
export class ZoneDemo {
  value = 0;
  private ngZone = inject(NgZone);

  // This DOES trigger change detection — runs inside NgZone
  increment() {
    setTimeout(() => {
      this.value++;  // Zone.js patches setTimeout → fires onMicrotaskEmpty → CD runs
    }, 1000);
  }

  // This does NOT trigger change detection — runs outside NgZone
  startAnimation() {
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.updateParticles();  // heavy computation, no template update
        requestAnimationFrame(animate);  // no CD trigger
      };
      requestAnimationFrame(animate);
    });
  }

  // Re-enter NgZone when you DO need a change detection run
  updateFromOutsideZone(newValue: number) {
    this.ngZone.run(() => {
      this.value = newValue;  // triggers change detection
    });
  }
}
```

The performance argument for zoneless Angular: Zone.js patches add overhead to every async operation, not just Angular components. A `setTimeout` in a third-party library triggers Zone.js machinery and potentially Angular change detection. Zoneless Angular (Angular 18+) eliminates this overhead entirely, relying on signals for all reactivity.

---

## Angular Compilation — What Happens at Build Time

Angular templates are compiled to TypeScript/JavaScript at build time (AOT — Ahead of Time). The compiler: (1) parses the template HTML into an AST; (2) resolves which components, directives, and pipes are used; (3) type-checks the template — this is why `user?.name` in a template gives a TypeScript error if the property does not exist; (4) generates a factory function that creates and renders the component; (5) generates update functions that check if bound values changed and update the DOM.

The generated update function for `{{ user.name }}` becomes approximately: `if (ctx.user.name !== previousValue) { updateTextNode(element, ctx.user.name); previousValue = ctx.user.name; }`. This is why change detection is fast — it executes compiled JavaScript comparisons, not HTML parsing.

**Ivy (Angular 9+):** key innovation is locality — each component can be compiled independently. Enables faster incremental builds, smaller bundles, and better error messages.

**`ExpressionChangedAfterItHasBeenChecked`** — a development-mode check. After change detection runs, Angular makes a second pass to verify no bindings changed during the update. The fix is always to schedule the change for the next cycle with a signal `set()`, or avoid mutations in lifecycle hooks that run after view initialization.

```typescript
// CAUSE: Mutating state in ngAfterViewInit synchronously
class BadComponent implements AfterViewInit {
  title = 'Loading...';
  ngAfterViewInit() {
    this.title = 'Loaded';  // ERROR: title changed after check!
  }
}

// FIX: Use a signal (scheduled update)
class GoodComponent implements AfterViewInit {
  title = signal('Loading...');
  ngAfterViewInit() {
    this.title.set('Loaded');  // signal update is batched — no error
  }
}
```

---

## HttpClient — The Complete API

- **Type parameters** — `http.get<User[]>('/api/users')` returns `Observable<User[]>`. Angular uses this type for the Observable's generic type only — no runtime validation.
- **`observe` option** — `observe: 'response'` returns the full `HttpResponse<T>` including status and headers. `observe: 'events'` returns every `HttpEvent` — sent, upload progress, download progress, response.
- **`responseType` option** — `'json'` (default), `'text'`, `'blob'` (file downloads), `'arraybuffer'`.
- **`params`** — `HttpParams` or a `Record<string,string>`. `http.get('/api/users', { params: { page: '2', limit: '20' } })`. `HttpParams` is immutable.
- **`headers`** — `HttpHeaders` or a `Record<string,string>`. Also immutable.
- **`withCredentials`** — send cookies with cross-origin requests. Required for cookie-based auth to cross-origin APIs.

```typescript
// 1. Typed GET with query params
getUsers(page: number, filter: string): Observable<Paginated<User>> {
  return this.http.get<Paginated<User>>('/api/users', {
    params: { page: String(page), filter, limit: '20' }
  });
}

// 2. File upload with progress
uploadFile(file: File): Observable<number | User> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<User>('/api/upload', formData, {
    observe: 'events',
    reportProgress: true,
  }).pipe(
    map(event => {
      if (event.type === HttpEventType.UploadProgress) {
        return Math.round(100 * event.loaded / (event.total ?? 1));
      }
      if (event.type === HttpEventType.Response) {
        return event.body as User;
      }
      return 0;
    }),
  );
}

// 3. File download as Blob
downloadFile(fileId: string): Observable<void> {
  return this.http.get(`/api/files/${fileId}`, { responseType: 'blob' }).pipe(
    tap(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file-${fileId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }),
    map(() => void 0),
  );
}
```

---

## Performance — Core Web Vitals in Depth

Core Web Vitals are Google's standardised performance metrics, used as SEO ranking signals. Every senior Angular developer should know what they measure, how to diagnose them, and which Angular patterns affect each one.

**LCP — Largest Contentful Paint:** measures when the largest element in the viewport is rendered. Target: under 2.5 seconds. Angular impacts: SSR dramatically improves LCP (content already in HTML); `NgOptimizedImage` with `priority` adds a preload link for the LCP image; `@defer` blocks should never be used for the LCP element; lazy-loaded routes delay rendering.

**CLS — Cumulative Layout Shift:** measures visual instability — how much elements jump around as the page loads. Target: under 0.1. Angular impacts: images without explicit `width`/`height` cause layout shift (`NgOptimizedImage` requires them); fonts causing FOUT (Flash of Unstyled Text) shift layout; async content appearing above existing content causes CLS.

**INP — Interaction to Next Paint (replaced FID in 2024):** measures the time from any user interaction to the next paint. Target: under 200ms. Angular impacts: long synchronous operations in event handlers block the main thread; excessive change detection (OnPush everywhere reduces work per interaction); large DOM trees (virtual scrolling reduces node count for long lists).

```typescript
// Measure real user Core Web Vitals:
import { onCLS, onINP, onLCP } from 'web-vitals';
onCLS(metric => analytics.track('CLS', { value: metric.value, rating: metric.rating }));
onINP(metric => analytics.track('INP', { value: metric.value, rating: metric.rating }));
onLCP(metric => analytics.track('LCP', { value: metric.value, rating: metric.rating }));

// Angular performance budget (angular.json) — fails build if exceeded:
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "6kb", "maximumError": "10kb" }
]
```

---

## State Management — Signal Store

Signal stores are the recommended state management pattern for Angular 17+ applications that do not need NgRx's DevTools integration. They are plain TypeScript services using signals and `computed()` — no framework boilerplate.

```typescript
interface ProductsState {
  status: 'idle' | 'loading' | 'success' | 'error';
  products: Product[];
  selectedId: string | null;
  filters: { category: string; priceMax: number; inStockOnly: boolean };
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private _state = signal<ProductsState>({
    status: 'idle', products: [], selectedId: null,
    filters: { category: 'all', priceMax: Infinity, inStockOnly: false },
    error: null
  });

  // Public read-only state slices
  readonly products = computed(() => this._state().products);
  readonly status = computed(() => this._state().status);
  readonly filters = computed(() => this._state().filters);
  readonly error = computed(() => this._state().error);
  readonly isLoading = computed(() => this._state().status === 'loading');
  readonly hasError = computed(() => this._state().status === 'error');

  // Derived computed values
  readonly filteredProducts = computed(() => {
    const { category, priceMax, inStockOnly } = this.filters();
    return this.products()
      .filter(p => category === 'all' || p.category === category)
      .filter(p => p.price <= priceMax)
      .filter(p => !inStockOnly || p.inStock);
  });
  readonly productCount = computed(() => this.filteredProducts().length);
  readonly selectedProduct = computed(() =>
    this.products().find(p => p.id === this.selectedId()) ?? null
  );

  private api = inject(ProductsApiService);
  private destroyRef = inject(DestroyRef);

  loadProducts(forceRefresh = false): void {
    if (this._state().status === 'loading') return;
    if (this._state().status === 'success' && !forceRefresh) return;
    this.patchState({ status: 'loading', error: null });
    this.api.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: products => this.patchState({ status: 'success', products }),
      error: err => this.patchState({ status: 'error', error: err.message }),
    });
  }

  updateProduct(id: string, changes: Partial<Product>): void {
    // Optimistic update: apply immediately, revert on error
    const before = this.products();
    this.patchState({
      products: before.map(p => p.id === id ? { ...p, ...changes } : p)
    });
    this.api.update(id, changes).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.patchState({ products: before }),
    });
  }

  selectProduct(id: string | null): void { this.patchState({ selectedId: id }); }
  setFilters(filters: Partial<ProductsState['filters']>): void {
    this._state.update(s => ({ ...s, filters: { ...s.filters, ...filters } }));
  }

  private patchState(patch: Partial<ProductsState>): void {
    this._state.update(s => ({ ...s, ...patch }));
  }
}
```

---

## NgRx — Classic Pattern

Classic NgRx uses strict unidirectional data flow: Components dispatch Actions → Effects handle async side effects → Reducers update State → Selectors derive view-ready data → Components subscribe to Selectors. Every state change is an Action in the action log. This makes debugging complex async sequences predictable.

```typescript
// actions.ts
export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Select User': props<{ userId: string }>(),
    'Create User': props<{ dto: CreateUserDto }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: string }>(),
    'Delete User': props<{ userId: string }>(),
  }
});

// reducer.ts
interface UsersState { users: User[]; selectedUserId: string | null; loading: boolean; error: string | null; }
const initialState: UsersState = { users: [], selectedUserId: null, loading: false, error: null };

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUsers, state => ({ ...state, loading: true, error: null })),
  on(UsersActions.loadUsersSuccess, (state, { users }) => ({
    ...state, users, loading: false, error: null
  })),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),
  on(UsersActions.selectUser, (state, { userId }) => ({
    ...state, selectedUserId: userId
  })),
  on(UsersActions.createUserSuccess, (state, { user }) => ({
    ...state, users: [...state.users, user]
  })),
  on(UsersActions.deleteUser, (state, { userId }) => ({
    ...state, users: state.users.filter(u => u.id !== userId)
  })),
);

// effects.ts
@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(() =>
        this.userService.getAll().pipe(
          map(users => UsersActions.loadUsersSuccess({ users })),
          catchError(err => of(UsersActions.loadUsersFailure({ error: err.message })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      concatMap(({ dto }) =>   // concatMap: queue create requests
        this.userService.create(dto).pipe(
          map(user => UsersActions.createUserSuccess({ user })),
          catchError(err => of(UsersActions.createUserFailure({ error: err.message })))
        )
      )
    )
  );
}

// selectors.ts — memoized derived state
export const selectUsersState = createFeatureSelector<UsersState>('users');
export const selectAllUsers = createSelector(selectUsersState, s => s.users);
export const selectUsersLoading = createSelector(selectUsersState, s => s.loading);
export const selectActiveUsers = createSelector(selectAllUsers, users => users.filter(u => u.active));
export const selectSelectedUser = createSelector(
  selectAllUsers, selectSelectedUserId,
  (users, id) => id ? users.find(u => u.id === id) ?? null : null
);
// createSelector memoizes: only recomputes when input selectors return new values

// Component
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class UsersListComponent {
  private store = inject(Store);
  users = this.store.selectSignal(selectActiveUsers);
  loading = this.store.selectSignal(selectUsersLoading);
  selectedUser = this.store.selectSignal(selectSelectedUser);

  load(): void { this.store.dispatch(UsersActions.loadUsers()); }
  select(userId: string): void { this.store.dispatch(UsersActions.selectUser({ userId })); }
}
```

---

## NgRx Signals Store

NgRx Signals Store (`@ngrx/signals`, stable from NgRx 17) uses Angular signals for reactivity, has no actions/reducers/effects in the classic sense, and generates strongly-typed store methods automatically.

```typescript
import { signalStore, withState, withComputed, withMethods, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

type Product = { id: string; name: string; price: number; category: string; inStock: boolean };

export const ProductStore = signalStore(
  { providedIn: 'root' },

  // withEntities: auto-generates ids(), entities(), entityMap()
  withEntities<Product>(),

  withState({
    selectedId: null as string | null,
    isLoading: false,
    error: null as string | null,
    filter: { category: 'all', inStockOnly: false },
  }),

  withComputed(({ entities, selectedId, filter }) => ({
    selectedProduct: computed(() => entities().find(p => p.id === selectedId()) ?? null),
    filteredProducts: computed(() => {
      const { category, inStockOnly } = filter();
      return entities()
        .filter(p => category === 'all' || p.category === category)
        .filter(p => !inStockOnly || p.inStock);
    }),
    categories: computed(() => ['all', ...new Set(entities().map(p => p.category))]),
    productCount: computed(() => entities().length),
  })),

  withMethods((store, productApi = inject(ProductApiService)) => ({
    selectProduct(id: string | null): void { patchState(store, { selectedId: id }); },
    setFilter(filter: Partial<typeof store.filter>): void {
      patchState(store, (s) => ({ filter: { ...s.filter, ...filter } }));
    },
    loadProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => productApi.getAll().pipe(
          tapResponse({
            next: products => patchState(store,
              setAllEntities(products),
              { isLoading: false }
            ),
            error: (err: Error) => patchState(store, { isLoading: false, error: err.message }),
          })
        ))
      )
    ),
    updateProductPrice: rxMethod<{ id: string; price: number }>(
      pipe(
        tap(({ id, price }) => patchState(store, updateEntity({ id, changes: { price } }))),
        switchMap(({ id, price }) =>
          productApi.updatePrice(id, price).pipe(
            catchError(() => {
              store.loadProducts();  // revert: reload from server
              return EMPTY;
            })
          )
        )
      )
    ),
  })),

  withHooks({
    onInit(store) { store.loadProducts(); },
  })
);

// Usage:
export class ProductListComponent {
  store = inject(ProductStore);
  // store.filteredProducts() — Signal<Product[]>
  // store.isLoading() — Signal<boolean>
  // store.loadProducts() — trigger load
  // store.selectProduct('id') — update selectedId
}
```

---

## State Management Decision Framework

Choosing the right state management approach is a senior-level architectural decision. The answer depends on specific requirements, not personal preference for a library.

- **Component-local signals** — use when state is only needed by one component and its children. Form dirty state, accordion open/closed, dropdown open/closed, tab selection. Never lift to a service — this is YAGNI.
- **Service with signals (signal store pattern)** — use when multiple components across the app need the same data, or when fetching from an API. No need for time-travel debugging. Covers 80% of real-world applications. Start here.
- **NgRx Signals Store** — use when you want signal store simplicity with NgRx entity management (`withEntities`), `rxMethod` for connecting RxJS pipelines, and the option to add DevTools later. Good middle ground for growing teams.
- **Classic NgRx** — use when: time-travel debugging is a contractual or team requirement; audit log of all state changes is needed (financial applications); team is large and needs strict boundaries; state has complex async sequences; you are maintaining an existing NgRx codebase.
- **URL state** — underutilised. Query parameters (`?filter=active&page=2`) are a form of state. Use the Router for filter settings, page numbers, selected tab, search queries. Benefits: bookmarkable, shareable, browser back/forward works.

> The interview trap: "What state management library do you prefer?" The Senior answer is not "NgRx" or "signals". It is: "It depends on team size, application complexity, and specific requirements. I start with the simplest approach — component signals for local state, a service-based signal store for shared state — and add complexity only when I hit a specific problem that simpler patterns cannot solve."

---

*Next: [Testing](./testing.md)*
