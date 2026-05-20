# React for Angular Developers — Part 2: State, Routing & Ecosystem
### State Management (Zustand, Redux Toolkit), React Router v6, TanStack Query, React Hook Form, Next.js, Testing, Interview Prep

> **Continuation of React for Angular Developers. Read Part 1 (mental model, JSX, hooks) first.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [State Management](#state-management)
  - [The State Management Spectrum](#the-state-management-spectrum)
  - [Lifting State — The Pattern Before Context](#lifting-state--the-pattern-before-context)
  - [Zustand — The Pragmatic State Manager](#zustand--the-pragmatic-state-manager)
  - [Redux Toolkit — The NgRx Equivalent](#redux-toolkit--the-ngrx-equivalent)
- [Routing with React Router v6](#routing-with-react-router-v6)
  - [Setup and Basic Routes](#setup-and-basic-routes)
  - [Navigation — Links and Programmatic](#navigation--links-and-programmatic)
  - [Reading Route Data — Params, Query, State](#reading-route-data--params-query-state)
  - [Nested Routes — Layouts and Sub-Routes](#nested-routes--layouts-and-sub-routes)
  - [Lazy Loading — Code Splitting Routes](#lazy-loading--code-splitting-routes)
  - [Angular Router vs React Router — Cheat Sheet](#angular-router-vs-react-router--cheat-sheet)
- [Data Fetching](#data-fetching)
  - [Fetch API and Axios — The Primitives](#fetch-api-and-axios--the-primitives)
  - [TanStack Query — Server State Management](#tanstack-query--server-state-management)
  - [useMutation — Modifying Server Data](#usemutation--modifying-server-data)
- [Forms with React Hook Form + Zod](#forms-with-react-hook-form--zod)
  - [React Hook Form Fundamentals](#react-hook-form-fundamentals)
  - [Zod Schema Validation — Angular Validators Equivalent](#zod-schema-validation--angular-validators-equivalent)
  - [Complex Forms — useFieldArray](#complex-forms--usefieldarray)
  - [Controlled vs Uncontrolled — The Core Difference](#controlled-vs-uncontrolled--the-core-difference)
- [Ecosystem & Tooling](#ecosystem--tooling)
  - [Vite — The Build Tool](#vite--the-build-tool)
  - [TypeScript Configuration in React](#typescript-configuration-in-react)
  - [Next.js — React with Everything Included](#nextjs--react-with-everything-included)
  - [App Router — File-Based Routing](#app-router--file-based-routing)
  - [Server Components vs Client Components](#server-components-vs-client-components)
  - [Testing — Vitest and React Testing Library](#testing--vitest-and-react-testing-library)
  - [Styling Options](#styling-options)
- [Interview Preparation](#interview-preparation)
  - [Answering 'Have You Worked With React?'](#answering-have-you-worked-with-react)
  - ['What Are the Main Differences Between Angular and React?'](#what-are-the-main-differences-between-angular-and-react)
  - ['What Would It Take You to Get Productive in React?'](#what-would-it-take-you-to-get-productive-in-react)
  - ['Which Do You Prefer, Angular or React, and Why?'](#which-do-you-prefer-angular-or-react-and-why)
  - [Technical Questions You May Face](#technical-questions-you-may-face)
  - ['Explain React's rendering model'](#explain-reacts-rendering-model)
  - ['What is the difference between useEffect and useLayoutEffect?'](#what-is-the-difference-between-useeffect-and-uselayouteffect)
  - ['What are React keys and why do they matter?'](#what-are-react-keys-and-why-do-they-matter)
  - ['What is prop drilling and how do you solve it?'](#what-is-prop-drilling-and-how-do-you-solve-it)
  - ['What is memoization in React?'](#what-is-memoization-in-react)
  - [Full Angular ↔ React Concept Comparison](#full-angular--react-concept-comparison)
  - [Your 30-Day React Ramp-Up Plan](#your-30-day-react-ramp-up-plan)


## State Management


State management is where React's 'bring your own library' philosophy is most apparent. There is no Angular-style DI system, no built-in store, and no official recommendation. In practice, the ecosystem has converged on a set of well-understood patterns. Knowing when to use each pattern — and how it maps to what you already know — is the Senior-level knowledge interviewers are looking for.


### The State Management Spectrum


React state management follows a spectrum from simple to complex. Most applications only need the first two or three levels. The mistake Angular developers sometimes make is reaching for Redux (the Angular/NgRx equivalent) for everything, when useState and prop-passing are sufficient for many scenarios.

- **Level 1: Local useState** — state that only one component needs. Managed inside the component. No sharing. This covers UI-only state: open/closed, selected tab, form field values.
- **Level 2: Lifted state** — state that two or more sibling components need. Move it to their closest common ancestor and pass it down as props with callbacks to update it. Angular equivalent: a smart container component managing state for its children.
- **Level 3: Context** — state that many components across the tree need, where prop-drilling becomes painful. Current user, theme, locale. Angular equivalent: a singleton service provided in root. Context re-renders all consumers on every change — not suitable for high-frequency updates.
- **Level 4: External store** — complex client state, server data caching, or state with complex transitions. Redux Toolkit, Zustand, or Jotai. Angular equivalent: NgRx or a signal store. TanStack Query handles server state separately.

**Angular developer trap:** in Angular you reach for a service or store almost immediately because DI makes it effortless. In React, start with local useState and only lift state or add Context/external stores when you feel the pain of prop-drilling or component coupling. The React community calls this 'colocation' — keep state as close to where it is used as possible.


### Lifting State — The Pattern Before Context


```typescript
// Scenario: two sibling components need to share a search query

// Wrong approach (React) — trying to share state between siblings directly
// (there is no way to do this without a common ancestor)

// Correct approach: lift state to the parent
function UserSection() {
  // State lives in the parent — passed down to both children
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof User>('name');
  return (
    <div>
      {/* SearchBar receives value + callback — no direct state */}
      <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
      {/* SortControls receives value + callback */}
      <SortControls field={sortField} onFieldChange={setSortField} />
      {/* UserTable receives derived data */}
      <UserTable searchQuery={searchQuery} sortField={sortField} />
    </div>
  );
}
```


### Zustand — The Pragmatic State Manager


Zustand is the closest thing to Angular's signal stores in the React ecosystem. It is a small, fast, and opinionated store library that avoids the boilerplate of Redux. The store is created outside React components and accessed via a hook. It is the recommended starting point for external state management in React applications in 2026.


```bash
npm install zustand
```


```typescript
// Angular signal store:                  // Zustand equivalent:
@Injectable({ providedIn: 'root' })       // store/user.store.ts
export class UserStore {
  private _users = signal<User[]>([]);   // interface UserStoreState {
  readonly users = this._users.asReadonly(); //   users: User[];
  readonly loading = signal(false);      //   loading: boolean;
                                         //   error: string | null;
  load() {                               //   load: () => Promise<void>;
    // ...                               // }
  }
}
```


```typescript
// Zustand store — full implementation
import { create } from 'zustand';

interface UserStoreState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  load: () => Promise<void>;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  selectUser: (id: string | null) => void;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  selectedId: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const users = await fetch('/api/users').then(r => r.json());
      set({ users, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addUser: (user) => set(state => ({ users: [...state.users, user] })),

  deleteUser: (id) => set(state => ({
    users: state.users.filter(u => u.id !== id)
  })),

  selectUser: (id) => set({ selectedId: id }),
}));

// Usage in a component (like inject(UserStore) in Angular)
function UserList() {
  // Select only what you need — prevents unnecessary re-renders
  const users   = useUserStore(state => state.users);
  const loading = useUserStore(state => state.loading);
  const load    = useUserStore(state => state.load);
  const deleteUser = useUserStore(state => state.deleteUser);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  return users.map(u => (
    <UserCard key={u.id} user={u} onDelete={deleteUser} />
  ));
}
```


### Redux Toolkit — The NgRx Equivalent


Redux Toolkit (RTK) is the official, modern way to use Redux. Raw Redux is notoriously verbose — RTK eliminates most of the boilerplate. If you know NgRx, Redux Toolkit will feel immediately familiar: actions, reducers, selectors, and async thunks map directly to NgRx actions, reducers, selectors, and effects.


```bash
npm install @reduxjs/toolkit react-redux
```


```typescript
// NgRx vs Redux Toolkit — concept mapping:
// createActionGroup()     → createSlice (actions auto-generated from reducers)
// createReducer()         → createSlice's reducers object
// createEffect()          → createAsyncThunk
// createSelector()        → createSelector (same library, same API)
// Store (NgRx)            → configureStore
// store.dispatch()        → dispatch() hook
// store.select()          → useSelector() hook
```


```typescript
// users.slice.ts — replaces actions + reducer + partial effects
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// createAsyncThunk = createEffect in NgRx
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as User[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// createSlice = createActionGroup + createReducer combined
const usersSlice = createSlice({
  name: 'users',
  initialState: { users: [] as User[], loading: false, error: null as string | null },
  reducers: {   // synchronous actions
    userDeleted(state, action: PayloadAction<string>) {
      state.users = state.users.filter(u => u.id !== action.payload);
      // RTK uses Immer internally — you CAN mutate state directly here
    },
    userSelected(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    }
  },
  extraReducers: (builder) => {  // handle async thunk actions
    builder
      .addCase(fetchUsers.pending,   state => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;  // Immer lets us assign directly
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});
export const { userDeleted, userSelected } = usersSlice.actions;
export default usersSlice.reducer;
```


```typescript
// store.ts — root store configuration
import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
  reducer: { users: usersReducer, orders: ordersReducer }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```


```typescript
// Usage in components
import { useSelector, useDispatch } from 'react-redux';
function UserList() {
  const dispatch = useDispatch<AppDispatch>();
  const users   = useSelector((state: RootState) => state.users.users);
  const loading = useSelector((state: RootState) => state.users.loading);
  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);
  return users.map(u => (
    <UserCard key={u.id} user={u}
      onDelete={id => dispatch(userDeleted(id))} />
  ));
}
```


> 💡 **Tip:** For interviews: 'When would you choose Redux Toolkit over Zustand?' Redux Toolkit is the right choice when: the team is large and action-based traceability matters, you need Redux DevTools time-travel debugging, the application has complex async flows with multiple interdependent actions, or you are joining a team already using Redux. Zustand is the right choice when: the team is small, the state is manageable, and you want minimal boilerplate. Both are correct answers — the key is explaining the trade-off.


## Routing with React Router v6


React Router v6 is the standard routing library for single-page React applications. It was significantly redesigned from v5 — the API in v6 is more declarative and component-based. Angular developers will find the concepts very familiar, though the syntax differs.


### Setup and Basic Routes


```bash
npm install react-router-dom
```


```typescript
// main.tsx — wrap app with BrowserRouter
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```


```typescript
// App.tsx — define routes
import { Routes, Route, Navigate } from 'react-router-dom';

// Angular:                              // React Router v6:
// routes: Routes = [                   // <Routes>
//   { path: '', redirectTo: '/home' }, //   <Route path='/' element={<Navigate to='/home' />} />
//   { path: 'home', component: Home }, //   <Route path='/home' element={<Home />} />
//   { path: 'users/:id', comp: User }, //   <Route path='/users/:id' element={<User />} />
// ]                                    // </Routes>

function App() {
  return (
    <div>
      <NavBar />
      <main>
        <Routes>  {/* equivalent to <router-outlet> */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/users' element={<UserList />} />
          <Route path='/users/:userId' element={<UserDetail />} />
          <Route path='/users/:userId/edit' element={<UserEdit />} />
          <Route path='*' element={<NotFound />} />  {/* wildcard */}
        </Routes>
      </main>
    </div>
  );
}
```


### Navigation — Links and Programmatic


```typescript
import { Link, NavLink, useNavigate } from 'react-router-dom';

// Angular:                            // React Router:
// <a routerLink='/users'>Users</a>   // <Link to='/users'>Users</Link>
// routerLinkActive='active'          // NavLink (auto-applies active class)
// this.router.navigate(['/users'])   // const nav = useNavigate(); nav('/users')

// Link — basic navigation, no reload
<Link to='/users'>Users</Link>
<Link to={`/users/${user.id}`}>View profile</Link>
<Link to='/users' state={{ from: 'dashboard' }}>Users</Link>  {/* pass state */}

// NavLink — adds 'active' class when route matches
<NavLink
  to='/users'
  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
>Users</NavLink>

// Programmatic navigation — like Angular's Router.navigate()
function LoginForm() {
  const navigate = useNavigate();
  const handleSubmit = async (data: LoginDto) => {
    await login(data);
    navigate('/dashboard');                      // navigate to
    navigate('/dashboard', { replace: true });  // replace history entry
    navigate(-1);                               // go back (like history.back())
    navigate('/login', { state: { returnUrl: '/dashboard' } }); // with state
  };
}
```


### Reading Route Data — Params, Query, State


```typescript
import { useParams, useSearchParams, useLocation } from 'react-router-dom';

// Angular:                            // React Router hooks:
// route.paramMap.get('userId')        // useParams().userId
// route.queryParamMap.get('tab')      // useSearchParams()[0].get('tab')
// router.getCurrentNavigation()       // useLocation()

function UserDetail() {
  // Route params: /users/:userId → { userId: '123' }
  const { userId } = useParams<{ userId: string }>();

  // Query params: ?tab=orders&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'profile';
  const page = Number(searchParams.get('page') ?? 1);

  // Update query params without navigation
  const setTab = (tab: string) => setSearchParams({ tab, page: '1' });

  // Location object — URL, state passed via navigate()
  const location = useLocation();
  const returnUrl = (location.state as any)?.returnUrl ?? '/';

  return (
    <div>
      <h1>User {userId}</h1>
      <Tabs active={activeTab} onChange={setTab} />
    </div>
  );
}
```


### Nested Routes — Layouts and Sub-Routes


React Router's nested routes let you compose layouts. A parent route renders an \<Outlet /\> where child routes appear — equivalent to a nested \<router-outlet\> in Angular. This is the standard pattern for authenticated layouts.


```typescript
// Angular nested routes:
// { path: 'admin', component: AdminLayout, children: [
//   { path: 'users', component: UserManagement }
// ]}

// React Router nested routes:
import { Outlet } from 'react-router-dom';

// Layout component — renders the shell + Outlet for child routes
function AuthenticatedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;  // guard equivalent
  return (
    <div className='app-shell'>
      <Sidebar />
      <main>
        <Outlet />  {/* child route renders here */}
      </main>
    </div>
  );
}

// Route configuration with nesting
function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      {/* Authenticated layout wraps all protected routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/users' element={<UserList />} />
        <Route path='/users/:id' element={<UserDetail />} />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}
```


### Lazy Loading — Code Splitting Routes


```typescript
// Angular:
// { path: 'users', loadChildren: () => import('./users/users.routes') }

// React Router v6 — React.lazy + Suspense
import React, { Suspense, lazy } from 'react';

const UserList    = lazy(() => import('./pages/UserList'));
const UserDetail  = lazy(() => import('./pages/UserDetail'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
// Each lazy import creates a separate bundle chunk

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>  {/* shown while chunk loads */}
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/users' element={<UserList />} />
        <Route path='/users/:id' element={<UserDetail />} />
      </Routes>
    </Suspense>
  );
}
```


> 💡 **Tip:** React Router v6 does not have built-in route guards like Angular's canActivate. The pattern is to put the guard logic in a layout component (like AuthenticatedLayout above) or a wrapper component that conditionally renders \<Outlet /\> or \<Navigate /\>. For complex guard logic, a custom useGuard hook that checks conditions and calls navigate() is the idiomatic approach.


### Angular Router vs React Router — Cheat Sheet

- **Route definition** — Angular: Routes array with { path, component/loadComponent }. React: JSX \<Route path element\> inside \<Routes\>.
- **Router outlet** — Angular: \<router-outlet /\>. React: \<Outlet /\> in nested layout, or wherever \<Routes\> renders.
- **Link** — Angular: routerLink directive. React: \<Link to\> component.
- **Active link** — Angular: routerLinkActive. React: \<NavLink\> with className function.
- **Programmatic navigation** — Angular: inject(Router).navigate([...]). React: useNavigate() hook, then navigate('/path').
- **Route params** — Angular: inject(ActivatedRoute).paramMap / input(). React: useParams() hook.
- **Query params** — Angular: route.queryParamMap. React: useSearchParams() hook.
- **Route guards** — Angular: canActivate, canMatch functional guards. React: conditional rendering in layout components.
- **Lazy loading** — Angular: loadChildren/loadComponent. React: React.lazy() + Suspense.
- **Route data** — Angular: data: { title: '...' } in route config. React: none built-in — use a custom hook or context.

## Data Fetching


React has no built-in equivalent to Angular's HttpClient. But this is one area where the React ecosystem has produced something genuinely better than what Angular ships with — TanStack Query handles the complex state management around server data that Angular developers typically solve with signal stores plus HttpClient plus a lot of boilerplate.


### Fetch API and Axios — The Primitives


The browser's native fetch API or the axios library handle the actual HTTP calls. They are equivalent to Angular's HttpClient.get/post/put/delete methods, but return Promises rather than Observables. You can use these directly in useEffect, but you typically will not — you will use TanStack Query which wraps them.


```typescript
// Angular HttpClient vs fetch/axios

// Angular:
this.http.get<User[]>('/api/users', { params: { page: '2' } })
  .pipe(catchError(err => { ... }))
  .subscribe(users => this.users.set(users));

// fetch (native, verbose):
const response = await fetch('/api/users?page=2');
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const users = await response.json() as User[];

// axios (library, more ergonomic — similar to Angular HttpClient):
import axios from 'axios';
const { data: users } = await axios.get<User[]>('/api/users', {
  params: { page: 2 }
});
// axios throws automatically for non-2xx — no ok check needed
// axios.post, .put, .patch, .delete work the same way
```


A typed API client built with axios is the closest equivalent to Angular's HttpClient pattern:


```typescript
// api-client.ts — reusable typed HTTP client
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Vite env var
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor (equivalent to Angular's functional interceptors)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // attempt token refresh...
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getAll: (params?: UserParams) =>
    apiClient.get<User[]>('/users', { params }).then(r => r.data),
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then(r => r.data),
  create: (dto: CreateUserDto) =>
    apiClient.post<User>('/users', dto).then(r => r.data),
  update: (id: string, dto: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, dto).then(r => r.data),
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
```


### TanStack Query — Server State Management


TanStack Query (formerly React Query) is the de facto standard for server state in React. It handles all the complexity around data fetching that Angular developers typically implement manually: loading states, error states, caching, background refetching, invalidation, optimistic updates, and pagination.


The mental model shift: instead of 'fetch data in a store and keep it there', TanStack Query says 'declare what data you need and how to fetch it — Query handles everything else'. Data is cached by a unique key and reused across components that request the same key. When the cache entry becomes stale, TanStack Query refetches in the background automatically.


```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```


```typescript
// main.tsx — wrap app with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // data fresh for 5 minutes before background refetch
      gcTime:    10 * 60 * 1000, // cache kept for 10 minutes after last use
      retry: 2,                  // retry failed requests twice
    }
  }
});
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools />  {/* devtools panel — development only */}
  </QueryClientProvider>
);
```


```typescript
// useQuery — fetch and cache data (replaces signal store + HttpClient)

// Angular signal store pattern:          // TanStack Query equivalent:
// this.store.load();                    // const { data: users, isLoading, error } =
// users = this.store.users();           //   useQuery({ queryKey: ['users'], queryFn: fetchUsers });
// isLoading = this.store.isLoading();   // That's it. No store needed.

function UserList() {
  const { data: users, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],          // cache key — same key = same cached data
    queryFn: () => userApi.getAll(), // function that returns the Promise
    staleTime: 60_000,            // this query: fresh for 1 minute
    enabled: true,                // set to false to disable auto-fetching
  });
  if (isLoading) return <Spinner />;
  if (isError)   return <Error message={error.message} onRetry={refetch} />;
  return users!.map(u => <UserCard key={u.id} user={u} />);
}
```


```typescript
// Parameterised queries — re-fetches when params change
function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],   // different key = separate cache entry
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,             // don't fetch if userId is empty
  });
  // When userId changes, TanStack Query fetches the new user automatically
  // Previous data is shown while new data loads (no blank flash)
}
```


### useMutation — Modifying Server Data


useQuery is for reading data. useMutation is for creating, updating, and deleting. It handles loading/error states for write operations and integrates with cache invalidation.


```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateUserForm() {
  const queryClient = useQueryClient();
  const createUser = useMutation({
    mutationFn: (dto: CreateUserDto) => userApi.create(dto),
    onSuccess: (newUser) => {
      // Option 1: invalidate the users list — triggers refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Option 2: optimistically add to cache (no extra request)
      // queryClient.setQueryData(['users'], (old: User[]) => [...old, newUser]);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    }
  });
  const handleSubmit = (formData: CreateUserDto) => {
    createUser.mutate(formData);  // or createUser.mutateAsync(formData)
  };
  return (
    <form onSubmit={...}>
      {/* form fields */}
      <button type='submit' disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
      {createUser.isError && <ErrorMsg error={createUser.error} />}
    </form>
  );
}
```


```typescript
// Custom hook wrapping TanStack Query — Angular-service-like API
// This is the recommended pattern for reusability
export function useUsers(params?: UserParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getAll(params),
  });
}
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
// Usage: const { data: users, isLoading } = useUsers({ role: 'admin' });
// Usage: const createUser = useCreateUser();
```


> 💡 **Tip:** TanStack Query vs Angular signal store: TanStack Query automatically handles caching, stale-while-revalidate, background refetching, pagination, and optimistic updates with less code than a custom signal store. For Angular developers who have spent time building complex stores for server data, TanStack Query feels like having those patterns built-in. Use TanStack Query for all server data; use Zustand or Redux for client-only state (UI state, in-progress forms, wizard steps).


## Forms with React Hook Form + Zod


React has no built-in form solution equivalent to Angular's Reactive Forms. The community has converged on React Hook Form (RHF) as the standard. It takes a fundamentally different approach: rather than Angular's fully controlled model where React owns every value, RHF uses uncontrolled inputs by default — the DOM manages values, React only reads them when needed. This results in far fewer re-renders for large forms.


### React Hook Form Fundamentals


```bash
npm install react-hook-form zod @hookform/resolvers
```


```typescript
// Angular Reactive Form vs React Hook Form — concept mapping:
// FormBuilder.nonNullable.group({...})  → useForm<T>({ resolver: zodResolver(schema) })
// FormControl                           → { ...register('fieldName') }
// FormGroup.valid                       → formState.isValid
// FormGroup.getRawValue()               → getValues()
// Validators.required                  → z.string().min(1, 'Required')
// formGroup.markAllAsTouched()          → trigger() or submit attempt
// handleSubmit                          → handleSubmit(onValid, onInvalid)
```


```typescript
// Simple login form
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema — equivalent to Angular's Validators configuration
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;  // derived TypeScript type

function LoginForm() {
  const {
    register,        // connect inputs to RHF
    handleSubmit,    // form submission wrapper
    formState: { errors, isSubmitting, isValid },
    setError,        // set server-side errors
    watch,           // watch a field's current value
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),  // Zod validates on submit + change
    mode: 'onBlur',  // validate on blur (like Angular's updateOn: 'blur')
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await authApi.login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Set server-side errors (like Angular's setErrors)
      setError('email', { message: 'Invalid email or password' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='field'>
        <label htmlFor='email'>Email</label>
        <input
          id='email'
          type='email'
          {...register('email')}   {/* spreads: name, ref, onChange, onBlur */}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id='email-error' role='alert'>{errors.email.message}</p>
        )}
      </div>
      <div className='field'>
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' {...register('password')} />
        {errors.password && <p role='alert'>{errors.password.message}</p>}
      </div>
      <button type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```


### Zod Schema Validation — Angular Validators Equivalent


Zod is a TypeScript-first schema declaration and validation library. It replaces Angular's Validators.required, Validators.email, Validators.minLength, and custom validators. Zod schemas both validate and infer TypeScript types — define the schema once, get validation AND type safety.


```typescript
import { z } from 'zod';

// Common field validations
const userSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters')
                      .max(100, 'Name cannot exceed 100 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string()
              .min(10, 'At least 10 characters')
              .regex(/[A-Z]/, 'Must contain uppercase letter')
              .regex(/[0-9]/, 'Must contain a number'),
  age:      z.number().int().min(18, 'Must be 18+').max(120),
  role:     z.enum(['admin', 'editor', 'viewer'], { message: 'Invalid role' }),
  website:  z.string().url('Enter a valid URL').optional(),
  phone:    z.string().regex(/^\+?[1-9]\d{1,14}$/).nullable(),
  active:   z.boolean().default(true),
});

// Cross-field validation (Angular's passwordMatchValidator equivalent)
const registrationSchema = z.object({
  password:        z.string().min(10),
  confirmPassword: z.string(),
}).refine(                           // .refine = cross-field validator
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],  // which field shows the error
  }
);

// Conditional validation
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method:     z.literal('card'),
    cardNumber: z.string().regex(/^\d{16}$/, '16 digit card number'),
    expiry:     z.string().regex(/^\d{2}\/\d{2}$/, 'MM/YY format'),
    cvv:        z.string().regex(/^\d{3,4}$/, '3 or 4 digit CVV'),
  }),
  z.object({
    method: z.literal('paypal'),
    email:  z.string().email(),
  }),
]);
// Inferred type knows exactly which fields are required for each method
type PaymentData = z.infer<typeof paymentSchema>;
```


### Complex Forms — useFieldArray


React Hook Form's useFieldArray is the equivalent of Angular's FormArray. It manages dynamic lists of form items with add, remove, and reorder operations.


```typescript
import { useFieldArray } from 'react-hook-form';

const invoiceSchema = z.object({
  clientName: z.string().min(1, 'Required'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Required'),
    quantity:    z.number().int().min(1, 'Must be at least 1'),
    unitPrice:   z.number().min(0.01, 'Must be positive'),
  })).min(1, 'At least one line item required'),
});
type InvoiceData = z.infer<typeof invoiceSchema>;

function InvoiceForm() {
  const { register, control, handleSubmit, watch,
          formState: { errors } } = useForm<InvoiceData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: '',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }]
    }
  });

  // useFieldArray — manages the dynamic list
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems'
  });

  const lineItems = watch('lineItems');  // subscribe to current values
  const total = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('clientName')} placeholder='Client name' />
      {errors.clientName && <p>{errors.clientName.message}</p>}
      {fields.map((field, index) => (
        <div key={field.id}>   {/* field.id is RHF's stable key */}
          <input {...register(`lineItems.${index}.description`)} placeholder='Description' />
          <input {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })} type='number' />
          <input {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} type='number' />
          <button type='button' onClick={() => remove(index)}>Remove</button>
          {errors.lineItems?.[index]?.description && (
            <p>{errors.lineItems[index]!.description!.message}</p>
          )}
        </div>
      ))}
      <button type='button' onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
        Add Line Item
      </button>
      <p>Total: ${total.toFixed(2)}</p>
      <button type='submit'>Submit Invoice</button>
    </form>
  );
}
```


> 💡 **Tip:** Angular vs React Hook Form performance: Angular's reactive forms re-render the component on every keystroke because state is in the component class. React Hook Form uses uncontrolled inputs (the DOM stores the value) and only triggers re-renders for: error state changes, submission, and explicit watch() subscriptions. For large forms with 50+ fields, RHF dramatically outperforms Angular's reactive forms. For small forms, the difference is negligible.


### Controlled vs Uncontrolled — The Core Difference


Angular's reactive forms are always controlled: the form control's value is in the component's TypeScript state, and the input's value attribute is bound to that state. Every keystroke goes: user types → Angular component state updates → Angular re-renders input with new value.


React Hook Form defaults to uncontrolled: the DOM input holds its own value. RHF registers a ref to the input element and reads the value when needed (on submit, on blur, or when explicitly watched). No re-render happens on keystrokes unless you use watch(). When you need controlled behaviour (real-time derived values, conditional field visibility), RHF provides useWatch() or watch().


```typescript
// Controlled input (always re-renders on change) — when you need live values
const email = watch('email');  // subscribe to email changes — causes re-render
<p>Preview: {email}</p>        // shows live email value

// Uncontrolled input (no re-render on change) — for most fields
<input {...register('email')} />  // ref-based — no re-render on keystroke
// Value read on submit via handleSubmit(data => ...)
```


## Ecosystem & Tooling


React's tooling ecosystem has converged significantly over the past few years. Most serious React applications use a well-understood set of tools. Your Angular tooling knowledge transfers more than you might expect — many tools are shared or have near-identical equivalents.


### Vite — The Build Tool


Angular 17+ uses esbuild and Vite under the hood. React applications use Vite directly. If you have worked with the Angular CLI's new build system, Vite's behaviour is familiar: instant dev server startup, HMR in milliseconds, native ESM in development, optimised production bundles via Rollup (which uses esbuild for transformation).


```bash
# Create a React + TypeScript project with Vite
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev
```


```typescript
// vite.config.ts — equivalent to angular.json for build config
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // like tsconfig paths in Angular
    }
  },
  server: {
    port: 3000,
    proxy: {               // like Angular CLI's proxy.conf.json
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {  // manual code splitting — like Angular lazy routes
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query:  ['@tanstack/react-query'],
        }
      }
    }
  }
});
```


```typescript
// Environment variables — Vite uses import.meta.env
// Angular uses environment.ts files
// Vite uses .env files:
// .env                  — all environments
// .env.development      — development only (ng serve equivalent)
// .env.production       — production only (ng build --configuration production)
//
// Variables must start with VITE_ to be exposed to client code:
// VITE_API_URL=https://api.example.com
//
// Access in code:
const apiUrl = import.meta.env.VITE_API_URL;  // typed as string
const isDev  = import.meta.env.DEV;           // built-in boolean
const isProd = import.meta.env.PROD;          // built-in boolean
```


### TypeScript Configuration in React


```typescript
// tsconfig.json for a Vite React project (vs Angular's tsconfig)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",  // same as Angular 17+
    "jsx": "react-jsx",             // enables JSX transform
    "strict": true,                  // same as Angular — always on
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }  // same path aliasing as Angular
  }
}
```


> 📝 **Note:** The main tsconfig difference between Angular and React projects: Angular needs experimentalDecorators: true for @Component, @Injectable etc. React with function components needs jsx: 'react-jsx'. Otherwise, strict TypeScript configuration is essentially identical between the two ecosystems.


### Next.js — React with Everything Included


Next.js is to React what Angular is to bare JavaScript, in terms of being a complete framework rather than just a library. It adds: server-side rendering (SSR), static site generation (SSG), file-based routing, API routes (serverless functions), image optimisation, font optimisation, and production-ready configuration. Most 'React' job listings in 2026 actually mean a Next.js stack.


The key mental model: in Next.js, the router is replaced by the file system. Files in the app/ directory map directly to routes. A file at app/users/[userId]/page.tsx becomes the route /users/:userId. No route config needed.


### App Router — File-Based Routing


```typescript
// Next.js App Router file structure:
app/
  layout.tsx           → applies to all routes (root shell + NavBar)
  page.tsx             → renders at /
  dashboard/
    page.tsx           → renders at /dashboard
    layout.tsx         → applies to /dashboard and all children
  users/
    page.tsx           → renders at /users
    [userId]/          → dynamic segment (like :userId in Angular Router)
      page.tsx         → renders at /users/123
      edit/
        page.tsx       → renders at /users/123/edit
  (auth)/              → route group (parentheses = not in URL)
    login/page.tsx     → renders at /login (no '(auth)' in URL)
    register/page.tsx  → renders at /register
  api/
    users/route.ts     → API endpoint at /api/users (serverless function)
```


```typescript
// app/layout.tsx — root layout (equivalent to AppComponent in Angular)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <NavBar />
        <main>{children}</main>  {/* pages render here */}
        <Footer />
      </body>
    </html>
  );
}
```


### Server Components vs Client Components


Next.js App Router introduced Server Components — a new paradigm where React components can run on the server and stream HTML to the browser. This is different from Angular Universal's SSR, which renders the full app on the server and hydrates on the client. React Server Components render specific components on the server without sending their JavaScript to the browser at all.


**Server Components (default in Next.js App Router):** run only on the server. Can directly access databases, file systems, and secret environment variables. Cannot use browser APIs, useState, useEffect, or event handlers. Do not increase client JavaScript bundle size. Ideal for: data fetching, static content, layouts, anything that does not need interactivity.


**Client Components ('use client' directive):** run on the client (and also on the server for initial HTML). Can use hooks (useState, useEffect, etc.), event handlers, browser APIs. Equivalent to standard React components you have been writing throughout this guide. Add 'use client' at the top of any file that needs these capabilities.


```typescript
// app/users/page.tsx — Server Component (NO 'use client' — default)
// This runs on the server. Direct database access is possible.
async function UsersPage() {
  // Direct data fetching — no useEffect, no loading state
  // fetch in Server Components is cached and deduped automatically
  const users = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 }  // cache for 60 seconds (ISR)
  }).then(r => r.json()) as User[];

  return (
    <div>
      <h1>Users ({users.length})</h1>
      {users.map(user => (
        <UserCard key={user.id} user={user} />  // UserCard can be server or client
      ))}
    </div>
  );
}
export default UsersPage;
```


```typescript
// components/DeleteUserButton.tsx — Client Component
'use client';  // this directive marks it as a Client Component

import { useState } from 'react';
export function DeleteUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    setLoading(false);
  };
  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete User'}
    </button>
  );
}
```


> 💡 **Tip:** For interview purposes: 'React Server Components are components that run only on the server and never ship JavaScript to the browser. They are ideal for data fetching and static rendering. Client Components are standard React components that run in the browser. Next.js App Router uses Server Components by default — you opt into Client Components with the use client directive.'


### Testing — Vitest and React Testing Library


React Testing Library is the same @testing-library package you already know from Angular. The query API — getByRole, getByLabelText, getByText, findByRole, queryByRole — is identical. Your existing Testing Library knowledge transfers directly. Only the test runner and component setup differ.


```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```


```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',  // browser-like environment
    globals: true,         // describe, it, expect available globally
    setupFiles: './src/test/setup.ts'),
    coverage: { reporter: ['text', 'html', 'lcov'] }
  }
});
```


```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';  // adds DOM matchers: toBeInTheDocument etc.
```


```typescript
// Component test — same Testing Library API you know
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';  // vi = jest in Vitest

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);  // vi.fn() = jest.fn()
    const user = userEvent.setup();
    render(<LoginForm onLogin={onLogin} />);
    await user.type(screen.getByLabelText(/email/i), 'alice@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onLogin).toHaveBeenCalledWith('alice@test.com', 'password123!');
  });
  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });
});
```


```typescript
// Testing with TanStack Query — wrap with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }  // no retries in tests
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

it('loads and displays users', async () => {
  // Mock fetch globally
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([{ id: '1', name: 'Alice' }])
  } as Response);
  render(<UserList />, { wrapper: createWrapper() });
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```


### Styling Options


Angular provides component-scoped SCSS out of the box. React has no built-in styling solution — you choose from several patterns. The three most common in 2026 React projects:

- **CSS Modules** — import styles from './Button.module.css'. className={styles.button}. Scoped CSS — class names are hashed per file to prevent collisions. Closest to Angular's component SCSS. Zero runtime cost, works with any CSS features.
- **Tailwind CSS** — utility-first CSS framework. className='flex items-center gap-4 px-4 py-2 rounded-lg bg-blue-600 text-white'. No separate CSS files for components. Extremely fast once the utility classes are memorised. The majority of new React projects in 2026 use Tailwind.
- **styled-components / Emotion** — CSS-in-JS. Styles are written in JavaScript template literals and produce real CSS class names. const Button = styled.button`padding: 8px 16px;`. Supports dynamic styles based on props. Higher runtime cost; falling in popularity as Tailwind has risen.

```typescript
// CSS Modules example
// Button.module.css
.button { padding: 8px 16px; border-radius: 6px; font-weight: 600; }
.button--primary { background: #3b82f6; color: white; }
.button--danger { background: #ef4444; color: white; }

// Button.tsx
import styles from './Button.module.css';
function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[`button--${variant}`]}`}
      {...props}
    >{children}</button>
  );
}
```


```typescript
// Tailwind example — no CSS file needed
function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-semibold transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger:  'bg-red-600 text-white hover:bg-red-700',
    ghost:   'bg-transparent border border-gray-300 hover:bg-gray-50',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
```


## Interview Preparation


This section gives you rehearsed, confident answers to the React questions you will face as an Angular developer applying for Angular-or-React roles. The goal is not to claim React expertise — it is to demonstrate genuine understanding of React's architecture, how it compares to Angular, and that you could become productive in React rapidly.


### Answering 'Have You Worked With React?'


This is the question you will face most often. Do not be defensive. Be direct, honest, and immediately pivot to what you DO know and how it applies.


**Strong answer:** I haven't used React in a production environment — my recent experience is Angular. But I've invested time getting up to speed on React because I know many strong front-end teams use it. I'm comfortable with JSX, function components, hooks (useState, useEffect, useContext, useMemo, useCallback), React Router, and TanStack Query. Coming from Angular, I found React's component model familiar — the data flow, composition, and state management patterns are conceptually similar even if the syntax differs. The biggest mental shift was React's 'bring your own library' philosophy versus Angular's batteries-included approach. I'd expect to be productive in a React codebase within a few weeks.


What makes this answer strong: (1) it is honest — no false claims, (2) it shows concrete knowledge of specific APIs and libraries, (3) it demonstrates you have thought about the conceptual differences, (4) it ends with confidence in your ability to ramp up.


### 'What Are the Main Differences Between Angular and React?'


This question tests whether you understand both tools at an architectural level. A shallow answer lists syntax differences. A strong answer addresses the fundamental design philosophies.


**Framework vs Library:** Angular is a complete, opinionated framework — it includes routing, forms, HTTP client, animations, i18n, and testing utilities. React is a rendering library — it handles component rendering and state updates, and you choose your own solutions for everything else. The Angular approach means more consistency and less decision fatigue. The React approach means more flexibility and a larger ecosystem of specialist libraries.


**Template syntax:** Angular uses a superset of HTML with Angular-specific directives and control flow syntax, compiled at build time. React uses JSX — JavaScript with HTML-like syntax — which puts all logic directly in JavaScript. Angular's approach separates template concerns; React's approach keeps everything in one place.


**Change detection:** Angular uses Zone.js to detect when async operations complete and trigger change detection across the component tree. React uses the Virtual DOM — it re-renders component functions and diffs the output to find minimal DOM changes. Angular 17+ signals and React are converging: both now support fine-grained reactive updates that skip unrelated components.


**Dependency injection:** Angular has a first-class DI system with injectable services, hierarchical injectors, and scoped providers. React has no DI system. Logic is shared via custom hooks (which create independent instances per component) and the Context API (which provides a single instance to all consumers). These are different tools solving the same problem — React's approach is simpler but less powerful for enterprise-scale applications.


**TypeScript integration:** Both ecosystems use TypeScript universally for serious projects. Angular was built with TypeScript from the start; React adopted it over time. In practice, TypeScript usage and strictness are equivalent in modern codebases for both frameworks.


### 'What Would It Take You to Get Productive in React?'


This question tests self-awareness and learning capability. Hiring managers asking this are usually already comfortable hiring you — they want to understand your plan.


**Strong answer:** I'd focus on three things. First, the core hooks pattern — useState, useEffect, useCallback, useMemo — which I've already studied. That's 80% of what you write day-to-day. Second, the specific libraries your team uses — TanStack Query or Redux, React Hook Form or Formik, CSS Modules or Tailwind. The concepts are the same across options; it's just syntax. Third, hands-on time in your actual codebase. I learn best by reading existing code, understanding the patterns your team has established, and asking questions. I'd expect to make meaningful contributions within the first sprint and be fully independent within a month.


### 'Which Do You Prefer, Angular or React, and Why?'


This is a culture-fit question as much as a technical one. They want to see mature engineering judgment, not fandom. Do not trash either framework — that signals poor judgment. Show that you evaluate tools based on context.


**Strong answer:** I've worked most deeply in Angular, so it has the familiarity advantage. But I think the honest answer is: it depends on the context. I prefer Angular for large enterprise applications with multiple teams, strict conventions, and long-term codebases — the framework's opinions reduce the surface area for inconsistency. I find React more appealing for applications where rendering performance is critical, where the team wants maximum flexibility in library choices, or where the application has unusual requirements that don't fit Angular's model well. If your team uses React and has established strong conventions around it, that's what I'd reach for here.


### Technical Questions You May Face


### 'Explain React's rendering model'


When state changes, React re-runs the component function and produces a new tree of React elements (plain objects). It diffs this against the previous tree — the reconciliation algorithm — and applies only the minimal necessary real DOM updates. This is the Virtual DOM. React 18's concurrent rendering allows React to pause and resume rendering, prioritising user interactions over less urgent updates. In practice: set state, React re-renders, DOM updates. The Virtual DOM diffing is what makes this efficient.


### 'What is the difference between useEffect and useLayoutEffect?'


useEffect runs asynchronously after the browser has painted the screen. useLayoutEffect runs synchronously after DOM mutations but before the browser paints. useLayoutEffect is equivalent to Angular's ngAfterViewInit — use it when you need to measure DOM elements (getBoundingClientRect) or imperatively update the DOM before the user sees the result, to prevent visual flicker. For most side effects — data fetching, subscriptions, analytics — useEffect is correct.


### 'What are React keys and why do they matter?'


Keys tell React which items in a list are which across re-renders. When a list changes, React uses keys to match old and new items. Without keys (or with index keys), React remounts components unnecessarily when items are reordered or deleted, causing lost component state and poor performance. Keys must be stable (same item → same key across renders), unique (no two siblings have the same key), and not array indexes (indexes change when items are added/removed).


### 'What is prop drilling and how do you solve it?'


Prop drilling is passing props through many layers of components just to get data from a high-level component to a deeply nested one. Every intermediate component receives and re-passes the prop even though it does not use it. Solutions: (1) Context API for global data accessed by many unrelated components. (2) Component composition — restructure the component tree so the component that needs the data is a direct child of the component that has it. (3) External state management — Zustand or Redux puts data outside the tree entirely. In Angular, the DI system solves this: any component can inject any service regardless of position. React requires explicit solutions.


### 'What is memoization in React?'


Memoization prevents unnecessary computation and re-rendering. Three tools: useMemo memoizes a computed value — the function only runs when its dependencies change (equivalent to Angular's computed() signal). useCallback memoizes a function reference — the function is not recreated on every render (prevents child components from re-rendering when they receive callback props). React.memo wraps a component — it skips re-rendering if its props have not changed (equivalent to Angular's OnPush combined with stable input references). Over-memoizing is a common mistake — the overhead of memoization can exceed the cost of re-computation for simple operations.


### Full Angular ↔ React Concept Comparison

- **Component** — Angular: TypeScript class + @Component decorator. React: TypeScript function returning JSX.
- **Component state** — Angular: signal(). React: useState().
- **Derived state** — Angular: computed(). React: useMemo().
- **Side effects** — Angular: effects + ngOnInit/ngOnDestroy. React: useEffect().
- **DOM access** — Angular: viewChild() / ElementRef. React: useRef() with ref attribute.
- **Parent → child data** — Angular: @Input() / input(). React: props.
- **Child → parent event** — Angular: @Output() / output().emit(). React: callback prop function.
- **Two-way binding** — Angular: model() / [(ngModel)]. React: value prop + onChange callback.
- **Content projection** — Angular: \<ng-content\>. React: children prop.
- **Conditional rendering** — Angular: @if / @else. React: && or ternary in JSX.
- **List rendering** — Angular: @for track item.id. React: array.map(item =\> \<El key={item.id} /\>).
- **Lazy loading** — Angular: loadComponent / loadChildren. React: React.lazy() + Suspense.
- **Dependency injection** — Angular: @Injectable + inject(). React: none — use custom hooks or Context.
- **Shared logic** — Angular: Injectable service. React: custom hook (function starting with 'use').
- **Global state** — Angular: Signal store / NgRx. React: Zustand / Redux Toolkit.
- **HTTP client** — Angular: HttpClient + RxJS. React: fetch/axios + TanStack Query.
- **Routing** — Angular: Angular Router. React: React Router v6 / Next.js App Router.
- **Forms** — Angular: Reactive Forms. React: React Hook Form + Zod.
- **Change detection** — Angular: Signals / Zone.js / OnPush. React: Virtual DOM reconciliation / React.memo.
- **Testing** — Angular: TestBed + Testing Library + Playwright. React: Vitest + Testing Library + Playwright.
- **Build tool** — Angular: Angular CLI (esbuild + Vite). React: Vite directly / Next.js.
- **SSR** — Angular: Angular Universal / withComponentInputBinding. React: Next.js Server Components.
- **Lifecycle: on mount** — Angular: ngOnInit / afterNextRender(). React: useEffect with [] dependency.
- **Lifecycle: on change** — Angular: ngOnChanges / effect(). React: useEffect with dependency array.
- **Lifecycle: on destroy** — Angular: ngOnDestroy / DestroyRef. React: useEffect cleanup function return.

### Your 30-Day React Ramp-Up Plan


If you get a React role, here is a realistic plan to become productive within a month:


**Week 1 — Foundations:** Set up a Vite React TypeScript project. Build 5-10 small components covering all 6 core hooks. Implement a mini todo app with useState, useEffect for localStorage, and basic React Router. Read the Thinking in React documentation — it is 5 pages and covers the entire React mental model.


**Week 2 — Ecosystem:** Integrate TanStack Query against a real API (use JSONPlaceholder or your own backend). Add React Hook Form + Zod for a multi-field form with cross-field validation. Add Zustand for one piece of global state. Explore the codebase patterns your team uses.


**Week 3 — Team patterns:** Pair with a React developer on the team. Read your team's existing components and understand their patterns. Write your first feature with code review. Focus on matching the team's style, not writing the code you would write independently.


**Week 4 — Independence:** Take on a full feature from ticket to PR independently. Write tests alongside the code. Ask fewer questions; look at existing code first. Review the performance patterns: React.memo, useCallback, useMemo — apply them where profiling shows they matter.


> 💡 **Tip:** The fastest way to become productive in React is to read a lot of existing React code in a real codebase. Framework documentation teaches you the API; real codebases teach you how experienced React developers think. If you get access to the codebase before starting, read it.


---

*End of React for Angular Developers*
