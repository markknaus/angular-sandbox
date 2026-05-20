# BNSF Interview Practice Problems
**Role:** Sr/Staff Frontend Engineer
**Stack:** JavaScript, TypeScript, Angular
**Environment:** Local Angular project + VS Code
**Instructions:** Create a separate component or module for each problem. Name folders clearly (e.g., `debounced-search`, `reactive-form`). Each problem builds a personal reference library you can review the night before the interview.

---

## How to Use This Document

Each problem includes:
- **Objective** — what to build
- **Requirements** — functional and technical constraints
- **Starter hints** — only read if stuck
- **What the interviewer is watching for** — what to emphasize while building
- **Stretch goals** — if you finish early

Work through sections in order. JavaScript and TypeScript problems are shorter exercises. Angular problems are fuller builds.

---

# Section 1: JavaScript Fundamentals

---

## Problem JS-01: Closure Counter

### Objective
Write a function `makeCounter` that returns an object with three methods: `increment`, `decrement`, and `getCount`. Each call to `makeCounter` should produce an independent counter.

### Requirements
- No class syntax — use closures only
- Each counter instance must be fully independent
- `getCount` returns the current value
- Counter should start at 0 by default but accept an optional starting value

### Expected Usage
```javascript
const counter = makeCounter(10);
counter.increment(); // 11
counter.increment(); // 12
counter.decrement(); // 11
counter.getCount();  // 11

const counter2 = makeCounter();
counter2.getCount(); // 0 — independent of counter
```

### Starter Hints
<details>
<summary>Hint 1</summary>
The inner variable holding the count is what gets "closed over." It lives in the outer function's scope and persists between calls.
</details>

<details>
<summary>Hint 2</summary>
Return an object literal with arrow functions that reference the closed-over variable.
</details>

### What the Interviewer Is Watching For
- You understand that closures give functions persistent private state
- You can explain WHY counter and counter2 are independent
- Clean, readable code without overengineering

### Stretch Goal
Add a `reset` method and an optional `step` parameter so `increment` and `decrement` move by that step value instead of 1.

---

## Problem JS-02: Promise Chain vs Async/Await

### Objective
Write two versions of the same function — one using Promise chaining and one using async/await. The function should fetch a user by ID, then fetch that user's posts, then return the titles of all posts as an array of strings.

### Requirements
- Use the mock functions provided below — do not call a real API
- Handle errors gracefully in both versions
- Both functions should return a Promise that resolves to an array of post titles

### Mock Functions (paste into your file)
```javascript
function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id: 1, name: 'Mark', postIds: [101, 102, 103] });
      else reject(new Error('User not found'));
    }, 100);
  });
}

function getPost(postId) {
  const posts = {
    101: { id: 101, title: 'Angular Change Detection Deep Dive' },
    102: { id: 102, title: 'RxJS Operators You Actually Need' },
    103: { id: 103, title: 'TypeScript Generics Without the Pain' },
  };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      posts[postId] ? resolve(posts[postId]) : reject(new Error('Post not found'));
    }, 50);
  });
}
```

### Expected Output
```javascript
// Both versions should resolve to:
['Angular Change Detection Deep Dive', 'RxJS Operators You Actually Need', 'TypeScript Generics Without the Pain']
```

### Starter Hints
<details>
<summary>Hint 1</summary>
After getting the user, you need to fetch ALL posts concurrently, not sequentially. Think Promise.all.
</details>

<details>
<summary>Hint 2</summary>
In the async/await version, await the Promise.all call. In the chain version, return the Promise.all inside a .then block.
</details>

### What the Interviewer Is Watching For
- You know when to use Promise.all vs sequential awaits
- Your error handling is intentional, not an afterthought
- You can explain the difference between the two styles conversationally

### Stretch Goal
Add a timeout — if the combined fetch takes more than 500ms, reject with a "Request timed out" error. Look up Promise.race.

---

## Problem JS-03: Array Manipulation Without Mutation

### Objective
Write a function `processOrders` that takes an array of order objects and returns a new array. No mutation of the original array is allowed.

### Requirements
- Filter out cancelled orders (status === 'cancelled')
- Apply a 10% discount to orders over $100
- Sort the remaining orders by total descending
- Return only the id, customerName, and total fields

### Input
```javascript
const orders = [
  { id: 1, customerName: 'Alice', total: 250.00, status: 'complete' },
  { id: 2, customerName: 'Bob', total: 80.00, status: 'complete' },
  { id: 3, customerName: 'Carol', total: 150.00, status: 'cancelled' },
  { id: 4, customerName: 'Dave', total: 120.00, status: 'complete' },
  { id: 5, customerName: 'Eve', total: 95.00, status: 'complete' },
];
```

### Expected Output
```javascript
[
  { id: 1, customerName: 'Alice', total: 225.00 },
  { id: 4, customerName: 'Dave', total: 108.00 },
  { id: 2, customerName: 'Bob', total: 80.00 },
  { id: 5, customerName: 'Eve', total: 95.00 },
]
```

### What the Interviewer Is Watching For
- You chain filter, map, and sort fluently
- You do not mutate the original array (sort mutates — handle this)
- You understand the difference between map (transform) and filter (exclude)

### Stretch Goal
Rewrite using a single reduce call instead of chaining filter/map/sort.

---

# Section 2: TypeScript

---

## Problem TS-01: Generic Utility Function

### Objective
Write a generic function `groupBy` that takes an array of objects and a key, and returns an object where each key maps to an array of items sharing that key's value.

### Requirements
- Fully typed with generics — no `any`
- The key parameter should be constrained to keys of the object type
- Return type should be inferred correctly

### Expected Usage
```typescript
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Carol', role: 'admin' },
  { name: 'Dave', role: 'user' },
];

const grouped = groupBy(users, 'role');
// Result:
// {
//   admin: [{ name: 'Alice', role: 'admin' }, { name: 'Carol', role: 'admin' }],
//   user: [{ name: 'Bob', role: 'user' }, { name: 'Dave', role: 'user' }]
// }
```

### Starter Hints
<details>
<summary>Hint 1</summary>
The function signature starts with: `function groupBy<T, K extends keyof T>(array: T[], key: K)`
</details>

<details>
<summary>Hint 2</summary>
The return type is `Record<string, T[]>`. Use reduce to build it.
</details>

### What the Interviewer Is Watching For
- Correct use of generics and keyof constraints
- No use of any to work around type problems
- You can explain what K extends keyof T means and why it matters

### Stretch Goal
Make the return type more precise so the keys are typed as `T[K]` instead of `string`.

---

## Problem TS-02: Utility Types in Practice

### Objective
Given the interfaces below, use TypeScript utility types to derive new types WITHOUT rewriting the interfaces manually.

### Base Interfaces
```typescript
interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'readonly';
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  published: boolean;
  tags: string[];
}
```

### Tasks
Create the following derived types using ONLY utility types (Partial, Required, Pick, Omit, Readonly, Record, etc.):

1. `PublicUser` — User without password, id, createdAt, updatedAt
2. `UserUpdate` — All User fields optional except id (which stays required)
3. `PostSummary` — Post with only id, title, and published
4. `ReadonlyPost` — Post where no fields can be mutated
5. `RolePermissions` — A type where each role maps to an array of allowed actions (strings)

### What the Interviewer Is Watching For
- You reach for utility types instead of duplicating interface definitions
- You know Omit vs Pick intuitively
- You understand why Readonly matters at the type level vs runtime

### Stretch Goal
Write a generic utility type `RequireOnly<T, K extends keyof T>` that makes all fields optional except those specified in K.

---

## Problem TS-03: Discriminated Unions

### Objective
Model a payment processing system using discriminated unions so that TypeScript can narrow types exhaustively.

### Requirements
- A payment can be one of: CreditCard, BankTransfer, or Crypto
- Each payment type has shared fields (id, amount, status) and unique fields
- Write a function `processPayment` that handles each type differently
- TypeScript should warn you if you add a new payment type and forget to handle it

### Unique Fields Per Type
- CreditCard: cardLastFour (string), expiryMonth (number), expiryYear (number)
- BankTransfer: accountNumber (string), routingNumber (string), bankName (string)
- Crypto: walletAddress (string), currency ('BTC' | 'ETH' | 'USDC')

### Starter Hints
<details>
<summary>Hint 1</summary>
Add a `type` literal field to each interface. That is the discriminant that TypeScript uses to narrow.
</details>

<details>
<summary>Hint 2</summary>
Use a switch statement on `payment.type` in processPayment. Add a default case that assigns to `never` to get exhaustiveness checking.
</details>

### What the Interviewer Is Watching For
- You understand discriminated unions and why they are safer than if/else chains on optional fields
- Your exhaustiveness check is intentional, not accidental
- You can explain what `never` means in this context

---

# Section 3: Angular

---

## Problem NG-01: Debounced Search Component

### Objective
Build a search component that calls a mock search service as the user types, but debounces the input so the service is only called after the user stops typing for 400ms. Show a loading indicator while the search is in progress and display results in a list.

### Requirements
- Use ReactiveFormsModule with a FormControl for the input
- Use RxJS debounceTime, distinctUntilChanged, switchMap
- Show a loading spinner (can be simple text "Searching...") during the request
- Display results as a simple list
- Handle errors gracefully — show "Search failed, please try again"
- No memory leaks — clean up subscriptions properly

### Mock Service (create as a real Angular service)
```typescript
@Injectable({ providedIn: 'root' })
export class SearchService {
  search(query: string): Observable<string[]> {
    // Simulates network delay
    return of([
      `${query} - Result 1`,
      `${query} - Result 2`,
      `${query} - Result 3`,
    ]).pipe(delay(600));
  }
}
```

### Starter Hints
<details>
<summary>Hint 1</summary>
Chain your operators on the FormControl's valueChanges observable: debounceTime(400), distinctUntilChanged(), then switchMap to the service call.
</details>

<details>
<summary>Hint 2</summary>
Use the async pipe in the template to subscribe to the results observable — this handles unsubscription automatically.
</details>

<details>
<summary>Hint 3</summary>
For the loading indicator, set a loading flag to true before the switchMap and false inside a finalize() or tap() after it.
</details>

### What the Interviewer Is Watching For
- Correct operator choice — switchMap cancels in-flight requests, which is critical for search
- You know WHY distinctUntilChanged is there (avoid duplicate calls)
- Memory leak prevention — async pipe or explicit takeUntil/takeUntilDestroyed
- Clean template with conditional rendering

### Stretch Goal
Add a minimum query length of 3 characters using a filter operator before the debounce. Clear results when the input is empty.

---

## Problem NG-02: Reactive Form With Custom Validation

### Objective
Build a user registration form with the following fields and validation rules. All validation must be done with reactive forms — no template-driven validation.

### Form Fields and Rules

| Field | Rules |
|---|---|
| firstName | Required, min 2 characters |
| lastName | Required, min 2 characters |
| email | Required, valid email format |
| password | Required, min 8 chars, must contain one number and one uppercase letter |
| confirmPassword | Must match password field |
| role | Required, one of: admin, user, readonly |
| agreeToTerms | Must be true (checked) |

### Requirements
- Use FormBuilder and FormGroup
- Write a custom validator for password complexity
- Write a cross-field validator for password/confirmPassword match at the FormGroup level
- Show validation error messages inline below each field
- Errors should only show if the field has been touched or the form submitted
- Disable the submit button if the form is invalid
- On valid submit, log the form value to the console (minus the confirmPassword field)

### Starter Hints
<details>
<summary>Hint 1</summary>
A custom validator is a function that takes an AbstractControl and returns a ValidationErrors object or null. Return null when valid.
</details>

<details>
<summary>Hint 2</summary>
Cross-field validators go on the FormGroup, not the individual control. Access both controls via group.get('password') and group.get('confirmPassword') inside the validator.
</details>

<details>
<summary>Hint 3</summary>
Use the pattern validator or write a custom one for the password regex. A regex that satisfies the requirements: `/^(?=.*[A-Z])(?=.*\d).{8,}$/`
</details>

### What the Interviewer Is Watching For
- You build complex forms programmatically, not in the template
- Your custom validators follow the correct signature and return type
- Error display logic is clean and consistent
- You understand the difference between control-level and group-level validators

### Stretch Goal
Add an async validator to the email field that simulates checking whether the email is already registered (use a mock service that returns an observable with a delay).

---

## Problem NG-03: OnPush Change Detection With Immutable Data

### Objective
Build a product list component that uses OnPush change detection. Demonstrate that you understand how to correctly trigger updates when using OnPush.

### Requirements
- Parent component holds a list of products in a signal or BehaviorSubject
- ProductListComponent uses ChangeDetectionStrategy.OnPush
- ProductCardComponent (child of list) also uses OnPush
- Add a button in the parent to add a new product — the list must update correctly
- Add a button in the parent to mutate an existing product's price directly — observe that OnPush does NOT detect this
- Add a third button that updates the price correctly (immutably) — observe that OnPush DOES detect this

### Product Interface
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}
```

### What the Interviewer Is Watching For
- You can clearly explain WHY direct mutation fails with OnPush
- You know the correct pattern — new object reference triggers change detection
- You understand that OnPush checks reference equality, not deep equality
- You can articulate the performance benefit of OnPush for large lists

### Stretch Goal
Refactor to use Angular signals (signal, computed, effect) instead of BehaviorSubject and observe how signals interact with OnPush.

---

## Problem NG-04: RxJS Operator Deep Dive

### Objective
This problem is a series of small RxJS exercises to be done in a single component. Each exercise isolates one operator or pattern. No UI required — log results to the console and verify them.

### Exercise A: switchMap vs mergeMap
Simulate a scenario where a user clicks a button rapidly (use an interval or Subject to emit clicks). Make a mock HTTP call on each click.
- Implement with switchMap — observe that only the latest request completes
- Implement with mergeMap — observe that all requests complete
- Write a comment explaining which is correct for a search box and which is correct for saving a form

### Exercise B: combineLatest
You have two observables — one emits the current user's role, one emits a list of features. Use combineLatest to produce an observable that emits only the features the current role is allowed to see.

```typescript
const role$ = new BehaviorSubject<string>('user');
const features$ = new BehaviorSubject<{name: string, requiredRole: string}[]>([
  { name: 'Dashboard', requiredRole: 'user' },
  { name: 'Reports', requiredRole: 'admin' },
  { name: 'Settings', requiredRole: 'admin' },
  { name: 'Profile', requiredRole: 'user' },
]);
```

### Exercise C: Error Handling
Create an observable that randomly throws an error 50% of the time. Use catchError to recover gracefully and return a fallback value. Then use retry(3) to attempt the call up to 3 times before falling back.

### Exercise D: takeUntilDestroyed
Refactor a component that has a manual subscription with ngOnDestroy cleanup to use the modern takeUntilDestroyed operator instead. Verify there are no memory leaks.

### What the Interviewer Is Watching For
- You reach for the right operator intuitively, not by trial and error
- You can explain operator behavior in plain English
- Your error handling is explicit and intentional
- You know modern Angular patterns (takeUntilDestroyed over manual unsubscribe)

---

## Problem NG-05: Data Table With Sorting and Filtering

### Objective
Build a reusable data table component that accepts generic data and column definitions. This is the kind of component that appears in almost every enterprise Angular application.

### Requirements
- Component accepts an `items` input (array of any object type)
- Component accepts a `columns` input defining which fields to display and their labels
- Clicking a column header sorts by that column (toggle asc/desc)
- A search input above the table filters rows by any visible column value
- Pagination — show 10 rows per page with prev/next controls
- Sorting and filtering happen client-side (no service calls)
- Use OnPush change detection

### Column Definition Interface
```typescript
interface ColumnDef {
  field: string;
  label: string;
  sortable?: boolean;
}
```

### Sample Usage in Parent
```typescript
columns: ColumnDef[] = [
  { field: 'name', label: 'Name', sortable: true },
  { field: 'role', label: 'Role', sortable: true },
  { field: 'email', label: 'Email', sortable: false },
];

users: User[] = [...]; // array of 50+ mock users
```

### Starter Hints
<details>
<summary>Hint 1</summary>
Keep filtered and sorted data as a derived value — recompute it whenever the search term, sort column, sort direction, or items input changes.
</details>

<details>
<summary>Hint 2</summary>
Use Angular signals or a pure pipe to derive the display rows — this works well with OnPush since signals automatically notify the component tree.
</details>

### What the Interviewer Is Watching For
- You think in terms of reusable, configurable components — not one-offs
- Your sorting and filtering logic is clean and handles edge cases (null values, case sensitivity)
- You separate concerns — the table component does not know about the domain data
- OnPush is implemented correctly

### Stretch Goal
Add an `actions` column that accepts a template reference (`ng-template`) from the parent so each row can have custom action buttons. This tests your knowledge of ContentChild and TemplateRef.

---

# Section 4: Architecture Discussion Questions

These are not coding problems. Practice answering them out loud or write bullet point answers. These come up in panel interviews with senior engineers.

---

**Q1:** You are joining a team that has a large Angular application with no consistent patterns — some components use NgRx, some use services with BehaviorSubject, some use raw subscriptions everywhere. How do you approach standardizing it without rewriting everything?

**Q2:** A junior engineer on your team keeps writing components that do too much — they call services, transform data, manage routing, and render UI all in one place. How do you explain and enforce better separation of concerns?

**Q3:** The product team wants to add real-time data to the application using WebSockets. Walk me through how you would architect the Angular side of that integration.

**Q4:** You are building a feature that needs to work offline and sync when connectivity is restored. What patterns and browser APIs would you reach for on the frontend?

**Q5:** A stakeholder reports that the application feels slow on their machine. Walk me through exactly how you would diagnose and fix frontend performance issues in an Angular application.

---

# Quick Reference: Operators Cheat Sheet

| Operator | Use When |
|---|---|
| switchMap | Latest value wins — search boxes, navigation |
| mergeMap | All values matter — parallel requests |
| concatMap | Order matters — sequential writes |
| exhaustMap | Ignore until current completes — submit buttons |
| debounceTime | Wait for user to stop — search, resize |
| distinctUntilChanged | Skip duplicate values — avoid redundant calls |
| combineLatest | Need latest from multiple streams simultaneously |
| forkJoin | Wait for all to complete once — parallel HTTP calls |
| catchError | Recover from errors — return fallback observable |
| retry(n) | Retry on error up to n times |
| takeUntilDestroyed | Auto-unsubscribe when component destroys |
| finalize | Run cleanup regardless of success or error |
| tap | Side effects without transforming — logging, loading flags |
| shareReplay(1) | Share one subscription, replay last value to new subscribers |

---

*Document generated for BNSF Sr/Staff Frontend Engineer interview preparation.*
*Practice environment: Local Angular project + VS Code*
*Companion tools: StackBlitz (quick experiments), HackerRank (timed simulation)*
