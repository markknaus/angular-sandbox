# Angular Architecture & Tooling
### The Complete Senior Developer Reference

> SOLID principles, feature-first structure, smart/dumb components, performance optimisation (@defer, virtual scrolling, NgOptimizedImage), npm, Angular CLI, esbuild/Vite, ESLint/Prettier/Husky, idempotency, webhooks, HTTP interceptors, interview prep, system design

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [SOLID Principles in Angular](#solid-principles-in-angular)
- [Feature-First Folder Structure](#feature-first-folder-structure)
- [Smart / Dumb Components](#smart--dumb-components)
- [Performance Optimisation](#performance-optimisation)
- [HTTP Interceptors — Complete Stack](#http-interceptors--complete-stack)
- [Idempotency](#idempotency)
- [Webhooks](#webhooks)
- [npm — Everything a Senior Should Know](#npm--everything-a-senior-should-know)
- [Angular CLI — Build System and All Commands](#angular-cli--build-system-and-all-commands)
- [ESLint, Prettier, Husky, and Commitlint](#eslint-prettier-husky-and-commitlint)
- [The 10 Most Important Senior Interview Questions](#the-10-most-important-senior-interview-questions)
- [Take-Home Project — Senior Differentiators](#take-home-project--senior-differentiators)
- [System Design: Multi-Tenant B2B SaaS Dashboard](#system-design-multi-tenant-b2b-saas-dashboard)


## SOLID Principles in Angular

SOLID is the set of five design principles that guide object-oriented software design. They are not Angular-specific, but Angular's DI system, component model, and TypeScript types make them particularly natural to apply.

**Single Responsibility Principle (SRP):** every class should have one reason to change. In Angular: components should only be responsible for rendering UI and handling user interactions — not fetching data, not business logic, not routing. Services should focus on one domain (AuthService handles auth; UserService handles user data — not both). A 1000-line component is an SRP violation. Extract smart containers into dumb components + services + stores.

**Open/Closed Principle (OCP):** software should be open for extension but closed for modification. In Angular: use injection tokens and abstract classes to allow extending behaviour without changing existing code. Angular's multi providers are an OCP mechanism — register multiple HTTP_INTERCEPTORS without modifying existing interceptors.

```typescript
// OCP: adding a new validation rule extends behaviour without modifying existing code
export const PASSWORD_VALIDATORS = new InjectionToken<ValidatorFn[]>('PASSWORD_VALIDATORS');

@NgModule({
  providers: [
    { provide: PASSWORD_VALIDATORS, useValue: Validators.minLength(8), multi: true },
    { provide: PASSWORD_VALIDATORS, useValue: uppercaseValidator, multi: true },
    { provide: PASSWORD_VALIDATORS, useValue: specialCharValidator, multi: true },
    // adding a new rule: provide another value — no existing code changes
  ]
})
```

**Liskov Substitution Principle (LSP):** subtypes must be substitutable for their base types. In Angular: if a service extends an abstract base service, any code depending on the base service must work correctly with the subtype. This principle governs correct inheritance and matters most when building extensible class hierarchies.

**Interface Segregation Principle (ISP):** clients should not depend on interfaces they do not use. In Angular: avoid fat interfaces. A `DataService` interface with 20 methods forces every implementer to implement all 20, even if they only use 3. Split into `ReadDataService`, `WriteDataService`, `ExportDataService`. Inject only what the consumer needs.

```typescript
// ISP: component only depends on what it needs
interface Readable<T> { getAll(): Observable<T[]>; getById(id: string): Observable<T>; }
interface Writable<T> { create(dto: unknown): Observable<T>; update(id: string, changes: unknown): Observable<T>; delete(id: string): Observable<void>; }

// ReadOnlyComponent only needs Readable — not Writable
export class ReadOnlyListComponent {
  private service = inject<Readable<User>>(USER_READ_SERVICE);
}
// AdminComponent needs both
export class AdminListComponent {
  private readService = inject<Readable<User>>(USER_READ_SERVICE);
  private writeService = inject<Writable<User>>(USER_WRITE_SERVICE);
}
```

**Dependency Inversion Principle (DIP):** high-level modules should not depend on low-level modules; both should depend on abstractions. Angular's DI container is a direct implementation of DIP. Components depend on service interfaces (abstractions), not concrete implementations. This is why you provide mock services in tests — you are substituting the implementation of the abstraction.

```typescript
// DIP: components depend on the abstract token, not the concrete class
export abstract class AuthService {
  abstract login(credentials: Credentials): Observable<AuthResult>;
  abstract logout(): Observable<void>;
  abstract readonly currentUser: Signal<User | null>;
}

// In production: provide the real implementation
{ provide: AuthService, useClass: OAuthAuthService }

// In tests: provide a mock
{ provide: AuthService, useValue: mockAuthService }

// Component only knows about AuthService (the abstraction)
export class LoginComponent {
  private auth = inject(AuthService);  // could be OAuthAuthService or MockAuthService
}
```

---

## Feature-First Folder Structure

Feature-first organisation (also called "screaming architecture") groups files by business domain rather than technical type. A developer reading the folder structure immediately understands what the application does, not how it is built.

The traditional technical-first structure (`components/`, `services/`, `pipes/`, `guards/`) creates invisible coupling: every feature's files are spread across multiple directories. A change to the users feature touches files in `components/`, `services/`, `guards/`, and `models/`.

Feature-first benefits: cohesion (all code for a feature in one place), lazy loading alignment (each feature folder maps to a lazy route), team ownership (one team owns one feature folder), deletion (removing a feature means deleting one folder), scalability (adding a feature adds a new folder without touching existing code).

```
src/app/
  core/                      # Application-wide singletons
  │  auth/                   # Auth service, token service, auth interceptor, authGuard
  │  http/                   # Error interceptor, retry interceptor, base API service
  │  layout/                 # Shell, navbar, sidebar, breadcrumbs, page-title service
  │  analytics/              # Analytics service, page tracking, event types
  │  error/                  # Global error handler, error page, error store
  └─ index.ts               # Public barrel: exports ONLY what other features may use

  shared/                    # Reusable across features, zero feature knowledge
  │  components/             # Button, Modal, Table, Pagination, Card, Badge, Alert
  │  directives/             # ClickOutside, IntersectionObserver, Permissions, Tooltip
  │  pipes/                  # Truncate, TimeAgo, FileSize, HighlightSearch
  │  validators/             # Custom validators, validator factories
  │  models/                 # Shared interfaces: ApiResponse<T>, Paginated<T>, Address
  └─ utils/                 # Pure functions: formatBytes, deepMerge, groupBy, slugify

  features/
  │  users/                  # The 'Users' business domain
  │  │  data-access/         # All HTTP + state for this feature
  │  │  │  user.service.ts
  │  │  │  user.store.ts
  │  │  │  user.model.ts
  │  │  └─ user.repository.ts
  │  │  ui/                  # Components used ONLY within the Users feature
  │  │  │  user-list/        # Smart container component
  │  │  │  user-detail/
  │  │  │  user-form/
  │  │  └─ user-avatar/
  │  │  users.routes.ts      # Feature routes, lazy-loaded from app.routes.ts
  │  └─ index.ts            # Public API barrel — OTHER features only import from here
  │  products/
  │  orders/
  └─ reports/

  app.config.ts              # provideRouter, provideHttpClient, provideStore, etc.
  app.routes.ts             # Top-level routes — lazy loadChildren for each feature
  app.component.ts          # Root: <router-outlet>, global error display, loading bar
```

> The `index.ts` barrel is the module boundary enforcement mechanism. Pair it with an ESLint rule (from `@nx/enforce-module-boundaries` or a custom rule) that prevents importing from any path that goes deeper than `/features/users/index.ts`.

---

## Smart / Dumb Components

The smart/dumb (container/presentational) split is the most important single architectural pattern in Angular. It enforces single responsibility at the component level, makes components reusable, and makes testing trivially easy.

**Smart components (containers):** coordinate data flow. They inject services and stores, manage subscription lifetimes, handle route-related logic, dispatch actions, and navigate. They have minimal template complexity. They are harder to test but easy to write.

**Dumb components (presentational):** receive data via inputs, display it, emit events via outputs. Zero service dependencies. Always use `ChangeDetectionStrategy.OnPush`. Trivially testable: set inputs, click elements, assert output emissions. Highly reusable across contexts.

```typescript
// Smart container — coordinates data flow
@Component({
  standalone: true,
  imports: [UserTableComponent, UserFormDialogComponent, LoadingSpinnerComponent, ErrorStateComponent],
  template: `
    <header class="page-header">
      <h1>Users</h1>
      <button type="button" (click)="openCreateDialog()">+ Add User</button>
    </header>
    @if (store.isLoading()) { <app-loading-spinner /> }
    @else if (store.hasError()) {
      <app-error-state [message]="store.error()!" (retry)="store.load(true)" />
    } @else {
      <app-user-table
        [users]="store.filteredUsers()"
        [totalCount]="store.totalCount()"
        [currentPage]="currentPage()"
        (pageChange)="onPageChange($event)"
        (userEdit)="onEdit($event)"
        (userDelete)="onDelete($event)"
      />
    }
  `
})
export class UsersPageComponent implements OnInit {
  protected store = inject(UserStore);
  private router = inject(Router);
  private dialog = inject(DialogService);
  protected currentPage = signal(1);
  ngOnInit(): void { this.store.load(); }
  onPageChange(page: number): void { this.currentPage.set(page); this.store.setPage(page); }
  onEdit(userId: string): void { this.router.navigate([userId, 'edit']); }
  onDelete(userId: string): void { this.store.delete(userId); }
  openCreateDialog(): void {
    this.dialog.open(UserFormDialogComponent)
      .afterClosed().pipe(filter(Boolean)).subscribe(dto => this.store.create(dto));
  }
}
```

```typescript
// Dumb component — pure inputs and outputs, no service dependencies
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ALWAYS OnPush for dumb components
  imports: [DatePipe, NgClass],
  template: `
    <table role="grid" [attr.aria-rowcount]="totalCount()">
      <thead>
        <tr>
          <th role="columnheader" (click)="onSort('name')">Name</th>
          <th role="columnheader" (click)="onSort('email')">Email</th>
          <th>Role</th>
          <th><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        @for (user of users(); track user.id) {
          <tr>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button type="button" (click)="userEdit.emit(user.id)"
                      [attr.aria-label]="'Edit ' + user.name">Edit</button>
              <button type="button" (click)="userDelete.emit(user.id)"
                      [attr.aria-label]="'Delete ' + user.name">Delete</button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class UserTableComponent {
  users = input.required<User[]>();
  totalCount = input(0);
  currentPage = input(1);
  pageChange = output<number>();
  sortChange = output<{ field: keyof User; dir: 'asc' | 'desc' }>();
  userEdit = output<string>();
  userDelete = output<string>();
  onSort(field: keyof User): void {
    this.sortChange.emit({ field, dir: 'asc' });
  }
  // No inject() calls — zero service dependencies — trivially testable
}
```

---

## Performance Optimisation

**`@defer` — Template-Level Code Splitting**

Angular 17's `@defer` creates a separate JavaScript bundle for the deferred content. The bundle downloads only when the trigger fires.

```typescript
<!-- Main visible content — no defer -->
<app-summary-cards [stats]="stats()" />
<app-recent-activity [activities]="recentActivity()" />

<!-- Below-fold chart — defer until visible -->
@defer (on viewport; prefetch on idle) {
  <app-revenue-chart [data]="revenueData()" />
} @placeholder { <div class="chart-skeleton"></div> }

<!-- Admin-only section -->
@defer (when isAdmin(); on idle) {
  <app-admin-audit-log />
} @placeholder { <p>Loading audit log...</p> }
```

Best defer strategy by content type: below-fold content → `on viewport; prefetch on idle`. Secondary panel that opens on click → `on interaction; prefetch on hover`. Charts → `on viewport`. Non-critical content → `on idle`. Conditional sections → `when condition()`.

**Virtual Scrolling**

CDK `VirtualScrollViewport` renders only the DOM nodes visible in the viewport. For 10,000 items: without virtual scrolling, 10,000 DOM nodes are created. With virtual scrolling, typically 10–20 rows are in the DOM.

```html
<cdk-virtual-scroll-viewport
  itemSize="72"
  style="height: 600px; overflow-y: auto"
>
  <app-user-row
    *cdkVirtualFor="let user of users(); trackBy: trackById"
    [user]="user"
  />
</cdk-virtual-scroll-viewport>
<!-- For variable-height items, use AutoSizeVirtualScrollStrategy -->
```

**NgOptimizedImage — Every Feature**

```typescript
import { NgOptimizedImage } from '@angular/common';

<!-- Wrong: causes layout shift, no lazy loading, no srcset -->
<img src="/uploads/hero.jpg" class="hero-img">

<!-- Correct: all optimisations applied automatically -->
<img
  ngSrc="/uploads/hero.jpg"
  width="1200"
  height="600"
  priority
  alt="Hero image"
>
<!-- For below-fold images (omit priority): -->
<img ngSrc="{{ user.avatarUrl }}" width="48" height="48" [alt]="user.name" />
```

`NgOptimizedImage` automatically handles: `width` and `height` attributes (prevent CLS), `loading="lazy"` for below-fold images, `fetchpriority="high"` for LCP images, `srcset` generation for responsive images, CDN loader integration.

**Bundle Analysis**

```bash
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/my-app/browser/stats.json
# Or: npx source-map-explorer 'dist/**/*.js'
```

Look for: large third-party libraries with smaller alternatives (moment → date-fns), libraries imported in full instead of tree-shaken, code that should be lazy-loaded appearing in the main bundle, duplicate modules from transitive dependencies.

```json
// angular.json — bundle budgets: fail build if exceeded
"budgets": [
  { "type": "initial", "maximumWarning": "400kb", "maximumError": "800kb" },
  { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
]
```

---

## HTTP Interceptors — Complete Stack

```typescript
// auth.interceptor.ts — adds Bearer token to all requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getAccessToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

// retry.interceptor.ts — auto-retry idempotent requests with exponential backoff
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const IDEMPOTENT = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'];
  if (!IDEMPOTENT.includes(req.method)) return next(req);  // never auto-retry POST
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, attempt: number) => {
        if (error.status === 0 || error.status >= 500) {
          return timer(Math.min(500 * Math.pow(2, attempt - 1), 10_000));
        }
        return throwError(() => error);  // 4xx: don't retry
      },
    })
  );
};

// error.interceptor.ts — centralised error handling
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401: router.navigate(['/login']); break;
        case 403: router.navigate(['/forbidden']); break;
        case 503: notificationService.show('Service temporarily unavailable. Please try again.', 'error'); break;
      }
      return throwError(() => error);
    })
  );
};

// loading.interceptor.ts — global loading indicator
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  if (req.headers.has('X-Skip-Loading')) return next(req);
  loadingService.increment();
  return next(req).pipe(
    finalize(() => loadingService.decrement())
  );
};

// Register all interceptors in app.config.ts:
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        retryInterceptor,
        loadingInterceptor,
        errorInterceptor,
      ])
    ),
  ],
};
```

---

## Idempotency

An operation is **idempotent** if performing it multiple times produces the same result as performing it once. This is one of the most important concepts in API design and distributed systems.

**Why it matters:** networks are unreliable. A client sends a request, the server processes it and sends a response, but the response is lost in transit. Should the client retry? If the operation is idempotent, retrying is safe. If not, retrying could cause problems — charging a payment card twice, sending a welcome email twice, creating a duplicate order.

**HTTP methods and idempotency:**

| Method | Idempotent | Safe | Notes |
|---|---|---|---|
| GET | Yes | Yes | Reading data — always safe to repeat |
| HEAD | Yes | Yes | Same as GET but no body |
| PUT | Yes | No | Replace a resource — same result each time |
| DELETE | Yes | No | First call deletes; second call finds nothing to delete — same server state |
| PATCH | No (usually) | No | Setting absolute values is idempotent; incrementing is not |
| POST | No | No | Create — creates a new resource each time |
| OPTIONS | Yes | Yes | Metadata query |

**Implementing idempotency for POST:** use an **idempotency key**. The client generates a unique UUID for each distinct operation and includes it in the request header. The server stores the result keyed by this ID. On a retry with the same key, the server returns the stored result.

```
POST /api/orders
Idempotency-Key: 7f9c8b2a-1234-5678-abcd-ef0123456789
Content-Type: application/json

{ "userId": "123", "items": [...], "total": 99.99 }
```

```typescript
// Angular: safe retry logic respects idempotency
// Safe to auto-retry — GET is idempotent
this.http.get<User[]>('/api/users').pipe(
  retry({ count: 3, delay: 1000 })
);

// NOT safe to auto-retry without an idempotency key
this.http.post<Order>('/api/orders', orderData).pipe(
  catchError(err => {
    this.errorMessage.set('Order submission failed. Please try again.');
    return EMPTY;
  })
);

// Safe to auto-retry WITH an idempotency key
this.http.post<Order>('/api/orders', orderData, {
  headers: { 'Idempotency-Key': crypto.randomUUID() }
}).pipe(
  retry({ count: 2, delay: 1000 })
);
```

Stripe's payment API is the canonical example — every payment request accepts an `Idempotency-Key` header precisely to handle the "did the payment go through?" retry problem.

---

## Webhooks

A webhook is an HTTP callback — a mechanism where a third-party service notifies your application when an event occurs by sending an HTTP POST request to a URL you specify. Instead of your application polling "has anything changed?", the third party pushes a notification the moment something happens.

**Webhooks vs other real-time mechanisms:**

| Mechanism | Direction | Use case |
|---|---|---|
| Polling | Client pulls | Client repeatedly asks — simple but inefficient |
| WebSocket | Bidirectional, persistent | Real-time two-way communication |
| Server-Sent Events | Server pushes | One-way server-to-browser stream |
| Webhook | Server-to-server push | Event notification between backend services |

Webhooks are server-to-server. Your Angular application does not receive webhooks directly — your Spring Boot backend receives them, processes them, and optionally pushes updates to the Angular frontend via WebSocket or Server-Sent Events.

**Common webhook use cases:** Stripe/PayPal sends a webhook when a payment succeeds or fails. SendGrid sends a webhook when an email bounces. GitHub sends a webhook when a pull request is merged (triggers CI/CD).

**Implementing a webhook endpoint:**

```java
@RestController
@RequestMapping("/webhooks")
public class WebhookController {
  private final String stripeWebhookSecret;

  @PostMapping("/stripe")
  public ResponseEntity<Void> handleStripeWebhook(
      @RequestHeader("Stripe-Signature") String signature,
      @RequestBody String payload) {

    try {
      // 1. Verify the webhook signature — CRITICAL security step
      Event event = Webhook.constructEvent(payload, signature, stripeWebhookSecret);

      // 2. Process asynchronously — respond quickly (within 5 seconds)
      webhookProcessor.processAsync(event);

      // 3. Return 200 immediately — indicates receipt, not completion
      return ResponseEntity.ok().build();

    } catch (SignatureVerificationException e) {
      return ResponseEntity.status(400).build();
    }
  }
}
```

**Webhook security — signature verification:** providers sign payloads with a shared secret (typically HMAC-SHA256) included in a request header. Your endpoint computes the expected signature and compares. Never skip signature verification — without it, anyone can send fake webhook payloads.

**Webhook reliability:** webhook handlers must be idempotent. The same event may be delivered multiple times. Store the event ID and check before processing:

```java
private void handlePaymentSucceeded(PaymentIntent paymentIntent) {
  if (processedEventRepository.existsById(paymentIntent.getId())) {
    return;  // duplicate — skip
  }
  orderService.markAsPaid(orderId, paymentIntent.getId());
  processedEventRepository.save(new ProcessedEvent(paymentIntent.getId(), Instant.now()));
}
```

**Local development:** use ngrok (`ngrok http 8080` → gives you a public URL) or the Stripe CLI (`stripe listen --forward-to localhost:8080/webhooks/stripe`) to receive webhooks locally.

---

## npm — Everything a Senior Should Know

- **`npm ci` vs `npm install`** — `npm ci` reads `package-lock.json` exactly, fails if out of sync with `package.json`, deletes `node_modules` first. Use in CI. `npm install` resolves semver ranges, updates `package-lock.json`. Use in development.
- **Semver ranges** — `^` (caret) = same major, any minor/patch: `^17.3.0` → `>=17.3.0 <18.0.0`. `~` (tilde) = same major.minor: `~17.3.0` → `>=17.3.0 <17.4.0`. No prefix = exact version. `*` = any version (dangerous).
- **`npm audit`** — scans the dependency tree against the npm advisory database. `npm audit --audit-level=high`: fail only on high/critical. `npm audit fix`: auto-fix within semver range. `npm audit fix --force`: allow breaking changes (review carefully).
- **Peer dependencies** — declare dependencies the consumer must provide. Angular libraries use peerDependencies for `@angular/core` to avoid bundling Angular twice.
- **npm workspaces** — manage multiple packages in one repository with shared `node_modules`. Define in root `package.json`: `{ "workspaces": ["apps/*", "packages/*"] }`.

```bash
npm ls <package>            # see why a package is in your tree (full dep chain)
npm outdated                # list available updates for all dependencies
npm dedupe                  # remove duplicate transitive dependencies
npm pack --dry-run          # simulate publishing: see exactly what gets included
npm exec <bin> -- <args>    # run a local binary without npx ambiguity
```

---

## Angular CLI — Build System and All Commands

Angular 17 replaced Webpack with **esbuild** for production builds and **Vite** for the development server. Build times reduced by 60–90% for most projects. The CLI abstracts this — same commands, vastly different speed.

```bash
# Project setup
ng new my-app --standalone --routing --style=scss --ssr=false
ng add @angular/material
ng add @angular/pwa
ng add jest-preset-angular
ng add @angular/ssr

# Code generation
ng g c features/products/ui/product-list --standalone --skip-tests=false
ng g s features/products/data-access/product --skip-tests=false
ng g guard core/auth/auth --functional --implements CanActivate
ng g interceptor core/http/auth --functional
ng g pipe shared/pipes/time-ago --standalone
ng g directive shared/directives/click-outside --standalone

# Build
ng build                               # development build
ng build --configuration production    # production (minified, optimised, tree-shaken)
ng build --stats-json                  # generate stats.json for bundle analysis
ng build --source-map                  # include source maps in production

# Development server
ng serve                               # localhost:4200 with live reload
ng serve --proxy-config proxy.conf.json # proxy /api requests to backend
ng serve --configuration staging

# Testing
ng test                                # run all tests in watch mode
ng test --watch=false --code-coverage  # CI mode: run once, generate coverage

# Code quality
ng lint --max-warnings 0              # fail if any warnings

# Angular version management
ng update                             # check for available updates
ng update @angular/core @angular/cli  # update (runs migration schematics)
```

```json
// proxy.conf.json — proxy API calls to avoid CORS in development
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## ESLint, Prettier, Husky, and Commitlint

```bash
ng add @angular-eslint/schematics
npm install -D prettier eslint-config-prettier lint-staged
npm install -D husky @commitlint/cli @commitlint/config-conventional
```

```json
// .eslintrc.json — key rules to enforce
{
  "overrides": [{
    "files": ["*.ts"],
    "rules": {
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error"
    }
  }]
}
```

```json
// .prettierrc
{
  "singleQuote": true,
  "semi": false,
  "printWidth": 120,
  "trailingComma": "es5"
}
```

```bash
# commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };
# Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
# Format: type(optional-scope): description
# feat(users): add email verification step to registration
# fix(auth): refresh token not cleared on signout
```

```json
// package.json lint-staged config
"lint-staged": {
  "*.ts": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{html,scss,css}": ["prettier --write"]
}
```

```bash
# Husky setup (v9)
npx husky init
echo 'npx lint-staged' > .husky/pre-commit
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg
```

---

## The 10 Most Important Senior Interview Questions

**Q1: Explain how Angular's change detection works end-to-end.**

Zone.js monkey-patches all browser async APIs. When any patched async callback completes inside NgZone, it triggers `ApplicationRef.tick()`. Tick runs change detection from the root component downward. For each component: if Default strategy, always check. If OnPush, check only if an input reference changed, an event originated from this component, an async pipe emitted, or `markForCheck()` was called. `detectChanges()` evaluates template binding expressions and compares to previous values. DOM updates only on differences. Signals bypass Zone.js: Angular tracks which templates read which signals. When a signal changes, only those templates are marked dirty. Zoneless mode removes Zone.js entirely.

**Q2: What is the difference between Observable and Signal? When do you use each?**

Observable: asynchronous, push-based, can emit multiple values over time, has error and completion, requires subscription management, supports a rich operator library. Use for HTTP, DOM events, WebSocket, time-based sequences — anything inherently async. Signal: synchronous, reactive current-value container, always has a value, no error or completion, automatic dependency tracking, no subscription boilerplate. Use for component state, UI state, derived view model values. Bridge with `toSignal()` (Observable → Signal) and `toObservable()` (Signal → Observable).

**Q3: What are the differences between switchMap, mergeMap, concatMap, exhaustMap?**

When a new outer emission arrives while an inner is running: `switchMap` cancels the running inner and starts fresh (search, route params). `mergeMap` runs all inners concurrently (parallel uploads). `concatMap` queues and serialises (order matters). `exhaustMap` ignores new outer emissions while busy (form submit, login — prevent double-submission).

**Q4: How does dependency injection work in Angular? What is the injector tree?**

Angular maintains a tree of injectors: Platform → Root → Environment (per lazy route) → Element (per component). When a class asks for a dependency, Angular walks up from the current component's injector until it finds a provider. The first match wins — it shadows higher providers. Services with `providedIn:'root'` are singletons. Component-level providers create per-component instances, destroyed with the component. `inject()` resolves from the current injection context.

**Q5: How do you prevent memory leaks in Angular?**

Use `async` pipe in templates — it subscribes and unsubscribes automatically. Use `toSignal()` — it manages subscriptions tied to the injection context. Use `takeUntilDestroyed()` for TypeScript subscriptions in components and services. Never subscribe to infinite Observables without a termination strategy.

**Q6: How would you optimise a slow Angular application?**

Diagnose first: Chrome DevTools Performance panel, Angular DevTools (component re-renders), `ng build --stats-json` + bundle analyser. Then: OnPush on all components, use signals or async pipe to eliminate unnecessary change detection, `@defer` for heavy below-fold components, virtual scrolling for long lists, `NgOptimizedImage` for all images, `track` in all `@for` loops, analyse and reduce bundle size, `runOutsideAngular` for animation loops.

**Q7: What is ControlValueAccessor and when do you implement it?**

CVA is the interface that connects a custom component to Angular's forms engine. Implement it when building custom input components (date pickers, star ratings, tag inputs, rich text editors, phone number inputs). Four methods: `writeValue(value)` — form tells your component the current value; `registerOnChange(fn)` — you call `fn` when the user changes the value; `registerOnTouched(fn)` — you call `fn` when the user touches the control; `setDisabledState(disabled)`. Register with `NG_VALUE_ACCESSOR` using `forwardRef`.

**Q8: What is the difference between @ContentChild and @ViewChild?**

`@ViewChild` queries the component's OWN template — elements and components declared in the template. Available after `ngAfterViewInit`. `@ContentChild` queries PROJECTED content — content passed in by the parent via `<ng-content>`. Available after `ngAfterContentInit`. Signal equivalents: `viewChild()` and `contentChild()`.

**Q9: How do you architect state management in a large Angular application?**

Component-local signals for UI-only state. Service-level signal stores for shared feature state. NgRx Signals Store when DevTools integration or strict action logging is required. Classic NgRx for very large apps where the team requires strict unidirectional flow. Start simple. Add complexity only when you hit a specific problem that simpler patterns cannot solve.

**Q10: What is your approach to accessibility in Angular applications?**

Semantic HTML — native elements for built-in semantics. ARIA — only where HTML semantics are insufficient. Forms — every input has a visible label, errors connected with `aria-describedby`, `aria-invalid` set dynamically. Focus management — FocusTrap in dialogs, focus restoration on close, page announcement on navigation. Testing — axe-core in CI blocks PRs with violations. Angular CDK — FocusTrap, LiveAnnouncer, FocusMonitor for custom components.

> The best senior answers share a structure: define the concept precisely, explain when/why to use it, describe the failure mode or alternative, give a concrete code-level example. Vague conceptual answers without code specifics do not differentiate senior candidates.

---

## Take-Home Project — Senior Differentiators

Take-home projects are reviewed with a Senior lens. The reviewer checks whether it looks like code they would want to maintain in production:

- **`strict: true` in `tsconfig.json`** — first thing reviewers check. If missing, every type annotation is suspect.
- **No `any` types** — grep for `: any`. Every instance is a yellow flag. If you have a legitimate `any`, comment why.
- **OnPush on every component** — if you used Default strategy, you need to explain why. If you cannot, it suggests you do not understand change detection.
- **Tests without being asked** — a Senior submitting without tests is a red flag. Minimum: service unit tests (happy + error paths), one component integration test, one accessibility test.
- **Accessibility without being asked** — add `aria-label` to icon-only buttons, use semantic HTML, ensure keyboard navigation works. Mention it in the README.
- **Error states are visible** — every async operation shows a visible error state with a recovery action. Components showing only the happy path are not production-ready.
- **README is thorough** — what is the architecture? What decisions did you make and why? What would you do with more time?
- **Feature-first folder structure** — not `/components /services /pipes` — `/features/users /features/products` with `data-access` and `ui` subdirectories.
- **Conventional commits** — `feat:`, `fix:`, `refactor:`, `test:` — `git log` reads like a changelog.
- **Signal-based state** — use signals and signal stores. Shows awareness of current Angular best practices.

---

## System Design: Multi-Tenant B2B SaaS Dashboard

This sample answer demonstrates how to approach Angular system design questions. Walk through each dimension systematically. Show trade-offs.

**Requirements gathering:** before designing, ask: How many tenants? Tenant isolation requirements? SSR needed? Team size and Angular experience? Real-time data requirements? Authentication: internal or SSO (OIDC/SAML)? Accessibility requirements? Internationalisation?

**Monorepo structure:** for a B2B SaaS with multiple apps use Nx. Libraries: `@myco/ui` (shared components), `@myco/auth` (OIDC service, guards), `@myco/data-access` (API client, models), `@myco/util` (pure functions). Nx enforces library boundaries: apps cannot import from each other.

**Authentication:** OIDC with PKCE. Never store tokens in `localStorage` (XSS risk) — use in-memory with a refresh token in an `httpOnly` cookie. Auth interceptor adds Bearer token. 401 interceptor attempts silent refresh before redirecting to login.

**Multi-tenancy:** tenant ID in the URL (`/t/tenant-slug/dashboard`) or subdomain. `TenantService` reads from route and injects into all API calls as a header (`X-Tenant-ID`). Tenant-scoped providers allow per-tenant theming, feature flags, and UI customisations without branching code.

**State management:** signal stores per feature. No NgRx unless DevTools are a specific requirement. Global stores: `AuthStore`, `FeatureFlagStore`, `ThemeStore`. Feature stores scoped at the route level.

**Real-time:** WebSocket service with `runOutsideAngular` for performance. Observable exposed via `toSignal()`. Reconnection with exponential backoff. Optimistic updates for low-latency feel.

**Performance budget:** initial bundle < 400KB (gzipped). Feature bundles < 150KB each. `@defer` for all chart components. Virtual scrolling for all data grids. `NgOptimizedImage` for all images. LCP < 2.5s, CLS < 0.1, INP < 200ms. Real user monitoring.

**Accessibility:** WCAG 2.1 AA as a contractual requirement with enterprise customers. Angular Material v3 as the base. All custom components on CDK primitives. axe-core in CI: violations block PRs.

**CI/CD pipeline:** PR: lint (--max-warnings 0) → unit tests (80% coverage gate) → build (budget enforcement) → accessibility scan. Main: all of the above + E2E on staging + security scan + Docker image build.

---

*Next: [Engineering Practices](./engineering-practices.md)*
