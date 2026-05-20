# SQL Guide — Part 2: Advanced SQL & Interview Prep
### Aggregation, Window Functions, CTEs, Schema Design, Indexes, Transactions, PostgreSQL, Interview

> **Continuation of SQL Guide. Read Part 1 (foundations through joins) first.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Aggregation, Grouping, and Window Functions](#aggregation-grouping-and-window-functions)
  - [Aggregate Functions](#aggregate-functions)
  - [GROUP BY — Aggregating by Category](#group-by--aggregating-by-category)
  - [HAVING — Filtering Groups](#having--filtering-groups)
  - [Window Functions — Modern SQL's Most Powerful Feature](#window-functions--modern-sqls-most-powerful-feature)
  - [ROW_NUMBER, RANK, DENSE_RANK](#row_number-rank-dense_rank)
  - [Running Totals and Moving Averages with SUM OVER](#running-totals-and-moving-averages-with-sum-over)
  - [LAG and LEAD — Accessing Adjacent Rows](#lag-and-lead--accessing-adjacent-rows)
  - [NTILE — Dividing Rows into Buckets](#ntile--dividing-rows-into-buckets)
  - [FIRST_VALUE and LAST_VALUE](#first_value-and-last_value)
- [Subqueries and CTEs](#subqueries-and-ctes)
  - [Subqueries](#subqueries)
  - [Subqueries in WHERE](#subqueries-in-where)
  - [EXISTS vs IN](#exists-vs-in)
  - [Subqueries in FROM (Derived Tables)](#subqueries-in-from-derived-tables)
  - [CTEs — Common Table Expressions](#ctes--common-table-expressions)
  - [Recursive CTEs — Hierarchical Data](#recursive-ctes--hierarchical-data)
- [Modifying Data](#modifying-data)
  - [INSERT](#insert)
  - [UPDATE](#update)
  - [DELETE](#delete)
  - [UPSERT — INSERT or UPDATE](#upsert--insert-or-update)
  - [TRUNCATE vs DELETE](#truncate-vs-delete)
- [Schema Design and DDL](#schema-design-and-ddl)
  - [CREATE TABLE — Full Syntax](#create-table--full-syntax)
  - [ALTER TABLE — Modifying Existing Tables](#alter-table--modifying-existing-tables)
- [Normalisation](#normalisation)
  - [What Normalisation Solves](#what-normalisation-solves)
  - [First Normal Form (1NF)](#first-normal-form-1nf)
  - [Second Normal Form (2NF)](#second-normal-form-2nf)
  - [Third Normal Form (3NF)](#third-normal-form-3nf)
  - [A Full Normalisation Example](#a-full-normalisation-example)
  - [When to Intentionally Denormalise](#when-to-intentionally-denormalise)
- [Indexes and Performance](#indexes-and-performance)
  - [How B-Tree Indexes Work](#how-b-tree-indexes-work)
  - [Creating Effective Indexes](#creating-effective-indexes)
  - [EXPLAIN ANALYZE — Reading a Query Plan](#explain-analyze--reading-a-query-plan)
  - [Common Performance Problems](#common-performance-problems)
- [Transactions and Concurrency](#transactions-and-concurrency)
  - [Transaction Basics](#transaction-basics)
  - [Isolation Levels](#isolation-levels)
  - [Optimistic vs Pessimistic Locking](#optimistic-vs-pessimistic-locking)
  - [Deadlocks](#deadlocks)
- [PostgreSQL Specifics](#postgresql-specifics)
  - [Features Unique to PostgreSQL](#features-unique-to-postgresql)
  - [The `::` Cast Operator](#the--cast-operator)
  - [RETURNING Clause](#returning-clause)
  - [ILIKE — Case-Insensitive LIKE](#ilike--case-insensitive-like)
  - [Array Types](#array-types)
  - [Generate Series — Useful for Testing and Reporting](#generate-series--useful-for-testing-and-reporting)
  - [Database Differences Reference](#database-differences-reference)
- [SQL in the Interview Context](#sql-in-the-interview-context)
  - [What Interviewers Are Testing](#what-interviewers-are-testing)
  - [12 Worked Interview Problems](#12-worked-interview-problems)
  - [Problem 1 — Basic Join with Aggregation](#problem-1--basic-join-with-aggregation)
  - [Problem 2 — Finding the Top N Per Group](#problem-2--finding-the-top-n-per-group)
  - [Problem 3 — Month-over-Month Growth](#problem-3--month-over-month-growth)
  - [Problem 4 — Identifying Gaps in Sequential Data](#problem-4--identifying-gaps-in-sequential-data)
  - [Problem 5 — Cumulative Distribution](#problem-5--cumulative-distribution)
  - [Problem 6 — The Self-Join Problem](#problem-6--the-self-join-problem)
  - [Problem 7 — NOT IN vs NOT EXISTS vs LEFT JOIN IS NULL](#problem-7--not-in-vs-not-exists-vs-left-join-is-null)
  - [Problem 8 — Pivot / Crosstab](#problem-8--pivot--crosstab)
  - [Problem 9 — Optimise This Query](#problem-9--optimise-this-query)
  - [Problem 10 — Schema Design Question](#problem-10--schema-design-question)
  - [Problem 11 — Recursive Query](#problem-11--recursive-query)
  - [Problem 12 — Window Function vs GROUP BY](#problem-12--window-function-vs-group-by)
  - [How to Talk About SQL in Interviews](#how-to-talk-about-sql-in-interviews)


## Aggregation, Grouping, and Window Functions

### Aggregate Functions

Aggregate functions compute a single value from a set of rows. They collapse multiple rows into one result per group.

```sql
-- The core aggregate functions
SELECT COUNT(*)                 FROM orders;  -- count all rows
SELECT COUNT(discount_code)     FROM orders;  -- count non-NULL discount_codes only
SELECT COUNT(DISTINCT user_id)  FROM orders;  -- count unique users with orders
SELECT SUM(total)               FROM orders;  -- total revenue
SELECT AVG(total)               FROM orders;  -- average order value
SELECT MIN(total)               FROM orders;  -- smallest order
SELECT MAX(total)               FROM orders;  -- largest order
SELECT MIN(created_at)          FROM orders;  -- first order date
SELECT MAX(created_at)          FROM orders;  -- most recent order date

-- Multiple aggregates in one query
SELECT
    COUNT(*)                    AS total_orders,
    COUNT(DISTINCT user_id)     AS unique_customers,
    SUM(total)                  AS total_revenue,
    AVG(total)                  AS avg_order_value,
    MIN(total)                  AS min_order,
    MAX(total)                  AS max_order
FROM orders
WHERE status = 'completed';
```

**COUNT(*) vs COUNT(column):** `COUNT(*)` counts all rows including those with NULL values in every column. `COUNT(column)` counts only rows where that column is NOT NULL. This is a classic interview question. `COUNT(DISTINCT column)` counts unique non-NULL values. In practice, use `COUNT(*)` to count rows and `COUNT(column)` specifically when you want to count non-NULL occurrences of a nullable column.

### GROUP BY — Aggregating by Category

GROUP BY divides the result into groups based on the values of specified columns, then applies aggregate functions to each group separately.

```sql
-- Total revenue per user
SELECT
    user_id,
    COUNT(*)    AS order_count,
    SUM(total)  AS total_spent
FROM orders
GROUP BY user_id
ORDER BY total_spent DESC;

-- Revenue per month
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                         AS order_count,
    SUM(total)                       AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Multiple grouping columns
SELECT
    status,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                         AS count,
    SUM(total)                       AS total
FROM orders
GROUP BY status, DATE_TRUNC('month', created_at)
ORDER BY month, status;
```

**The fundamental GROUP BY rule:** Every column in the SELECT list that is NOT inside an aggregate function must appear in the GROUP BY clause. Violating this is a SQL error in most databases. The reason: if you group by user_id, and then ask for the user's name without aggregating it, the database does not know which name to use if multiple names appear in a group.

```sql
-- ERROR: name is not in GROUP BY and not aggregated
SELECT user_id, name, COUNT(*) FROM orders GROUP BY user_id;

-- FIX 1: add name to GROUP BY (when name is functionally dependent on user_id)
SELECT user_id, name, COUNT(*) FROM orders
JOIN users ON orders.user_id = users.id
GROUP BY user_id, name;

-- FIX 2: use an aggregate on name
SELECT user_id, MIN(name) AS name, COUNT(*) FROM orders
JOIN users ON orders.user_id = users.id
GROUP BY user_id;
```

### HAVING — Filtering Groups

WHERE filters individual rows before grouping. HAVING filters groups after aggregation. This is one of the most commonly confused distinctions in SQL.

```sql
-- WHERE filters before GROUP BY (on raw rows)
-- HAVING filters after GROUP BY (on aggregated groups)

-- Users who have placed more than 5 orders
SELECT
    user_id,
    COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5    -- filters groups, not individual rows
ORDER BY order_count DESC;

-- Both WHERE and HAVING in the same query
-- Where: filters completed orders (before grouping)
-- Having: filters users with total spending > 1000 (after grouping)
SELECT
    user_id,
    COUNT(*)    AS order_count,
    SUM(total)  AS total_spent
FROM orders
WHERE status = 'completed'        -- filters rows first
GROUP BY user_id
HAVING SUM(total) > 1000          -- then filters groups
ORDER BY total_spent DESC;

-- HAVING with multiple conditions
SELECT department_id, AVG(salary) AS avg_salary, COUNT(*) AS headcount
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 50000 AND COUNT(*) >= 5
ORDER BY avg_salary DESC;
```

> 💡 **Tip:** A useful mental model: WHERE is for filtering raw data (think of it as applied to individual rows), HAVING is for filtering summaries (think of it as applied to the output of GROUP BY). If your condition does not involve an aggregate function, it belongs in WHERE (where it runs more efficiently). If it involves COUNT, SUM, AVG, MIN, or MAX, it must be in HAVING.

### Window Functions — Modern SQL's Most Powerful Feature

Window functions perform calculations across a set of related rows without collapsing them into a single group. Unlike aggregate functions (which return one row per group), window functions return a value for every row while also having access to values from other rows.

Before window functions, many common analytical queries required complex self-joins or correlated subqueries. Window functions make those queries simple and efficient.

The key concept: a **window** is a defined set of rows relative to the current row. The `OVER()` clause defines the window.

```sql
-- The general syntax
function_name(column) OVER (
    [PARTITION BY column1, column2, ...]  -- divide into groups (like GROUP BY)
    [ORDER BY column3, column4, ...]       -- order within groups
    [ROWS/RANGE BETWEEN ... AND ...]       -- further restrict the window frame
)
```

### ROW_NUMBER, RANK, DENSE_RANK

These functions assign a number to each row within a partition.

```sql
-- ROW_NUMBER — assigns 1, 2, 3, ... unique to each row within the partition
-- RANK — assigns rank with gaps (1, 1, 3, 4 if there is a tie for 1st)
-- DENSE_RANK — assigns rank without gaps (1, 1, 2, 3 if there is a tie for 1st)

SELECT
    user_id,
    order_date,
    total,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date) AS order_number,
    RANK()       OVER (PARTITION BY user_id ORDER BY total DESC) AS rank_by_value,
    DENSE_RANK() OVER (PARTITION BY user_id ORDER BY total DESC) AS dense_rank
FROM orders;

-- Practical use: get the most recent order for each user (without a subquery)
-- The "greatest N per group" problem — classic interview scenario
SELECT *
FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders
) ranked
WHERE rn = 1;  -- only the first (most recent) row per user

-- Before window functions — this required a much more complex query
SELECT o.*
FROM orders o
INNER JOIN (
    SELECT user_id, MAX(created_at) AS latest
    FROM orders
    GROUP BY user_id
) latest ON o.user_id = latest.user_id AND o.created_at = latest.latest;
```

### Running Totals and Moving Averages with SUM OVER

```sql
-- Running total of revenue over time
SELECT
    created_at::DATE        AS order_date,
    total,
    SUM(total) OVER (ORDER BY created_at) AS running_total
FROM orders
ORDER BY created_at;

-- Running total per user (PARTITION BY resets the running total for each user)
SELECT
    user_id,
    created_at,
    total,
    SUM(total) OVER (
        PARTITION BY user_id
        ORDER BY created_at
    ) AS user_running_total
FROM orders
ORDER BY user_id, created_at;

-- 7-day moving average of daily revenue
SELECT
    day,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY day
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW  -- current row + 6 before
    ) AS seven_day_avg
FROM (
    SELECT
        created_at::DATE AS day,
        SUM(total)       AS daily_revenue
    FROM orders
    GROUP BY created_at::DATE
) daily
ORDER BY day;
```

### LAG and LEAD — Accessing Adjacent Rows

LAG accesses a value from a previous row. LEAD accesses a value from a following row. Both are essential for calculating period-over-period changes.

```sql
-- Month-over-month revenue comparison
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month)             AS prev_month_revenue,
    revenue - LAG(revenue) OVER (ORDER BY month)   AS month_change,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month))
        / LAG(revenue) OVER (ORDER BY month) * 100,
    2) AS pct_change
FROM (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total)                       AS revenue
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
) monthly
ORDER BY month;

-- LAG with a default value (for the first row where there is no previous)
LAG(revenue, 1, 0) OVER (ORDER BY month)  -- 0 as default for first row

-- LEAD — look at the next row
-- Calculate days until next order per user
SELECT
    user_id,
    created_at,
    LEAD(created_at) OVER (PARTITION BY user_id ORDER BY created_at) AS next_order_date,
    LEAD(created_at) OVER (PARTITION BY user_id ORDER BY created_at) - created_at
        AS days_to_next_order
FROM orders
ORDER BY user_id, created_at;
```

### NTILE — Dividing Rows into Buckets

```sql
-- Divide customers into 4 quartiles by total spending
SELECT
    user_id,
    total_spent,
    NTILE(4) OVER (ORDER BY total_spent) AS spending_quartile
FROM (
    SELECT user_id, SUM(total) AS total_spent
    FROM orders
    GROUP BY user_id
) user_totals;
-- Quartile 1: bottom 25%, Quartile 4: top 25%
```

### FIRST_VALUE and LAST_VALUE

```sql
-- The first and last order total for each user
SELECT
    user_id,
    created_at,
    total,
    FIRST_VALUE(total) OVER (
        PARTITION BY user_id ORDER BY created_at
    ) AS first_order_total,
    LAST_VALUE(total) OVER (
        PARTITION BY user_id ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- important!
    ) AS last_order_total
FROM orders;
```

> 📝 **Note:** `LAST_VALUE` requires `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to work correctly. Without it, the default window frame is "from the beginning of the partition to the current row," which means LAST_VALUE returns the current row's value, not the last row's value. This is a common gotcha.

---

## Subqueries and CTEs

### Subqueries

A subquery is a SELECT statement nested inside another SQL statement. Subqueries can appear in the SELECT list, the FROM clause, or the WHERE clause. They are evaluated before the outer query.

### Subqueries in WHERE

```sql
-- Find users who have placed at least one order
SELECT name, email
FROM users
WHERE id IN (
    SELECT DISTINCT user_id
    FROM orders
    WHERE status = 'completed'
);

-- Find users who have never placed an order
SELECT name, email
FROM users
WHERE id NOT IN (
    SELECT DISTINCT user_id
    FROM orders
    WHERE user_id IS NOT NULL  -- critical! NOT IN with NULLs returns nothing
);

-- Find orders with totals above the average
SELECT *
FROM orders
WHERE total > (SELECT AVG(total) FROM orders);

-- Find the most recent order for each user (correlated subquery version)
SELECT *
FROM orders o1
WHERE created_at = (
    SELECT MAX(created_at)
    FROM orders o2
    WHERE o2.user_id = o1.user_id  -- correlated: references outer query
);
-- This works but is slow — the inner query runs once per outer row
-- The window function version (shown in Section 5) is much faster
```

### EXISTS vs IN

`EXISTS` returns true if the subquery returns any rows. `IN` checks if a value appears in a list. For large datasets, EXISTS is often more efficient because it stops as soon as it finds a match, whereas IN evaluates all results.

```sql
-- IN — good for small result sets
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 100);

-- EXISTS — often better for large datasets and correlated subqueries
SELECT name FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id AND o.total > 100
);

-- NOT EXISTS — safer than NOT IN when NULLs might be present
SELECT name FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
-- This correctly returns users with no orders even if orders.user_id could be NULL
```

### Subqueries in FROM (Derived Tables)

A subquery in the FROM clause acts as a virtual table for the outer query. This lets you pre-aggregate data before joining.

```sql
-- Correct way to join pre-aggregated data (avoids the duplicate row problem)
SELECT
    u.name,
    u.email,
    COALESCE(order_summary.order_count, 0) AS order_count,
    COALESCE(order_summary.total_spent, 0) AS total_spent
FROM users u
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*)    AS order_count,
        SUM(total)  AS total_spent
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) order_summary ON u.id = order_summary.user_id
ORDER BY total_spent DESC;
```

### CTEs — Common Table Expressions

A CTE (WITH clause) is a named temporary result set that you can reference in the main query. CTEs make complex queries dramatically more readable by breaking them into named, logical steps.

```sql
-- Basic CTE syntax
WITH cte_name AS (
    SELECT ...
)
SELECT * FROM cte_name;

-- Multiple CTEs
WITH
cte1 AS (SELECT ...),
cte2 AS (SELECT ... FROM cte1 ...)  -- can reference earlier CTEs
SELECT * FROM cte2;
```

CTEs versus subqueries: both produce the same result in most cases. CTEs are preferred for readability — they name the intermediate results and allow them to be referenced multiple times. Subqueries can be harder to read when nested deeply.

```sql
-- A complex query as nested subqueries — hard to read
SELECT
    department_name,
    avg_salary,
    total_headcount
FROM (
    SELECT
        d.name AS department_name,
        AVG(e.salary) AS avg_salary,
        COUNT(e.id) AS total_headcount
    FROM (
        SELECT * FROM employees WHERE active = true
    ) e
    INNER JOIN departments d ON e.department_id = d.id
    GROUP BY d.id, d.name
) dept_summary
WHERE avg_salary > 60000
ORDER BY avg_salary DESC;

-- Same query as CTEs — clear and readable
WITH active_employees AS (
    SELECT *
    FROM employees
    WHERE active = true
),
dept_summary AS (
    SELECT
        d.name      AS department_name,
        AVG(e.salary) AS avg_salary,
        COUNT(e.id)   AS total_headcount
    FROM active_employees e
    INNER JOIN departments d ON e.department_id = d.id
    GROUP BY d.id, d.name
)
SELECT department_name, avg_salary, total_headcount
FROM dept_summary
WHERE avg_salary > 60000
ORDER BY avg_salary DESC;
```

### Recursive CTEs — Hierarchical Data

Recursive CTEs can query hierarchical data — org charts, category trees, geographic hierarchies — by repeatedly applying the query to the results of the previous iteration.

```sql
-- Find an employee's complete management chain (all ancestors)
WITH RECURSIVE management_chain AS (
    -- Base case: start with the target employee
    SELECT id, name, manager_id, 0 AS depth
    FROM employees
    WHERE id = 42  -- starting employee

    UNION ALL

    -- Recursive case: join to the next level up
    SELECT e.id, e.name, e.manager_id, mc.depth + 1
    FROM employees e
    INNER JOIN management_chain mc ON e.id = mc.manager_id
    -- Recursion stops when manager_id IS NULL (reached the CEO)
    WHERE e.manager_id IS NOT NULL
)
SELECT name, depth
FROM management_chain
ORDER BY depth;

-- Find all subordinates of a given manager (all descendants)
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id, 0 AS depth
    FROM employees
    WHERE id = 10  -- starting manager

    UNION ALL

    SELECT e.id, e.name, e.manager_id, s.depth + 1
    FROM employees e
    INNER JOIN subordinates s ON e.manager_id = s.id
)
SELECT name, depth
FROM subordinates
ORDER BY depth, name;
```

Recursive CTEs are a PostgreSQL feature supported by most modern databases (MySQL 8+, SQL Server, Oracle, SQLite 3.35+). The recursion terminates when the recursive part of the query returns no rows.

---

## Modifying Data

### INSERT

```sql
-- Single row insert
INSERT INTO users (name, email, role)
VALUES ('Alice Smith', 'alice@example.com', 'admin');

-- Insert with default values for omitted columns
INSERT INTO users (name, email)
VALUES ('Bob Jones', 'bob@example.com');
-- role uses DEFAULT 'viewer', active uses DEFAULT true, created_at uses DEFAULT NOW()

-- Multiple row insert — one statement
INSERT INTO users (name, email, role)
VALUES
    ('Alice Smith', 'alice@example.com', 'admin'),
    ('Bob Jones',   'bob@example.com',   'editor'),
    ('Carol White', 'carol@example.com', 'viewer');

-- Insert from a SELECT — copy data between tables or from a query
INSERT INTO archived_orders (id, user_id, total, archived_at)
SELECT id, user_id, total, NOW()
FROM orders
WHERE created_at < '2024-01-01' AND status = 'completed';

-- PostgreSQL: RETURNING — get the generated values back
INSERT INTO users (name, email)
VALUES ('Dave Brown', 'dave@example.com')
RETURNING id, created_at;
-- Returns the generated id and created_at without a separate SELECT
```

### UPDATE

```sql
-- Basic update
UPDATE users
SET role = 'admin'
WHERE id = 42;

-- Update multiple columns
UPDATE users
SET
    role       = 'editor',
    active     = true,
    updated_at = NOW()
WHERE id = 42;

-- Update based on a calculation
UPDATE products
SET price = price * 1.10  -- increase all prices by 10%
WHERE category_id = 5;

-- Update with a subquery
UPDATE orders
SET status = 'completed'
WHERE user_id IN (
    SELECT id FROM users WHERE role = 'vip'
) AND status = 'pending';

-- Update with a JOIN (PostgreSQL syntax)
UPDATE orders o
SET status = 'high_priority'
FROM users u
WHERE o.user_id = u.id
AND u.role = 'vip'
AND o.status = 'pending';

-- PostgreSQL: RETURNING — get the updated rows back
UPDATE users
SET active = false
WHERE last_login < NOW() - INTERVAL '1 year'
RETURNING id, email, last_login;
```

> ⚠️ **Warning:** An UPDATE without a WHERE clause updates every row in the table. This is one of the most catastrophic mistakes in SQL. Before running any UPDATE in production, run the equivalent SELECT first to verify you are targeting the rows you intend. Many developers have accidentally set every user's password to 'reset123' or every order's status to 'cancelled' by forgetting the WHERE clause. Some teams require running `BEGIN; UPDATE ...; SELECT ...; ROLLBACK;` first to verify the impact before actually committing.

### DELETE

```sql
-- Delete specific rows
DELETE FROM users WHERE id = 42;

-- Delete based on a condition
DELETE FROM orders WHERE status = 'cancelled' AND created_at < NOW() - INTERVAL '1 year';

-- Delete with a subquery
DELETE FROM orders
WHERE user_id IN (
    SELECT id FROM users WHERE active = false AND created_at < NOW() - INTERVAL '2 years'
);

-- Delete with a JOIN (PostgreSQL)
DELETE FROM order_items oi
USING orders o
WHERE oi.order_id = o.id
AND o.status = 'cancelled';

-- PostgreSQL: RETURNING — get deleted rows back
DELETE FROM users
WHERE last_login < NOW() - INTERVAL '3 years'
RETURNING id, email;
```

> ⚠️ **Warning:** DELETE without WHERE deletes every row in the table. The same precaution applies as with UPDATE — verify your condition with SELECT first.

### UPSERT — INSERT or UPDATE

Upsert handles the common case where you want to insert a row if it does not exist, or update it if it does.

```sql
-- PostgreSQL: ON CONFLICT
INSERT INTO user_preferences (user_id, preference_key, preference_value)
VALUES (42, 'theme', 'dark')
ON CONFLICT (user_id, preference_key)   -- when this unique constraint is violated
DO UPDATE SET
    preference_value = EXCLUDED.preference_value,  -- EXCLUDED refers to the attempted insert
    updated_at = NOW();

-- Insert only if not exists (do nothing on conflict)
INSERT INTO user_roles (user_id, role_id)
VALUES (42, 5)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- MySQL equivalent
INSERT INTO user_preferences (user_id, preference_key, preference_value)
VALUES (42, 'theme', 'dark')
ON DUPLICATE KEY UPDATE
    preference_value = VALUES(preference_value);

-- SQL Server equivalent (MERGE statement)
MERGE INTO user_preferences AS target
USING (VALUES (42, 'theme', 'dark')) AS source (user_id, preference_key, preference_value)
    ON target.user_id = source.user_id AND target.preference_key = source.preference_key
WHEN MATCHED THEN
    UPDATE SET preference_value = source.preference_value
WHEN NOT MATCHED THEN
    INSERT (user_id, preference_key, preference_value)
    VALUES (source.user_id, source.preference_key, source.preference_value);
```

### TRUNCATE vs DELETE

```sql
-- DELETE — removes rows one by one, fires triggers, can be rolled back
-- Slow for large tables but precise
DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '1 year';

-- TRUNCATE — removes all rows instantly by deallocating data pages
-- Much faster than DELETE for clearing an entire table
-- Cannot be used with a WHERE clause
-- In PostgreSQL, TRUNCATE can be rolled back within a transaction (unlike some databases)
TRUNCATE TABLE audit_log;
TRUNCATE TABLE audit_log RESTART IDENTITY;  -- also resets the sequence counter

-- When to use which:
-- DELETE: when you need to remove specific rows, fire triggers, or filter with WHERE
-- TRUNCATE: when you need to empty an entire table quickly (e.g., clearing a staging table)
```

---

## Schema Design and DDL

### CREATE TABLE — Full Syntax

```sql
CREATE TABLE employees (
    -- Primary key with auto-generated identity
    id              BIGINT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Required text fields with length limits
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,

    -- Nullable field
    phone           VARCHAR(20),     -- NULL allowed (no NOT NULL)

    -- Decimal with precision and scale
    salary          NUMERIC(12, 2)  NOT NULL CHECK (salary >= 0),

    -- Enum-like field enforced with CHECK
    employment_type VARCHAR(20)     NOT NULL
                    CHECK (employment_type IN ('full_time', 'part_time', 'contractor')),

    -- Foreign key
    department_id   BIGINT          NOT NULL REFERENCES departments(id),
    manager_id      BIGINT          REFERENCES employees(id),  -- nullable: CEO has no manager

    -- Boolean with default
    active          BOOLEAN         NOT NULL DEFAULT true,

    -- Timestamps with defaults
    hired_date      DATE            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- Table-level constraints (when constraints involve multiple columns)
    CONSTRAINT uq_employees_email UNIQUE (email),
    CONSTRAINT chk_salary_range   CHECK (salary BETWEEN 0 AND 10000000)
);

-- Creating an index after the table (common pattern)
CREATE INDEX idx_employees_department ON employees (department_id);
CREATE INDEX idx_employees_manager    ON employees (manager_id);
CREATE INDEX idx_employees_active     ON employees (active) WHERE active = true;
```

### ALTER TABLE — Modifying Existing Tables

```sql
-- Add a column
ALTER TABLE employees ADD COLUMN middle_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN terminated_at TIMESTAMP;

-- Add a column with a default (in PostgreSQL, this is fast — no table rewrite)
ALTER TABLE employees ADD COLUMN review_score NUMERIC(3, 1) DEFAULT 0.0;

-- Drop a column
ALTER TABLE employees DROP COLUMN middle_name;

-- Rename a column
ALTER TABLE employees RENAME COLUMN phone TO phone_number;

-- Change a column type (may fail if existing data cannot convert)
ALTER TABLE employees ALTER COLUMN phone_number TYPE VARCHAR(30);

-- Add a NOT NULL constraint (will fail if existing rows have NULL)
-- Strategy: add column as nullable, populate it, then add NOT NULL
ALTER TABLE employees ADD COLUMN country VARCHAR(3);
UPDATE employees SET country = 'USA' WHERE country IS NULL;
ALTER TABLE employees ALTER COLUMN country SET NOT NULL;

-- Add a DEFAULT to existing column
ALTER TABLE employees ALTER COLUMN country SET DEFAULT 'USA';

-- Remove a DEFAULT
ALTER TABLE employees ALTER COLUMN country DROP DEFAULT;

-- Add a unique constraint
ALTER TABLE employees ADD CONSTRAINT uq_employee_email UNIQUE (email);

-- Add a foreign key
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_department
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- Drop a constraint
ALTER TABLE employees DROP CONSTRAINT uq_employee_email;

-- Rename a table
ALTER TABLE employees RENAME TO staff;
```

> 💡 **Tip:** In production, schema changes require careful planning. Adding a nullable column or a new index can be done without downtime on most modern databases. Changing a column type, adding NOT NULL to an existing column, or rebuilding indexes on large tables can lock the table and cause downtime. Use `CREATE INDEX CONCURRENTLY` in PostgreSQL to build indexes without locking the table.

---

## Normalisation

### What Normalisation Solves

Normalisation is the process of organising a database schema to reduce data redundancy and improve data integrity. Without normalisation, databases suffer from **update anomalies** — problems that arise from storing the same information in multiple places.

The three classic anomalies in an unnormalised schema:

**Insert anomaly:** You cannot insert data about one thing without also having data about another. In a single "everything in one table" design, you cannot record a new course until a student enrols in it, because the table has no concept of a course independent of a student.

**Update anomaly:** Changing one fact requires updating multiple rows. If a customer's address appears in every order row, updating their address means updating all their order rows — and if you miss any, the database contains contradictory data.

**Delete anomaly:** Deleting data about one thing accidentally destroys data about another. Deleting the last student enrolled in a course also deletes the course's information if they are stored in the same row.

### First Normal Form (1NF)

A table is in 1NF if: every cell contains a single atomic value, every column has a consistent data type, each column has a unique name, and the order of rows does not matter.

**Violation — repeating groups:**

```sql
-- BAD: multiple values in one column (comma-separated)
-- This violates 1NF
CREATE TABLE orders (
    id     BIGINT PRIMARY KEY,
    items  TEXT   -- "product_1, product_2, product_3"  ← violates 1NF
);

-- BAD: repeating columns (product_1, product_2, product_3)
CREATE TABLE orders (
    id        BIGINT PRIMARY KEY,
    product_1 VARCHAR(200),
    product_2 VARCHAR(200),
    product_3 VARCHAR(200)  -- what if there are 4 items?
);

-- CORRECT: separate table for repeating data
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id   BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);
```

### Second Normal Form (2NF)

A table is in 2NF if it is in 1NF AND every non-key column is fully dependent on the entire primary key (not just part of it). 2NF violations only occur when the primary key is composite (multiple columns).

**Violation — partial dependency:**

```sql
-- BAD: composite primary key (student_id, course_id)
-- student_name depends only on student_id (not the full key)
-- course_name depends only on course_id (not the full key)
CREATE TABLE enrolments (
    student_id   BIGINT,
    course_id    BIGINT,
    student_name VARCHAR(200),  -- depends only on student_id ← partial dependency
    course_name  VARCHAR(200),  -- depends only on course_id ← partial dependency
    grade        CHAR(2),        -- depends on both student_id AND course_id ← ok
    PRIMARY KEY (student_id, course_id)
);
-- Update anomaly: student changes their name → must update every enrolment row
-- Redundancy: student name stored once per enrolment, not once per student

-- CORRECT: separate tables for each entity
CREATE TABLE students (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

CREATE TABLE courses (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

CREATE TABLE enrolments (
    student_id BIGINT NOT NULL REFERENCES students(id),
    course_id  BIGINT NOT NULL REFERENCES courses(id),
    grade      CHAR(2),
    PRIMARY KEY (student_id, course_id)
);
```

### Third Normal Form (3NF)

A table is in 3NF if it is in 2NF AND every non-key column depends directly on the primary key (not on another non-key column). 3NF eliminates **transitive dependencies** — where column A → column B → column C, meaning C depends on A indirectly through B.

**Violation — transitive dependency:**

```sql
-- BAD: zip_code → city, zip_code → state
-- city and state depend on zip_code, which is a non-key column
CREATE TABLE customers (
    id       BIGINT PRIMARY KEY,
    name     VARCHAR(200) NOT NULL,
    zip_code CHAR(5)      NOT NULL,
    city     VARCHAR(100) NOT NULL,  -- depends on zip_code, not on id
    state    CHAR(2)      NOT NULL   -- depends on zip_code, not on id
);
-- Update anomaly: if a city's name changes, every customer in that ZIP must be updated
-- Inconsistency: two customers with the same zip_code could have different cities

-- CORRECT: extract the dependent data
CREATE TABLE zip_codes (
    zip_code CHAR(5)      PRIMARY KEY,
    city     VARCHAR(100) NOT NULL,
    state    CHAR(2)      NOT NULL
);

CREATE TABLE customers (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name     VARCHAR(200) NOT NULL,
    zip_code CHAR(5)      NOT NULL REFERENCES zip_codes(zip_code)
);
```

### A Full Normalisation Example

Let's start with a single unnormalised "order report" table and normalise it to 3NF step by step.

**The unnormalised table:**

```sql
-- Everything in one place — convenient but problematic
CREATE TABLE order_report (
    order_id        BIGINT,
    order_date      TIMESTAMP,
    customer_name   VARCHAR(200),
    customer_email  VARCHAR(255),
    customer_city   VARCHAR(100),
    product_name    VARCHAR(200),
    product_price   NUMERIC(10, 2),
    category_name   VARCHAR(100),
    quantity        INTEGER,
    line_total      NUMERIC(10, 2),
    salesperson_name VARCHAR(200),
    salesperson_region VARCHAR(100)
);
```

**Problems with this design:**
- A customer's email appears in every order they ever placed — update their email and you update multiple rows
- A product's price appears in every line item — change the price and historical orders change too
- Deleting the last order for a customer deletes the customer's data
- category_name depends on product_name, not on the primary key (transitive dependency)
- salesperson_region depends on salesperson_name, not on the order (transitive dependency)

**The normalised schema:**

```sql
-- 1. Customers — each customer's data in one place
CREATE TABLE customers (
    id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    city  VARCHAR(100)
);

-- 2. Categories — independent entity
CREATE TABLE categories (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Products — category_id removes the transitive dependency
CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(200)   NOT NULL,
    category_id BIGINT         NOT NULL REFERENCES categories(id)
);

-- 4. Salespeople — region removed from orders table
CREATE TABLE salespeople (
    id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name   VARCHAR(200) NOT NULL,
    region VARCHAR(100) NOT NULL
);

-- 5. Orders — the transaction record
CREATE TABLE orders (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id   BIGINT         NOT NULL REFERENCES customers(id),
    salesperson_id BIGINT        REFERENCES salespeople(id),
    order_date    TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- 6. Order items — the line items with price at time of purchase
-- Note: we store the unit_price here (not a reference to products.price)
-- because prices change over time and historical orders must reflect
-- what was actually charged — this is a deliberate design decision
CREATE TABLE order_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id   BIGINT         NOT NULL REFERENCES orders(id),
    product_id BIGINT         NOT NULL REFERENCES products(id),
    quantity   INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL  -- price at time of purchase
);
```

To reproduce the original "order report" view, you write a query with joins:

```sql
SELECT
    o.id            AS order_id,
    o.order_date,
    c.name          AS customer_name,
    c.email         AS customer_email,
    c.city          AS customer_city,
    p.name          AS product_name,
    oi.unit_price   AS product_price,
    cat.name        AS category_name,
    oi.quantity,
    oi.quantity * oi.unit_price AS line_total,
    sp.name         AS salesperson_name,
    sp.region       AS salesperson_region
FROM orders o
INNER JOIN customers  c   ON o.customer_id    = c.id
LEFT  JOIN salespeople sp ON o.salesperson_id = sp.id
INNER JOIN order_items oi ON o.id             = oi.order_id
INNER JOIN products    p  ON oi.product_id    = p.id
INNER JOIN categories  cat ON p.category_id   = cat.id
ORDER BY o.order_date, o.id, oi.id;
```

### When to Intentionally Denormalise

Normalisation is the right starting point — always design normalised first. But there are valid reasons to intentionally deviate from full normalisation:

**Read performance:** A heavily normalised schema with many tables requires many joins for common queries. For read-heavy reporting applications, pre-joined or pre-aggregated summary tables can dramatically improve query performance. These are sometimes called materialised views or data marts.

**Historical data:** As shown in the order_items example, storing the price at the time of purchase (rather than a reference to the current product price) is intentional denormalisation that preserves historical accuracy. The same applies to customer addresses on orders — you need the address that was used at the time of purchase, not the current address.

**JSON columns:** Storing flexible attributes as JSONB in PostgreSQL is a form of denormalisation that trades some querying capability for schema flexibility. This is appropriate for attributes that vary significantly by category and are rarely queried individually.

**Caching aggregates:** Storing a pre-calculated total on a parent row (order.total instead of summing order_items) is denormalisation. It adds update overhead (you must update the total when items change) but makes the common case of displaying the order total fast. This is a judgment call based on the read/write ratio.

The rule: normalise first, denormalise deliberately and consciously for specific performance or design reasons, and document those decisions.

---

## Indexes and Performance

### How B-Tree Indexes Work

A B-tree (balanced tree) index stores index entries sorted by value in a tree structure. Each internal node stores key values and pointers to child nodes. Leaf nodes store the actual index entries (key value + pointer to the table row). The tree is always balanced — every leaf node is at the same depth.

When you query `WHERE email = 'alice@example.com'`, the database traverses the tree from root to leaf in O(log n) operations — instead of scanning every row in the table (O(n)). For a table with 10 million rows, a B-tree index makes a lookup that would take millions of row reads take roughly 23 comparisons (log₂ 10,000,000 ≈ 23).

B-tree indexes are efficient for: exact equality (`=`), range queries (`>`, `<`, `BETWEEN`), sorting (`ORDER BY`), and prefix matching (`LIKE 'alice%'`). They are NOT efficient for: suffix matching (`LIKE '%alice'`), `IS NULL` on high-cardinality columns, or columns with very low cardinality (like a boolean field — only two values, so the index does not narrow results much).

### Creating Effective Indexes

```sql
-- Index the columns you filter on most frequently
CREATE INDEX idx_orders_user_id    ON orders (user_id);
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Composite index — helps queries that filter on multiple columns together
-- Order matters: put the most selective column first, then the next
-- This index helps: WHERE user_id = ? AND status = ?
-- This index also helps: WHERE user_id = ?
-- This index does NOT help: WHERE status = ? (without user_id)
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Partial index — smaller and faster for queries that always include a condition
CREATE INDEX idx_active_users ON users (email) WHERE active = true;
CREATE INDEX idx_pending_orders ON orders (created_at) WHERE status = 'pending';

-- Index foreign keys — always do this
-- Foreign keys are used in joins and subqueries; unindexed FK columns cause slow joins
CREATE INDEX idx_orders_user_id      ON orders (user_id);
CREATE INDEX idx_order_items_order   ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_employees_dept      ON employees (department_id);
CREATE INDEX idx_employees_manager   ON employees (manager_id);

-- Unique index — enforces uniqueness and provides fast lookup
-- UNIQUE constraint on a column creates this automatically
CREATE UNIQUE INDEX idx_users_email ON users (email);
```

### EXPLAIN ANALYZE — Reading a Query Plan

`EXPLAIN ANALYZE` shows how the database plans to execute a query and how long it actually took. This is your primary tool for diagnosing slow queries.

```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 20;
```

A query plan output (simplified):

```
Limit  (cost=245.67..245.72 rows=20 width=240) (actual time=3.2..3.2 rows=20)
  ->  Sort  (cost=245.67..248.17 rows=1000 width=240) (actual time=3.2..3.2)
        ->  HashAggregate  (cost=190.00..200.00 rows=1000) (actual time=2.8..3.0)
              ->  Hash Left Join  (cost=50.00..175.00 rows=3000) (actual time=0.8..2.5)
                    Hash Cond: (o.user_id = u.id)
                    ->  Seq Scan on orders o  (cost=0.00..45.00) (actual time=0.1..0.5)
                    ->  Hash  (cost=35.00..35.00 rows=1200) (actual time=0.4..0.4)
                          ->  Seq Scan on users u  (cost=0.00..35.00) (actual time=0.1..0.4)
                                Filter: (active = true)
```

**Reading the plan:** Each node shows the operation (Seq Scan, Index Scan, Hash Join, etc.), estimated cost, and actual time. Key things to look for:

- **Seq Scan on a large table** — a full table scan. Usually means a missing index on the filter column. Acceptable on small tables.
- **Index Scan** — the index is being used. Good.
- **cost=X..Y** — estimated startup cost (X) and total cost (Y). Relative values, not wall-clock time.
- **actual time=X..Y** — measured startup and total time in milliseconds.
- **rows=N** — actual rows returned. If this is vastly different from the estimate, the query planner has inaccurate statistics and may be making poor choices.

```sql
-- Force index statistics to be updated (run after bulk inserts)
ANALYZE users;
ANALYZE orders;
VACUUM ANALYZE users;  -- also reclaims dead row space
```

### Common Performance Problems

**N+1 at the SQL level:** Executing N queries in a loop instead of one query with a join. This is the SQL manifestation of the same N+1 problem covered in the Java Overview.

```sql
-- BAD: N+1 pattern (executing in application code)
-- SELECT * FROM orders WHERE user_id = 1;  -- 1 query
-- SELECT * FROM orders WHERE user_id = 2;  -- 2nd query
-- SELECT * FROM orders WHERE user_id = 3;  -- 3rd query... etc.

-- GOOD: one query with WHERE IN or a JOIN
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE user_id IN (1, 2, 3, 4, 5)
GROUP BY user_id;
```

**Missing index on a frequently filtered column:**

```sql
-- Slow: full table scan on a large orders table
SELECT * FROM orders WHERE status = 'pending';

-- Add an index
CREATE INDEX idx_orders_status ON orders (status);

-- Even better: partial index (smaller, faster for this specific query)
CREATE INDEX idx_pending_orders ON orders (id, created_at) WHERE status = 'pending';
```

**SELECT * fetching unnecessary data:** Always select only the columns you need, especially when the table has wide rows or JSONB/TEXT columns with large values.

```sql
-- BAD: fetches all columns including large content fields
SELECT * FROM articles WHERE published = true;

-- GOOD: fetch only what you display
SELECT id, title, author_id, published_at FROM articles WHERE published = true;
```

**Applying functions to indexed columns in WHERE clauses breaks index usage:**

```sql
-- BAD: function on indexed column — forces a full table scan
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
SELECT * FROM orders WHERE EXTRACT(YEAR FROM created_at) = 2026;

-- GOOD: rewrite to preserve index usability
SELECT * FROM users WHERE email = LOWER('alice@example.com');  -- function on the value
SELECT * FROM orders WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';

-- PostgreSQL: functional index for case-insensitive email matching
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
-- Now LOWER(email) = 'alice@example.com' uses this index
```

---

## Transactions and Concurrency

### Transaction Basics

A transaction is a sequence of SQL operations that execute as a single atomic unit. Either all succeed (commit) or none do (rollback).

```sql
-- Explicit transaction
BEGIN;  -- or: START TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;

COMMIT;  -- makes all changes permanent

-- On error: rollback instead
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
-- If the second UPDATE fails:
ROLLBACK;  -- undoes the first UPDATE

-- Savepoints — partial rollback within a transaction
BEGIN;
INSERT INTO orders (user_id, total) VALUES (1, 100);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 5, 2);
-- If this fails, we can roll back to just before the item insert
ROLLBACK TO SAVEPOINT order_created;
-- Then try alternative action, then commit
COMMIT;
```

In Spring Boot with `@Transactional`, the framework manages BEGIN and COMMIT/ROLLBACK automatically. Understanding what is happening at the SQL level helps you reason about when transactions start and end, and what happens when exceptions are thrown.

### Isolation Levels

Isolation levels control how much concurrent transactions see each other's changes. There is a trade-off: higher isolation gives more consistent results but reduces concurrency (more contention and locking).

The SQL standard defines four isolation levels and three problems they prevent:

**Dirty read:** Reading data from another transaction that has not yet committed. If that transaction later rolls back, you read data that never existed.

**Non-repeatable read:** Reading the same row twice in the same transaction and getting different results because another transaction committed a change between your reads.

**Phantom read:** Running the same query twice in the same transaction and getting different rows because another transaction inserted or deleted rows matching your filter.

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible |
| READ COMMITTED | Prevented | Possible | Possible |
| REPEATABLE READ | Prevented | Prevented | Possible |
| SERIALIZABLE | Prevented | Prevented | Prevented |

```sql
-- Set isolation level for the current transaction
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- or
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- or
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Set the default isolation level for the session
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

**PostgreSQL's default:** READ COMMITTED. This means a query sees only data that was committed before the query began (not before the transaction began). This is the right default for most applications — it prevents dirty reads while allowing good concurrency.

**Spring Boot's default:** READ COMMITTED (the database default). You can override per transaction: `@Transactional(isolation = Isolation.REPEATABLE_READ)`.

**When to use higher isolation:**

- **REPEATABLE READ:** When a transaction reads data multiple times and needs consistent results across those reads. Financial calculations that read a balance, compute a result, and then update — the balance must not change between the read and the update.
- **SERIALIZABLE:** When transactions must behave as if they ran one at a time. Rarely needed, has a significant performance cost.

### Optimistic vs Pessimistic Locking

**Pessimistic locking** assumes conflicts will happen — lock the row when you read it so no one else can modify it until you commit.

```sql
-- SELECT FOR UPDATE — locks the selected rows
-- Other transactions trying to SELECT FOR UPDATE or UPDATE these rows will wait
BEGIN;
SELECT * FROM accounts WHERE id = 42 FOR UPDATE;
-- Now update safely — no other transaction can modify this row until we commit
UPDATE accounts SET balance = balance - 100 WHERE id = 42;
COMMIT;

-- SELECT FOR SHARE — allows other reads but prevents updates
SELECT * FROM products WHERE id = 5 FOR SHARE;
```

**Optimistic locking** assumes conflicts are rare — do not lock on read, but check at update time that nobody modified the row since you read it. Implemented with a version number or timestamp.

```sql
-- Version column approach
CREATE TABLE products (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    VARCHAR(200) NOT NULL,
    price   NUMERIC(10, 2) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

-- Read the product including its version
SELECT id, name, price, version FROM products WHERE id = 5;
-- Returns: id=5, name='Widget', price=9.99, version=3

-- Update only if version matches what we read
UPDATE products
SET name = 'Super Widget', price = 12.99, version = version + 1
WHERE id = 5 AND version = 3;  -- the condition on version is the key
-- Returns: UPDATE 1 — success, we updated it
-- Returns: UPDATE 0 — someone else modified it (version changed), we lost the race
-- Application code checks the count and retries or shows a conflict error
```

In Spring Boot JPA, optimistic locking is implemented with the `@Version` annotation on an entity field — Hibernate manages the version check automatically.

### Deadlocks

A deadlock occurs when two transactions each hold a lock the other needs, creating a circular wait.

```
Transaction A: locks row 1, waits for row 2
Transaction B: locks row 2, waits for row 1
Both wait forever — deadlock!
```

Databases detect deadlocks and automatically roll back one of the transactions (the "victim"), allowing the other to proceed. The rolled-back transaction receives an error, and the application must retry.

```sql
-- Classic deadlock scenario
-- Transaction A                    -- Transaction B
BEGIN;                               BEGIN;
UPDATE accounts SET ... WHERE id=1;  UPDATE accounts SET ... WHERE id=2;
-- A holds lock on row 1            -- B holds lock on row 2
UPDATE accounts SET ... WHERE id=2;  UPDATE accounts SET ... WHERE id=1;
-- A waits for B's lock on row 2    -- B waits for A's lock on row 1
-- DEADLOCK — one will be rolled back
```

**Preventing deadlocks:**

- Always acquire locks in the same order. If both transactions lock row 1 before row 2, the second transaction simply waits for the first — no deadlock.
- Keep transactions short. Long transactions hold locks longer, increasing the chance of conflict.
- Use `SELECT FOR UPDATE` only when you genuinely need to update the row.
- Use optimistic locking for read-heavy workloads with occasional conflicts.

---

## PostgreSQL Specifics

### Features Unique to PostgreSQL

PostgreSQL implements more of the SQL standard than most databases and adds numerous extensions. These are the features most relevant to Spring Boot full-stack development.

### The `::` Cast Operator

PostgreSQL allows type casting with the `::` operator — more concise than the standard `CAST(value AS type)`.

```sql
-- Standard SQL cast
SELECT CAST('2026-01-15' AS DATE);
SELECT CAST(42.5 AS INTEGER);

-- PostgreSQL :: cast (equivalent, more concise)
SELECT '2026-01-15'::DATE;
SELECT 42.5::INTEGER;           -- 42 (truncates)
SELECT '3.14'::NUMERIC;
SELECT NOW()::DATE;              -- today's date from a timestamp
SELECT '{"key": "value"}'::JSONB;
```

### RETURNING Clause

The RETURNING clause returns values from rows affected by INSERT, UPDATE, or DELETE. This eliminates the need for a separate SELECT after a modification.

```sql
-- Get the generated ID after INSERT
INSERT INTO orders (user_id, total)
VALUES (42, 99.99)
RETURNING id, created_at;

-- Get updated values after UPDATE
UPDATE users SET active = false
WHERE last_login < NOW() - INTERVAL '1 year'
RETURNING id, email, last_login;

-- Get deleted rows
DELETE FROM sessions WHERE expires_at < NOW()
RETURNING user_id, created_at;

-- In Spring Boot JPA, @Query with RETURNING is not directly supported
-- Use a native query:
@Modifying
@Query(value = "UPDATE users SET active = false WHERE id = :id RETURNING email",
       nativeQuery = true)
String deactivateAndReturnEmail(@Param("id") Long id);
```

### ILIKE — Case-Insensitive LIKE

```sql
-- LIKE — case-sensitive
SELECT * FROM users WHERE name LIKE 'Alice%';  -- only 'Alice', not 'alice'

-- ILIKE — case-insensitive (PostgreSQL only)
SELECT * FROM users WHERE name ILIKE 'alice%';  -- matches 'Alice', 'ALICE', 'alice'
SELECT * FROM users WHERE email ILIKE '%@gmail.com';

-- Standard SQL equivalent using LOWER()
SELECT * FROM users WHERE LOWER(name) LIKE 'alice%';

-- For indexed ILIKE, create a functional index
CREATE INDEX idx_users_name_lower ON users (LOWER(name));
```

### Array Types

PostgreSQL supports array columns natively. Useful for tags, permissions lists, or simple multi-value attributes.

```sql
CREATE TABLE articles (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    tags  TEXT[]   -- array of text
);

INSERT INTO articles (title, tags)
VALUES ('PostgreSQL Guide', ARRAY['database', 'sql', 'postgresql']);

-- Array operators
SELECT * FROM articles WHERE 'sql' = ANY(tags);         -- contains 'sql'
SELECT * FROM articles WHERE tags @> ARRAY['sql', 'database']; -- contains both
SELECT * FROM articles WHERE tags && ARRAY['sql', 'nosql']; -- overlap (any in common)
SELECT tags[1] FROM articles;  -- first element (1-indexed)
SELECT array_length(tags, 1) FROM articles; -- number of elements

-- GIN index for array containment queries
CREATE INDEX idx_articles_tags ON articles USING GIN (tags);
```

### Generate Series — Useful for Testing and Reporting

```sql
-- Generate a series of numbers
SELECT * FROM generate_series(1, 10);           -- 1 through 10
SELECT * FROM generate_series(0, 100, 10);      -- 0, 10, 20, ... 100

-- Generate a date series — very useful for reporting with no gaps
SELECT generate_series(
    '2026-01-01'::DATE,
    '2026-12-31'::DATE,
    '1 month'::INTERVAL
) AS month;

-- Fill in gaps in reporting data (no orders on some days)
WITH date_series AS (
    SELECT generate_series(
        DATE_TRUNC('day', MIN(created_at)),
        DATE_TRUNC('day', MAX(created_at)),
        '1 day'::INTERVAL
    )::DATE AS day
    FROM orders
),
daily_orders AS (
    SELECT created_at::DATE AS day, SUM(total) AS revenue
    FROM orders
    GROUP BY created_at::DATE
)
SELECT ds.day, COALESCE(do.revenue, 0) AS revenue
FROM date_series ds
LEFT JOIN daily_orders do ON ds.day = do.day
ORDER BY ds.day;
```

### Database Differences Reference

| Feature | PostgreSQL | MySQL | SQL Server | Oracle |
|---|---|---|---|---|
| Auto-increment | `GENERATED ALWAYS AS IDENTITY` or `SERIAL` | `AUTO_INCREMENT` | `IDENTITY(1,1)` | `GENERATED ALWAYS AS IDENTITY` |
| String concat | `\|\|` or `CONCAT()` | `CONCAT()` (not `\|\|`) | `+` or `CONCAT()` | `\|\|` or `CONCAT()` |
| UPSERT | `ON CONFLICT DO UPDATE` | `ON DUPLICATE KEY UPDATE` | `MERGE` | `MERGE` |
| Case-insensitive search | `ILIKE` or `LOWER()` | `LIKE` (case-insensitive by default) | `LIKE` (case-insensitive by default) | `UPPER()`/`LOWER()` |
| Top N rows | `LIMIT n` | `LIMIT n` | `TOP n` or `FETCH FIRST n ROWS ONLY` | `FETCH FIRST n ROWS ONLY` |
| Current timestamp | `NOW()` | `NOW()` | `GETDATE()` | `SYSDATE` |
| Boolean | `BOOLEAN` | `TINYINT(1)` | `BIT` | `NUMBER(1)` |
| UUID generate | `gen_random_uuid()` | `UUID()` | `NEWID()` | `SYS_GUID()` |
| String to date | `TO_DATE()` | `STR_TO_DATE()` | `CONVERT()` | `TO_DATE()` |
| Regex match | `~ 'pattern'` | `REGEXP 'pattern'` | none built-in | `REGEXP_LIKE()` |
| Full outer join | Supported | Supported (MySQL 8+) | Supported | Supported |
| Window functions | Supported | MySQL 8+ | Supported | Supported |
| Recursive CTE | Supported | MySQL 8+ | Supported | Supported |

---

## SQL in the Interview Context

### What Interviewers Are Testing

SQL interview questions for senior developers test three levels: whether you can write correct SQL, whether you understand why the SQL works the way it does, and whether you can reason about performance. A query that produces the right result but would take 30 seconds to run on a million-row table shows incomplete knowledge. Being able to write the query AND explain its execution plan AND suggest index improvements is the senior answer.

### 12 Worked Interview Problems

---

### Problem 1 — Basic Join with Aggregation
**Difficulty:** Easy | **Tests:** JOIN, GROUP BY, aggregate functions

**Question:** Given a users table and an orders table, write a query that returns each user's name, email, number of orders, and total amount spent. Include users with no orders (showing 0 for both counts).

**Thought process:** We need data from two tables — users and orders. Since we want all users including those with no orders, we need a LEFT JOIN (INNER JOIN would exclude users with no orders). We want one row per user so we need GROUP BY. The COUNT and SUM aggregate across each user's orders.

```sql
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id)          AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;
```

**Why `COALESCE(SUM(o.total), 0)`:** When a user has no orders, the LEFT JOIN produces NULL for all order columns. SUM of NULLs returns NULL, not 0. COALESCE converts that NULL to 0. COUNT(o.id) already returns 0 for no rows (not NULL), so no COALESCE needed there.

**Why GROUP BY includes name and email:** The SQL standard requires all non-aggregated SELECT columns to appear in GROUP BY. Since we group by id (which is unique), name and email are functionally determined — they cannot vary — but we must still list them.

---

### Problem 2 — Finding the Top N Per Group
**Difficulty:** Medium | **Tests:** Window functions, subquery

**Question:** Write a query to find the 3 highest-value orders for each user.

**Thought process:** "Top N per group" is a classic window function use case. Rank orders within each user's group by total descending, then filter to ranks 1 through 3.

```sql
SELECT user_id, id AS order_id, total, order_rank
FROM (
    SELECT
        user_id,
        id,
        total,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY total DESC
        ) AS order_rank
    FROM orders
) ranked
WHERE order_rank <= 3
ORDER BY user_id, order_rank;
```

**ROW_NUMBER vs RANK:** If two orders have the same total, ROW_NUMBER gives them distinct ranks (1, 2) — you get exactly 3 results per user. RANK gives them the same rank (1, 1) and skips ranks — you might get more than 3 results if there are ties. Choose based on the requirement.

---

### Problem 3 — Month-over-Month Growth
**Difficulty:** Medium | **Tests:** Window functions (LAG), date functions, CTEs

**Question:** Calculate monthly revenue and the percentage change from the previous month.

```sql
WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total)                       AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_TRUNC('month', created_at)
),
with_prev AS (
    SELECT
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) AS prev_revenue
    FROM monthly_revenue
)
SELECT
    TO_CHAR(month, 'YYYY-MM')                          AS month,
    revenue,
    prev_revenue,
    revenue - prev_revenue                              AS change,
    ROUND(
        (revenue - prev_revenue) / prev_revenue * 100, 2
    )                                                   AS pct_change
FROM with_prev
ORDER BY month;
```

**Why a CTE:** Breaking this into steps makes it readable and debuggable. The monthly_revenue CTE does the aggregation. The with_prev CTE adds the LAG calculation. The final SELECT formats and computes the change. Each step is clear and testable independently.

---

### Problem 4 — Identifying Gaps in Sequential Data
**Difficulty:** Medium | **Tests:** Window functions (LAG), filtering

**Question:** Given an orders table, find users who had a gap of more than 30 days between consecutive orders.

```sql
WITH order_gaps AS (
    SELECT
        user_id,
        created_at,
        LAG(created_at) OVER (
            PARTITION BY user_id
            ORDER BY created_at
        ) AS prev_order_date,
        created_at - LAG(created_at) OVER (
            PARTITION BY user_id
            ORDER BY created_at
        ) AS days_since_last
    FROM orders
)
SELECT DISTINCT user_id, MAX(days_since_last) AS longest_gap
FROM order_gaps
WHERE days_since_last > INTERVAL '30 days'
GROUP BY user_id
ORDER BY longest_gap DESC;
```

---

### Problem 5 — Cumulative Distribution
**Difficulty:** Medium | **Tests:** Window functions, aggregation

**Question:** Rank customers by total spending and show what percentile each falls in.

```sql
WITH customer_spending AS (
    SELECT
        user_id,
        SUM(total) AS total_spent
    FROM orders
    GROUP BY user_id
)
SELECT
    user_id,
    total_spent,
    RANK() OVER (ORDER BY total_spent DESC)         AS spending_rank,
    ROUND(
        PERCENT_RANK() OVER (ORDER BY total_spent) * 100, 1
    )                                                AS percentile,
    NTILE(4) OVER (ORDER BY total_spent)            AS quartile
FROM customer_spending
ORDER BY total_spent DESC;
```

---

### Problem 6 — The Self-Join Problem
**Difficulty:** Medium | **Tests:** Self join, filtering

**Question:** Find all pairs of products in the same category where the price difference is less than 5.

```sql
SELECT
    p1.id     AS product1_id,
    p1.name   AS product1,
    p2.id     AS product2_id,
    p2.name   AS product2,
    p1.category_id,
    ABS(p1.price - p2.price) AS price_difference
FROM products p1
INNER JOIN products p2
    ON p1.category_id = p2.category_id
    AND p1.id < p2.id           -- prevents (A,B) and (B,A) duplicates and (A,A) self-pairs
    AND ABS(p1.price - p2.price) < 5
ORDER BY price_difference, p1.name;
```

**Why `p1.id < p2.id`:** Without this, every pair appears twice (A,B) and (B,A), and every product pairs with itself (A,A). This condition ensures each unique pair appears exactly once.

---

### Problem 7 — NOT IN vs NOT EXISTS vs LEFT JOIN IS NULL
**Difficulty:** Medium | **Tests:** Understanding of NULL behaviour, alternative approaches

**Question:** Find all users who have never placed an order. Write it three ways and explain the difference.

```sql
-- Method 1: NOT IN — DANGEROUS if orders.user_id can be NULL
SELECT id, name FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
-- If any row in orders has user_id = NULL, this returns nothing at all!
-- Because: id NOT IN (..., NULL) → id != NULL → UNKNOWN → row excluded

-- Method 2: NOT EXISTS — safe with NULLs, often more efficient
SELECT id, name FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
-- Correctly handles NULLs — the correlated subquery checks each user

-- Method 3: LEFT JOIN IS NULL — efficient, readable
SELECT u.id, u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;  -- no matching order exists
```

**The answer interviewers want:** "I prefer NOT EXISTS or LEFT JOIN IS NULL. NOT IN is dangerous with nullable columns because of three-valued logic — if the subquery returns any NULL values, NOT IN returns nothing for all rows. This is a subtle bug that is hard to notice in testing if there happen to be no NULL user_ids. NOT EXISTS is always safe. LEFT JOIN IS NULL is also safe and can be more efficient when an index exists on the join column."

---

### Problem 8 — Pivot / Crosstab
**Difficulty:** Medium-Hard | **Tests:** Conditional aggregation, CASE

**Question:** Write a query that shows total orders per status (pending, completed, cancelled) as columns rather than rows.

```sql
SELECT
    DATE_TRUNC('month', created_at)            AS month,
    COUNT(*) FILTER (WHERE status = 'pending')   AS pending_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count,
    SUM(total) FILTER (WHERE status = 'completed') AS completed_revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Without the FILTER syntax (works in all databases):
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(CASE WHEN status = 'pending'   THEN 1 END) AS pending_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_count
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

---

### Problem 9 — Optimise This Query
**Difficulty:** Medium | **Tests:** Performance knowledge, index awareness

**Question:** This query is running slowly on a table with 5 million rows. How would you diagnose and fix it?

```sql
-- Slow query
SELECT *
FROM orders
WHERE EXTRACT(YEAR FROM created_at) = 2026
AND LOWER(status) = 'completed';
```

**Answer:**

"Two problems here. First, `EXTRACT(YEAR FROM created_at)` applies a function to the indexed column `created_at`, preventing index usage — the database must compute EXTRACT for every row. I'd rewrite it as a range condition: `created_at >= '2026-01-01' AND created_at < '2027-01-01'` — this allows a B-tree index scan.

Second, `LOWER(status)` applies a function to status. If status values are stored consistently (always lowercase or always uppercase), I'd normalise the data and query without LOWER. If case truly varies, I'd create a functional index: `CREATE INDEX idx_orders_status_lower ON orders (LOWER(status))`.

Third, `SELECT *` fetches all columns. For a 5-million-row table this is expensive, especially if there are wide columns. I'd select only the columns needed.

I'd run `EXPLAIN ANALYZE` on both the original and rewritten queries to verify the index is being used and compare actual execution times. I'd also check whether there's already an index on `created_at` — if not, that's the highest-impact change."

---

### Problem 10 — Schema Design Question
**Difficulty:** Medium | **Tests:** Normalisation, schema design

**Question:** Design a schema for a multi-tenant SaaS application where multiple companies (tenants) each have users, and users can have multiple roles per tenant.

```sql
-- Tenants
CREATE TABLE tenants (
    id         UUID        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    domain     VARCHAR(255) UNIQUE,
    plan       VARCHAR(50)  NOT NULL DEFAULT 'starter',
    active     BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Users — global, not tenant-specific (allow SSO across tenants)
CREATE TABLE users (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(200) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Tenant membership — which users belong to which tenants
CREATE TABLE tenant_users (
    tenant_id  UUID   NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    active     BOOLEAN NOT NULL DEFAULT true,
    joined_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, user_id)
);

-- Roles — defined per tenant (each tenant may have custom roles)
CREATE TABLE roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    permissions JSONB        NOT NULL DEFAULT '[]',
    UNIQUE (tenant_id, name)  -- role names unique within a tenant
);

-- User role assignments within a tenant
CREATE TABLE user_roles (
    tenant_id  UUID   NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    role_id    BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    granted_by BIGINT     REFERENCES users(id),
    PRIMARY KEY (tenant_id, user_id, role_id),
    FOREIGN KEY (tenant_id, user_id) REFERENCES tenant_users(tenant_id, user_id)
);

-- Essential indexes
CREATE INDEX idx_tenant_users_user     ON tenant_users (user_id);
CREATE INDEX idx_roles_tenant          ON roles (tenant_id);
CREATE INDEX idx_user_roles_user       ON user_roles (user_id);
CREATE INDEX idx_user_roles_role       ON user_roles (role_id);
```

**Design decisions to explain:** Users are global (not per-tenant) to support SSO and users belonging to multiple tenants. Roles are tenant-scoped — each tenant defines their own. The composite FK on user_roles referencing tenant_users ensures you cannot assign a role to someone who is not a member of the tenant. JSONB permissions on roles provides flexibility without requiring a separate permissions table for a starter schema.

---

### Problem 11 — Recursive Query
**Difficulty:** Hard | **Tests:** Recursive CTEs, hierarchical data

**Question:** Given an org chart table (employees with manager_id), find the complete reporting chain from a given employee up to the CEO, and count the total headcount under each manager.

```sql
-- Part 1: Management chain upward from employee id=42
WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 0 AS level
    FROM employees WHERE id = 42

    UNION ALL

    SELECT e.id, e.name, e.manager_id, c.level + 1
    FROM employees e
    INNER JOIN chain c ON e.id = c.manager_id
)
SELECT name, level FROM chain ORDER BY level;

-- Part 2: Total headcount (direct + indirect) under each manager
WITH RECURSIVE org_tree AS (
    -- Base: every employee is in their own subtree
    SELECT id AS manager_id, id AS employee_id
    FROM employees

    UNION ALL

    -- Recursive: for each manager-employee pair, find the manager's manager
    SELECT ot.manager_id, e.id
    FROM org_tree ot
    INNER JOIN employees e ON e.manager_id = ot.employee_id
)
SELECT
    manager_id,
    m.name AS manager_name,
    COUNT(*) - 1 AS headcount  -- -1 to exclude the manager themselves
FROM org_tree ot
INNER JOIN employees m ON ot.manager_id = m.id
GROUP BY manager_id, m.name
ORDER BY headcount DESC;
```

---

### Problem 12 — Window Function vs GROUP BY
**Difficulty:** Medium | **Tests:** Window functions, understanding of when to use them

**Question:** Show each order alongside the user's total lifetime spending and what percentage this order represents of their total.

```sql
SELECT
    o.id          AS order_id,
    o.user_id,
    o.total       AS order_total,
    SUM(o.total) OVER (PARTITION BY o.user_id) AS lifetime_total,
    ROUND(
        o.total / SUM(o.total) OVER (PARTITION BY o.user_id) * 100, 2
    )              AS pct_of_lifetime
FROM orders o
ORDER BY o.user_id, o.created_at;
```

**Why window functions here, not GROUP BY:** GROUP BY would collapse each user's orders into one row, losing the individual order detail. Window functions compute the aggregate (SUM of user's orders) but return it for every row. This is the defining use case for window functions: aggregate results alongside detail rows.

---

### How to Talk About SQL in Interviews

**When asked to write a query:** Think out loud. Say what tables you need and why, what kind of join, whether you need aggregation, and what the edge cases are. Interviewers value your reasoning as much as the correct query.

**When asked about performance:** Always mention indexes first. Ask about table sizes — a query that is fine on 1,000 rows may need optimisation for 10 million. Mention EXPLAIN ANALYZE as your diagnostic tool.

**When asked about your SQL experience:** Connect it to your Angular and Java background: "I understand the complete request lifecycle — from the Angular HttpClient call through the Spring Boot controller and service, through Hibernate generating SQL, to the database executing the query and returning results. I've debugged N+1 query problems, worked with Flyway for schema migrations, and understand how JPA entity relationships translate to SQL joins."

**What to say about PostgreSQL vs other databases:** "My primary SQL experience is with PostgreSQL. I understand standard SQL thoroughly — SELECT, JOIN, aggregation, transactions, schema design. The differences between databases are mostly in edge syntax (AUTO_INCREMENT vs IDENTITY, ON CONFLICT vs MERGE, LIMIT vs TOP) rather than fundamental concepts. Given standard SQL fluency and documentation access, I can work effectively with any relational database."

---

*End of SQL Guide — pair this with the JPA section of the Java Overview for the complete picture of how SQL and Java interact in a Spring Boot application.*
