# TypeScript — Hints and Solutions

Read hints one at a time. Only look at the solution after a genuine attempt.

---

## TS-01: Generic Utility Function — groupBy

### Hints

**Hint 1**
The function needs two type parameters: `T` for the object type in the
array, and `K` which must be constrained to the keys of `T`. The
constraint syntax is `K extends keyof T`.

**Hint 2**
The function signature:
```typescript
function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>
```

**Hint 3**
Use `reduce` to build the result object. For each item, read the value
at `item[key]`, convert it to a string for use as the object key, and
push the item into the matching array.

**Hint 4**
Inside your reduce:
```typescript
const groupKey = String(item[key]);
if (!acc[groupKey]) acc[groupKey] = [];
acc[groupKey].push(item);
```

### Solution
```typescript
function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}
```

### Why This Works
`K extends keyof T` constrains the `key` parameter so TypeScript will
only accept valid keys of whatever object type is passed in. You cannot
accidentally pass a key that does not exist on the object — TypeScript
catches it at compile time rather than runtime.

### Stretch Goal Solution — Precise Return Type
```typescript
function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}
```
Making the return type fully precise (keyed by `T[K]`) requires
template literal types and is complex enough that `Record<string, T[]>`
is the pragmatic production choice.

---

## TS-02: Utility Types in Practice

### Hints

**Hint 1**
- `Omit<T, K>` removes fields K from type T
- `Pick<T, K>` keeps only fields K from type T
- `Partial<T>` makes all fields optional
- `Required<T>` makes all fields required
- `Readonly<T>` makes all fields read-only
- `Record<K, V>` creates an object type with keys K and values V

**Hint 2**
For `UserUpdate` where everything is optional EXCEPT id, combine
`Partial` and `Required` using an intersection type (`&`).

**Hint 3**
For `RolePermissions`, the keys should be the union of role values
and the values should be `string[]`.

### Solution
```typescript
// 1. PublicUser — remove sensitive and system fields
type PublicUser = Omit<User, 'password' | 'id' | 'createdAt' | 'updatedAt'>;

// 2. UserUpdate — all optional except id
type UserUpdate = Partial<User> & Required<Pick<User, 'id'>>;

// 3. PostSummary — only id, title, published
type PostSummary = Pick<Post, 'id' | 'title' | 'published'>;

// 4. ReadonlyPost — no fields can be mutated
type ReadonlyPost = Readonly<Post>;

// 5. RolePermissions — each role maps to allowed actions
type RolePermissions = Record<User['role'], string[]>;
```

### Why This Works
Utility types derive new types from existing ones without rewriting
interface definitions. If the base `User` interface changes, all
derived types update automatically — no manual syncing required.

### Stretch Goal Solution
```typescript
type RequireOnly<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

// Usage:
type UserUpdate = RequireOnly<User, 'id'>;
type PostPublish = RequireOnly<Post, 'id' | 'published'>;
```

---

## TS-03: Discriminated Unions

### Hints

**Hint 1**
Add a `type` literal field to each payment interface. This is the
"discriminant" — the field TypeScript uses to narrow the union:
```typescript
interface CreditCard {
  type: 'credit_card';
  // ... other fields
}
```

**Hint 2**
Create a union type that combines all three payment types:
```typescript
type Payment = CreditCard | BankTransfer | Crypto;
```

**Hint 3**
Use a `switch` statement on `payment.type` in `processPayment`.
Inside each `case`, TypeScript automatically narrows the type so you
get full autocomplete and type safety for that payment type's unique fields.

**Hint 4**
For exhaustiveness checking, add a `default` case that assigns to `never`:
```typescript
default:
  const exhaustiveCheck: never = payment;
  throw new Error(`Unhandled payment type: ${exhaustiveCheck}`);
```
If you add a new payment type later and forget to handle it,
TypeScript will show a compile error here.

### Solution
```typescript
interface BasePayment {
  id: string;
  amount: number;
  status: 'pending' | 'complete' | 'failed';
}

interface CreditCard extends BasePayment {
  type: 'credit_card';
  cardLastFour: string;
  expiryMonth: number;
  expiryYear: number;
}

interface BankTransfer extends BasePayment {
  type: 'bank_transfer';
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

interface Crypto extends BasePayment {
  type: 'crypto';
  walletAddress: string;
  currency: 'BTC' | 'ETH' | 'USDC';
}

type Payment = CreditCard | BankTransfer | Crypto;

function processPayment(payment: Payment): string {
  switch (payment.type) {
    case 'credit_card':
      return `Charging card ending in ${payment.cardLastFour} for $${payment.amount}`;
    case 'bank_transfer':
      return `Transferring $${payment.amount} via ${payment.bankName}`;
    case 'crypto':
      return `Sending ${payment.amount} ${payment.currency} to ${payment.walletAddress}`;
    default:
      const exhaustiveCheck: never = payment;
      throw new Error(`Unhandled payment type: ${exhaustiveCheck}`);
  }
}
```

### Why This Works
The `type` field on each interface acts as a tag that TypeScript uses
to narrow the union inside the switch. Inside `case 'credit_card'`,
TypeScript knows the payment is a `CreditCard` and gives you access to
`cardLastFour`, `expiryMonth`, etc. — without any casting.

The `never` assignment in the default case is the exhaustiveness trick.
`never` means "this code should be unreachable." If a new payment type
is added to the union but not to the switch, TypeScript will error
because the new type cannot be assigned to `never`.
