/**
 * JS-01: Closure Counter
 * ======================
 * Concept: Closures
 *
 * Objective:
 *   Write a function `makeCounter` that returns an object with three methods:
 *   increment, decrement, and getCount. Each call to makeCounter should
 *   produce an independent counter.
 *
 * Requirements:
 *   - No class syntax, use closures only
 *   - Each counter instance must be fully independent
 *   - getCount returns the current value
 *   - Counter starts at 0 by default but accepts an optional starting value
 *
 * Hints and solution: docs/practice-hints/js-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// TYPE DEFINITION — do not modify
// ============================================================

interface Counter {
  increment: () => void;
  decrement: () => void;
  getCount: () => number;
}

// ============================================================
// SOLUTION — write your code here
// ============================================================

function makeCounter(start = 0): Counter {
  // your code here
  // replace this stub return with your implementation
  return {
    increment: () => {},
    decrement: () => {},
    getCount: () => 0,
  };
}

// ============================================================
// TESTS — do not modify below this line
// ============================================================

console.log('--- JS-01: Closure Counter ---\n');

const counter1 = makeCounter();
counter1.increment();
counter1.increment();
counter1.increment();
counter1.decrement();
console.log('Test 1 - Expected: 2,   Got:', counter1.getCount());

const counter2 = makeCounter(10);
counter2.increment();
console.log('Test 2 - Expected: 11,  Got:', counter2.getCount());

counter2.increment();
counter2.increment();
console.log('Test 3 - Expected: 2,   Got:', counter1.getCount());

const counter3 = makeCounter();
counter3.decrement();
counter3.decrement();
console.log('Test 4 - Expected: -2,  Got:', counter3.getCount());

const a = makeCounter(5);
const b = makeCounter(100);
a.increment();
b.decrement();
console.log('Test 5a - Expected: 6,  Got:', a.getCount());
console.log('Test 5b - Expected: 99, Got:', b.getCount());

console.log('\n--- All tests complete ---');
console.log('All "Expected" and "Got" values should match.');
