/**
 * TS-01: Generic Utility Function — groupBy
 * =========================================
 * Concept: Generics, keyof constraints
 *
 * Objective:
 *   Write a generic function `groupBy` that takes an array of objects and
 *   a key, and returns an object where each key maps to an array of items
 *   sharing that key's value.
 *
 * Requirements:
 *   - Fully typed with generics, no use of `any`
 *   - The key parameter must be constrained to valid keys of the object type
 *   - TypeScript should error if you pass a key that does not exist on the object
 *   - Return type should be Record<string, T[]>
 *
 * Hints and solution: docs/practice-hints/ts-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// SOLUTION — write your code here
// ============================================================

function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  // your code here
  return {};
}

// ============================================================
// TESTS — do not modify below this line
// ============================================================

// Note: TS01Employee is prefixed to avoid conflicts with other practice files
interface TS01Employee {
  name: string;
  role: 'admin' | 'user';
  department: string;
}

const employees: TS01Employee[] = [
  { name: 'Alice', role: 'admin', department: 'Engineering' },
  { name: 'Bob',   role: 'user',  department: 'Marketing'   },
  { name: 'Carol', role: 'admin', department: 'Engineering' },
  { name: 'Dave',  role: 'user',  department: 'Engineering' },
  { name: 'Eve',   role: 'user',  department: 'Marketing'   },
];

console.log('--- TS-01: Generic groupBy ---\n');

const byRole = groupBy(employees, 'role');
console.log('Test 1 - Expected: 2 admins,      Got:', byRole['admin']?.length ?? 0, 'admins',       byRole['admin']?.length === 2 ? '✓' : '✗');
console.log('Test 2 - Expected: 3 users,       Got:', byRole['user']?.length  ?? 0, 'users',        byRole['user']?.length  === 3 ? '✓' : '✗');

const byDept = groupBy(employees, 'department');
console.log('Test 3 - Expected: 3 Engineering, Got:', byDept['Engineering']?.length ?? 0, 'Engineering', byDept['Engineering']?.length === 3 ? '✓' : '✗');
console.log('Test 4 - Expected: 2 Marketing,   Got:', byDept['Marketing']?.length   ?? 0, 'Marketing',   byDept['Marketing']?.length   === 2 ? '✓' : '✗');

const firstAdmin = byRole['admin']?.[0];
const hasAllFields = firstAdmin && 'name' in firstAdmin && 'role' in firstAdmin && 'department' in firstAdmin;
console.log('Test 5 - Expected: full objects,  Got:', hasAllFields ? 'full objects ✓' : 'incomplete objects ✗');

const empty = groupBy([], 'role' as keyof TS01Employee);
console.log('Test 6 - Expected: {},            Got:', JSON.stringify(empty), JSON.stringify(empty) === '{}' ? '✓' : '✗');

console.log('\n--- All tests complete ---');
console.log('All rows should show ✓');