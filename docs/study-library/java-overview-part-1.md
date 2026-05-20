# Java Overview — Part 1: Language Fundamentals
### JVM, Java 8–21 Features, Type System, OOP, Collections, Streams, Exception Handling

> **Written for developers with Java 1 through early Java 8 background returning after a gap. Narrative-first, best-practices throughout, TypeScript comparisons as anchors where helpful.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [The JVM and the Platform](#the-jvm-and-the-platform)
- [What's New: Java 8](#whats-new-java-8)
  - [Lambda Expressions](#lambda-expressions)
  - [Functional Interfaces](#functional-interfaces)
  - [Method References](#method-references)
  - [The Streams API](#the-streams-api)
  - [Optional](#optional)
  - [The Date/Time API — java.time](#the-datetime-api--javatime)
  - [Default and Static Methods on Interfaces](#default-and-static-methods-on-interfaces)
- [What's New: Java 9 Through Java 21](#whats-new-java-9-through-java-21)
  - [Java 9 — Modules and Collection Factories](#java-9--modules-and-collection-factories)
  - [Java 10 — Local Variable Type Inference (`var`)](#java-10--local-variable-type-inference-var)
  - [Java 11 — String Methods](#java-11--string-methods)
  - [Java 14 — Switch Expressions](#java-14--switch-expressions)
  - [Java 15 — Text Blocks](#java-15--text-blocks)
  - [Java 16 — Records and Pattern Matching](#java-16--records-and-pattern-matching)
  - [Java 17 — Sealed Classes](#java-17--sealed-classes)
  - [Java 21 — Virtual Threads](#java-21--virtual-threads)
- [The Java Type System](#the-java-type-system)
  - [Primitive Types — The Eight Building Blocks](#primitive-types--the-eight-building-blocks)
  - [Numeric Literals — Readability Helpers](#numeric-literals--readability-helpers)
  - [Long Literals and the L Suffix](#long-literals-and-the-l-suffix)
  - [Wrapper Classes and Autoboxing](#wrapper-classes-and-autoboxing)
  - [Type Conversion — Widening and Narrowing](#type-conversion--widening-and-narrowing)
  - [`BigDecimal` — The Correct Type for Money](#bigdecimal--the-correct-type-for-money)
  - [`null` — The Billion Dollar Mistake](#null--the-billion-dollar-mistake)
  - [`String` in Depth](#string-in-depth)
- [Object-Oriented Java](#object-oriented-java)
  - [Classes and Constructors](#classes-and-constructors)
  - [The Builder Pattern](#the-builder-pattern)
  - [Inheritance and Interfaces](#inheritance-and-interfaces)
  - [Generics](#generics)
  - [Enums](#enums)
- [The Collections Framework](#the-collections-framework)
  - [The Hierarchy](#the-hierarchy)
  - [List — Ordered, Allows Duplicates](#list--ordered-allows-duplicates)
  - [ArrayList](#arraylist)
  - [LinkedList](#linkedlist)
  - [Set — Unordered, No Duplicates](#set--unordered-no-duplicates)
  - [HashSet](#hashset)
  - [LinkedHashSet and TreeSet](#linkedhashset-and-treeset)
  - [Map — Key-Value Pairs](#map--key-value-pairs)
  - [HashMap](#hashmap)
  - [LinkedHashMap, TreeMap, ConcurrentHashMap](#linkedhashmap-treemap-concurrenthashmap)
  - [Choosing the Right Collection](#choosing-the-right-collection)
  - [Comparable and Comparator](#comparable-and-comparator)
- [The Streams API and Optional](#the-streams-api-and-optional)
  - [What Streams Are](#what-streams-are)
  - [Creating Streams](#creating-streams)
  - [Intermediate Operations](#intermediate-operations)
  - [Terminal Operations](#terminal-operations)
  - [Method References](#method-references)
  - [Optional — Handling the Absence of a Value](#optional--handling-the-absence-of-a-value)
- [Exception Handling](#exception-handling)
  - [Checked vs Unchecked Exceptions](#checked-vs-unchecked-exceptions)
  - [try-with-resources](#try-with-resources)
  - [Custom Exceptions](#custom-exceptions)
  - [Exception Best Practices](#exception-best-practices)


## The JVM and the Platform

Java runs on the Java Virtual Machine. You write source code in `.java` files, the compiler (`javac`) produces platform-neutral bytecode in `.class` files, and the JVM executes that bytecode on any platform without recompilation. This is the "write once, run anywhere" model that made Java the dominant enterprise language of the late 1990s and 2000s.

The JVM handles memory management through garbage collection. You do not free memory manually — the GC identifies objects that are no longer reachable and reclaims their memory. In Java 1–5 the default GC was relatively basic. By Java 8, G1GC was available as an option. Java 9 made G1GC the default. Java 11 introduced ZGC for low-latency applications with very large heaps. In practice, for most Spring Boot applications you accept the default GC and only tune it when profiling reveals a problem.

**The release cadence changed significantly after Java 8.** Java historically released major versions every few years. From Java 9 onward, Oracle moved to a six-month release cycle, with Long-Term Support (LTS) releases every three years. The current LTS versions are Java 8, Java 11, Java 17, and Java 21. Most production systems run on one of these four. When you join a team, ask which LTS they are on — this tells you which language features are available and what the codebase will look like.

---

## What's New: Java 8

Java 8 (released March 2014) was the most significant release in the language's history up to that point. It fundamentally changed how Java developers write code by introducing functional programming concepts into a language that had been purely object-oriented. Everything introduced in Java 8 is now considered standard, idiomatic Java — you will encounter it constantly in any modern codebase.

### Lambda Expressions

Before Java 8, passing behaviour as a value required creating anonymous inner classes — verbose boilerplate that obscured the intent. Lambda expressions allow you to express a function as a concise inline value.

```java
// Before Java 8 — anonymous inner class
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Java 8 — lambda expression
Collections.sort(names, (a, b) -> a.compareTo(b));

// Even cleaner — method reference (covered below)
Collections.sort(names, String::compareTo);

// Or using the new List.sort method
names.sort((a, b) -> a.compareTo(b));
names.sort(Comparator.naturalOrder());
```

A lambda expression has the form `(parameters) -> body`. The parameter types are inferred by the compiler. The body is either a single expression (value is returned implicitly) or a block with explicit `return` statements.

```java
// Single expression — return is implicit
Comparator<String> byLength = (a, b) -> a.length() - b.length();

// Block body — return is explicit
Comparator<String> byLengthThenAlpha = (a, b) -> {
    int lengthDiff = a.length() - b.length();
    if (lengthDiff != 0) return lengthDiff;
    return a.compareTo(b);
};
```

Lambdas can capture variables from their enclosing scope, but only variables that are effectively final — variables that are never reassigned after initial assignment (even if they are not declared `final`).

```java
String prefix = "Hello";  // effectively final — never reassigned
List<String> greetings = names.stream()
    .map(name -> prefix + ", " + name)  // captures prefix
    .toList();

// This would NOT compile:
String mutable = "Hello";
mutable = "Hi";  // now mutable is not effectively final
names.stream().map(name -> mutable + ", " + name);  // compile error
```

### Functional Interfaces

A functional interface is any interface with exactly one abstract method. Lambdas implement functional interfaces — the compiler infers which interface the lambda satisfies from the context.

Java 8 introduced the `java.util.function` package with standard functional interfaces so you do not need to define your own for common patterns:

```java
// Predicate<T> — takes T, returns boolean
// Used for: filtering, testing conditions
Predicate<String> isLong = s -> s.length() > 10;
Predicate<User> isActive = User::isActive;
isLong.test("Hello World!");  // true
isLong.and(s -> s.startsWith("H")).test("Hello World!"); // true — composed

// Function<T, R> — takes T, returns R
// Used for: mapping/transforming values
Function<String, Integer> length = String::length;
Function<User, String> getName = User::getName;
length.apply("Hello");  // 5
// Compose functions
Function<String, String> trim = String::strip;
Function<String, Integer> trimThenLength = trim.andThen(length);
trimThenLength.apply("  Hello  ");  // 5

// Consumer<T> — takes T, returns void
// Used for: side effects (logging, saving, printing)
Consumer<String> print  = System.out::println;
Consumer<User>   logUser = u -> log.info("Processing: {}", u);
print.accept("Hello World");

// Supplier<T> — takes nothing, returns T
// Used for: lazy evaluation, factories, default values
Supplier<User>   createDefault = () -> new User("default");
Supplier<String> timestamp     = () -> LocalDateTime.now().toString();
createDefault.get();  // creates a new User when called

// BiFunction<T, U, R> — takes T and U, returns R
BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);
repeat.apply("ha", 3);  // "hahaha"

// UnaryOperator<T> — takes T, returns T (specialised Function)
UnaryOperator<String> toUpper = String::toUpperCase;
UnaryOperator<Integer> doubleIt = n -> n * 2;

// BinaryOperator<T> — takes two T, returns T (specialised BiFunction)
BinaryOperator<Integer> add = (a, b) -> a + b;
BinaryOperator<String>  concat = String::concat;
```

### Method References

Method references are shorthand for lambdas that do nothing but call an existing method. They make code more readable when the lambda body is just a method call.

```java
// 1. Static method reference: ClassName::staticMethod
// lambda:    s -> Integer.parseInt(s)
// reference: Integer::parseInt
List<Integer> numbers = stringList.stream().map(Integer::parseInt).toList();

// 2. Instance method on a specific object: instance::method
// lambda:    s -> myLogger.log(s)
// reference: myLogger::log
stringList.forEach(myLogger::log);

// 3. Instance method on an arbitrary instance: ClassName::instanceMethod
// lambda:    user -> user.getName()
// reference: User::getName
userList.stream().map(User::getName).toList();

// lambda:    s -> s.toUpperCase()
// reference: String::toUpperCase
stringList.stream().map(String::toUpperCase).toList();

// 4. Constructor reference: ClassName::new
// lambda:    name -> new User(name)
// reference: User::new
nameList.stream().map(User::new).toList();
```

### The Streams API

Streams are the feature that most transformed Java code style. A stream is a sequence of elements processed through a pipeline of operations. You declare what you want to do (filter, map, collect) rather than how to do it (for loops, if statements, temporary lists).

Streams are lazy — intermediate operations build a pipeline but do not execute until a terminal operation triggers execution. This allows optimisations: a stream that filters and then finds the first match stops processing as soon as it finds it, without filtering the entire collection.

```java
List<User> users = getUsers();

// The old Java way — imperative
List<String> adminNames = new ArrayList<>();
for (User user : users) {
    if (user.isActive() && "admin".equals(user.getRole())) {
        adminNames.add(user.getName().toUpperCase());
    }
}
Collections.sort(adminNames);

// The Java 8 way — declarative streams
List<String> adminNames = users.stream()
    .filter(User::isActive)
    .filter(u -> "admin".equals(u.getRole()))
    .map(User::getName)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());
```

**Creating streams:**

```java
// From a Collection
Stream<User> stream = users.stream();

// From individual values
Stream<String> values = Stream.of("Alice", "Bob", "Carol");

// From an array
String[] array = {"Alice", "Bob"};
Stream<String> fromArray = Arrays.stream(array);

// Primitive streams — avoid boxing overhead for performance-sensitive code
IntStream    ints    = IntStream.range(0, 10);         // 0 to 9
IntStream    closed  = IntStream.rangeClosed(1, 10);    // 1 to 10
DoubleStream doubles = DoubleStream.of(1.0, 2.5, 3.7);
```

**Intermediate operations** transform one stream into another (lazy):

```java
stream.filter(u -> u.isActive())          // keep elements matching predicate
stream.map(u -> u.getName())              // transform each element
stream.flatMap(u -> u.getRoles().stream()) // map to stream then flatten
stream.distinct()                          // remove duplicates (uses equals/hashCode)
stream.sorted()                            // natural order
stream.sorted(Comparator.comparing(User::getName))  // custom order
stream.limit(10)                           // take at most 10
stream.skip(20)                            // skip first 20
stream.peek(u -> log.debug("{}", u))       // inspect without modifying
```

**Terminal operations** trigger execution and produce a result:

```java
// Collecting results
List<String> list = stream.collect(Collectors.toList());   // mutable List
Set<String>  set  = stream.collect(Collectors.toSet());
String csv        = stream.collect(Collectors.joining(", "));
String bracketed  = stream.collect(Collectors.joining(", ", "[", "]"));

// Grouping
Map<String, List<User>> byDept  = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment));
Map<String, Long> countByDept   = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment, Collectors.counting()));
Map<Boolean, List<User>> split  = users.stream()
    .collect(Collectors.partitioningBy(User::isActive));

// Searching
Optional<User> first   = stream.findFirst();
boolean hasAdmin       = stream.anyMatch(u -> "admin".equals(u.getRole()));
boolean allActive      = stream.allMatch(User::isActive);
boolean noneDeleted    = stream.noneMatch(User::isDeleted);

// Aggregation
long    count    = stream.count();
int     total    = users.stream().mapToInt(User::getAge).sum();
OptionalInt max  = users.stream().mapToInt(User::getAge).max();
OptionalDouble avg = users.stream().mapToInt(User::getAge).average();

// forEach — for side effects
stream.forEach(u -> repository.save(u));
```

> ⚠️ **Warning:** A stream can only be consumed once. After a terminal operation the stream is closed. If you need to use the data multiple times, collect it into a List first and create new streams from the List.

### Optional

`Optional<T>` is a container that may or may not hold a value. It was introduced to make the absence of a value explicit in method signatures rather than relying on null returns. A method returning `Optional<User>` is honestly saying "I may not find a user." A method returning `User` is saying "I always return a user" — returning null instead is a contract violation.

```java
// Creating Optional
Optional<String> present = Optional.of("Alice");           // value known non-null
Optional<String> empty   = Optional.empty();               // explicitly empty
Optional<String> maybe   = Optional.ofNullable(getName()); // might be null

// Consuming Optional — functional style
userRepository.findById(id)
    .ifPresent(user -> processUser(user));

userRepository.findById(id)
    .ifPresentOrElse(
        user -> processUser(user),
        () -> log.warn("User not found: {}", id)
    );

// Transforming Optional
Optional<String> name = userRepository.findById(id).map(User::getName);

// Providing defaults
User user  = userRepository.findById(id).orElse(defaultUser);
User user2 = userRepository.findById(id).orElseGet(() -> createDefault());
User user3 = userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));

// Chaining
Optional<String> deptName = userRepository.findById(id)
    .map(User::getDepartment)
    .map(Department::getName);

// flatMap when mapping returns Optional
Optional<Address> address = userRepository.findById(id)
    .flatMap(User::getPrimaryAddress);
```

**Where to use Optional:** Return types of methods that may not find a result (repository queries, lookups). Do **not** use Optional as method parameters, as field types, or inside collections — these are considered anti-patterns.

### The Date/Time API — java.time

Before Java 8, Java's date and time support was notoriously broken. `java.util.Date` was mutable, `java.util.Calendar` was complex and unintuitive, and neither handled time zones well. Java 8 introduced `java.time` — a complete redesign inspired by the Joda-Time library. It is immutable, thread-safe, and intuitive.

```java
// LocalDate — date only, no time, no timezone
LocalDate today     = LocalDate.now();
LocalDate birthday  = LocalDate.of(1990, Month.MARCH, 15);
LocalDate nextWeek  = today.plusWeeks(1);
LocalDate lastMonth = today.minusMonths(1);

today.getDayOfWeek();     // TUESDAY
today.getMonth();         // MAY
today.getYear();          // 2026
today.isLeapYear();       // false

// LocalTime — time only, no date, no timezone
LocalTime now    = LocalTime.now();
LocalTime noon   = LocalTime.of(12, 0);
LocalTime endDay = LocalTime.of(23, 59, 59);

noon.isAfter(LocalTime.of(10, 0));   // true
noon.plusHours(2);                    // 14:00

// LocalDateTime — date + time, no timezone
LocalDateTime now2     = LocalDateTime.now();
LocalDateTime specific = LocalDateTime.of(2026, 1, 15, 14, 30, 0);
LocalDateTime parsed   = LocalDateTime.parse("2026-01-15T14:30:00");

// ZonedDateTime — date + time + timezone (use for user-facing timestamps)
ZonedDateTime utcNow    = ZonedDateTime.now(ZoneOffset.UTC);
ZonedDateTime londonNow = ZonedDateTime.now(ZoneId.of("Europe/London"));
ZonedDateTime nyNow     = ZonedDateTime.now(ZoneId.of("America/New_York"));

// Instant — a point on the UTC timeline (use for audit timestamps)
Instant now3     = Instant.now();
Instant past     = Instant.parse("2026-01-01T00:00:00Z");
long epochMillis = now3.toEpochMilli();

// Duration — amount of time (hours, minutes, seconds)
Duration twoHours = Duration.ofHours(2);
Duration between  = Duration.between(LocalTime.of(9, 0), LocalTime.of(17, 0));
between.toHours();   // 8

// Period — amount of date-based time (years, months, days)
Period threeMonths = Period.ofMonths(3);
Period between2    = Period.between(LocalDate.of(2020, 1, 1), LocalDate.now());
between2.getYears();  // years since 2020

// Formatting and parsing
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
String formatted = LocalDateTime.now().format(formatter);   // "15/05/2026 14:30"
LocalDateTime parsed2 = LocalDateTime.parse("15/05/2026 14:30", formatter);

// ISO formats — use for APIs and databases
DateTimeFormatter iso = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
LocalDateTime.now().format(iso);  // "2026-05-15T14:30:00"
```

**Which type to use when:**

| Situation | Type |
|---|---|
| Date only (birthdate, due date) | `LocalDate` |
| Time only (opening hours) | `LocalTime` |
| Date and time, no timezone (log timestamps in a single-timezone app) | `LocalDateTime` |
| Date and time with timezone (user-facing, cross-timezone) | `ZonedDateTime` |
| Precise UTC timestamp for audit fields | `Instant` |
| Length of time in seconds/hours | `Duration` |
| Length of time in days/months/years | `Period` |

**In JPA entities:** Map `LocalDate`, `LocalDateTime`, and `Instant` directly — Hibernate handles conversion to database DATE, TIMESTAMP, and TIMESTAMP columns automatically.

### Default and Static Methods on Interfaces

Java 8 allowed interfaces to have concrete method implementations for the first time. This was necessary to add methods to existing interfaces (like `forEach` on `Collection`) without breaking every existing implementation.

```java
// Default method — concrete implementation in an interface
// Implementing classes can override it or use the default
public interface Printable {
    String getDisplayText();  // abstract — must implement

    default void print() {    // default — provided, can override
        System.out.println(getDisplayText());
    }

    default void printWithPrefix(String prefix) {
        System.out.println(prefix + ": " + getDisplayText());
    }
}

// Static method — utility method associated with the interface
public interface Validator<T> {
    boolean validate(T value);

    static <T> Validator<T> of(Predicate<T> predicate) {
        return predicate::test;
    }
}

Validator<String> emailValidator = Validator.of(
    s -> s.contains("@") && s.contains(".")
);
emailValidator.validate("alice@example.com");  // true
```

The practical impact: the Collections API gained `forEach`, `stream()`, `removeIf()`, and `sort()` as default methods without breaking existing code. Every `List`, `Set`, and `Map` implementation automatically inherited these methods.

```java
// These all became available in Java 8 via default methods
list.forEach(item -> log.info("{}", item));
list.removeIf(item -> item.isExpired());
list.sort(Comparator.comparing(Item::getName));
map.forEach((key, value) -> log.info("{}: {}", key, value));
map.replaceAll((key, value) -> value.toUpperCase());
map.getOrDefault("key", "defaultValue");
map.putIfAbsent("key", "value");
map.computeIfAbsent("key", k -> createValue(k));
map.merge("key", 1, Integer::sum);
```

---

## What's New: Java 9 Through Java 21

Java 8 transformed the language. Everything since has refined and extended that transformation — making Java more concise, safer, and more expressive. This section covers the additions most relevant to everyday Spring Boot development.

### Java 9 — Modules and Collection Factories

**The module system (Project Jigsaw)** allows you to declare what packages a JAR exports and what it depends on, enabling strong encapsulation at the library level. In practice, most Spring Boot applications do not write explicit module declarations — you will see `module-info.java` in libraries but rarely write one yourself for application code.

**Collection factory methods** eliminate verbose immutable collection creation:

```java
// Java 8 and before — verbose
List<String> names = Collections.unmodifiableList(
    Arrays.asList("Alice", "Bob", "Carol")
);

// Java 9+ — clean and truly immutable
List<String> names  = List.of("Alice", "Bob", "Carol");
Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 87);
Set<String> roles   = Set.of("admin", "editor", "viewer");
// add() or put() on these throws UnsupportedOperationException
// For mutable with initial values: new ArrayList<>(List.of(...))
```

**Stream improvements:** `takeWhile()` and `dropWhile()` for ordered streams, `Stream.iterate()` with a predicate:

```java
// takeWhile — take elements while predicate is true (stops at first false)
IntStream.iterate(1, n -> n + 1)
    .takeWhile(n -> n < 10)
    .forEach(System.out::println);  // 1 through 9

// dropWhile — skip elements while predicate is true, then take the rest
Stream.of(1, 2, 3, 4, 5, 1, 2)
    .dropWhile(n -> n < 4)
    .toList();  // [4, 5, 1, 2]
```

### Java 10 — Local Variable Type Inference (`var`)

The `var` keyword lets the compiler infer the type of a local variable. Strictly limited to local variables — not method parameters, return types, or fields.

```java
// Before Java 10 — type repeated on both sides
Map<String, List<UserDto>> groupedUsers = new HashMap<String, List<UserDto>>();

// Java 10+ — type inferred
var groupedUsers = new HashMap<String, List<UserDto>>();
var users = userRepository.findAll();  // inferred: List<User>
var name  = user.getName();            // inferred: String
```

**Best practice:** Use `var` when the type is obvious from context and repetition adds no clarity. Avoid it when the inferred type would not be immediately clear to a reader — `var result = process(data)` is less readable than `UserSummary result = process(data)`.

### Java 11 — String Methods

```java
String text = "  Hello World  ";
text.strip();          // "Hello World" — Unicode-aware trim (prefer over trim())
text.stripLeading();   // "Hello World  "
text.stripTrailing();  // "  Hello World"
text.isBlank();        // false — true if empty or only whitespace
"ha".repeat(3);        // "hahaha"
"Java\nPython".lines().toList();  // ["Java", "Python"]
```

Always use `strip()` over `trim()` in new code — it correctly handles Unicode whitespace characters.

### Java 14 — Switch Expressions

Switch as an expression with arrow syntax — no fall-through, no break required, and the compiler enforces exhaustiveness:

```java
// Old switch statement — fall-through requires explicit break
String label;
switch (status) {
    case ACTIVE:   label = "Active";   break;
    case INACTIVE: label = "Inactive"; break;
    default:       label = "Unknown";
}

// Java 14+ switch expression — concise and safe
String label = switch (status) {
    case ACTIVE   -> "Active";
    case INACTIVE -> "Inactive";
    default       -> "Unknown";
};

// Multi-statement case with yield
String desc = switch (status) {
    case ACTIVE -> "Active";
    case INACTIVE -> {
        log.info("Inactive user encountered");
        yield "Inactive";  // yield returns from a block
    }
    default -> "Unknown";
};
```

### Java 15 — Text Blocks

Multi-line strings without escape characters. Particularly useful for SQL, JSON, and HTML:

```java
// Before — escape characters everywhere
String json = "{\n  \"name\": \"Alice\"\n}";

// Java 15+ text block
String json = """
        {
          "name": "Alice",
          "role": "admin"
        }
        """;

// SQL becomes readable
String query = """
        SELECT u.id, u.name, u.email
        FROM users u
        JOIN departments d ON u.department_id = d.id
        WHERE u.active = true
        ORDER BY u.name
        """;
```

The indentation is stripped based on the position of the closing `"""`. Content to the right of the closing `"""` position is preserved.

### Java 16 — Records and Pattern Matching

**Records** are immutable data carriers. The compiler generates the constructor, accessors, `equals()`, `hashCode()`, and `toString()` automatically:

```java
// Before records — enormous boilerplate
public class UserDto {
    private final String name;
    private final String email;
    public UserDto(String name, String email) { this.name = name; this.email = email; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    // equals(), hashCode(), toString() also needed...
}

// Java 16+ record — one line
public record UserDto(String name, String email) {}

// Accessor methods use field name directly (no "get" prefix)
var dto = new UserDto("Alice", "alice@example.com");
dto.name();   // "Alice"
dto.email();  // "alice@example.com"
```

**Pattern matching for `instanceof`** combines the type check and cast:

```java
// Old — check then redundant cast
if (shape instanceof Circle) {
    Circle c = (Circle) shape;
    return Math.PI * c.radius() * c.radius();
}

// Java 16+ — check and bind in one step
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}
```

### Java 17 — Sealed Classes

Sealed classes restrict which classes can extend or implement a type — Java's equivalent of TypeScript discriminated unions:

```java
public sealed interface Shape permits Circle, Rectangle, Triangle {}

public record Circle(double radius)            implements Shape {}
public record Rectangle(double width, double height) implements Shape {}
public record Triangle(double base, double height)   implements Shape {}

// Compiler knows Shape is always one of exactly three types
// Switch expression can be exhaustive without a default clause
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
    case Triangle t  -> 0.5 * t.base() * t.height();
    // No default — compiler verifies exhaustiveness
};
```

### Java 21 — Virtual Threads

Virtual threads are lightweight threads managed by the JVM. Unlike traditional threads (which map one-to-one to OS threads and are expensive), you can create millions of virtual threads. The JVM schedules them on a small pool of OS threads automatically.

For Spring Boot applications, this means synchronous blocking code scales like asynchronous code without the complexity of reactive programming. Enable in Spring Boot 3.2+:

```java
// application.properties
spring.threads.virtual.enabled=true
```

With virtual threads enabled, your existing synchronous service code serves many more concurrent requests without changes. Each request gets its own virtual thread, and when that thread blocks on a database call or HTTP request, the JVM automatically parks it and uses the OS thread for another virtual thread.

---

## The Java Type System

Understanding Java's type system completely is foundational to reading any Java code confidently. Java has two distinct categories of types with fundamentally different behaviour: primitives and reference types.

### Primitive Types — The Eight Building Blocks

Java has eight primitive types. Primitives are not objects — they are raw values stored directly in memory (on the stack for local variables, inline in the object for fields). They cannot be null, cannot be used in generic types directly, and have no methods. Operations on primitives are faster than operations on objects because there is no heap allocation, no garbage collection, and no pointer indirection.

| Type | Size | Range | Default | Use for |
|---|---|---|---|---|
| `byte` | 8-bit signed | -128 to 127 | 0 | Binary data, network protocols |
| `short` | 16-bit signed | -32,768 to 32,767 | 0 | Rarely used directly |
| `int` | 32-bit signed | -2,147,483,648 to 2,147,483,647 | 0 | Default integer type |
| `long` | 64-bit signed | ±9.2 × 10¹⁸ | 0L | Large numbers, timestamps, IDs |
| `float` | 32-bit IEEE 754 | ~±3.4 × 10³⁸ | 0.0f | Rarely — use double instead |
| `double` | 64-bit IEEE 754 | ~±1.8 × 10³⁰⁸ | 0.0d | Default decimal type |
| `boolean` | — | true or false | false | Conditions and flags |
| `char` | 16-bit unsigned | 0 to 65,535 (Unicode) | '\u0000' | Single Unicode character |

In practice you use `int`, `long`, `double`, and `boolean` the vast majority of the time. `byte` and `short` appear when working with binary protocols or when memory is tightly constrained. `char` appears when iterating over characters in a String or doing character arithmetic.

### Numeric Literals — Readability Helpers

```java
// Standard decimal
int million       = 1000000;
int million2      = 1_000_000;    // Java 7+ underscores for readability
long bigNumber    = 9_876_543_210L;  // L suffix required for long literals
double pi         = 3.14159_26535;
float temperature = 98.6f;           // f suffix required for float literals

// Hexadecimal — prefix 0x
int hex   = 0xFF;        // 255
int color = 0x1F4E79;    // a specific blue colour

// Binary — prefix 0b (Java 7+)
int flags = 0b1010_1100;  // useful for bitmask operations

// Scientific notation
double nano  = 1e-9;    // 0.000000001
double mega  = 1e6;     // 1000000.0
```

### Long Literals and the L Suffix

A critical gotcha: without the `L` suffix, a numeric literal is treated as an `int`. If the value exceeds `int` range, you get a compile error. If it is within `int` range but you assign it to a `long`, it works but you must be explicit for values that could overflow:

```java
long millisPerDay = 86400000;       // fine — within int range, widened to long
long nanos        = 86400000000000L; // requires L — exceeds int range
long wrong        = 86400000000000;  // compile error — too large for int literal

// Common gotcha in calculations
long result = 24 * 60 * 60 * 1000 * 1000;  // OVERFLOW! int arithmetic
long result2 = 24L * 60 * 60 * 1000 * 1000; // correct — long arithmetic from start
```

### Wrapper Classes and Autoboxing

Each primitive has a corresponding wrapper class in `java.lang`. Wrapper classes are full objects — they can be null, can be used as generic type parameters, and have utility methods.

| Primitive | Wrapper | Key utility methods |
|---|---|---|
| `int` | `Integer` | `parseInt()`, `valueOf()`, `MAX_VALUE`, `MIN_VALUE`, `toBinaryString()` |
| `long` | `Long` | `parseLong()`, `valueOf()`, `MAX_VALUE` |
| `double` | `Double` | `parseDouble()`, `isNaN()`, `isInfinite()` |
| `boolean` | `Boolean` | `parseBoolean()`, `TRUE`, `FALSE` |
| `char` | `Character` | `isLetter()`, `isDigit()`, `isWhitespace()`, `toUpperCase()` |
| `byte` | `Byte` | `parseByte()` |
| `short` | `Short` | `parseShort()` |
| `float` | `Float` | `parseFloat()` |

**Autoboxing** (Java 5+) automatically converts primitives to wrappers and back. This is convenient but has performance and null-safety implications:

```java
// Autoboxing — int automatically converted to Integer
List<Integer> numbers = new ArrayList<>();
numbers.add(42);          // autoboxes: Integer.valueOf(42)
numbers.add(100);

// Unboxing — Integer automatically converted to int
int first = numbers.get(0);  // unboxes: numbers.get(0).intValue()

// The null trap — unboxing null throws NullPointerException
Integer value = null;
int primitive = value;    // NullPointerException — cannot unbox null

// Performance trap — autoboxing in a loop creates many objects
long sum = 0L;
for (int i = 0; i < 1_000_000; i++) {
    sum += i;   // fine — primitive addition
}

Long sumBoxed = 0L;
for (int i = 0; i < 1_000_000; i++) {
    sumBoxed += i;  // autoboxes each iteration — millions of Long objects!
}

// Integer cache — a subtle equality trap
Integer a = 127;
Integer b = 127;
a == b;   // true — cached range (-128 to 127), same instance

Integer c = 128;
Integer d = 128;
c == d;   // false — outside cache range, different instances
c.equals(d);  // true — always use equals() for wrapper comparison
```

**Best practice:** Use primitives for local variables and method parameters where null is not a valid value. Use wrapper classes for fields that may be null, for generic type parameters, and for entity fields mapping to nullable database columns.

### Type Conversion — Widening and Narrowing

Java converts between numeric types automatically in some directions (widening) and requires explicit casts in others (narrowing).

**Widening conversions** happen automatically, from smaller to larger types. No data is lost:

```java
byte   b = 42;
short  s = b;     // widening — automatic
int    i = s;     // widening — automatic
long   l = i;     // widening — automatic
float  f = l;     // widening — automatic (some precision may be lost for large longs)
double d = f;     // widening — automatic
```

**Narrowing conversions** require an explicit cast. Data may be lost — the higher bits are truncated:

```java
double d = 9.99;
int    i = (int) d;    // narrowing cast — truncates decimal: i = 9 (not rounded!)
long   l = 300L;
byte   b = (byte) l;   // narrowing — 300 exceeds byte range, wraps: b = 44

// Common gotcha — integer division
int a = 5, x = 2;
double result = a / x;        // 2.0 — integer division happens first!
double result2 = (double) a / x;  // 2.5 — cast before division
double result3 = a / (double) x;  // 2.5 — also works

// String to number
int parsed       = Integer.parseInt("42");
long parsedLong  = Long.parseLong("9876543210");
double parsedDbl = Double.parseDouble("3.14");
boolean parsedBool = Boolean.parseBoolean("true");  // case-insensitive
// All throw NumberFormatException if the string is not a valid number

// Number to String
String s1 = String.valueOf(42);       // "42"
String s2 = Integer.toString(42);     // "42"
String s3 = "" + 42;                  // "42" — concatenation, works but verbose
String s4 = String.format("%d", 42);  // "42"
```

### `BigDecimal` — The Correct Type for Money

This is one of the most important practical points in this guide. `double` and `float` use binary floating-point representation, which cannot exactly represent most decimal fractions. This causes surprising rounding errors that are catastrophic in financial applications:

```java
// WRONG — never use double for money
double price    = 0.10;
double tax      = 0.02;
double total    = price + tax;
System.out.println(total);  // 0.12000000000000001 — not 0.12!

double unitPrice = 0.1;
double quantity  = 3;
System.out.println(unitPrice * quantity);  // 0.30000000000000004

// CORRECT — use BigDecimal for all monetary calculations
BigDecimal price2 = new BigDecimal("0.10");   // use String constructor!
BigDecimal tax2   = new BigDecimal("0.02");
BigDecimal total2 = price2.add(tax2);
System.out.println(total2);  // 0.12 — exact

// BigDecimal arithmetic — operations return new BigDecimal (immutable)
BigDecimal a = new BigDecimal("100.00");
BigDecimal b = new BigDecimal("3");

a.add(b);          // 103.00
a.subtract(b);     // 97.00
a.multiply(b);     // 300.00
a.divide(b, 2, RoundingMode.HALF_UP);  // 33.33 — must specify scale and rounding

// Division without scale throws ArithmeticException if result is non-terminating
// new BigDecimal("1").divide(new BigDecimal("3"))  // throws! 1/3 is infinite decimal

// Comparison — do NOT use equals() for value comparison
BigDecimal x = new BigDecimal("2.0");
BigDecimal y = new BigDecimal("2.00");
x.equals(y);      // false — different scale (2.0 vs 2.00)
x.compareTo(y);   // 0 — mathematically equal, use compareTo() for value comparison

// Constants
BigDecimal.ZERO;  // 0
BigDecimal.ONE;   // 1
BigDecimal.TEN;   // 10
```

**The String constructor rule:** Always create `BigDecimal` from a `String`, never from a `double`. `new BigDecimal(0.1)` gives you the imprecise binary representation of 0.1, not the decimal value 0.1. `new BigDecimal("0.1")` gives you exactly 0.1.

**Rounding modes** you will encounter:

| Mode | Behaviour |
|---|---|
| `HALF_UP` | Round to nearest, tie goes up (5.5 → 6). What most people mean by "rounding" |
| `HALF_EVEN` | Round to nearest, tie goes to even digit (banker's rounding) |
| `FLOOR` | Always round toward negative infinity |
| `CEILING` | Always round toward positive infinity |
| `DOWN` | Always round toward zero (truncate) |
| `UNNECESSARY` | Throw ArithmeticException if rounding is needed |

### `null` — The Billion Dollar Mistake

`null` in Java means "no object" — a reference that points to nothing. Tony Hoare, who introduced null references in ALGOL in 1965, later called it his "billion dollar mistake" because of the NPEs it has caused in systems worldwide.

Understanding null is essential for reading Java code, diagnosing bugs, and understanding why modern Java introduced Optional.

```java
// null is a valid value for any reference type
String name = null;     // valid — no String object
User user   = null;     // valid — no User object
int prim    = null;     // compile error — primitives cannot be null

// Accessing members of null throws NullPointerException at runtime
String name2 = null;
name2.length();         // NullPointerException

// Null checks — the pre-Optional way
public String getUpperCaseName(User user) {
    if (user == null) return null;
    if (user.getName() == null) return null;
    return user.getName().toUpperCase();
}

// Modern approaches
// Objects.requireNonNull — validate and fail fast at method entry
public void processUser(User user) {
    Objects.requireNonNull(user, "User cannot be null");
    Objects.requireNonNull(user.getName(), "User name cannot be null");
    // ...
}

// Objects.requireNonNullElse — null-safe default
String name3 = Objects.requireNonNullElse(user.getName(), "Anonymous");

// Optional — make nullability explicit in the type
public Optional<User> findByEmail(String email) {
    // Returns Optional.empty() instead of null
}

// Java 14+ helpful NullPointerException messages
// "Cannot invoke String.length() because <local5> is null"
// tells you exactly which variable was null — not just that NPE occurred
```

### `String` in Depth

`String` is one of Java's most important classes. It is a reference type but is immutable — once created, a String's content never changes. Every "modification" creates a new String object.

```java
// String creation
String literal     = "Hello";        // string pool
String constructed = new String("Hello");  // new object (avoid this)
String formatted   = "Hello %s".formatted("World");  // Java 15+
String joined      = String.join(", ", "Alice", "Bob", "Carol"); // "Alice, Bob, Carol"
String repeated    = "ha".repeat(3);   // "hahaha"

// Comparison — ALWAYS use equals(), never ==
String a = "hello";
String b = new String("hello");
a == b;          // false — different object references
a.equals(b);     // true — same content
"hello".equals(a);  // best practice — literal first prevents NPE if a were null

// Case-insensitive comparison
a.equalsIgnoreCase("HELLO");  // true

// String inspection
"Hello World".length();          // 11
"Hello World".charAt(0);         // 'H'
"Hello World".indexOf("World");  // 6
"Hello World".contains("World"); // true
"Hello World".startsWith("He");  // true
"Hello World".endsWith("ld");    // true
"Hello World".isEmpty();         // false — true only for ""
"   ".isBlank();                 // true — Java 11+
"Hello World".substring(6);      // "World"
"Hello World".substring(0, 5);   // "Hello"

// Transformation
"hello world".toUpperCase();            // "HELLO WORLD"
"HELLO WORLD".toLowerCase();            // "hello world"
"  hello  ".strip();                    // "hello" — prefer over trim()
"hello world".replace("world", "Java"); // "hello Java"
"a,b,c,d".split(",");                   // ["a", "b", "c", "d"]
String.join("-", "a", "b", "c");        // "a-b-c"

// Character/number conversions
String.valueOf(42);          // "42"
String.valueOf(3.14);        // "3.14"
String.valueOf(true);        // "true"
String.valueOf('A');          // "A"
Integer.parseInt("42");      // 42
Double.parseDouble("3.14");  // 3.14

// StringBuilder — mutable string building
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(", ");
sb.append("World");
sb.append("!");
String result = sb.toString();  // "Hello, World!"

// StringBuilder chaining
String built = new StringBuilder()
    .append("SELECT ")
    .append("* ")
    .append("FROM users")
    .toString();

// Password security — use char[] not String for sensitive data
// String is immutable and interned — stays in memory longer than you control
// char[] can be explicitly zeroed out after use
char[] password = getPassword();
// ... use password ...
Arrays.fill(password, '\0');  // zero it out when done
```

---

## Object-Oriented Java

### Classes and Constructors

```java
public class User {
    private final String id;       // final — set in constructor, never changed
    private String name;
    private String email;
    private boolean active;

    // Constructor — method name matches class name, no return type
    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.active = true;
    }

    // Getters — naming convention: getFieldName(), isFieldName() for booleans
    public String getId()     { return id; }
    public String getName()   { return name; }
    public String getEmail()  { return email; }
    public boolean isActive() { return active; }

    // Setters — only for mutable fields
    public void setName(String name)   { this.name = name; }
    public void setEmail(String email) { this.email = email; }

    // Always override equals() and hashCode() together
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{id='%s', name='%s', active=%s}".formatted(id, name, active);
    }
}
```

**Why `equals()` and `hashCode()` must be overridden together:** If two objects are equal by `equals()`, they must have the same `hashCode()`. Violating this contract breaks `HashMap` and `HashSet` — equal objects will not be found when used as keys because they land in different hash buckets. Always override both, always base them on the same fields.

### The Builder Pattern

For classes with many fields — especially optional ones — the Builder pattern is the idiomatic Java solution. You will see it constantly in Spring and library APIs:

```java
public class UserRequest {
    private final String name;
    private final String email;
    private final String role;
    private final boolean sendWelcomeEmail;

    private UserRequest(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.role = builder.role;
        this.sendWelcomeEmail = builder.sendWelcomeEmail;
    }

    public static class Builder {
        private final String name;   // required
        private final String email;  // required
        private String role = "viewer";          // optional with default
        private boolean sendWelcomeEmail = true; // optional with default

        public Builder(String name, String email) {
            this.name = name;
            this.email = email;
        }
        public Builder role(String role)               { this.role = role; return this; }
        public Builder sendWelcomeEmail(boolean send)  { this.sendWelcomeEmail = send; return this; }
        public UserRequest build()                     { return new UserRequest(this); }
    }
}

// Usage — reads clearly, order-independent, optional fields obvious
UserRequest request = new UserRequest.Builder("Alice", "alice@example.com")
    .role("admin")
    .sendWelcomeEmail(false)
    .build();
```

### Inheritance and Interfaces

```java
// extends — single class inheritance
public class Employee extends User {
    private String employeeId;

    public Employee(String id, String name, String email, String employeeId) {
        super(id, name, email);   // must call parent constructor first
        this.employeeId = employeeId;
    }

    @Override  // always use @Override — compiler validates the signature
    public String toString() {
        return "Employee{employeeId='%s', %s}".formatted(employeeId, super.toString());
    }
}
```

**Abstract classes vs Interfaces — the modern rule:**

Before Java 8, interfaces could only contain abstract method signatures. Java 8 added default methods (concrete implementations in interfaces) and static methods. This changed the calculus:

```java
// Modern interface — can have default and static methods
public interface Auditable {
    String getCreatedBy();           // abstract — must implement
    LocalDateTime getCreatedAt();    // abstract — must implement

    default boolean isCreatedToday() {    // default — provided, can override
        return getCreatedAt().toLocalDate().equals(LocalDate.now());
    }

    static Auditable system() {           // static — called on the interface
        return new Auditable() {
            public String getCreatedBy() { return "system"; }
            public LocalDateTime getCreatedAt() { return LocalDateTime.MIN; }
        };
    }
}

// A class can implement multiple interfaces — prefer interfaces over abstract classes
public class Order implements Auditable, Comparable<Order> {
    @Override public String getCreatedBy() { return createdBy; }
    @Override public LocalDateTime getCreatedAt() { return createdAt; }
    @Override public int compareTo(Order other) {
        return this.createdAt.compareTo(other.createdAt);
    }
}
```

**Functional interfaces** — interfaces with exactly one abstract method — are the foundation of lambdas:

```java
// java.util.function — the standard functional interfaces
Predicate<User>  isActive = user -> user.isActive();      // T -> boolean
Function<User, String> getName = user -> user.getName();  // T -> R
Consumer<User>   logUser = user -> log.info("{}", user);  // T -> void
Supplier<User>   create  = () -> new User("default");     // () -> T

// Composed predicates
Predicate<User> isActiveAdmin = isActive.and(u -> "admin".equals(u.getRole()));
Predicate<User> isNotActive   = isActive.negate();
```

### Generics

Java generics work like TypeScript generics. The uniquely Java addition is bounded wildcards, which appear frequently in library code:

```java
// Upper bounded wildcard — reads from a collection of Number or subtype
public double sumList(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}
// Accepts: List<Integer>, List<Double>, List<Long>
// Cannot add to the list — type is unknown

// Lower bounded wildcard — writes to a collection of Integer or supertype
public void addNumbers(List<? super Integer> list) {
    list.add(1); list.add(2); list.add(3);
}
// Accepts: List<Integer>, List<Number>, List<Object>

// Mnemonic: PECS — Producer Extends, Consumer Super
// If the collection produces (you read from it): ? extends T
// If the collection consumes (you write to it): ? super T
```

### Enums

Java enums are full classes — they can have fields, constructors, and methods:

```java
public enum UserStatus {
    ACTIVE("Active", true),
    INACTIVE("Inactive", false),
    SUSPENDED("Suspended", false);

    private final String displayName;
    private final boolean canLogin;

    UserStatus(String displayName, boolean canLogin) {
        this.displayName = displayName;
        this.canLogin = canLogin;
    }

    public String getDisplayName() { return displayName; }
    public boolean canLogin()      { return canLogin; }

    public static UserStatus fromString(String value) {
        for (UserStatus status : values()) {
            if (status.name().equalsIgnoreCase(value)) return status;
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}

// Usage
UserStatus.ACTIVE.canLogin();        // true
UserStatus.ACTIVE.getDisplayName();  // "Active"
UserStatus.ACTIVE.name();            // "ACTIVE" — the constant name
UserStatus.ACTIVE.ordinal();         // 0 — position in declaration (avoid depending on this)
```

---

## The Collections Framework

The Collections Framework is one of Java's great strengths — a rich hierarchy of data structures with clear contracts and predictable performance characteristics. Knowing which collection to use and why is a mark of senior Java experience.

### The Hierarchy

- `Collection` — parent of `List`, `Set`, `Queue`
- `Map` — separate hierarchy, key-value pairs
- All collections implement `Iterable` — usable in for-each loops

### List — Ordered, Allows Duplicates

### ArrayList

`ArrayList` is backed by a dynamic array. It is the most commonly used List implementation and the right default choice.

```java
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Alice");   // duplicates allowed

names.get(0);          // "Alice" — O(1) random access
names.contains("Bob"); // true — O(n) search
names.remove("Bob");   // removes first occurrence — O(n)
names.remove(0);       // removes by index — O(n) due to shifting

// Sorting
names.sort(Comparator.naturalOrder());
names.sort(Comparator.reverseOrder());
names.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));

// Initialisation patterns
List<String> mutable   = new ArrayList<>(List.of("A", "B", "C")); // mutable copy
List<String> immutable = List.of("A", "B", "C");                   // truly immutable
```

**Performance profile of ArrayList:**

| Operation | Complexity | Notes |
|---|---|---|
| `get(index)` | O(1) | Direct array access |
| `add()` at end | O(1) amortised | Occasionally resizes |
| `add(index, element)` | O(n) | Shifts subsequent elements |
| `remove(index)` | O(n) | Shifts subsequent elements |
| `contains(element)` | O(n) | Linear search |

### LinkedList

`LinkedList` is a doubly linked list implementing both `List` and `Deque`. Head/tail insertions and removals are O(1). Random access by index is O(n). In practice, `ArrayList` is almost always the better choice — `LinkedList` has higher memory overhead and poor cache performance. Use `ArrayDeque` if you need a queue or stack.

### Set — Unordered, No Duplicates

### HashSet

Backed by a `HashMap`. O(1) average for add, remove, contains. Does not maintain order.

```java
Set<String> roles = new HashSet<>();
roles.add("admin");
roles.add("admin");   // silently ignored — set unchanged
roles.contains("admin");  // true — O(1)

// Set operations
Set<String> all  = new HashSet<>(Set.of("admin", "editor", "viewer"));
Set<String> user = new HashSet<>(Set.of("admin", "viewer"));

Set<String> intersection = new HashSet<>(all);
intersection.retainAll(user);    // {"admin", "viewer"}

Set<String> difference = new HashSet<>(all);
difference.removeAll(user);      // {"editor"}
```

### LinkedHashSet and TreeSet

- **LinkedHashSet** — maintains insertion order. Use when order matters and duplicates should be excluded.
- **TreeSet** — maintains sorted order. O(log n) operations. Use when you need unique elements in sorted order.

```java
TreeSet<Integer> sorted = new TreeSet<>(List.of(5, 3, 8, 1, 9));
sorted.first();          // 1
sorted.last();           // 9
sorted.headSet(5);       // {1, 3} — elements less than 5
sorted.tailSet(5);       // {5, 8, 9} — elements >= 5
```

### Map — Key-Value Pairs

### HashMap

O(1) average for get, put, remove. Does not maintain order. Allows one null key.

```java
Map<String, User> userById = new HashMap<>();
userById.put("user-1", alice);
userById.get("user-1");                          // alice
userById.getOrDefault("user-99", defaultUser);   // returns defaultUser if absent
userById.putIfAbsent("user-1", newAlice);        // no-op — key exists
userById.containsKey("user-1");                  // true — O(1)

// computeIfAbsent — create-if-absent, used for grouping
Map<String, List<User>> byDept = new HashMap<>();
byDept.computeIfAbsent("Engineering", k -> new ArrayList<>()).add(alice);
byDept.computeIfAbsent("Engineering", k -> new ArrayList<>()).add(bob);
// "Engineering" -> [alice, bob]

// merge — useful for counting or accumulating
Map<String, Integer> wordCount = new HashMap<>();
for (String word : words) {
    wordCount.merge(word, 1, Integer::sum);
}

// Iterating
userById.forEach((id, user) -> System.out.printf("%s -> %s%n", id, user));
for (Map.Entry<String, User> entry : userById.entrySet()) {
    System.out.printf("%s -> %s%n", entry.getKey(), entry.getValue());
}
```

### LinkedHashMap, TreeMap, ConcurrentHashMap

- **LinkedHashMap** — maintains insertion order. Use when iteration order matters.
- **TreeMap** — maintains keys in sorted order. O(log n) operations. Supports range queries.
- **ConcurrentHashMap** — thread-safe. Use in singleton Spring beans that maintain Map state accessible from concurrent HTTP requests.

```java
// Cache in a singleton Spring service — must be thread-safe
private final Map<String, UserDto> cache = new ConcurrentHashMap<>();
```

### Choosing the Right Collection

| Need | Use |
|---|---|
| Ordered list, frequent random access | `ArrayList` |
| Queue or stack behaviour | `ArrayDeque` |
| Unique elements, order unimportant | `HashSet` |
| Unique elements, insertion order | `LinkedHashSet` |
| Unique elements, sorted | `TreeSet` |
| Key-value pairs, order unimportant | `HashMap` |
| Key-value pairs, insertion order | `LinkedHashMap` |
| Key-value pairs, sorted by key | `TreeMap` |
| Key-value pairs, thread-safe | `ConcurrentHashMap` |
| Small, immutable collection | `List.of()`, `Set.of()`, `Map.of()` |

### Comparable and Comparator

```java
// Comparable — natural ordering defined by the object itself
public class User implements Comparable<User> {
    @Override
    public int compareTo(User other) {
        return this.name.compareTo(other.name);  // alphabetical by name
    }
}
Collections.sort(users);  // uses natural ordering

// Comparator — external, flexible ordering strategy
Comparator<User> byAge = Comparator.comparing(User::getAge);

// Chained comparator — age descending, then name ascending
Comparator<User> complex = Comparator.comparing(User::getAge)
    .reversed()
    .thenComparing(User::getName);

users.sort(complex);

// Null-safe comparator
Comparator<User> nullSafe = Comparator.comparing(
    User::getDepartment,
    Comparator.nullsLast(Comparator.naturalOrder())
);
```

---

## The Streams API and Optional

### What Streams Are

The Streams API, introduced in Java 8, provides a functional approach to processing collections. A stream is a pipeline of operations — source, intermediate operations, terminal operation. Streams are **lazy**: intermediate operations do not execute until a terminal operation is called.

If you have been writing JavaScript, streams feel familiar: they are Java's equivalent of chaining `.filter()`, `.map()`, `.reduce()` on arrays — but more powerful.

### Creating Streams

```java
// From a Collection
Stream<User> stream = users.stream();
Stream<User> parallel = users.parallelStream();  // parallel processing — use cautiously

// From an array
Stream<String> fromArray = Arrays.stream(array);

// From values
Stream<String> of = Stream.of("Alice", "Bob", "Carol");

// Infinite streams — always use limit()
Stream<Integer> naturals = Stream.iterate(1, n -> n + 1).limit(10);
Stream<Double> randoms   = Stream.generate(Math::random).limit(5);

// Primitive streams — avoid boxing overhead
IntStream range  = IntStream.range(0, 10);       // 0 to 9
IntStream closed = IntStream.rangeClosed(1, 10);  // 1 to 10
```

### Intermediate Operations

```java
List<User> users = getUsers();

// filter — keep elements matching a predicate
users.stream().filter(User::isActive).filter(u -> u.getAge() >= 18);

// map — transform each element
users.stream().map(User::getName);           // Stream<String>
users.stream().map(String::toUpperCase);

// flatMap — transform each element to a stream and flatten
users.stream().flatMap(u -> u.getRoles().stream()); // Stream<Role>

// distinct, sorted, limit, skip
users.stream().map(User::getDepartment).distinct();
users.stream().sorted(Comparator.comparing(User::getName));
users.stream().skip(20).limit(10);  // page 3 of size 10

// peek — inspect without modifying (useful for debugging)
users.stream()
    .filter(User::isActive)
    .peek(u -> log.debug("Processing: {}", u.getName()))
    .map(User::getName)
    .toList();
```

### Terminal Operations

```java
// collect — most common terminal operation
List<String> names = users.stream().map(User::getName).toList();  // Java 16+ immutable

// Grouping — extremely useful
Map<String, List<User>> byDept   = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment));

Map<String, Long> countByDept = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment, Collectors.counting()));

Map<Boolean, List<User>> partition = users.stream()
    .collect(Collectors.partitioningBy(User::isActive));

// Joining strings
String csv = users.stream().map(User::getName).collect(Collectors.joining(", "));
String bracketed = users.stream().map(User::getName)
    .collect(Collectors.joining(", ", "[", "]")); // "[Alice, Bob, Carol]"

// Searching
Optional<User> first   = users.stream().filter(User::isActive).findFirst();
boolean hasAdmin       = users.stream().anyMatch(u -> "admin".equals(u.getRole()));
boolean allActive      = users.stream().allMatch(User::isActive);

// Counting and aggregation
long count         = users.stream().filter(User::isActive).count();
OptionalDouble avg = users.stream().mapToInt(User::getAge).average();
int total          = users.stream().mapToInt(User::getAge).sum();

// forEach
users.stream().filter(User::isActive).forEach(u -> log.info("Active: {}", u));
```

### Method References

```java
// 1. Static method reference
// lambda:   n -> Integer.parseInt(n)
// reference: Integer::parseInt
strings.stream().map(Integer::parseInt).toList();

// 2. Instance method on specific instance
// lambda:   s -> printer.print(s)
// reference: printer::print
users.forEach(printer::print);

// 3. Instance method on arbitrary instance — most common
// lambda:   user -> user.getName()
// reference: User::getName
users.stream().map(User::getName).toList();

// 4. Constructor reference
// lambda:   name -> new User(name)
// reference: User::new
names.stream().map(User::new).toList();
```

### Optional — Handling the Absence of a Value

`Optional<T>` makes the possibility of absence explicit in the type system. A method returning `Optional<User>` is explicitly saying "this may not find a user."

```java
// Creating Optional
Optional<String> present = Optional.of("Alice");          // known non-null
Optional<String> empty   = Optional.empty();
Optional<String> maybe   = Optional.ofNullable(nullable); // might be null

// The wrong way — defeats the purpose
Optional<User> opt = userRepository.findById(id);
if (opt.isPresent()) {
    User user = opt.get();   // avoid this pattern
}

// The right way — functional style
userRepository.findById(id)
    .ifPresent(user -> processUser(user));

userRepository.findById(id)
    .ifPresentOrElse(
        user -> processUser(user),
        () -> log.warn("User not found: {}", id)
    );

// Transform if present
Optional<String> name = userRepository.findById(id).map(User::getName);

// Default values
User user  = userRepository.findById(id).orElse(defaultUser);
User user2 = userRepository.findById(id).orElseGet(() -> createDefault());
User user3 = userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));

// Chaining
Optional<String> deptName = userRepository.findById(id)
    .map(User::getDepartment)
    .map(Department::getName);

// flatMap — when mapping returns Optional
Optional<Address> address = userRepository.findById(id)
    .flatMap(User::getPrimaryAddress);  // avoids Optional<Optional<Address>>
```

**Where to use Optional:** Return types of methods that may not find a result. Do **not** use Optional as method parameters, as field types, or inside collections — these are anti-patterns that add overhead without clarity.

---

## Exception Handling

### Checked vs Unchecked Exceptions

Java's exception hierarchy: `Throwable` → `Error` (serious JVM problems — never catch) and `Exception` (application problems).

**Checked exceptions** extend `Exception` directly. The compiler requires you to catch them or declare them with `throws`. Intent: force callers to acknowledge certain operations can fail. Examples: `IOException`, `SQLException`.

**Unchecked exceptions** extend `RuntimeException`. The compiler does not require handling. Examples: `NullPointerException`, `IllegalArgumentException`, `IllegalStateException`.

```java
// Checked exception — compiler requires handling
public String readFile(String path) throws IOException {
    return Files.readString(Path.of(path));
}

// Caller must handle
try {
    String content = readFile("data.txt");
} catch (IOException e) {
    log.error("Failed to read file", e);
    throw new RuntimeException("File read failed", e);  // wrap as unchecked
}

// Unchecked exception — no compiler requirement
public User findUser(String id) {
    if (id == null) throw new IllegalArgumentException("ID cannot be null");
    return repository.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
}
```

**The modern Java community view:** Spring uses unchecked exceptions almost exclusively, wrapping checked SQL and IO exceptions in unchecked `RuntimeException` subclasses. Most modern Java code does the same. Use checked exceptions only for conditions the immediate caller can meaningfully recover from.

### try-with-resources

Always use try-with-resources for `Closeable` or `AutoCloseable` resources:

```java
// Old pattern — verbose and error-prone (close() itself can throw)
Connection conn = null;
try {
    conn = dataSource.getConnection();
    // ...
} finally {
    if (conn != null) {
        try { conn.close(); } catch (SQLException e) { log.error("...", e); }
    }
}

// Java 7+ try-with-resources — clean, safe, handles nested exceptions correctly
try (Connection conn = dataSource.getConnection();
     PreparedStatement stmt = conn.prepareStatement(sql)) {
    // ... both conn and stmt closed automatically on exit
} catch (SQLException e) {
    log.error("Database error", e);
    throw new RuntimeException(e);
}
```

### Custom Exceptions

```java
// Custom unchecked exception — standard in Spring Boot
public class UserNotFoundException extends RuntimeException {
    private final String userId;

    public UserNotFoundException(String userId) {
        super("User not found with ID: " + userId);
        this.userId = userId;
    }

    public UserNotFoundException(String userId, Throwable cause) {
        super("User not found with ID: " + userId, cause);
        this.userId = userId;
    }

    public String getUserId() { return userId; }
}

// Exception hierarchy for a domain
public abstract class BusinessException extends RuntimeException {
    private final String errorCode;
    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    public String getErrorCode() { return errorCode; }
}

public class InsufficientPermissionsException extends BusinessException {
    public InsufficientPermissionsException(String action) {
        super("Insufficient permissions to: " + action, "PERMISSION_DENIED");
    }
}
```

### Exception Best Practices

**Never swallow exceptions:**

```java
// WRONG — exception disappears silently
try {
    processUser(user);
} catch (Exception e) { }  // debugging nightmare

// CORRECT — at minimum, log with the exception
try {
    processUser(user);
} catch (Exception e) {
    log.error("Failed to process user: {}", user.getId(), e);
    throw e;
}
```

**Include context in exception messages.** "User not found" is less useful than "User not found with ID: user-123 in tenant: acme-corp." Whoever is debugging at 2am (possibly you) will be grateful.

**Wrap checked exceptions** at layer boundaries to keep the unchecked model clean:

```java
try {
    return objectMapper.readValue(json, UserDto.class);
} catch (JsonProcessingException e) {
    throw new IllegalArgumentException("Invalid user JSON: " + json, e);
    // Original checked exception preserved as cause — visible in stack trace
}
```

---


---

*Continue with [Java Overview — Part 2: Spring Boot & Interview Prep](./java-overview-part-2.md)*
