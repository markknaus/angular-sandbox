/**
 * JS-03: Array Manipulation Without Mutation
 * ==========================================
 * Concept: filter, map, sort without mutating the original array
 *
 * Objective:
 *   Write a function `processOrders` that takes an array of orders and
 *   returns a new transformed array. The original array must not be modified.
 *
 * Requirements:
 *   - Filter out cancelled orders
 *   - Apply a 10% discount to orders with a total over $100
 *   - Sort remaining orders by total descending (highest first)
 *   - Return only id, customerName, and total fields
 *   - Do NOT mutate the original orders array
 *
 * Hints and solution: docs/practice-hints/js-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// TYPE DEFINITIONS — do not modify
// ============================================================

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'complete' | 'cancelled' | 'pending';
}

interface OrderSummary {
  id: number;
  customerName: string;
  total: number;
}

// ============================================================
// SOLUTION — write your code here
// ============================================================

function processOrders(orders: Order[]): OrderSummary[] {
  // your code here
  return [];
}

// ============================================================
// TESTS — do not modify below this line
// ============================================================

const orders: Order[] = [
  { id: 1, customerName: 'Alice', total: 250.00, status: 'complete' },
  { id: 2, customerName: 'Bob',   total: 80.00,  status: 'complete' },
  { id: 3, customerName: 'Carol', total: 150.00, status: 'cancelled' },
  { id: 4, customerName: 'Dave',  total: 120.00, status: 'complete' },
  { id: 5, customerName: 'Eve',   total: 95.00,  status: 'complete' },
];

console.log('--- JS-03: Array Manipulation Without Mutation ---\n');

const result = processOrders(orders);

// Test 1: Correct number of results (cancelled order removed)
console.log('Test 1 - Expected: 4 orders,      Got:', result.length, 'orders', result.length === 4 ? '✓' : '✗');

// Test 2: Carol (cancelled) should not appear
const hasCarol = result.some(o => o.customerName === 'Carol');
console.log('Test 2 - Expected: no Carol,       Got:', hasCarol ? 'Carol present ✗' : 'Carol absent ✓');

// Test 3: Alice discount applied (250 * 0.9 = 225)
const alice = result.find(o => o.customerName === 'Alice');
console.log('Test 3 - Expected: Alice $225.00,  Got: Alice $' + (alice?.total?.toFixed(2) ?? 'not found'), alice?.total === 225 ? '✓' : '✗');

// Test 4: Dave discount applied (120 * 0.9 = 108)
const dave = result.find(o => o.customerName === 'Dave');
console.log('Test 4 - Expected: Dave $108.00,   Got: Dave $' + (dave?.total?.toFixed(2) ?? 'not found'), dave?.total === 108 ? '✓' : '✗');

// Test 5: Bob no discount (80 < 100)
const bob = result.find(o => o.customerName === 'Bob');
console.log('Test 5 - Expected: Bob $80.00,     Got: Bob $' + (bob?.total?.toFixed(2) ?? 'not found'), bob?.total === 80 ? '✓' : '✗');

// Test 6: Sorted descending by total (only check if we have results)
if (result.length >= 2) {
  const sortedCorrectly = result[0].customerName === 'Alice' && result[1].customerName === 'Dave';
  console.log('Test 6 - Expected: Alice, Dave..., Got:', result.map(o => o.customerName).join(', '), sortedCorrectly ? '✓' : '✗');
} else {
  console.log('Test 6 - Expected: Alice, Dave..., Got: not enough results to check ✗');
}

// Test 7: Original array not mutated
console.log('Test 7 - Expected: 5 orders,       Got:', orders.length, 'in original', orders.length === 5 ? '✓' : '✗');

// Test 8: Only id, customerName, total in results (no status field)
if (result.length > 0) {
  const hasNoStatus = !('status' in result[0]);
  console.log('Test 8 - Expected: no status field, Got:', hasNoStatus ? 'status absent ✓' : 'status present ✗');
} else {
  console.log('Test 8 - Expected: no status field, Got: no results to check ✗');
}

console.log('\n--- All tests complete ---');
console.log('All rows should show ✓');