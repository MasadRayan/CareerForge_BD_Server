/**
 * CareerForge BD — Quiz Question Seeder
 * ──────────────────────────────────────
 * Seeds the quiz_questions table with a comprehensive question bank.
 * Run via: npx prisma db seed
 *
 * Categories: backend | frontend | fullstack | devops | data-science
 * Difficulties: easy | medium | hard
 *
 * Total: 220 questions
 *   - Backend:      45 (15 easy, 15 medium, 15 hard)
 *   - Frontend:     45 (15 easy, 15 medium, 15 hard)
 *   - Fullstack:    30 (10 easy, 10 medium, 10 hard)
 *   - DevOps:       50 (15 easy, 15 medium, 20 hard)
 *   - Data Science: 50 (15 easy, 15 medium, 20 hard)
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Difficulty } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type Question = {
  role_category: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: string;
  difficulty: Difficulty;
};

// ─────────────────────────────────────────────────────────────
// BACKEND QUESTIONS
// ─────────────────────────────────────────────────────────────
const backendQuestions: Question[] = [
  // ── Easy ──
  {
    role_category: "backend",
    question_text: "What does REST stand for in web development?",
    options: {
      a: "Remote Execution of Shared Tasks",
      b: "Representational State Transfer",
      c: "Reliable Endpoint Service Technology",
      d: "Resource Encoding and Serialisation Technology",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which HTTP status code indicates a successful resource creation?",
    options: { a: "200", b: "204", c: "201", d: "301" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What is the purpose of the HTTP OPTIONS method?",
    options: {
      a: "Delete a resource",
      b: "Describe communication options for a target resource",
      c: "Retrieve a resource",
      d: "Update a resource partially",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which of the following is NOT a valid HTTP method?",
    options: { a: "PATCH", b: "FETCH", c: "PUT", d: "DELETE" },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What does SQL stand for?",
    options: {
      a: "Structured Query Language",
      b: "Sequential Query Logic",
      c: "Simple Queue Language",
      d: "Standard Query Library",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which keyword in SQL is used to filter records?",
    options: { a: "FILTER", b: "HAVING", c: "WHERE", d: "LIMIT" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "In Node.js, what is `npm` primarily used for?",
    options: {
      a: "Node Process Manager",
      b: "Managing JavaScript packages and dependencies",
      c: "Compiling TypeScript",
      d: "Running unit tests",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What does JSON stand for?",
    options: {
      a: "JavaScript Object Notation",
      b: "Java Serialised Object Network",
      c: "JavaScript Online Node",
      d: "JSON Schema Object Notation",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which HTTP header is used to specify the format of the request body?",
    options: {
      a: "Accept",
      b: "Authorization",
      c: "Content-Type",
      d: "X-Request-Type",
    },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What is a primary key in a relational database?",
    options: {
      a: "The first column of every table",
      b: "A unique identifier for each record in a table",
      c: "A foreign reference to another table",
      d: "An index on frequently queried columns",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which command is used to initialise a new Node.js project?",
    options: { a: "node init", b: "npm start", c: "npm init", d: "npm create" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What does CRUD stand for?",
    options: {
      a: "Create, Read, Update, Delete",
      b: "Connect, Retrieve, Update, Deploy",
      c: "Create, Return, Update, Delete",
      d: "Configure, Read, Upload, Delete",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "Which status code means 'Not Found'?",
    options: { a: "401", b: "403", c: "500", d: "404" },
    correct_answer: "d",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "What is an API?",
    options: {
      a: "Automated Programming Interface",
      b: "Application Programming Interface",
      c: "Advanced Protocol Integration",
      d: "Application Process Interpreter",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "backend",
    question_text: "In Express.js, which method registers a middleware function?",
    options: { a: "app.register()", b: "app.listen()", c: "app.use()", d: "app.bind()" },
    correct_answer: "c",
    difficulty: "easy",
  },

  // ── Medium ──
  {
    role_category: "backend",
    question_text: "What is the difference between `PUT` and `PATCH` in REST?",
    options: {
      a: "PUT replaces the entire resource; PATCH modifies only specified fields",
      b: "PATCH replaces the entire resource; PUT modifies only specified fields",
      c: "They are identical and interchangeable",
      d: "PUT is idempotent; PATCH is not a valid HTTP method",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What does database indexing primarily improve?",
    options: {
      a: "Data integrity and uniqueness",
      b: "Query read performance at the cost of write overhead",
      c: "Storage compression",
      d: "Transaction isolation levels",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "Which of the following best describes a foreign key?",
    options: {
      a: "A key used to encrypt data in a table",
      b: "A column that references the primary key of another table to enforce referential integrity",
      c: "An index on a non-primary column",
      d: "A composite key made of two or more columns",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is JWT primarily used for in web applications?",
    options: {
      a: "Encrypting database passwords",
      b: "Stateless authentication and information exchange between parties",
      c: "Hashing user input to prevent SQL injection",
      d: "Compressing HTTP payloads",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "In SQL, what is the difference between `HAVING` and `WHERE`?",
    options: {
      a: "WHERE filters rows before aggregation; HAVING filters groups after aggregation",
      b: "HAVING filters rows before aggregation; WHERE filters after",
      c: "They are interchangeable",
      d: "WHERE works only with JOINs; HAVING works with GROUP BY only",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is the N+1 query problem in ORM usage?",
    options: {
      a: "Fetching N records requires N additional database queries for related data",
      b: "Using more than N connections to a database pool",
      c: "An ORM bug that duplicates the first query",
      d: "Running N parallel transactions that cause deadlocks",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What does ACID stand for in database transactions?",
    options: {
      a: "Asynchronous, Consistent, Isolated, Durable",
      b: "Atomic, Consistent, Isolated, Durable",
      c: "Atomic, Concurrent, Indexed, Distributed",
      d: "Asynchronous, Committed, Indexed, Durable",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is the purpose of environment variables in a backend application?",
    options: {
      a: "To store runtime configuration without hardcoding sensitive values in source code",
      b: "To define CSS variables for server-rendered templates",
      c: "To configure the TypeScript compiler",
      d: "To set memory limits for the Node process",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "Which of the following is a valid technique to prevent SQL injection?",
    options: {
      a: "Encoding all query strings in Base64 before execution",
      b: "Using parameterised queries / prepared statements",
      c: "Restricting queries to SELECT statements only",
      d: "Disabling error messages in production",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is rate limiting in an API?",
    options: {
      a: "Capping the size of request payloads",
      b: "Restricting the number of requests a client can make in a given time window",
      c: "Compressing responses above a certain size",
      d: "Limiting the number of database connections",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "In Node.js, what is the Event Loop responsible for?",
    options: {
      a: "Spawning child processes for CPU-intensive work",
      b: "Handling asynchronous callbacks and non-blocking I/O operations",
      c: "Managing garbage collection",
      d: "Compiling JavaScript to native code",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is the purpose of a database migration?",
    options: {
      a: "Moving data between two different database engines",
      b: "Versioned, repeatable scripts to evolve the database schema over time",
      c: "Backing up the database before a deployment",
      d: "Transferring rows between tables",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What HTTP status code should an API return when authentication fails?",
    options: { a: "400", b: "403", c: "401", d: "422" },
    correct_answer: "c",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "Which SQL clause is used to combine rows from two or more tables?",
    options: { a: "UNION", b: "MERGE", c: "JOIN", d: "COMBINE" },
    correct_answer: "c",
    difficulty: "medium",
  },
  {
    role_category: "backend",
    question_text: "What is middleware in Express.js?",
    options: {
      a: "A database ORM layer",
      b: "A function with access to req, res, and next that executes during the request-response cycle",
      c: "A templating engine",
      d: "An HTTP client for making outbound requests",
    },
    correct_answer: "b",
    difficulty: "medium",
  },

  // ── Hard ──
  {
    role_category: "backend",
    question_text: "What is the difference between optimistic and pessimistic locking in databases?",
    options: {
      a: "Optimistic assumes conflicts are rare and checks before committing; pessimistic locks the resource upfront",
      b: "Pessimistic allows concurrent reads; optimistic blocks all access",
      c: "Optimistic is used with NoSQL; pessimistic with relational DBs only",
      d: "They are implementation details with no behavioural difference",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is database connection pooling and why is it important?",
    options: {
      a: "Reusing a set of established database connections to reduce the overhead of creating a new connection per request",
      b: "Distributing queries across multiple replicas for load balancing",
      c: "Caching frequently executed queries in memory",
      d: "Encrypting connections to the database server",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "In distributed systems, what does the CAP theorem state?",
    options: {
      a: "A distributed system can simultaneously guarantee Consistency, Availability, and Partition tolerance",
      b: "A distributed system can guarantee at most two of: Consistency, Availability, and Partition tolerance",
      c: "Only relational databases can guarantee Consistency",
      d: "Partition tolerance is optional in most modern cloud deployments",
    },
    correct_answer: "b",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is a database deadlock and how is it typically resolved?",
    options: {
      a: "A deadlock occurs when two transactions each wait for the other to release a lock; resolved by timeout or deadlock detection with victim rollback",
      b: "A deadlock is when the connection pool is exhausted; resolved by increasing pool size",
      c: "A deadlock happens when a migration fails halfway; resolved by rolling back the migration",
      d: "A deadlock is a network timeout; resolved by retry logic",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is the purpose of a database transaction isolation level READ COMMITTED?",
    options: {
      a: "A transaction can read uncommitted changes made by other transactions",
      b: "A transaction only reads data that has been committed, preventing dirty reads but allowing non-repeatable reads",
      c: "A transaction sees a consistent snapshot from start to end, preventing all anomalies",
      d: "All reads are blocked until the transaction commits",
    },
    correct_answer: "b",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "In Node.js, when would you use `worker_threads` vs `child_process`?",
    options: {
      a: "worker_threads share memory with the parent; child_process is a fully separate process — use workers for CPU-bound tasks, child_process for isolation",
      b: "child_process runs in the same memory space; worker_threads create separate processes",
      c: "They are identical; the choice is only a style preference",
      d: "worker_threads are only available in browser environments",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is the difference between horizontal and vertical scaling?",
    options: {
      a: "Vertical scaling adds more instances; horizontal scaling upgrades hardware on existing servers",
      b: "Horizontal scaling adds more instances (scale out); vertical scaling increases resources on existing servers (scale up)",
      c: "They are the same concept with different naming conventions",
      d: "Horizontal scaling applies only to databases; vertical to application servers",
    },
    correct_answer: "b",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is event sourcing as an architectural pattern?",
    options: {
      a: "Storing only the current state of each entity in the database",
      b: "Persisting every state change as an immutable event in an append-only log, reconstructing state by replaying events",
      c: "Using webhooks to subscribe to external system changes",
      d: "Emitting server-sent events for real-time UI updates",
    },
    correct_answer: "b",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is the difference between authentication and authorisation?",
    options: {
      a: "Authentication verifies WHO you are; authorisation determines WHAT you are allowed to do",
      b: "Authorisation verifies WHO you are; authentication determines WHAT you are allowed to do",
      c: "They are the same concept expressed differently",
      d: "Authentication applies only to humans; authorisation to machine-to-machine calls",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "In PostgreSQL, what is the difference between a B-tree index and a GIN index?",
    options: {
      a: "B-tree is optimal for equality and range queries on scalar values; GIN indexes composite values like arrays, JSONB, and full-text search",
      b: "GIN is faster for all queries; B-tree is legacy",
      c: "B-tree indexes text; GIN indexes numbers",
      d: "They are identical in functionality but differ in storage format",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is CQRS and what problem does it solve?",
    options: {
      a: "Command Query Responsibility Segregation — separates read and write models to optimise each independently and improve scalability",
      b: "A caching strategy that stores query results in Redis",
      c: "A pattern for enforcing idempotency on POST requests",
      d: "A database sharding strategy",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is backpressure in streaming/queue systems?",
    options: {
      a: "A mechanism where a consumer signals to a producer to slow down when it cannot keep up with the incoming data rate",
      b: "The pressure applied on a server when CPU usage exceeds 90%",
      c: "Retry logic for failed background jobs",
      d: "Rate limiting on outbound HTTP requests",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is a saga pattern in microservices?",
    options: {
      a: "A way to manage distributed transactions across services using a sequence of local transactions and compensating actions on failure",
      b: "A design pattern for implementing circuit breakers between services",
      c: "A caching pattern for expensive computations",
      d: "A method for service discovery in a Kubernetes cluster",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "How does a write-through cache differ from a write-behind cache?",
    options: {
      a: "Write-through writes to cache and DB synchronously; write-behind writes to cache first and DB asynchronously later",
      b: "Write-behind writes to both cache and DB synchronously; write-through only updates the cache",
      c: "They are identical patterns",
      d: "Write-through is used only for NoSQL; write-behind for SQL",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "backend",
    question_text: "What is the purpose of idempotency in API design?",
    options: {
      a: "Ensuring that making the same request multiple times produces the same result as making it once",
      b: "Preventing duplicate records in a database",
      c: "Caching GET responses",
      d: "Validating that all request fields are present",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
];

// ─────────────────────────────────────────────────────────────
// FRONTEND QUESTIONS
// ─────────────────────────────────────────────────────────────
const frontendQuestions: Question[] = [
  // ── Easy ──
  {
    role_category: "frontend",
    question_text: "What does HTML stand for?",
    options: {
      a: "HyperText Markup Language",
      b: "High Text Machine Language",
      c: "HyperText Machine Link",
      d: "Hyper Transfer Markup Language",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "Which HTML tag is used to link an external CSS stylesheet?",
    options: { a: "<style>", b: "<script>", c: "<link>", d: "<css>" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What does CSS stand for?",
    options: {
      a: "Creative Style Sheets",
      b: "Cascading Style Sheets",
      c: "Coloured Style Scripts",
      d: "Computer Style System",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "Which CSS property is used to change text colour?",
    options: { a: "font-color", b: "text-color", c: "color", d: "foreground" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What is the default value of the CSS `position` property?",
    options: { a: "relative", b: "absolute", c: "fixed", d: "static" },
    correct_answer: "d",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "In React, what is JSX?",
    options: {
      a: "A CSS-in-JS library",
      b: "A syntax extension that allows writing HTML-like code in JavaScript",
      c: "A state management tool",
      d: "A JavaScript module bundler",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "Which CSS property controls the space between an element's border and its content?",
    options: { a: "margin", b: "border-spacing", c: "gap", d: "padding" },
    correct_answer: "d",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What does the `alt` attribute on an `<img>` tag provide?",
    options: {
      a: "Alternative styling for the image",
      b: "Alternative text for accessibility and when the image fails to load",
      c: "Animation delay for the image",
      d: "Alignment of the image within the page",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "In JavaScript, which method adds an element at the end of an array?",
    options: { a: "push()", b: "append()", c: "add()", d: "insert()" },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "Which CSS display value makes an element a flex container?",
    options: { a: "block", b: "inline-flex-container", c: "flex", d: "grid" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What is the purpose of the `<meta charset='UTF-8'>` tag?",
    options: {
      a: "Sets the viewport width for mobile devices",
      b: "Specifies the character encoding for the HTML document",
      c: "Links external metadata files",
      d: "Defines the author of the document",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "Which JavaScript keyword declares a block-scoped variable?",
    options: { a: "var", b: "let", c: "dim", d: "local" },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What does the browser's DOM represent?",
    options: {
      a: "A structured, object-oriented representation of the HTML document",
      b: "The network layer for fetching resources",
      c: "The JavaScript engine's runtime",
      d: "A Document Object Module for CSS processing",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What is the purpose of `localStorage` in the browser?",
    options: {
      a: "Storing data with a server-side session",
      b: "Storing key-value data in the browser that persists across sessions",
      c: "Caching HTTP responses from the network",
      d: "Saving user files to the device",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "frontend",
    question_text: "What does `console.log()` do in JavaScript?",
    options: {
      a: "Saves a message to a log file on the server",
      b: "Displays a message in the browser's developer console",
      c: "Alerts the user with a popup",
      d: "Sends an error report to the backend",
    },
    correct_answer: "b",
    difficulty: "easy",
  },

  // ── Medium ──
  {
    role_category: "frontend",
    question_text: "What is the difference between `==` and `===` in JavaScript?",
    options: {
      a: "`==` checks value only with type coercion; `===` checks value AND type with no coercion",
      b: "`===` checks value only; `==` checks value and type",
      c: "They are identical in modern JavaScript",
      d: "`===` is only valid inside strict mode",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is event bubbling in the browser?",
    options: {
      a: "An event fired on a child element propagates upward through its parent elements",
      b: "A CSS animation effect where elements appear to float",
      c: "A technique for lazy loading images",
      d: "An event that fires multiple times in rapid succession",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "In React, what is the purpose of the `useEffect` hook?",
    options: {
      a: "Managing local component state",
      b: "Performing side effects (data fetching, subscriptions, DOM mutations) after render",
      c: "Memoising expensive computations",
      d: "Sharing state between sibling components",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is CSS specificity?",
    options: {
      a: "A measure that determines which CSS rule applies when multiple rules target the same element",
      b: "The order in which stylesheets are loaded",
      c: "The CSS inheritance chain for nested elements",
      d: "A performance metric for CSS rendering time",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What does `async/await` in JavaScript do?",
    options: {
      a: "Creates Web Workers for parallel execution",
      b: "Provides syntactic sugar over Promises for writing asynchronous code in a synchronous style",
      c: "Schedules code to run after the current call stack is empty",
      d: "Compiles JavaScript ahead of time",
    },
    correct_answer: "b",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is a controlled component in React?",
    options: {
      a: "A component whose form element value is managed by React state",
      b: "A component wrapped in React.memo()",
      c: "A component that uses useRef instead of useState",
      d: "A component rendered server-side",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is the CSS Box Model?",
    options: {
      a: "A layout system using content, padding, border, and margin to define an element's space",
      b: "A CSS grid feature for defining column boxes",
      c: "A way to create 3D perspective transforms",
      d: "A module for defining reusable CSS components",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is a closure in JavaScript?",
    options: {
      a: "A function that retains access to variables from its outer (enclosing) scope even after the outer function has returned",
      b: "A method to close browser windows programmatically",
      c: "A design pattern for encapsulating CSS",
      d: "A way to prevent event propagation",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What does `box-sizing: border-box` do in CSS?",
    options: {
      a: "Includes padding and border in the element's total width and height",
      b: "Adds a border to all sides of the box model",
      c: "Makes the element's border render outside the content area",
      d: "Applies a shadow to the element's border",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is the purpose of the `key` prop in React lists?",
    options: {
      a: "Providing a unique identifier that helps React efficiently reconcile and update list items",
      b: "Enabling keyboard navigation for list elements",
      c: "Locking the list so it cannot be re-rendered",
      d: "Linking list items to a Redux store",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is the difference between `null` and `undefined` in JavaScript?",
    options: {
      a: "`undefined` means a variable has been declared but not assigned; `null` is an intentional absence of value",
      b: "`null` means undeclared; `undefined` means explicitly cleared",
      c: "They are identical with no practical difference",
      d: "`null` is a string; `undefined` is a number",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is lazy loading in the context of frontend development?",
    options: {
      a: "Deferring the loading of resources (images, components, routes) until they are actually needed",
      b: "Using a CDN to serve static assets",
      c: "Loading all JavaScript files at application startup for speed",
      d: "A CSS animation that delays element rendering",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is the Virtual DOM in React?",
    options: {
      a: "An in-memory representation of the real DOM that React uses to batch and minimise actual DOM updates",
      b: "A shadow copy of the DOM stored in localStorage",
      c: "A Web Worker that handles DOM rendering in a background thread",
      d: "A separate DOM for SSR that is discarded after hydration",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What does `z-index` control in CSS?",
    options: {
      a: "The stacking order of positioned elements along the Z-axis",
      b: "The zoom level of an element",
      c: "The visibility of an element",
      d: "The number of animation frames per second",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "frontend",
    question_text: "What is `Promise.all()` used for in JavaScript?",
    options: {
      a: "Running multiple Promises in parallel and waiting for ALL of them to resolve (or any to reject)",
      b: "Running Promises sequentially one after another",
      c: "Returning the first Promise to resolve",
      d: "Catching errors from all Promises",
    },
    correct_answer: "a",
    difficulty: "medium",
  },

  // ── Hard ──
  {
    role_category: "frontend",
    question_text: "What is React's reconciliation algorithm and what heuristics does it use?",
    options: {
      a: "React's process of efficiently updating the DOM by comparing virtual DOM trees; uses heuristics: elements of different types produce different trees, and the `key` prop stabilises list item identity",
      b: "React's garbage collection process for unused state",
      c: "The algorithm for server-side hydration of components",
      d: "React's algorithm for batching state updates across multiple components",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the purpose of `useMemo` in React and what are the risks of overusing it?",
    options: {
      a: "`useMemo` memomises expensive computed values; overuse adds unnecessary complexity and the memo overhead itself can be costlier than the computation for cheap operations",
      b: "`useMemo` prevents all re-renders; overuse can cause stale state",
      c: "`useMemo` is a replacement for `useCallback`; overuse creates memory leaks",
      d: "`useMemo` is identical to `useEffect` but synchronous",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the CSS `contain` property and how does it improve performance?",
    options: {
      a: "It isolates an element's rendering subtree so the browser can skip layout, paint, or style recalculations outside that subtree",
      b: "It limits the element's content to a fixed size without scrollbars",
      c: "It controls which child elements are visible when overflow occurs",
      d: "It creates a new stacking context for the element",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the difference between `repaint` and `reflow` in browser rendering?",
    options: {
      a: "Reflow (layout) recalculates element geometry; repaint redraws pixels. Reflow triggers repaint but not vice versa. Reflow is more expensive.",
      b: "Repaint recalculates layout; reflow only updates colours",
      c: "They are the same operation done by different browser engines",
      d: "Reflow applies to animations; repaint applies to static elements",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is Content Security Policy (CSP) and what attack does it mitigate?",
    options: {
      a: "An HTTP header that whitelists trusted content sources to mitigate Cross-Site Scripting (XSS) attacks",
      b: "A browser policy that prevents CSRF attacks by blocking cross-origin cookies",
      c: "A server configuration that limits upload sizes",
      d: "An encryption policy for HTTPS connections",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What are React Server Components and how do they differ from Client Components?",
    options: {
      a: "Server Components render exclusively on the server with zero client-side JavaScript bundle cost; Client Components run in the browser with interactivity. Server Components cannot use hooks or browser APIs.",
      b: "Server Components are Next.js-only and identical to SSR pages",
      c: "Client Components are deprecated in React 19",
      d: "Server Components use class syntax; Client Components use functions",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
    options: {
      a: "The period between entering a scope where a `let` or `const` variable is declared and the line where it is initialised — accessing it throws a ReferenceError",
      b: "The time a setTimeout callback waits in the queue before execution",
      c: "A memory region where garbage-collected objects are temporarily held",
      d: "An async gap between a Promise being created and resolving",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is a WeakRef in JavaScript and when would you use it?",
    options: {
      a: "A reference to an object that does not prevent garbage collection, useful for caches where you don't want to keep objects alive unnecessarily",
      b: "A reference to a Web Worker thread",
      c: "A React ref that automatically cleans up on unmount",
      d: "A deprecated alternative to `useRef`",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is Core Web Vitals and which three metrics does Google currently measure?",
    options: {
      a: "A set of performance metrics: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift)",
      b: "FCP, TTI, and TBT",
      c: "FID, TTFB, and Speed Index",
      d: "LCP, FCP, and TTFB",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the Shadow DOM and what problem does it solve?",
    options: {
      a: "An encapsulated DOM subtree attached to a Web Component, isolating its styles and markup from the main document to prevent CSS leakage",
      b: "A browser debug feature that shows hidden elements",
      c: "A copy of the DOM kept in memory for React's reconciliation",
      d: "An alternative rendering layer used for canvas animations",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "Explain the difference between `requestAnimationFrame` and `setTimeout` for animations.",
    options: {
      a: "`requestAnimationFrame` synchronises with the browser's refresh rate (typically 60fps) and pauses in background tabs; `setTimeout` fires on a fixed delay regardless of frame rate and is less smooth",
      b: "`setTimeout` is hardware-accelerated; `requestAnimationFrame` uses the JavaScript thread",
      c: "They are interchangeable for animations; `requestAnimationFrame` is just a newer API",
      d: "`requestAnimationFrame` is limited to CSS animations only",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is WCAG and why does it matter for frontend developers?",
    options: {
      a: "Web Content Accessibility Guidelines — a standard defining how to make web content accessible to people with disabilities; frontend devs must follow it for legal compliance and inclusive design",
      b: "Web Component Application Guidelines — a standard for building Web Components",
      c: "Web Cache and CDN Guidelines — a standard for HTTP caching headers",
      d: "Web CSS Architecture Guidelines — a methodology for scalable CSS",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is tree shaking in JavaScript bundling?",
    options: {
      a: "The process of removing unused exports/dead code from a bundle by statically analysing ES module import/export statements",
      b: "A technique for splitting large bundles into smaller chunks",
      c: "A garbage collection mechanism inside the JavaScript engine",
      d: "A CSS optimisation that removes unused selectors",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is hydration in the context of Server-Side Rendering (SSR)?",
    options: {
      a: "The process where client-side JavaScript attaches event listeners and takes over interactivity for server-rendered HTML, making it fully interactive",
      b: "Re-fetching server data after the page loads",
      c: "Generating static HTML at build time",
      d: "Caching server responses in the browser",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "frontend",
    question_text: "What is the difference between `will-change` and `transform: translateZ(0)` in CSS performance?",
    options: {
      a: "`will-change` is the modern standard that hints to the browser about which properties will change, creating a compositing layer; `translateZ(0)` is an older hack that forces GPU layer promotion — both should be used sparingly as they consume GPU memory",
      b: "`transform: translateZ(0)` is faster because it skips the layout phase",
      c: "`will-change` only works for opacity; translateZ works for any property",
      d: "They are unrelated — `will-change` is for JavaScript animations; `translateZ` is for CSS transitions",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
];

// ─────────────────────────────────────────────────────────────
// FULLSTACK QUESTIONS
// ─────────────────────────────────────────────────────────────
const fullstackQuestions: Question[] = [
  // ── Easy ──
  {
    role_category: "fullstack",
    question_text: "In a fullstack application, what does 'API' connect?",
    options: {
      a: "Two databases",
      b: "The frontend (client) and the backend (server)",
      c: "The web server and the CDN",
      d: "The CI/CD pipeline and the deployment server",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What is CORS and when does it occur?",
    options: {
      a: "A CSS rendering issue in Safari",
      b: "A browser security mechanism that blocks cross-origin HTTP requests unless the server allows them",
      c: "A server-side caching policy",
      d: "A database connection error",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What is the purpose of a `.env` file in a Node.js project?",
    options: {
      a: "To store environment-specific configuration like API keys, database URLs, and ports",
      b: "To define TypeScript environment types",
      c: "To configure the Node.js garbage collector",
      d: "To list npm packages to install",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What does SSR stand for?",
    options: {
      a: "Static Site Rendering",
      b: "Server-Side Rendering",
      c: "Shared State Runtime",
      d: "Synchronous Script Response",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "Which tool is commonly used to test REST APIs locally?",
    options: { a: "Figma", b: "Postman", c: "Webpack", d: "Prisma Studio" },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What is TypeScript?",
    options: {
      a: "A strongly-typed superset of JavaScript that compiles to plain JavaScript",
      b: "A template engine for server-side HTML rendering",
      c: "A JavaScript runtime alternative to Node.js",
      d: "A CSS framework with type-safe class names",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What is Git used for?",
    options: {
      a: "Deploying applications to cloud servers",
      b: "Distributed version control — tracking changes to code over time",
      c: "Running automated tests",
      d: "Compressing and bundling JavaScript files",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What does ORM stand for?",
    options: {
      a: "Object Relational Mapping",
      b: "Online Resource Manager",
      c: "Object Runtime Module",
      d: "Open Request Method",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "Which of the following is a NoSQL database?",
    options: { a: "PostgreSQL", b: "MySQL", c: "MongoDB", d: "SQLite" },
    correct_answer: "c",
    difficulty: "easy",
  },
  {
    role_category: "fullstack",
    question_text: "What is the purpose of a package.json `scripts` field?",
    options: {
      a: "Defining reusable npm commands like `dev`, `build`, and `test`",
      b: "Listing all installed packages",
      c: "Configuring the TypeScript compiler",
      d: "Setting environment variables",
    },
    correct_answer: "a",
    difficulty: "easy",
  },

  // ── Medium ──
  {
    role_category: "fullstack",
    question_text: "What is the difference between SSR and CSR (Client-Side Rendering)?",
    options: {
      a: "SSR generates HTML on the server per request; CSR sends minimal HTML and renders content in the browser via JavaScript",
      b: "CSR is always faster than SSR",
      c: "SSR is only possible with React; CSR works with any framework",
      d: "They produce identical output and performance",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is a monorepo and what are its advantages?",
    options: {
      a: "A single repository containing multiple projects/packages, enabling shared tooling, atomic commits across projects, and simplified dependency management",
      b: "A repository that uses a single large file for all code",
      c: "A deployment strategy using a single server",
      d: "A database with a single-file storage format",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is the purpose of Prisma in a TypeScript backend?",
    options: {
      a: "An ORM that generates type-safe database client code from schema definitions, handling migrations and queries",
      b: "A GraphQL schema-first code generator",
      c: "A testing framework for database assertions",
      d: "A caching library for PostgreSQL",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is a webhook?",
    options: {
      a: "An HTTP callback that a server sends to a predefined URL when a specific event occurs",
      b: "A browser API for WebSocket connections",
      c: "A Git hook that runs on every commit",
      d: "A reverse proxy configuration option",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is the difference between a cookie and a JWT for authentication?",
    options: {
      a: "Cookies are stored by the browser and sent automatically; JWTs are tokens passed manually in headers. Cookies benefit from HttpOnly/Secure flags; JWTs are self-contained and stateless.",
      b: "JWTs are more secure in all scenarios; cookies should be avoided",
      c: "Cookies require server-side sessions; JWTs cannot carry user data",
      d: "They are identical mechanisms with different names",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is CI/CD?",
    options: {
      a: "Continuous Integration / Continuous Delivery — automating the build, test, and deployment pipeline so code changes ship safely and frequently",
      b: "Code Inspection / Code Delivery",
      c: "Container Integration / Container Deployment",
      d: "Client Integration / Client Deployment",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is GraphQL and how does it differ from REST?",
    options: {
      a: "GraphQL uses a typed schema and lets clients request exactly the fields they need; REST has fixed endpoints that return predetermined shapes",
      b: "GraphQL uses multiple endpoints; REST uses a single /graphql endpoint",
      c: "REST is for mutations; GraphQL is for reads only",
      d: "They are both identical query languages for databases",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is a CDN and what are its benefits?",
    options: {
      a: "Content Delivery Network — a geographically distributed network of servers that serves static assets from nodes close to the user, reducing latency and origin load",
      b: "A centralised database network",
      c: "A code dependency network for npm packages",
      d: "A cloud-native deployment solution",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is the purpose of input validation on the backend even when the frontend already validates?",
    options: {
      a: "Frontend validation is easily bypassed (DevTools, Postman, scripts); backend validation is the last line of defence for data integrity and security",
      b: "Duplicate validation improves performance through caching",
      c: "Frontend validation is unreliable for accessibility; backend is accessible",
      d: "It is unnecessary redundancy and should be removed",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "fullstack",
    question_text: "What is optimistic UI and when is it used?",
    options: {
      a: "Updating the UI immediately as if the server request succeeded, then rolling back if it fails — used to make interactions feel instant",
      b: "Loading UI components only when they enter the viewport",
      c: "A design system philosophy focusing on positive user experiences",
      d: "A caching strategy that returns stale data while revalidating",
    },
    correct_answer: "a",
    difficulty: "medium",
  },

  // ── Hard ──
  {
    role_category: "fullstack",
    question_text: "What is the BFF (Backend For Frontend) pattern?",
    options: {
      a: "A dedicated backend service per frontend client (web, mobile, etc.) that aggregates data and adapts it to each client's specific needs",
      b: "A best practice for writing frontend code that directly queries the database",
      c: "A pattern for sharing backend business logic between multiple frontends",
      d: "A caching layer between the frontend and a microservice mesh",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What are the trade-offs between microservices and a monolith architecture?",
    options: {
      a: "Microservices offer independent deployment and scalability per service but add network latency, operational complexity, and distributed system challenges; monoliths are simpler to develop and test but harder to scale individual bottlenecks",
      b: "Monoliths are always faster; microservices are always more scalable",
      c: "Microservices share a single database; monoliths use multiple databases",
      d: "Monoliths are only for small projects; microservices are only for large teams",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is eventual consistency in distributed systems?",
    options: {
      a: "A consistency model where replicas of data will converge to the same value eventually if no new updates are made, but may temporarily return stale data",
      b: "A guarantee that all database writes are immediately visible to all clients",
      c: "A caching policy that invalidates data after a TTL",
      d: "A deployment strategy ensuring zero downtime",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is the strangler fig pattern in software migration?",
    options: {
      a: "Gradually replacing a legacy system by building new functionality alongside it, routing traffic incrementally to the new system until the old one can be decommissioned",
      b: "A blue/green deployment strategy",
      c: "A database migration technique for renaming tables",
      d: "A design pattern for handling rate limits in a legacy API",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is an API gateway and what responsibilities does it typically handle?",
    options: {
      a: "A single entry point for all client requests that handles routing, authentication, rate limiting, SSL termination, load balancing, and request transformation",
      b: "A serverless function that proxies database queries",
      c: "A CDN node that caches API responses",
      d: "An API testing tool for CI pipelines",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is the purpose of database query explain plans?",
    options: {
      a: "Showing how the query planner executes a query — including index usage, join strategy, and estimated cost — used to identify and fix slow queries",
      b: "Generating human-readable documentation from SQL files",
      c: "Validating query syntax before execution",
      d: "Caching frequently run query results",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is zero-downtime deployment and how is it achieved?",
    options: {
      a: "Deploying new code without interrupting live traffic, achieved through blue/green deployments, rolling updates, or canary releases where traffic is gradually shifted to the new version",
      b: "Deploying only during off-peak hours to minimise user impact",
      c: "Using a CDN to serve cached responses while the server restarts",
      d: "Disabling health checks during deployment",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is the difference between synchronous and asynchronous message queues?",
    options: {
      a: "Synchronous queues block the sender until the consumer processes the message; asynchronous queues return immediately, decoupling producers and consumers",
      b: "Async queues guarantee message ordering; sync queues do not",
      c: "Sync queues are only for internal services; async queues are for external APIs",
      d: "They differ only in implementation, not in behavioural guarantees",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is feature flagging and why is it valuable in fullstack development?",
    options: {
      a: "A technique for enabling/disabling features at runtime without code deployment, enabling A/B testing, gradual rollouts, and instant rollback",
      b: "A CSS technique for conditionally applying styles",
      c: "A TypeScript pattern for conditional type narrowing",
      d: "A Git branching strategy",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "fullstack",
    question_text: "What is the difference between structured and unstructured logging, and why does it matter?",
    options: {
      a: "Structured logging outputs machine-parseable format (JSON) with consistent fields; unstructured is plain text. Structured logs are searchable and filterable in log aggregation systems like Datadog or CloudWatch",
      b: "Structured logging is only for production; unstructured for development",
      c: "Unstructured logging is faster; structured adds unacceptable overhead",
      d: "They are identical — the choice is purely cosmetic",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
];

// ─────────────────────────────────────────────────────────────
// DEVOPS QUESTIONS
// ─────────────────────────────────────────────────────────────
const devopsQuestions: Question[] = [
  // ── Easy ──
  {
    role_category: "devops",
    question_text: "What does Docker do?",
    options: {
      a: "Packages applications and their dependencies into portable containers",
      b: "Manages Git repositories in the cloud",
      c: "Monitors server CPU and memory usage",
      d: "Provides a cloud SQL database service",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is a Dockerfile?",
    options: {
      a: "A text file with instructions to build a Docker image",
      b: "A YAML configuration for Docker Compose",
      c: "A log file generated by a Docker container",
      d: "A script to install Docker on a server",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What does CI stand for in CI/CD?",
    options: {
      a: "Container Integration",
      b: "Continuous Integration",
      c: "Cloud Infrastructure",
      d: "Code Inspection",
    },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is Kubernetes primarily used for?",
    options: {
      a: "Orchestrating and managing containerised applications at scale",
      b: "Writing Docker images",
      c: "Monitoring application logs",
      d: "Managing DNS records",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of a load balancer?",
    options: {
      a: "Distributing incoming traffic across multiple servers to improve availability and performance",
      b: "Compressing HTTP responses",
      c: "Authenticating API requests",
      d: "Caching database queries",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is SSH?",
    options: {
      a: "Secure Shell — an encrypted protocol for remotely accessing servers",
      b: "Simple Service Host — a lightweight web server protocol",
      c: "Shared State Handler — a microservices communication protocol",
      d: "Software Security Hub — a vulnerability scanning service",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What does IaC stand for in DevOps?",
    options: {
      a: "Infrastructure as Code",
      b: "Integration and Configuration",
      c: "Internal API Connectivity",
      d: "Incremental Application Checkout",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is a reverse proxy?",
    options: {
      a: "A server that sits in front of backend servers, forwarding client requests to them",
      b: "A proxy that routes outbound requests from servers to the internet",
      c: "A DNS resolver for private networks",
      d: "A VPN tunnel between two data centres",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of a `.gitignore` file?",
    options: {
      a: "Listing files and directories that Git should not track or commit",
      b: "Configuring Git merge strategies",
      c: "Defining branch protection rules",
      d: "Specifying commit message templates",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is a VM (Virtual Machine)?",
    options: {
      a: "An emulation of a computer system that runs on physical hardware, isolated from other VMs",
      b: "A programming language virtual machine like the JVM",
      c: "A Docker container with persistent storage",
      d: "A serverless function execution environment",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What does HTTPS add over HTTP?",
    options: {
      a: "Transport Layer Security (TLS) encryption, ensuring data is encrypted in transit",
      b: "Faster connection speeds",
      c: "Gzip compression of responses",
      d: "HTTP/2 multiplexing",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is a cron job?",
    options: {
      a: "A scheduled task that runs automatically at specified time intervals on a Unix/Linux system",
      b: "A background worker thread in Node.js",
      c: "A GitHub Actions workflow trigger",
      d: "A Kubernetes health check probe",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What does `docker-compose up` do?",
    options: {
      a: "Starts all services defined in a `docker-compose.yml` file",
      b: "Builds a Docker image from a Dockerfile",
      c: "Pushes a Docker image to a registry",
      d: "Scales a single service to multiple instances",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of environment-specific configurations (dev, staging, prod)?",
    options: {
      a: "Each environment needs different settings (DB URLs, API keys, log levels) to keep development safe and isolated from production data",
      b: "To run different programming languages per environment",
      c: "To assign different teams to different environments",
      d: "To use different Git branches per environment",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "devops",
    question_text: "What is the function of `EXPOSE` in a Dockerfile?",
    options: {
      a: "Documents which port the container listens on (does not actually publish the port — that requires `-p` at runtime)",
      b: "Opens the specified firewall port on the host",
      c: "Makes the container publicly accessible on the internet",
      d: "Sets the container's internal hostname",
    },
    correct_answer: "a",
    difficulty: "easy",
  },

  // ── Medium ──
  {
    role_category: "devops",
    question_text: "What is the difference between a Docker image and a Docker container?",
    options: {
      a: "An image is an immutable blueprint; a container is a running instance of an image",
      b: "A container is stored on disk; an image runs in memory",
      c: "Images run multiple services; containers run a single process",
      d: "They are identical — container is just the older term",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is a Kubernetes Pod?",
    options: {
      a: "The smallest deployable unit in Kubernetes, containing one or more containers that share network and storage",
      b: "A group of Kubernetes nodes in a cluster",
      c: "A configuration file for deploying services",
      d: "A Kubernetes storage volume",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of a Kubernetes `Deployment`?",
    options: {
      a: "Declaratively manages a set of replica Pods, handling rolling updates and rollbacks",
      b: "Exposes a Pod to external network traffic",
      c: "Stores configuration values for containers",
      d: "Schedules Pods to specific nodes",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is Terraform used for?",
    options: {
      a: "Infrastructure as Code — provisioning and managing cloud resources declaratively using HCL configuration files",
      b: "Containerising applications for Kubernetes",
      c: "Monitoring application performance metrics",
      d: "Managing Docker image registries",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is the difference between blue/green and canary deployments?",
    options: {
      a: "Blue/green switches all traffic from old (blue) to new (green) at once; canary gradually routes a small percentage of traffic to the new version",
      b: "Canary switches all traffic immediately; blue/green routes gradually",
      c: "Blue/green requires Kubernetes; canary works with any deployment tool",
      d: "They are identical strategies",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of a health check in a containerised application?",
    options: {
      a: "Allows the orchestrator to determine if a container is running correctly and restart or remove unhealthy instances",
      b: "Monitors network bandwidth usage",
      c: "Validates SSL certificates on startup",
      d: "Checks if all npm dependencies are installed",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is a Kubernetes ConfigMap?",
    options: {
      a: "A Kubernetes object for storing non-sensitive configuration data as key-value pairs, decoupled from container images",
      b: "A network policy configuration for cluster communication",
      c: "A configuration file for the Kubernetes API server",
      d: "A mapping of container ports to host ports",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is the difference between a Kubernetes Secret and a ConfigMap?",
    options: {
      a: "Secrets are for sensitive data (passwords, tokens) and are base64-encoded; ConfigMaps are for non-sensitive configuration. Both should be further secured with RBAC and encryption at rest.",
      b: "Secrets are encrypted at the application layer; ConfigMaps are plaintext",
      c: "They are identical — Secrets just have a different YAML kind",
      d: "ConfigMaps support binary data; Secrets only support strings",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is a Docker multi-stage build?",
    options: {
      a: "Using multiple FROM instructions in a Dockerfile to build in one stage and copy only the final artefacts to a lean production image, reducing image size",
      b: "Running multiple Docker builds in parallel for different architectures",
      c: "A way to build images with multiple base operating systems",
      d: "A technique for merging two Docker images",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is observability in DevOps and what are its three pillars?",
    options: {
      a: "The ability to understand a system's internal state from its external outputs; the three pillars are Metrics, Logs, and Traces",
      b: "Monitoring CPU and memory usage; the pillars are CPU, RAM, and Disk",
      c: "The ability to deploy changes with confidence; the pillars are CI, CD, and testing",
      d: "A security practice; the pillars are Authentication, Authorisation, and Auditing",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What does `docker build -t myapp:latest .` do?",
    options: {
      a: "Builds a Docker image from the Dockerfile in the current directory and tags it as `myapp:latest`",
      b: "Runs a container named `myapp` in the background",
      c: "Pushes the `myapp:latest` image to Docker Hub",
      d: "Creates a multi-stage build with two layers",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is a Kubernetes Service and why is it needed?",
    options: {
      a: "A stable network endpoint for accessing Pods, necessary because Pod IPs are ephemeral and change when Pods restart",
      b: "A background process that runs inside a Kubernetes cluster",
      c: "A microservice deployed to Kubernetes",
      d: "A Kubernetes node that handles service mesh routing",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is GitOps?",
    options: {
      a: "A practice where Git is the single source of truth for infrastructure and application configuration, with automated reconciliation to match the cluster state to the Git repository",
      b: "A Git branching strategy for large teams",
      c: "A CI/CD tool built into GitHub",
      d: "A way to run Git inside a Kubernetes cluster",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is the purpose of a `.dockerignore` file?",
    options: {
      a: "Listing files that should NOT be sent to the Docker build context, reducing build time and preventing sensitive files from being included in the image",
      b: "Specifying which Docker images to exclude from a compose file",
      c: "Blocking Docker container network access to certain hosts",
      d: "Defining which ports Docker should not expose",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "devops",
    question_text: "What is a circuit breaker pattern in microservices?",
    options: {
      a: "A pattern that detects when a downstream service is failing and stops sending requests to it temporarily, preventing cascade failures across the system",
      b: "A Kubernetes policy that restarts crashed containers",
      c: "A load balancing algorithm that distributes traffic evenly",
      d: "A pattern for handling database connection failures",
    },
    correct_answer: "a",
    difficulty: "medium",
  },

  // ── Hard ──
  {
    role_category: "devops",
    question_text: "What is the difference between horizontal pod autoscaling (HPA) and vertical pod autoscaling (VPA) in Kubernetes?",
    options: {
      a: "HPA adds more Pod replicas when load increases; VPA adjusts the CPU/memory resource requests of existing Pods. They can conflict and are often not run together.",
      b: "VPA adds more nodes; HPA adds more Pods",
      c: "HPA is for stateful apps; VPA is for stateless",
      d: "They are identical — VPA is the deprecated name for HPA",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is eBPF and how is it used in modern Kubernetes networking?",
    options: {
      a: "Extended Berkeley Packet Filter — runs sandboxed programs in the Linux kernel for high-performance networking, observability, and security without kernel modules; used by tools like Cilium to replace iptables in Kubernetes",
      b: "An encrypted BPF encryption standard for Kubernetes secrets",
      c: "A network plugin that replaces etcd in Kubernetes",
      d: "A binary packaging format for Kubernetes workloads",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What are the challenges of running stateful applications in Kubernetes?",
    options: {
      a: "Pods are ephemeral and can be rescheduled to different nodes; stateful apps need persistent storage (PersistentVolumes), stable network identity (StatefulSets), and ordered startup/shutdown",
      b: "Stateful apps cannot run in Kubernetes at all",
      c: "Kubernetes does not support volumes for stateful data",
      d: "Stateful apps require a dedicated Kubernetes cluster",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is a service mesh and what problems does it solve?",
    options: {
      a: "Infrastructure layer (e.g. Istio, Linkerd) that handles service-to-service communication — providing mTLS encryption, traffic management, observability, and retries without changing application code",
      b: "A Kubernetes network plugin for CNI (Container Network Interface)",
      c: "A load balancer configuration for microservices",
      d: "A pattern for managing shared configuration between services",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is etcd in the context of Kubernetes?",
    options: {
      a: "A distributed key-value store used as Kubernetes' primary backing store for all cluster state and configuration",
      b: "A container runtime alternative to containerd",
      c: "A Kubernetes networking component handling DNS",
      d: "A log aggregation service in the Kubernetes control plane",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is the difference between `Recreate` and `RollingUpdate` deployment strategies in Kubernetes?",
    options: {
      a: "Recreate terminates all old Pods before creating new ones (downtime); RollingUpdate gradually replaces old Pods with new ones (zero downtime) using maxSurge and maxUnavailable controls",
      b: "RollingUpdate recreates all Pods simultaneously; Recreate is gradual",
      c: "Recreate is for stateless apps; RollingUpdate is for stateful",
      d: "They are identical strategies",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is a Kubernetes Operator?",
    options: {
      a: "An application-specific controller that extends the Kubernetes API to manage complex stateful applications (like databases) using Custom Resource Definitions (CRDs)",
      b: "A human DevOps engineer who manages a Kubernetes cluster",
      c: "The Kubernetes scheduler process",
      d: "A Helm chart for deploying operators",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is the 4 Golden Signals framework in SRE?",
    options: {
      a: "Latency, Traffic, Errors, and Saturation — the four metrics Google's SRE book identifies as essential for monitoring service health",
      b: "CPU, Memory, Disk, and Network — the four infrastructure metrics",
      c: "Uptime, Error Rate, Response Time, and Throughput",
      d: "Deploy frequency, Lead time, MTTR, and Change failure rate",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is Helm and what problem does it solve in Kubernetes?",
    options: {
      a: "A package manager for Kubernetes — bundles related Kubernetes manifests into charts with templating, versioning, and release management to simplify complex application deployment",
      b: "A monitoring tool for Kubernetes pods",
      c: "A Kubernetes alternative to Docker Compose",
      d: "A secrets management tool for Kubernetes",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "Explain the concept of DORA metrics and why they are used.",
    options: {
      a: "DevOps Research and Assessment metrics: Deployment Frequency, Lead Time for Changes, Mean Time to Restore, and Change Failure Rate — used to measure software delivery performance and operational health",
      b: "Database Operational Risk Assessment metrics for database reliability",
      c: "Docker Orchestration and Registry Administration metrics",
      d: "A set of Kubernetes cluster health metrics defined by CNCF",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is pod disruption budget (PDB) in Kubernetes?",
    options: {
      a: "A policy that limits how many Pods of a replicated application can be simultaneously unavailable during voluntary disruptions (like node drains or rolling updates)",
      b: "A resource limit for CPU and memory per Pod",
      c: "A budget allocation tool for cloud infrastructure costs",
      d: "A Kubernetes feature for scheduling Pods on specific nodes",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is chaos engineering?",
    options: {
      a: "Intentionally injecting failures (network latency, pod kills, disk failures) into a production or staging system to proactively discover weaknesses before they cause unplanned outages",
      b: "A software development methodology for rapid, unstructured iteration",
      c: "A load testing approach that simulates millions of concurrent users",
      d: "A Kubernetes feature that randomly reschedules Pods for efficiency",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is supply chain security in the context of DevOps (e.g. SLSA framework)?",
    options: {
      a: "Protecting every step from source code to deployment — including securing dependencies (SBOMs), signing artefacts, verifying build provenance, and preventing tampering in the CI/CD pipeline",
      b: "Securing the physical supply of server hardware",
      c: "Verifying API rate limits in third-party service dependencies",
      d: "Auditing npm packages for outdated versions",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is the difference between persistent volumes (PV) and persistent volume claims (PVC) in Kubernetes?",
    options: {
      a: "A PV is a cluster-level storage resource provisioned by an admin; a PVC is a user/application request for storage that binds to a suitable PV",
      b: "PVCs are for block storage; PVs are for object storage",
      c: "PVs are temporary; PVCs persist after Pod deletion",
      d: "They are identical concepts — PVC is just the newer name",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is the init container pattern in Kubernetes?",
    options: {
      a: "Specialised containers that run to completion before the main application container starts — used for initialisation tasks like running migrations, downloading config, or checking service availability",
      b: "The first container defined in a Pod spec",
      c: "A container that initialises Kubernetes cluster networking",
      d: "A sidecar container that starts alongside the main container",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is OPA (Open Policy Agent) and where is it used in DevOps?",
    options: {
      a: "A general-purpose policy engine that enforces fine-grained authorisation policies — used as a Kubernetes admission controller (via Gatekeeper) to enforce cluster security policies",
      b: "An open-source alternative to Prometheus for metrics",
      c: "A package manager for cloud-native tools",
      d: "An orchestration tool for multi-cloud deployments",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is the difference between declarative and imperative configuration in DevOps?",
    options: {
      a: "Declarative describes the desired end state (e.g. Kubernetes YAML, Terraform); imperative specifies step-by-step commands. Declarative is preferred for reproducibility and drift detection.",
      b: "Imperative is always faster; declarative is always safer",
      c: "Declarative is only for containers; imperative is for VMs",
      d: "They are identical — the terms are used interchangeably",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is Kustomize and how does it differ from Helm?",
    options: {
      a: "Kustomize uses overlay-based patching of plain YAML without templating; Helm uses Go templates with values files. Kustomize is built into kubectl; Helm has a release lifecycle with install/upgrade/rollback.",
      b: "Kustomize manages secrets; Helm manages deployments",
      c: "Helm is built into kubectl; Kustomize is a separate installation",
      d: "They are identical tools from different vendors",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is a network policy in Kubernetes?",
    options: {
      a: "A resource that controls which Pods can communicate with each other and with external endpoints, using label selectors to define ingress and egress rules",
      b: "A Kubernetes feature for assigning static IPs to Pods",
      c: "A configuration for the cluster's DNS resolver",
      d: "A firewall rule for the underlying cloud provider's VPC",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "devops",
    question_text: "What is progressive delivery and how does it extend CI/CD?",
    options: {
      a: "An approach that goes beyond CI/CD by gradually releasing features using canary releases, feature flags, and A/B tests — rolling back automatically based on real-time metrics and error rates",
      b: "A CI/CD pipeline that progressively adds steps over time",
      c: "A Kubernetes deployment strategy that updates one node at a time",
      d: "A Git workflow where features progress through branch tiers",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
];

// ─────────────────────────────────────────────────────────────
// DATA SCIENCE QUESTIONS
// ─────────────────────────────────────────────────────────────
const dataScienceQuestions: Question[] = [
  // ── Easy ──
  {
    role_category: "data-science",
    question_text: "What is a DataFrame in the context of data science (e.g. Pandas)?",
    options: {
      a: "A 2D labelled data structure with columns of potentially different types, similar to a spreadsheet",
      b: "A JavaScript framework for data visualisation",
      c: "A database connection object in Python",
      d: "A neural network layer",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What does ML stand for in data science?",
    options: {
      a: "Machine Learning",
      b: "Multi-Layer processing",
      c: "Mathematical Logic",
      d: "Model Library",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is supervised learning?",
    options: {
      a: "Training a model on labelled input-output pairs so it learns to predict outputs for unseen inputs",
      b: "Training a model on unlabelled data to find patterns",
      c: "A human expert manually labelling model predictions",
      d: "A type of neural network with supervised layers",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is the purpose of training and test sets in machine learning?",
    options: {
      a: "Training set is used to fit the model; test set is used to evaluate how well it generalises to unseen data",
      b: "Both sets are used for training; the test set is just a subset",
      c: "The test set is used to remove outliers before training",
      d: "Training set is for feature engineering; test set is for hyperparameter tuning",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is a feature in machine learning?",
    options: {
      a: "An individual measurable property or characteristic of the data used as input to a model",
      b: "A unique selling point of a machine learning library",
      c: "A model's prediction output",
      d: "A type of neural network activation",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What does EDA stand for in data science?",
    options: {
      a: "Exploratory Data Analysis",
      b: "Estimated Data Aggregation",
      c: "Extended Data Architecture",
      d: "Encoded Data Artefact",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is a null value in a dataset and why is it a problem?",
    options: {
      a: "A missing data point; it causes errors in calculations, biases analysis, and must be handled (imputed or removed)",
      b: "A value of zero in a numerical column",
      c: "A placeholder for text data that hasn't been entered",
      d: "An outlier that is more than 3 standard deviations from the mean",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is Python's NumPy library primarily used for?",
    options: {
      a: "Efficient numerical computing with multi-dimensional arrays and mathematical functions",
      b: "Data visualisation with charts and plots",
      c: "Natural Language Processing",
      d: "Building machine learning models with a high-level API",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is overfitting in machine learning?",
    options: {
      a: "When a model learns the training data too well (including noise) and performs poorly on unseen data",
      b: "When a model is trained with too many epochs",
      c: "When a model has too few parameters to learn the task",
      d: "When training data is not sufficiently normalised",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is a classification problem in machine learning?",
    options: {
      a: "Predicting which discrete category/class an input belongs to (e.g. spam or not spam)",
      b: "Predicting a continuous numerical value",
      c: "Grouping similar unlabelled data points together",
      d: "Ranking items by relevance",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is the mean of a dataset?",
    options: {
      a: "The arithmetic average: sum of all values divided by the count of values",
      b: "The middle value when data is sorted",
      c: "The most frequently occurring value",
      d: "The difference between the maximum and minimum values",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What does a correlation coefficient of -1 indicate?",
    options: {
      a: "A perfect negative linear relationship — as one variable increases, the other decreases proportionally",
      b: "No linear relationship between the variables",
      c: "A perfect positive linear relationship",
      d: "The variables are independent of each other",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is the purpose of feature scaling (normalisation/standardisation)?",
    options: {
      a: "Bringing features to a similar scale so distance-based and gradient-based algorithms are not dominated by large-magnitude features",
      b: "Reducing the number of features in a dataset",
      c: "Removing outliers from numerical columns",
      d: "Converting categorical features to numerical format",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is a regression problem in machine learning?",
    options: {
      a: "Predicting a continuous numerical output (e.g. house price, temperature)",
      b: "Predicting which class an input belongs to",
      c: "Grouping data into clusters without labels",
      d: "Reducing the dimensionality of data",
    },
    correct_answer: "a",
    difficulty: "easy",
  },
  {
    role_category: "data-science",
    question_text: "What is Jupyter Notebook used for in data science?",
    options: {
      a: "An interactive environment combining code, visualisations, and markdown documentation — ideal for data exploration and reproducible analysis",
      b: "A production deployment platform for machine learning models",
      c: "A relational database management system",
      d: "A version control system for datasets",
    },
    correct_answer: "a",
    difficulty: "easy",
  },

  // ── Medium ──
  {
    role_category: "data-science",
    question_text: "What is cross-validation and why is it used?",
    options: {
      a: "A technique that partitions data into multiple train/validation folds to get a more reliable estimate of model performance and reduce dependence on a single data split",
      b: "Validating that two models produce identical predictions",
      c: "A method for cross-checking data quality between sources",
      d: "Training the same model on multiple machines simultaneously",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is the bias-variance trade-off?",
    options: {
      a: "High bias (underfitting) means the model is too simple; high variance (overfitting) means too complex. The goal is to find a sweet spot minimising both types of error.",
      b: "The trade-off between model training speed and accuracy",
      c: "The balance between labelled and unlabelled training data",
      d: "The trade-off between precision and recall in classification",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is one-hot encoding and when is it used?",
    options: {
      a: "Converting categorical variables with N categories into N binary columns (0 or 1) — used when models require numerical input and there is no ordinal relationship between categories",
      b: "Encoding text data as byte sequences for NLP",
      c: "A technique for compressing image data",
      d: "Converting continuous values to discrete bins",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is precision and recall in classification models?",
    options: {
      a: "Precision = TP/(TP+FP) — of all positive predictions, how many are correct; Recall = TP/(TP+FN) — of all actual positives, how many were found",
      b: "Precision is overall accuracy; recall is the score on test data",
      c: "Recall measures speed; precision measures accuracy",
      d: "They are identical metrics for binary classification",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is gradient descent?",
    options: {
      a: "An optimisation algorithm that iteratively adjusts model parameters in the direction of steepest descent of the loss function to minimise loss",
      b: "A technique for visualising high-dimensional data",
      c: "A method for handling imbalanced datasets",
      d: "A regularisation technique to prevent overfitting",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is a confusion matrix?",
    options: {
      a: "A table showing TP, FP, TN, FN counts for a classification model, allowing calculation of precision, recall, accuracy, and F1 score",
      b: "A matrix of pairwise feature correlations",
      c: "A visualisation tool for high-dimensional feature spaces",
      d: "A table comparing multiple model performance scores",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is regularisation in machine learning?",
    options: {
      a: "Adding a penalty term to the loss function to discourage complex models and reduce overfitting (e.g. L1/Lasso, L2/Ridge)",
      b: "Normalising data to zero mean and unit variance",
      c: "Regularising the learning rate during training",
      d: "A data augmentation technique for image datasets",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is unsupervised learning?",
    options: {
      a: "Training a model on unlabelled data to discover hidden patterns, structure, or groupings (e.g. clustering, dimensionality reduction)",
      b: "Training a model without a GPU",
      c: "Training a model that does not require hyperparameter tuning",
      d: "A learning paradigm where the model supervises data collection",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is the ROC-AUC metric and what does an AUC of 0.5 indicate?",
    options: {
      a: "ROC-AUC measures a classifier's ability to distinguish classes at all thresholds; AUC of 0.5 indicates the model performs no better than random guessing",
      b: "ROC-AUC measures regression accuracy; 0.5 is a good score",
      c: "AUC of 0.5 means the model is 50% accurate",
      d: "AUC of 0.5 means perfect classification",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is PCA (Principal Component Analysis)?",
    options: {
      a: "A dimensionality reduction technique that projects data onto orthogonal axes (principal components) that capture the most variance",
      b: "A clustering algorithm for high-dimensional data",
      c: "A technique for handling missing values",
      d: "A statistical test for comparing model performance",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is data leakage in machine learning?",
    options: {
      a: "When information from the test set unintentionally leaks into the training process, giving falsely optimistic evaluation metrics",
      b: "When training data is accidentally deleted",
      c: "When a model exposes sensitive training data in its outputs",
      d: "When a model trains on too many features",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between bagging and boosting ensemble methods?",
    options: {
      a: "Bagging trains multiple models in parallel on random subsets and averages predictions (reduces variance); boosting trains models sequentially where each corrects the errors of the previous (reduces bias)",
      b: "Boosting is always more accurate; bagging is always faster",
      c: "Bagging uses decision trees; boosting uses neural networks",
      d: "They are identical approaches with different naming conventions",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is transfer learning?",
    options: {
      a: "Using a model pre-trained on a large dataset as a starting point for a related task, fine-tuning on domain-specific data — dramatically reducing training time and data requirements",
      b: "Transferring a model from one programming language to another",
      c: "Moving a trained model from a laptop to a cloud server",
      d: "Converting a regression model to a classification model",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between L1 and L2 regularisation?",
    options: {
      a: "L1 (Lasso) adds the absolute value of coefficients — can zero them out, performing feature selection; L2 (Ridge) adds squared coefficients — shrinks them but rarely to zero",
      b: "L2 performs feature selection; L1 only shrinks coefficients",
      c: "L1 is for neural networks; L2 is for linear models only",
      d: "They are identical — L2 just adds a scaling factor",
    },
    correct_answer: "a",
    difficulty: "medium",
  },
  {
    role_category: "data-science",
    question_text: "What is hyperparameter tuning?",
    options: {
      a: "The process of searching for optimal hyperparameter values (e.g. learning rate, tree depth) that are set before training and not learned from data",
      b: "Adjusting model weights during training via backpropagation",
      c: "Tuning the preprocessing pipeline for raw data",
      d: "Optimising database queries for ML feature retrieval",
    },
    correct_answer: "a",
    difficulty: "medium",
  },

  // ── Hard ──
  {
    role_category: "data-science",
    question_text: "What is the vanishing gradient problem in deep neural networks and how is it addressed?",
    options: {
      a: "Gradients become extremely small as they propagate backward through many layers, stalling training in early layers; addressed by ReLU activations, residual connections (ResNets), batch normalisation, and careful weight initialisation",
      b: "Gradients are lost due to floating-point precision errors; addressed by using float64",
      c: "Weights grow unboundedly during training; addressed by gradient clipping",
      d: "The learning rate becomes zero; addressed by learning rate warmup",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the transformer architecture and what attention mechanism drives it?",
    options: {
      a: "A neural network architecture built on self-attention, allowing every token to attend to all other tokens in the sequence — enabling parallelism (unlike RNNs) and capturing long-range dependencies",
      b: "A convolutional architecture that transforms images into text",
      c: "An architecture that transforms tabular data into feature embeddings",
      d: "A recursive network that transforms input sequences one token at a time",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between generative and discriminative models?",
    options: {
      a: "Generative models learn the joint distribution P(X,Y) and can generate new samples; discriminative models learn P(Y|X) — the decision boundary between classes — and are typically better for classification",
      b: "Generative models classify; discriminative models generate",
      c: "Discriminative models are unsupervised; generative are supervised",
      d: "They are identical — generative is just the statistical terminology",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is SHAP (SHapley Additive exPlanations) and why is it important?",
    options: {
      a: "A game-theory-based method that assigns each feature a contribution value to the model's prediction, providing consistent and locally accurate model explanations — critical for model interpretability and fairness audits",
      b: "A deep learning library for shape detection in images",
      c: "A hyperparameter optimisation framework based on Bayesian search",
      d: "A statistical test for comparing model performance across datasets",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between online learning and batch learning?",
    options: {
      a: "Online learning updates the model incrementally with each new data point or mini-batch, enabling adaptation to new patterns; batch learning trains on the full dataset and produces a static model",
      b: "Online learning uses the internet; batch learning uses local data",
      c: "Batch learning is always more accurate; online learning is always faster",
      d: "They are different names for the same learning paradigm",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the curse of dimensionality and how does it affect ML models?",
    options: {
      a: "As feature dimensions increase, the data becomes increasingly sparse in the high-dimensional space, making distance-based algorithms unreliable, increasing computation, and requiring exponentially more data",
      b: "Having too many target classes makes classification harder",
      c: "A model with too many parameters overfits the training data",
      d: "Data pipelines slow down when features exceed a certain threshold",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What are the key differences between BERT and GPT in terms of architecture and use case?",
    options: {
      a: "BERT is a bi-directional encoder (sees both left and right context) — suited for classification and NER; GPT is a uni-directional decoder — suited for text generation. Both are transformer-based.",
      b: "GPT is bi-directional; BERT is uni-directional",
      c: "BERT is for vision; GPT is for language",
      d: "They are identical architectures from different companies",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is Monte Carlo simulation and when is it used in data science?",
    options: {
      a: "Using random sampling to estimate complex numerical results — used for uncertainty quantification, option pricing, risk analysis, and approximating integrals that lack closed-form solutions",
      b: "A clustering algorithm for high-dimensional data",
      c: "A reinforcement learning algorithm for game environments",
      d: "A cross-validation technique using random stratified splits",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is feature importance in a random forest and how is it computed?",
    options: {
      a: "The average decrease in impurity (Gini/entropy) across all trees when splitting on that feature — features that reduce impurity more are considered more important",
      b: "The number of times a feature appears in the training data",
      c: "The correlation coefficient between the feature and the target variable",
      d: "The weight assigned to the feature in the final decision rule",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is model drift and how should it be monitored in production?",
    options: {
      a: "Degradation of model performance over time as real-world data distributions change from what was seen in training — monitored via continuous tracking of prediction distributions, feature statistics, and ground-truth comparison where labels are available",
      b: "Random weight fluctuations in a neural network during training",
      c: "The tendency for model accuracy to decrease with more training data",
      d: "Numerical instability in floating-point weight representations",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is an embedding in the context of machine learning and NLP?",
    options: {
      a: "A dense low-dimensional real-valued vector representation of discrete objects (words, categories, users) that captures semantic relationships and enables mathematical operations on them",
      b: "Inserting external data into a training dataset",
      c: "A technique for compressing model weights",
      d: "Encoding target labels as numerical values",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is causal inference and how does it differ from correlation analysis?",
    options: {
      a: "Causal inference determines whether X causes Y using techniques like randomised experiments or DAGs (directed acyclic graphs); correlation only identifies statistical association without establishing direction or mechanism",
      b: "Causal inference is a subset of correlation analysis for time series",
      c: "Correlation determines causation when the coefficient is above 0.9",
      d: "They are the same — 'causal' is just a more rigorous term for strong correlation",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the expectation-maximisation (EM) algorithm used for?",
    options: {
      a: "Finding maximum likelihood estimates for models with latent (hidden) variables by alternating between E-step (computing expected log-likelihood) and M-step (maximising it) — commonly used for Gaussian Mixture Models",
      b: "Computing expected value and maximum for outlier detection",
      c: "Optimising neural network weights using gradient descent",
      d: "A Bayesian inference algorithm for posterior estimation",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between MAP and MLE estimation?",
    options: {
      a: "MLE maximises the likelihood of the data given parameters; MAP is Bayesian and maximises the posterior by incorporating a prior. MAP reduces to MLE when the prior is uniform.",
      b: "MLE uses the test set; MAP uses the training set",
      c: "MAP is always better; MLE should only be used with infinite data",
      d: "They produce identical estimates for Gaussian distributions",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is a knowledge graph and how is it used in ML?",
    options: {
      a: "A structured representation of entities and their relationships as a graph (nodes = entities, edges = relations) — used for knowledge retrieval, graph neural networks, and enriching ML features with relational context",
      b: "A directed acyclic graph of ML pipeline dependencies",
      c: "A visualisation tool for showing model decision paths",
      d: "A database schema diagram for data warehouse design",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is federated learning?",
    options: {
      a: "A training approach where the model is trained across many decentralised devices/servers that hold local data, sharing only model updates (not raw data) — preserving data privacy",
      b: "Training a single large model on a centralised cluster of GPUs",
      c: "A technique for federating multiple trained models into one",
      d: "Distributing inference workloads across multiple servers",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between Type I and Type II errors in hypothesis testing?",
    options: {
      a: "Type I error (false positive) — rejecting a true null hypothesis; Type II error (false negative) — failing to reject a false null hypothesis. Reducing one typically increases the other.",
      b: "Type I is a random error; Type II is a systematic bias",
      c: "Type I errors occur in training; Type II in evaluation",
      d: "They are identical — named differently by different statistical schools",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What are graph neural networks (GNNs) and what types of problems do they solve?",
    options: {
      a: "Neural networks that operate on graph-structured data using message passing between nodes — used for social network analysis, molecular property prediction, recommendation systems, and fraud detection",
      b: "Neural networks that use graph plotting for visualisation",
      c: "A type of recurrent network for sequence modelling",
      d: "Neural networks with a graph-based hyperparameter search space",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the difference between parametric and non-parametric statistical tests?",
    options: {
      a: "Parametric tests assume a specific data distribution (e.g. normality) and use population parameters; non-parametric tests make no distributional assumptions and are used when those assumptions are violated or for ordinal data",
      b: "Non-parametric tests use more parameters; parametric use fewer",
      c: "Parametric tests work on ordinal data; non-parametric on continuous",
      d: "They are identical — the distinction is only historical",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
  {
    role_category: "data-science",
    question_text: "What is the purpose of an experiment tracking system (e.g. MLflow, W&B) in ML engineering?",
    options: {
      a: "Logging parameters, metrics, artefacts, and code versions for each training run to enable reproducibility, comparison between experiments, and model registry management",
      b: "Tracking the number of experiments run per month for billing",
      c: "Monitoring production model inference latency",
      d: "Managing data pipeline dependencies in a workflow orchestrator",
    },
    correct_answer: "a",
    difficulty: "hard",
  },
];

// ─────────────────────────────────────────────────────────────
// BEHAVIORAL QUESTIONS
// ─────────────────────────────────────────────────────────────

const behavioralQuestionsData: { question_text: string; category: string }[] = [
  // Teamwork
  { question_text: "Tell me about a time you had to work with a difficult team member. How did you handle it?", category: "teamwork" },
  { question_text: "Describe a situation where you had to collaborate with cross-functional teams to achieve a goal.", category: "teamwork" },
  { question_text: "Give an example of a time you helped a struggling teammate succeed.", category: "teamwork" },
  { question_text: "Tell me about a time you had a disagreement with a colleague. How did you resolve it?", category: "teamwork" },
  { question_text: "Describe a situation where you took the lead on a team project that was falling behind.", category: "teamwork" },
  { question_text: "Tell me about a time you received difficult feedback from a peer. How did you respond?", category: "teamwork" },

  // Leadership
  { question_text: "Describe a time you took initiative on a project without being asked.", category: "leadership" },
  { question_text: "Tell me about a time you mentored or onboarded a new team member.", category: "leadership" },
  { question_text: "Give an example of a time you made a difficult decision that was unpopular with the team.", category: "leadership" },
  { question_text: "Describe a situation where you had to motivate a team through a challenging period.", category: "leadership" },
  { question_text: "Tell me about a time you delegated tasks effectively to meet a tight deadline.", category: "leadership" },
  { question_text: "Give an example of how you handled a situation where a team member was underperforming.", category: "leadership" },

  // Conflict Resolution
  { question_text: "Tell me about a time you had to mediate a conflict between two colleagues.", category: "conflict-resolution" },
  { question_text: "Describe a situation where a project requirement changed unexpectedly. How did you adapt?", category: "conflict-resolution" },
  { question_text: "Give an example of a time you had to push back against a stakeholder's unrealistic request.", category: "conflict-resolution" },
  { question_text: "Tell me about a time you made a mistake at work. How did you handle it?", category: "conflict-resolution" },
  { question_text: "Describe a situation where you had to work under a tight deadline with limited resources.", category: "conflict-resolution" },
  { question_text: "Give an example of how you handled a situation where priorities shifted mid-project.", category: "conflict-resolution" },

  // Communication
  { question_text: "Describe a time you had to explain a complex technical concept to a non-technical audience.", category: "communication" },
  { question_text: "Tell me about a time your written communication skills made a difference in a project.", category: "communication" },
  { question_text: "Give an example of a time you had to deliver bad news to a client or manager.", category: "communication" },
  { question_text: "Describe a situation where you had to present your work to senior leadership.", category: "communication" },
  { question_text: "Tell me about a time you used data to persuade a team to adopt your approach.", category: "communication" },
  { question_text: "Give an example of how you ensured clear communication in a remote or distributed team.", category: "communication" },

  // Problem Solving
  { question_text: "Describe a complex technical problem you solved. Walk me through your approach.", category: "problem-solving" },
  { question_text: "Tell me about a time you identified a process inefficiency and improved it.", category: "problem-solving" },
  { question_text: "Give an example of a time you had to learn a new technology quickly to complete a task.", category: "problem-solving" },
  { question_text: "Describe a situation where your initial solution failed. How did you pivot?", category: "problem-solving" },
  { question_text: "Tell me about a time you automated a repetitive task to save time for the team.", category: "problem-solving" },
  { question_text: "Give an example of how you troubleshooted a production issue under pressure.", category: "problem-solving" },
];

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function main() {
  const allQuestions: Question[] = [
    ...backendQuestions,
    ...frontendQuestions,
    ...fullstackQuestions,
    ...devopsQuestions,
    ...dataScienceQuestions,
  ];

  console.log(`\n🌱  Starting quiz question seed...`);
  console.log(`   Total questions to seed: ${allQuestions.length}\n`);

  // Log breakdown
  const categories = [...new Set(allQuestions.map((q) => q.role_category))];
  for (const cat of categories) {
    const qs = allQuestions.filter((q) => q.role_category === cat);
    const easy = qs.filter((q) => q.difficulty === "easy").length;
    const medium = qs.filter((q) => q.difficulty === "medium").length;
    const hard = qs.filter((q) => q.difficulty === "hard").length;
    console.log(`   [${cat}] ${qs.length} total — easy: ${easy}, medium: ${medium}, hard: ${hard}`);
  }

  console.log(`\n📝  Inserting into database...`);

  // Use createMany to insert all questions in a single batch
  const result = await prisma.quizQuestions.createMany({
    data: allQuestions,
  });

  console.log(`\n✅  Done! Inserted ${result.count} quiz questions successfully.\n`);

  // ─── Seed behavioral questions ────────────────────────────
  console.log(`🌱  Starting behavioral question seed...`);
  console.log(`   Total questions to seed: ${behavioralQuestionsData.length}\n`);

  const bCategories = [...new Set(behavioralQuestionsData.map((q) => q.category))];
  for (const cat of bCategories) {
    const count = behavioralQuestionsData.filter((q) => q.category === cat).length;
    console.log(`   [${cat}] ${count} questions`);
  }

  console.log(`\n📝  Inserting into database...`);

  const bResult = await prisma.behavioralQuestions.createMany({
    data: behavioralQuestionsData,
  });

  console.log(`\n✅  Done! Inserted ${bResult.count} behavioral questions successfully.\n`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
