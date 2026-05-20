# JavaScript
### A Senior Developer's Deep Reference

> The runtime, event loop, closures, scope, prototypal inheritance, Promises, async/await, modern ES2020–2024 features, ES modules, memory management, and patterns

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Why JavaScript Internals Matter at the Senior Level](#why-javascript-internals-matter-at-the-senior-level)
- [The JavaScript Runtime — Engine, Call Stack, and Heap](#the-javascript-runtime--engine-call-stack-and-heap)
  - [Execution Contexts and the Scope Chain](#execution-contexts-and-the-scope-chain)
  - [Hoisting](#hoisting)
- [The Event Loop — Microtasks, Macrotasks, and Zone.js](#the-event-loop--microtasks-macrotasks-and-zonejs)
  - [How Zone.js Uses the Event Loop](#how-zonejs-uses-the-event-loop)
- [Closures — The Foundation of Angular Services, RxJS, and Change Detection](#closures--the-foundation-of-angular-services-rxjs-and-change-detection)
  - [The Loop Closure Bug](#the-loop-closure-bug)
  - [Angular Patterns That Use Closures](#angular-patterns-that-use-closures)
- [Scope — var vs let vs const](#scope--var-vs-let-vs-const)
- [Prototypal Inheritance — What TypeScript Classes Actually Are](#prototypal-inheritance--what-typescript-classes-actually-are)
- [Array Methods — The Full Production Reference](#array-methods--the-full-production-reference)
- [Destructuring, Spread, and Rest](#destructuring-spread-and-rest)
- [Promises — Every Method, Every Edge Case](#promises--every-method-every-edge-case)
  - [Promise Combinators](#promise-combinators)
  - [Common Promise Patterns](#common-promise-patterns)
- [async/await — Suspension Model, Error Handling, and Pitfalls](#asyncawait--suspension-model-error-handling-and-pitfalls)
- [ES2020–2024 Features Angular Uses](#es20202024-features-angular-uses)
- [ES Modules — Static, Dynamic, and Tree-Shaking](#es-modules--static-dynamic-and-tree-shaking)
- [Memory Management — Garbage Collection and Leaks](#memory-management--garbage-collection-and-leaks)
- [Generators and Iterators](#generators-and-iterators)
- [Promises vs Observables — Complete Comparison](#promises-vs-observables--complete-comparison)
- [JavaScript Interview Patterns](#javascript-interview-patterns)


## Why JavaScript Internals Matter at the Senior Level

Angular compiles to JavaScript. Zone.js, RxJS, the Ivy renderer, change detection, and every Angular API are JavaScript at their core. The single highest-leverage thing you can do when refreshing for a senior Angular role is to deeply re-understand the JavaScript runtime — because every Angular behaviour, from change detection to memory leaks to async timing, is a direct consequence of how JavaScript executes.

Senior interviewers begin with JavaScript internals because they reveal whether a candidate understands what their framework is actually doing, or whether they only know its surface API. The topics build on each other: closures explain how Zone.js patches async callbacks; the event loop explains why change detection fires when it does; prototypal inheritance explains how Angular's DI decorator system attaches metadata to classes.

---

## The JavaScript Runtime — Engine, Call Stack, and Heap

A JavaScript engine (V8 in Chrome/Node, SpiderMonkey in Firefox, JavaScriptCore in Safari) reads and runs your code. It has two primary memory regions.

**The Call Stack** is a last-in, first-out data structure that tracks which function is currently running. Every time a function is invoked, the engine creates a **stack frame** and pushes it to the top. A stack frame contains: the function's local variables, the arguments passed, a reference to the outer scope (the scope chain link), the current value of `this`, and the return address. When the function returns, its frame is popped. Because there is only ever one frame running at a time, JavaScript is fundamentally single-threaded.

If you nest function calls so deeply the stack fills up (around 10,000–15,000 frames in V8), you get `RangeError: Maximum call stack size exceeded` — a stack overflow. In Angular, the most common cause is an infinite recursive `computed()` value or a circular event emission.

**The Memory Heap** is an unstructured region where all objects, arrays, functions, and closures are allocated. Heap allocations persist until they are no longer reachable — the garbage collector reclaims them. V8 uses a generational collector: "young" (recently allocated) and "old" (survived multiple collections) objects use different strategies. Any object reachable from a living subscription, event listener, or closure is not garbage collected — this is the mechanism behind memory leaks.

### Execution Contexts and the Scope Chain

An Execution Context is the environment created each time JavaScript evaluates code. There are three kinds: the Global Execution Context (once at script start), Function Execution Contexts (for each function call), and Eval Execution Contexts (rarely used).

Each execution context has three components: a **Variable Environment** (local variables, function declarations, arguments), a **Scope Chain** (ordered list of Variable Environments from inner to outer, used to resolve identifiers), and a **`this` binding**.

```typescript
// Scope chain in action
const globalVar = 'global';

function outer() {
  const outerVar = 'outer';
  function inner() {
    const innerVar = 'inner';
    // Scope chain: inner's VE → outer's VE → Global VE → null
    console.log(innerVar);   // found in inner's VE
    console.log(outerVar);   // not in inner's, found in outer's VE
    console.log(globalVar);  // not in either, found in Global VE
  }
  inner();
}
```

### Hoisting

During the **Creation Phase** of execution context setup (before any code runs), `var` declarations are added to the Variable Environment with value `undefined`, and function declarations are added with their full implementation. This is why you can call a function declaration before the line where it appears.

`let` and `const` are also hoisted (they exist in the scope) but are placed in a **Temporal Dead Zone** until their declaration line — accessing them early throws `ReferenceError`, not `undefined`.

```typescript
console.log(typeof hoistedFn);   // 'function' — fully hoisted
console.log(typeof hoistedVar);  // 'undefined' — var hoisted but no value yet
// console.log(typeof letVar);   // ReferenceError — in Temporal Dead Zone
function hoistedFn() { return 42; }
var hoistedVar = 'value';
let letVar = 'also value';
```

---

## The Event Loop — Microtasks, Macrotasks, and Zone.js

The event loop is the mechanism that allows JavaScript to be non-blocking despite being single-threaded. When a slow operation is initiated (HTTP request, timer), it is handed off to the browser's Web APIs layer — which runs in browser threads outside the JavaScript thread. When the operation completes, the callback is queued, not immediately run.

**The Macrotask Queue** receives callbacks from: `setTimeout`, `setInterval`, DOM event handlers, XHR/fetch completion, and `setImmediate` (Node.js).

**The Microtask Queue** receives callbacks from: Promise `.then()`/`.catch()`/`.finally()`, `queueMicrotask()`, `MutationObserver`, and `async/await` continuations. Microtasks have higher priority.

**The event loop algorithm, precisely:** Step 1 — execute all synchronous code until the call stack is empty. Step 2 — drain the ENTIRE microtask queue (including new microtasks added while draining). Step 3 — if needed, let the browser render. Step 4 — take exactly ONE macrotask and execute it. Step 5 — go back to Step 2. This repeats forever.

```typescript
// Classic event loop question — predict the output:
console.log('1 sync');
setTimeout(() => console.log('6 macrotask A'), 0);
setTimeout(() => console.log('7 macrotask B'), 0);
Promise.resolve()
  .then(() => {
    console.log('3 microtask A');
    return Promise.resolve();
  })
  .then(() => console.log('4 microtask B'));
queueMicrotask(() => console.log('5 microtask C'));
console.log('2 sync');

// Output: 1 sync, 2 sync, 3 microtask A, 4 microtask B, 5 microtask C, 6 macrotask A, 7 macrotask B
// After '1 sync' and '2 sync', the call stack is empty.
// The entire microtask queue drains (3, 4, 5) before any macrotask runs (6, 7).
// Note: 4 (chained .then) queues when 3 runs, before 5 (queueMicrotask) but 5
// was already in the queue when 3 ran, so 5 runs before the newly queued 4.
// Wait — re-examine: queueMicrotask(5) was called before .then(3) resolved.
// Order in microtask queue: [3, 5]. 3 runs → chains 4 → queue is now [5, 4].
// 5 runs, 4 runs. So output is: 3, 5, 4, then macrotasks 6, 7.
// The exact order of chained microtasks is the subtlety interviewers probe.
```

### How Zone.js Uses the Event Loop

Zone.js monkey-patches every browser async API — the exact registration points where callbacks enter the macrotask and microtask queues. When you call `setTimeout(fn, 100)`, Zone.js actually registers `zonedFn` — `fn` wrapped in zone context. When `zonedFn` executes, Zone.js runs `fn` and then emits an `onMicrotaskEmpty` event. Angular's `NgZone` listens for this event and calls `ApplicationRef.tick()` — starting change detection.

This is why all async operations in an Angular app trigger change detection by default without you doing anything: Zone.js intercepts them all.

**Practical implications:**
- `ngZone.runOutsideAngular(() => heavyLoop())` — prevents heavy computation or animation loops from triggering change detection on every frame
- `ngZone.run(() => this.data = result)` — re-enters NgZone from outside-zone code to trigger detection
- `provideExperimentalZonelessChangeDetection()` (Angular 18+) — Zone.js is not loaded at all; change detection is entirely signal-driven

> ⚠️ A common mistake: calling `setInterval()` inside a component without clearing it in `ngOnDestroy`. The interval callback runs forever, triggering change detection on a destroyed component tree.

---

## Closures — The Foundation of Angular Services, RxJS, and Change Detection

A closure is a function that retains access to the Variable Environment of the scope in which it was defined, even after that scope's execution context has been removed from the call stack. Every Angular service that holds private state, every RxJS operator that captures configuration, every component method that accesses component properties — all use closures.

**Mechanically:** when a function is created (not called), JavaScript attaches a reference to the current scope's Variable Environment to the function object (the `[[Environment]]` internal slot). When the function later executes and looks up an identifier, it checks its local scope, then follows the `[[Environment]]` chain outward. Multiple closures over the same scope share the same Variable Environment — mutations made by one are visible to others.

```typescript
// Closure fundamentals — outer scope outlives outer function
function createCounter(initialValue = 0) {
  let count = initialValue;  // lives in createCounter's Variable Environment
  return {
    increment: () => ++count,   // [[Environment]] → createCounter's VE
    decrement: () => --count,   // same 'count' variable
    reset:     () => { count = initialValue; },
    value:     () => count,
  };
}
const counter = createCounter(10);
counter.increment(); // count = 11  (createCounter's frame is gone, VE lives on)
counter.increment(); // count = 12
counter.decrement(); // count = 11  (all methods share THE SAME count)
counter.value();     // 11
```

### The Loop Closure Bug

```typescript
// WRONG — var has function scope, so all closures share the SAME 'i'
const handlers: (() => void)[] = [];
for (var i = 0; i < 5; i++) {
  handlers.push(() => console.log(i));  // all close over the same 'i'
}
handlers.forEach(h => h()); // prints 5, 5, 5, 5, 5

// CORRECT — let creates a new binding per loop iteration
for (let i = 0; i < 5; i++) {
  handlers.push(() => console.log(i));  // each closes over ITS OWN 'i'
}
handlers.forEach(h => h()); // prints 0, 1, 2, 3, 4
```

### Angular Patterns That Use Closures

```typescript
// Event handler that must be the same reference for add and remove
@Component({ standalone: true })
export class MapComponent implements OnInit, OnDestroy {
  private map!: MapLibrary;
  // Arrow function stored as property — same reference for both addEventListener calls
  private handleResize = () => this.map?.invalidateSize();
  // 'this' is captured from the class instance via closure

  ngOnInit() { window.addEventListener('resize', this.handleResize); }
  ngOnDestroy() { window.removeEventListener('resize', this.handleResize); }
  // If you wrote: window.addEventListener('resize', () => this.map?.invalidateSize())
  // you'd create a NEW function each call — removeEventListener would fail (different reference)
}
```

> 💡 The complete senior interview answer for "What is a closure?": A closure is a function that retains a live reference to the Variable Environment of its enclosing scope. The outer scope is not garbage collected while any inner function referencing it is reachable. This is the mechanism behind private state in services, captured loop variables, and memory leaks from uncleared subscriptions.

---

## Scope — var vs let vs const

**`var` — function-scoped, hoisted, re-declarable:** scoped to the nearest containing function (or global scope). Hoisted with value `undefined`. Re-declaring the same name is silently ignored. Has no block scope — a `var` inside an `if` or `for` is accessible throughout the entire function. Never use `var` in modern Angular code.

**`let` — block-scoped, TDZ, not re-declarable:** scoped to the nearest block (`{}`, including `if`, `for`, `while`, plain blocks). Hoisted but in a Temporal Dead Zone until the declaration line — accessing before declaration throws `ReferenceError`. Creates a fresh binding per loop iteration. Use when you genuinely need reassignment: loop counters, accumulator variables.

**`const` — block-scoped, TDZ, no reassignment:** everything `let` provides, plus the binding cannot be reassigned after initialisation. `const` does NOT make the value immutable — `const user = { name: 'Alice' }; user.name = 'Bob'` is legal. For immutable objects, use `Object.freeze()` or TypeScript's `Readonly<T>`. Use `const` by default; switch to `let` only when reassignment is needed; never use `var`.

```typescript
// The critical difference in for loops:
for (var i = 0; i < 3; i++) { /* i leaks out of the loop */ }
console.log(i); // 3 — i is still accessible here!

for (let j = 0; j < 3; j++) { /* j is block-scoped */ }
// console.log(j); // ReferenceError — j does not exist here

// const with objects — reference is fixed, contents are mutable
const config = { debug: false, apiUrl: '/api' };
config.debug = true;  // OK — mutating the object
// config = {};        // TypeError — cannot reassign the binding

// Proper immutability
const frozen = Object.freeze({ debug: false, apiUrl: '/api' });
// frozen.debug = true;  // silently ignored (or TypeError in strict mode)
```

---

## Prototypal Inheritance — What TypeScript Classes Actually Are

TypeScript classes are syntactic sugar. The runtime implements inheritance through prototypes. Every JavaScript object has an internal `[[Prototype]]` slot pointing to another object (its prototype) or `null`. When you access a property on an object, the engine checks: does the object have an own property with this name? If not, follow `[[Prototype]]` to the prototype object and check there. Continue until the property is found or `null` is reached.

When you write `class Dog extends Animal`, the runtime sets up: `Dog.prototype.__proto__ === Animal.prototype` (Dog instances inherit Animal's methods). Each `new Dog()` instance gets `[[Prototype]]` set to `Dog.prototype` automatically.

```typescript
class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
  speak(): string { return `${this.name} makes a noise`; }  // on Animal.prototype
  static create(name: string): Animal { return new Animal(name); }  // on Animal itself
}

class Dog extends Animal {
  breed: string;
  constructor(name: string, breed: string) {
    super(name);  // MUST call before 'this' — runs Animal's constructor
    this.breed = breed;
  }
  speak(): string { return `${this.name} barks`; }  // shadows Animal.prototype.speak
  fetch(): string { return `${this.breed} fetches!`; }
}

const dog = new Dog('Rex', 'Labrador');
// Prototype chain: dog → Dog.prototype → Animal.prototype → Object.prototype → null
dog.speak();           // 'Rex barks' — found on Dog.prototype
dog.toString();        // found on Object.prototype
dog instanceof Dog;    // true
dog instanceof Animal; // true — Animal.prototype is in the chain

// Useful prototype utilities
Object.getPrototypeOf(dog) === Dog.prototype;  // true (preferred over __proto__)
Object.hasOwn(dog, 'name');   // true — own property
Object.hasOwn(dog, 'speak');  // false — on prototype, not own
```

Angular's DI and decorator system depends on this model. When `@Injectable()` is applied, it receives the class constructor as an argument and attaches metadata to it (via `Reflect.defineMetadata` or the `ɵfac` static property in Ivy). The DI container reads this metadata to know what to inject.

---

## Array Methods — The Full Production Reference

```typescript
const users: User[] = [
  { id: '1', name: 'Alice', role: 'admin',  score: 95 },
  { id: '2', name: 'Bob',   role: 'editor', score: 87 },
  { id: '3', name: 'Carol', role: 'admin',  score: 92 },
  { id: '4', name: 'Dave',  role: 'viewer', score: 78 },
];

// map — transform each element, returns new array of same length
const names = users.map(u => u.name);                       // ['Alice', 'Bob', 'Carol', 'Dave']
const displayUsers = users.map(u => ({ ...u, label: `${u.name} (${u.role})` }));

// filter — keep elements matching predicate, returns shorter array
const admins = users.filter(u => u.role === 'admin');        // [Alice, Carol]
const highScorers = users.filter(u => u.score >= 90);        // [Alice, Carol]

// reduce — accumulate array into a single value (any type)
const totalScore = users.reduce((sum, u) => sum + u.score, 0);  // 352
const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<string, User>);

// find / findIndex — find first matching element (returns element or undefined)
const alice = users.find(u => u.name === 'Alice');           // User | undefined
const aliceIndex = users.findIndex(u => u.name === 'Alice'); // 0 (or -1 if not found)

// some / every — boolean checks
const hasAdmin = users.some(u => u.role === 'admin');   // true — at least one
const allActive = users.every(u => u.score > 0);        // true — all pass

// includes — check for primitive value (use some() for objects)
const roles = ['admin', 'editor', 'viewer'];
roles.includes('admin');   // true

// flat / flatMap — flatten nested arrays
const nested = [[1, 2], [3, 4], [5]];
nested.flat();           // [1, 2, 3, 4, 5]
nested.flat(Infinity);   // deep flatten
const sentences = ['Hello world', 'Foo bar'];
sentences.flatMap(s => s.split(' '));  // ['Hello', 'world', 'Foo', 'bar']

// sort — sorts IN PLACE (mutates original), always pass a comparator for numbers
const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name)); // alphabetical
const byScore = [...users].sort((a, b) => b.score - a.score);           // descending score

// slice — non-mutating sub-array (start inclusive, end exclusive)
users.slice(0, 2);   // [Alice, Bob]
users.slice(-1);     // [Dave] — last element
users.slice();       // shallow copy of entire array

// splice — mutates the array: remove/insert at index (avoid in Angular — use immutable patterns)
const copy = [...users];
copy.splice(1, 1);           // removes 1 element at index 1 (Bob)
copy.splice(1, 0, newUser);  // inserts newUser at index 1, removes nothing

// Array.from — create array from iterable or array-like
Array.from({ length: 5 }, (_, i) => i);  // [0, 1, 2, 3, 4]
Array.from(new Set([1, 2, 2, 3]));        // [1, 2, 3] — deduplicate
Array.from(document.querySelectorAll('li'));  // NodeList → Array

// at() — negative indexing (ES2022)
users.at(-1);  // Dave — last element (cleaner than users[users.length - 1])
users.at(-2);  // Carol — second to last

// Object.groupBy (ES2024) — replaces reduce-based grouping
const byRole = Object.groupBy(users, u => u.role);
// { admin: [Alice, Carol], editor: [Bob], viewer: [Dave] }
```

---

## Destructuring, Spread, and Rest

```typescript
// Object destructuring
const { name, role, score } = user;
const { name: userName, role: userRole = 'viewer' } = user;  // rename + default
const { address: { city } = {} } = user;  // nested with fallback

// Array destructuring
const [first, second, ...rest] = users;
const [, secondUser] = users;  // skip first with empty slot

// Spread — expand into place
const newUsers = [...users, newUser];                    // append
const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);  // update one

// Merge objects (last key wins)
const merged = { ...defaults, ...userConfig, timestamp: Date.now() };

// Spread in function calls
Math.max(...[1, 2, 3, 4]);  // 4

// Rest parameters — collect remaining into array
function log(level: string, ...messages: string[]): void {
  messages.forEach(msg => console.log(`[${level}] ${msg}`));
}
log('ERROR', 'Auth failed', 'Token expired');

// Rest in destructuring
const { id, ...rest } = user;  // id separated, rest has everything else
const [head, ...tail] = array;
```

---

## Promises — Every Method, Every Edge Case

A Promise represents a value that may not be available yet. It transitions through exactly three states: **Pending** → **Fulfilled** (has a value) or **Rejected** (has a reason). These transitions are one-way — once settled, the state and value are permanent.

```typescript
// new Promise — constructor
const p = new Promise<User>((resolve, reject) => {
  // executor runs synchronously and immediately
  fetchUser(id)
    .then(user => resolve(user))  // fulfil with user
    .catch(err => reject(err));   // reject with error
  // calling resolve or reject more than once is silently ignored — first call wins
});
```

### Promise Combinators

```typescript
// Promise.all — all-or-nothing parallel
// Fulfils when ALL fulfil (in input order), rejects immediately if ANY rejects
const [user, orders, permissions] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
  fetchPermissions(id),
]);
// If fetchOrders rejects: the error propagates, fetchUser result is discarded
// (fetchUser and fetchPermissions still run to completion, but results are ignored)

// Promise.allSettled — always fulfils, gives all results regardless
const results = await Promise.allSettled([
  fetchPanel1(),
  fetchPanel2(),
  fetchPanel3(),
]);
results.forEach((result, i) => {
  if (result.status === 'fulfilled') renderPanel(i, result.value);
  else showError(i, result.reason);
});

// Promise.race — first to settle wins (fulfilled OR rejected)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Promise.any — first to FULFIL wins (ES2021)
// Only rejects if ALL reject (AggregateError with all reasons)
const fastest = await Promise.any([
  fetchFromCDN1('/data'),
  fetchFromCDN2('/data'),
  fetchFromOrigin('/data'),
]);
// Returns the first successful response — used for fallback data sources
```

### Common Promise Patterns

```typescript
// Pattern 1: Parallel independent dashboard panels
async function loadDashboard(userId: string) {
  // Sequential: 600ms if each takes 200ms
  // Parallel: 200ms — all fire simultaneously
  const [user, orders, permissions] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchPermissions(userId),
  ]);
  return { user, orders, permissions };
}

// Pattern 2: Observable ↔ Promise conversions
import { firstValueFrom, lastValueFrom, from, defer } from 'rxjs';

// Observable → Promise (takes first emission)
const user = await firstValueFrom(this.userService.getUser(id));
// lastValueFrom waits for completion and takes the last emission

// Promise → Observable (lazy — re-creates Promise per subscription)
const user$ = defer(() => from(fetchUser(id)));

// Pattern 3: Async forEach — WRONG vs CORRECT
// WRONG: forEach ignores async — all run in parallel unintentionally
users.forEach(async (user) => {
  await updateUser(user);  // these all fire simultaneously!
});

// CORRECT: for...of for sequential processing
for (const user of users) {
  await updateUser(user);  // truly sequential
}

// CORRECT: parallel if order doesn't matter
await Promise.all(users.map(user => updateUser(user)));
```

---

## async/await — Suspension Model, Error Handling, and Pitfalls

`async/await` is syntactic sugar over Promises and generators. An `async` function always returns a Promise. When it hits `await`, it **suspends** — local variables and the instruction pointer are saved to the heap, and control returns to the caller. When the awaited Promise settles, a microtask is queued to **resume** the async function from where it was suspended.

**Three critical Angular implications of the suspension model:**

1. **Destroyed component after await** — if a component is destroyed while an `async` function is suspended (e.g., during `await fetchUser()` in `ngOnInit`), the code after `await` still runs on the destroyed component. The template is gone, subscriptions cleaned up, but the async continuation is queued as a microtask and will execute. Always check for destruction or prefer `takeUntilDestroyed()` with Observables.

2. **Not cancellable** — unlike RxJS Observables with `switchMap`, async functions cannot be cancelled. Once started, they run to completion or until they throw. This makes async/await the wrong tool for "only the latest request matters" patterns.

3. **Sequential by default** — `await a(); await b()` serialises. For parallel execution, start both before awaiting: `const [a, b] = await Promise.all([fetchA(), fetchB()])`.

```typescript
// Error handling patterns
async function saveUser(user: UserFormData): Promise<User> {
  try {
    const validated = await validateOnServer(user);
    const saved = await this.userService.create(validated);
    return saved;
  } catch (error) {
    if (error instanceof ValidationError) {
      this.formErrors.set(error.fields);
      throw error;  // re-throw so caller knows it failed
    }
    if (error instanceof HttpErrorResponse && error.status === 409) {
      throw new Error('A user with that email already exists');
    }
    throw error;  // unknown error — re-throw
  } finally {
    this.loading.set(false);  // always runs — hide spinner
  }
}

// Protecting against destroyed component
export class UserDetailComponent implements OnInit, OnDestroy {
  private destroyed = false;
  ngOnDestroy() { this.destroyed = true; }

  async ngOnInit() {
    const user = await firstValueFrom(this.userService.getUser(this.id));
    if (this.destroyed) return;   // guard: component destroyed while awaiting
    this.user.set(user);
  }
  // Better: use takeUntilDestroyed() with an Observable subscription
}

// async/await pitfalls with loops
// WRONG: forEach + async runs all simultaneously
users.forEach(async (user) => { await updateUser(user); });

// CORRECT: for...of serialises
for (const user of users) { await updateUser(user); }

// CORRECT: parallel (when order doesn't matter)
await Promise.all(users.map(u => updateUser(u)));
```

---

## ES2020–2024 Features Angular Uses

Angular 17+ targets ES2022. These language features appear in Angular's source code, generated template output, and production Angular codebases.

**Optional chaining (`?.`)** — evaluates to `undefined` if any intermediate value is null/undefined, instead of throwing. Works for property access (`a?.b?.c`), method calls (`obj?.method()`), and array indexing (`arr?.[0]`).

**Nullish coalescing (`??`)** — returns the right side only if the left is `null` or `undefined`. Unlike `||`, it does NOT treat `0`, `''`, `false`, or `NaN` as "missing": `count ?? 'none'` returns `0` when count is 0 (correct); `count || 'none'` returns `'none'` (wrong).

**Logical assignment (`??=`, `||=`, `&&=`)** — `x ??= defaultVal` assigns only if `x` is null/undefined. `x ||= val` assigns if `x` is falsy. `x &&= val` assigns only if `x` is truthy.

**`structuredClone(value)`** — true deep clone. Handles `Date`, `Map`, `Set`, `RegExp`, `ArrayBuffer`, circular references. Replaces `JSON.parse(JSON.stringify(val))`. Limitation: cannot clone functions, DOM nodes, or class instances (they become plain objects).

**`Array.at(index)`** — supports negative indices. `arr.at(-1)` is the last element. Cleaner than `arr[arr.length - 1]`.

**`Object.groupBy` / `Map.groupBy` (ES2024)** — groups array elements by a key function. `Object.groupBy(users, u => u.role)` returns `{ admin: [...], editor: [...] }`. Eliminates manual `reduce`-based grouping.

**`Error.cause`** — `new Error('message', { cause: originalError })`. Chain errors while preserving the original. Use in interceptors: `throw new Error('User load failed', { cause: httpError })`.

**`Promise.any()`** — resolves with the first fulfilled Promise; rejects with `AggregateError` only if all reject. Use for fallback data sources.

**`Object.fromEntries()`** — creates an object from `[key, value]` pairs. Pair with `Object.entries()` for object manipulation: `Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))`.

```typescript
// ES2024: Object.groupBy replacing reduce
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob',   role: 'editor' },
  { name: 'Carol', role: 'admin' },
];

// Old way
const byRole = users.reduce((acc, u) => {
  (acc[u.role] ??= []).push(u);
  return acc;
}, {} as Record<string, typeof users>);

// New way (ES2024)
const byRole2 = Object.groupBy(users, u => u.role);
// { admin: [Alice, Carol], editor: [Bob] }
```

---

## ES Modules — Static, Dynamic, and Tree-Shaking

Angular's build system (esbuild) depends entirely on ES Module semantics.

**Static imports** — evaluated at parse time. The bundler knows exactly which exports are used before executing any code. This enables tree-shaking. Cannot be used inside conditions or loops.

```typescript
import { UserService } from './user.service';            // static
import { map, filter, debounceTime } from 'rxjs';       // only these operators included
import { groupBy } from 'lodash-es';                     // tree-shakable (~3KB)
import * as _ from 'lodash';                             // NOT tree-shakable (~70KB)
```

**Dynamic imports** — evaluated at runtime, return a Promise. The bundler creates separate chunk files. Angular's `loadComponent` and `loadChildren` use dynamic imports — this is exactly how lazy loading works.

```typescript
// Angular lazy loading via dynamic import — creates 'users.HASH.js' chunk
export const routes: Routes = [{
  path: 'users',
  loadComponent: () =>
    import('./features/users/user-list.component')
      .then(m => m.UserListComponent),
}];
// The chunk is created at build time but downloaded only when the user navigates to /users
```

**Tree-shaking** — the bundler statically analyses the import graph and includes only code that is actually used. Requirements: (1) ESM (CommonJS cannot be tree-shaken), (2) pure functions (side-effect-free modules), (3) `"sideEffects": false` in `package.json`.

**Barrel files and tree-shaking** — a barrel (`index.ts`) re-exports multiple symbols from a folder. With ESM-aware bundlers (esbuild, Rollup), imports from a barrel are still tree-shakable because ESM re-exports are statically analysable. However, if any module in the barrel has side effects, shaking may not work. Keep barrels clean.

**Side-effect imports** — `import 'zone.js'` and `import 'reflect-metadata'` are imported purely for their side effects. These cannot be tree-shaken. Mark your library as side-effect-free in `package.json`: `{ "sideEffects": false }` or list only the side-effectful files.

---

## Memory Management — Garbage Collection and Leaks

JavaScript uses automatic garbage collection — the runtime periodically identifies objects that are no longer reachable and frees their memory. An object is garbage-collectable when no live reference points to it from any root (global variables, the call stack, closures, event listeners).

A **memory leak** occurs when an object that is semantically "done" still has a live reference preventing collection. In Angular, the three most common sources:

1. **Event listeners** added with `addEventListener` that are never removed (common with third-party map libraries, chart libraries, and resize observers)
2. **`setInterval` callbacks** that reference component instances and are never cleared in `ngOnDestroy`
3. **Observable subscriptions** to infinite streams (WebSocket, polling interval, route events) that outlive the component

```typescript
// Memory leak pattern — subscription survives component destruction
export class UserListComponent implements OnInit {
  ngOnInit() {
    // WRONG: this subscription lives forever — the component is a "zombie"
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => this.userService.search(query))
    ).subscribe(results => this.results.set(results));
  }
}

// Fix options (in order of preference for modern Angular):
// 1. toSignal() — automatically tied to injection context lifecycle
protected results = toSignal(
  this.searchSubject.pipe(debounceTime(300), switchMap(q => this.search(q))),
  { initialValue: [] }
);

// 2. takeUntilDestroyed() — explicit but automatic cleanup
ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(300),
    switchMap(q => this.search(q)),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(results => this.results.set(results));
}

// 3. async pipe in template — auto-subscribes and unsubscribes
// <app-user-card *ngFor="let user of users$ | async" [user]="user" />
```

The Angular garbage collection guarantee: when a component is destroyed (removed by the router, or by `@if` becoming false), Angular destroys the component instance and injector. If no external references remain, the component is eligible for GC. An unmanaged subscription keeps the component alive — preventing GC and potentially causing "expression has changed after it was checked" errors.

---

## Generators and Iterators

A generator function (`function*`) returns a Generator object. It pauses at each `yield` and resumes when the caller calls `.next()`. Generators implement the Iterator protocol: they have a `.next()` method returning `{ value, done }`. Any object implementing this protocol works in `for...of`, spread, destructuring, and `Array.from()`.

```typescript
// Generator for lazy sequences — no array allocation
function* range(start: number, end: number, step = 1): Generator<number> {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}
for (const n of range(0, 1_000_000)) {
  if (n > 5) break;  // generator is GC'd when loop exits
  console.log(n);    // 0, 1, 2, 3, 4, 5
}

// Async generator — paginated API fetching
async function* paginatedFetch<T>(url: string): AsyncGenerator<T[]> {
  let cursor: string | null = null;
  do {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await fetch(`${url}${params}`).then(r => r.json());
    yield response.items;
    cursor = response.nextCursor;
  } while (cursor);
}

// Process pages lazily
for await (const page of paginatedFetch<User>('/api/users')) {
  await processPage(page);
}

// Custom iterable class
class TreeNode<T> {
  constructor(public value: T, public children: TreeNode<T>[] = []) {}
  [Symbol.iterator](): Iterator<T> {
    const self = this;
    function* depthFirst(): Generator<T> {
      yield self.value;
      for (const child of self.children) {
        yield* child;  // yield* delegates to another iterable
      }
    }
    return depthFirst();
  }
}
const tree = new TreeNode(1, [new TreeNode(2), new TreeNode(3, [new TreeNode(4)])]);
console.log([...tree]);  // [1, 2, 3, 4]
```

---

## Promises vs Observables — Complete Comparison

Promises and Observables both model asynchronous work, but with fundamentally different semantics. A senior developer must know these distinctions — interview questions frequently compare them directly.

| | Promise | Observable |
|---|---|---|
| **Eagerness** | Eager — execution starts immediately on construction | Lazy — no work begins until `subscribe()` is called |
| **Cardinality** | Exactly one value (or one rejection) | Zero to infinite values over time |
| **Cancellation** | Not cancellable — once started, runs to completion | Fully cancellable — `unsubscribe()` stops the producer and cleans up resources. HttpClient cancels the actual XHR |
| **Error recovery** | Once rejected, chain is in error state — `catch()` can recover | `catchError()` can return a new Observable, allowing the stream to continue; `retry(3)` is built-in |
| **Composition** | `.then().then().catch()` — limited operators | 100+ operators (map, filter, switchMap, debounceTime, combineLatest, etc.) |
| **Multicasting** | Inherently multicast — multiple `.then()` chains get the same value | Cold by default (unicast) — each subscription creates a new execution. Use `shareReplay()`, `share()`, or Subjects for multicast |

```typescript
// When to use each in Angular:

// Prefer Observables for:
// - Any Angular-framework-driven work (HttpClient, Router, Forms)
// - Streams that should be cancellable (search, route params)
// - Operations that need retry logic
// - Anything you want to compose with operators

// Use Promises (async/await) for:
// - One-shot async operations where await syntax is cleaner
// - Third-party APIs that return Promises (wrap with from() if you need operators)
// - Angular guards and resolvers (can return Promise OR Observable — use whichever fits)
// - Parallel operations with Promise.all (equivalent to forkJoin, but simpler syntax)

// Bridge between them:
const user = await firstValueFrom(this.http.get<User>('/api/me'));  // Observable → Promise
const user$ = from(fetch('/api/data').then(r => r.json()));         // Promise → Observable
const user2$ = defer(() => from(asyncFetchUser(id)));               // lazy: re-creates per subscription
```

---

## JavaScript Interview Patterns

**Event loop question template:** When you encounter a timing or ordering question, map each statement to its queue: synchronous code runs on the call stack first; Promise callbacks are microtasks; `setTimeout`/`setInterval` callbacks are macrotasks. The entire microtask queue drains after every task (including after each microtask that adds more microtasks) before the next macrotask.

**Closure question template:** Identify what scope is being closed over, whether the variable is `var` (function-scoped, shared) or `let`/`const` (block-scoped, per-iteration fresh binding). For loop closures: `var` shares one variable, `let` creates fresh bindings per iteration.

**Prototype question template:** Classes are syntax over prototypes. `instanceof` walks the prototype chain. Methods are on `.prototype`, own data is on the instance. `super()` must be called before `this` in derived classes because the base class constructor initialises the new object.

**Promise question template:** Know the three states (pending/fulfilled/rejected), the four combinators (`all`/`allSettled`/`race`/`any`), and that `.then()` always returns a new Promise whose value depends on what the handler returns.

---

*Next: [TypeScript](./typescript.md)*
