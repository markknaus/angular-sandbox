# TypeScript
### A Senior Developer's Complete Reference

> Type system as a design tool, tsconfig, branded types, discriminated unions, generics, utility types, mapped types, template literal types, conditional types, type narrowing, and decorators

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [TypeScript's Type System as a Design Tool](#typescripts-type-system-as-a-design-tool)
  - [Structural vs Nominal Typing](#structural-vs-nominal-typing)
  - [Make Invalid States Unrepresentable](#make-invalid-states-unrepresentable)
- [tsconfig.json — Every Option That Matters](#tsconfigjson--every-option-that-matters)
  - [Strict Mode Flags Explained Individually](#strict-mode-flags-explained-individually)
  - [Angular-Specific Compiler Options](#angular-specific-compiler-options)
- [Basic Types and Type Annotations](#basic-types-and-type-annotations)
- [Interfaces and Type Aliases](#interfaces-and-type-aliases)
- [Classes in TypeScript](#classes-in-typescript)
- [Generics — From Basics to Angular Repository Patterns](#generics--from-basics-to-angular-repository-patterns)
- [Enums](#enums)
- [Branded Types — Nominal Type Safety for Primitives](#branded-types--nominal-type-safety-for-primitives)
- [Discriminated Unions — Modelling Every State Your UI Can Be In](#discriminated-unions--modelling-every-state-your-ui-can-be-in)
- [All Utility Types with Angular Examples](#all-utility-types-with-angular-examples)
- [Mapped Types](#mapped-types)
- [Template Literal Types](#template-literal-types)
- [Conditional Types and infer](#conditional-types-and-infer)
- [Type Narrowing — Exhaustive Reference](#type-narrowing--exhaustive-reference)
- [Angular Decorators — Internal Mechanics](#angular-decorators--internal-mechanics)
- [TypeScript in Angular — Practical Patterns](#typescript-in-angular--practical-patterns)


## TypeScript's Type System as a Design Tool

Many developers treat TypeScript as "JavaScript with autocomplete" — they annotate types where the compiler forces them to and use `any` everywhere else. Senior Angular developers treat the type system as a **design tool**: they express business rules in types so that violations become compile errors, not runtime bugs.

The core principle is **make invalid states unrepresentable**. If you design your types so that an invalid object cannot be constructed, you eliminate an entire category of bugs. Consider a form that can be in four states: not submitted, submitting, succeeded with data, or failed with an error. If you model this with four boolean flags (`isSubmitting`, `isSuccess`, `isError`, `data?`, `error?`), you have 2⁴ = 16 possible combinations — but only 4 are valid. Model it instead as a discriminated union with 4 variants — each variant can only hold the properties that make sense for that state. Invalid combinations literally cannot be expressed.

### Structural vs Nominal Typing

TypeScript uses **structural typing**: two types are compatible if they have the same structure (same property names and types), regardless of their names. This differs from Java/C# where types are compatible only if there is an explicit relationship (`extends`, `implements`).

```typescript
interface Point { x: number; y: number; }
interface Coordinate { x: number; y: number; }

function plotPoint(p: Point): void { /* ... */ }
const coord: Coordinate = { x: 3, y: 4 };
plotPoint(coord);  // OK — same structure, compatible types even with different names
```

This enables great flexibility but requires **branded types** when you need nominal (name-based) distinctness — for example, ensuring a `UserId` cannot be accidentally passed where an `OrderId` is expected.

### Make Invalid States Unrepresentable

```typescript
// FRAGILE: 16 possible combinations, only 4 are valid
interface FormState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: User;
  error?: string;
}
// What does { isLoading: true, isSuccess: true } mean? It's contradictory.
// What does { isSuccess: true, data: undefined } mean? Success with no data?

// ROBUST: exactly 4 valid states, invalid combinations cannot be typed
type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };
```

---

## tsconfig.json — Every Option That Matters

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": false,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,

    "baseUrl": ".",
    "paths": {
      "@app/*":    ["src/app/*"],
      "@env/*":    ["src/environments/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### Strict Mode Flags Explained Individually

`strict: true` is a meta-flag that enables a collection of individual flags. Understanding each one lets you explain exactly what a type error means.

**`strictNullChecks`** — the most important flag. Without it, `null` and `undefined` are assignable to every type — `user: User` could silently be `null`. With it, `null` and `undefined` are their own distinct types. Code must explicitly handle them. Eliminates "Cannot read properties of null" at compile time.

**`strictPropertyInitialization`** — class properties declared in the class body must be initialised in the constructor, or marked as definitely assigned with `!`. In Angular, properties set by Angular (not by the constructor) need either `myInput!: string` or `myInput: string | undefined`. Signal inputs (`input.required<string>()`) handle this automatically.

**`noImplicitAny`** — TypeScript must be able to infer a type for every expression. If it cannot, you must provide one explicitly. Prevents gradual re-introduction of `any` through inference.

**`strictFunctionTypes`** — function parameter types are checked contravariantly. A function expecting `(user: AdminUser)` cannot be used where `(user: User)` is required. Prevents subtle type unsafety in callbacks.

**`noUncheckedIndexedAccess`** — when accessing an array or record by index (`arr[0]`, `record[key]`), the type includes `undefined`. `arr[0]` returns `T | undefined`, not `T`. Forces you to guard. Eliminates a large class of runtime errors from array out-of-bounds and missing record keys.

**`exactOptionalPropertyTypes`** — optional properties (`name?: string`) cannot be explicitly set to `undefined` — they can only be absent. Stricter distinction between "property not set" and "property set to undefined".

**`noImplicitReturns`** — all code paths in a function must return a value if the return type is not `void`. Catches forgotten return branches.

**`noFallthroughCasesInSwitch`** — switch cases must `break`, `return`, or `throw`. Prevents accidental fallthrough bugs.

**`useUnknownInCatchVariables`** (part of `strict`) — `catch(e)` types `e` as `unknown` rather than `any`. Forces you to check the type before using it. Correct, because anything can be thrown.

**`noUncheckedIndexedAccess`** is NOT included in `strict: true` — add it explicitly. It is the highest-value flag not in `strict`.

### Angular-Specific Compiler Options

**`strictTemplates: true`** — the most impactful Angular option. Type-checks every binding expression, event handler, and pipe call in templates. Without it, you can pass a `string` where a `number` is expected in a template and get no error until runtime.

**`strictInjectionParameters: true`** — errors on unresolvable DI tokens at compile time.

**`strictInputAccessModifiers: true`** — errors if a parent component tries to mutate a child's `readonly` `@Input()`.

---

## Basic Types and Type Annotations

```typescript
// Primitives
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let nothing: null = null;
let notSet: undefined = undefined;
let bigInt: bigint = 9007199254740991n;
const sym: symbol = Symbol('unique');

// Arrays
let names: string[] = ['Alice', 'Bob'];
let scores: Array<number> = [95, 87, 92];    // generic syntax — identical
let matrix: number[][] = [[1, 2], [3, 4]];    // 2D array

// Tuples — fixed-length arrays with known types at each position
let point: [number, number] = [3, 4];
let entry: [string, number] = ['age', 30];

// Union types — one of several types
let id: string | number = 'user-123';
id = 42;  // also valid

// Intersection types — all properties of both types
type Timestamped = { createdAt: Date; updatedAt: Date };
type User = { id: string; name: string } & Timestamped;

// Type assertions — override TypeScript's inferred type
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
const canvas2 = <HTMLCanvasElement>document.querySelector('#canvas');  // JSX conflicts — prefer 'as'

// Non-null assertion — tell TypeScript: "trust me, this is not null"
const el = document.querySelector('#id')!;  // el: HTMLElement, not HTMLElement | null
// Use sparingly — if TypeScript thinks it might be null, consider whether you are right to override

// 'unknown' vs 'any'
let fromApi: unknown;      // safe — must type-check before using
let anything: any;         // unsafe — bypasses type checking entirely
// prefer unknown for values whose type you don't know yet
if (typeof fromApi === 'string') {
  console.log(fromApi.toUpperCase());  // safe — narrowed to string
}
```

---

## Interfaces and Type Aliases

Both `interface` and `type` can describe object shapes. The key differences:

- **`interface`** — can be extended with `extends` and merged (declaration merging: two `interface User` declarations are merged into one). Preferred for public API shapes and class contracts.
- **`type`** — can represent unions, intersections, primitives, tuples, and computed types. Cannot be merged. More powerful for complex type expressions. Preferred for component-internal types, discriminated unions, and utility types.

```typescript
// Interface — extends and implements
interface Animal {
  readonly name: string;
  sound: string;
  speak(): string;
}
interface Dog extends Animal {
  breed: string;
  fetch(): string;
}
class Labrador implements Dog {
  constructor(
    public readonly name: string,
    public sound = 'woof',
    public breed = 'Labrador'
  ) {}
  speak() { return `${this.name} says ${this.sound}`; }
  fetch() { return `${this.breed} fetches!`; }
}

// Declaration merging — only works with interface, not type
interface Window { myAppConfig: AppConfig; }  // extends the global Window type
// Now window.myAppConfig is typed

// Type alias — everything else
type UserId = string & { readonly _brand: unique symbol };
type Nullable<T> = T | null;
type EventHandler<T extends Event = Event> = (event: T) => void;
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

// When to use which:
// interface: public contracts, class shapes, API response shapes
// type: unions, intersections, branded types, conditional types, complex expressions
```

---

## Classes in TypeScript

```typescript
// Access modifiers
class UserService {
  private readonly apiUrl = '/api/users';  // only accessible within this class, immutable
  protected baseUrl = '/api';              // accessible in this class and subclasses
  public readonly name = 'UserService';   // accessible anywhere, immutable
  #privateField = 'truly private';         // JavaScript private field (truly inaccessible)

  constructor(private readonly http: HttpClient) {}
  // shorthand: declare and assign in one step
}

// Abstract classes
abstract class BaseComponent<T> {
  protected abstract load(): Observable<T>;
  protected data = signal<T | null>(null);

  protected refresh(): void {
    this.load().subscribe(data => this.data.set(data));
  }
}

class UserListComponent extends BaseComponent<User[]> {
  private userService = inject(UserService);
  protected load(): Observable<User[]> {
    return this.userService.getUsers();
  }
}

// Accessors (getters and setters)
class Temperature {
  private _celsius = 0;

  get fahrenheit(): number { return this._celsius * 9/5 + 32; }
  set fahrenheit(f: number) { this._celsius = (f - 32) * 5/9; }

  get celsius(): number { return this._celsius; }
  set celsius(c: number) { this._celsius = c; }
}

// Static members — on the class itself, not instances
class IdGenerator {
  private static counter = 0;
  static next(): string { return `id-${++IdGenerator.counter}`; }
}
IdGenerator.next();  // 'id-1'
```

---

## Generics — From Basics to Angular Repository Patterns

Generics let you write code that works correctly for multiple types while preserving type information throughout the call chain. Angular's `HttpClient`, `Observable`, `FormControl`, `EventEmitter`, `Signal`, and virtually every Angular API is generic.

```typescript
// Generic function basics with constraints
function identity<T>(value: T): T { return value; }
function first<T>(arr: readonly T[]): T | undefined { return arr[0]; }

// Constrained generics — T must extend a shape
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
// TypeScript infers T from the items argument
const alice = findById(users, 'user-1');   // type: User | undefined
const order = findById(orders, 'ord-1');   // type: Order | undefined

// Multiple generic parameters
function merge<A, B>(a: A, b: B): A & B {
  return { ...a as any, ...b as any } as A & B;
}
const merged = merge({ name: 'Alice' }, { age: 30 });
// type: { name: string } & { age: number }

// Generic class — base HTTP repository
abstract class BaseRepository<
  Entity extends { id: string },
  CreateDto = Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>,
  UpdateDto = Partial<CreateDto>
> {
  protected abstract readonly path: string;
  constructor(protected readonly http: HttpClient) {}

  getAll(params?: Record<string, string>): Observable<Entity[]> {
    return this.http.get<Entity[]>(this.path, { params });
  }
  getById(id: string): Observable<Entity> {
    return this.http.get<Entity>(`${this.path}/${id}`);
  }
  create(dto: CreateDto): Observable<Entity> {
    return this.http.post<Entity>(this.path, dto);
  }
  update(id: string, dto: UpdateDto): Observable<Entity> {
    return this.http.patch<Entity>(`${this.path}/${id}`, dto);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
}

// Concrete repository — all CRUD methods typed for User automatically
@Injectable({ providedIn: 'root' })
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  protected readonly path = '/api/v1/users';
}

// Generic signal store factory
function createEntityStore<T extends { id: string }>(
  loadFn: () => Observable<T[]>
) {
  const _items = signal<T[]>([]);
  const _loading = signal(false);
  const _error = signal<string | null>(null);
  return {
    items: _items.asReadonly(),
    loading: _loading.asReadonly(),
    error: _error.asReadonly(),
    count: computed(() => _items().length),
    load() {
      _loading.set(true);
      loadFn().pipe(takeUntilDestroyed()).subscribe({
        next: items => { _items.set(items); _loading.set(false); },
        error: err => { _error.set(err.message); _loading.set(false); },
      });
    },
    upsert(item: T) {
      _items.update(items => {
        const idx = items.findIndex(i => i.id === item.id);
        return idx >= 0
          ? items.map((i, j) => j === idx ? item : i)
          : [...items, item];
      });
    },
    remove(id: string) { _items.update(items => items.filter(i => i.id !== id)); },
  };
}

const userStore = createEntityStore(() => inject(UserService).getAll());
const productStore = createEntityStore(() => inject(ProductService).getAll());
```

---

## Enums

```typescript
// Numeric enum — auto-increments from 0
enum Direction { Up, Down, Left, Right }
Direction.Up;    // 0
Direction.Down;  // 1
Direction[0];    // 'Up' — reverse mapping (only numeric enums)

// String enum — explicit values, no reverse mapping, preferred
enum UserRole {
  Admin  = 'ADMIN',
  Editor = 'EDITOR',
  Viewer = 'VIEWER',
}
UserRole.Admin;  // 'ADMIN'

// Const enum — inlined at compile time, no JavaScript object emitted
const enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }
// status === Status.Active compiles to: status === 'ACTIVE'
// No runtime overhead — just a compile-time alias

// Consider: union of string literals instead of enum
// Advantages: simpler, works with JSON, no enum-specific syntax
type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

// When to use enum vs union:
// enum: when you need a namespace for constants (Direction, Status) and the values
//       might change or be computed
// union: for simple sets of string values, especially when matching API payloads
```

---

## Branded Types — Nominal Type Safety for Primitives

TypeScript's structural typing means `UserId` and `OrderId` are both `string` — the compiler won't stop you from accidentally passing one where the other is expected. Branded types add a phantom type property that makes types structurally distinct. The value at runtime is still a plain string or number.

```typescript
// Define branded types — unique symbol prevents cross-brand assignment
type UserId    = string & { readonly _brand: unique symbol };
type OrderId   = string & { readonly _brand: unique symbol };
type ProductId = string & { readonly _brand: unique symbol };
type Dollars   = number & { readonly _brand: unique symbol };

// Brand constructor functions — cast happens exactly once at the trust boundary
const UserId    = (s: string): UserId    => s as UserId;
const OrderId   = (s: string): OrderId   => s as OrderId;
const Dollars   = (n: number): Dollars   => n as Dollars;

// Functions that accept only the correct branded type
function getUser(id: UserId): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`);
}
function getOrder(id: OrderId): Observable<Order> {
  return this.http.get<Order>(`/api/orders/${id}`);
}

// Usage — cast at the boundary (route params, API responses)
const userId  = UserId(this.route.snapshot.params['userId']);
const orderId = OrderId(this.route.snapshot.params['orderId']);

getUser(userId);    // OK
getOrder(orderId);  // OK
getUser(orderId);   // TypeScript Error: OrderId is not assignable to UserId
getUser('raw-id');  // TypeScript Error: string is not assignable to UserId
```

Branded types shine in complex domains: e-commerce (`UserId`, `ProductId`, `OrderId`), financial systems (`Dollars`, `Cents`, `Percentage`), content management (`ArticleId`, `AuthorId`, `TagId`).

---

## Discriminated Unions — Modelling Every State Your UI Can Be In

A discriminated union (also called tagged union or algebraic data type) is a union where each variant has a literal-typed discriminant property. TypeScript uses the discriminant to narrow the type in `switch` statements and `if` conditions.

```typescript
// The async request state — the most important UI pattern in Angular
type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T; readonly fetchedAt: Date }
  | { readonly status: 'error';   readonly message: string; readonly retryable: boolean };

// Impossible states are literally unrepresentable:
// { status: 'success', data: null }  — won't type-check
// { status: 'loading', data: user }  — won't type-check

// Signal store using the state machine
export class UserStore {
  private _state = signal<AsyncState<User>>({ status: 'idle' });
  readonly state = this._state.asReadonly();

  // Derived signals — TypeScript narrows inside computed()
  readonly user = computed(() => {
    const s = this._state();
    return s.status === 'success' ? s.data : null;  // s.data is typed as User here
  });
  readonly errorMessage = computed(() => {
    const s = this._state();
    return s.status === 'error' ? s.message : null;
  });

  load(): void {
    this._state.set({ status: 'loading' });
    inject(HttpClient).get<User>('/api/user').subscribe({
      next: data => this._state.set({ status: 'success', data, fetchedAt: new Date() }),
      error: err => this._state.set({ status: 'error', message: err.message, retryable: true }),
    });
  }
}

// Template with exhaustive @switch
// @switch (store.state().status) {
//   @case ('idle')    { <button (click)='store.load()'>Load</button> }
//   @case ('loading') { <app-skeleton /> }
//   @case ('success') { <app-user-detail [user]='store.user()!' /> }
//   @case ('error')   { <app-error [message]='store.errorMessage()!' /> }
// }

// More discriminated union patterns
type UserPermission =
  | { type: 'read';      resourceId: string }
  | { type: 'write';     resourceId: string; scope: 'own' | 'all' }
  | { type: 'admin';     tenantId: string }
  | { type: 'superadmin' };

type NavigationResult =
  | { outcome: 'success';  route: ActivatedRoute }
  | { outcome: 'redirect'; to: string }
  | { outcome: 'denied';   reason: string }
  | { outcome: 'error';    error: Error };
```

---

## All Utility Types with Angular Examples

TypeScript's built-in utility types appear throughout Angular's type definitions and are used daily in production.

```typescript
// Partial<T> — all properties optional
// Most common use: HTTP PATCH payloads
function updateUser(id: string, changes: Partial<User>): Observable<User> {
  return this.http.patch<User>(`/api/users/${id}`, changes);
}

// Required<T> — all properties required
// Use to enforce complete config before use
function initChart(config: Required<ChartOptions>): Chart { ... }

// Readonly<T> — all properties readonly
// Use for store state components should not mutate
function renderUser(user: Readonly<User>): string { ... }

// Pick<T, K> — select a subset of properties
type UserCard = Pick<User, 'id' | 'name' | 'avatarUrl' | 'role'>;
// Prevents over-fetching type information in presentational components

// Omit<T, K> — exclude properties
type PublicUser = Omit<User, 'passwordHash' | 'salt' | 'refreshToken'>;
type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Record<K, V> — object type with specific key and value types
type RoleMap = Record<string, User>;          // string-keyed dictionary
type PermissionMap = Record<UserId, Permission[]>;  // user → permissions
type StatusFlags = Record<'loading' | 'success' | 'error', boolean>;

// Exclude<T, U> — remove from union T all members assignable to U
type NonAdmin = Exclude<UserRole, 'admin'>;   // 'editor' | 'viewer'
type NonNullish<T> = Exclude<T, null | undefined>;

// Extract<T, U> — keep from union T only members assignable to U
type AdminOrEditor = Extract<UserRole, 'admin' | 'editor'>;

// NonNullable<T> — removes null and undefined
type DefiniteUser = NonNullable<User | null | undefined>;  // User

// ReturnType<F> — return type of a function
type UserObservable = ReturnType<UserService['getUser']>;  // Observable<User>

// Parameters<F> — tuple of parameter types
type SaveParams = Parameters<typeof saveUser>;  // [id: string, dto: CreateUserDto]

// Awaited<T> — unwraps Promise nesting
type ResolvedUser = Awaited<Promise<Promise<User>>>;  // User

// Combining utility types
type UserFormState = {
  createMode: Required<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
  editMode:   Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
  viewMode:   Readonly<User>;
};

// Config: required core + optional extensions
type ChartConfig =
  Pick<ChartOptions, 'type' | 'data'> &
  Partial<Omit<ChartOptions, 'type' | 'data'>>;
```

---

## Mapped Types

Mapped types iterate over the keys of a type, transforming each key and/or value.

```typescript
// The built-in utility types are implemented as mapped types:
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// Modifiers: + adds (default), - removes
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };   // remove readonly
type Concrete<T>  = { [K in keyof T]-?: T[K] };            // remove optionality

// Custom mapped types
type LoadingState<T> = { [K in keyof T]: boolean };  // loading flag per property

// Rename keys with 'as' clause
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};
type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Filter keys by value type
type StringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
};
type UserStrings = StringProperties<User>;
// Only the string-valued properties of User

// Map over union members
type EventHandlers<T extends string> = {
  [K in T as `on${Capitalize<K>}`]?: (event: Event) => void
};
type MouseHandlers = EventHandlers<'click' | 'mouseenter' | 'mouseleave'>;
// { onClick?: ..., onMouseenter?: ..., onMouseleave?: ... }
```

---

## Template Literal Types

Template literal types compose string types at the type level, enabling precise typing of string-based APIs.

```typescript
// Basic template literal type
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickHandler = EventName<'click'>;    // 'onClick'
type ChangeHandler = EventName<'change'>;  // 'onChange'

// Union distribution — creates all combinations
type CSSProperty  = 'margin' | 'padding' | 'border';
type CSSDirection = 'Top' | 'Right' | 'Bottom' | 'Left';
type DirectionalCSS = `${CSSProperty}${CSSDirection}`;
// 'marginTop' | 'marginRight' | ... | 'borderLeft' (12 combinations)

// Angular-relevant examples
type ApiEndpoint = '/api/users' | '/api/orders' | '/api/products';
type WithId<T extends string> = `${T}/:id`;
type DetailEndpoints = WithId<ApiEndpoint>;
// '/api/users/:id' | '/api/orders/:id' | '/api/products/:id'

// Signal store getters
type SignalGetter<T extends string> = `${T}Signal`;
type UserSignals = SignalGetter<'name' | 'email' | 'role'>;
// 'nameSignal' | 'emailSignal' | 'roleSignal'

// Splitting string types with intrinsic string manipulation
type ExtractRoute<S extends string> =
  S extends `${string}/${infer Rest}` ? Rest : S;
type Route = ExtractRoute<'/api/users'>;  // 'users'
```

---

## Conditional Types and infer

Conditional types evaluate to different types based on whether a type extends another: `T extends U ? X : Y`.

```typescript
// Basic conditional types
type IsArray<T>   = T extends any[] ? true : false;
type IsPromise<T> = T extends Promise<any> ? true : false;

// Flatten — unwrap array types
type Flatten<T> = T extends Array<infer Item> ? Item : T;
// Flatten<string[]> = string
// Flatten<number>   = number (not an array — returns as-is)

// The 'infer' keyword — extract types from positions
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type UnwrapObservable<T> = T extends Observable<infer V> ? V : T;
type UnwrapSignal<T> = T extends Signal<infer V> ? V : T;
// UnwrapSignal<Signal<User>> = User
// UnwrapSignal<string>        = string

// Deep unwrap Promise
type DeepAwaited<T> = T extends Promise<infer V> ? DeepAwaited<V> : T;
// DeepAwaited<Promise<Promise<User>>> = User

// Distributive conditional types — distributes over union members
type NonNullish<T> = T extends null | undefined ? never : T;
// NonNullish<string | null | undefined> = string
// Distributes: (string extends null? never : string) |
//              (null extends null? never : null) |
//              (undefined extends undefined? never : undefined)
// = string | never | never = string

// Prevent distribution with wrapping in tuples
type IsNullable<T> = [T] extends [null | undefined] ? true : false;
// [string | null] extends [null] — compares the tuple, no distribution

// Angular utility types using conditional types
type ComponentInputs<T> = {
  [K in keyof T as T[K] extends InputSignal<any> ? K : never]:
    T[K] extends InputSignal<infer V> ? V : never
};
```

---

## Type Narrowing — Exhaustive Reference

Type narrowing is TypeScript's ability to refine the type of a variable within a conditional block based on the condition that was checked.

```typescript
// typeof narrowing
function process(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();  // value: string here
  }
  return value.toFixed(2);  // value: number here
}

// instanceof narrowing
function handleError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return `HTTP ${error.status}: ${error.message}`;  // error: HttpErrorResponse
  }
  if (error instanceof ValidationError) {
    return error.fields.join(', ');  // error: ValidationError
  }
  return String(error);
}

// 'in' narrowing — check for property existence
type Cat = { meow(): void };
type Dog = { bark(): void };
function makeSound(animal: Cat | Dog): void {
  if ('meow' in animal) animal.meow();  // animal: Cat
  else animal.bark();                    // animal: Dog
}

// Truthiness narrowing
function display(name: string | null | undefined): string {
  if (name) return name;            // name: string (null/undefined excluded)
  if (name != null) return name;    // name: string (both null AND undefined excluded)
  return 'Anonymous';
}

// Equality narrowing
function getLabel(status: 'active' | 'inactive' | 'pending'): string {
  if (status === 'active') return 'Active';    // status: 'active'
  if (status === 'inactive') return 'Inactive'; // status: 'inactive'
  return 'Pending';                              // status: 'pending' (narrowed by elimination)
}

// Type predicates — user-defined type guards
function isUser(value: unknown): value is User {
  return typeof value === 'object' &&
         value !== null &&
         'id' in value &&
         'name' in value;
}

// Assertion functions — throw if condition not met
function assertDefined<T>(val: T | null | undefined, msg: string): asserts val is T {
  if (val == null) throw new Error(msg);
}
const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
assertDefined(canvas, 'Canvas not found');
canvas.getContext('2d');  // canvas: HTMLCanvasElement — no ! needed

// Exhaustive check with never
function handleUserPermission(perm: UserPermission): string {
  switch (perm.type) {
    case 'read':       return `Read: ${perm.resourceId}`;
    case 'write':      return `Write: ${perm.resourceId} (${perm.scope})`;
    case 'admin':      return `Admin: tenant ${perm.tenantId}`;
    case 'superadmin': return 'Superadmin';
    default:
      // If UserPermission adds a new variant without updating this switch,
      // TypeScript errors here — perm would not be 'never'
      const _exhaustiveCheck: never = perm;
      return _exhaustiveCheck;
  }
}

// Discriminated union narrowing in Angular
const state = this.store.state();  // Signal<AsyncState<User[]>>
if (state.status === 'success') {
  // TypeScript knows state has .data here — no cast needed
  this.users.set(state.data);  // state.data: User[]
}
```

---

## Angular Decorators — Internal Mechanics

Angular's decorator system attaches metadata to classes without modifying the class code. Understanding the mechanical implementation explains edge cases: why `inject()` works in certain contexts but constructor injection does not, and why `forwardRef()` is needed for circular dependencies.

**How decorators work at runtime:** a decorator is a function that receives the decorated target as an argument. For class decorators, the target is the class constructor. The decorator can add static properties, wrap the constructor, or register metadata. Angular's `@Component({ ... })` calls `Component()` with the metadata object, which returns a decorator function. That decorator function receives the class constructor and attaches the metadata using `Reflect.defineMetadata` (or in Ivy, by setting static properties directly on the class: `ɵfac`, `ɵcmp`).

**`emitDecoratorMetadata` and `design:paramtypes`:** when `emitDecoratorMetadata: true` is set, the TypeScript compiler emits type metadata for decorated classes. For a class with `constructor(private service: UserService)`, the compiler emits `Reflect.metadata('design:paramtypes', [UserService])`. Angular's DI system reads this to know what to inject. `inject()` does NOT need this — it resolves at call time using the current injection context.

**`forwardRef()` — solving circular dependencies:** if ClassA depends on ClassB and ClassB depends on ClassA, one must be defined before the other — creating a reference to an undefined value. `forwardRef(() => ClassB)` defers the resolution of `ClassB` to call time. In application code, circular DI dependencies usually indicate a design problem — prefer restructuring.

```typescript
// Custom method decorator
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`${propertyKey} returned`, result);
    return result;
  };
  return descriptor;
}

class UserService {
  @Log
  getUser(id: string): User { /* ... */ }
}

// forwardRef for circular DI
@Injectable()
class A {
  constructor(@Inject(forwardRef(() => B)) private b: B) {}
}
@Injectable()
class B {
  constructor(private a: A) {}
}
```

---

## TypeScript in Angular — Practical Patterns

```typescript
// Typing signal inputs (Angular 17.1+)
import { input, output, model } from '@angular/core';

@Component({ standalone: true })
export class UserCardComponent {
  // Required input — TypeScript error if parent doesn't provide it
  user = input.required<User>();

  // Optional input with default
  showActions = input(true);

  // Typed output
  userEdit = output<string>();
  userDelete = output<string>();

  // Two-way binding signal
  selectedId = model<string | null>(null);
}

// Typing HttpClient responses
interface ApiResponse<T> {
  data: T;
  meta: { total: number; page: number; limit: number };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(params?: Partial<{ page: number; limit: number; search: string }>):
    Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>('/api/users', { params: params as any });
  }

  createUser(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>('/api/users', dto);
  }
}

// Type-safe form builder
import { FormBuilder, Validators } from '@angular/forms';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const form = inject(FormBuilder).nonNullable.group<LoginForm>({
  email:      ['', [Validators.required, Validators.email]],
  password:   ['', [Validators.required, Validators.minLength(8)]],
  rememberMe: [false],
});
// form.value type: { email: string; password: string; rememberMe: boolean }
// No need for null assertions

// Typing route parameters
interface UserRouteParams {
  userId: string;
  tab?: 'profile' | 'orders' | 'settings';
}

const params = inject(ActivatedRoute).snapshot.params as UserRouteParams;
const userId = UserId(params.userId);  // brand it immediately at the trust boundary
```

---

*Next: [HTML, CSS & Responsive Design](./html-css-responsive-design.md)*
