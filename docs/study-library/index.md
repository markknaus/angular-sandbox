# Senior Angular Developer — Study Library

> A comprehensive interview preparation and skills refresher for a Senior Angular Developer with full-stack capabilities.
> 20 documents · Reading order below · All content current as of 2026.

---

This library is structured as a deliberate reading path. Each document builds on the ones before it. The foundational documents (1–4) cover the web platform and programming fundamentals that everything else depends on. The Angular-specific documents (5–11) cover modern Angular from HTML through architecture. The cross-cutting documents (12–13) cover practices and algorithms. Documents 14–20 are reference documents to read as needed.

The three longest documents (Java, SQL, React) are split into two parts each to keep Notion pages a manageable size. The unsplit originals are also in the repository for GitHub and VS Code use.

---

## Reading Order

### Foundations

**1. [How the Internet Works](./how-the-internet-works.md)**
DNS, TCP/IP, HTTP/HTTPS, TLS, browser rendering pipeline, CDNs, cloud platforms (AWS/Azure/GCP), API gateways, and application scalability. The infrastructure context every developer needs.

**2. [Programming Foundations](./programming-foundations.md)**
Language-agnostic programming concepts: variables, control flow, functions, objects, sync vs async, error handling, what an API is. Terminal commands, Node.js, npm, Git workflows, and a practical Angular orientation. The "if you haven't coded in a while, start here" document.

**3. [JavaScript](./javascript.md)**
The JavaScript runtime, event loop, closures, scope, prototypal inheritance, array methods, destructuring, spread/rest, Promises, async/await, ES2020–2024 features, ES modules, memory management, generators, and the Promises vs Observables comparison. Deep internals, not just syntax.

**4. [TypeScript](./typescript.md)**
TypeScript's type system as a design tool, tsconfig with every strict flag explained, branded types, discriminated unions, generics from basics to Angular repository patterns, all utility types, mapped types, template literal types, conditional types, type narrowing, and decorators. Advanced patterns, not just basics.

---

### HTML, CSS, and Accessibility

**5. [HTML, CSS & Responsive Design](./html-css-responsive-design.md)**
Semantic HTML, Flexbox complete mastery, CSS Grid complete mastery, CSS custom properties for theming, responsive design and container queries, CSS animations, UI/UX design principles, and Figma for developers.

**6. [Accessibility](./accessibility.md)**
WCAG 2.1 — all four POUR principles with key success criteria, the legal and business case, the complete ARIA attribute reference, Angular CDK accessibility utilities (FocusTrap, LiveAnnouncer, FocusMonitor, key managers), and accessibility testing strategy with axe-core.

---

### Angular

**7. [Angular Core](./angular-core.md)**
Standalone components, Signals (technical internals and every API), signal inputs/outputs/model/viewChild, change detection (complete technical model), lifecycle hooks with edge cases, control flow (`@if`, `@for`, `@switch`, `@defer`), attribute and structural directives, pipes, dependency injection (injector hierarchy, `inject()`, `InjectionToken`, all provider types), routing (every configuration option, guards, resolvers, preloading strategies), reactive forms (typed forms, validators, ControlValueAccessor, dynamic FormArrays), and a production Signal Store pattern.

**8. [RxJS & State Management](./rxjs-and-state-management.md)**
The Observable contract, every creation operator, cold vs hot (complete mental model), multicasting, all four Subject types, all subscription management patterns, the four flattening operators (switchMap/mergeMap/concatMap/exhaustMap — when to use each), combination operators, filtering and transformation operators, error handling production patterns, schedulers, marble testing, Zone.js internals, Angular compilation, HttpClient complete API, Core Web Vitals, Signal Store, NgRx classic pattern, NgRx Signals Store, and the state management decision framework.

**9. [Testing](./testing.md)**
Jest vs Karma/Jasmine, Jest setup for Angular, testing services with HttpTestingController, component testing with TestBed (including `fakeAsync`/`tick`), testing signals and signal stores, testing forms and validators, accessibility testing with jest-axe, Angular Testing Library, Playwright E2E (production configuration, Page Objects, API mocking), and real-world RxJS testing patterns.

**10. [Angular Architecture & Tooling](./angular-architecture-and-tooling.md)**
SOLID principles in Angular, feature-first folder structure with module boundary enforcement, smart/dumb component pattern, performance optimisation (`@defer`, virtual scrolling, NgOptimizedImage, bundle analysis), the complete HTTP interceptor stack (auth/retry/error/loading), idempotency, webhooks, npm advanced usage, Angular CLI and esbuild/Vite, ESLint/Prettier/Husky/Commitlint setup, the 10 most important senior interview questions with full answers, take-home project senior differentiators, and a system design walkthrough (multi-tenant B2B SaaS dashboard).

---

### Engineering and Professional Skills

**11. [Engineering Practices](./engineering-practices.md)**
SDLC, Agile manifesto, Scrum (roles, ceremonies, Definition of Ready/Done, estimation), Kanban, code review (giving and receiving feedback), technical decision-making (RFCs and ADRs), mentoring, working with product and design, async communication norms, documentation practices, behavioural interview STAR framework with eight worked answers, SLAs/SLOs/SLIs, observability (logging, monitoring, alerting), deployment strategies (blue/green, canary, rolling, feature flags), incident response, Infrastructure as Code (Terraform), A/B testing and feature flags.

**12. [Data Structures & Algorithms](./data-structures-and-algorithms.md)**
Big O notation, arrays, hash maps, sets, stacks, queues, linked lists, trees, graphs, 10 algorithm patterns (sliding window, two pointers, binary search, BFS/DFS, dynamic programming, and more), 20 worked problems. The interview coding foundation.

---

### AI

**13. [AI for Developers](./ai-for-developers.md)**
What AI and LLMs actually are, the AI landscape (models, products, vendors), AI in the SDLC, GitHub Copilot, Cursor/Windsurf, Claude Code/Projects, prompt engineering for developers, AI specifically for Angular (component generation, migrations, test generation, where it gets Angular wrong), vibe coding (what it is, where it works, where it is dangerous, maintaining code ownership), AI in your job search, security and ethics, staying current.

---

### Reference Documents

Read these as needed when roles specifically mention their content.

**14. [GraphQL for Angular Developers](./graphql-for-angular-developers.md)**
GraphQL fundamentals, queries, mutations, subscriptions, the Apollo Angular client, type generation, Angular-specific integration patterns, and when to use GraphQL vs REST.

---

**15–16. SQL Guide** *(split into two Notion pages; single file also available as `sql-guide.md`)*

**15. [SQL Guide — Part 1: Foundations & Joins](./sql-guide-part-1.md)**
Relational database fundamentals, data types, SELECT and filtering, WHERE clauses, ORDER BY, CASE expressions, and all join types (INNER, LEFT, RIGHT, FULL OUTER, self joins).

**16. [SQL Guide — Part 2: Advanced SQL & Interview Prep](./sql-guide-part-2.md)**
Aggregation, GROUP BY, HAVING, window functions (ROW_NUMBER, RANK, LAG/LEAD, running totals), subqueries, CTEs, modifying data, schema design and DDL, normalisation (1NF–3NF, BCNF), indexes and performance, transactions and concurrency, PostgreSQL specifics, and interview preparation.

---

**17–18. Java Overview** *(split into two Notion pages; single file also available as `java-overview.md`)*

**17. [Java Overview — Part 1: Language Fundamentals](./java-overview-part-1.md)**
JVM and platform, Java 8 features (lambdas, streams, Optional, Date/Time API), Java 9–21 updates (records, sealed classes, pattern matching, virtual threads), the Java type system, object-oriented Java, Collections Framework, Streams API, and exception handling.

**18. [Java Overview — Part 2: Spring Boot & Interview Prep](./java-overview-part-2.md)**
Spring Boot (auto-configuration, starters, component scanning), the three-layer architecture (Controller/Service/Repository), JPA and Hibernate, build tools (Maven, Gradle), interview talking points, and JAX-WS/SOAP web services for legacy enterprise integrations.

---

**19–20. React for Angular Developers** *(split into two Notion pages; single file also available as `react-for-angular-developers.md`)*

**19. [React for Angular Developers — Part 1: Core Concepts](./react-for-angular-developers-part-1.md)**
React's mental model vs Angular's framework approach, JSX, function components, props, conditional rendering, list rendering, composition, and all core hooks (useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer, custom hooks).

**20. [React for Angular Developers — Part 2: State, Routing & Ecosystem](./react-for-angular-developers-part-2.md)**
State management (Zustand, Redux Toolkit), React Router v6, data fetching with TanStack Query, forms with React Hook Form + Zod, the broader ecosystem (Next.js, Vite, CSS Modules, Tailwind, testing with React Testing Library and Vitest), and interview preparation.

---

## Quick Reference by Interview Topic

| Topic | Primary Document | Also See |
|---|---|---|
| Angular change detection | Angular Core | RxJS (Zone.js section) |
| Signals | Angular Core | RxJS & State Management |
| RxJS operators | RxJS & State Management | Testing (marble testing) |
| State management | RxJS & State Management | Angular Architecture |
| Performance (Core Web Vitals) | RxJS & State Management | Angular Architecture |
| Testing | Testing | — |
| Accessibility | Accessibility | Testing (jest-axe, Playwright) |
| TypeScript | TypeScript | Angular Core (decorators) |
| System design | Angular Architecture & Tooling | Engineering Practices |
| Behavioural interview | Engineering Practices | — |
| HTTP / APIs | How the Internet Works | Angular Architecture (interceptors) |
| Deployment | Engineering Practices | How the Internet Works (cloud) |
| Security | Angular Architecture | How the Internet Works (HTTPS/TLS) |
| AI tools | AI for Developers | — |
| SQL | SQL Guide Part 1 + Part 2 | Java Overview Part 2 (JPA) |
| Java / Spring Boot | Java Overview Part 1 + Part 2 | — |
| React | React Part 1 + Part 2 | — |
| GraphQL | GraphQL for Angular Developers | — |

---

## How to Use This Library

**If you are actively interviewing:** read documents 7–10 first (Angular Core through Architecture). These cover the deepest technical questions. Then read documents 3–4 (JavaScript/TypeScript internals) — interviewers probe these to assess depth. Then read document 11 (Engineering Practices) for behavioural prep. Use the Quick Reference table to jump to specific topics before specific interviews.

**If you are refreshing after a gap:** read in order, starting with document 1. The foundations (1–6) cover material that has changed significantly since the late 1990s–2000s. Do not skip them.

**If you are studying a specific job description:** identify which topics the JD emphasises. Use the Quick Reference table to find the relevant documents. Prioritise those, then fill in surrounding context.

**For Notion:** use the split part-1/part-2 files for the three large documents. After importing any file, delete the manual TOC list at the top and replace it with Notion's `/table-of-contents` block for a live, clickable version.

**For GitHub / VS Code:** use the original unsplit files (`java-overview.md`, `sql-guide.md`, `react-for-angular-developers.md`) alongside all other documents.

---

*Study library maintained for personal interview preparation. Content reflects Angular 17–18, TypeScript 5.x, and current industry practice as of early 2026.*
