/**
 * TS-02: Utility Types in Practice
 * =================================
 * Concept: Partial, Pick, Omit, Readonly, Record
 *
 * Objective:
 *   Using ONLY TypeScript utility types, derive five new types from the
 *   base interfaces below. Do not rewrite the interfaces manually.
 *
 * Requirements:
 *   1. TS02PublicUser     — User without password, id, createdAt, updatedAt
 *   2. TS02UserUpdate     — All User fields optional EXCEPT id (stays required)
 *   3. TS02PostSummary    — Post with only id, title, and published
 *   4. TS02ReadonlyPost   — Post where no fields can be mutated
 *   5. TS02RolePermissions — Each role maps to an array of allowed action strings
 *
 * Hints and solution: docs/practice-hints/ts-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// BASE INTERFACES — do not modify
// ============================================================

// Note: prefixed with TS02 to avoid conflicts with other practice files
interface TS02User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'readonly';
  createdAt: Date;
  updatedAt: Date;
}

interface TS02Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  published: boolean;
  tags: string[];
}

// ============================================================
// SOLUTION — replace each `any` with the correct utility type
// ============================================================

type TS02PublicUser      = any;
type TS02UserUpdate      = any;
type TS02PostSummary     = any;
type TS02ReadonlyPost    = any;
type TS02RolePermissions = any;

// ============================================================
// TESTS — do not modify below this line
// ============================================================

console.log('--- TS-02: Utility Types ---\n');

const publicUser: TS02PublicUser = { email: 'mark@example.com', role: 'admin' };
console.log('Test 1 - TS02PublicUser compiles without password/id/dates ✓');

const userUpdate: TS02UserUpdate = { id: 1 };
console.log('Test 2 - TS02UserUpdate with only id compiles ✓');

const fullUpdate: TS02UserUpdate = { id: 1, email: 'new@example.com', role: 'user' };
console.log('Test 3 - TS02UserUpdate with partial fields compiles ✓');

const postSummary: TS02PostSummary = { id: 1, title: 'My Post', published: true };
console.log('Test 4 - TS02PostSummary with only id/title/published compiles ✓');

const readonlyPost: TS02ReadonlyPost = {
  id: 1, title: 'Test', body: 'Body', authorId: 1, published: false, tags: []
};
// Uncomment to verify TypeScript errors on mutation:
// readonlyPost.title = 'Changed';
console.log('Test 5 - TS02ReadonlyPost created successfully ✓');

const permissions: TS02RolePermissions = {
  admin:    ['read', 'write', 'delete'],
  user:     ['read', 'write'],
  readonly: ['read'],
};
console.log('Test 6 - TS02RolePermissions maps all three roles ✓');

console.log('\n--- All tests complete ---');
console.log('If this file compiles and runs, your utility types are correct.');