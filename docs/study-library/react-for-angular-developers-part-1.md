# React for Angular Developers — Part 1: Core Concepts
### Mental Model, JSX, Component Model, Hooks (useState, useEffect, useRef, useMemo, useContext, useReducer, Custom Hooks)

> **A practical guide to React from the perspective of an Angular expert. This part covers the core React model and hooks — the 80% you write every day.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Mental Model: Library vs Framework](#mental-model-library-vs-framework)
  - [Angular is a Framework — React is a Library](#angular-is-a-framework--react-is-a-library)
  - [Rendering Philosophy — The Key Difference](#rendering-philosophy--the-key-difference)
  - [The Virtual DOM — React's Change Detection Model](#the-virtual-dom--reacts-change-detection-model)
  - [Unidirectional Data Flow](#unidirectional-data-flow)
  - [The Ecosystem Decision — What You Will Actually Use](#the-ecosystem-decision--what-you-will-actually-use)
- [JSX and the Component Model](#jsx-and-the-component-model)
  - [JSX — What it Actually Is](#jsx--what-it-actually-is)
  - [Function Components — The Only Type You Write](#function-components--the-only-type-you-write)
  - [Props — Angular @Input Equivalent](#props--angular-input-equivalent)
  - [Conditional Rendering](#conditional-rendering)
  - [List Rendering — The key Prop](#list-rendering--the-key-prop)
  - [Composition — React's Alternative to Structural Directives](#composition--reacts-alternative-to-structural-directives)
  - [Fragments — Avoiding Unnecessary DOM Wrappers](#fragments--avoiding-unnecessary-dom-wrappers)
- [Hooks: The Core React API](#hooks-the-core-react-api)
  - [useState — Component State](#usestate--component-state)
  - [useEffect — Side Effects and Lifecycle](#useeffect--side-effects-and-lifecycle)
  - [useRef — ViewChild and Mutable Values Equivalent](#useref--viewchild-and-mutable-values-equivalent)
  - [useMemo and useCallback — Computed Signals Equivalent](#usememo-and-usecallback--computed-signals-equivalent)
  - [useContext — Basic Dependency Injection Equivalent](#usecontext--basic-dependency-injection-equivalent)
  - [useReducer — Complex State Logic](#usereducer--complex-state-logic)
  - [Custom Hooks — Shareable Logic](#custom-hooks--shareable-logic)


## Mental Model: Library vs Framework


The single most important thing to understand about React before writing a line of code is what React actually is. Angular is a framework. React is a library. This distinction shapes every architectural decision you will make.


### Angular is a Framework — React is a Library


Angular ships with opinions and solutions for every concern in a front-end application: component rendering, change detection, routing (Angular Router), HTTP (HttpClient), forms (Reactive Forms), animation (Angular Animations), internationalisation (Angular i18n), and testing utilities. When you start an Angular project, these questions are answered before you write your first line of code.


React ships with exactly one thing: a mechanism for rendering UI components and updating them when state changes. That is it. React has no official router, no HTTP client, no form library, no state management solution beyond useState and useContext. Every other concern is solved by the community, and there are multiple competing solutions for each one. Your team chooses which ones to adopt.


This is not a criticism of React — it is a deliberate design philosophy. React's authors believe that front-end concerns are diverse enough that no single solution fits all applications, and that the library should stay focused on rendering. The tradeoff is 'paradox of choice': a new React project requires a series of architectural decisions that Angular makes for you. In practice, the ecosystem has converged enough that most serious React projects look similar: Vite or Next.js for the build, React Router or Next.js routing, TanStack Query for server state, React Hook Form for forms, and Redux Toolkit or Zustand for complex global state.


> 📝 **Note:** When an interviewer asks 'What is the difference between Angular and React?', start here. Angular is a complete platform with strong opinions. React is a rendering library that pairs with a chosen ecosystem. Neither is better — they solve the same problem with different philosophies.


### Rendering Philosophy — The Key Difference


Angular separates the template (HTML with Angular syntax) from the TypeScript class. The Angular compiler processes the template at build time and generates optimised JavaScript. The component class holds state; the template references that state.


React puts everything in JavaScript. A React component is a JavaScript function that returns JSX — a syntax extension that looks like HTML but compiles to JavaScript function calls. There is no separate template file. Conditionals, loops, and event handlers are all JavaScript expressions embedded in the JSX.


```typescript
// Angular: template is separate or in a different syntax
@Component({
  template: `
    @if (user()) {
      <h1>Hello, {{ user()!.name }}</h1>
    }
    @for (item of items(); track item.id) {
      <li>{{ item.name }}</li>
    }
  `
})
export class MyComponent {
  user = signal<User | null>(null);
  items = signal<Item[]>([]);
}
```


```typescript
// React: everything is JavaScript/TypeScript
function MyComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  return (
    <>
      {user && <h1>Hello, {user.name}</h1>}
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </>
  );
}
```


### The Virtual DOM — React's Change Detection Model


Angular's change detection walks the component tree and checks bindings. With signals, Angular knows exactly which components need updating. With OnPush, it only re-checks components whose inputs changed.


React uses a Virtual DOM. When state changes, React re-renders the component function — calls it again — and gets a new tree of React elements (plain JavaScript objects describing the UI). It then diffs this new tree against the previous tree (reconciliation) and applies only the minimal set of real DOM updates.


The implication: React component functions run on every state change. If you have expensive calculations in your component function, they run on every render. React provides useMemo and useCallback to memoize expensive computations and stable function references — the equivalent of computed() in Angular signals.


React 18 introduced Concurrent Mode and the Fiber reconciler, which allows React to pause, interrupt, and resume rendering. This enables features like Suspense (declarative loading states) and useTransition (marking some updates as non-urgent). For interview purposes, knowing these exist and why they matter (better responsiveness on complex UIs) is sufficient.


### Unidirectional Data Flow


Both Angular and React enforce unidirectional data flow, though Angular's approach is more flexible. Data flows down through component trees via inputs (Angular) or props (React). Events flow up via outputs (Angular) or callback props (React). Neither framework supports direct parent-child manipulation outside of this contract.


In Angular, services and stores break out of the tree — they are singletons injected into any component regardless of position. In React, the equivalent is either the Context API (built-in, coarse-grained) or external state management libraries like Redux or Zustand that exist outside the component tree entirely.


> 💡 **Tip:** 'How does React's data flow compare to Angular's?' — Both enforce downward data flow and upward event flow. The difference is how shared state is managed: Angular uses injectable singleton services and stores via DI; React uses Context for small shared state and external libraries (Redux, Zustand) for larger needs. React has no DI system — services as a concept do not exist. Logic is shared via custom hooks instead.


### The Ecosystem Decision — What You Will Actually Use


Most Angular-or-React job listings that say 'React' actually mean a specific React stack. Understanding the standard stack lets you speak credibly about React even before you have written production React code.

- **Build tool** — Vite — same as Angular's new build system, just without the Angular wrapper. Extremely fast HMR, native ESM in development. You will feel at home immediately.
- **Meta-framework** — Next.js — React plus server-side rendering, file-based routing, and optimised production builds. Most serious React applications use Next.js. Think of it as Angular + Angular Universal combined.
- **Routing** — React Router v6 (for SPAs) or Next.js App Router (for Next.js applications). React Router v6 was redesigned to be more declarative — covered in Section 5.
- **Server state** — TanStack Query (formerly React Query) — manages fetching, caching, background refetching, and loading/error states. Replaces the pattern of signal stores + HTTP calls for most data fetching scenarios.
- **Client state** — Zustand (simple), Redux Toolkit (complex), or Jotai (atomic). Zustand is the most similar in feel to Angular's signal stores. Redux Toolkit is most similar to NgRx.
- **Forms** — React Hook Form — the standard. Uncontrolled by default (DOM manages values, React only validates). Pair with Zod for schema-based validation. Covered in Section 7.
- **Styling** — CSS Modules (scoped CSS, built into Vite), Tailwind CSS, or styled-components/Emotion (CSS-in-JS). Angular's component-level SCSS scoping is most similar to CSS Modules.
- **Testing** — Vitest (Jest-compatible, faster) + React Testing Library (same @testing-library you already know from Angular). Your existing Testing Library knowledge transfers directly — the query API is identical.
- **TypeScript** — Universal in serious React projects. All examples in this guide use TypeScript.

## JSX and the Component Model


React's component model is simpler than Angular's in terms of API surface, but different enough that Angular developers often trip over it initially. The key shift: React components are functions, not classes. Props are readonly. And everything — conditionals, loops, dynamic content — is JavaScript inside JSX.


### JSX — What it Actually Is


JSX is a syntax extension for JavaScript. It looks like HTML embedded in JavaScript, but it compiles to plain JavaScript function calls. The TypeScript/Babel compiler transforms JSX before the browser sees it.


```typescript
// What you write (JSX/TSX):
const element = <h1 className='title'>Hello, {user.name}</h1>;

// What the compiler produces (React.createElement):
const element = React.createElement('h1', { className: 'title' }, 'Hello, ', user.name);

// With React 17+, the new JSX transform removes the need to import React
// The compiler handles the import automatically
// You still need: import React from 'react' in older code you encounter
```


JSX differences from HTML that trip up Angular developers:

- **className not class** — HTML class attribute is className in JSX (class is a JavaScript reserved word).
- **htmlFor not for** — \<label htmlFor='email'\> not \<label for='email'\>.
- **camelCase event handlers** — onClick not onclick, onChange not onchange, onSubmit not onsubmit.
- **Self-closing tags required** — \<input /\> not \<input\>. \<br /\> not \<br\>. All elements without children must self-close.
- **Style is an object** — style={{ color: 'red', fontSize: '16px' }} — double braces: outer for JSX expression, inner for JavaScript object.
- **Expressions in { }** — any valid JavaScript expression goes inside curly braces. Statements (if, for, while) do not — use expressions instead (ternary, .map()).

```typescript
// Common JSX patterns
function UserCard({ user }: { user: User }) {
  return (
    <div className='user-card' style={{ padding: '16px' }}>
      <img src={user.avatarUrl} alt={user.name} />   {/* note: self-closing */}
      <h2>{user.name}</h2>
      <p className={user.active ? 'active' : 'inactive'}>
        {user.active ? 'Active' : 'Inactive'}
      </p>
      <label htmlFor='email-input'>Email</label>
      <input id='email-input' type='email' defaultValue={user.email} />
    </div>
  );
}
```


### Function Components — The Only Type You Write


Modern React uses function components exclusively. Class components exist in older code and the documentation but are considered legacy. A React component is a function that accepts props and returns JSX. That is the complete definition.


```typescript
// Minimal React component — compare to Angular's @Component class

// Angular:
@Component({ selector: 'app-greeting', template: '<h1>Hello, {{ name() }}</h1>' })
export class GreetingComponent { name = input.required<string>(); }

// React:
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
// Usage: <Greeting name='Alice' />
```


```typescript
// More realistic component with TypeScript interface for props
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  compact?: boolean;  // optional prop — like @Input with a default
}

function UserCard({ user, onEdit, onDelete, compact = false }: UserCardProps) {
  return (
    <article className={`user-card ${compact ? 'user-card--compact' : ''}`}>
      <h2>{user.name}</h2>
      {!compact && <p>{user.email}</p>}
      <div className='user-card__actions'>
        <button onClick={() => onEdit(user.id)}>Edit</button>
        <button onClick={() => onDelete(user.id)}>Delete</button>
      </div>
    </article>
  );
}
```


### Props — Angular @Input Equivalent


Props are how parent components pass data to child components. They are exactly equivalent to Angular's @Input() or input() signal. The critical difference: props in React are always read-only. A React component must never modify its own props. If you need to update a value, the parent owns the state and passes down a callback to trigger the update.


```typescript
// Angular — two-way binding is possible with model()
@Component({ template: '<input [(ngModel)]="value">' })
export class MyInput { value = model<string>(''); }

// React — one-way flow: value down, change event up
interface TextInputProps {
  value: string;
  onChange: (newValue: string) => void;  // callback prop
  label: string;
  disabled?: boolean;
}
function TextInput({ value, onChange, label, disabled = false }: TextInputProps) {
  return (
    <div className='field'>
      <label>{label}</label>
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}  {/* call parent callback */}
        disabled={disabled}
      />
    </div>
  );
}
// Parent uses it:
const [name, setName] = useState('');
<TextInput value={name} onChange={setName} label='Your name' />
```


> 💡 **Tip:** Angular's two-way binding with [(ngModel)] or model() feels more ergonomic than React's 'value down, callback up' pattern. React developers consider this explicit — you always know exactly which component owns the state and what causes it to change. The Angular style trades explicitness for conciseness.


### Conditional Rendering


Angular uses @if/@else control flow syntax. React uses JavaScript expressions directly in JSX. The three main patterns:


```typescript
// Angular:
@if (user()) { <UserCard [user]='user()!' /> }
@if (isLoading()) { <Spinner /> } @else { <Content /> }

// React — pattern 1: && short-circuit (renders right side if left is truthy)
{user && <UserCard user={user} />}
// Warning: if user could be 0 (falsy number), && renders 0 in the DOM
// Safer: {user !== null && <UserCard user={user} />}

// React — pattern 2: ternary (if/else equivalent)
{isLoading ? <Spinner /> : <Content />}

// React — pattern 3: explicit if before return (for complex conditions)
function Page({ status }: { status: 'loading' | 'error' | 'success' }) {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <ErrorMessage />;
  return <Content />;  // success case
}
```


### List Rendering — The key Prop


Angular uses @for with a required track expression. React uses Array.map() in JSX with a required key prop. The key serves the same purpose as track — it tells React's reconciler which list item is which so it can efficiently update the DOM when items are added, removed, or reordered.


```typescript
// Angular:
@for (user of users(); track user.id) {
  <app-user-card [user]='user' />
}
@empty { <p>No users found.</p> }

// React:
{users.length === 0
  ? <p>No users found.</p>
  : users.map(user => (
      <UserCard key={user.id} user={user} />  {/* key is required */}
    ))
}
// Or with fragment to avoid extra wrapper:
{users.map(user => (
  <React.Fragment key={user.id}>
    <dt>{user.name}</dt>
    <dd>{user.email}</dd>
  </React.Fragment>
))}
```


> ⚠️ **Warning:** Never use array indexes as keys: key={index}. This causes subtle bugs when the list is reordered or items are deleted — React cannot tell that item[0] is now a different user than it was before. Always use a stable unique identifier from your data: key={user.id}.


### Composition — React's Alternative to Structural Directives


Angular has structural directives, content projection (\<ng-content\>), and the host element. React has props.children and render props. The mental model is simpler: a component can accept children as a prop and render them wherever it wants.


```typescript
// Angular: content projection with ng-content
@Component({ template: `
  <div class='card'>
    <ng-content select='[slot=header]' />
    <ng-content />
  </div>`
})
export class CardComponent {}

// React: children prop (TypeScript type: React.ReactNode)
interface CardProps {
  header?: React.ReactNode;  // optional named slot equivalent
  children: React.ReactNode; // the main slot — always available
  className?: string;
}
function Card({ header, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {header && <div className='card__header'>{header}</div>}
      <div className='card__body'>{children}</div>
    </div>
  );
}
// Usage:
<Card header={<h2>User Details</h2>}>
  <UserForm user={user} />
</Card>
```


### Fragments — Avoiding Unnecessary DOM Wrappers


Angular components render with a host element — the component's selector tag. React components must return a single root element, but that element does not have to be a real DOM node. Fragments let you return multiple elements without a wrapper div.


```typescript
// Problem: can't return two elements
// return <dt>Name</dt><dd>Alice</dd>;  // SyntaxError

// Solution 1: wrap in a div (adds extra DOM node — sometimes undesirable)
return <div><dt>Name</dt><dd>Alice</dd></div>;

// Solution 2: Fragment — no DOM node rendered
return (
  <>                    {/* short syntax — cannot accept key or other props */}
    <dt>Name</dt>
    <dd>Alice</dd>
  </>
);

// Solution 3: React.Fragment — required when using key (for lists)
return (
  <React.Fragment key={item.id}>
    <dt>{item.name}</dt>
    <dd>{item.value}</dd>
  </React.Fragment>
);
```


## Hooks: The Core React API


Hooks are functions that let you use React features inside function components. They were introduced in React 16.8 (2019) and replaced class component lifecycle methods entirely. There are six hooks you will use in virtually every React component, plus custom hooks for sharing logic.


The single most important rule about hooks: they must be called at the top level of a component or custom hook. Never call them inside conditions, loops, or nested functions. React relies on the order of hook calls to associate state with the right component instance — changing that order between renders breaks everything.


### useState — Component State


useState is the closest thing to Angular's signal() at the component level. It holds a single piece of state and provides a setter function that triggers a re-render when called.


```typescript
// Angular signal equivalent comparison
// Angular:
count = signal(0);
count.set(5);
count.update(n => n + 1);
count()   // read the value

// React useState:
const [count, setCount] = useState(0);
setCount(5);                 // set directly
setCount(prev => prev + 1);  // functional update (safe for async)
count                        // read the value (no function call)
```


```typescript
// useState with TypeScript
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
```


```typescript
// Immutable state updates — same rule as Angular signals with OnPush
// WRONG: mutating existing state — React won't detect the change
items.push(newItem);         // direct mutation — no re-render!
setItems(items);             // same reference — React skips re-render

// CORRECT: always return new references
setItems([...items, newItem]);                           // add item
setItems(items.filter(i => i.id !== deletedId));         // remove item
setItems(items.map(i => i.id === id ? {...i, ...changes} : i)); // update item
```


```typescript
// Full example: counter with input
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  return (
    <div>
      <p>Count: {count}</p>
      <input
        type='number'
        value={step}
        onChange={e => setStep(Number(e.target.value))}
      />
      <button onClick={() => setCount(c => c + step)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```


> 💡 **Tip:** useState returns a tuple [value, setter]. Destructuring with descriptive names ([count, setCount]) is universal convention. The setter always triggers a re-render — if you set the same value (same reference for objects), React skips the re-render (similar to signals' equality check).


### useEffect — Side Effects and Lifecycle


useEffect is React's way to perform side effects: data fetching, subscriptions, DOM manipulation, timers. It replaces Angular's ngOnInit, ngOnDestroy, and ngOnChanges combined. It runs after the component renders.


**The dependency array (second argument):** controls when useEffect runs:

- **No second argument** — runs after every render — equivalent to ngDoCheck. Rarely what you want.
- **Empty array []** — runs once after first render, cleanup runs on destroy. Equivalent to ngOnInit + ngOnDestroy.
- **Array with values [userId, filter]** — runs after first render, then again whenever userId or filter changes. Equivalent to ngOnChanges watching those values.

```typescript
// Angular lifecycle vs React useEffect

// Angular: ngOnInit + ngOnDestroy
ngOnInit() { this.subscription = this.data$.subscribe(...); }
ngOnDestroy() { this.subscription.unsubscribe(); }

// React: useEffect with cleanup function
useEffect(() => {
  const subscription = data$.subscribe(...);
  return () => subscription.unsubscribe();  // cleanup on unmount
}, []);  // [] = run once (on mount)
```


```typescript
// Angular: ngOnChanges watching userId
ngOnChanges(changes: SimpleChanges) {
  if (changes['userId']) this.loadUser(changes['userId'].currentValue);
}

// React: useEffect with dependency
useEffect(() => {
  if (!userId) return;
  let cancelled = false;
  async function load() {
    const data = await fetchUser(userId);
    if (!cancelled) setUser(data);  // ignore result if component unmounted
  }
  load();
  return () => { cancelled = true; };  // cleanup: prevent stale state
}, [userId]);  // re-runs whenever userId changes
```


```typescript
// Complete data-fetching example
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setUser(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!user)   return null;
  return <UserCard user={user} />;
}
```


> 📝 **Note:** The data-fetching pattern in useEffect is intentionally verbose. This is why TanStack Query (Section 6) exists — it handles loading, error, caching, and refetching automatically. In modern React projects, you will rarely write manual useEffect data fetching for API calls. useEffect is primarily for non-data-fetching side effects: event listeners, timers, third-party library integration.


### useRef — ViewChild and Mutable Values Equivalent


useRef serves two purposes: accessing DOM elements directly (equivalent to Angular's viewChild()), and storing mutable values that do not trigger re-renders when changed (equivalent to a private class property in Angular).


```typescript
// Angular viewChild vs React useRef for DOM access
// Angular:
canvasEl = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
ngAfterViewInit() { this.initChart(this.canvasEl().nativeElement); }

// React:
function ChartComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = initChart(canvasRef.current);  // direct DOM access
    return () => chart.destroy();  // cleanup
  }, []);  // runs once after first render — equivalent to ngAfterViewInit
  return <canvas ref={canvasRef} />;  // attach ref to DOM element
}
```


```typescript
// useRef for mutable values that don't trigger re-render
// Angular: private class property — changing it doesn't trigger CD
private intervalId!: ReturnType<typeof setInterval>;

// React: useRef stores values that persist across renders but don't cause re-render
function Timer() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const start = () => {
    intervalRef.current = setInterval(() => setTime(t => t + 1), 1000);
  };
  const stop = () => clearInterval(intervalRef.current);
  useEffect(() => () => clearInterval(intervalRef.current), []); // cleanup
  return <div><p>{time}s</p><button onClick={start}>Start</button></div>;
}
```


### useMemo and useCallback — Computed Signals Equivalent


Because React re-runs component functions on every render, expensive calculations run on every render too. useMemo memoizes a computed value — only recomputing when dependencies change. useCallback memoizes a function reference — only creating a new function when dependencies change. These are the equivalents of Angular's computed().


```typescript
// Angular computed signal vs React useMemo
// Angular:
filteredUsers = computed(() =>
  this.users().filter(u => u.active && u.role === this.selectedRole())
);

// React:
const filteredUsers = useMemo(
  () => users.filter(u => u.active && u.role === selectedRole),
  [users, selectedRole]  // recompute when users or selectedRole changes
);
```


```typescript
// useCallback — memoize event handler functions
// Without useCallback: new function created every render,
// causing child components that receive it as a prop to re-render unnecessarily
function UserList({ users }: { users: User[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Without useCallback: handleSelect is a new function every render
  // const handleSelect = (id: string) => setSelectedId(id);
  // With useCallback: same function reference across renders
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);  // no dependencies — function never changes
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );
  return sortedUsers.map(user => (
    <UserCard key={user.id} user={user} onSelect={handleSelect} />
  ));
}
```


> 💡 **Tip:** Don't over-memoize. useMemo and useCallback have a cost (the memoization itself). Use them when: (1) a computation is genuinely expensive (sorting/filtering large arrays), (2) a callback is passed to a child wrapped in React.memo, or (3) a value is a dependency of another useMemo/useEffect. For simple calculations, re-computing on every render is usually faster than the memoization overhead.


### useContext — Basic Dependency Injection Equivalent


Context provides a way to pass data through the component tree without prop-drilling. It is not a full DI system — it does not have Angular's injector hierarchy, multi-providers, or scoped instances — but it serves similar purposes for global or cross-cutting data: current user, theme, locale, toast notifications.


```typescript
// Step 1: create the context (like defining an InjectionToken)
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);

// Step 2: create a provider component (like a root-level service)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    setUser(data.user);
  };
  const logout = () => { setUser(null); };
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: consume in any descendant (like inject(AuthService))
function NavBar() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('NavBar must be inside AuthProvider');
  return (
    <nav>
      {auth.isLoggedIn
        ? <button onClick={auth.logout}>Sign out, {auth.user!.name}</button>
        : <a href='/login'>Sign in</a>
      }
    </nav>
  );
}

// Wrap your app (in main.tsx or layout component):
// <AuthProvider><App /></AuthProvider>
```


```typescript
// Custom hook for safe context consumption (common pattern)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
// Usage: const { user, logout } = useAuth();
```


### useReducer — Complex State Logic


useReducer is an alternative to useState for complex state with multiple sub-values or when the next state depends heavily on the previous one. It is the Redux pattern built into React: you dispatch actions and a reducer function computes the new state. Angular developers with NgRx experience will recognise this pattern immediately.


```typescript
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR' };

interface CartState { items: CartItem[]; total: number }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find(i => i.id === action.payload.id);
      const newItems = existing
        ? state.items.map(i => i.id === action.payload.id ? {...i, qty: i.qty + 1} : i)
        : [...state.items, { ...action.payload, qty: 1 }];
      return { items: newItems, total: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    case 'REMOVE_ITEM':
      const filtered = state.items.filter(i => i.id !== action.payload);
      return { items: filtered, total: filtered.reduce((s, i) => s + i.price * i.qty, 0) };
    case 'CLEAR':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  return (
    <div>
      {state.items.map(item => (
        <div key={item.id}>
          {item.name} x{item.qty}
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}>
            Remove
          </button>
        </div>
      ))}
      <p>Total: ${state.total.toFixed(2)}</p>
      <button onClick={() => dispatch({ type: 'CLEAR' })}>Clear cart</button>
    </div>
  );
}
```


### Custom Hooks — Shareable Logic


Custom hooks are functions that start with 'use' and call other hooks. They are React's primary mechanism for sharing stateful logic between components — the equivalent of Angular services for UI-specific logic. Where Angular services are singletons injected via DI, custom hooks create independent instances for each component that uses them.


```typescript
// useLocalStorage — persist state to localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch { return initialValue; }
  });
  const set = useCallback((newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);
  return [value, set] as const;
}
// Usage: const [theme, setTheme] = useLocalStorage('theme', 'light');
```


```typescript
// useDebounce — debounce any value (like debounceTime in RxJS)
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);  // cancel on next change (like switchMap)
  }, [value, delay]);
  return debounced;
}
// Usage:
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);  // only updates after 300ms silence
  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);  // only fires when debouncedQuery changes
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```


```typescript
// useFetch — simple data fetching hook (before TanStack Query)
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);
  return { data, loading, error };
}
// Usage: const { data: users, loading, error } = useFetch<User[]>('/api/users');
```


> 📝 **Note:** Custom hooks are to React what services are to Angular — but only for UI and state logic. HTTP services, authentication, and other app-wide concerns are better handled by TanStack Query (TanStack Query, Part 2) or a state management library (Part 2). Custom hooks shine for: abstracting complex useEffect logic, sharing component state patterns (modal open/close), and encapsulating third-party library integration (charts, maps, analytics).



---

*Continue with [React for Angular Developers — Part 2: State, Routing & Ecosystem](./react-for-angular-developers-part-2.md)*
