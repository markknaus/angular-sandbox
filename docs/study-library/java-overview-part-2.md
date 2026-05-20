# Java Overview — Part 2: Spring Boot & Interview Prep
### Spring Boot, Three-Layer Architecture, JPA, Build Tools, Interview Talking Points, JAX-WS/SOAP

> **Continuation of Java Overview. Read Part 1 (language fundamentals) first.**

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Spring Boot](#spring-boot)
  - [What Spring Boot Is and How It Evolved](#what-spring-boot-is-and-how-it-evolved)
  - [The Application Lifecycle](#the-application-lifecycle)
  - [Dependency Injection — Constructor Injection is Preferred](#dependency-injection--constructor-injection-is-preferred)
  - [Spring Stereotypes](#spring-stereotypes)
  - [Configuration — application.yml](#configuration--applicationyml)
  - [Building REST APIs](#building-rest-apis)
  - [The Controller](#the-controller)
  - [DTOs — Never Expose Entities Directly](#dtos--never-expose-entities-directly)
  - [Request Validation](#request-validation)
  - [Global Exception Handling](#global-exception-handling)
  - [CORS Configuration](#cors-configuration)
  - [Spring Security Basics](#spring-security-basics)
- [The Three-Layer Architecture](#the-three-layer-architecture)
  - [Controller → Service → Repository](#controller--service--repository)
  - [Transactions](#transactions)
- [JPA and Database Integration](#jpa-and-database-integration)
  - [What JPA and Hibernate Are](#what-jpa-and-hibernate-are)
  - [Entity Mapping](#entity-mapping)
  - [Relationships](#relationships)
  - [LAZY vs EAGER Loading](#lazy-vs-eager-loading)
  - [The N+1 Problem](#the-n1-problem)
  - [Spring Data JPA Repositories](#spring-data-jpa-repositories)
  - [Database Migrations with Flyway](#database-migrations-with-flyway)
- [Build Tools and Project Structure](#build-tools-and-project-structure)
  - [Maven](#maven)
  - [Standard Spring Boot Project Structure](#standard-spring-boot-project-structure)
  - [Reading Java Stack Traces](#reading-java-stack-traces)
- [Interview Talking Points](#interview-talking-points)
  - [Framing Your Java Experience](#framing-your-java-experience)
  - [The Spring DI to Angular DI Comparison](#the-spring-di-to-angular-di-comparison)
  - [The Full-Stack Request Lifecycle](#the-full-stack-request-lifecycle)
  - [Common Full-Stack Debugging Scenarios](#common-full-stack-debugging-scenarios)
  - [Best Practices Checklist — Appearing Senior](#best-practices-checklist--appearing-senior)
- [JAX-WS and SOAP Web Services](#jax-ws-and-soap-web-services)
  - [Why This Appears in Job Postings](#why-this-appears-in-job-postings)
  - [What SOAP Is](#what-soap-is)
  - [What JAX-WS Is](#what-jax-ws-is)


## Spring Boot

### What Spring Boot Is and How It Evolved

The original Spring Framework (2003) solved Java EE's verbosity with a clean programming model and dependency injection. But Spring itself became complex — configuring a Spring application required significant XML boilerplate.

Spring Boot (2014) solved the Spring-configuration problem by applying "convention over configuration." You add a dependency to your project and Spring Boot configures it sensibly without you writing configuration code. Add the JPA starter and a database URL — Spring Boot creates the DataSource, configures the connection pool (HikariCP by default), and makes it injectable throughout the application.

**Spring Boot versions:** Spring Boot 2.x (based on Spring Framework 5) ran on Java 8+. Spring Boot 3.x (2022, Spring Framework 6) requires Java 17 as a minimum and migrated from `javax` to `jakarta` package names (due to Jakarta EE rebranding). If you see `import javax.persistence.*` it is Spring Boot 2.x or older. `import jakarta.persistence.*` is Spring Boot 3.x. This is the most common stumbling block when moving between older and newer Spring codebases.

### The Application Lifecycle

```java
@SpringBootApplication  // combines @Configuration + @EnableAutoConfiguration + @ComponentScan
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

On startup, Spring Boot: scans the classpath for dependencies to auto-configure, reads `application.yml` for configuration, discovers all Spring-annotated classes, creates and wires beans, configures embedded servers and data sources, and runs any `@PostConstruct` methods or `ApplicationRunner` beans.

### Dependency Injection — Constructor Injection is Preferred

```java
// Constructor injection — PREFERRED
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    // @Autowired optional for single-constructor classes (Spring 4.3+)
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}

// Field injection — DISCOURAGED
@Service
public class UserService {
    @Autowired private UserRepository userRepository;  // avoid this
}
```

**Why constructor injection is preferred:** Makes dependencies explicit and required. Fields can be `final`. Testable without a Spring context — instantiate directly with mock dependencies. Field injection hides dependencies and requires a Spring context to test.

### Spring Stereotypes

```java
@Component    // Generic Spring-managed component
@Service      // Business logic — same as @Component, signals intent
@Repository   // Data access — translates DataAccessExceptions
@RestController // REST API — @Controller + @ResponseBody on every method
@Configuration  // Source of @Bean definitions
```

```java
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .build();
    }

    @Bean
    @Profile("development")  // only active in the development profile
    public DataInitialiser dataInitialiser(UserRepository repo) {
        return new DataInitialiser(repo);
    }
}
```

### Configuration — application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/userdb
    username: ${DB_USERNAME}   # environment variable substitution
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate       # validate schema on startup — never create/drop in production
    show-sql: false

server:
  port: 8080

app:
  security:
    jwt-secret: ${JWT_SECRET}
    token-expiry-minutes: 60
  pagination:
    default-page-size: 20
    max-page-size: 100
```

```java
// Inject individual values
@Value("${app.pagination.default-page-size:20}")  // :20 is default if not set
private int defaultPageSize;

// Inject a group of related values — cleaner for multiple values
@Component
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {
    private String jwtSecret;
    private int tokenExpiryMinutes;
    public String getJwtSecret() { return jwtSecret; }
    public void setJwtSecret(String s) { this.jwtSecret = s; }
    public int getTokenExpiryMinutes() { return tokenExpiryMinutes; }
    public void setTokenExpiryMinutes(int m) { this.tokenExpiryMinutes = m; }
}
```

### Building REST APIs

### The Controller

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<UserDto>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.findUsers(page, size, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@RequestBody @Valid CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable String id,
            @RequestBody @Valid UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDto> updateStatus(
            @PathVariable String id,
            @RequestBody @Valid UpdateStatusRequest request) {
        return ResponseEntity.ok(userService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }
}
```

### DTOs — Never Expose Entities Directly

Exposing JPA entities from controllers is a common mistake with serious consequences: security risks (password hashes, internal fields serialised to JSON), tight coupling of API contract to database schema, and Jackson serialisation issues with lazy-loaded relationships.

```java
// The entity — internal, database-mapped
@Entity
public class User {
    @Id private String id;
    private String name;
    private String email;
    private String passwordHash;  // must never appear in API responses
    // ...
}

// The response DTO — Java 16+ record, external contract only
public record UserDto(String id, String name, String email, boolean active) {}

// The request DTO — what the caller sends
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank @Email(message = "Valid email required")
    String email,

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    String role
) {}
```

### Request Validation

```java
// Validation annotations
public record CreateUserRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotNull @Size(min = 8, max = 100) String password,
    @Pattern(regexp = "^(admin|editor|viewer)$") String role,
    @Min(0) @Max(150) int age
) {}

// In the controller — @Valid triggers validation before the method body runs
@PostMapping
public ResponseEntity<UserDto> create(@RequestBody @Valid CreateUserRequest request) {
    return ResponseEntity.status(201).body(userService.create(request));
}
// If validation fails, Spring throws MethodArgumentNotValidException (400 Bad Request)
```

### Global Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                (first, second) -> first
            ));
        return Map.of("status", 400, "error", "Validation Failed", "errors", fieldErrors);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleNotFound(UserNotFoundException ex) {
        return Map.of("status", 404, "error", ex.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public Map<String, Object> handleBusiness(BusinessException ex) {
        return Map.of("status", 422, "error", ex.getMessage(), "code", ex.getErrorCode());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return Map.of("status", 500, "error", "An unexpected error occurred");
    }
}
```

### CORS Configuration

CORS is what your Angular development server (port 4200) encounters when calling your Spring Boot API (port 8080). The browser blocks cross-origin requests unless the server explicitly allows them.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:4200",        // Angular dev server
                "https://app.yourdomain.com"    // production Angular app
            )
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);  // cache pre-flight for 1 hour
    }
}
```

When your Angular app sends a request with an `Authorization` header to a different origin, the browser first sends an OPTIONS pre-flight request. The server responds with its CORS policy. If allowed, the actual request proceeds. The `maxAge` caches the pre-flight response to reduce overhead.

### Spring Security Basics

Spring Security works by inserting servlet filters before your controller methods. Every request passes through the security filter chain — authentication, authorisation, CSRF, CORS — before reaching your code.

**JWT authentication flow with Angular:**

1. Angular sends credentials to `/api/auth/login`
2. Spring Security authenticates, generates a signed JWT
3. Angular stores the JWT and includes it: `Authorization: Bearer <token>`
4. Spring Security's JWT filter validates the token on each request, populates the security context
5. Your controller methods access the authenticated user via `@AuthenticationPrincipal`

```java
@GetMapping("/me")
public ResponseEntity<UserDto> getCurrentUser(
        @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(userService.findByEmail(userDetails.getUsername()));
}

// Declarative role-based access control
@GetMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public List<UserDto> adminGetAllUsers() { ... }

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
public void deleteUser(@PathVariable String id) { ... }
```

---

## The Three-Layer Architecture

### Controller → Service → Repository

Spring Boot applications conventionally follow a three-layer architecture:

**Controller** (`@RestController`): Receives HTTP requests, validates input, delegates to services, returns HTTP responses. Controllers should be thin — no business logic, no database access.

**Service** (`@Service`): Contains business logic. Orchestrates repository calls. Applies business rules. Manages transactions.

**Repository** (`@Repository`): Data access only. No business logic. In Spring Data JPA, typically just an interface.

```java
// Controller — thin, HTTP translation only
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public UserDto createUser(@RequestBody @Valid CreateUserRequest request) {
    return userService.createUser(request);
}

// Service — business logic
@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already registered", "EMAIL_TAKEN");
        }
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findById(String id) {
        return userRepository.findById(id).map(this::toDto);
    }
}

// Repository — data access only
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Page<User> findByRole(String role, Pageable pageable);
}
```

### Transactions

`@Transactional` marks a method as transactional — all database operations execute in a single transaction. If an unchecked exception is thrown, the transaction rolls back.

```java
@Transactional  // both saves succeed or both roll back
public void transferFunds(String fromId, String toId, BigDecimal amount) {
    Account from = accountRepository.findById(fromId).orElseThrow(...);
    Account to   = accountRepository.findById(toId).orElseThrow(...);

    if (from.getBalance().compareTo(amount) < 0) {
        throw new InsufficientFundsException(fromId);  // rolls back — no transfer
    }
    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));
    accountRepository.save(from);
    accountRepository.save(to);
}
```

**Key `@Transactional` options:**

- `readOnly = true` — hint to JPA and database that no modifications will occur. Skips dirty checking, may enable read replicas. Apply to all query-only service methods.
- `rollbackFor = Exception.class` — by default Spring only rolls back for `RuntimeException`. Add this to roll back on checked exceptions too.
- `propagation = Propagation.REQUIRES_NEW` — always creates a new transaction, suspending the outer one. Use for audit logging that must commit even if the outer transaction rolls back.

---

## JPA and Database Integration

> 📝 **Note:** This section covers the Java and JPA layer. For SQL fundamentals — SELECT, JOIN, GROUP BY, subqueries, query optimisation — refer to the companion **SQL Guide**. This section assumes you can read and understand SQL queries.

### What JPA and Hibernate Are

JPA (Jakarta Persistence API) is a specification — a set of interfaces and annotations defining how Java objects map to relational database tables. Hibernate is the most widely used JPA implementation. Spring Boot uses Hibernate by default.

Spring Data JPA sits on top of JPA and provides the `JpaRepository` interface that eliminates most boilerplate data access code.

### Entity Mapping

```java
@Entity
@Table(name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = "email"),
    indexes = @Index(columnList = "department_id, active")
)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)  // store as "ACTIVE" not 0 — always use STRING
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient  // not mapped to a column
    private String displayName;

    @PrePersist
    void onCreate()  { createdAt = LocalDateTime.now(); }
}
```

**Always use `EnumType.STRING` not `EnumType.ORDINAL`:** Ordinal stores the enum's position (0, 1, 2) — adding a new enum value in the middle corrupts existing data. STRING stores the name ("ACTIVE", "INACTIVE") — safe to add or reorder values.

### Relationships

```java
// @ManyToOne — the "many" side owns the foreign key column
@Entity
public class User {
    @ManyToOne(fetch = FetchType.LAZY)   // always LAZY for @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}

// @OneToMany — mapped by the foreign key on the other side
@Entity
public class Department {
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();
}

// @ManyToMany — join table
@Entity
public class User {
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
```

### LAZY vs EAGER Loading

**Always use `FetchType.LAZY` on all relationships.** Override to EAGER only when profiling shows that lazy loading is causing a specific performance problem and you always need the related data.

`@ManyToOne` and `@OneToOne` default to EAGER. `@OneToMany` and `@ManyToMany` default to LAZY. Explicitly set LAZY on everything for clarity and to prevent accidentally loading unnecessary data.

### The N+1 Problem

The most common JPA performance issue. Loading a list of N entities causes N+1 queries: one for the list, then one per entity to load a lazily-loaded relationship.

```java
// The N+1 problem
List<User> users = userRepository.findAll();  // 1 query
for (User user : users) {
    user.getDepartment().getName();  // 1 additional query per user = N more queries
}
// Total: 1 + N queries
```

**The fixes:**

```java
// Fix 1: JOIN FETCH in JPQL — single query fetches everything
@Query("SELECT u FROM User u JOIN FETCH u.department WHERE u.active = true")
List<User> findActiveUsersWithDepartment();

// Fix 2: Entity Graph — declarative fetch plan
@EntityGraph(attributePaths = {"department", "roles"})
List<User> findByActive(boolean active);

// Fix 3: Projections — only fetch what you need
public interface UserSummary {
    String getId();
    String getName();
    @Value("#{target.department.name}")
    String getDepartmentName();
}
List<UserSummary> findByActiveTrue();
```

### Spring Data JPA Repositories

```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Derived query methods — Spring generates SQL from method names
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByActiveTrue();
    List<User> findByDepartmentName(String departmentName);
    List<User> findByNameContainingIgnoreCase(String nameFragment);
    long countByRole(UserRole role);

    // Pagination
    Page<User> findByActive(boolean active, Pageable pageable);

    // Custom JPQL
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since AND u.active = true")
    List<User> findActiveUsersSince(@Param("since") LocalDateTime since);

    // Native SQL for complex queries or performance
    @Query(value = """
            SELECT u.*, d.name AS department_name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.active = true
            ORDER BY u.name
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<User> findActiveUsersNative(@Param("limit") int limit, @Param("offset") int offset);

    // Modifying queries
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.active = false WHERE u.lastLoginAt < :cutoff")
    int deactivateInactiveUsers(@Param("cutoff") LocalDateTime cutoff);
}
```

**Pagination with `Pageable`:**

```java
// In the controller
@GetMapping
public Page<UserDto> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "name") String sortBy) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    return userService.findUsers(pageable);
}
// Page<T> contains: content, totalElements, totalPages, number, size
// Angular receives this and builds pagination controls from it
```

### Database Migrations with Flyway

Flyway manages schema migrations as versioned SQL scripts that run automatically on startup:

```
src/main/resources/db/migration/
    V1__create_users_table.sql
    V2__add_departments.sql
    V3__add_department_fk_to_users.sql
    V4__add_indexes.sql
```

Flyway tracks which migrations have run in a `flyway_schema_history` table. On each startup it runs any new migrations in version order. Configure Spring Boot to not auto-manage the schema: `spring.jpa.hibernate.ddl-auto=validate`. Let Flyway own the schema.

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id            VARCHAR(36)  PRIMARY KEY,
    full_name     VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    active        BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_active ON users (active);
```

---

## Build Tools and Project Structure

### Maven

Maven uses an XML configuration file (`pom.xml`) and a standardised directory structure. The `spring-boot-starter-parent` manages dependency versions so you rarely need to specify them.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>user-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

**Dependency scopes:**

| Scope | When available |
|---|---|
| `compile` (default) | Compile time and runtime |
| `runtime` | Runtime only (JDBC drivers) |
| `test` | Test compilation and execution only |
| `provided` | Provided by runtime environment |

**Common Maven commands:**

```bash
./mvnw clean                      # delete target/ directory
./mvnw compile                    # compile main source code
./mvnw test                       # run tests
./mvnw package                    # compile + test + create JAR in target/
./mvnw spring-boot:run            # run the application
./mvnw spring-boot:run \
  -Dspring-boot.run.profiles=development
./mvnw package -DskipTests        # skip tests (avoid in CI)
```

The Maven wrapper (`mvnw`) uses the project's specified Maven version. Commit `mvnw` and `.mvn/` to the repository — everyone uses the same version.

### Standard Spring Boot Project Structure

```
user-service/
├── src/
│   ├── main/
│   │   ├── java/com/example/userservice/
│   │   │   ├── UserServiceApplication.java
│   │   │   ├── config/          ← @Configuration classes
│   │   │   ├── controller/      ← @RestController classes
│   │   │   ├── service/         ← @Service classes
│   │   │   ├── repository/      ← @Repository interfaces
│   │   │   ├── domain/          ← @Entity classes
│   │   │   ├── dto/             ← Request and response records
│   │   │   └── exception/       ← Custom exceptions + GlobalExceptionHandler
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-development.yml
│   │       └── db/migration/    ← Flyway SQL migrations
│   └── test/
│       └── java/com/example/userservice/
│           ├── controller/
│           ├── service/
│           └── repository/
├── pom.xml
└── mvnw
```

### Reading Java Stack Traces

Java stack traces are verbose — knowing how to read them quickly is practical:

```
java.lang.NullPointerException: Cannot invoke "String.length()" because "str" is null
    at com.example.userservice.service.UserService.validateName(UserService.java:47)
    at com.example.userservice.service.UserService.createUser(UserService.java:23)
    at com.example.userservice.controller.UserController.createUser(UserController.java:31)
    ... 47 more
```

Read top to bottom:
1. **Exception type and message** — Java 14+ helpful NullPointerExceptions tell you exactly which variable was null.
2. **Your code** — The first `at` lines from your packages (`com.example`) show exactly where the error is. `UserService.java:47` is the precise line.
3. **Framework code** — The remaining lines show the call chain up to your code. Ignore these until you have understood the error in your code.

---

## Interview Talking Points

### Framing Your Java Experience

You have approximately 10 years of Java experience (Java 1–8) with some Spring Framework background, and a five-year gap. This is a strong foundation to work from:

**When asked about your Java experience:**

"I have around 10 years of Java experience, primarily with Java versions up to 8, and some Spring Framework background. I haven't used Java regularly for about five years, so I'd be refreshing rather than learning from scratch — I know the fundamentals well: the type system, OOP, the Collections Framework, exception handling, and the programming model. The main things I'd need to get current on are Spring Boot 3.x specifics and the modern Java language features from 9 through 21. I'd be reading current documentation and the team's existing codebase to get up to speed quickly rather than learning the language from zero."

This is honest, shows genuine self-awareness, and signals real senior experience.

### The Spring DI to Angular DI Comparison

A question you will get. Both systems were influenced by the same ideas:

**Both use:**
- A container that creates and manages object instances (Spring ApplicationContext / Angular Injector)
- Constructor injection as the preferred mechanism
- Singleton scope by default
- Type-based injection — inject by type, not by name
- Hierarchical injection contexts

**Key differences:**
- Spring's container is server-side; Angular's injector is client-side and component-tree-based
- Spring uses `@Service`, `@Repository`, `@Component`; Angular uses `@Injectable`
- Spring's `@Autowired` constructor injection maps directly to Angular's `inject()` function
- Spring supports multiple scopes (singleton, prototype, request, session); Angular's primary scope is the injector tree level (root, component)
- Angular has no equivalent of Spring's `@Profile` or `@Conditional` — Angular uses environment files and build configurations instead

### The Full-Stack Request Lifecycle

Being able to describe the complete journey from Angular to database and back is a senior full-stack indicator:

1. Angular component calls `HttpClient.post()` with a request body
2. Browser sends HTTP request with `Authorization: Bearer <token>` header
3. Browser sends CORS pre-flight OPTIONS request if cross-origin
4. Spring Security's filter chain: validates JWT, populates security context
5. CORS filter validates the origin against `WebMvcConfigurer` configuration
6. Request reaches the `@RestController` method
7. Jackson deserialises the request body JSON to a Java DTO
8. `@Valid` triggers validation — if it fails, returns 400 without calling the service
9. Controller calls the service method
10. `@Transactional` begins a database transaction
11. Service calls the repository
12. Spring Data JPA generates and executes SQL via Hibernate
13. Database executes the query, returns a result set
14. Hibernate maps rows to entity objects
15. Service maps entities to DTOs, applies business logic, returns the DTO
16. Transaction commits (or rolls back on exception)
17. Controller returns `ResponseEntity<UserDto>`
18. Jackson serialises the DTO to JSON
19. Spring adds response headers (Content-Type, CORS headers)
20. HTTP response returns to the browser
21. Angular's `HttpClient` deserialises the JSON
22. The Observable emits the typed result to the Angular component

### Common Full-Stack Debugging Scenarios

**CORS error in Angular:**
- Check the Network tab for the failed OPTIONS pre-flight request
- Is the Angular origin in Spring Boot's `WebMvcConfigurer`?
- Is Spring Security configured to allow OPTIONS requests? (`requestMatchers(OPTIONS).permitAll()`)
- Is `allowCredentials(true)` required for auth headers?

**401 Unauthorized:**
- Is the JWT being sent? Check the `Authorization` header in Network tab
- Has the JWT expired? Decode it at jwt.io and check the `exp` claim
- Is the endpoint correctly requiring authentication in Spring Security?

**500 Internal Server Error:**
- Check the Spring Boot logs — the full stack trace is there
- Common causes: NullPointerException, `LazyInitializationException` (accessing a lazy relationship outside a transaction), database constraint violation

**Slow API response:**
- Enable Hibernate SQL logging (`spring.jpa.show-sql=true`) — look for N+1 queries (same query repeated N times)
- Add `EXPLAIN ANALYZE` to the query and check if indexes are being used
- Is the response payload unnecessarily large (full entities instead of projections)?

### Best Practices Checklist — Appearing Senior

These patterns distinguish a returning senior developer from an intermediate developer:

- Always use constructor injection; never use field injection with `@Autowired`
- Return DTOs from controllers; never expose entities directly via the API
- Put business logic in `@Service` classes; keep controllers thin — HTTP translation only
- Mark query-only service methods with `@Transactional(readOnly = true)`
- Use `FetchType.LAZY` on all relationships; use JOIN FETCH or `@EntityGraph` when needed
- Always use `@Enumerated(EnumType.STRING)`; never `EnumType.ORDINAL`
- Use `Optional` return types for methods that may return nothing
- Use records for DTOs (Java 16+)
- Validate at the controller boundary with `@Valid`; throw business exceptions in services
- Use `@ControllerAdvice` for centralised exception handling
- Manage schema with Flyway or Liquibase; never use `ddl-auto=create` in production
- Hash passwords with `BCryptPasswordEncoder`; never store plain text
- Use `List.of()`, `Map.of()` for small fixed collections
- Use text blocks for multi-line SQL strings in `@Query` annotations
- Use `strip()` not `trim()`; use `isBlank()` not `isEmpty()` for whitespace checks
- Use `ConcurrentHashMap` for Map fields in singleton Spring beans

---

---

## JAX-WS and SOAP Web Services

### Why This Appears in Job Postings

SOAP (Simple Object Access Protocol) and JAX-WS (Java API for XML-Based Web Services) are older web service technologies that predate REST. New applications are virtually never built with SOAP — REST (and increasingly GraphQL) has replaced it for new development. SOAP appears in job postings when companies have legacy enterprise systems that use it — large banks, insurance companies, government systems, healthcare organisations, and ERP integrations.

If a job posting mentions SOAP, JAX-WS, WSDL, or "web services" (in a Java context), it means you may need to consume or integrate with existing SOAP services, not build new ones.

### What SOAP Is

SOAP is a messaging protocol that uses XML for data format. A SOAP web service:
- Uses HTTP (usually POST) as the transport
- Sends XML-formatted messages called SOAP envelopes
- Describes its interface in a WSDL (Web Services Description Language) file — an XML file describing what operations are available, their parameters, and return types
- Enforces strict typing through XML Schema (XSD)

SOAP predates REST and was designed for enterprise integration scenarios — financial transactions, healthcare data exchange, enterprise resource planning. Its strict typing and formal contract (WSDL) were advantages in an era when API documentation was inconsistent.

### What JAX-WS Is

JAX-WS is Java's API for building and consuming SOAP web services. It uses annotations on Java classes to define or consume SOAP services.

```java
// Defining a SOAP service with JAX-WS
@WebService(serviceName = "UserService")
public class UserWebService {

    @WebMethod(operationName = "getUser")
    public UserResponse getUser(
            @WebParam(name = "userId") String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    @WebMethod(operationName = "createUser")
    public CreateUserResponse createUser(
            @WebParam(name = "request") CreateUserRequest request) {
        User created = userService.create(request.getName(), request.getEmail());
        return new CreateUserResponse(created.getId());
    }
}

// Consuming an external SOAP service
// Step 1: generate Java classes from the WSDL
// wsimport -keep -verbose http://external-service.example.com/UserService?wsdl

// Step 2: use the generated client
UserService service = new UserService();          // generated class
UserServicePort port = service.getUserServicePort();
UserResponse user = port.getUser("123");          // SOAP call
```

In Spring Boot, SOAP services are typically integrated using Spring-WS for building SOAP services, or generated client stubs for consuming external SOAP services. The Angular front-end never talks to SOAP directly — the Spring Boot service acts as an adapter, translating SOAP responses into REST/JSON for the Angular application.

**The WSDL:** the WSDL is the SOAP equivalent of an OpenAPI specification. If you need to consume an existing SOAP service, you obtain the WSDL URL, run `wsimport` (or the Maven/Gradle equivalent) to generate Java client classes, and then call the service through the generated classes.

**What to say in interviews:** "I have worked with Java web services in the context of enterprise integrations. My understanding of SOAP is that it uses XML over HTTP with a strict WSDL contract. In modern Spring Boot applications, SOAP services are typically consumed through generated client stubs and wrapped in REST endpoints so the front-end never needs to deal with SOAP directly. I understand the concepts — WSDL, SOAP envelope, JAX-WS annotations — and could work with existing SOAP integrations given documentation and time to get familiar with the specific service."

---

*End of Java Overview — read the companion SQL Guide for SQL fundamentals, then revisit the JPA section for deeper context on query optimisation.*
