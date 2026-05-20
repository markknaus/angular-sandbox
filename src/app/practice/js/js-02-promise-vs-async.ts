/**
 * JS-02: Promise Chain vs Async/Await
 * ====================================
 * Concept: Promises, async/await, Promise.all
 *
 * Objective:
 *   Write TWO versions of the same function. Both should fetch a user by ID,
 *   then fetch all of that user's posts concurrently, then return the post
 *   titles as an array of strings.
 *
 *   Version 1: getUserPostTitlesChain   — use Promise chaining (.then/.catch)
 *   Version 2: getUserPostTitlesAsync   — use async/await
 *
 * Requirements:
 *   - Use the mock functions provided below, do not call a real API
 *   - Fetch all posts CONCURRENTLY, not sequentially
 *   - Handle errors gracefully in both versions, return [] on error
 *   - Both functions must return Promise<string[]>
 *
 * Hints and solution: docs/practice-hints/js-hints-and-solutions.md
 * How to run:        docs/practice-hints/HOW-TO-RUN.md
 */

// ============================================================
// MOCK FUNCTIONS — do not modify
// ============================================================

interface JS02User {
  id: number;
  name: string;
  postIds: number[];
}

interface JS02Post {
  id: number;
  title: string;
}

function getUser(id: number): Promise<JS02User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id: 1, name: 'Mark', postIds: [101, 102, 103] });
      else reject(new Error('User not found'));
    }, 100);
  });
}

function getPost(postId: number): Promise<JS02Post> {
  const posts: Record<number, JS02Post> = {
    101: { id: 101, title: 'Angular Change Detection Deep Dive' },
    102: { id: 102, title: 'RxJS Operators You Actually Need' },
    103: { id: 103, title: 'TypeScript Generics Without the Pain' },
  };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      posts[postId]
        ? resolve(posts[postId])
        : reject(new Error('Post not found'));
    }, 50);
  });
}

// ============================================================
// SOLUTION — write your code here
// ============================================================

function getUserPostTitlesChain(id: number): Promise<string[]> {
  // your Promise chain implementation here
  return Promise.resolve([]);
}

async function getUserPostTitlesAsync(id: number): Promise<string[]> {
  // your async/await implementation here
  return [];
}

// ============================================================
// TESTS — do not modify below this line
// ============================================================

async function runTests() {
  console.log('--- JS-02: Promise Chain vs Async/Await ---\n');

  const expected = [
    'Angular Change Detection Deep Dive',
    'RxJS Operators You Actually Need',
    'TypeScript Generics Without the Pain',
  ];

  const chainResult = await getUserPostTitlesChain(1);
  const chainPass = JSON.stringify(chainResult) === JSON.stringify(expected);
  console.log('Test 1 (chain, valid user)   - Expected: 3 titles, Got:', chainResult.length, 'titles', chainPass ? '✓' : '✗');

  const asyncResult = await getUserPostTitlesAsync(1);
  const asyncPass = JSON.stringify(asyncResult) === JSON.stringify(expected);
  console.log('Test 2 (async, valid user)   - Expected: 3 titles, Got:', asyncResult.length, 'titles', asyncPass ? '✓' : '✗');

  const chainError = await getUserPostTitlesChain(99);
  console.log('Test 3 (chain, bad user)     - Expected: 0 titles, Got:', chainError.length, 'titles', chainError.length === 0 ? '✓' : '✗');

  const asyncError = await getUserPostTitlesAsync(99);
  console.log('Test 4 (async, bad user)     - Expected: 0 titles, Got:', asyncError.length, 'titles', asyncError.length === 0 ? '✓' : '✗');

  console.log('Test 5 (chain, title check)  -', chainPass ? 'Titles match ✓' : 'Titles do not match ✗');
  console.log('Test 6 (async, title check)  -', asyncPass ? 'Titles match ✓' : 'Titles do not match ✗');

  console.log('\n--- All tests complete ---');
  console.log('All rows should show ✓');
}

runTests();