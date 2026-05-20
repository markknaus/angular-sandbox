# Programming Foundations
### A Refresher for Experienced Developers

> Core programming concepts, the terminal, Node.js, npm, Git, and Angular orientation — the bedrock that every other document in this library builds on

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [How to Use This Document](#how-to-use-this-document)
- [Core Programming Concepts](#core-programming-concepts)
  - [Variables and Data Types](#variables-and-data-types)
  - [Operators](#operators)
  - [Control Flow](#control-flow)
  - [Functions](#functions)
  - [Objects and Classes](#objects-and-classes)
  - [Synchronous vs Asynchronous Code](#synchronous-vs-asynchronous-code)
  - [Error Handling](#error-handling)
  - [What is an API?](#what-is-an-api)
- [The Terminal and Command Line](#the-terminal-and-command-line)
  - [Essential Commands](#essential-commands)
- [Node.js](#nodejs)
- [npm — Node Package Manager](#npm--node-package-manager)
  - [package.json — Your Project's Manifest](#packagejson--your-projects-manifest)
  - [Semantic Versioning](#semantic-versioning)
  - [Essential npm Commands](#essential-npm-commands)
- [Git and Version Control](#git-and-version-control)
  - [Core Concepts](#core-concepts)
  - [Daily Workflow](#daily-workflow)
  - [Writing Good Commit Messages](#writing-good-commit-messages)
  - [.gitignore — What Git Should Ignore](#gitignore--what-git-should-ignore)
- [Angular Orientation](#angular-orientation)
  - [What Angular Is and Why It Exists](#what-angular-is-and-why-it-exists)
  - [Creating a New Project](#creating-a-new-project)
  - [Project Structure](#project-structure)
  - [Components — The Building Blocks](#components--the-building-blocks)
  - [Data Binding — Connecting Templates to TypeScript](#data-binding--connecting-templates-to-typescript)
  - [Services and Dependency Injection](#services-and-dependency-injection)
  - [Basic Routing](#basic-routing)
  - [NgModule vs Standalone Components](#ngmodule-vs-standalone-components)
  - [Development Tools](#development-tools)
- [HTTP Fundamentals for Angular Developers](#http-fundamentals-for-angular-developers)
  - [HTTP Methods](#http-methods)
  - [REST API Conventions](#rest-api-conventions)
  - [JSON — The Data Format of the Web](#json--the-data-format-of-the-web)
  - [HTTP Headers](#http-headers)
  - [The Browser DevTools Network Tab](#the-browser-devtools-network-tab)


## How to Use This Document

This document covers the bedrock that every other document in this library assumes. It is written as a refresher — not a tutorial for someone who has never coded, but a structured review for someone who has worked in development for years and may be rusty on certain concepts or encountering JavaScript-specific idioms for the first time.

**Scan each section.** If a topic is completely familiar, move on. If something feels "almost remembered" or you're unsure of a nuance, read it carefully. The goal is to eliminate gaps that slow you down when reading the deeper technical documents.

---

## Core Programming Concepts

These concepts apply regardless of programming language. They are included here because some are expressed differently in JavaScript and TypeScript than in other languages, and the Angular-specific nuances matter.

### Variables and Data Types

A variable is a named storage location in memory. JavaScript has six primitive types:

- **String** — text data: `'Hello world'`, `'alice@example.com'`. Immutable — operations on strings create new strings.
- **Number** — all numeric values: integers and floats share one type. `42`, `3.14`, `-7`. There is no separate `int` or `float` type.
- **Boolean** — `true` or `false`. The result of comparison expressions.
- **null** — intentionally no value. Assigned explicitly by a developer.
- **undefined** — a variable that was declared but never assigned. Distinct from `null` — `null` is intentional absence, `undefined` is accidental or unset.
- **Symbol** — unique, immutable identifier. Rarely used directly but appears in advanced TypeScript patterns.

Non-primitive types (objects): **Array**, **Object**, **Function**, **Map**, **Set**, and more. These are reference types — a variable holds a reference to the object in memory, not the object itself. This matters significantly when comparing values and when passing objects to functions.

```typescript
// Variable declarations — prefer const, use let when value must change
const name = 'Alice';              // string — cannot be reassigned
let age = 30;                      // number — can be reassigned
let isActive = true;               // boolean
const scores = [95, 87, 92, 78];   // array — const means the reference is fixed,
                                   // not that the contents are immutable
const user = { name: 'Alice', age: 30 };  // object
let nothing = null;                // null — intentional empty value
let notSet: string | undefined;    // undefined — never assigned

// Reference type gotcha — always copy objects before mutating
const original = { name: 'Alice' };
const copy = original;     // WRONG — copy and original point to the SAME object
copy.name = 'Bob';         // this also changes original.name!

const safeCopy = { ...original }; // RIGHT — spread creates a shallow copy
```

### Operators

```typescript
// Arithmetic
10 + 3   // 13
10 - 3   // 7
10 * 3   // 30
10 / 3   // 3.333...
10 % 3   // 1 (remainder)
2 ** 10  // 1024 (exponentiation)

// Comparison — ALWAYS use === (strict equality), never == (loose equality)
5 === 5     // true  — same value, same type
5 === '5'   // false — different types
5 == '5'    // true  — loose equality coerces types, avoid this
null === undefined  // false (strict)
null == undefined   // true (loose) — one of the few cases where == is intentional

// Logical
true && false  // false — AND: both must be true
true || false  // true  — OR: at least one must be true
!true          // false — NOT: inverts the boolean

// Nullish coalescing — use ?? instead of || when 0 and '' are valid values
const value = user.score || 'N/A';   // WRONG: returns 'N/A' when score is 0
const value = user.score ?? 'N/A';   // RIGHT: returns 'N/A' only when null/undefined

// Optional chaining — safely navigate deeply nested objects
const city = user?.address?.city;    // returns undefined instead of throwing
const first = items?.[0];            // safely access array index
const result = handler?.();          // safely call a function that might not exist
```

### Control Flow

```typescript
// if / else if / else
const score = 75;
if (score >= 90) {
  console.log('Grade: A');
} else if (score >= 80) {
  console.log('Grade: B');
} else if (score >= 70) {
  console.log('Grade: C');  // this runs
} else {
  console.log('Grade: F');
}

// Ternary — good for simple, readable conditionals
const label = score >= 70 ? 'Pass' : 'Fail';

// Switch — for multiple conditions on the same value
switch (user.role) {
  case 'admin':   showAdminPanel(); break;
  case 'editor':  showEditorPanel(); break;
  default:        showViewerPanel();
}

// for loop
for (let i = 0; i < 5; i++) {
  console.log(i);  // 0, 1, 2, 3, 4
}

// for...of — iterate over items in an iterable (array, string, Map, Set)
const users = ['Alice', 'Bob', 'Carol'];
for (const user of users) {
  console.log(user);
}

// for...in — iterate over keys of an object (less common, avoid on arrays)
const obj = { a: 1, b: 2 };
for (const key in obj) {
  console.log(key, obj[key]);  // 'a' 1, 'b' 2
}

// while — when iteration count is unknown in advance
let count = 0;
while (count < 3) {
  count++;
}
```

### Functions

Functions in JavaScript are first-class values — they can be assigned to variables, passed as arguments, and returned from other functions. This is fundamental to how Angular and RxJS work.

```typescript
// Function declaration — hoisted (can be called before it's defined)
function add(a: number, b: number): number {
  return a + b;
}

// Function expression — not hoisted
const multiply = function(a: number, b: number): number {
  return a * b;
};

// Arrow function — shorter syntax, inherits 'this' from surrounding scope
// (this is why Angular component methods should NOT use arrow functions —
// they would inherit the wrong 'this')
const double = (n: number): number => n * 2;
const square = (n: number) => n * n;   // implicit return for single expressions
const greet = () => console.log('Hello');  // no parameters

// Default parameters
function createUser(name: string, role: string = 'viewer', active: boolean = true) {
  return { name, role, active };
}
createUser('Alice');           // { name: 'Alice', role: 'viewer', active: true }
createUser('Bob', 'admin');    // { name: 'Bob', role: 'admin', active: true }

// Rest parameters — collect remaining arguments into an array
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4);  // 10

// Higher-order functions — functions that take or return functions
function withLogging(fn: Function) {
  return (...args: any[]) => {
    console.log('Calling with:', args);
    const result = fn(...args);
    console.log('Result:', result);
    return result;
  };
}
const loggedAdd = withLogging(add);
loggedAdd(2, 3);  // logs and returns 5
```

> 📝 Functions should do one thing. A function that fetches data, transforms it, validates it, and saves it to a database is four functions in a trench coat. Breaking it into focused functions makes code testable, debuggable, and reusable.

### Objects and Classes

```typescript
// Object literal — properties and methods together
const user = {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
  greet(): string {
    return `Hi, I'm ${this.name}`;
  }
};

// Shorthand property syntax when variable name matches property name
const name = 'Alice';
const age = 30;
const shorthand = { name, age };  // same as { name: name, age: age }

// Class — blueprint for creating objects
class Animal {
  name: string;
  sound: string;

  constructor(name: string, sound: string) {
    this.name = name;
    this.sound = sound;
  }

  speak(): string {
    return `${this.name} says ${this.sound}`;
  }
}

class Dog extends Animal {
  tricks: string[] = [];

  constructor(name: string) {
    super(name, 'woof');  // must call super() before using 'this'
  }

  learnTrick(trick: string): void {
    this.tricks.push(trick);
  }
}

const dog = new Dog('Rex');
dog.speak();            // 'Rex says woof' — inherited from Animal
dog.learnTrick('sit');

// Access modifiers in TypeScript (not in plain JavaScript)
class UserService {
  private apiUrl = '/api/users';      // only accessible within this class
  protected baseUrl = '/api';         // accessible in this class and subclasses
  public name = 'UserService';        // accessible anywhere (default)
  readonly id = 'user-service-1';     // cannot be changed after construction
}

// TypeScript shorthand constructor — declare and assign in one step
class Config {
  constructor(
    private readonly apiUrl: string,
    public readonly appName: string,
    private debug: boolean = false
  ) {}
  // equivalent to declaring properties and assigning in constructor body
}
```

### Synchronous vs Asynchronous Code

JavaScript is single-threaded — one operation runs at a time on the main thread. Synchronous code blocks: the next line cannot run until the current one finishes. This is a problem for slow operations like network requests or disk reads.

Asynchronous code solves this by registering a callback to run when a slow operation completes, then immediately continuing. The slow operation runs "in the background" (handled by browser Web APIs or Node.js I/O), and when it finishes, the callback is queued.

```typescript
// Synchronous — each line waits for the previous
const result = calculateSomething();
console.log(result);

// Asynchronous with callback — old style, leads to "callback hell"
setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);
console.log('This runs immediately');  // prints BEFORE the setTimeout callback

// Asynchronous with Promise — modern, chainable
fetch('/api/users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(error => console.error(error));

// async/await — cleanest syntax, built on Promises
async function loadUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Failed:', error);
    throw error;  // re-throw if callers need to handle it
  }
}

// Common async pitfall — forgetting await
async function broken() {
  const users = loadUsers();  // WRONG: users is a Promise, not User[]
  console.log(users.length);  // TypeError: Cannot read property 'length' of Promise
}

async function correct() {
  const users = await loadUsers();  // RIGHT: waits for the Promise to resolve
  console.log(users.length);
}
```

> 💡 Think of async code like ordering food at a restaurant. You place your order (start the async operation), then you can drink water, talk to friends (do other things), and your food arrives when ready (the callback fires). You do not stand frozen at the counter staring at the kitchen.

In Angular specifically, most async work uses **Observables** (from RxJS) rather than Promises. Observables are more powerful — they can emit multiple values over time, can be cancelled, and compose with operators. The Angular-specific coverage is in the JavaScript and RxJS documents. The key point here: async is not optional in web development. Every HTTP call, every user event, every timer is async.

### Error Handling

```typescript
// try/catch/finally — the standard synchronous error handling pattern
try {
  const data = JSON.parse(invalidJsonString);  // throws SyntaxError
  processData(data);
} catch (error) {
  // error is an Error object with .message, .name, and .stack
  console.error('Failed to parse JSON:', (error as Error).message);
  showUserFriendlyMessage('Invalid data received');
} finally {
  // runs whether try succeeded or catch ran — good for cleanup
  hideLoadingSpinner();
}

// Throwing your own errors
function dividePositive(a: number, b: number): number {
  if (b === 0) throw new Error('Cannot divide by zero');
  if (a < 0 || b < 0) throw new RangeError('Both numbers must be positive');
  return a / b;
}

// Custom error types — useful for catching specific error categories
class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(public readonly resourceId: string) {
    super(`Resource not found: ${resourceId}`);
    this.name = 'NotFoundError';
  }
}

// Catch specific error types
try {
  validateUser(userInput);
} catch (e) {
  if (e instanceof ValidationError) {
    highlightField(e.field, e.message);
  } else if (e instanceof NotFoundError) {
    router.navigate(['/not-found']);
  } else {
    throw e;  // re-throw errors you don't know how to handle
  }
}
```

### What is an API?

In web development, API (Application Programming Interface) almost always means a service running on a server that responds to HTTP requests with structured data — almost always JSON. Your Angular application is a client that calls APIs to fetch data and submit changes.

The term is broader: an API is any boundary at which two pieces of software communicate. Angular's `@Input()` is a component's API. A JavaScript class's public methods are its API. But in the context of "calling an API from Angular", it means an HTTP endpoint.

```typescript
// The HTTP request-response pattern
// Your Angular app sends: GET /api/users
// The API responds with: 200 OK, body: [{ "id": "1", "name": "Alice" }, ...]

// This is handled in Angular via HttpClient
this.http.get<User[]>('/api/users').subscribe({
  next: users => this.users.set(users),
  error: err => this.error.set(err.message)
});
```

REST APIs — the most common type — follow conventions for how URLs and HTTP methods map to operations on data. The HTTP section at the bottom of this document covers these conventions in full.

---

## The Terminal and Command Line

Angular development requires terminal comfort. The `ng` CLI, `npm`, Git, running tests — everything happens in the terminal. On macOS and Linux this is Terminal or iTerm. On Windows use PowerShell or Windows Terminal. VS Code has a built-in terminal (`` Ctrl+` ``) — use it so your terminal is always in your project directory.

### Essential Commands

```bash
# Navigation
pwd               # print working directory — shows where you are
ls                # list files (macOS/Linux)
ls -la            # list including hidden files and permissions
dir               # list files (Windows)
cd my-project     # change into 'my-project' directory
cd ..             # go up one directory (to parent)
cd ~              # go to home directory (macOS/Linux)

# Files and directories
mkdir my-folder         # make a new directory
touch app.ts            # create empty file (macOS/Linux)
cp file.ts copy.ts      # copy a file
mv file.ts new-name.ts  # rename or move a file
rm file.ts              # delete a file (no trash — gone immediately)
rm -rf my-folder        # delete folder and all contents (be careful)
cat file.ts             # print file contents to terminal

# Running programs
node script.js          # run a JavaScript file with Node.js
npx some-tool           # run a package binary without global install
Ctrl+C                  # stop a running process (ng serve, jest --watch, etc.)
Tab                     # autocomplete — use this constantly
Up arrow                # cycle through previous commands

# Useful shortcuts
clear                   # clear terminal screen
history                 # show recent commands
grep 'pattern' file.ts  # search for text in a file
grep -r 'pattern' src/  # search recursively in a directory
```

> 💡 Tab completion is the single most important terminal habit. Type the first few characters and press Tab. If nothing completes, press Tab twice to see all options. It prevents typos and is faster than typing full names.

---

## Node.js

Node.js is a JavaScript runtime that runs outside the browser. It lets JavaScript execute on your machine as a server-side or tooling environment. As an Angular developer you are not writing Node.js applications — you are using tools *built with* Node.js: the Angular CLI (`ng`), esbuild, Vite, Jest, ESLint, Prettier.

Angular requires Node.js 18.13 or later. Different projects may require different versions — use **nvm** (Node Version Manager) to install and switch between versions.

```bash
# Check installed versions
node --version    # e.g., v20.11.0
npm --version     # e.g., 10.2.4

# nvm — Node Version Manager (install from nvm.sh)
nvm install 20        # install Node.js 20 LTS
nvm use 20            # switch to Node.js 20 in current session
nvm alias default 20  # set Node.js 20 as default for all sessions
nvm list              # show all installed versions
```

---

## npm — Node Package Manager

npm is the package registry and package manager for the JavaScript ecosystem. It manages the third-party code (packages, libraries) your project depends on. When you run `npm install`, npm downloads all packages listed in `package.json` into the `node_modules` folder.

### package.json — Your Project's Manifest

`package.json` is a JSON file at the root of every JavaScript project. It describes the project name and version, lists dependencies, and defines scripts (commands) for common tasks.

```json
{
  "name": "my-angular-app",
  "version": "1.0.0",
  "scripts": {
    "start":  "ng serve",
    "build":  "ng build",
    "test":   "jest",
    "lint":   "ng lint",
    "check":  "npm run lint && npm test && npm run build"
  },
  "dependencies": {
    "@angular/core": "^17.3.0",
    "@angular/common": "^17.3.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular/cli": "^17.3.0",
    "typescript": "~5.4.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

`dependencies` are packages needed at runtime (shipped to users). `devDependencies` are packages needed only during development (build tools, test runners, linters — not shipped).

### Semantic Versioning

npm uses semver (semantic versioning) to specify acceptable version ranges. Understanding this prevents unexpected upgrades or broken installs.

| Prefix | Example | Meaning |
|---|---|---|
| `^` (caret) | `^17.3.0` | `>=17.3.0 <18.0.0` — same major, any minor/patch |
| `~` (tilde) | `~17.3.0` | `>=17.3.0 <17.4.0` — same major.minor, any patch |
| none | `17.3.0` | Exactly this version |
| `*` | `*` | Any version — dangerous, avoid |

The caret (`^`) is npm's default when you `npm install` a package. It allows minor and patch updates automatically, which is usually safe. The tilde (`~`) is more conservative — only patch updates. For framework packages like Angular, exact or tilde versioning reduces the risk of unexpected breaking changes.

### Essential npm Commands

```bash
# Install all dependencies from package.json
npm install
npm i              # shorthand

# Install a specific package
npm install @angular/material          # adds to dependencies
npm install --save-dev jest            # adds to devDependencies (-D shorthand)
npm install --save-exact lodash        # install exact version (no ^ prefix)

# Install packages for CI — reads package-lock.json exactly, fails if out of sync
npm ci             # faster and more deterministic than npm install — use in CI

# Remove a package
npm uninstall some-package

# Check for outdated packages
npm outdated       # shows current, wanted, and latest versions

# Security checks
npm audit                    # show vulnerabilities in dependency tree
npm audit --audit-level=high # fail only on high/critical
npm audit fix                # auto-fix within semver constraints
npm audit fix --force        # allow breaking version changes (review carefully)

# Run scripts from package.json
npm start          # runs 'start' script
npm test           # runs 'test' script
npm run build      # runs 'build' script (non-standard scripts need 'run')
npm run lint

# Run a package binary without global install
npx ng generate component hero
npx playwright test

# Useful inspection commands
npm ls <package>   # show why a package is in your dependency tree
npm dedupe         # remove duplicate transitive dependencies
```

> ⚠️ Never commit `node_modules` to git. It contains thousands of files and potentially hundreds of megabytes. Angular projects generate a `.gitignore` that excludes it. Anyone cloning the project runs `npm install` to recreate it.

---

## Git and Version Control

Git is the universal version control system. Every professional project uses it. The basics are straightforward — the commands you use daily are few.

### Core Concepts

**Repository (repo):** A directory with Git tracking enabled (`git init` or cloned from GitHub). Git stores the complete history of every change ever made.

**Commit:** A snapshot of the project at a point in time. Each commit has a unique hash, a message describing the change, and a pointer to the previous commit.

**Branch:** An independent line of development. The default branch is typically `main` (or `master` in older repos). You create branches for features, work on them, and merge them back when done.

**Remote:** A copy of the repo hosted elsewhere — typically GitHub, GitLab, or Azure DevOps. `origin` is the conventional name for the primary remote.

**Staging area (index):** An intermediate area where you prepare changes before committing. `git add` moves changes from your working directory to the staging area. `git commit` records what's in the staging area as a commit.

### Daily Workflow

```bash
# --- Starting work on a new feature ---
git checkout main          # switch to main branch
git pull origin main       # get latest changes from remote
git checkout -b feature/user-profile  # create and switch to new branch

# --- Working ---
# ... make changes to files ...
git status                 # see what's changed (always run this first)
git diff                   # see the actual changes (unstaged)
git diff --staged          # see changes you've already staged

# --- Saving your work ---
git add src/app/features/profile/  # stage a directory
git add -p                 # interactively stage hunks (powerful — stage partial files)
git commit -m 'feat(profile): add user avatar upload'

# --- Sharing and updating ---
git push origin feature/user-profile  # push branch to remote (first time adds -u)
git push                   # subsequent pushes on the same branch

# --- Incorporating others' changes ---
git fetch origin           # download remote changes without merging
git pull origin main       # fetch + merge main into current branch
git rebase origin/main     # rebase: replay your commits on top of latest main
                           # results in cleaner history than merge

# --- Common fixes ---
git restore file.ts        # discard unstaged changes to a file
git restore --staged file.ts  # unstage a file (keep changes in working directory)
git stash                  # save work-in-progress temporarily (switch branches, etc.)
git stash pop              # restore stashed changes

# --- Reviewing history ---
git log --oneline          # compact history
git log --oneline --graph  # visual branch graph
git show <hash>            # show a specific commit's changes
git blame file.ts          # see who last changed each line (and when)
```

### Writing Good Commit Messages

Good commit messages make the project's history readable and useful. The most widely adopted standard is **Conventional Commits**:

```
type(optional-scope): short description (imperative mood, under 72 chars)

Optional longer description explaining WHY, not what. The 'what' is in the diff.

Optional footer: BREAKING CHANGE, Closes #123
```

**Types:** `feat` (new feature), `fix` (bug fix), `refactor` (code restructure, no behaviour change), `perf` (performance improvement), `test` (adding or fixing tests), `docs` (documentation), `style` (formatting, no logic change), `chore` (build, CI, dependencies), `ci` (CI configuration).

```bash
# Good commit messages
git commit -m 'feat(users): add email verification step to registration'
git commit -m 'fix(auth): refresh token not cleared on sign-out'
git commit -m 'perf(products): add virtual scrolling to product list'
git commit -m 'test(checkout): add E2E test for failed payment recovery'
git commit -m 'refactor(user-store): migrate from BehaviorSubject to signal store'

# Bad commit messages (don't do these)
git commit -m 'fix'             # What was fixed? Why?
git commit -m 'wip'             # Never commit WIP to shared branches
git commit -m 'asdfgh'          # ...
git commit -m 'changed stuff'   # Changed what stuff?
```

### .gitignore — What Git Should Ignore

A `.gitignore` file tells Git which files and directories to never track. Angular CLI generates an appropriate one automatically. The key entries for Angular projects:

```gitignore
# Dependencies — always regenerated by npm install
node_modules/

# Build output — always regenerated by ng build
dist/

# IDE-specific files — each developer has their own preferences
.vscode/settings.json
.idea/
*.swp

# Environment files with secrets — never commit secrets to git
.env
.env.local
.env.production

# OS-generated files
.DS_Store         # macOS
Thumbs.db         # Windows

# Angular-specific
.angular/cache    # Angular build cache
```

---

## Angular Orientation

This section is a high-level overview of Angular's fundamental concepts — enough to understand what the deeper documents are referring to. Each of these topics is covered in full in the Angular Core document.

### What Angular Is and Why It Exists

Angular is a comprehensive, opinionated framework for building web applications. It provides: a component model, a template language, dependency injection, routing, forms handling, HTTP communication, and a build system — all in one coherent package from Google.

**Why Angular instead of building from scratch:** Single-page applications (SPAs) have predictable problems — routing without page reloads, keeping the DOM in sync with data, managing complex form state, authenticating users, talking to APIs. Angular solves these problems in tested, consistent ways. The alternative — assembling libraries yourself — results in inconsistency, library incompatibilities, and architectural decisions that have to be made and enforced manually.

**Angular vs React vs Vue:** React is a UI library — it handles rendering and state; you assemble the rest yourself. Vue sits between Angular and React in prescriptiveness. Angular is a full framework — it has opinions on everything. For enterprise applications with large teams, Angular's structure and conventions are advantages. For small projects or teams that prefer flexibility, React's smaller footprint is an advantage. Your target is Angular, but the React document in this library covers what you need for postings that accept either.

### Creating a New Project

```bash
# Install Angular CLI globally
npm install -g @angular/cli

# Create a new project (Angular 17+ defaults)
ng new my-app --standalone --routing --style=scss --ssr=false

# Start the development server
cd my-app
ng serve
# Open browser: http://localhost:4200
```

The flags: `--standalone` uses the modern component API (no NgModules required), `--routing` configures the Angular router, `--style=scss` uses SCSS for component styles, `--ssr=false` skips server-side rendering for a standard SPA.

### Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # root component
│   │   ├── app.component.html     # root template
│   │   ├── app.component.scss     # root styles
│   │   ├── app.config.ts          # providers: router, HTTP client, etc.
│   │   └── app.routes.ts          # top-level route definitions
│   ├── assets/                    # images, fonts, static files
│   ├── styles.scss                # global styles
│   └── main.ts                    # bootstrap: bootstrapApplication(AppComponent, appConfig)
├── angular.json                   # Angular CLI configuration (build, serve, test)
├── tsconfig.json                  # TypeScript configuration (shared)
├── tsconfig.app.json              # TypeScript config for application code
├── tsconfig.spec.json             # TypeScript config for test files
└── package.json                   # npm dependencies and scripts
```

### Components — The Building Blocks

A component is a combination of a TypeScript class (logic), an HTML template (structure), and optional CSS styles (presentation). Every piece of UI in Angular is a component.

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-card',    // the HTML tag: <app-user-card>
  standalone: true,
  imports: [CommonModule],       // other components and directives this template uses
  template: `
    <div class="card">
      <h2>{{ user().name }}</h2>         <!-- interpolation: display a value -->
      <p>{{ user().email }}</p>
      <button (click)="onEdit()">Edit</button>  <!-- event binding -->
    </div>
  `,
  styles: [`
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }
  `]
})
export class UserCardComponent {
  private userService = inject(UserService);

  // signal() creates reactive state — the template updates automatically
  // when signal values change
  protected user = signal({ name: 'Alice', email: 'alice@example.com' });

  onEdit(): void {
    console.log('Edit clicked');
  }
}
```

Key decorator metadata:
- `selector` — the HTML tag used to embed this component in templates
- `standalone: true` — modern pattern, no NgModule needed
- `imports` — other standalone components and Angular directives used in the template
- `template` — inline HTML template (or `templateUrl` for a separate file)
- `styles` — inline CSS (or `styleUrls` for separate files)

### Data Binding — Connecting Templates to TypeScript

Angular templates have four binding syntaxes:

**Interpolation `{{ expression }}`** — display a value in the template:
```html
<h1>{{ pageTitle }}</h1>
<p>Total: {{ items().length }} items</p>
```

**Property binding `[property]="expression"`** — set a DOM property or component Input:
```html
<input [value]="searchTerm">
<button [disabled]="isLoading">Submit</button>
<img [src]="imageUrl" [alt]="imageAlt">
<app-user-card [user]="selectedUser">
```

**Event binding `(event)="handler($event)"`** — respond to DOM events:
```html
<button (click)="onSave()">Save</button>
<input (input)="onSearch($event)" (keydown.enter)="onSubmit()">
<form (submit)="onFormSubmit($event)">
```

**Two-way binding `[(ngModel)]="property"`** — synchronise a value in both directions:
```html
<input [(ngModel)]="searchQuery" placeholder="Search...">
<!-- This is shorthand for: [value]="searchQuery" (input)="searchQuery = $event.target.value" -->
<!-- In production Angular, use reactive forms instead of ngModel for complex forms -->
```

### Services and Dependency Injection

A service is a class that provides functionality shared across components. API calls, authentication state, business logic, logging — these belong in services. Components should focus on presentation.

Angular's Dependency Injection (DI) system creates and provides service instances. You declare what you need; Angular supplies it. You never call `new UserService()` yourself — Angular does.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })  // singleton — one instance shared application-wide
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// Using the service in a component
@Component({ standalone: true })
export class UserListComponent {
  private userService = inject(UserService);  // Angular provides the instance

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: users => this.users.set(users),
      error: err => this.error.set(err.message)
    });
  }
}
```

### Basic Routing

The Angular router displays different components based on the current URL. Navigation updates the URL and swaps the displayed component — without a full page reload.

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'users', loadComponent: () =>
    import('./features/users/users.component').then(m => m.UsersComponent) },
  { path: 'users/:id', component: UserDetailComponent },
  { path: '**', component: NotFoundComponent },  // wildcard — must be last
];
```

```html
<!-- In your root template -->
<nav>
  <a routerLink="/home" routerLinkActive="active">Home</a>
  <a routerLink="/users" routerLinkActive="active">Users</a>
</nav>
<!-- The active route's component renders here -->
<router-outlet />
```

```typescript
// Navigating programmatically
private router = inject(Router);
this.router.navigate(['/users', userId]);
this.router.navigate(['/users'], { queryParams: { page: 2 } });
```

### NgModule vs Standalone Components

Before Angular 14, every component had to belong to an **NgModule** — a class that grouped related components, directives, and pipes together and declared their dependencies. You will encounter NgModule-based code in older codebases and older tutorials, so recognise it but don't be confused by it.

Modern Angular (17+) uses **standalone components** — each component declares its own `imports`. NgModules are no longer required for new code.

```typescript
// OLD: NgModule approach (valid but no longer recommended for new code)
@NgModule({
  declarations: [AppComponent, UserCardComponent, UserListComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule {}

// NEW: Standalone components — each declares its own dependencies
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule, UserCardComponent],
  template: `...`
})
export class UserListComponent {}
```

### Development Tools

- **VS Code** — the standard editor for Angular. Install the **Angular Language Service** extension — it provides autocomplete, type checking, and navigation inside Angular templates (finding a component's definition from its tag in a template, for example).
- **Angular DevTools** — a Chrome extension that adds an Angular panel to DevTools. Inspect component trees, view component inputs/outputs and injected services at runtime, and profile change detection performance. Essential for debugging why a component is or isn't re-rendering.
- **Chrome DevTools** — Elements tab for DOM inspection. Console for errors and logs. Network tab for HTTP calls. Sources tab for debugging TypeScript via source maps.
- **Postman or Bruno** — GUI tools for testing API endpoints directly, outside Angular. Useful for verifying that an API works before integrating it, or isolating whether a bug is in the frontend or the backend.

> 📝 The single most important Angular debugging step: look at the browser console. Every Angular error prints with a clear message, often a link to documentation, and a component stack trace showing exactly which component threw the error. Read error messages completely — they are almost always informative.

---

## HTTP Fundamentals for Angular Developers

HTTP (HyperText Transfer Protocol) is the communication protocol of the web. When your Angular app needs data, it sends an HTTP request to a server. The server sends back an HTTP response. HTTP is stateless — each request/response is independent. Authentication is achieved by sending a token with every request, not by the server maintaining a session.

The [How the Internet Works](./how-the-internet-works.md) document covers HTTP in depth at the protocol level. This section focuses on the practical patterns Angular developers use daily.

### HTTP Methods

```typescript
// Angular HttpClient maps directly to HTTP methods
this.http.get<User[]>('/api/users')                   // GET — fetch all
this.http.get<User>(`/api/users/${id}`)               // GET — fetch one
this.http.post<User>('/api/users', createDto)         // POST — create
this.http.put<User>(`/api/users/${id}`, replaceDto)   // PUT — replace entirely
this.http.patch<User>(`/api/users/${id}`, { name })   // PATCH — update fields
this.http.delete<void>(`/api/users/${id}`)            // DELETE — remove
```

### REST API Conventions

REST (Representational State Transfer) uses HTTP methods and URLs in a consistent, predictable pattern:

- **Resources are nouns, not verbs** — `/api/users` not `/api/getUsers`
- **Plural nouns for collections** — `/api/users` for all, `/api/users/123` for one
- **Nested resources for relationships** — `/api/users/123/orders` for a user's orders
- **Query parameters for filtering and pagination** — `/api/users?role=admin&page=2&limit=20`
- **The HTTP method communicates the action** — GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes

```
GET    /api/users                 → list users (with filters/pagination)
POST   /api/users                 → create a user
GET    /api/users/:id             → get one user
PUT    /api/users/:id             → replace one user (full body required)
PATCH  /api/users/:id             → update specific fields
DELETE /api/users/:id             → delete one user
GET    /api/users/:id/orders      → get orders belonging to a user
```

### JSON — The Data Format of the Web

JSON (JavaScript Object Notation) is the standard data format for REST APIs. Angular's `HttpClient` automatically serialises outgoing objects to JSON and deserialises incoming JSON into JavaScript objects — you never call `JSON.parse()` or `JSON.stringify()` directly.

```json
{
  "id": "user-123",
  "name": "Alice Smith",
  "age": 30,
  "active": true,
  "address": null,
  "roles": ["admin", "editor"],
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

JSON rules: keys must be double-quoted strings; values can be string, number, boolean, null, array, or object; no functions, no `undefined`, no trailing commas; dates are always strings (ISO 8601 format).

### HTTP Headers

Headers are key-value metadata attached to requests and responses.

**Common request headers:**
- `Authorization: Bearer eyJhbGci...` — your auth token, added by Angular's auth interceptor
- `Content-Type: application/json` — tells the server the body format (Angular sets this automatically)
- `Accept: application/json` — tells the server what format you want back
- `X-Request-ID: uuid` — unique ID per request, useful for correlating logs

**Common response headers:**
- `Content-Type: application/json` — format of the response body
- `Cache-Control: max-age=3600` — browser caching directive
- `Location: /api/users/123` — URL of a newly created resource (returned with 201)
- `Retry-After: 30` — seconds to wait before retrying (returned with 429 or 503)
- `Access-Control-Allow-Origin: *` — CORS header allowing cross-origin access

### The Browser DevTools Network Tab

The Network tab in Chrome/Firefox/Edge DevTools is your primary tool for debugging HTTP calls. Open with F12 or Cmd+Option+I.

- **Filter to XHR/Fetch** — uncheck all other resource types to see only API calls
- **Inspect a request** — click any row, then: Headers tab (request and response metadata), Payload tab (request body), Response tab (response body), Timing tab (phases: DNS, connection, TTFB, download)
- **Status column** — red rows are 4xx/5xx errors. Check the Response tab for the server's error message — it's almost always more useful than the Angular error
- **Timing/Waterfall** — long TTFB (Time to First Byte) suggests server slowness; long download suggests large response payload
- **Preserve log** — enables history to survive page navigation — essential for debugging login redirects
- **Copy as cURL** — right-click any request to get a `curl` command you can run in a terminal to replay that exact request outside the browser

> 💡 When an API call fails unexpectedly: open DevTools → Network tab → find the failing request → check the Response tab. The server's error message is almost always there, and almost always more informative than what Angular surfaced.

---

*Next: [JavaScript](./javascript.md)*
