# Angular Sandbox

A personal learning environment for mastering JavaScript, TypeScript, and Angular 21.
Used for structured practice, interview preparation, and building real working code
alongside study documentation.

---

## Running Practice Files

> Full details in `docs/practice-hints/HOW-TO-RUN.md`

### JavaScript and TypeScript — run in terminal with ts-node

```bash
ts-node src/app/practice/js/js-01-closure-counter.ts
ts-node src/app/practice/js/js-02-promise-vs-async.ts
ts-node src/app/practice/js/js-03-array-manipulation.ts

ts-node src/app/practice/ts/ts-01-generic-utility.ts
ts-node src/app/practice/ts/ts-02-utility-types.ts
ts-node src/app/practice/ts/ts-03-discriminated-unions.ts
```

### Angular — run in the browser

```bash
ng serve
# open http://localhost:4200
```

---

## Project Goals

- Build fluency in modern Angular 21 patterns
- Practice JavaScript and TypeScript fundamentals
- Work through structured coding problems in a real dev environment
- Maintain study documentation alongside runnable code

---

## Tech Stack

| Tool | Version |
|---|---|
| Angular CLI | 21.x |
| Angular | 21.x |
| TypeScript | 5.x |
| Node.js | 22.x |
| ts-node | 10.x |

---

## Project Structure

```
angular-sandbox/
  .claude/
    CLAUDE.md                         # Angular 21 best practices for Claude Code
  .vscode/
    mcp.json                          # Angular CLI MCP server for Claude Code
  docs/
    study-library/                    # Angular, TypeScript, JS study docs
    interview-prep/
      BNSF_Mock_Recruiter_Call.md
      BNSF_Interview_Practice_Problems.md
    practice-hints/
      HOW-TO-RUN.md                   # How to run every type of practice file
      js-hints-and-solutions.md       # Hints and solutions for JS problems
      ts-hints-and-solutions.md       # Hints and solutions for TS problems
      ng-hints-and-solutions.md       # Hints and solutions for Angular problems
  src/
    app/
      practice/
        js/                           # JavaScript practice files
          js-01-closure-counter.ts
          js-02-promise-vs-async.ts
          js-03-array-manipulation.ts
        ts/                           # TypeScript practice files
          ts-01-generic-utility.ts
          ts-02-utility-types.ts
          ts-03-discriminated-unions.ts
        ng/                           # Angular practice components
          debounced-search/
          reactive-form/
          onpush-demo/
          rxjs-operators/
          data-table/
```

---

## Practice Problems

Work through problems in order. Each section builds on the previous.

### Section 1 — JavaScript

| File | Concept |
|---|---|
| `js-01-closure-counter.ts` | Closures and private state |
| `js-02-promise-vs-async.ts` | Promise chaining vs async/await |
| `js-03-array-manipulation.ts` | filter, map, sort without mutation |

### Section 2 — TypeScript

| File | Concept |
|---|---|
| `ts-01-generic-utility.ts` | Generics and keyof constraints |
| `ts-02-utility-types.ts` | Partial, Pick, Omit, Record, Readonly |
| `ts-03-discriminated-unions.ts` | Union types and exhaustiveness checking |

### Section 3 — Angular

| Folder | Concept |
|---|---|
| `ng/debounced-search/` | RxJS, switchMap, async pipe |
| `ng/reactive-form/` | Reactive forms, custom validators |
| `ng/onpush-demo/` | Change detection, signals, immutability |
| `ng/rxjs-operators/` | switchMap, mergeMap, combineLatest, error handling |
| `ng/data-table/` | Reusable components, sorting, filtering, pagination |

Full problem descriptions: `docs/interview-prep/BNSF_Interview_Practice_Problems.md`
Hints and solutions: `docs/practice-hints/`

---

## AI Configuration

This project is configured for **Claude Code** via `.claude/CLAUDE.md`.
Claude Code automatically follows Angular 21 best practices including:

- Standalone components (no NgModules)
- Signals for state management
- `input()` and `output()` functions over decorators
- Native control flow (`@if`, `@for`, `@switch`)
- `inject()` over constructor injection
- `OnPush` change detection on all components

---

## Key Angular 21 Patterns Quick Reference

### Signals
```typescript
count = signal(0);
derived = computed(() => this.count() * 2);
this.count.set(1);
this.count.update(n => n + 1);
```

### Input / Output
```typescript
title = input<string>();
clicked = output();
```

### Inject
```typescript
private service = inject(MyService);
```

### Native Control Flow
```html
@if (isVisible) { <div>content</div> }
@for (item of items; track item.id) { <div>{{ item.name }}</div> }
```

### OnPush Component
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

---

## RxJS Operator Cheat Sheet

| Operator | Use When |
|---|---|
| `switchMap` | Latest value wins — search boxes, navigation |
| `mergeMap` | All values matter — parallel requests |
| `concatMap` | Order matters — sequential writes |
| `exhaustMap` | Ignore until current completes — submit buttons |
| `debounceTime` | Wait for user to stop typing — search, resize |
| `distinctUntilChanged` | Skip duplicate values |
| `combineLatest` | Need latest from multiple streams simultaneously |
| `forkJoin` | Wait for all to complete once — parallel HTTP calls |
| `catchError` | Recover from errors — return fallback observable |
| `takeUntilDestroyed` | Auto-unsubscribe when component destroys |
| `shareReplay(1)` | Share one subscription, replay last value |

---

## VS Code Tips

| Action | Shortcut |
|---|---|
| Open terminal | Ctrl+` |
| Open file quickly | Ctrl+P |
| Markdown preview | Ctrl+Shift+V |
| Format document | Shift+Alt+F |
| Go to definition | F12 |

---

## Resources

- [Angular Docs](https://angular.dev)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular AI Development Guide](https://angular.dev/ai/develop-with-ai)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
