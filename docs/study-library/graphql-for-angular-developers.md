# GraphQL for Angular Developers
### A Comprehensive Guide from Foundations to Interview Preparation

> **Written for Angular developers who need to understand GraphQL for interviews and production use.**
> Core Concepts · Schema Design · Queries & Mutations · Apollo Client · Angular Integration · Performance · Interview Prep

> 📝 **Navigation:** Notion users — add a `/Table of Contents` block below this line. GitHub users — use the **☰** icon at the top-right of this file.

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Why GraphQL Exists: The Problems It Solves](#why-graphql-exists-the-problems-it-solves)
  - [The REST API Problems GraphQL Was Designed to Fix](#the-rest-api-problems-graphql-was-designed-to-fix)
  - [The GraphQL Solution — Ask for Exactly What You Need](#the-graphql-solution--ask-for-exactly-what-you-need)
  - [GraphQL vs REST — When to Use Each](#graphql-vs-rest--when-to-use-each)
- [Core GraphQL Concepts](#core-graphql-concepts)
  - [The Schema — The Contract Between Client and Server](#the-schema--the-contract-between-client-and-server)
  - [Queries — Reading Data](#queries--reading-data)
  - [Mutations — Writing Data](#mutations--writing-data)
  - [Fragments — Reusing Field Selections](#fragments--reusing-field-selections)
  - [Subscriptions — Real-Time Data](#subscriptions--real-time-data)
  - [Directives — Conditional Fields](#directives--conditional-fields)
- [The GraphQL Server Side](#the-graphql-server-side)
  - [Resolvers — How Fields Get Their Values](#resolvers--how-fields-get-their-values)
  - [Introspection — Self-Documenting APIs](#introspection--self-documenting-apis)
  - [Error Handling in GraphQL](#error-handling-in-graphql)
- [Apollo Client for Angular](#apollo-client-for-angular)
  - [Setup](#setup)
  - [Defining Queries with gql](#defining-queries-with-gql)
  - [Generating TypeScript Types from the Schema](#generating-typescript-types-from-the-schema)
  - [Using Apollo Client in Angular Services](#using-apollo-client-in-angular-services)
  - [Apollo's InMemoryCache — How Caching Works](#apollos-inmemorycache--how-caching-works)
  - [Handling Loading and Error States](#handling-loading-and-error-states)
  - [Subscriptions with Apollo Angular](#subscriptions-with-apollo-angular)
- [Advanced GraphQL Patterns](#advanced-graphql-patterns)
  - [Fragments and Code Generation Best Practices](#fragments-and-code-generation-best-practices)
  - [Optimistic Updates](#optimistic-updates)
  - [Pagination Patterns](#pagination-patterns)
  - [Error Handling Patterns](#error-handling-patterns)
  - [Authentication — Adding Headers](#authentication--adding-headers)
- [Performance Considerations](#performance-considerations)
  - [Why GraphQL Queries Can Be Slow](#why-graphql-queries-can-be-slow)
  - [Persisted Queries](#persisted-queries)
  - [Caching Strategy for Performance](#caching-strategy-for-performance)
- [GraphQL vs REST — The Comparison Interviewers Expect](#graphql-vs-rest--the-comparison-interviewers-expect)
  - [Side-by-Side Comparison](#side-by-side-comparison)
  - [API Versioning — How GraphQL Handles It](#api-versioning--how-graphql-handles-it)
- [Interview Preparation](#interview-preparation)
  - [How to Frame Your GraphQL Knowledge](#how-to-frame-your-graphql-knowledge)
  - [Common Interview Questions](#common-interview-questions)
  - ["What is GraphQL and why would you use it over REST?"](#what-is-graphql-and-why-would-you-use-it-over-rest)
  - ["Explain the difference between a Query and a Mutation."](#explain-the-difference-between-a-query-and-a-mutation)
  - ["What is the N+1 problem in GraphQL and how is it solved?"](#what-is-the-n1-problem-in-graphql-and-how-is-it-solved)
  - ["How does Apollo Client cache work?"](#how-does-apollo-client-cache-work)
  - ["What are GraphQL fragments and why do they matter?"](#what-are-graphql-fragments-and-why-do-they-matter)
  - ["How do you handle authentication in GraphQL with Angular?"](#how-do-you-handle-authentication-in-graphql-with-angular)
  - ["What are the performance trade-offs of GraphQL?"](#what-are-the-performance-trade-offs-of-graphql)
  - ["How would you migrate from REST to GraphQL in an Angular application?"](#how-would-you-migrate-from-rest-to-graphql-in-an-angular-application)


## Introduction

GraphQL is a query language for APIs and a runtime for executing those queries. It was developed internally at Facebook in 2012 and open-sourced in 2015. Today it is used by Twitter, GitHub, Shopify, Netflix, Airbnb, and thousands of other companies as either their primary or secondary API layer.

Understanding GraphQL is increasingly expected of senior Angular developers. It appears in job postings both as a required skill ("experience with GraphQL APIs") and as a differentiator ("bonus: GraphQL"). More importantly, many companies that list Angular are using GraphQL as their API layer — so even if you build purely Angular front-end features, you will be writing GraphQL queries and working with the GraphQL client layer daily.

This guide teaches GraphQL from the perspective of an Angular developer who already knows REST deeply. Every concept is grounded in what you already understand — the REST equivalent, why GraphQL solves it differently, and what the trade-offs are.

---

## Why GraphQL Exists: The Problems It Solves

### The REST API Problems GraphQL Was Designed to Fix

REST has served the web well for decades, but it has two structural problems that become painful at scale and with complex UIs: over-fetching and under-fetching.

**Over-fetching** is receiving more data than you need. A REST endpoint for a user profile (`GET /api/users/123`) returns the complete user object — id, name, email, role, address, preferences, account settings, audit timestamps — even when you only need the name and avatar to display in a navbar. That extra data costs bandwidth, parsing time, and memory on both server and client.

**Under-fetching** is receiving less data than you need, requiring multiple requests to compose a complete view. A product detail page might need: the product (`GET /api/products/456`), the product's reviews (`GET /api/products/456/reviews`), the product's related items (`GET /api/products/456/related`), and the current user's wish list (`GET /api/users/123/wishlist`) to check if this product is saved. Four requests, four roundtrips, four waiting periods — potentially cascading if each request depends on data from the previous one.

Facebook built GraphQL to solve both problems at once. Their mobile apps had to work over slow mobile connections in developing markets where bandwidth was expensive. Fetching unnecessary data and making multiple sequential requests were real costs with real consequences for real users.

### The GraphQL Solution — Ask for Exactly What You Need

GraphQL gives the client control over exactly what data is returned. Instead of the server defining the response shape (as in REST), the client specifies precisely which fields it needs in a query, and the server returns exactly that — nothing more, nothing less.

```graphql
# REST: GET /api/users/123 — returns everything, you use three fields
# GraphQL: ask for exactly what you need
query {
  user(id: "123") {
    name
    avatarUrl
    role
  }
}

# Response — only what was requested
{
  "data": {
    "user": {
      "name": "Alice Smith",
      "avatarUrl": "https://cdn.example.com/avatars/alice.jpg",
      "role": "admin"
    }
  }
}
```

A single GraphQL request can also fetch data that would require multiple REST requests, by traversing relationships in the query:

```graphql
# One GraphQL request replaces four REST requests
query ProductPage($productId: ID!, $userId: ID!) {
  product(id: $productId) {
    name
    price
    description
    images { url altText }
    reviews {
      rating
      comment
      author { name avatarUrl }
    }
    relatedProducts {
      id
      name
      price
      thumbnailUrl
    }
  }
  user(id: $userId) {
    wishlist { productId }
  }
}
```

### GraphQL vs REST — When to Use Each

GraphQL is not a universal replacement for REST. Both have appropriate use cases, and many production systems use both:

**GraphQL is the better choice when:**
- The UI is complex with many different views requiring different data shapes from the same entities
- You have multiple clients (web, iOS, Android, partner APIs) with different data needs
- Your data is highly relational — products with reviews with authors with followers — and clients frequently need to traverse those relationships
- You want to reduce the number of network requests on mobile clients
- You want a strongly typed, self-documenting API contract enforced at the language level

**REST is the better choice when:**
- The API is simple CRUD over a few resources
- You need HTTP caching (GraphQL POST requests are not cacheable by default)
- You are dealing with file uploads or binary data (REST handles these naturally)
- Your clients are simple and their data needs are predictable and uniform
- The team is unfamiliar with GraphQL and the learning curve is not justified

**Using both:** Many production systems use GraphQL for their primary data-fetching API (where the flexibility matters) and REST for specific endpoints: file upload, webhooks, payment processing callbacks, and simple utility endpoints where REST's simplicity wins.

---

## Core GraphQL Concepts

### The Schema — The Contract Between Client and Server

In REST, the API contract is documented (OpenAPI/Swagger) but not enforced at runtime. GraphQL has a type system built in — the schema is the contract, and it is enforced by the GraphQL server. Every operation the client can perform, every type of data that exists, and every relationship between types is defined in the schema using the Schema Definition Language (SDL).

```graphql
# Schema Definition Language (SDL)

# Scalar types — the leaves of the type system
# Built-in: String, Int, Float, Boolean, ID
# Custom: Date, DateTime, JSON, UUID

# Object type — a structured type with fields
type User {
  id:         ID!           # ! means non-nullable (required)
  name:       String!
  email:      String!
  role:       UserRole!     # enum type
  active:     Boolean!
  createdAt:  DateTime!
  orders:     [Order!]!     # list of non-nullable Orders, list itself non-nullable
  department: Department    # nullable — user may not have a department
}

# Enum type — a fixed set of values
enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}

type Order {
  id:         ID!
  total:      Float!
  status:     OrderStatus!
  createdAt:  DateTime!
  user:       User!
  items:      [OrderItem!]!
}

enum OrderStatus {
  PENDING
  COMPLETED
  CANCELLED
}

type OrderItem {
  id:       ID!
  quantity: Int!
  price:    Float!
  product:  Product!
}

type Product {
  id:          ID!
  name:        String!
  price:       Float!
  description: String
  category:    Category!
}

type Category {
  id:       ID!
  name:     String!
  products: [Product!]!
}

# Input type — used for arguments (mutations and queries with complex arguments)
# Separate from output types — a key GraphQL convention
input CreateUserInput {
  name:  String!
  email: String!
  role:  UserRole! = VIEWER  # default value
}

input UpdateUserInput {
  name:  String   # all fields optional in update inputs
  email: String
  role:  UserRole
}

# The three root types — entry points into the API
type Query {
  # Read operations
  user(id: ID!):              User
  users(
    role:    UserRole
    active:  Boolean
    limit:   Int    = 20      # default value
    offset:  Int    = 0
  ):                          [User!]!
  me:                         User    # current authenticated user
}

type Mutation {
  # Write operations
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!):                  Boolean!
  deactivateUser(id: ID!):              User!
}

type Subscription {
  # Real-time operations
  orderStatusChanged(orderId: ID!): Order!
  newOrder:                         Order!
}
```

**Non-null (`!`) in the schema** is one of the most important things to understand. A field without `!` can return null — the client must handle that. A field with `!` is guaranteed never to return null — if the server returns null for a non-null field, GraphQL treats it as an error. `[Order!]!` means: the list itself will not be null, and each item in the list will not be null.

### Queries — Reading Data

A GraphQL query is a read operation — equivalent to GET in REST. Queries are idempotent (safe to repeat) and should not modify data.

```graphql
# Simple query — get a single user
query GetUser {
  user(id: "123") {
    id
    name
    email
    role
  }
}

# Query with variables — the standard way to pass dynamic values
# Variables are type-checked against the schema
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    role
  }
}
# Variables passed separately: { "id": "123" }

# Query with nested fields — traverse relationships in one request
query GetUserWithOrders($id: ID!) {
  user(id: $id) {
    name
    email
    orders {
      id
      total
      status
      items {
        quantity
        price
        product {
          name
        }
      }
    }
  }
}

# Query multiple root fields — fetch different data in one request
query DashboardData($userId: ID!) {
  me {
    name
    role
  }
  users(active: true, limit: 10) {
    id
    name
    email
  }
  recentOrders: orders(limit: 5, status: PENDING) {  # field alias
    id
    total
    createdAt
  }
}
```

**Field aliases** let you rename a field in the response or query the same field twice with different arguments:

```graphql
query CompareUsers {
  alice: user(id: "1") { name email }
  bob:   user(id: "2") { name email }
}
# Response: { "alice": {...}, "bob": {...} }
```

### Mutations — Writing Data

A mutation is a write operation — equivalent to POST, PUT, PATCH, DELETE in REST. By convention, mutations can return data so the client does not need a separate query after a write.

```graphql
# Create a user and return the created user
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    role
    createdAt
  }
}
# Variables: { "input": { "name": "Alice", "email": "alice@example.com", "role": "ADMIN" } }

# Update — partial update, return the updated user
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    role
    updatedAt
  }
}

# Delete — return success boolean
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}

# Multiple mutations in one document — executed sequentially (not in parallel)
mutation OnboardUser($createInput: CreateUserInput!, $orderId: ID!) {
  newUser: createUser(input: $createInput) {
    id
    name
  }
  assignOrder: updateOrder(id: $orderId, userId: $newUser.id) {
    id
    status
  }
}
```

### Fragments — Reusing Field Selections

Fragments are reusable pieces of a query. They help keep queries DRY when the same field selection appears in multiple places.

```graphql
# Define a fragment
fragment UserBasicInfo on User {
  id
  name
  email
  role
}

fragment OrderSummary on Order {
  id
  total
  status
  createdAt
}

# Use fragments in queries
query GetUsersWithOrders {
  users {
    ...UserBasicInfo       # spread the fragment
    orders {
      ...OrderSummary
    }
  }
}

query GetUser($id: ID!) {
  user(id: $id) {
    ...UserBasicInfo
    active
    createdAt
    orders {
      ...OrderSummary
      items {
        quantity
        product { name price }
      }
    }
  }
}
```

### Subscriptions — Real-Time Data

Subscriptions establish a persistent connection (typically via WebSocket) and the server pushes data to the client when events occur. Equivalent to WebSocket listeners or Server-Sent Events in REST.

```graphql
# Subscribe to real-time order status updates
subscription OrderUpdates($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) {
    id
    status
    updatedAt
  }
}

# Subscribe to all new orders (for an admin dashboard)
subscription NewOrders {
  newOrder {
    id
    total
    status
    user {
      name
    }
  }
}
```

### Directives — Conditional Fields

Directives allow conditional field inclusion in queries:

```graphql
query GetUser($id: ID!, $includeOrders: Boolean!, $preview: Boolean = false) {
  user(id: $id) {
    name
    email
    # Only include orders if $includeOrders is true
    orders @include(if: $includeOrders) {
      id
      total
    }
    # Only include sensitive fields if NOT in preview mode
    phone @skip(if: $preview)
    address @skip(if: $preview)
  }
}
```

---

## The GraphQL Server Side

Understanding how the server works is important even as a front-end developer — it helps you understand why queries behave as they do, what causes performance problems, and how to communicate with back-end engineers.

### Resolvers — How Fields Get Their Values

On the server, every field in the schema has a resolver — a function that returns the value for that field. The GraphQL server calls resolvers for each field requested in the query.

```javascript
// Server-side resolvers (Node.js/TypeScript example)
const resolvers = {
  Query: {
    // Resolver for the 'user' query field
    user: async (parent, args, context) => {
      // args = { id: "123" }
      // context = { user: authenticatedUser, db: databaseConnection }
      return context.db.users.findById(args.id);
    },

    users: async (parent, args, context) => {
      // args = { role: "admin", active: true, limit: 20, offset: 0 }
      return context.db.users.findAll(args);
    },
  },

  Mutation: {
    createUser: async (parent, args, context) => {
      return context.db.users.create(args.input);
    },
  },

  // Object type resolvers — how to resolve fields on a type
  User: {
    // The 'orders' field on User requires fetching related data
    orders: async (parent, args, context) => {
      // parent = the User object returned by the parent resolver
      return context.db.orders.findByUserId(parent.id);
    },
  },
};
```

**The N+1 problem in GraphQL:** When resolvers are naively implemented, querying a list of users and their orders triggers the orders resolver once per user — the N+1 problem you know from JPA. The standard solution is the **DataLoader** pattern — it batches all the user IDs from a query and makes a single database call: `SELECT * FROM orders WHERE user_id IN (1, 2, 3, 4, 5)`. This is handled by the DataLoader library and is implemented on the server side, invisible to the client.

### Introspection — Self-Documenting APIs

A GraphQL schema can be introspected — the client can query the schema itself to discover what types and operations are available. This is what powers GraphQL development tools like GraphiQL (the in-browser IDE), Apollo Studio, and the IDE plugins that give you autocompletion when writing queries.

```graphql
# Introspection query — asking the API about itself
{
  __schema {
    types {
      name
      kind
      fields {
        name
        type { name }
      }
    }
  }
}
```

In production, introspection is sometimes disabled for security — it reveals the full API surface. But in development environments it is almost always enabled.

### Error Handling in GraphQL

GraphQL always returns HTTP 200, even for errors. Errors are communicated in the response body. This is fundamentally different from REST, where HTTP status codes indicate error categories.

```json
{
  "data": {
    "user": null
  },
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "statusCode": 404
      }
    }
  ]
}
```

Partial success is possible — some fields succeed and some fail in the same response:

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "orders": null     // this field failed
    }
  },
  "errors": [
    {
      "message": "Orders service unavailable",
      "path": ["user", "orders"],
      "extensions": { "code": "SERVICE_UNAVAILABLE" }
    }
  ]
}
```

This partial success model is both powerful (some data is better than none) and complex (your client must handle the case where `data` and `errors` both have content).

---

## Apollo Client for Angular

Apollo Client is the dominant GraphQL client library and the standard choice for Angular applications. It manages: executing queries and mutations, caching responses, normalising data, handling loading and error states, and integrating with real-time subscriptions.

### Setup

```bash
npm install @apollo/client graphql apollo-angular
```

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache, ApolloClient } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideApollo((httpLink: HttpLink) => ({
      link: httpLink.create({ uri: 'https://api.example.com/graphql' }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',  // return cached data then update from network
        },
        query: {
          fetchPolicy: 'network-only',  // always fetch fresh
          errorPolicy: 'all',           // return partial data alongside errors
        },
      },
    })),
  ],
};
```

### Defining Queries with gql

Queries are defined using the `gql` template literal tag. By convention, they are defined as constants in a separate file or at the top of the component file.

```typescript
// users.queries.ts
import { gql } from '@apollo/client/core';

export const GET_USERS = gql`
  query GetUsers($role: UserRole, $active: Boolean) {
    users(role: $role, active: $active) {
      id
      name
      email
      role
      active
      createdAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      active
      orders {
        id
        total
        status
        createdAt
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
    }
  }
`;
```

### Generating TypeScript Types from the Schema

One of GraphQL's most powerful features for Angular developers is automatic TypeScript type generation. The schema is strongly typed, and tools can generate TypeScript interfaces from it — eliminating manual type definitions and keeping client types in sync with the server schema.

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations @graphql-codegen/typescript-apollo-angular
```

```yaml
# codegen.yml
schema: https://api.example.com/graphql   # or path to local schema file
documents: src/**/*.graphql               # or inline gql`` calls in .ts files
generates:
  src/app/graphql/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular
    config:
      addExplicitOverride: true
```

```bash
npx graphql-codegen
```

This generates:
- TypeScript interfaces for all schema types (`User`, `Order`, `Product`, etc.)
- TypeScript interfaces for query/mutation variables and responses
- Angular services for each query and mutation — ready to inject

```typescript
// Generated code (do not edit — regenerate from schema)
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  orders: Order[];
}

export interface GetUsersQuery {
  users: User[];
}

export interface GetUsersQueryVariables {
  role?: UserRole | null;
  active?: boolean | null;
}

// Generated Angular service for GetUsers query
@Injectable({ providedIn: 'root' })
export class GetUsersGQL extends Query<GetUsersQuery, GetUsersQueryVariables> {
  document = GET_USERS;
}
```

### Using Apollo Client in Angular Services

The recommended pattern: wrap Apollo operations in Angular services rather than using Apollo directly in components.

```typescript
// users.service.ts
import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GET_USERS, GET_USER, CREATE_USER, UPDATE_USER } from './users.queries';
import type {
  GetUsersQuery, GetUsersQueryVariables,
  GetUserQuery,
  CreateUserMutation, CreateUserMutationVariables,
} from './graphql/generated';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apollo = inject(Apollo);

  getUsers(variables?: GetUsersQueryVariables): Observable<User[]> {
    return this.apollo.watchQuery<GetUsersQuery, GetUsersQueryVariables>({
      query: GET_USERS,
      variables,
    }).valueChanges.pipe(
      map(result => result.data.users),
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => err);
      })
    );
  }

  getUser(id: string): Observable<User> {
    return this.apollo.query<GetUserQuery>({
      query: GET_USER,
      variables: { id },
    }).pipe(
      map(result => result.data.user!),
      catchError(err => throwError(() => err))
    );
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.apollo.mutate<CreateUserMutation, CreateUserMutationVariables>({
      mutation: CREATE_USER,
      variables: { input },
      // Update cache after mutation
      update: (cache, { data }) => {
        const existing = cache.readQuery<GetUsersQuery>({ query: GET_USERS });
        if (existing && data?.createUser) {
          cache.writeQuery({
            query: GET_USERS,
            data: {
              users: [...existing.users, data.createUser],
            },
          });
        }
      },
    }).pipe(
      map(result => result.data!.createUser),
    );
  }

  updateUser(id: string, input: UpdateUserInput): Observable<User> {
    return this.apollo.mutate({
      mutation: UPDATE_USER,
      variables: { id, input },
      // Apollo automatically updates cache for existing objects by ID
      // if the mutation returns the same type with the same ID
    }).pipe(
      map(result => (result.data as any).updateUser),
    );
  }
}
```

### Apollo's InMemoryCache — How Caching Works

Apollo Client caches query results in a normalised in-memory store. "Normalised" means each object is stored once by its ID, not duplicated per query. When a mutation updates a `User` with `id: "123"`, every query that returned that user automatically reflects the update.

```typescript
// Cache configuration
new InMemoryCache({
  // Tell Apollo which field is the unique identifier for each type
  typePolicies: {
    User: {
      keyFields: ['id'],  // default — Apollo uses id or _id automatically
    },
    Product: {
      keyFields: ['id'],
    },
    // For types without IDs, merge behaviour can be configured
    Query: {
      fields: {
        users: {
          // Merge function for paginated results
          keyArgs: ['role', 'active'],  // cache separately per these args
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
})
```

**Fetch policies** control how Apollo uses the cache:

| Policy | Behaviour |
|---|---|
| `cache-first` | Return cached data if available, otherwise fetch. Never fetches if cache hit. |
| `cache-and-network` | Return cached data immediately, then fetch from network and update. |
| `network-only` | Always fetch from network, update cache with result. |
| `no-cache` | Always fetch, do not cache the result. |
| `cache-only` | Only read from cache, never fetch. Error if not cached. |

### Handling Loading and Error States

```typescript
// In a component
@Component({
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (error()) {
      <app-error [message]="error()!.message" />
    } @else {
      @for (user of users(); track user.id) {
        <app-user-card [user]="user" />
      }
    }
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  users    = signal<User[]>([]);
  loading  = signal(true);
  error    = signal<Error | null>(null);

  ngOnInit() {
    this.userService.getUsers({ active: true })
      .subscribe({
        next:  users => { this.users.set(users); this.loading.set(false); },
        error: err   => { this.error.set(err); this.loading.set(false); },
      });
  }
}
```

### Subscriptions with Apollo Angular

```typescript
// setup — install WebSocket link
npm install @apollo/client subscriptions-transport-ws

// apollo configuration with split link
import { split } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new WebSocketLink({
  uri: 'wss://api.example.com/graphql',
  options: { reconnect: true },
});

// Use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink.create({ uri: 'https://api.example.com/graphql' }),
);

// Using a subscription in a service
const ORDER_STATUS_SUBSCRIPTION = gql`
  subscription OrderStatusChanged($orderId: ID!) {
    orderStatusChanged(orderId: $orderId) {
      id
      status
      updatedAt
    }
  }
`;

watchOrderStatus(orderId: string): Observable<Order> {
  return this.apollo.subscribe({
    query: ORDER_STATUS_SUBSCRIPTION,
    variables: { orderId },
  }).pipe(
    map(result => result.data.orderStatusChanged)
  );
}
```

---

## Advanced GraphQL Patterns

### Fragments and Code Generation Best Practices

In large applications, defining fragments once and reusing them across queries keeps your code DRY and ensures consistency:

```graphql
# fragments.graphql — shared fragments
fragment UserFragment on User {
  id
  name
  email
  role
  active
}

fragment OrderFragment on Order {
  id
  total
  status
  createdAt
}

fragment OrderWithItemsFragment on Order {
  ...OrderFragment
  items {
    quantity
    price
    product { name thumbnailUrl }
  }
}

# users.graphql — uses shared fragments
query GetUsers($role: UserRole) {
  users(role: $role) {
    ...UserFragment
  }
}

query GetUserWithOrders($id: ID!) {
  user(id: $id) {
    ...UserFragment
    orders {
      ...OrderWithItemsFragment
    }
  }
}
```

When using code generation, define operations in separate `.graphql` files and generate TypeScript types from them. This gives you:
- Type-safe variables and responses for every operation
- IDE autocompletion for field names
- Compile-time errors when you reference a non-existent field
- Automatic updates when the schema changes

### Optimistic Updates

Optimistic updates update the UI immediately before the server responds, then reconcile when the response arrives. This makes mutations feel instant.

```typescript
updateUserRole(userId: string, newRole: UserRole): Observable<User> {
  return this.apollo.mutate({
    mutation: UPDATE_USER_ROLE,
    variables: { id: userId, role: newRole },
    // Optimistically update the cache immediately
    optimisticResponse: {
      updateUser: {
        __typename: 'User',  // Apollo needs the type
        id: userId,
        role: newRole,
      }
    },
  }).pipe(
    map(result => result.data!.updateUser),
    catchError(err => {
      // Apollo automatically reverts the optimistic update on error
      return throwError(() => err);
    })
  );
}
```

### Pagination Patterns

GraphQL supports several pagination approaches. The two most common:

**Offset pagination** — equivalent to SQL LIMIT/OFFSET:

```graphql
query GetUsers($offset: Int, $limit: Int) {
  users(offset: $offset, limit: $limit) {
    id
    name
  }
}
```

**Cursor-based pagination** (Relay specification) — more robust, handles data changes between pages:

```graphql
query GetUsers($first: Int, $after: String) {
  usersConnection(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        name
        email
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

```typescript
// Cursor pagination in a service
getUsers(first: number, after?: string): Observable<UsersConnection> {
  return this.apollo.query<GetUsersConnectionQuery>({
    query: GET_USERS_CONNECTION,
    variables: { first, after },
  }).pipe(
    map(result => result.data.usersConnection)
  );
}

// Loading more (infinite scroll)
loadMoreUsers(after: string): void {
  this.apollo.query<GetUsersConnectionQuery>({
    query: GET_USERS_CONNECTION,
    variables: { first: 20, after },
    fetchPolicy: 'network-only',
  }).subscribe(({ data }) => {
    // Merge with existing data
    this.users.update(existing => [
      ...existing,
      ...data.usersConnection.edges.map(e => e.node)
    ]);
    this.pageInfo.set(data.usersConnection.pageInfo);
  });
}
```

### Error Handling Patterns

Because GraphQL always returns HTTP 200, standard Angular HTTP interceptors do not catch GraphQL errors. You need to handle errors in your Apollo link chain or in the query/mutation subscribers.

```typescript
// Apollo Error Link — catches all GraphQL errors globally
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions, path }) => {
      console.error(`GraphQL error on ${operation.operationName}:`, message);

      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login
        router.navigate(['/login']);
      }
      if (extensions?.code === 'FORBIDDEN') {
        // Show permission denied
        toastService.error('Permission denied');
      }
    });
  }
  if (networkError) {
    console.error('Network error:', networkError);
  }
});

// Chain links: errorLink → authLink → httpLink
const link = errorLink.concat(authLink).concat(httpLink.create({ uri }));
```

### Authentication — Adding Headers

```typescript
// Auth link — adds the Authorization header to every request
import { setContext } from '@apollo/client/link/context';

const authLink = setContext((operation, prevContext) => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      ...prevContext.headers,
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
});
```

---

## Performance Considerations

### Why GraphQL Queries Can Be Slow

GraphQL's flexibility — clients requesting any combination of fields — introduces server-side performance challenges that do not exist in REST.

**Deep nesting:** A client can request arbitrarily nested data. A query asking for users → orders → items → products → category → products (circular) could theoretically run indefinitely. Servers implement **query depth limits** and **query complexity scoring** to prevent this.

**N+1 problem:** As described earlier — naive resolvers make one database call per parent object. The DataLoader pattern batches these. As a client developer, you cannot see whether the server uses DataLoader, but you can notice N+1 by watching the network timing. If a query for 20 users takes 500ms and the query for 1 user takes 25ms (linear scaling suggests N+1), that is a server-side optimisation to raise.

**Over-requesting fields:** Just because GraphQL allows precise field selection does not mean clients always use it wisely. Selecting `orders { ... }` when you only need the order count, or requesting `fullDescription` (a large text field) when only `summary` is needed, wastes bandwidth and server resources.

**Fragment spread proliferation:** Large shared fragments included in many queries can result in fetching far more data than any individual view needs. Review fragments periodically to ensure they are not growing beyond what any single consumer needs.

### Persisted Queries

In production, some teams use **persisted queries** — the client sends a hash of the query instead of the full query text. The server looks up the full query by hash and executes it. Benefits: reduced request payload size, ability to block ad-hoc queries, improved security. Apollo Client supports automatic persisted queries (APQ).

### Caching Strategy for Performance

```typescript
// Per-query fetch policy based on data freshness requirements
// Dashboard data — show cached, update in background
this.apollo.watchQuery({
  query: DASHBOARD_QUERY,
  fetchPolicy: 'cache-and-network',
});

// User profile — always fresh
this.apollo.query({
  query: GET_CURRENT_USER,
  fetchPolicy: 'network-only',
});

// Reference data (categories, roles) — cache for the session
this.apollo.query({
  query: GET_CATEGORIES,
  fetchPolicy: 'cache-first',
});
```

---

## GraphQL vs REST — The Comparison Interviewers Expect

### Side-by-Side Comparison

| Aspect | REST | GraphQL |
|---|---|---|
| **Data fetching** | Fixed endpoint, fixed response shape | Client specifies exact fields needed |
| **Multiple resources** | Multiple requests | Single request with nested fields |
| **Over-fetching** | Common | Eliminated by design |
| **Under-fetching** | Common (requires multiple requests) | Eliminated by nested queries |
| **Type system** | Optional (OpenAPI/Swagger) | Built-in, enforced at runtime |
| **HTTP caching** | Native (GET requests cached by URL) | Not native (POST requests not cached) |
| **Error handling** | HTTP status codes | Always 200, errors in response body |
| **Versioning** | URL versioning (/v1/, /v2/) | Schema evolution with deprecation |
| **File uploads** | Native multipart form data | Requires extension (graphql-upload) |
| **Learning curve** | Low — widely understood | Higher — new concepts, tooling setup |
| **Tooling** | Mature, universal | Excellent but more specialised |
| **Real-time** | Webhooks, SSE, WebSockets (external) | Built-in subscriptions |
| **Performance (server)** | Predictable | N+1 risk, requires DataLoader |
| **Performance (client)** | Over-fetching wastes bandwidth | Precise fetching, better for mobile |

### API Versioning — How GraphQL Handles It

REST APIs version by URL (`/api/v1/`, `/api/v2/`) or by header. This creates maintenance burden — old versions must be supported alongside new ones.

GraphQL uses **schema evolution** instead. Fields are deprecated rather than removed:

```graphql
type User {
  id:       ID!
  name:     String!
  # Deprecated field — clients should migrate to firstName + lastName
  fullName: String @deprecated(reason: "Use firstName and lastName instead")
  firstName: String!
  lastName:  String!
}
```

Clients that still query `fullName` continue to work but see a deprecation warning in development tools. New clients use `firstName` and `lastName`. The old field is removed only after all clients have migrated — typically tracked through usage analytics on the server side.

---

## Interview Preparation

### How to Frame Your GraphQL Knowledge

If you have studied GraphQL but have not used it in production, the honest and credible framing is:

"I have solid conceptual knowledge of GraphQL — the query language, the type system, the schema design, and how Apollo Client integrates with Angular. I've studied how to use Apollo Client for queries, mutations, and subscriptions, how the cache works, and how to generate TypeScript types from the schema. I haven't used it in a production application yet, but I understand the concepts well enough to contribute to a GraphQL-based codebase and become productive quickly. The Angular patterns I use daily — services, Observables, typed data — map directly to how you use Apollo Client."

### Common Interview Questions

### "What is GraphQL and why would you use it over REST?"

GraphQL is a query language and runtime for APIs where the client specifies exactly which fields it needs. The two main advantages over REST are: eliminating over-fetching (you only get what you ask for) and under-fetching (you can retrieve nested related data in a single request). It also provides a strongly typed schema that serves as the contract between client and server — with tooling that generates TypeScript types automatically, which is particularly valuable in Angular.

REST is still preferable for simple CRUD APIs, when HTTP caching matters, for file uploads, or when the team is unfamiliar with GraphQL. The choice depends on the complexity of the data model and how many different views need different shapes of the same data.

### "Explain the difference between a Query and a Mutation."

A Query is a read operation — it should not modify server-side state and is safe to repeat. A Mutation is a write operation — it creates, updates, or deletes data. This maps roughly to GET (Query) vs POST/PUT/PATCH/DELETE (Mutation) in REST. By convention, mutations return the modified data so the client cache can be updated without an additional query.

### "What is the N+1 problem in GraphQL and how is it solved?"

When resolvers are naively implemented, fetching a list of 20 users and their orders triggers 21 database queries — one for the users list, then one per user to fetch their orders. This is the N+1 problem. The standard solution is DataLoader — a batching and caching utility that collects all the IDs needed in one batch, makes a single database query (`WHERE user_id IN (...)`), and distributes the results to the waiting resolvers. This is implemented server-side; the client is unaware of it.

### "How does Apollo Client cache work?"

Apollo Client uses a normalised InMemoryCache. Each object returned from a query is stored individually by its `__typename` and `id` (e.g., `User:123`). When a mutation updates the same object, every query that included that object automatically reflects the update — without re-fetching. This means related queries stay consistent. The cache also supports fetch policies that control when to use cached data vs fetch fresh data from the network.

### "What are GraphQL fragments and why do they matter?"

Fragments are reusable selections of fields on a particular type. They keep queries DRY — define a fragment once and spread it across multiple queries. In a codebase with code generation, fragments also affect type generation — a fragment becomes a TypeScript interface that can be used across multiple components. They are particularly important for large applications where the same field sets are needed in many places.

### "How do you handle authentication in GraphQL with Angular?"

Authentication headers are added via an Apollo Link — specifically a `setContext` link that reads the token from storage and adds it as an Authorization header to every request. Error handling for 401 responses is done in an error link that listens for `UNAUTHENTICATED` error codes in the GraphQL errors array and triggers a redirect to login or a token refresh. This is different from REST where you would use an Angular HTTP interceptor, because GraphQL responses are always HTTP 200.

### "What are the performance trade-offs of GraphQL?"

Advantages: clients request only the data they need (no over-fetching), multiple resource needs are satisfied in one request (no under-fetching), particularly valuable on mobile connections. Disadvantages: the flexible query structure makes query optimisation harder on the server — a naive resolver implementation suffers from the N+1 problem requiring DataLoader, and deeply nested queries can be expensive. HTTP caching is not native (POST requests), though persisted queries and CDN-level caching can address this. The server must also perform query analysis to limit depth and complexity to prevent denial-of-service via expensive queries.

### "How would you migrate from REST to GraphQL in an Angular application?"

Incrementally. Keep the existing REST services for stability. Add Apollo Client alongside the existing Angular HTTP setup. Start by migrating complex multi-request data-fetching scenarios to GraphQL first — these give the most immediate benefit. Generate TypeScript types from the schema to replace hand-written REST response interfaces. Migrate mutations next. Leave simple REST endpoints (file upload, simple status checks, webhooks) as REST — there is no requirement to migrate everything. This incremental approach lets you adopt GraphQL where it provides value without a risky big-bang rewrite.

---

*End of GraphQL for Angular Developers*
