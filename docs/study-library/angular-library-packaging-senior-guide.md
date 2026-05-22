# Angular Library Packaging & Reusable Architecture
### Senior Frontend Developer Interview Study Guide

---

## Table of Contents

1. [Overview & Core Concepts](#1-overview--core-concepts)
2. [Angular Package Format (APF)](#2-angular-package-format-apf)
3. [Setting Up a Library Workspace](#3-setting-up-a-library-workspace)
4. [Project Structure Deep Dive](#4-project-structure-deep-dive)
5. [Public API & Barrel Exports](#5-public-api--barrel-exports)
6. [Building the Library](#6-building-the-library)
7. [Consuming the Library](#7-consuming-the-library)
8. [Advanced Patterns](#8-advanced-patterns)
9. [Versioning & Publishing](#9-versioning--publishing)
10. [Monorepo Strategy with Nx](#10-monorepo-strategy-with-nx)
11. [Testing Libraries](#11-testing-libraries)
12. [Performance Considerations](#12-performance-considerations)
13. [Common Interview Questions & Answers](#13-common-interview-questions--answers)

---

## 1. Overview & Core Concepts

### What is an Angular Library?

An Angular library is a reusable, independently buildable unit of code that follows the **Angular Package Format (APF)**. It can contain components, services, pipes, directives, interceptors, guards, and standalone utilities — anything you want to share across multiple Angular applications without copy-pasting.

Libraries are fundamentally different from applications:

| Aspect              | Angular Application          | Angular Library                     |
|---------------------|------------------------------|--------------------------------------|
| Entry point         | `main.ts` bootstraps the app | `public-api.ts` defines public API   |
| Build output        | Bundles (JS/CSS/HTML)        | Compiled package following APF       |
| `package.json`      | May have scripts, devDeps    | Must declare `peerDependencies`      |
| Can run standalone? | Yes                          | No — consumed by an app              |
| Angular-aware?      | Yes (has `AppModule`)        | Yes (exports NgModules or standalone)|

### Why Not Just Copy/Paste Components?

- **Maintainability**: A bug fix in one place propagates everywhere via a version bump.
- **Encapsulation**: Consumers interact only with your public API; internals are hidden.
- **Versioning**: Libraries have semantic versions. Apps pin to a known-good version.
- **Tree-shaking**: Properly packaged libraries allow bundlers to eliminate unused code.
- **Separation of concerns**: Library code stays decoupled from business logic.

---

## 2. Angular Package Format (APF)

The Angular Package Format is Anthropic's (Google's) specification for how Angular libraries must be packaged so that the Angular CLI, bundlers, and IDEs can all consume them correctly.

### Why APF Matters

APF defines the structure that enables:
- **Differential loading** (ES2015+ for modern browsers, ES5 for legacy)
- **Ivy compatibility** (partial compilation for forward compatibility)
- **Tree-shaking** via side-effect-free ESM bundles
- **Type checking** via bundled `.d.ts` files

### Key APF Output Files

After running `ng build my-lib`, the `dist/my-lib` folder contains:

```
dist/my-lib/
├── esm2022/                  ← ES Modules, modern syntax (primary)
│   └── my-lib.mjs
├── fesm2022/                 ← Flattened ESM (single file, better tree-shaking)
│   └── my-lib.mjs
├── my-lib.d.ts               ← TypeScript type declarations
├── my-lib.mjs                ← Main ESM entry (re-exports fesm2022)
├── package.json              ← Declares "exports", "module", "types" etc.
├── README.md
└── index.d.ts
```

### The `package.json` `exports` Field

Modern APF uses the `exports` map for conditional exports:

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "esm2022": "./esm2022/my-lib.mjs",
      "default": "./fesm2022/my-lib.mjs"
    },
    "./testing": {
      "types": "./testing/index.d.ts",
      "default": "./fesm2022/testing.mjs"
    }
  },
  "peerDependencies": {
    "@angular/common": "^17.0.0",
    "@angular/core": "^17.0.0"
  }
}
```

> **Interview tip**: Know the difference between `dependencies`, `devDependencies`, and `peerDependencies`. Angular itself must always be a `peerDependency` in your library — listing it as a regular dependency causes version duplication and runtime errors.

---

## 3. Setting Up a Library Workspace

### Step 1: Create a New Workspace (No Default App)

```bash
ng new my-org-workspace --no-create-application
cd my-org-workspace
```

Using `--no-create-application` creates a bare workspace. This is intentional for library-focused repos. You add libraries and (optionally) demo apps separately.

### Step 2: Generate the Library

```bash
ng generate library @my-org/ui-kit
```

The `@my-org/` scope prefix follows npm scoped package conventions, which is standard practice in enterprise environments. It prevents naming collisions with public packages.

### Step 3: (Optional) Generate a Demo Application

```bash
ng generate application my-org-demo
```

A demo or "showcase" app in the same workspace is the fastest way to develop and test your library locally without publishing.

### Step 4: Link the Library to the Demo App

Angular CLI automatically configures the `tsconfig.json` path mapping so the demo app can import from `@my-org/ui-kit` directly:

```json
// tsconfig.json (workspace root)
{
  "compilerOptions": {
    "paths": {
      "@my-org/ui-kit": ["dist/@my-org/ui-kit"],
      "@my-org/ui-kit/*": ["dist/@my-org/ui-kit/*"]
    }
  }
}
```

> **Note**: Paths point to `dist/`, not `projects/`. You must build the library before the app can consume it. Use `ng build @my-org/ui-kit --watch` in a separate terminal during development.

---

## 4. Project Structure Deep Dive

```
my-org-workspace/
├── angular.json                    ← Workspace config; defines all projects
├── package.json                    ← Root dependencies
├── tsconfig.json                   ← Workspace-level TypeScript config
│
├── projects/
│   ├── @my-org/
│   │   └── ui-kit/                 ← Library root
│   │       ├── ng-package.json     ← ng-packagr configuration
│   │       ├── package.json        ← Library-specific package.json
│   │       ├── tsconfig.lib.json   ← Compiler options for lib build
│   │       ├── tsconfig.lib.prod.json
│   │       ├── tsconfig.spec.json  ← Compiler options for tests
│   │       └── src/
│   │           ├── public-api.ts   ← THE public surface area of your library
│   │           └── lib/
│   │               ├── button/
│   │               │   ├── button.component.ts
│   │               │   ├── button.component.html
│   │               │   ├── button.component.scss
│   │               │   └── button.component.spec.ts
│   │               ├── modal/
│   │               ├── form-controls/
│   │               ├── services/
│   │               │   └── theme.service.ts
│   │               └── ui-kit.module.ts  ← Root NgModule (or standalone)
│   │
│   └── my-org-demo/                ← Demo / showcase app
│       └── src/
│
└── dist/                           ← Build outputs (gitignored)
    └── @my-org/
        └── ui-kit/
```

### `ng-package.json` — The Build Configuration

This file tells `ng-packagr` how to build your library:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": [
    "CHANGELOG.md",
    "src/styles/**/*.scss"
  ],
  "deleteDestPath": false
}
```

Key fields:
- `entryFile`: The root of your public API. Everything exported here is consumable.
- `assets`: Files to copy verbatim into the dist folder (CSS themes, markdown, etc.).
- `deleteDestPath`: Whether to wipe `dist/` before each build. Useful to set `false` in watch mode when building multiple entry points.

---

## 5. Public API & Barrel Exports

The `public-api.ts` file is the gatekeeper of your library. **Only what is exported here is part of your public contract.**

```typescript
// projects/@my-org/ui-kit/src/public-api.ts

// Components
export * from './lib/button/button.component';
export * from './lib/modal/modal.component';
export * from './lib/tooltip/tooltip.directive';

// Services
export * from './lib/services/theme.service';
export * from './lib/services/notification.service';

// Pipes
export * from './lib/pipes/format-date.pipe';
export * from './lib/pipes/truncate.pipe';

// Models / Interfaces / Types
export * from './lib/models/button-variant.type';
export * from './lib/models/theme.interface';

// NgModule (if using module-based architecture)
export * from './lib/ui-kit.module';

// Tokens
export * from './lib/tokens/theme.token';
```

### What NOT to Export

Deliberately hiding internals reduces your maintenance burden. Do not export:
- Internal helper functions used only by other library code
- Implementation details of components (internal child components, internal interfaces)
- Any item that you might want to refactor or rename freely

> **Interview question**: "Why would you export an interface but not a class from a library?"
> **Answer**: Exporting an interface defines a contract consumers can depend on (e.g., for typing data they pass in). Exporting a class creates a tighter coupling because it exposes the class shape, constructor, and any public methods. If you want consumers to use instances only via a factory or service, hide the class.

---

## 6. Building the Library

### Development Build (Watch Mode)

```bash
ng build @my-org/ui-kit --watch
```

Rebuilds on file changes. Essential for local development when the demo app imports from `dist/`.

### Production Build

```bash
ng build @my-org/ui-kit --configuration production
```

Production builds enable:
- `--optimization`: Minification of declarations
- Ivy partial compilation (produces `*.mjs` with `ɵɵ` prefixed calls)
- Stricter dead-code elimination

### What `ng-packagr` Does Under the Hood

`ng-packagr` is the tool invoked by `ng build` for libraries. Its pipeline:

1. **TypeScript compilation** via `ngc` (Angular's compiler) — produces `.js` and `.d.ts`
2. **Template compilation** — compiles component HTML templates to TypeScript instructions
3. **Stylesheet processing** — inlines component SCSS/CSS
4. **Module flattening** — combines all ESM files into one `.mjs` per entry point (FESM)
5. **`package.json` generation** — produces the distribution `package.json` with correct fields
6. **Asset copying** — moves assets declared in `ng-package.json`

### Ivy and Partial Compilation

Since Angular 13, libraries are built with **partial compilation** (`compilationMode: 'partial'`). This produces `ɵɵdefineComponent` calls that are forward-compatible — the consuming application's build pipeline finalizes the compilation. This solves the historical "Ivy library compatibility" problem where a library compiled for Angular 13 might fail in Angular 14.

```typescript
// tsconfig.lib.prod.json
{
  "angularCompilerOptions": {
    "compilationMode": "partial"   // ← Ivy partial compilation for publishing
  }
}
```

---

## 7. Consuming the Library

### Option A — Local Development (Same Workspace)

After building, the `tsconfig.json` path mappings allow direct imports:

```typescript
// In the demo app
import { ButtonComponent } from '@my-org/ui-kit';
import { ThemeService } from '@my-org/ui-kit';
```

No `npm install` needed — the path mapping resolves straight to `dist/`.

### Option B — npm / Private Registry

```bash
# Publish
cd dist/@my-org/ui-kit
npm publish --access public    # for scoped public packages
# or
npm publish --registry https://your.private.registry.com

# Consume in another project
npm install @my-org/ui-kit
```

In the consumer app's `app.module.ts` (NgModule approach):

```typescript
import { NgModule } from '@angular/core';
import { UiKitModule } from '@my-org/ui-kit';

@NgModule({
  imports: [UiKitModule],
})
export class AppModule {}
```

Or with standalone components:

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from '@my-org/ui-kit';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonComponent],
  template: `<ui-button variant="primary">Click me</ui-button>`
})
export class AppComponent {}
```

### Option C — Verdaccio (Private Local Registry)

Verdaccio is a lightweight npm proxy/registry you can run locally or on-premises:

```bash
npm install -g verdaccio
verdaccio                             # starts at http://localhost:4873

# Configure the project to use it
npm set registry http://localhost:4873

# Publish your library
npm publish dist/@my-org/ui-kit
```

This is common in enterprise environments without access to public npm.

---

## 8. Advanced Patterns

### 8.1 Secondary Entry Points

Secondary entry points let consumers import subsets of your library, enabling better tree-shaking:

```
src/
├── public-api.ts              ← Primary: @my-org/ui-kit
└── testing/
    ├── index.ts               ← Secondary: @my-org/ui-kit/testing
    └── mock-theme.service.ts
```

```json
// projects/@my-org/ui-kit/testing/ng-package.json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "index.ts"
  }
}
```

Consumer usage:

```typescript
// Production code
import { ButtonComponent } from '@my-org/ui-kit';

// Test utilities — only imported in tests, tree-shaken from prod bundle
import { MockThemeService } from '@my-org/ui-kit/testing';
```

> **Interview insight**: Secondary entry points are how `@angular/material` is structured (`@angular/material/button`, `@angular/material/table`, etc.). This means importing only button doesn't pull in table's code.

### 8.2 The `forRoot()` / `forChild()` Pattern

Use this when your library needs a singleton service with configuration provided by the consuming app — and you want to prevent multiple instances being created in lazy-loaded modules.

```typescript
// In the library
export interface UiKitConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
}

export const UI_KIT_CONFIG = new InjectionToken<UiKitConfig>('ui-kit-config');

@NgModule({
  declarations: [ButtonComponent, ModalComponent],
  exports: [ButtonComponent, ModalComponent],
})
export class UiKitModule {
  static forRoot(config: UiKitConfig): ModuleWithProviders<UiKitModule> {
    return {
      ngModule: UiKitModule,
      providers: [
        { provide: UI_KIT_CONFIG, useValue: config },
        ThemeService,  // Singleton — only registered once
      ],
    };
  }

  static forChild(): ModuleWithProviders<UiKitModule> {
    return {
      ngModule: UiKitModule,
      providers: [],  // No providers — uses root's singleton
    };
  }
}
```

```typescript
// In the consuming app's root module
@NgModule({
  imports: [
    UiKitModule.forRoot({ theme: 'dark', primaryColor: '#3498db' }),
  ],
})
export class AppModule {}

// In lazy-loaded feature modules
@NgModule({
  imports: [UiKitModule.forChild()],
})
export class FeatureModule {}
```

### 8.3 InjectionToken-Based Configuration (Modern / Standalone)

The modern equivalent of `forRoot()` in standalone Angular uses `InjectionToken` with `providedIn`:

```typescript
// library
export const UI_KIT_CONFIG = new InjectionToken<UiKitConfig>('ui-kit-config');

export function provideUiKit(config: UiKitConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: UI_KIT_CONFIG, useValue: config },
    ThemeService,
  ]);
}
```

```typescript
// consuming app's main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideUiKit({ theme: 'dark', primaryColor: '#3498db' }),
  ]
});
```

This is the **preferred modern pattern** and aligns with how `@angular/router`'s `provideRouter()` works.

### 8.4 Theming with CSS Custom Properties

Libraries that need to be themeable should use CSS custom properties (variables) as their theming API:

```scss
// In the library component
:host {
  display: inline-block;

  .btn {
    background-color: var(--ui-kit-primary-color, #007bff);
    border-radius: var(--ui-kit-border-radius, 4px);
    font-family: var(--ui-kit-font-family, sans-serif);
  }
}
```

```css
/* In the consuming app's global styles */
:root {
  --ui-kit-primary-color: #e91e63;
  --ui-kit-border-radius: 8px;
}
```

This approach requires zero configuration from the library's `NgModule` and works seamlessly across Shadow DOM boundaries.

### 8.5 Peer Dependency Management

Libraries must not bundle Angular itself or other framework dependencies. Declare them as `peerDependencies`:

```json
// projects/@my-org/ui-kit/package.json
{
  "name": "@my-org/ui-kit",
  "version": "2.0.0",
  "peerDependencies": {
    "@angular/core": "^17.0.0 || ^18.0.0",
    "@angular/common": "^17.0.0 || ^18.0.0",
    "@angular/cdk": "^17.0.0 || ^18.0.0"
  },
  "peerDependenciesMeta": {
    "@angular/cdk": {
      "optional": true      ← Only required if consuming CDK-dependent features
    }
  }
}
```

> **Common mistake**: Listing `@angular/core` as a `dependency` (not `peer`). This causes Angular to be bundled twice — once from the library and once from the app — resulting in the dreaded "There are multiple instances of Angular" runtime error.

---

## 9. Versioning & Publishing

### Semantic Versioning (SemVer)

All published libraries follow `MAJOR.MINOR.PATCH`:

| Bump | When | Example |
|------|------|---------|
| PATCH | Bug fixes, internal refactors with no API change | `1.2.3 → 1.2.4` |
| MINOR | New features that are backward-compatible | `1.2.3 → 1.3.0` |
| MAJOR | Breaking changes to public API | `1.2.3 → 2.0.0` |

### What Constitutes a Breaking Change in an Angular Library?

- Removing or renaming an exported class, interface, function, or token
- Changing a component's `@Input()` type to a narrower type
- Changing a component's `@Output()` EventEmitter generic type
- Adding a **required** `@Input()` to an existing component
- Changing the selector of a component or directive
- Removing a method from a service's public API
- Changing the `InjectionToken` name or value

### Automated Versioning with `np` or `release-it`

```bash
npm install -D release-it

# .release-it.json
{
  "git": { "commitMessage": "chore: release v${version}" },
  "npm": { "publish": false },
  "hooks": {
    "before:init": "ng build @my-org/ui-kit --configuration production",
    "after:bump": "cd dist/@my-org/ui-kit && npm publish"
  }
}

release-it
```

### Maintaining a Changelog

Keep a `CHANGELOG.md` in your library's source folder and copy it as an asset via `ng-package.json`. Many teams automate this with `conventional-changelog` or `standard-version`.

---

## 10. Monorepo Strategy with Nx

For large organizations managing many libraries and apps, **Nx** (by Nrwl) is the de facto standard. Nx builds on top of Angular CLI's workspace support with:

- **Dependency graph visualization**: `nx graph` shows what depends on what
- **Affected builds**: `nx affected:build` only rebuilds libraries changed by recent commits
- **Code generators**: Enforce consistent patterns for new libraries, components, services
- **Caching**: Local and remote build caching dramatically reduces CI times
- **Enforced boundaries**: `@nrwl/nx-enforce-module-boundaries` lint rule prevents accidental circular deps

### Nx Library Types Convention

Nx recommends tagging libraries by type to enforce architectural boundaries:

```
libs/
├── feature/           ← Smart components with state, side effects (app-specific)
├── ui/                ← Dumb/presentational components (shared across apps)
├── data-access/       ← Services, state management, API calls
├── util/              ← Pure functions, helpers, constants
└── domain/            ← Models, interfaces, business logic
```

```json
// .eslintrc.json — Enforced import boundaries
{
  "rules": {
    "@nrwl/nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:ui", "type:data-access", "type:util", "type:domain"] },
        { "sourceTag": "type:ui", "onlyDependOnLibsWithTags": ["type:ui", "type:util", "type:domain"] },
        { "sourceTag": "type:data-access", "onlyDependOnLibsWithTags": ["type:util", "type:domain"] },
        { "sourceTag": "type:util", "onlyDependOnLibsWithTags": ["type:util"] }
      ]
    }]
  }
}
```

---

## 11. Testing Libraries

### Unit Testing Library Components

Library components are tested exactly like application components, but with a focus on testing the public API:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent (Library)', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent],  // standalone, or declarations: [ButtonComponent]
    });

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should apply the correct variant class', () => {
    component.variant = 'primary';
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList).toContain('btn--primary');
  });

  it('should emit clicked when not disabled', () => {
    const emitSpy = jest.spyOn(component.clicked, 'emit');
    component.disabled = false;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should NOT emit clicked when disabled', () => {
    const emitSpy = jest.spyOn(component.clicked, 'emit');
    component.disabled = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
```

### Publishing Test Utilities as a Secondary Entry Point

Provide consumers with mock services and testing helpers in a `testing` secondary entry point:

```typescript
// projects/@my-org/ui-kit/testing/index.ts
export { MockThemeService } from './mock-theme.service';
export { UiKitTestingModule } from './ui-kit-testing.module';
export { createButtonHarness } from './button.harness';
```

```typescript
// Usage in consumer's test
import { MockThemeService } from '@my-org/ui-kit/testing';

TestBed.configureTestingModule({
  providers: [{ provide: ThemeService, useClass: MockThemeService }]
});
```

### Component Harnesses (Angular CDK Testing)

For complex, interactive library components, Angular CDK's `ComponentHarness` API provides a stable, implementation-agnostic test interface:

```typescript
import { ComponentHarness } from '@angular/cdk/testing';

export class ButtonHarness extends ComponentHarness {
  static hostSelector = 'ui-button';

  async click(): Promise<void> {
    return (await this.host()).click();
  }

  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('btn--disabled');
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
```

Publishing harnesses in the `/testing` entry point means consumers can write harness-based tests without accessing internal DOM structure.

---

## 12. Performance Considerations

### Tree-Shaking

Angular libraries built with APF are tree-shakeable out of the box — provided:
- You use ESM (`import`/`export`), not CommonJS (`require`/`module.exports`)
- Side effects are minimized (no code with unintended global state at module load time)
- `package.json` includes `"sideEffects": false` (or lists only files with side effects)

```json
// dist package.json
{
  "sideEffects": false
}
```

### Lazy Loading Library Modules

Library feature modules can be lazy loaded like any Angular module:

```typescript
// In the consuming app's routing
const routes: Routes = [
  {
    path: 'charts',
    loadChildren: () =>
      import('@my-org/charts').then(m => m.ChartsModule)
  }
];
```

### Bundle Analysis

After building the consuming app, analyze what the library contributes:

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/my-app/stats.json
```

Look for:
- Unexpectedly large chunks from the library
- Shared modules not being deduplicated
- Third-party deps being bundled inside the library (should be peer deps)

---

## 13. Common Interview Questions & Answers

**Q: What is the difference between `ng-packagr` and `webpack` in the context of libraries?**

> `ng-packagr` is the Angular-specific build tool for libraries. It produces the Angular Package Format (APF) — ESM bundles, TypeScript declarations, and a correctly shaped `package.json`. It does NOT produce a webpack bundle. Webpack (or esbuild) is used by the *consuming application* to bundle the final output. Libraries are intentionally not webpack-bundled so the consuming app's bundler can tree-shake them.

---

**Q: Why can't I just publish my `src/` folder and have consumers import from it directly?**

> Raw `src/` contains uncompiled TypeScript, Angular templates, and SCSS — consumers would need your exact build toolchain to compile it. APF-compliant `dist/` output is pre-compiled, dependency-resolved, and packaged so any Angular project can consume it without additional compilation steps. It also enables faster IDE type-checking since `.d.ts` files are pre-built.

---

**Q: How would you handle breaking API changes in a library used by 10 teams?**

> (1) **Never introduce breaking changes in a minor or patch release** — follow SemVer strictly. (2) **Deprecate before removing** — mark the old API with `@deprecated` JSDoc and provide a migration path. (3) **Provide a migration guide** in `CHANGELOG.md`. (4) **Use Angular Update schematic** — for large changes, write an `ng update` schematic that automatically migrates consumer code. (5) **Support overlapping versions** — maintain the old API for one major version alongside the new one with a deprecation warning.

---

**Q: How does Ivy partial compilation help with library compatibility across Angular versions?**

> Before Ivy (pre-Angular 13), libraries were compiled with View Engine and the resulting bytecode was version-specific. Each major Angular version could break existing compiled libraries. Ivy partial compilation produces intermediate output that defers the final compilation step to the consuming application's build. The consuming app's version of `ngc` finalizes the compilation, so a library compiled for Angular 16 works in Angular 17 and 18 without recompilation or republishing.

---

**Q: What is the `forRoot()` pattern and when would you use it?**

> `forRoot()` is a static method on an `NgModule` that returns a `ModuleWithProviders` object. It's used when a library needs to register singleton services with optional configuration. Calling `forRoot()` in the root `AppModule` registers providers at the root injector level — there will be exactly one instance shared across the entire app. Feature modules that need to import the library's components use `forChild()` instead, which imports the module but skips provider registration, avoiding multiple instances.

---

**Q: How would you share styles (SCSS themes) from a library?**

> There are three approaches: (1) **Global stylesheet**: publish a `.scss` file in `assets` via `ng-package.json`, consumers import it in their `angular.json` `styles` array. (2) **CSS custom properties**: components use `var(--my-lib-color, fallback)` — consumers override in their global CSS. (3) **SCSS mixins**: export a `_mixins.scss` partial that consumers `@use` in their own SCSS for fine-grained control. Option 2 (CSS custom properties) is the most interoperable and doesn't require SCSS in the consumer.

---

**Q: How do you prevent circular dependencies between libraries?**

> (1) **Architecture by type**: structure libs as `feature → ui → data-access → util` where lower layers never import from higher layers. (2) **Nx `enforce-module-boundaries` lint rule**: statically enforces allowed import directions at CI time. (3) **Shared domain model lib**: extract shared interfaces and types into a `domain` lib that all others can import without creating circles. (4) **`madge` or `nx graph`**: use dependency visualization tools to detect cycles before they become problems.

---

*Study Guide last updated: 2026 | Target: Senior Frontend Developer Interview Preparation*
