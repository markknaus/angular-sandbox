# Testing
### The Complete Senior Developer Reference

> Jest setup, service testing with HttpTestingController, component testing with TestBed, signal store testing, form validator testing, accessibility testing with jest-axe, Angular Testing Library, Playwright E2E, API mocking, real-world RxJS patterns

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Jest vs Karma/Jasmine — The Full Case](#jest-vs-karmajasmine--the-full-case)
- [Jest Setup for Angular](#jest-setup-for-angular)
- [Testing Angular Services](#testing-angular-services)
- [Testing Components — TestBed Patterns](#testing-components--testbed-patterns)
- [Testing Signals and Signal Stores](#testing-signals-and-signal-stores)
- [Testing Forms and Validators](#testing-forms-and-validators)
- [Accessibility Testing with jest-axe](#accessibility-testing-with-jest-axe)
- [Angular Testing Library — The Better Way](#angular-testing-library--the-better-way)
- [Playwright E2E — Production Configuration](#playwright-e2e--production-configuration)
- [RxJS Real-World Patterns](#rxjs-real-world-patterns)
  - [Auto-Save with Conflict Detection](#auto-save-with-conflict-detection)
  - [Infinite Scroll with Request Deduplication](#infinite-scroll-with-request-deduplication)
  - [WebSocket with Reconnection](#websocket-with-reconnection)


## Jest vs Karma/Jasmine — The Full Case

Angular CLI generates projects with Karma and Jasmine by default. Industry practice has shifted strongly toward Jest.

- **Speed** — Jest runs tests in parallel across worker threads. Karma spawns a real browser instance. For a 500-test suite, Karma typically takes 45–90 seconds. Jest typically takes 8–15 seconds.
- **No browser required** — Jest uses jsdom, a JavaScript implementation of browser APIs running in Node.js. No Chrome, no Xvfb needed in CI. Tests run identically on any machine.
- **Superior mocking** — `jest.fn()`, `jest.spyOn()`, `jest.mock()`, `jest.useFakeTimers()`. `jest.mock()` hoists module mocking to the top of the file, making it work regardless of import order.
- **Watch mode with intelligent re-running** — `jest --watch` only runs tests affected by changed files. If you change `user.service.ts`, only tests that import it re-run. Karma re-runs everything.
- **Built-in coverage** — `jest --coverage` uses Istanbul. Produces lcov, text, HTML, and JSON reports with no separate configuration.
- **Snapshot testing** — `toMatchSnapshot()` and `toMatchInlineSnapshot()` capture rendered output and fail if it changes unexpectedly. Useful for pipe transformations and serialized data structures.

---

## Jest Setup for Angular

```bash
npm install -D jest @types/jest jest-preset-angular
npm install -D @testing-library/angular @testing-library/user-event @testing-library/jest-dom
npm install -D jest-axe @types/jest-axe
```

```typescript
// setup-jest.ts
import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';   // adds DOM matchers: toBeInTheDocument, etc.
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);    // adds accessibility matcher
```

```typescript
// jest.config.ts
import type { Config } from 'jest';
const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testPathPattern: ['src/.*\\.spec\\.ts$'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  transform: { '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular' },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/**/index.ts',
    '!src/app/**/*.model.ts',
  ],
  coverageThresholds: {
    global: { lines: 80, functions: 80, branches: 70, statements: 80 }
  },
  coverageReporters: ['lcov', 'text-summary', 'html'],
};
export default config;
```

---

## Testing Angular Services

Services are the easiest unit to test — they are plain TypeScript classes with no DOM dependency. The main challenge is isolating them from their dependencies.

```typescript
// The service under test
@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  getOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`/api/users/${userId}/orders`).pipe(
      map(orders => orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
      catchError(err => {
        if (err.status === 404) return of([]);
        return throwError(() => err);
      })
    );
  }
  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>('/api/orders', dto);
  }
}
```

```typescript
// Complete test file
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const mockAuthStore = { user: signal({ id: 'user-1', name: 'Alice' }) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClientTesting(),  // replaces HttpClient with mock
        { provide: AuthStore, useValue: mockAuthStore },
      ]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();  // fail if any unexpected HTTP requests were made
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return orders sorted by date descending', () => {
      const mockOrders: Order[] = [
        { id: 'o1', createdAt: new Date('2024-01-01'), total: 50 },
        { id: 'o2', createdAt: new Date('2024-03-15'), total: 120 },
        { id: 'o3', createdAt: new Date('2024-02-10'), total: 80 },
      ];
      let result: Order[] | undefined;
      service.getOrders('user-1').subscribe(orders => (result = orders));
      const req = httpMock.expectOne('/api/users/user-1/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
      expect(result).toHaveLength(3);
      expect(result![0].id).toBe('o2');  // March 15 — most recent
      expect(result![1].id).toBe('o3');  // Feb 10
      expect(result![2].id).toBe('o1');  // Jan 1
    });

    it('should return empty array for 404 response', () => {
      let result: Order[] | undefined;
      service.getOrders('unknown-user').subscribe(orders => (result = orders));
      httpMock.expectOne('/api/users/unknown-user/orders').flush(
        { message: 'Not found' }, { status: 404, statusText: 'Not Found' }
      );
      expect(result).toEqual([]);
    });

    it('should propagate non-404 errors', () => {
      let error: HttpErrorResponse | undefined;
      service.getOrders('user-1').subscribe({ error: e => (error = e) });
      httpMock.expectOne('/api/users/user-1/orders').flush(
        { message: 'Server Error' }, { status: 500, statusText: 'Server Error' }
      );
      expect(error?.status).toBe(500);
    });
  });

  describe('createOrder', () => {
    it('should POST order data and return created order', () => {
      const dto: CreateOrderDto = { productId: 'p1', qty: 2, shippingAddress: '123 Main St' };
      const created: Order = { id: 'new-order', ...dto, total: 39.98, createdAt: new Date() };
      let result: Order | undefined;
      service.createOrder(dto).subscribe(order => (result = order));
      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(created);
      expect(result).toEqual(created);
    });
  });
});
```

---

## Testing Components — TestBed Patterns

Component tests verify that the template renders correctly for given inputs, that user interactions produce expected outputs, and that the component integrates correctly with its dependencies. Keep tests focused on observable behaviour, not implementation details.

```typescript
describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;
  let component: SearchBarComponent;
  const mockSearchService = {
    search: jest.fn().mockReturnValue(of([{ id: '1', name: 'Result 1' }]))
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],  // standalone component: import it
      providers: [{ provide: SearchService, useValue: mockSearchService }]
    }).compileComponents();
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // trigger ngOnInit and first render
  });

  it('should render empty results initially', () => {
    const results = fixture.debugElement.queryAll(By.css('[data-testid=result-item]'));
    expect(results).toHaveLength(0);
    const emptyState = fixture.debugElement.query(By.css('[data-testid=empty-state]'));
    expect(emptyState).not.toBeNull();
  });

  it('should debounce search and display results', fakeAsync(() => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(mockSearchService.search).not.toHaveBeenCalled();  // debounce pending
    tick(300);  // advance fake timer
    fixture.detectChanges();
    expect(mockSearchService.search).toHaveBeenCalledWith('angular');
    const results = fixture.debugElement.queryAll(By.css('[data-testid=result-item]'));
    expect(results).toHaveLength(1);
    expect(results[0].nativeElement.textContent).toContain('Result 1');
  }));

  it('should emit resultSelected when result is clicked', () => {
    const emitted: SearchResult[] = [];
    component.resultSelected.subscribe((r: SearchResult) => emitted.push(r));
    fixture.componentRef.setInput('results', [{ id: '1', name: 'Test Result' }]);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('[data-testid=result-item]')).nativeElement.click();
    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe('1');
  });

  it('should show loading state during search', fakeAsync(() => {
    const slowResponse = new Subject<SearchResult[]>();
    mockSearchService.search.mockReturnValue(slowResponse.asObservable());
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-testid=loading]'))).not.toBeNull();
    slowResponse.next([]);
    slowResponse.complete();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-testid=loading]'))).toBeNull();
  }));
});
```

---

## Testing Signals and Signal Stores

```typescript
describe('ProductsStore', () => {
  let store: ProductsStore;
  const mockApi = {
    getAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsStore,
        { provide: ProductsApiService, useValue: mockApi },
      ]
    });
    store = TestBed.inject(ProductsStore);
    jest.clearAllMocks();
  });

  it('should start in idle state', () => {
    expect(store.status()).toBe('idle');
    expect(store.products()).toHaveLength(0);
    expect(store.isLoading()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  it('should load and store products', () => {
    const mockProducts = [
      { id: 'p1', name: 'Widget', category: 'tools', price: 29.99, inStock: true },
      { id: 'p2', name: 'Gadget', category: 'electronics', price: 99.99, inStock: false },
    ];
    mockApi.getAll.mockReturnValue(of(mockProducts));
    store.loadProducts();
    // Signals update synchronously when Observable completes synchronously
    expect(store.status()).toBe('success');
    expect(store.products()).toHaveLength(2);
    expect(store.isLoading()).toBe(false);
  });

  it('should set error state on API failure', () => {
    mockApi.getAll.mockReturnValue(throwError(() => new Error('Network error')));
    store.loadProducts();
    expect(store.status()).toBe('error');
    expect(store.error()).toBe('Network error');
    expect(store.hasError()).toBe(true);
  });

  it('computed filteredProducts should filter by category', () => {
    mockApi.getAll.mockReturnValue(of([
      { id: 'p1', name: 'Widget', category: 'tools', price: 29, inStock: true },
      { id: 'p2', name: 'Gadget', category: 'electronics', price: 99, inStock: true },
    ]));
    store.loadProducts();
    expect(store.filteredProducts()).toHaveLength(2);  // default: all categories
    store.setFilters({ category: 'tools' });
    expect(store.filteredProducts()).toHaveLength(1);
    expect(store.filteredProducts()[0].id).toBe('p1');
  });

  it('should perform optimistic update and revert on error', fakeAsync(() => {
    const initial = [{ id: 'p1', name: 'Widget', price: 29, category: 'tools', inStock: true }];
    mockApi.getAll.mockReturnValue(of(initial));
    mockApi.update.mockReturnValue(throwError(() => new Error('Update failed')));
    store.loadProducts();
    store.updateProduct('p1', { name: 'Updated Widget' });
    expect(store.products()[0].name).toBe('Updated Widget');  // optimistic
    tick(0);  // flush microtasks
    expect(store.products()[0].name).toBe('Widget');  // reverted
  }));
});
```

---

## Testing Forms and Validators

```typescript
describe('Form Validators', () => {
  describe('passwordStrength validator', () => {
    it.each([
      ['Password1!', null],                    // valid
      ['password1!', { noUppercase: true }],  // missing uppercase
      ['PASSWORD1!', { noLowercase: true }],  // missing lowercase
      ['Password!!', { noDigit: true }],      // missing digit
      ['Password1', { noSpecial: true }],     // missing special char
      ['short1!A', { minLength: true }],      // too short
    ])('passwordStrength(%s) returns %o', (password, expectedError) => {
      const control = new FormControl(password);
      const result = passwordStrength(control);
      if (expectedError === null) {
        expect(result).toBeNull();
      } else {
        expect(result).toMatchObject(expectedError);
      }
    });
  });

  describe('usernameAvailableValidator (async)', () => {
    const mockUserService = { checkAvailability: jest.fn() };

    it('should return null for available username', fakeAsync(() => {
      mockUserService.checkAvailability.mockReturnValue(of(true));
      const validator = usernameAvailableValidator(mockUserService as any);
      const control = new FormControl('availableUsername');
      let result: ValidationErrors | null | undefined = undefined;
      validator(control).subscribe(r => (result = r));
      tick(400);  // advance past debounceTime
      expect(result).toBeNull();
    }));

    it('should return { usernameTaken: true } for unavailable username', fakeAsync(() => {
      mockUserService.checkAvailability.mockReturnValue(of(false));
      const validator = usernameAvailableValidator(mockUserService as any);
      const control = new FormControl('takenUsername');
      let result: ValidationErrors | null | undefined = undefined;
      validator(control).subscribe(r => (result = r));
      tick(400);
      expect(result).toEqual({ usernameTaken: true });
    }));

    it('should treat API errors as valid (fail open)', fakeAsync(() => {
      mockUserService.checkAvailability.mockReturnValue(throwError(() => new Error('Network')));
      const validator = usernameAvailableValidator(mockUserService as any);
      const control = new FormControl('anyUsername');
      let result: ValidationErrors | null | undefined = undefined;
      validator(control).subscribe(r => (result = r));
      tick(400);
      expect(result).toBeNull();  // null = valid — don't block user on API error
    }));
  });
});
```

---

## Accessibility Testing with jest-axe

```typescript
describe('Accessibility', () => {
  it('LoginComponent should have no accessibility violations', async () => {
    const { container } = await render(LoginComponent, {
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    });
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'label': { enabled: true },
        'button-name': { enabled: true },
      }
    });
    expect(results).toHaveNoViolations();
  });

  it('DataTable should have proper ARIA attributes', async () => {
    const { container } = await render(DataTableComponent, {
      componentInputs: { rows: mockRows, columns: mockColumns }
    });
    expect(container.querySelector('table')).toHaveAttribute('role', 'grid');
    const headers = container.querySelectorAll('[role=columnheader]');
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach(header => {
      expect(header).toHaveAttribute('aria-sort');
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

---

## Angular Testing Library — The Better Way

Angular Testing Library (`@testing-library/angular`) wraps TestBed with a query API that matches how users interact with your application. Tests are resistant to refactoring — they test observable behaviour, not implementation details like component property names or internal signal values.

The fundamental philosophy: "The more your tests resemble the way your software is used, the more confidence they give you." Tests that check user-visible content (text, labels, roles) are more valuable than tests that check internal properties.

```typescript
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

describe('CheckoutFlow (Testing Library)', () => {
  const mockOrderService = {
    createOrder: jest.fn().mockResolvedValue({ id: 'order-123', total: 99.99 })
  };
  const mockRouter = { navigate: jest.fn() };

  async function setup() {
    const user = userEvent.setup();  // real user event simulation with delays
    await render(CheckoutFormComponent, {
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: Router, useValue: mockRouter },
        provideHttpClientTesting(),
      ]
    });
    return { user };
  }

  it('should complete checkout successfully', async () => {
    const { user } = await setup();
    await user.type(screen.getByLabelText(/first name/i), 'Alice');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'Anytown');
    await user.selectOptions(screen.getByLabelText(/state/i), 'CA');
    await user.type(screen.getByLabelText(/zip/i), '90210');
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/26');
    await user.type(screen.getByLabelText(/cvv/i), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      expect(mockOrderService.createOrder).toHaveBeenCalledOnce();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/order-confirmation', 'order-123']);
    });
  });

  it('should display validation errors for empty required fields', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: /place order/i }));
    const errors = await screen.findAllByRole('alert');
    expect(errors.length).toBeGreaterThanOrEqual(5);
    expect(mockOrderService.createOrder).not.toHaveBeenCalled();
  });

  it('should show error message when order creation fails', async () => {
    mockOrderService.createOrder.mockRejectedValue(new Error('Payment declined'));
    const { user } = await setup();
    // fill form...
    await user.click(screen.getByRole('button', { name: /place order/i }));
    const errorMessage = await screen.findByRole('alert', { name: /payment declined/i });
    expect(errorMessage).toBeInTheDocument();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
```

---

## Playwright E2E — Production Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: [
    ['html', { outputFolder: 'e2e/report', open: 'never' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4200',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },  // global login fixture
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'ng serve --configuration=test',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

```typescript
// auth.setup.ts — global login that runs once, state reused across all tests
import { test as setup, expect } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
```

```typescript
// Page Object — encapsulates selectors and actions
export class ProductsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/products'); }
  async search(query: string): Promise<void> {
    await this.page.getByRole('searchbox', { name: 'Search products' }).fill(query);
  }
  getProductCard(name: string) {
    return this.page.getByRole('article', { name });
  }
  async addToCart(productName: string): Promise<void> {
    const card = this.getProductCard(productName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(this.page.getByRole('status', { name: /added to cart/i })).toBeVisible();
  }
  async filterByCategory(category: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByRole('checkbox', { name: category }).check();
    await this.page.getByRole('button', { name: 'Apply filters' }).click();
  }
}
```

```typescript
// E2E test with API mocking for deterministic results
test.describe('Products', () => {
  test('should search and add to cart', async ({ page }) => {
    // Mock API — fast, deterministic, no real backend needed
    await page.route('**/api/products*', route => route.fulfill({
      json: {
        items: [
          { id: 'p1', name: 'Widget Pro', category: 'tools', price: 29.99, inStock: true },
          { id: 'p2', name: 'Gadget Plus', category: 'electronics', price: 99.99, inStock: true },
        ],
        total: 2
      }
    }));
    await page.route('**/api/cart', route => route.fulfill({ json: { items: [] } }));

    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.search('widget');
    await expect(productsPage.getProductCard('Widget Pro')).toBeVisible();
    await expect(productsPage.getProductCard('Gadget Plus')).not.toBeVisible();
    await productsPage.addToCart('Widget Pro');
    await expect(page.getByRole('status', { name: 'Cart items' })).toHaveText('1');
  });

  test('should have no accessibility violations on products page', async ({ page }) => {
    await page.goto('/products');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

> The most impactful E2E testing decision: mock the API. Tests that hit a real backend are slow, flaky (network conditions, data state), and hard to run in CI. Mock all API calls in E2E tests to control exact data and response times. Reserve real backend tests for smoke tests on the deployed environment.

---

## RxJS Real-World Patterns

### Auto-Save with Conflict Detection

Auto-save requires careful RxJS composition: debounce keystrokes, skip if value unchanged, cancel in-flight save if new changes arrive, handle errors without breaking the save loop.

```typescript
@Injectable()
export class AutoSaveService {
  private saveRequests$ = new Subject<{ key: string; data: unknown }>();
  private status = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');

  constructor() {
    this.saveRequests$.pipe(
      groupBy(req => req.key),
      mergeMap(group$ => group$.pipe(
        debounceTime(800),
        distinctUntilChanged((a, b) => JSON.stringify(a.data) === JSON.stringify(b.data)),
        tap(() => this.status.set('saving')),
        switchMap(req =>
          inject(ApiService).save(req.key, req.data).pipe(
            tap(() => {
              this.status.set('saved');
              timer(2000).subscribe(() => this.status.set('idle'));
            }),
            catchError(() => {
              this.status.set('error');
              return EMPTY;  // continue listening for new changes
            })
          )
        )
      ))
    ).subscribe();
  }

  save(key: string, data: unknown): void {
    this.saveRequests$.next({ key, data });
  }

  readonly saveStatus = this.status.asReadonly();
}
```

### Infinite Scroll with Request Deduplication

```typescript
@Component({ template: `...` })
export class InfiniteListComponent {
  private page = signal(1);
  private loadMore$ = new Subject<void>();

  readonly items = signal<Item[]>([]);
  readonly isLoading = signal(false);
  readonly hasMore = signal(true);

  constructor() {
    this.loadMore$.pipe(
      exhaustMap(() => {  // exhaustMap: ignore trigger if already loading
        if (!this.hasMore()) return EMPTY;
        this.isLoading.set(true);
        return inject(ItemsService).getPage(this.page()).pipe(
          tap(response => {
            this.items.update(items => [...items, ...response.items]);
            this.page.update(p => p + 1);
            this.hasMore.set(response.hasMore);
            this.isLoading.set(false);
          }),
          catchError(() => {
            this.isLoading.set(false);
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(),
    ).subscribe();

    // Load first page
    this.loadMore$.next();
  }

  onScrollNearBottom(): void {
    this.loadMore$.next();
  }
}
```

### WebSocket with Reconnection

```typescript
function createWebSocket<T>(url: string): Observable<T> {
  return new Observable<T>(subscriber => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket(url);
      ws.onmessage = event => subscriber.next(JSON.parse(event.data));
      ws.onerror = () => {
        subscriber.next({ type: 'error', message: 'Connection error' } as T);
      };
      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);  // reconnect after 3s
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }).pipe(
    share(),  // all subscribers share one WebSocket
  );
}

// Usage
readonly liveUpdates$ = createWebSocket<ServerEvent>('wss://api.example.com/events').pipe(
  filter(event => event.type === 'data-update'),
  throttleTime(100),  // maximum 10 updates per second
  shareReplay(1),
);
```

---

*Next: [Angular Architecture & Tooling](./angular-architecture-and-tooling.md)*
