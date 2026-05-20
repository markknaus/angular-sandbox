# Data Structures & Algorithms for JavaScript Developers

> **LeetCode-style interview preparation for Senior developers. All examples in modern JavaScript (ES2020+).**
> Big O Notation · Core Data Structures · Algorithm Patterns · 20 Worked Problems · Interview Strategy

> 📝 **Navigation:** Notion users — add a `/Table of Contents` block below this line. GitHub users — use the **☰** icon at the top-right of this file.

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Big O Notation](#big-o-notation)
  - [What Big O Actually Means](#what-big-o-actually-means)
  - [The Six Complexities You Need to Know](#the-six-complexities-you-need-to-know)
  - [O(1) — Constant Time](#o1--constant-time)
  - [O(log n) — Logarithmic Time](#olog-n--logarithmic-time)
  - [O(n) — Linear Time](#on--linear-time)
  - [O(n log n) — Linearithmic Time](#on-log-n--linearithmic-time)
  - [O(n²) — Quadratic Time](#on--quadratic-time)
  - [O(2ⁿ) — Exponential Time](#o2--exponential-time)
  - [Time vs Space Complexity](#time-vs-space-complexity)
  - [How to Calculate Big O](#how-to-calculate-big-o)
- [Core Data Structures](#core-data-structures)
  - [Arrays](#arrays)
  - [What They Are](#what-they-are)
  - [Complexity](#complexity)
  - [JavaScript Patterns](#javascript-patterns)
  - [Hash Maps — Objects and Map](#hash-maps--objects-and-map)
  - [What They Are](#what-they-are)
  - [Complexity](#complexity)
  - [JavaScript Patterns](#javascript-patterns)
  - [Sets](#sets)
  - [What They Are](#what-they-are)
  - [JavaScript Patterns](#javascript-patterns)
  - [Stacks and Queues](#stacks-and-queues)
  - [What They Are](#what-they-are)
  - [JavaScript Patterns](#javascript-patterns)
  - [Linked Lists](#linked-lists)
  - [What They Are](#what-they-are)
  - [Implementation](#implementation)
  - [Trees — Binary Trees](#trees--binary-trees)
  - [What They Are](#what-they-are)
  - [Implementation and Traversal](#implementation-and-traversal)
  - [Graphs](#graphs)
  - [What They Are](#what-they-are)
  - [BFS vs DFS](#bfs-vs-dfs)
- [Algorithm Patterns](#algorithm-patterns)
  - [Pattern 1 — Hash Map for O(1) Lookup](#pattern-1--hash-map-for-o1-lookup)
  - [Pattern 2 — Two Pointers](#pattern-2--two-pointers)
  - [Pattern 3 — Sliding Window](#pattern-3--sliding-window)
  - [Pattern 4 — Fast and Slow Pointers](#pattern-4--fast-and-slow-pointers)
  - [Pattern 5 — Binary Search](#pattern-5--binary-search)
  - [Pattern 6 — DFS on Trees (Recursion)](#pattern-6--dfs-on-trees-recursion)
  - [Pattern 7 — BFS on Graphs and Trees](#pattern-7--bfs-on-graphs-and-trees)
  - [Pattern 8 — Prefix Sums](#pattern-8--prefix-sums)
  - [Pattern 9 — Recursion and the Call Stack](#pattern-9--recursion-and-the-call-stack)
  - [Pattern 10 — Dynamic Programming (Recognition)](#pattern-10--dynamic-programming-recognition)
- [20 Worked Problems](#20-worked-problems)
  - [Problem 1 — Two Sum](#problem-1--two-sum)
  - [Problem 2 — Valid Parentheses](#problem-2--valid-parentheses)
  - [Problem 3 — Best Time to Buy and Sell Stock](#problem-3--best-time-to-buy-and-sell-stock)
  - [Problem 4 — Contains Duplicate](#problem-4--contains-duplicate)
  - [Problem 5 — Maximum Subarray (Kadane's Algorithm)](#problem-5--maximum-subarray-kadanes-algorithm)
  - [Problem 6 — Climbing Stairs](#problem-6--climbing-stairs)
  - [Problem 7 — Reverse Linked List](#problem-7--reverse-linked-list)
  - [Problem 8 — Binary Search](#problem-8--binary-search)
  - [Problem 9 — Linked List Cycle](#problem-9--linked-list-cycle)
  - [Problem 10 — Valid Anagram](#problem-10--valid-anagram)
  - [Problem 11 — Maximum Depth of Binary Tree](#problem-11--maximum-depth-of-binary-tree)
  - [Problem 12 — Number of Islands](#problem-12--number-of-islands)
  - [Problem 13 — 3Sum](#problem-13--3sum)
  - [Problem 14 — Longest Substring Without Repeating Characters](#problem-14--longest-substring-without-repeating-characters)
  - [Problem 15 — Course Schedule (Cycle Detection)](#problem-15--course-schedule-cycle-detection)
  - [Problem 16 — Product of Array Except Self](#problem-16--product-of-array-except-self)
  - [Problem 17 — Find Minimum in Rotated Sorted Array](#problem-17--find-minimum-in-rotated-sorted-array)
  - [Problem 18 — Merge Intervals](#problem-18--merge-intervals)
  - [Problem 19 — Lowest Common Ancestor of a BST](#problem-19--lowest-common-ancestor-of-a-bst)
  - [Problem 20 — Coin Change](#problem-20--coin-change)
- [Interview Strategy](#interview-strategy)
  - [The Framework: Understand → Brute Force → Optimise → Code → Test](#the-framework-understand--brute-force--optimise--code--test)
  - [What to Say When You Are Stuck](#what-to-say-when-you-are-stuck)
  - [What Interviewers Are Actually Evaluating](#what-interviewers-are-actually-evaluating)
  - [Practice Recommendations](#practice-recommendations)


## Introduction

This guide prepares you for the Data Structures and Algorithms (DSA) screening rounds that appear in many senior developer interviews. It is scoped specifically for Angular and full-stack developers who need to pass a basic-to-intermediate screening — not for competitive programming or FAANG-level interviews.

The goal is twofold: build enough vocabulary and pattern recognition to handle screening problems confidently, and reinforce JavaScript mechanics in the process. Every solution uses modern JS (ES2020+, arrow functions, destructuring, Map, Set) because that is how you actually write code.

**What this guide covers:**
- Part 1: Big O Notation — reading and calculating complexity
- Part 2: Core Data Structures — with JS implementations and complexity tables
- Part 3: Algorithm Patterns — the 10 patterns that cover ~80% of screening problems
- Part 4: 20 Worked Problems — easy to medium, fully explained
- Part 5: Interview Strategy — how to think out loud and handle uncertainty

---

## Big O Notation

### What Big O Actually Means

Big O notation describes how the runtime or memory usage of an algorithm grows as the input size grows. The input size is conventionally called `n`. The notation answers the question: if I double the size of my input, how does the time (or memory) roughly change?

This is not about measuring exact execution time — that depends on hardware, language runtime, and a dozen other factors. Big O describes the *shape* of the growth curve, ignoring constant factors and lower-order terms. O(2n) simplifies to O(n). O(n² + n) simplifies to O(n²).

**Why interviewers care:** They want to know you understand the trade-off you made. An O(n²) solution that works on 10 items will grind to a halt on 10,000 items. Saying "this is O(n) time and O(1) space" shows you have thought about scalability.

### The Six Complexities You Need to Know

### O(1) — Constant Time

The operation takes the same amount of time regardless of input size. Looking up a value in a JavaScript object or Map by key is O(1). Reading the first element of an array is O(1).

```javascript
const getUser = (users, id) => users[id]; // O(1) — direct lookup
const first = arr[0];                     // O(1) — index access
const hasKey = map.has('userId');         // O(1) — Map lookup
```

### O(log n) — Logarithmic Time

Each step of the algorithm halves the remaining problem. Binary search is the canonical example. If you have 1,000,000 items, binary search takes about 20 steps (log₂ 1,000,000 ≈ 20). Doubling the input only adds one more step.

```javascript
// Binary search — O(log n)
const binarySearch = (arr, target) => {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
};
```

### O(n) — Linear Time

The runtime grows proportionally with the input. Iterating through an array once is O(n). Finding the maximum value in an unsorted array is O(n) — you must look at every element.

```javascript
const findMax = arr => arr.reduce((max, val) => Math.max(max, val), -Infinity); // O(n)
const sum = arr => arr.reduce((total, n) => total + n, 0);                      // O(n)
```

### O(n log n) — Linearithmic Time

Common in efficient sorting algorithms. JavaScript's built-in `Array.sort()` is O(n log n). Merge sort and heap sort are O(n log n). You will rarely implement this from scratch in an interview — knowing it exists and that sorting costs O(n log n) is what matters.

```javascript
const sorted = arr.sort((a, b) => a - b); // O(n log n) — built-in sort
```

### O(n²) — Quadratic Time

Nested loops over the input. For every element, you look at every other element. Works fine on small inputs, becomes unusable on large ones. Often the "brute force" solution that interviewers expect you to improve.

```javascript
// Find all pairs — O(n²)
const findPairs = arr => {
  const pairs = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
};
```

### O(2ⁿ) — Exponential Time

Doubles with each addition to the input. Brute-force recursive solutions to problems like "generate all subsets" are O(2ⁿ). Almost always indicates the approach needs rethinking.

### Time vs Space Complexity

Every algorithm has both time complexity (how long it runs) and space complexity (how much memory it uses). Often there is a trade-off — you can make an algorithm faster by using more memory, or use less memory at the cost of speed.

```javascript
// Time: O(n²), Space: O(1) — slow but memory-efficient
const hasDuplicateSlow = arr => {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
};

// Time: O(n), Space: O(n) — fast but uses a Set for storage
const hasDuplicateFast = arr => new Set(arr).size !== arr.length;
```

### How to Calculate Big O

**Rule 1 — Drop constants:** O(2n) → O(n). O(100) → O(1).

**Rule 2 — Drop lower-order terms:** O(n² + n) → O(n²). O(n + log n) → O(n).

**Rule 3 — Sequential steps add:** if you have a loop that is O(n) followed by another loop that is O(n), the total is O(n + n) = O(2n) = O(n).

**Rule 4 — Nested steps multiply:** a loop O(n) with a nested loop O(n) gives O(n × n) = O(n²).

**Rule 5 — Different inputs, different variables:** if a function iterates over two different arrays of sizes `a` and `b`, it is O(a + b), not O(n). This distinction matters in interviews.

---

## Core Data Structures

### Arrays

### What They Are

Arrays store elements in contiguous memory in a fixed order. JavaScript arrays are dynamic (they resize automatically) and can hold mixed types, though you will typically work with typed arrays in TypeScript.

### Complexity

| Operation | Time |
|---|---|
| Access by index | O(1) |
| Search (unsorted) | O(n) |
| Insert at end (`push`) | O(1) amortised |
| Insert at start (`unshift`) | O(n) |
| Delete from end (`pop`) | O(1) |
| Delete from start (`shift`) | O(n) |

### JavaScript Patterns

```javascript
// Modern array operations you use every day
const arr = [3, 1, 4, 1, 5, 9, 2, 6];

// Spread for immutable operations (important in Angular/React)
const withNew = [...arr, 7];              // append — O(n) to copy
const withoutLast = arr.slice(0, -1);     // remove last — O(n) to copy
const sorted = [...arr].sort((a, b) => a - b); // sort copy — O(n log n)

// Destructuring
const [first, second, ...rest] = arr;

// Common interview utilities
arr.includes(5);          // O(n) search
arr.indexOf(5);           // O(n) search, returns index or -1
arr.findIndex(x => x > 4); // O(n) search with predicate
arr.every(x => x > 0);   // O(n) — all elements pass test
arr.some(x => x > 8);    // O(n) — any element passes test
arr.flat();               // flatten one level
arr.flatMap(x => [x, x]); // map then flatten
```

> 💡 **Tip:** In interviews, inserting or deleting from the *start* of a large array is O(n) because every element must shift. If you need frequent insertions at both ends, a linked list or deque is more appropriate. Mentioning this trade-off is the kind of thing that distinguishes a senior answer.

### Hash Maps — Objects and Map

### What They Are

A hash map stores key-value pairs and provides O(1) average-case lookup, insertion, and deletion. JavaScript has two options: plain objects (`{}`) and the built-in `Map`. Use `Map` in algorithm problems — it has better performance characteristics, preserves insertion order, allows any key type, and has a cleaner API.

### Complexity

| Operation | Time |
|---|---|
| Get by key | O(1) average |
| Set by key | O(1) average |
| Delete by key | O(1) average |
| Check existence | O(1) average |
| Iterate | O(n) |

### JavaScript Patterns

```javascript
// Map — preferred for algorithm problems
const freq = new Map();

// Count character frequency (extremely common pattern)
const countFreq = str => {
  const map = new Map();
  for (const ch of str) {
    map.set(ch, (map.get(ch) ?? 0) + 1);
  }
  return map;
};

// Two Sum pattern — store seen values
const twoSum = (nums, target) => {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
};

// Object — fine for string keys, simpler syntax
const count = {};
for (const ch of 'hello') {
  count[ch] = (count[ch] ?? 0) + 1;
}
// { h: 1, e: 1, l: 2, o: 1 }

// Grouping pattern (very common)
const groupBy = (arr, keyFn) =>
  arr.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
```

### Sets

### What They Are

A Set stores unique values with O(1) add, delete, and lookup. Use it whenever you need to track seen elements, remove duplicates, or check membership.

### JavaScript Patterns

```javascript
// Remove duplicates
const unique = arr => [...new Set(arr)];

// Check membership — O(1) vs O(n) for array includes
const seen = new Set();
if (!seen.has(val)) { seen.add(val); }

// Set operations (not built-in, but common interview implementations)
const union        = (a, b) => new Set([...a, ...b]);
const intersection = (a, b) => new Set([...a].filter(x => b.has(x)));
const difference   = (a, b) => new Set([...a].filter(x => !b.has(x)));

// Convert between Set and Array freely
const arr = [1, 2, 2, 3, 3, 3];
const set = new Set(arr);  // {1, 2, 3}
const back = [...set];     // [1, 2, 3]
```

### Stacks and Queues

### What They Are

**Stack:** Last In, First Out (LIFO). Think of a stack of plates — you add and remove from the top. Use an array with `push` and `pop`.

**Queue:** First In, First Out (FIFO). Think of a queue of people — you add to the back and remove from the front. Use an array with `push` and `shift` for small inputs. For large inputs, shift() is O(n) — a proper queue uses a linked list or a circular buffer, but for interviews, the array approach is typically acceptable.

### JavaScript Patterns

```javascript
// Stack — use for: undo systems, parsing brackets, DFS
const stack = [];
stack.push(item);       // add to top — O(1)
const top = stack.pop(); // remove from top — O(1)
const peek = stack.at(-1); // look at top without removing — O(1)

// Queue — use for: BFS, task scheduling, sliding window
const queue = [];
queue.push(item);          // enqueue — O(1)
const front = queue.shift(); // dequeue — O(n) for arrays (fine for interviews)

// Classic stack problem: valid parentheses
const isValid = s => {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
};
```

### Linked Lists

### What They Are

A linked list is a sequence of nodes where each node holds a value and a reference (pointer) to the next node. Unlike arrays, there is no index — you must traverse from the head to reach a specific position. Insertions and deletions at a known node are O(1) — you just update the pointers. Traversal is O(n).

JavaScript has no built-in linked list. You implement one with objects. Interviews test linked lists to check you understand pointer manipulation and can think in terms of nodes rather than indexes.

### Implementation

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Build a list: 1 → 2 → 3 → null
const buildList = vals => {
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of vals) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
};

// Traverse a list
const printList = head => {
  const vals = [];
  let curr = head;
  while (curr) {
    vals.push(curr.val);
    curr = curr.next;
  }
  return vals.join(' → ');
};

// Reverse a linked list — O(n) time, O(1) space
const reverseList = head => {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse the pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }
  return prev; // prev is now the new head
};

// Find middle node (fast/slow pointer)
const findMiddle = head => {
  let slow = head, fast = head;
  while (fast?.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
};
```

| Operation | Time |
|---|---|
| Access by index | O(n) |
| Insert at head | O(1) |
| Insert at tail (with tail pointer) | O(1) |
| Insert at middle (given node) | O(1) |
| Delete (given node) | O(1) |
| Search | O(n) |

### Trees — Binary Trees

### What They Are

A tree is a hierarchical data structure. A binary tree is one where each node has at most two children: left and right. The topmost node is the root. Nodes with no children are leaves.

**Binary Search Tree (BST):** A binary tree where every node in the left subtree has a smaller value and every node in the right subtree has a larger value. This property allows O(log n) search in a balanced tree.

### Implementation and Traversal

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// The three DFS traversal orders
// Inorder (left → root → right): gives sorted output for a BST
const inorder = root => {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
};

// Preorder (root → left → right): useful for copying a tree
const preorder = root => {
  if (!root) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
};

// Postorder (left → right → root): useful for deleting a tree
const postorder = root => {
  if (!root) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
};

// BFS / Level-order traversal — uses a queue
const levelOrder = root => {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
};

// Max depth — classic recursive DFS
const maxDepth = root =>
  !root ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
```

### Graphs

### What They Are

A graph is a set of nodes (vertices) connected by edges. Trees are a special case of graphs (connected, no cycles). Graphs can be directed (edges have direction) or undirected, and weighted (edges have costs) or unweighted.

Most interview graph problems use an **adjacency list** representation — a Map or object where each key is a node and its value is an array of its neighbours.

### BFS vs DFS

**BFS (Breadth-First Search):** Explores neighbours level by level using a queue. Use BFS when you need the *shortest path* in an unweighted graph.

**DFS (Depth-First Search):** Explores as far as possible along each branch before backtracking. Use DFS when you need to explore all paths, detect cycles, or find any path.

```javascript
// Build a graph from an edge list
const buildGraph = edges => {
  const graph = new Map();
  for (const [a, b] of edges) {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a); // omit for directed graph
  }
  return graph;
};

// BFS — shortest path / level-by-level exploration
const bfs = (graph, start) => {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return order;
};

// DFS — recursive
const dfs = (graph, node, visited = new Set()) => {
  visited.add(node);
  for (const neighbour of graph.get(node) ?? []) {
    if (!visited.has(neighbour)) dfs(graph, neighbour, visited);
  }
  return visited;
};
```

---

## Algorithm Patterns

The key insight about LeetCode-style interviews is that most problems are variations on a small set of patterns. Recognising the pattern is half the solution. These ten patterns cover the vast majority of screening-level problems.

### Pattern 1 — Hash Map for O(1) Lookup

**When to use:** Any problem where you need to find a complement, check for a seen value, or count frequencies. Converting an O(n²) brute-force nested loop into an O(n) single pass.

**Template:**
```javascript
// Replace: "for every element, search the rest of the array" O(n²)
// With: "store what we've seen in a Map, look it up in O(1)" O(n)
const solve = arr => {
  const seen = new Map(); // or new Set() if you only need existence
  for (let i = 0; i < arr.length; i++) {
    const needed = computeNeeded(arr[i]);
    if (seen.has(needed)) return [seen.get(needed), i]; // found!
    seen.set(arr[i], i); // store for future lookups
  }
};
```

**Signals:** "Find two elements that...", "Check if any element...", "Count occurrences of..."

### Pattern 2 — Two Pointers

**When to use:** Problems on sorted arrays or strings where you need to find pairs or partition elements. One pointer at each end, moving toward the middle based on a condition.

**Template:**
```javascript
const twoPointers = arr => {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const current = combine(arr[left], arr[right]);
    if (current === target) return [left, right];
    else if (current < target) left++;  // need larger sum
    else right--;                        // need smaller sum
  }
};
```

**Signals:** Sorted array, "find pair with sum X", "reverse in place", "remove duplicates from sorted array", "is palindrome"

### Pattern 3 — Sliding Window

**When to use:** Problems about contiguous subarrays or substrings — finding the maximum, minimum, or a specific condition in a window of elements. The window expands by moving the right pointer and shrinks by moving the left pointer.

**Template:**
```javascript
const slidingWindow = (arr, k) => {
  let left = 0, result = 0, windowState = 0;
  for (let right = 0; right < arr.length; right++) {
    windowState = add(windowState, arr[right]); // expand window
    while (windowInvalid(windowState, k)) {
      windowState = remove(windowState, arr[left]); // shrink window
      left++;
    }
    result = Math.max(result, right - left + 1); // or whatever metric
  }
  return result;
};
```

**Signals:** "Longest subarray/substring with condition X", "Maximum sum subarray of size k", "Minimum window containing..."

### Pattern 4 — Fast and Slow Pointers

**When to use:** Linked list cycle detection, finding the middle of a linked list, detecting where a cycle begins. The fast pointer moves two steps for every one step of the slow pointer. When they meet (or when fast reaches the end), you have your answer.

**Template:**
```javascript
const fastSlowPointers = head => {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // cycle detected
  }
  return false; // fast reached end — no cycle
};
```

**Signals:** Linked list cycle, "find middle of list", "is happy number" (number theory cycle detection)

### Pattern 5 — Binary Search

**When to use:** Sorted array, or any problem where the search space can be halved at each step. Also applies to searching on a range of values — "find the minimum X such that condition Y is met".

**Template:**
```javascript
// Standard binary search
const binarySearch = (arr, target) => {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2); // avoid overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
};

// Binary search on answer space — "find minimum X where condition is true"
const binarySearchAnswer = (lo, hi, condition) => {
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (condition(mid)) hi = mid;   // mid works, try smaller
    else lo = mid + 1;              // mid doesn't work, need larger
  }
  return lo;
};
```

**Signals:** Sorted array, "find first/last occurrence", "search in rotated array", "minimum/maximum X such that..."

### Pattern 6 — DFS on Trees (Recursion)

**When to use:** Any tree problem. The recursive structure of trees maps naturally to recursive DFS. The base case is always the null node.

**Template:**
```javascript
const solveDFS = node => {
  if (!node) return baseCase; // base case: null node
  const leftResult = solveDFS(node.left);   // solve left subtree
  const rightResult = solveDFS(node.right); // solve right subtree
  return combine(node.val, leftResult, rightResult); // combine results
};

// Example: sum of all node values
const treeSum = node => !node ? 0 : node.val + treeSum(node.left) + treeSum(node.right);

// Example: check if a value exists in BST
const searchBST = (node, val) => {
  if (!node) return false;
  if (node.val === val) return true;
  return val < node.val ? searchBST(node.left, val) : searchBST(node.right, val);
};
```

**Signals:** Any tree problem. When in doubt on a tree problem, reach for DFS recursion first.

### Pattern 7 — BFS on Graphs and Trees

**When to use:** Shortest path in unweighted graph, level-by-level tree processing, "minimum number of steps to reach X".

**Template:**
```javascript
const solveBFS = (start, isGoal, getNeighbours) => {
  const queue = [[start, 0]]; // [node, distance]
  const visited = new Set([start]);
  while (queue.length) {
    const [node, dist] = queue.shift();
    if (isGoal(node)) return dist;
    for (const neighbour of getNeighbours(node)) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([neighbour, dist + 1]);
      }
    }
  }
  return -1; // not reachable
};
```

**Signals:** "Shortest path", "minimum steps", grid problems ("minimum steps to reach exit"), "word ladder"

### Pattern 8 — Prefix Sums

**When to use:** Problems asking for the sum of a subarray in O(1) after O(n) preprocessing. Build an array where `prefix[i]` is the sum of all elements from index 0 to i. The sum of any subarray `[left, right]` is then `prefix[right] - prefix[left-1]`.

**Template:**
```javascript
const buildPrefix = arr => {
  const prefix = [0]; // prefix[0] = 0, prefix[i+1] = sum of arr[0..i]
  for (const num of arr) prefix.push(prefix.at(-1) + num);
  return prefix;
};

// Sum of subarray arr[left..right] in O(1)
const rangeSum = (prefix, left, right) => prefix[right + 1] - prefix[left];

// Example: count subarrays with sum equal to k (combines prefix sum + hash map)
const subarraySum = (nums, k) => {
  const prefix = new Map([[0, 1]]); // sum → count
  let count = 0, running = 0;
  for (const num of nums) {
    running += num;
    count += prefix.get(running - k) ?? 0;
    prefix.set(running, (prefix.get(running) ?? 0) + 1);
  }
  return count;
};
```

**Signals:** "Sum of subarray", "running total", "find subarray with sum X"

### Pattern 9 — Recursion and the Call Stack

**When to use:** Problems with a natural recursive structure — permutations, combinations, subsets, parsing nested structures. The key insight: define the base case(s) and the recursive case, and trust the recursion.

**Template:**
```javascript
// Backtracking template — build solution incrementally, undo on backtrack
const solve = (choices, current, results) => {
  if (isSolution(current)) {
    results.push([...current]); // snapshot current state
    return;
  }
  for (const choice of choices) {
    if (isValid(choice, current)) {
      current.push(choice);              // make choice
      solve(remainingChoices(choices, choice), current, results);
      current.pop();                     // undo choice (backtrack)
    }
  }
};

// Example: generate all permutations
const permutations = nums => {
  const result = [];
  const backtrack = (remaining, current) => {
    if (!remaining.length) { result.push([...current]); return; }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack([...remaining.slice(0, i), ...remaining.slice(i + 1)], current);
      current.pop();
    }
  };
  backtrack(nums, []);
  return result;
};
```

**Signals:** "Generate all...", "find all combinations/permutations/subsets", "N-Queens", "Sudoku solver"

### Pattern 10 — Dynamic Programming (Recognition)

**When to use:** Problems with overlapping subproblems and optimal substructure — where the solution to a larger problem can be built from solutions to smaller subproblems, and those smaller problems are solved multiple times in a naive approach.

For interviews, the key skill is *recognising* that a problem is DP and describing the approach, even if you cannot immediately write the optimal implementation from memory.

**Recognition signals:** "How many ways can you...", "minimum/maximum cost to...", "is it possible to...", and the brute force approach involves a recursion tree with repeated sub-calls.

**Template:**
```javascript
// Top-down (memoisation) — start from the original problem, cache sub-results
const memo = new Map();
const dp = (n, memo) => {
  if (n <= 1) return n; // base case
  if (memo.has(n)) return memo.get(n); // already solved
  const result = dp(n - 1, memo) + dp(n - 2, memo); // recursive case
  memo.set(n, result);
  return result;
};

// Bottom-up (tabulation) — build up from base cases
const dpBottomUp = n => {
  const table = new Array(n + 1).fill(0);
  table[1] = 1;
  for (let i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2];
  }
  return table[n];
};
```

**What to say in an interview:** "This looks like a dynamic programming problem because I can see overlapping subproblems — the same sub-calculation would be repeated in a brute-force recursion. I would approach this with memoisation: define the recursive relationship, identify the base cases, and cache results to avoid redundant computation."

---

## 20 Worked Problems

Each problem shows: the problem statement, the thought process, and the optimised JavaScript solution with complexity analysis. Problems are ordered roughly easy to medium.

---

### Problem 1 — Two Sum
**Difficulty:** Easy | **Pattern:** Hash Map

**Problem:** Given an array of integers `nums` and a target integer `target`, return the indices of the two numbers that add up to `target`. Assume exactly one solution exists.

**Thought process:** Brute force is a nested loop — for each element, search the rest of the array for its complement. That is O(n²). Can we do better? Yes: store each number in a Map as we go. For each new number, check if its complement (target - num) is already in the Map. One pass, O(n).

```javascript
const twoSum = (nums, target) => {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
};

// twoSum([2, 7, 11, 15], 9) → [0, 1]  (2 + 7 = 9)
// twoSum([3, 2, 4], 6)     → [1, 2]  (2 + 4 = 6)
```

**Complexity:** Time O(n) | Space O(n)

---

### Problem 2 — Valid Parentheses
**Difficulty:** Easy | **Pattern:** Stack

**Problem:** Given a string of brackets `()[]{}`, return true if the brackets are correctly opened and closed in the right order.

**Thought process:** We need to match each closing bracket to the most recent unmatched opening bracket. "Most recent" means stack — LIFO. Push opening brackets, pop on closing brackets and verify the match.

```javascript
const isValid = s => {
  const stack = [];
  const matching = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) {
      stack.push(ch);
    } else {
      if (stack.pop() !== matching[ch]) return false;
    }
  }
  return stack.length === 0;
};

// isValid("()[]{}") → true
// isValid("([)]")   → false
// isValid("{[]}")   → true
```

**Complexity:** Time O(n) | Space O(n)

---

### Problem 3 — Best Time to Buy and Sell Stock
**Difficulty:** Easy | **Pattern:** Sliding Window / Greedy

**Problem:** Given an array of stock prices where `prices[i]` is the price on day `i`, find the maximum profit from buying on one day and selling on a later day. Return 0 if no profit is possible.

**Thought process:** We want to maximise `prices[sell] - prices[buy]` where sell > buy. Track the minimum price seen so far as we iterate. For each day, the best profit we could make if we sold today is `price - minSoFar`. Keep track of the maximum such profit.

```javascript
const maxProfit = prices => {
  let minPrice = Infinity;
  let maxPro = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxPro = Math.max(maxPro, price - minPrice);
  }
  return maxPro;
};

// maxProfit([7, 1, 5, 3, 6, 4]) → 5  (buy at 1, sell at 6)
// maxProfit([7, 6, 4, 3, 1])    → 0  (prices only decrease)
```

**Complexity:** Time O(n) | Space O(1)

---

### Problem 4 — Contains Duplicate
**Difficulty:** Easy | **Pattern:** Set

**Problem:** Return true if any value appears at least twice in the array.

**Thought process:** We need to know if we have seen a value before. A Set provides O(1) membership testing. Add each element; if it is already in the Set, we have a duplicate.

```javascript
const containsDuplicate = nums => {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
};

// One-liner version:
const containsDuplicateShort = nums => new Set(nums).size !== nums.length;

// containsDuplicate([1, 2, 3, 1]) → true
// containsDuplicate([1, 2, 3, 4]) → false
```

**Complexity:** Time O(n) | Space O(n)

---

### Problem 5 — Maximum Subarray (Kadane's Algorithm)
**Difficulty:** Easy | **Pattern:** Dynamic Programming / Greedy

**Problem:** Find the contiguous subarray with the largest sum and return its sum.

**Thought process:** At each position, we decide: should we extend the previous subarray, or start a new one here? If the running sum becomes negative, it can only hurt any subarray that includes it — better to start fresh. This is Kadane's algorithm.

```javascript
const maxSubArray = nums => {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
};

// maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) → 6  (subarray [4,-1,2,1])
// maxSubArray([1])                               → 1
// maxSubArray([-1])                              → -1
```

**Complexity:** Time O(n) | Space O(1)

---

### Problem 6 — Climbing Stairs
**Difficulty:** Easy | **Pattern:** Dynamic Programming

**Problem:** You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?

**Thought process:** To reach step n, you must have come from step n-1 (one step) or step n-2 (two steps). So `ways(n) = ways(n-1) + ways(n-2)`. This is the Fibonacci sequence. Use bottom-up DP with O(1) space by only keeping the last two values.

```javascript
const climbStairs = n => {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev2 + prev1];
  }
  return prev1;
};

// climbStairs(2) → 2  (1+1 or 2)
// climbStairs(3) → 3  (1+1+1, 1+2, 2+1)
// climbStairs(5) → 8
```

**Complexity:** Time O(n) | Space O(1)

---

### Problem 7 — Reverse Linked List
**Difficulty:** Easy | **Pattern:** Linked List / Two Pointers

**Problem:** Reverse a singly linked list and return the new head.

**Thought process:** Walk the list, reversing each pointer as we go. Keep track of previous and current nodes. Save the next node before overwriting the pointer. When current becomes null, previous is the new head.

```javascript
const reverseList = head => {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next; // save next node
    curr.next = prev;       // reverse the pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }
  return prev; // prev is the new head
};

// 1 → 2 → 3 → 4 → 5  becomes  5 → 4 → 3 → 2 → 1
```

**Complexity:** Time O(n) | Space O(1)

---

### Problem 8 — Binary Search
**Difficulty:** Easy | **Pattern:** Binary Search

**Problem:** Given a sorted array of integers and a target, return the index of the target or -1 if not found.

**Thought process:** Compare the target to the middle element. If it matches, return. If the target is smaller, it must be in the left half. If larger, in the right half. Repeat with the relevant half.

```javascript
const search = (nums, target) => {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target)   left = mid + 1;
    else                       right = mid - 1;
  }
  return -1;
};

// search([-1, 0, 3, 5, 9, 12], 9) → 4
// search([-1, 0, 3, 5, 9, 12], 2) → -1
```

> 📝 **Note:** `left + Math.floor((right - left) / 2)` instead of `Math.floor((left + right) / 2)` avoids integer overflow — important in languages with fixed integer sizes. JavaScript numbers are 64-bit floats so overflow is not a practical concern here, but the pattern is worth knowing.

**Complexity:** Time O(log n) | Space O(1)

---

### Problem 9 — Linked List Cycle
**Difficulty:** Easy | **Pattern:** Fast and Slow Pointers

**Problem:** Given the head of a linked list, return true if there is a cycle.

**Thought process:** If there is a cycle, a fast pointer (moving 2 steps) will eventually lap a slow pointer (moving 1 step) and they will meet. If there is no cycle, the fast pointer reaches the end.

```javascript
const hasCycle = head => {
  let slow = head, fast = head;
  while (fast?.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
};
```

**Complexity:** Time O(n) | Space O(1)

---

### Problem 10 — Valid Anagram
**Difficulty:** Easy | **Pattern:** Hash Map / Frequency Count

**Problem:** Given two strings `s` and `t`, return true if `t` is an anagram of `s` (same characters, same frequency, possibly different order).

**Thought process:** Two strings are anagrams if and only if they have the same character frequencies. Count characters in s, subtract for t, check everything is zero.

```javascript
const isAnagram = (s, t) => {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    if (!count.get(ch)) return false;
    count.set(ch, count.get(ch) - 1);
  }
  return true;
};

// isAnagram("anagram", "nagaram") → true
// isAnagram("rat", "car")         → false
```

**Complexity:** Time O(n) | Space O(1) (bounded by alphabet size, constant)

---

### Problem 11 — Maximum Depth of Binary Tree
**Difficulty:** Easy | **Pattern:** DFS on Trees

**Problem:** Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to leaf).

**Thought process:** The depth of a tree is 1 (for the root) plus the maximum depth of its left and right subtrees. Base case: null node has depth 0. This maps perfectly to recursion.

```javascript
const maxDepth = root =>
  !root ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right));

// Also works iteratively with BFS — count levels
const maxDepthBFS = root => {
  if (!root) return 0;
  let depth = 0;
  const queue = [root];
  while (queue.length) {
    depth++;
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return depth;
};
```

**Complexity:** Time O(n) | Space O(h) where h is tree height (O(log n) balanced, O(n) worst)

---

### Problem 12 — Number of Islands
**Difficulty:** Medium | **Pattern:** BFS/DFS on Grid

**Problem:** Given a 2D grid of '1's (land) and '0's (water), count the number of islands (connected groups of '1's, connected horizontally or vertically).

**Thought process:** For each unvisited land cell, perform DFS/BFS to mark all connected land cells as visited (sink the island), then increment the count. The number of DFS/BFS calls we make equals the number of islands.

```javascript
const numIslands = grid => {
  let count = 0;
  const rows = grid.length, cols = grid[0].length;

  const dfs = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark as visited by sinking it
    dfs(r + 1, c); dfs(r - 1, c);
    dfs(r, c + 1); dfs(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { dfs(r, c); count++; }
    }
  }
  return count;
};

// [["1","1","0"],   → 2 islands
//  ["1","0","0"],
//  ["0","0","1"]]
```

**Complexity:** Time O(m × n) | Space O(m × n) worst case for recursion stack

---

### Problem 13 — 3Sum
**Difficulty:** Medium | **Pattern:** Two Pointers + Sorting

**Problem:** Given an array, find all unique triplets that sum to zero.

**Thought process:** Sort the array. For each element (the first of the triplet), use two pointers on the remaining sorted subarray to find pairs that sum to the negative of the first element. Skip duplicate values to avoid duplicate triplets.

```javascript
const threeSum = nums => {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicates
    if (nums[i] > 0) break; // sorted — nothing can sum to 0 now
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
};

// threeSum([-1, 0, 1, 2, -1, -4]) → [[-1,-1,2],[-1,0,1]]
```

**Complexity:** Time O(n²) | Space O(1) excluding output

---

### Problem 14 — Longest Substring Without Repeating Characters
**Difficulty:** Medium | **Pattern:** Sliding Window

**Problem:** Given a string, find the length of the longest substring without repeating characters.

**Thought process:** Sliding window. Expand the right boundary, adding characters to a Set. When a duplicate is found, shrink the left boundary until the duplicate is removed. Track the maximum window size seen.

```javascript
const lengthOfLongestSubstring = s => {
  const seen = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
};

// lengthOfLongestSubstring("abcabcbb") → 3  ("abc")
// lengthOfLongestSubstring("bbbbb")    → 1  ("b")
// lengthOfLongestSubstring("pwwkew")   → 3  ("wke")
```

**Complexity:** Time O(n) | Space O(min(m, n)) where m is alphabet size

---

### Problem 15 — Course Schedule (Cycle Detection)
**Difficulty:** Medium | **Pattern:** Graph DFS / Topological Sort

**Problem:** There are `n` courses. Some courses have prerequisites. Given a list of `[course, prerequisite]` pairs, return true if you can finish all courses (i.e., there is no circular dependency).

**Thought process:** Build a directed graph where an edge from A to B means "B must be taken before A". The problem reduces to: does this directed graph have a cycle? Detect cycles with DFS — track nodes in the current recursion path. If we revisit a node in the current path, there is a cycle.

```javascript
const canFinish = (numCourses, prerequisites) => {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) graph[course].push(prereq);

  // 0: unvisited, 1: in current path, 2: fully processed
  const state = new Array(numCourses).fill(0);

  const hasCycle = node => {
    if (state[node] === 1) return true;  // cycle!
    if (state[node] === 2) return false; // already processed, no cycle
    state[node] = 1; // mark as in current path
    for (const neighbour of graph[node]) {
      if (hasCycle(neighbour)) return true;
    }
    state[node] = 2; // mark as fully processed
    return false;
  };

  for (let i = 0; i < numCourses; i++) {
    if (hasCycle(i)) return false;
  }
  return true;
};

// canFinish(2, [[1,0]])        → true  (take 0, then 1)
// canFinish(2, [[1,0],[0,1]])  → false (circular dependency)
```

**Complexity:** Time O(V + E) | Space O(V + E)

---

### Problem 16 — Product of Array Except Self
**Difficulty:** Medium | **Pattern:** Prefix Products

**Problem:** Given an array, return an array where each element is the product of all elements except itself. Do not use division. O(n) time, O(1) extra space.

**Thought process:** For each position, we need the product of everything to the left and the product of everything to the right. We can compute these in two passes — left products left-to-right, right products right-to-left — accumulating into the output array directly.

```javascript
const productExceptSelf = nums => {
  const n = nums.length;
  const result = new Array(n).fill(1);

  // Pass 1: result[i] = product of all elements to the LEFT of i
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    result[i] = leftProduct;
    leftProduct *= nums[i];
  }

  // Pass 2: multiply each result[i] by product of all elements to the RIGHT
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return result;
};

// productExceptSelf([1,2,3,4]) → [24, 12, 8, 6]
// productExceptSelf([-1,1,0,-3,3]) → [0, 0, 9, 0, 0]
```

**Complexity:** Time O(n) | Space O(1) extra (output array not counted)

---

### Problem 17 — Find Minimum in Rotated Sorted Array
**Difficulty:** Medium | **Pattern:** Binary Search

**Problem:** A sorted array has been rotated at some pivot. Find the minimum element. O(log n) time required.

**Thought process:** The rotated array has two sorted halves. The minimum is at the boundary where a larger element is followed by a smaller one. Use binary search: if the middle element is greater than the right boundary, the minimum is in the right half. Otherwise it is in the left half (including mid).

```javascript
const findMin = nums => {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] > nums[right]) left = mid + 1; // min is in right half
    else right = mid;                              // min is in left half (including mid)
  }
  return nums[left];
};

// findMin([3,4,5,1,2]) → 1
// findMin([4,5,6,7,0,1,2]) → 0
// findMin([11,13,15,17]) → 11 (not rotated)
```

**Complexity:** Time O(log n) | Space O(1)

---

### Problem 18 — Merge Intervals
**Difficulty:** Medium | **Pattern:** Sorting + Greedy

**Problem:** Given a list of intervals, merge all overlapping intervals and return the result.

**Thought process:** Sort intervals by start time. Then walk through them — if the current interval overlaps with the last merged interval (its start ≤ last merged end), extend the last merged interval's end. Otherwise, the current interval starts a new non-overlapping group.

```javascript
const merge = intervals => {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (const [start, end] of intervals.slice(1)) {
    const lastMerged = merged.at(-1);
    if (start <= lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], end); // extend
    } else {
      merged.push([start, end]); // no overlap — new group
    }
  }
  return merged;
};

// merge([[1,3],[2,6],[8,10],[15,18]]) → [[1,6],[8,10],[15,18]]
// merge([[1,4],[4,5]])               → [[1,5]]
```

**Complexity:** Time O(n log n) | Space O(n)

---

### Problem 19 — Lowest Common Ancestor of a BST
**Difficulty:** Medium | **Pattern:** Tree / BST Properties

**Problem:** Given a BST and two nodes p and q, find their lowest common ancestor (the deepest node that has both p and q as descendants).

**Thought process:** Use the BST property. If both p and q are less than the current node, the LCA must be in the left subtree. If both are greater, in the right subtree. If they are on different sides (or one equals the current node), the current node is the LCA.

```javascript
const lowestCommonAncestor = (root, p, q) => {
  const curr = root;
  while (curr) {
    if (p.val < curr.val && q.val < curr.val) return lowestCommonAncestor(curr.left, p, q);
    if (p.val > curr.val && q.val > curr.val) return lowestCommonAncestor(curr.right, p, q);
    return curr; // nodes are on different sides — current is LCA
  }
};

// Iterative version (avoids recursion stack):
const lowestCommonAncestorIterative = (root, p, q) => {
  let curr = root;
  while (curr) {
    if (p.val < curr.val && q.val < curr.val) curr = curr.left;
    else if (p.val > curr.val && q.val > curr.val) curr = curr.right;
    else return curr;
  }
};
```

**Complexity:** Time O(h) where h is tree height | Space O(1) iterative

---

### Problem 20 — Coin Change
**Difficulty:** Medium | **Pattern:** Dynamic Programming

**Problem:** Given an array of coin denominations and an amount, find the minimum number of coins needed to make up that amount. Return -1 if it is not possible.

**Thought process:** Classic DP. `dp[i]` = minimum coins to make amount `i`. For each amount from 1 to target, try every coin — if `coin <= i`, then `dp[i] = min(dp[i], dp[i - coin] + 1)`. Build up from base case `dp[0] = 0`.

```javascript
const coinChange = (coins, amount) => {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // base case: 0 coins to make amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
};

// coinChange([1,2,5], 11) → 3  (5 + 5 + 1)
// coinChange([2], 3)      → -1 (impossible)
// coinChange([1], 0)      → 0
```

**Complexity:** Time O(amount × coins.length) | Space O(amount)

---

## Interview Strategy

### The Framework: Understand → Brute Force → Optimise → Code → Test

Most developers jump straight to coding. Interviewers want to see you think. Follow this framework every time, even if it feels slow.

**Understand (2–3 minutes):**
- Repeat the problem back in your own words
- Ask about edge cases: empty input, single element, negative numbers, very large input
- Ask about constraints: what is the maximum size of input? Is the array sorted?
- Clarify the output format

**Brute Force (2–3 minutes):**
- Describe the naive solution out loud, even if it is O(n²) or worse
- "The brute force approach would be to use a nested loop — for each element, check every other element. That would be O(n²) time."
- This shows you understand the problem and gives you a baseline

**Optimise (3–5 minutes):**
- Ask yourself: which pattern does this resemble? (Hash map? Two pointers? Sliding window?)
- "I can improve this to O(n) by using a hash map to store values I have seen."
- State your optimised complexity before writing code

**Code (10–15 minutes):**
- Write clean code, not clever code
- Use descriptive variable names (`leftPointer` not `l`)
- Talk through what you are doing as you write
- It is fine to look up exact syntax — "I need to check if a Map has a key... I believe it is `.has()`"

**Test (3–5 minutes):**
- Walk through your code with the given example input manually
- Then test an edge case: empty array, single element, all the same value
- "Let me trace through with input [1,1] to check the duplicate case..."

### What to Say When You Are Stuck

Being stuck is normal. How you handle being stuck is what interviewers evaluate.

**If you cannot see the pattern:**
"I am not immediately seeing the optimal approach. Let me think about what data structure would help here. The brute force uses a nested loop — can I replace the inner loop with an O(1) lookup using a hash map?"

**If you are mid-solution and get confused:**
"Let me pause and trace through a small example to make sure my logic is correct." (Then trace through it out loud. Often the error becomes obvious.)

**If you genuinely do not know:**
"I have not seen this exact problem type before. The brute force would be [describe it]. I believe there is a more efficient approach — would it be appropriate to think through the data structures that might apply here, or would you like me to implement the brute force first?"

Interviewers are almost always willing to give hints if you are engaged and thinking out loud. Going silent for 5 minutes and then producing a solution is worse than asking for a nudge in the right direction.

### What Interviewers Are Actually Evaluating

**Problem-solving approach:** Do you have a systematic process or do you thrash randomly?

**Communication:** Can you articulate your thinking? This is the most important skill — more important than getting the optimal solution.

**Code quality:** Is it readable? Do the variable names make sense? Is it structured sensibly?

**Complexity awareness:** Do you know the time and space complexity of your solution? Can you explain why?

**Handling feedback:** If the interviewer suggests a different approach, can you adapt? Resisting feedback is a red flag.

**Practical knowledge:** Do you know the built-in JavaScript APIs? Using `arr.reduce()` instead of a manual loop shows fluency. Using `Map` instead of an object where appropriate shows judgment.

### Practice Recommendations

**Before a specific interview:**
- Solve 2–3 problems per day for 1–2 weeks beforehand
- Do not grind 50 easy problems — do 20 problems deeply, understanding the pattern
- Practice talking out loud while you solve

**Platforms:**
- LeetCode — the standard. Filter to "Easy" and "Medium" in the patterns from Part 3
- NeetCode (neetcode.io) — curated list of 150 problems with video explanations, organised by pattern. Highly recommended starting point.
- Codewars — less algorithmic, more practical JavaScript puzzles

**In the week before:**
- Review Big O notation
- Solve one problem from each of the 10 patterns as a warm-up
- Read your solutions from 2 weeks ago — can you still explain them?

---

*End of Data Structures & Algorithms for JavaScript Developers*
