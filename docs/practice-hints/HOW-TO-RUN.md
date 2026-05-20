# How to Run Practice Files

## Quick Reference

| Type | Command |
|---|---|
| JavaScript / TypeScript | `ts-node src/app/practice/js/<filename>.ts` |
| TypeScript | `ts-node src/app/practice/ts/<filename>.ts` |
| Angular (browser) | `ng serve` then open `http://localhost:4200` |

---

## JavaScript and TypeScript Files

All JS and TS practice files run directly in the terminal using `ts-node`.
Always run commands from the project root (`/f/source/angular-sandbox`).

### Run a specific file
```bash
ts-node src/app/practice/js/js-01-closure-counter.ts
ts-node src/app/practice/js/js-02-promise-vs-async.ts
ts-node src/app/practice/js/js-03-array-manipulation.ts

ts-node src/app/practice/ts/ts-01-generic-utility.ts
ts-node src/app/practice/ts/ts-02-utility-types.ts
ts-node src/app/practice/ts/ts-03-discriminated-unions.ts
```

### What good output looks like
```
--- JS-01: Closure Counter ---

Test 1 - Expected: 2,   Got: 2
Test 2 - Expected: 11,  Got: 11
Test 3 - Expected: 2,   Got: 2
Test 4 - Expected: -2,  Got: -2
Test 5a - Expected: 6,  Got: 6
Test 5b - Expected: 99, Got: 99

--- All tests complete ---
All "Expected" and "Got" values should match.
```

Every "Expected" value must match its "Got" value. If they don't match,
your implementation needs more work.

### What the stub output looks like (before you implement)
All "Got" values will be `0`, `false`, `undefined`, or an empty result.
That means the file is running correctly — you just need to write your solution.

---

## Angular Practice Components

Angular components run in the browser, not the terminal.

### Start the dev server
```bash
ng serve
```

### Open in browser
```
http://localhost:4200
```

### Navigate to a practice component
Each Angular practice component will be accessible via a link in the app
navigation once components are wired up. Until then, temporarily add the
component to `app.html` to test it.

### Stop the dev server
```
Ctrl+C in the terminal
```

---

## VS Code Tips

### Open markdown preview side by side
1. Open any `.md` file in VS Code
2. Press `Ctrl+Shift+V` (Windows) or `Cmd+Shift+V` (Mac)
3. The preview opens next to your code

### Useful VS Code shortcuts for this project
| Action | Shortcut |
|---|---|
| Open terminal | Ctrl+` |
| Open file quickly | Ctrl+P then type filename |
| Open markdown preview | Ctrl+Shift+V |
| Format document | Shift+Alt+F |
| Go to definition | F12 |
| Peek type info | Ctrl+hover over a symbol |

---

## Troubleshooting

**"ts-node is not recognized"**
```bash
npm install -g ts-node
```

**"Cannot find module" errors**
Make sure you are running from the project root:
```bash
cd /f/source/angular-sandbox
ts-node src/app/practice/js/js-01-closure-counter.ts
```

**TypeScript errors in the stub before you start**
The stub return values are placeholders. TypeScript may warn about
unused variables — this is expected until you implement your solution.

**Angular won't compile**
```bash
ng serve
```
Check the terminal for error details. Most errors show the file and
line number causing the problem.
