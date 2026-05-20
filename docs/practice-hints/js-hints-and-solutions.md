# JavaScript — Hints and Solutions

Read hints one at a time. Only look at the solution after a genuine attempt.

---

## JS-01: Closure Counter

### Hints

**Hint 1**
The inner variable holding the count is what gets "closed over." It lives
in the outer function's scope and persists between calls to increment,
decrement, and getCount.

**Hint 2**
Return an object literal with arrow functions that reference the
closed-over variable. The arrow functions do not receive the variable
as a parameter — they simply reach into the outer scope and use it.

**Hint 3**
Start your function like this:
```typescript
function makeCounter(start = 0): Counter {
  let count = start;
  return {
    // fill in the three methods here
  };
}
```

### Solution
```typescript
function makeCounter(start = 0): Counter {
  let count = start;
  return {
    increment: () => { count += 1; },
    decrement: () => { count -= 1; },
    getCount:  () => count,
  };
}
```

### Why This Works
Each call to `makeCounter` creates a new execution context with its own
`count` variable. The returned object's methods form a closure over that
specific `count`. When `counter1` and `counter2` are created, they each
close over their OWN count variable — they never share one.

### Stretch Goal Solution
```typescript
function makeCounter(start = 0, step = 1): Counter & { reset: () => void } {
  let count = start;
  return {
    increment: () => { count += step; },
    decrement: () => { count -= step; },
    getCount:  () => count,
    reset:     () => { count = start; },
  };
}
```

---

## JS-02: Promise Chain vs Async/Await

### Hints

**Hint 1**
After getting the user you need to fetch ALL posts concurrently, not
one after the other. Fetching them sequentially would work but would be
slower than necessary. Look up `Promise.all`.

**Hint 2**
`Promise.all` takes an array of promises and returns a single promise
that resolves to an array of results — in the same order as the input.

**Hint 3**
In the async/await version:
```typescript
const posts = await Promise.all(user.postIds.map(id => getPost(id)));
```
In the chain version, return the `Promise.all` call inside a `.then` block.

**Hint 4**
To extract just the titles from the resolved posts array use `.map`:
```typescript
return posts.map(post => post.title);
```

### Solution — Promise Chain
```typescript
function getUserPostTitlesChain(id: number): Promise<string[]> {
  return getUser(id)
    .then(user => Promise.all(user.postIds.map(postId => getPost(postId))))
    .then(posts => posts.map(post => post.title))
    .catch(err => {
      console.error('Error:', err.message);
      return [];
    });
}
```

### Solution — Async/Await
```typescript
async function getUserPostTitlesAsync(id: number): Promise<string[]> {
  try {
    const user = await getUser(id);
    const posts = await Promise.all(user.postIds.map(id => getPost(id)));
    return posts.map(post => post.title);
  } catch (err: unknown) {
    console.error('Error:', (err as Error).message);
    return [];
  }
}
```

### Why This Works
`Promise.all` fires all the `getPost` calls at the same time rather than
waiting for each one to finish before starting the next. For 3 posts each
taking 50ms, sequential would take 150ms — concurrent takes ~50ms.

### Key Insight
Use `Promise.all` when the requests are independent of each other.
Use sequential `await` only when one request depends on the result of
the previous one — like fetching the user before you know which posts to fetch.

### Stretch Goal Solution
```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

async function getUserPostTitlesWithTimeout(id: number): Promise<string[]> {
  try {
    const user = await getUser(id);
    const posts = await withTimeout(
      Promise.all(user.postIds.map(id => getPost(id))),
      500
    );
    return posts.map(post => post.title);
  } catch (err: unknown) {
    console.error('Error:', (err as Error).message);
    return [];
  }
}
```

---

## JS-03: Array Manipulation Without Mutation

### Hints

**Hint 1**
Chain your array methods: `filter` first to remove cancelled orders,
then `map` to apply the discount, then `sort` to order by total,
then a final `map` to pick only the fields you need.

**Hint 2**
`Array.sort` mutates the original array. Since you are working on
an already-filtered and mapped new array this is technically safe,
but to be explicit you can spread before sorting:
```typescript
[...filtered].sort((a, b) => b.total - a.total)
```

**Hint 3**
To apply a 10% discount only to orders over $100:
```typescript
total: order.total > 100 ? order.total * 0.9 : order.total
```

**Hint 4**
To return only specific fields use object destructuring in your map:
```typescript
.map(({ id, customerName, total }) => ({ id, customerName, total }))
```

### Solution
```typescript
function processOrders(orders: Order[]): OrderSummary[] {
  return [...orders]
    .filter(order => order.status !== 'cancelled')
    .map(order => ({
      ...order,
      total: order.total > 100 ? order.total * 0.9 : order.total,
    }))
    .sort((a, b) => b.total - a.total)
    .map(({ id, customerName, total }) => ({ id, customerName, total }));
}
```

### Why This Works
Each array method returns a NEW array without modifying the original.
The spread `[...orders]` before `.filter` is a safety measure — filter
already returns a new array but the spread makes the intent explicit.

### Stretch Goal Solution — Single Reduce
```typescript
function processOrdersReduce(orders: Order[]): OrderSummary[] {
  return orders
    .reduce<Order[]>((acc, order) => {
      if (order.status === 'cancelled') return acc;
      const discounted = order.total > 100
        ? { ...order, total: order.total * 0.9 }
        : order;
      const insertAt = acc.findIndex(o => o.total < discounted.total);
      if (insertAt === -1) return [...acc, discounted];
      return [
        ...acc.slice(0, insertAt),
        discounted,
        ...acc.slice(insertAt),
      ];
    }, [])
    .map(({ id, customerName, total }) => ({ id, customerName, total }));
}
```

Note: the chained filter/map/sort version is cleaner and more readable.
The reduce version is a useful mental exercise but not what you would
write in production.
