# SQL Guide — Part 1: Foundations & Joins
### Relational Database Fundamentals, Data Types, SELECT, Filtering, Joins

> **Standard SQL with PostgreSQL as the primary dialect. Database differences noted throughout.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Relational Databases: How They Actually Work](#relational-databases-how-they-actually-work)
  - [What a Relational Database Is](#what-a-relational-database-is)
  - [Tables, Rows, and Columns](#tables-rows-and-columns)
  - [Primary Keys and Foreign Keys](#primary-keys-and-foreign-keys)
  - [Indexes — What They Are and How They Work](#indexes--what-they-are-and-how-they-work)
  - [NULL — Three-Valued Logic](#null--three-valued-logic)
  - [ACID Properties](#acid-properties)
- [SQL Data Types](#sql-data-types)
  - [Choosing the Right Type Matters](#choosing-the-right-type-matters)
  - [Integer Types](#integer-types)
  - [Decimal and Floating-Point Types](#decimal-and-floating-point-types)
  - [Text Types](#text-types)
  - [Boolean Type](#boolean-type)
  - [Date and Time Types](#date-and-time-types)
  - [UUID Type](#uuid-type)
  - [JSON and JSONB (PostgreSQL)](#json-and-jsonb-postgresql)
- [SELECT and Filtering](#select-and-filtering)
  - [The Basic SELECT Structure](#the-basic-select-structure)
  - [WHERE — Filtering Rows](#where--filtering-rows)
  - [ORDER BY and LIMIT](#order-by-and-limit)
  - [CASE Expressions](#case-expressions)
  - [Useful String and Date Functions](#useful-string-and-date-functions)
  - [String Functions](#string-functions)
  - [Date and Time Functions](#date-and-time-functions)
- [Joins](#joins)
  - [Why Joins Exist](#why-joins-exist)
  - [INNER JOIN — Only Matching Rows](#inner-join--only-matching-rows)
  - [LEFT JOIN — All Rows from the Left Table](#left-join--all-rows-from-the-left-table)
  - [RIGHT JOIN — All Rows from the Right Table](#right-join--all-rows-from-the-right-table)
  - [FULL OUTER JOIN — All Rows from Both Tables](#full-outer-join--all-rows-from-both-tables)
  - [CROSS JOIN — Cartesian Product](#cross-join--cartesian-product)
  - [Self Join — Joining a Table to Itself](#self-join--joining-a-table-to-itself)
  - [Common Join Mistakes and How to Avoid Them](#common-join-mistakes-and-how-to-avoid-them)


## Introduction

SQL (Structured Query Language) is the language of relational databases, and relational databases power the vast majority of the applications you will build or work with. Understanding SQL deeply — not just how to write queries but why they work the way they do, how the database executes them, and how to design schemas that do not cause problems — is a genuine senior developer skill.

This guide is written for a developer with some SQL experience who wants to fill gaps, understand the deeper mechanics, and be prepared for SQL questions in technical interviews. It does not start from zero but does start from first principles — if you have forgotten things, they are covered explicitly.

**Dialect approach:** Examples are written in standard SQL where it applies across databases, and in PostgreSQL syntax where PostgreSQL provides a meaningfully better or more common solution. Where major databases diverge significantly, the differences are noted. PostgreSQL is the dominant choice for new Spring Boot applications in 2026, but the standard SQL foundation applies to MySQL, SQL Server, Oracle, SQLite, and all other relational databases.

> 📝 **Note:** Read this guide before or alongside the JPA section of the Java Overview. This guide covers SQL itself — the language and its mechanics. The Java Overview covers how Hibernate generates SQL and how Spring Data JPA repositories interact with the database from the Java side.

---

## Relational Databases: How They Actually Work

### What a Relational Database Is

A relational database stores data in tables. A table is a collection of rows (records) and columns (fields), where every row has the same set of columns. Each column has a defined data type — the database enforces that every value in a column conforms to that type.

The "relational" in relational database refers to the mathematical concept of a relation — essentially a set of tuples (rows). E.F. Codd introduced the relational model in 1970, and it has dominated data storage ever since because it provides a clean, well-understood foundation for representing structured data and the relationships between different types of data.

The key insight of the relational model: data about different things is kept in different tables, and the relationships between them are expressed through shared key values — not through embedding one thing inside another (as document databases do) or through pointers (as graph databases do). A User has orders, but the User table does not contain orders. Instead, the Orders table contains a user_id column that references the User table. This separation is what makes relational databases flexible, consistent, and queryable in powerful ways.

### Tables, Rows, and Columns

A table represents a single entity type — users, orders, products, departments. Each row represents one instance of that entity. Each column represents one attribute of that entity.

```sql
-- A typical users table
CREATE TABLE users (
    id         BIGINT       PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(200) NOT NULL,
    role       VARCHAR(50)  NOT NULL DEFAULT 'viewer',
    active     BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

This table says: every user has an id, an email, a name, a role, an active flag, and a created_at timestamp. The id uniquely identifies the row. The email must be present and unique across all rows. The role defaults to 'viewer' if not specified.

**The schema** is the structure of the database — all its tables, columns, constraints, and relationships. The schema is separate from the data. You can have an empty database with a fully defined schema, or you can alter the schema of a populated database (carefully).

### Primary Keys and Foreign Keys

A **primary key** uniquely identifies each row in a table. Every table should have a primary key. The database enforces uniqueness on the primary key column(s) and indexes them automatically for fast lookup.

```sql
-- Single column primary key — most common
id BIGINT PRIMARY KEY

-- UUID primary key — common in distributed systems and Spring Boot
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Composite primary key — multiple columns together form the key
-- Used for junction tables (many-to-many relationships)
PRIMARY KEY (user_id, role_id)
```

A **foreign key** is a column (or set of columns) in one table that references the primary key of another table. Foreign keys enforce referential integrity — the database guarantees that you cannot have a row referencing a parent row that does not exist.

```sql
CREATE TABLE orders (
    id          BIGINT   PRIMARY KEY,
    user_id     BIGINT   NOT NULL REFERENCES users(id),
    -- or equivalently:
    -- user_id  BIGINT   NOT NULL,
    -- FOREIGN KEY (user_id) REFERENCES users(id)
    total       NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

With this foreign key in place: if you try to insert an order with a user_id that does not exist in the users table, the database rejects it. If you try to delete a user who has orders, the database rejects that too (by default) — protecting you from orphaned rows.

**Referential actions** control what happens to child rows when the parent is deleted or updated:

```sql
-- ON DELETE RESTRICT (default) — prevents deletion if child rows exist
-- ON DELETE CASCADE — deletes child rows automatically when parent is deleted
-- ON DELETE SET NULL — sets the foreign key column to NULL in child rows
-- ON DELETE SET DEFAULT — sets the foreign key column to its default value

-- Example: deleting a user automatically deletes their orders
user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE

-- Example: deleting a department sets department_id to NULL in users
department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL
```

> 💡 **Tip:** Choose referential actions carefully. `CASCADE` is convenient but dangerous — a single DELETE can remove far more data than intended if you forget about cascading relationships. `RESTRICT` (the default) is safer because it forces you to explicitly handle child rows before deleting the parent.

### Indexes — What They Are and How They Work

An index is a separate data structure maintained alongside the table that allows the database to find rows matching a condition without scanning the entire table. Without an index, a query like `SELECT * FROM users WHERE email = 'alice@example.com'` must read every row in the table — a full table scan. With an index on the email column, the database can find the matching row in O(log n) time.

**The B-tree index** is the default index type in all major relational databases. A B-tree (balanced tree) stores index entries sorted by value in a tree structure where all leaf nodes are at the same depth. This makes it efficient for: exact matches (`WHERE email = 'alice@example.com'`), range queries (`WHERE created_at >= '2026-01-01'`), and ordering (`ORDER BY created_at`).

The trade-off: every index adds overhead to INSERT, UPDATE, and DELETE operations because the index must be updated alongside the table. An index also consumes additional disk space. The general principle is: index columns that you frequently filter on (WHERE clause), join on, or sort on — and accept the write overhead as the cost of fast reads.

```sql
-- Single column index
CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_orders_user_id  ON orders (user_id);

-- Composite index — useful when you frequently filter on both columns together
-- The order matters: this index helps queries filtering on (user_id, status)
-- or (user_id alone), but NOT queries filtering on (status alone)
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Partial index — only indexes rows matching a condition
-- Smaller, faster for queries that include the condition
CREATE INDEX idx_active_users ON users (email) WHERE active = true;

-- Unique index — enforces uniqueness AND provides fast lookup
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);
-- (UNIQUE constraint on a column creates this automatically)
```

Primary keys and UNIQUE constraints automatically create indexes. Foreign key columns do NOT automatically get indexes in most databases — this is a very common oversight that causes slow JOIN queries. Always index your foreign key columns.

### NULL — Three-Valued Logic

NULL in SQL represents the absence of a value — unknown or not applicable. It is not zero, not an empty string, and not false. NULL is its own state, and SQL uses three-valued logic: every comparison can be true, false, or unknown. A comparison with NULL is always unknown, which is treated as false in WHERE clauses.

This is one of the most counterintuitive parts of SQL, and it causes many subtle bugs:

```sql
-- NULL comparisons are always unknown (treated as false)
SELECT * FROM users WHERE department_id = NULL;    -- returns nothing! wrong
SELECT * FROM users WHERE department_id != NULL;   -- returns nothing! also wrong

-- Correct NULL testing
SELECT * FROM users WHERE department_id IS NULL;       -- rows with no department
SELECT * FROM users WHERE department_id IS NOT NULL;   -- rows with a department

-- NULL in arithmetic and string operations
SELECT NULL + 5;          -- NULL (unknown + anything = unknown)
SELECT NULL || ' suffix'; -- NULL in PostgreSQL (string concatenation)
SELECT CONCAT(NULL, 'suffix'); -- 'suffix' — CONCAT treats NULL as empty string
SELECT COALESCE(NULL, 'default'); -- 'default' — returns first non-NULL value

-- NULL in aggregates
SELECT AVG(salary) FROM employees;  -- NULLs are ignored in all aggregates
SELECT COUNT(*) FROM employees;     -- counts all rows including NULLs
SELECT COUNT(salary) FROM employees; -- counts only rows where salary IS NOT NULL

-- NULL in ORDER BY — NULLs sort last by default in PostgreSQL
-- (SQL Server sorts NULLs first by default — a common gotcha)
SELECT name, score FROM players ORDER BY score DESC NULLS LAST;  -- explicit
SELECT name, score FROM players ORDER BY score DESC NULLS FIRST;
```

> ⚠️ **Warning:** NULL is the most common source of incorrect SQL results. Whenever you write a WHERE clause that might involve nullable columns, think explicitly about what should happen with NULL values. `NOT IN` with a subquery is particularly dangerous — if the subquery returns any NULL values, the entire NOT IN condition returns nothing.

### ACID Properties

ACID is the set of properties that define what it means for database operations to be reliable. Understanding these helps you understand why databases behave the way they do and why transactions exist.

**Atomicity:** A transaction is all-or-nothing. Either all operations in the transaction succeed and are committed, or none of them are — the database rolls back to its state before the transaction started. If you transfer money between accounts (debit one, credit the other), atomicity ensures you never end up with money debited but not credited.

**Consistency:** A transaction brings the database from one valid state to another. Constraints (NOT NULL, UNIQUE, foreign keys, CHECK) are enforced at transaction boundaries. A transaction that would violate a constraint is rejected.

**Isolation:** Concurrent transactions execute as if they were sequential. One transaction does not see the intermediate states of another transaction that is still in progress. The level of isolation is configurable — more isolation means fewer anomalies but more contention.

**Durability:** Once a transaction is committed, it is permanent — it survives system crashes, power failures, and other failures. Committed data is written to durable storage (disk) before the commit acknowledgement is returned.

These properties are managed by the database engine automatically. As a developer using Spring Boot with `@Transactional`, you get ACID guarantees without thinking about the implementation.

---

## SQL Data Types

### Choosing the Right Type Matters

The data type of a column determines: what values can be stored, how much storage space is used, what operations are valid, how comparisons work, and how the database indexes and sorts values. Using the wrong type is a common mistake that causes correctness issues (storing money as FLOAT), performance problems (using VARCHAR for UUIDs instead of UUID type), or unnecessary storage (using TEXT for a column that will never exceed 10 characters).

### Integer Types

```sql
-- Standard integer types (all databases)
SMALLINT    -- 16-bit signed, -32,768 to 32,767
INTEGER     -- 32-bit signed, ~-2.1B to 2.1B (also: INT)
BIGINT      -- 64-bit signed, ~±9.2 quintillion

-- PostgreSQL auto-increment shortcuts (legacy but widely seen)
SERIAL      -- INTEGER that auto-increments (creates a sequence)
BIGSERIAL   -- BIGINT that auto-increments

-- Modern PostgreSQL (9.5+) — preferred over SERIAL
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
-- or
id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY

-- MySQL equivalents
id INT AUTO_INCREMENT PRIMARY KEY
id BIGINT AUTO_INCREMENT PRIMARY KEY

-- SQL Server
id INT IDENTITY(1,1) PRIMARY KEY
```

**Which to use:** Use `BIGINT` for primary keys and foreign keys in any table that could grow large — it costs 8 bytes vs 4 for `INTEGER` but eliminates the risk of running out of IDs. Use `INTEGER` for columns that genuinely cannot exceed 2 billion (counts, status codes, years). Use `SMALLINT` only when you are certain the range is sufficient and storage is constrained.

### Decimal and Floating-Point Types

This is the type decision with the most real-world consequences. There are two fundamentally different ways to store decimal numbers in SQL:

**NUMERIC/DECIMAL** stores exact decimal values. You specify the precision (total significant digits) and scale (digits after the decimal point). `NUMERIC(10, 2)` stores values up to 99,999,999.99 with exactly 2 decimal places. This is exact — 0.10 + 0.20 = 0.30, always.

**FLOAT/REAL/DOUBLE PRECISION** stores approximate binary floating-point values. They use the same IEEE 754 representation as Java's `double` and JavaScript's `number`. They are fast and storage-efficient, but they cannot exactly represent most decimal fractions.

```sql
-- NUMERIC/DECIMAL — exact, use for money, quantities, anything precise
price     NUMERIC(10, 2)   -- up to 99,999,999.99
tax_rate  NUMERIC(5, 4)    -- up to 9.9999 (for rates like 0.0825)
quantity  NUMERIC(15, 3)   -- for precise quantities with 3 decimal places

-- FLOAT / DOUBLE PRECISION — approximate, use for scientific data
latitude   DOUBLE PRECISION  -- geographic coordinates
longitude  DOUBLE PRECISION
sensor_reading FLOAT         -- scientific measurements where precision is relative

-- Demonstration of the floating-point problem
SELECT 0.1 + 0.2;                  -- 0.30000000000000004 (FLOAT arithmetic)
SELECT 0.1::NUMERIC + 0.2::NUMERIC; -- 0.3 (NUMERIC arithmetic)
```

> ⚠️ **Warning:** Never store monetary values as FLOAT or DOUBLE PRECISION. The rounding errors, while tiny, accumulate across millions of transactions and produce incorrect totals. Always use NUMERIC(p, s) for money. This is the SQL equivalent of the Java BigDecimal rule.

### Text Types

```sql
-- CHAR(n) — fixed-length, always n characters, padded with spaces
-- Rarely used in modern applications
code CHAR(3)   -- ISO country code: 'USA', 'GBR', 'DEU'

-- VARCHAR(n) — variable-length up to n characters
-- Most common text type
email      VARCHAR(255)
name       VARCHAR(200)
status     VARCHAR(50)

-- TEXT — unlimited length, no maximum specified
-- PostgreSQL: identical performance to VARCHAR, no real difference
-- MySQL: TEXT is stored off-page for large values — minor performance difference
description TEXT
content     TEXT

-- PostgreSQL specific: no performance difference between VARCHAR and TEXT
-- Use VARCHAR(n) when you want the database to enforce a maximum length
-- Use TEXT when there is no meaningful maximum
```

**The VARCHAR vs TEXT debate:** In PostgreSQL, there is no storage or performance difference between `VARCHAR(255)` and `TEXT`. The difference is constraint enforcement — `VARCHAR(255)` rejects strings longer than 255 characters; `TEXT` does not. Use `VARCHAR(n)` when a maximum length is meaningful to the domain (an email is not meaningfully longer than 255 characters). Use `TEXT` for content fields with no natural maximum.

In MySQL and SQL Server, TEXT types have different storage mechanisms for very large values, so `VARCHAR` is preferred for shorter strings in those databases.

### Boolean Type

```sql
-- PostgreSQL
active    BOOLEAN NOT NULL DEFAULT true
verified  BOOLEAN NOT NULL DEFAULT false

-- Valid values in PostgreSQL: TRUE/FALSE, true/false, 't'/'f', 'yes'/'no', 1/0
INSERT INTO users (active) VALUES (true);
INSERT INTO users (active) VALUES ('yes');  -- also valid

-- MySQL has no native BOOLEAN — uses TINYINT(1)
active TINYINT(1) NOT NULL DEFAULT 1  -- 1 = true, 0 = false

-- SQL Server uses BIT
active BIT NOT NULL DEFAULT 1
```

### Date and Time Types

```sql
-- DATE — date only, no time
birth_date   DATE
start_date   DATE

-- TIME — time only, no date
open_time    TIME        -- 09:00:00
-- TIME WITH TIME ZONE — time with timezone offset
-- Rarely used — timezone-aware times without a date are unusual

-- TIMESTAMP — date and time, no timezone (local or UTC by convention)
created_at   TIMESTAMP NOT NULL DEFAULT NOW()
-- Stores: '2026-05-15 14:30:00'

-- TIMESTAMPTZ / TIMESTAMP WITH TIME ZONE — date and time, with timezone
-- PostgreSQL stores internally as UTC, converts to session timezone on output
-- Best practice for user-facing timestamps
event_time   TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- INTERVAL — a duration (PostgreSQL)
duration     INTERVAL    -- e.g., '2 hours 30 minutes', '1 year 3 months'
```

**Which timestamp type to use:** Use `TIMESTAMP` (without timezone) for timestamps that represent a moment in a single known timezone — created_at audit fields where your application always works in UTC. Use `TIMESTAMPTZ` for any timestamp that represents a user-observable moment that may cross timezones — event schedules, appointment times, anything the user sees. Store `TIMESTAMPTZ` values in UTC (the default in PostgreSQL) and convert to the user's timezone in the application layer.

### UUID Type

```sql
-- PostgreSQL has a native UUID type
id UUID PRIMARY KEY DEFAULT gen_random_uuid()   -- PostgreSQL 13+
id UUID PRIMARY KEY DEFAULT gen_random_uuid()   -- requires pgcrypto extension pre-13

-- Benefits of UUID:
-- Globally unique across tables, databases, and servers
-- Safe to generate in application code (no coordination needed)
-- Hides sequential information (no "there are 1234 users" from the ID)

-- Drawbacks:
-- Larger than BIGINT (16 bytes vs 8)
-- Random UUIDs (v4) have poor B-tree index locality — inserts scatter across the index
-- UUID v7 (time-ordered) solves the locality problem — available in PostgreSQL 17+
id UUID PRIMARY KEY DEFAULT gen_random_uuid()  -- v4, random
```

**MySQL** stores UUIDs as `CHAR(36)` (as strings with hyphens) or `BINARY(16)` (as compact binary). **SQL Server** has `UNIQUEIDENTIFIER`. The UUID column type is PostgreSQL-specific — in other databases you use a string or binary type.

### JSON and JSONB (PostgreSQL)

PostgreSQL has first-class JSON support. This is one of its most powerful features — you can store schema-flexible data in a JSON column while keeping the rest of the row strongly typed.

```sql
-- JSON — stores the JSON text as-is, no indexing possible
metadata JSON

-- JSONB — stores as binary, supports indexing and operators
-- Almost always prefer JSONB over JSON
preferences JSONB
tags        JSONB

-- Example table
CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    price       NUMERIC(10, 2) NOT NULL,
    attributes  JSONB   -- flexible product attributes
);

INSERT INTO products (name, price, attributes)
VALUES ('T-Shirt', 29.99, '{"color": "blue", "sizes": ["S", "M", "L"], "weight_kg": 0.3}');

-- Querying JSONB
SELECT attributes->>'color' FROM products;            -- text: "blue"
SELECT attributes->'sizes' FROM products;             -- JSON: ["S","M","L"]
SELECT attributes->'sizes'->0 FROM products;          -- JSON: "S" (first element)
SELECT attributes->'sizes'->>0 FROM products;         -- text: "S"
SELECT * FROM products WHERE attributes->>'color' = 'blue';
SELECT * FROM products WHERE attributes @> '{"color": "blue"}'; -- containment

-- GIN index for JSONB — enables fast containment and key queries
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
```

**When to use JSONB:** For genuinely schema-flexible data — product attributes that vary by category, user preferences, event payloads, external API responses. Not as a replacement for proper relational design — if you find yourself querying specific JSON fields in WHERE clauses frequently, those fields probably belong as proper columns.

---

## SELECT and Filtering

### The Basic SELECT Structure

```sql
SELECT column1, column2, ...   -- which columns to return
FROM   table_name              -- which table
WHERE  condition               -- which rows to include
ORDER BY column1 [ASC|DESC]    -- how to sort the results
LIMIT  n                       -- maximum rows to return
OFFSET m;                      -- skip the first m rows (for pagination)
```

The conceptual execution order is different from the written order. The database processes clauses in this sequence: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT/OFFSET. This matters because it determines what you can reference in each clause.

```sql
-- Select all columns (avoid in production — fetches unnecessary data)
SELECT * FROM users;

-- Select specific columns
SELECT id, name, email FROM users;

-- Column aliases — AS keyword (optional but conventional)
SELECT
    id,
    name        AS user_name,
    email       AS user_email,
    created_at  AS joined_date
FROM users;

-- Computed columns
SELECT
    name,
    UPPER(email)                              AS email_upper,
    EXTRACT(YEAR FROM created_at)             AS join_year,
    NOW() - created_at                        AS account_age,
    CASE
        WHEN active THEN 'Active'
        ELSE 'Inactive'
    END                                        AS status_label
FROM users;

-- Eliminating duplicates
SELECT DISTINCT role FROM users;           -- unique roles
SELECT DISTINCT department_id FROM users;  -- unique departments (including NULL)
```

### WHERE — Filtering Rows

The WHERE clause filters which rows are included in the result. Only rows where the condition evaluates to true are included — rows where the condition is false or unknown (NULL) are excluded.

```sql
-- Comparison operators
WHERE age = 30
WHERE age != 30       -- also: age <> 30 (standard SQL)
WHERE age > 18
WHERE age >= 18
WHERE age < 65
WHERE age <= 65

-- Combining conditions
WHERE active = true AND role = 'admin'
WHERE active = true OR role = 'admin'
WHERE NOT active

-- Range
WHERE age BETWEEN 18 AND 65   -- inclusive on both ends, same as >= 18 AND <= 65
WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31'

-- Membership
WHERE role IN ('admin', 'editor', 'manager')
WHERE role NOT IN ('viewer', 'guest')
WHERE id IN (1, 5, 9, 23, 47)

-- NULL testing — must use IS NULL / IS NOT NULL
WHERE department_id IS NULL        -- rows with no department
WHERE department_id IS NOT NULL    -- rows with a department
WHERE manager_id IS NULL AND active = true

-- String pattern matching — LIKE
WHERE email LIKE '%@gmail.com'     -- ends with @gmail.com
WHERE name  LIKE 'A%'              -- starts with A
WHERE name  LIKE '%son%'           -- contains 'son' anywhere
WHERE code  LIKE '___'             -- exactly 3 characters (_ matches one)

-- PostgreSQL: ILIKE for case-insensitive matching
WHERE name ILIKE '%alice%'         -- matches Alice, ALICE, alice, aLiCe

-- PostgreSQL: regular expression matching
WHERE email ~ '^[^@]+@[^@]+\.[^@]+$'   -- basic email pattern
WHERE name  ~* 'alice'                   -- case-insensitive regex
```

### ORDER BY and LIMIT

```sql
-- Sort ascending (default)
SELECT * FROM users ORDER BY name;
SELECT * FROM users ORDER BY name ASC;

-- Sort descending
SELECT * FROM users ORDER BY created_at DESC;

-- Multiple columns — sorts by first column, then second for ties
SELECT * FROM users ORDER BY role ASC, name ASC;

-- Sort by a computed value or alias
SELECT name, LENGTH(name) AS name_length FROM users ORDER BY name_length DESC;

-- NULL handling in ORDER BY
-- PostgreSQL: NULLs sort last by default for ASC, first for DESC
-- Be explicit to avoid surprises across databases
SELECT * FROM users ORDER BY score DESC NULLS LAST;
SELECT * FROM users ORDER BY score ASC  NULLS FIRST;

-- LIMIT — take only the first n rows (after sorting)
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;  -- 10 most recent

-- LIMIT + OFFSET — for pagination
-- Page 1: rows 1-20
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;
-- Page 2: rows 21-40
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 20;
-- Page n: OFFSET = (n-1) * page_size

-- SQL Server syntax (no LIMIT/OFFSET)
SELECT TOP 10 * FROM users ORDER BY created_at DESC;   -- SQL Server
-- or standard SQL:
SELECT * FROM users ORDER BY created_at DESC
    FETCH FIRST 10 ROWS ONLY;  -- standard SQL, works in PostgreSQL and Oracle
```

> 💡 **Tip:** Always pair LIMIT with ORDER BY. Without ORDER BY, the database returns rows in an unspecified order that can change between queries. `SELECT * FROM users LIMIT 10` might return different rows each time.

### CASE Expressions

CASE is SQL's if-then-else. It is an expression, not a statement — it can appear anywhere an expression is valid: SELECT list, WHERE clause, ORDER BY clause.

```sql
-- Simple CASE — compares a value against a list of options
SELECT
    name,
    CASE role
        WHEN 'admin'  THEN 'Administrator'
        WHEN 'editor' THEN 'Content Editor'
        WHEN 'viewer' THEN 'Read-Only User'
        ELSE               'Unknown Role'
    END AS role_display
FROM users;

-- Searched CASE — evaluates conditions
SELECT
    name,
    score,
    CASE
        WHEN score >= 90 THEN 'A'
        WHEN score >= 80 THEN 'B'
        WHEN score >= 70 THEN 'C'
        WHEN score >= 60 THEN 'D'
        ELSE                  'F'
    END AS grade
FROM students;

-- CASE in WHERE clause
SELECT * FROM orders
WHERE CASE
    WHEN status = 'cancelled' THEN total > 1000
    ELSE true
END;
-- returns all non-cancelled orders, but only cancelled orders over £1000

-- CASE in ORDER BY — custom sort order
SELECT * FROM tasks
ORDER BY
    CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high'     THEN 2
        WHEN 'medium'   THEN 3
        WHEN 'low'      THEN 4
        ELSE                 5
    END;
```

### Useful String and Date Functions

### String Functions

```sql
-- Length
SELECT LENGTH('Hello World');         -- 11
SELECT CHAR_LENGTH('Hello');          -- 5 (same as LENGTH for ASCII)

-- Case
SELECT UPPER('hello');                -- 'HELLO'
SELECT LOWER('HELLO');                -- 'hello'

-- Trimming
SELECT TRIM('  hello  ');             -- 'hello'
SELECT LTRIM('  hello  ');            -- 'hello  '
SELECT RTRIM('  hello  ');            -- '  hello'

-- Substring
SELECT SUBSTRING('Hello World', 1, 5);  -- 'Hello' (1-indexed in SQL)
SELECT LEFT('Hello World', 5);          -- 'Hello'
SELECT RIGHT('Hello World', 5);         -- 'World'

-- String search
SELECT POSITION('World' IN 'Hello World');  -- 7 (1-indexed, 0 if not found)
SELECT STRPOS('Hello World', 'World');      -- 7 (PostgreSQL)

-- Concatenation
SELECT 'Hello' || ' ' || 'World';      -- 'Hello World' (SQL standard, PostgreSQL)
SELECT CONCAT('Hello', ' ', 'World');   -- 'Hello World' (works in all databases)
SELECT CONCAT_WS(', ', 'Alice', 'Bob', 'Carol'); -- 'Alice, Bob, Carol' (with separator)

-- Replace and split
SELECT REPLACE('Hello World', 'World', 'SQL');  -- 'Hello SQL'
SELECT SPLIT_PART('alice@example.com', '@', 1); -- 'alice' (PostgreSQL)
SELECT SPLIT_PART('alice@example.com', '@', 2); -- 'example.com'

-- Padding
SELECT LPAD('42', 5, '0');   -- '00042' — pad left to width 5 with '0'
SELECT RPAD('hello', 10, '.'); -- 'hello.....' — pad right
```

### Date and Time Functions

```sql
-- Current date and time
SELECT NOW();                   -- current timestamp with timezone
SELECT CURRENT_TIMESTAMP;       -- same, standard SQL
SELECT CURRENT_DATE;            -- current date
SELECT CURRENT_TIME;            -- current time

-- Extracting parts
SELECT EXTRACT(YEAR   FROM NOW());   -- 2026
SELECT EXTRACT(MONTH  FROM NOW());   -- 5
SELECT EXTRACT(DAY    FROM NOW());   -- 15
SELECT EXTRACT(HOUR   FROM NOW());   -- 14
SELECT EXTRACT(DOW    FROM NOW());   -- day of week: 0=Sunday, 6=Saturday
SELECT EXTRACT(EPOCH  FROM NOW());   -- seconds since 1970-01-01 (Unix timestamp)

-- Date arithmetic
SELECT NOW() + INTERVAL '1 day';
SELECT NOW() - INTERVAL '1 month';
SELECT NOW() + INTERVAL '2 hours 30 minutes';
SELECT DATE '2026-12-31' - DATE '2026-01-01';  -- 364 (days between)

-- Truncating to a period — useful for grouping
SELECT DATE_TRUNC('month', NOW());   -- '2026-05-01 00:00:00' (start of month)
SELECT DATE_TRUNC('week', NOW());    -- start of the week
SELECT DATE_TRUNC('year', NOW());    -- '2026-01-01 00:00:00'

-- Formatting timestamps as strings
SELECT TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI');  -- '15/05/2026 14:30'
SELECT TO_CHAR(NOW(), 'Month DD, YYYY');        -- 'May 15, 2026'

-- Parsing strings to dates
SELECT TO_DATE('15/05/2026', 'DD/MM/YYYY');        -- date: 2026-05-15
SELECT TO_TIMESTAMP('2026-05-15 14:30', 'YYYY-MM-DD HH24:MI');
```

---

## Joins

### Why Joins Exist

Data is split across multiple tables to avoid duplication and maintain consistency — a principle called normalisation (covered in Section 9). But most useful queries need data from multiple tables. Joins combine rows from two or more tables based on a related column, typically a foreign key relationship.

Understanding joins thoroughly is one of the most important SQL skills. Interviewers ask about joins in almost every SQL interview. Getting them wrong produces either missing rows (incorrect inner join where a left join was needed) or unexpected rows (cartesian products from missing join conditions).

### INNER JOIN — Only Matching Rows

An INNER JOIN returns rows from both tables where the join condition is satisfied. Rows from either table that do not have a match in the other table are excluded.

```sql
-- Users and their orders — only users who have at least one order
SELECT
    u.name,
    u.email,
    o.id        AS order_id,
    o.total,
    o.created_at AS order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id
ORDER BY u.name, o.created_at;
```

If Alice has 3 orders, she appears 3 times in the result — once for each order. If Bob has no orders, he does not appear at all. If there is an order with a user_id that does not exist in the users table (which a foreign key constraint would prevent, but could happen in a legacy database), that order does not appear either.

```sql
-- The ON clause specifies the join condition
-- It can be any boolean expression, not just equality
SELECT *
FROM products p
INNER JOIN categories c ON p.category_id = c.id

-- Multiple join conditions
SELECT *
FROM order_items oi
INNER JOIN promotions p
    ON oi.product_id = p.product_id
    AND oi.order_date BETWEEN p.start_date AND p.end_date

-- Joining three tables
SELECT
    u.name,
    o.id        AS order_id,
    p.name      AS product_name,
    oi.quantity,
    oi.unit_price
FROM users u
INNER JOIN orders o     ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p   ON oi.product_id = p.id
ORDER BY u.name, o.id;
```

### LEFT JOIN — All Rows from the Left Table

A LEFT JOIN (also called LEFT OUTER JOIN) returns all rows from the left table, plus matching rows from the right table. Where there is no match in the right table, NULL values appear for all right table columns.

```sql
-- All users, with their orders if they have any
-- Users without orders still appear, with NULL for order columns
SELECT
    u.name,
    u.email,
    o.id        AS order_id,
    o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
ORDER BY u.name;
-- Alice (3 orders): appears 3 times with order data
-- Bob (0 orders): appears once with NULL for order_id and total

-- Finding users who have NO orders (anti-join pattern)
SELECT u.name, u.email
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;  -- only rows where no match was found

-- This is more readable and often more efficient than:
-- SELECT name, email FROM users WHERE id NOT IN (SELECT user_id FROM orders)
-- (and NOT IN is dangerous if orders.user_id can contain NULL values)
```

### RIGHT JOIN — All Rows from the Right Table

RIGHT JOIN is the mirror of LEFT JOIN — all rows from the right table, with NULL for unmatched left table rows. In practice, RIGHT JOIN is rarely used because you can always rewrite it as a LEFT JOIN by swapping the table order. Most developers use LEFT JOIN exclusively and reorder their FROM and JOIN clauses as needed.

```sql
-- These two queries return the same result:
SELECT u.name, o.total
FROM orders o
RIGHT JOIN users u ON o.user_id = u.id;

-- Rewritten as LEFT JOIN (preferred):
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### FULL OUTER JOIN — All Rows from Both Tables

FULL OUTER JOIN returns all rows from both tables, with NULL for columns where there is no match on either side.

```sql
-- All users and all orders — including users without orders
-- AND orders without users (orphaned orders)
SELECT
    u.name,
    o.id    AS order_id,
    o.total
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
-- Alice: appears with her orders
-- Bob: appears with NULL order columns
-- Orphaned order (if exists): appears with NULL user columns
```

FULL OUTER JOIN is less common than INNER and LEFT JOIN. It is useful for finding unmatched rows on either side — detecting data integrity issues, reconciling datasets, or finding rows in either table that lack a corresponding entry in the other.

> 📝 **Note:** MySQL did not support FULL OUTER JOIN until recent versions. In older MySQL code you will see it emulated with UNION: `SELECT ... LEFT JOIN ... UNION SELECT ... RIGHT JOIN ...`

### CROSS JOIN — Cartesian Product

A CROSS JOIN returns every combination of rows from both tables. If table A has 10 rows and table B has 5 rows, the result has 50 rows. This is rarely intentional in application queries — it usually indicates a missing join condition.

```sql
-- Intentional: generate all combinations of sizes and colors
SELECT s.name AS size, c.name AS color
FROM sizes s
CROSS JOIN colors c;

-- Accidental: forgetting the ON clause produces a cartesian product
-- This is a common bug
SELECT u.name, o.total
FROM users u, orders o;  -- old-style comma join — no condition = cartesian product!

-- Modern equivalent (equally wrong — same cartesian product)
SELECT u.name, o.total
FROM users u
JOIN orders o ON true;  -- ON true = no filter = cartesian product
```

### Self Join — Joining a Table to Itself

A self join joins a table to itself. Common for hierarchical data (an employee's manager is also an employee) or comparing rows within the same table.

```sql
-- Employee table with a self-referencing manager_id
CREATE TABLE employees (
    id         BIGINT PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    manager_id BIGINT REFERENCES employees(id)  -- self-reference
);

-- Find each employee and their manager's name
SELECT
    e.name      AS employee,
    m.name      AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
-- LEFT JOIN because some employees (the CEO) have no manager

-- Find pairs of employees in the same department
SELECT
    e1.name AS employee1,
    e2.name AS employee2,
    e1.department
FROM employees e1
INNER JOIN employees e2
    ON e1.department = e2.department
    AND e1.id < e2.id   -- avoid duplicates and self-matching (e1-e2 and e2-e1 and e1-e1)
ORDER BY e1.department, e1.name;
```

### Common Join Mistakes and How to Avoid Them

**Duplicate rows from one-to-many joins:**
When joining a one-to-many relationship, the "one" side is repeated for each matching "many" row. If you then aggregate (COUNT, SUM), you may count the same thing multiple times.

```sql
-- BUG: counting orders per user — appears to work but...
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
-- This is actually correct! The LEFT JOIN + GROUP BY pattern is standard.

-- BUG: getting total order value alongside user count
-- This produces wrong results
SELECT
    u.name,
    COUNT(DISTINCT o.id)     AS order_count,
    SUM(oi.quantity)         AS total_items
FROM users u
LEFT JOIN orders o  ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY u.id, u.name;
-- Each order_item row joins to the same order and user — counts explode
-- Solution: aggregate in subqueries before joining
```

**Missing ON clause producing cartesian product:**

```sql
-- BUG: forgot the ON clause
SELECT u.name, o.total
FROM users u
JOIN orders o;  -- PostgreSQL will error; some databases silently return all combinations

-- FIX: always have an ON clause
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**Using INNER JOIN when LEFT JOIN is needed:**

```sql
-- REQUIREMENT: "list all users and their order totals"
-- BUG: users with no orders disappear
SELECT u.name, SUM(o.total) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id  -- excludes users with no orders!
GROUP BY u.id, u.name;

-- FIX: LEFT JOIN so all users appear
SELECT u.name, COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```



---

*Continue with [SQL Guide — Part 2: Advanced SQL & Interview Prep](./sql-guide-part-2.md)*
