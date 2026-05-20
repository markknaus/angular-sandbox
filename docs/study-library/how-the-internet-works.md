# How the Internet Works
### A Developer's Guide

> From cables and packets to DNS, HTTP, browsers, CDNs, API gateways, scalability, and cloud platforms

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [What the Internet Actually Is](#what-the-internet-actually-is)
  - [A Brief History — From ARPANET to the Web](#a-brief-history--from-arpanet-to-the-web)
  - [The Physical Reality — Cables, Data Centres, and Last-Mile Connections](#the-physical-reality--cables-data-centres-and-last-mile-connections)
  - [How Computers Find Each Other — IP Addresses](#how-computers-find-each-other--ip-addresses)
- [Domain Names and DNS](#domain-names-and-dns)
  - [What DNS Actually Is](#what-dns-actually-is)
  - [The DNS Lookup — Step by Step](#the-dns-lookup--step-by-step)
  - [DNS Record Types](#dns-record-types)
  - [Domain Registration and Subdomains](#domain-registration-and-subdomains)
- [How Data Travels — Packets, Routing, and Protocols](#how-data-travels--packets-routing-and-protocols)
  - [Packet Switching — Breaking Data into Pieces](#packet-switching--breaking-data-into-pieces)
  - [Routers — The Internet's Traffic Directors](#routers--the-internets-traffic-directors)
  - [TCP and UDP — Reliability vs Speed](#tcp-and-udp--reliability-vs-speed)
  - [The Protocol Stack — Layers of Abstraction](#the-protocol-stack--layers-of-abstraction)
- [HTTP and HTTPS](#http-and-https)
  - [The HTTP Request-Response Cycle](#the-http-request-response-cycle)
  - [HTTP Methods and Idempotency](#http-methods-and-idempotency)
  - [HTTP Status Codes](#http-status-codes)
  - [HTTP Versions](#http-versions)
  - [HTTPS — Encryption and Trust](#https--encryption-and-trust)
- [What Happens When You Load a Web Page](#what-happens-when-you-load-a-web-page)
  - [How Caching Speeds This Up](#how-caching-speeds-this-up)
- [Browsers and Rendering](#browsers-and-rendering)
  - [The Document Object Model (DOM)](#the-document-object-model-dom)
  - [The Main Thread — Why JavaScript Blocking Matters](#the-main-thread--why-javascript-blocking-matters)
  - [What Actually Happens in Angular's Rendering](#what-actually-happens-in-angulars-rendering)
- [Servers, Hosting, and CDNs](#servers-hosting-and-cdns)
  - [What a Web Server Does](#what-a-web-server-does)
  - [Content Delivery Networks (CDNs)](#content-delivery-networks-cdns)
  - [Static Hosting Platforms for Angular](#static-hosting-platforms-for-angular)
- [API Gateways](#api-gateways)
  - [What an API Gateway Does](#what-an-api-gateway-does)
  - [API Gateway vs Load Balancer](#api-gateway-vs-load-balancer)
  - [Major API Gateway Solutions](#major-api-gateway-solutions)
  - [What This Means for Your Angular Application](#what-this-means-for-your-angular-application)
- [Application Scalability](#application-scalability)
  - [Vertical vs Horizontal Scaling](#vertical-vs-horizontal-scaling)
  - [Stateless Architecture — The Foundation of Horizontal Scaling](#stateless-architecture--the-foundation-of-horizontal-scaling)
  - [Caching Strategies](#caching-strategies)
  - [Database Scalability](#database-scalability)
  - [Scalability Vocabulary for Interviews](#scalability-vocabulary-for-interviews)
- [Cloud Platforms — IaaS, PaaS, SaaS, and the Big Three](#cloud-platforms--iaas-paas-saas-and-the-big-three)
  - [The Three Layers of Cloud Services](#the-three-layers-of-cloud-services)
  - [AWS — Amazon Web Services](#aws--amazon-web-services)
  - [Azure — Microsoft Azure](#azure--microsoft-azure)
  - [GCP — Google Cloud Platform](#gcp--google-cloud-platform)
  - [Comparing the Three](#comparing-the-three)
  - [Regions, Availability Zones, and Why They Matter](#regions-availability-zones-and-why-they-matter)


## Introduction

This guide explains how the internet works — from the physical cables under the ocean to the cloud platforms that host your applications. It is written for developers: people who build things that run on the internet but who may not have a clear picture of what actually happens at each layer between their code and the user's screen.

The goal is not to make you a network engineer. It is to give you the mental model that experienced developers carry in their heads — the understanding that lets you diagnose performance problems, explain to non-technical stakeholders where a system lives and how it works, and have informed conversations with DevOps and infrastructure teams.

---

## What the Internet Actually Is

Most people who work with the internet every day have a surprisingly vague mental picture of what it actually is. "The cloud", "cyberspace", "online" — these are metaphors that obscure a very physical reality. The internet is, at its core, an enormous collection of computers connected to each other by wires.

That is not a simplification. It is the literal truth. Under oceans and across continents there are physical cables — copper wire for short distances, fibre-optic cables for long ones — carrying data as electrical signals or pulses of light. Your home router connects via a cable (or wirelessly to a device that connects via cable) to your Internet Service Provider. Your ISP connects to a regional network. Regional networks connect to global backbone providers — companies like Level 3, AT&T, and Tata Communications who own and operate the major international cables. Those cables connect data centres on different continents. The whole thing is just computers talking to computers through wires.

### A Brief History — From ARPANET to the Web

The internet began as a United States military research project in the late 1960s called ARPANET (Advanced Research Projects Agency Network). The core problem it solved was resilience: if a nuclear attack destroyed part of a communication network, could the remaining nodes automatically find alternative paths to keep communicating? The answer was packet switching — breaking messages into small chunks, sending each chunk independently, and reassembling them at the destination.

Through the 1970s and 1980s, universities and research institutions connected to this growing network. In 1983, the network adopted TCP/IP — the communication protocol that still underlies the internet today. This is the moment most historians consider the true birth of the internet as we know it, because TCP/IP created a common language that any computer, regardless of manufacturer or operating system, could use to communicate with any other.

**The internet and the World Wide Web are different things.** The internet is the global network of connected computers — the infrastructure. The World Wide Web is an application that runs on top of that infrastructure. Tim Berners-Lee invented the Web in 1989 while working at CERN in Switzerland. He proposed a system of hyperlinked documents — pages that could link to other pages — accessible via the internet. He invented HTML (the language for writing web pages), HTTP (the protocol for requesting and sending them), and URLs (the addresses for finding them). The first website went live in August 1991.

Email, file transfer (FTP), online gaming, video calls, and streaming music are all internet applications that are not the Web. They run on the same underlying network infrastructure but use different protocols than HTTP. The Web — the thing you access through a browser — is one application among many that runs over the internet.

> 📝 When you build an Angular application, you are building a Web application — it runs in a browser over HTTP. When you call a REST API, that is also the Web. But the email notifications your app sends use internet protocols that are not part of the Web. Understanding this distinction helps you reason about what layer a technology operates at.

### The Physical Reality — Cables, Data Centres, and Last-Mile Connections

Data crosses the Atlantic through undersea fibre-optic cables about the diameter of a garden hose, carrying hundreds of terabits of data per second as pulses of light. There are over 400 of these submarine cables in service worldwide, and they carry approximately 99% of international internet traffic.

Data centres are the buildings that house the servers the internet runs on. A typical hyperscale data centre — the kind operated by AWS, Google, or Microsoft — contains hundreds of thousands of servers in rows of racks, consuming as much power as a small city. They are built near sources of cheap electricity and cooling.

The "last mile" is the connection between a major network and an individual home or office. Connection types include: fibre-to-the-home (the fastest), coaxial cable (cable TV infrastructure repurposed for internet), DSL (over telephone lines, slower), and cellular (4G/5G wireless). The last mile is historically the most expensive and slowest to upgrade, because it requires physically connecting millions of individual locations.

### How Computers Find Each Other — IP Addresses

Every device connected to the internet has an IP address — a unique numerical identifier that functions like a postal address. Without an address, there is no way to direct data to the right destination.

**IPv4** addresses look like four numbers separated by dots: `192.168.1.1` or `74.125.24.106`. Each number is between 0 and 255, giving about 4.3 billion possible addresses. The internet has been running out of IPv4 addresses since the mid-2000s and has managed the shortage primarily through NAT.

**IPv6** addresses look like eight groups of four hexadecimal digits: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`. IPv6 provides 340 undecillion addresses — enough to give a unique address to every atom on the surface of the Earth and still have addresses left over. Most modern devices support both versions.

**NAT (Network Address Translation):** This is the reason your home network works despite having only one public IP address. Your router assigns private IP addresses (typically in the `192.168.x.x` range) to each device in your home. When a device makes a request, the router translates the private address to the public one, keeps track of which device made which request, and routes the response back to the right device.

---

## Domain Names and DNS

IP addresses are how computers find each other, but they are not how humans find websites. Nobody memorises `172.217.14.206` to visit Google. Domain names — `google.com`, `angular.dev`, `github.com` — are human-readable aliases that map to IP addresses. The system that performs this translation is the Domain Name System, or DNS.

### What DNS Actually Is

DNS is often called "the phone book of the internet", though a better analogy might be a massively distributed, automatically updated, globally replicated directory. When you type `angular.dev` into your browser, before any web content can be fetched, your computer needs to know the IP address of the server that hosts `angular.dev`. It asks DNS. DNS looks up the answer and returns the IP address.

The DNS system is hierarchical and distributed — no single server has the complete directory of all domain names. Instead, DNS is organised into a tree of authority. At the top is the root, managed by thirteen sets of root name servers distributed around the world. Below that are top-level domain (TLD) servers — one set for `.com`, one for `.org`, one for `.dev`, and so on. Below that are the authoritative name servers for each specific domain.

### The DNS Lookup — Step by Step

When you type `angular.dev` and press Enter, here is the exact sequence before any web page loads:

**Step 1 — Check the local cache:** Your computer checks its own DNS cache. If you visited `angular.dev` recently, the result is probably cached and the lookup is instant.

**Step 2 — Ask the recursive resolver:** If the cache is empty, your computer sends the query to a recursive resolver — typically a server run by your ISP, or a public resolver like Google (`8.8.8.8`) or Cloudflare (`1.1.1.1`). The recursive resolver is the workhorse — it doesn't have all the answers, but it knows how to find them and caches results for future queries.

**Step 3 — Query the root name servers:** The recursive resolver asks a root name server: "Where can I find information about `.dev` domains?" The root server responds with the address of the `.dev` TLD name servers.

**Step 4 — Query the TLD name server:** The recursive resolver asks the `.dev` TLD server: "Where can I find `angular.dev`?" The TLD server responds with the address of `angular.dev`'s authoritative name servers.

**Step 5 — Query the authoritative name server:** The recursive resolver asks `angular.dev`'s authoritative name server for the actual IP address. The response also includes a TTL (Time to Live) — a number of seconds telling the resolver how long to cache this answer.

**Step 6 — Return and cache:** The recursive resolver sends the IP address back to your computer. This entire process typically takes 20–120 milliseconds. Subsequent visits within the TTL window are near-instant because the answer is cached.

> 📝 This is why DNS changes take time to propagate. When you update a domain's DNS records — moving your server to a new IP address — every cached copy of the old record must expire before clients see the new one. If the TTL was set to 86400 seconds (one day), some users may see the old IP address for up to 24 hours. Before major DNS changes, experienced operators reduce the TTL to 300 seconds (5 minutes) in advance, wait for caches to expire, make the change, then restore the TTL.

### DNS Record Types

| Record | Purpose |
|---|---|
| **A** | Maps a domain name to an IPv4 address. `angular.dev → 34.117.119.97` |
| **AAAA** | Maps a domain name to an IPv6 address |
| **CNAME** | Alias from one domain name to another. Cannot be used on the root domain, only subdomains |
| **MX** | Specifies which mail servers handle email for the domain |
| **TXT** | Arbitrary text — used for email authentication (SPF, DKIM, DMARC) and domain ownership verification |
| **NS** | Specifies which DNS servers are authoritative for the domain |
| **SOA** | Administrative information about the zone, including the primary name server |

### Domain Registration and Subdomains

Domain names are not purchased — they are leased, typically annually, through a domain registrar (GoDaddy, Namecheap, Cloudflare Registrar). The registrar records your ownership with ICANN, the non-profit organisation that coordinates the internet's naming system.

Subdomains are free and unlimited — you control them through your DNS settings. `app.example.com`, `api.example.com`, `staging.example.com`, and `cdn.example.com` are all subdomains of `example.com` that you can create and configure however you like. This is how large organisations structure their web presence: `www.` for marketing, `app.` for the application, `api.` for the backend, `docs.` for documentation.

---

## How Data Travels — Packets, Routing, and Protocols

### Packet Switching — Breaking Data into Pieces

When you send any data over the internet — an HTTP request, an email, a video stream — that data is broken into small chunks called packets. A packet is typically 1,500 bytes or less. A single web page request might involve dozens of packets. Streaming a video involves millions.

Each packet contains the data payload, the source and destination IP addresses, a sequence number (its position in the overall message), and error-checking data. Packets are sent independently across the network and may travel completely different routes, then are reassembled in order at the destination.

This resilience is why packet switching replaced circuit switching (which reserves a dedicated path for the duration of a conversation). Packet switching shares network capacity dynamically — if one path is congested, packets route around it.

### Routers — The Internet's Traffic Directors

Packets travel by passing through a series of routers — specialised computers whose entire job is deciding where to forward incoming packets. When a packet arrives at a router, the router reads the destination IP address, consults its routing table, and forwards the packet to the next router along the best available path. A transcontinental journey might involve 15–25 hops, each taking 1–5 milliseconds.

**Key performance concepts:**

- **Latency** — delay, measured in milliseconds. Determined by physical distance and hop count. Critical for interactive applications: gaming, video calls, real-time data.
- **Bandwidth** — capacity, measured in Mbps or Gbps. Critical for bulk transfers: video streaming, large downloads.
- **Throughput** — actual data transferred — bandwidth minus overhead, congestion, and loss.
- **Jitter** — variation in latency. Particularly damaging for video calls and voice, which expect a steady stream.

### TCP and UDP — Reliability vs Speed

**TCP (Transmission Control Protocol)** provides reliable, ordered, error-checked delivery. The receiving computer sends acknowledgements confirming receipt of each packet. If the sender doesn't receive an acknowledgement, it retransmits. TCP also requires a three-way handshake to establish a connection — one full roundtrip of overhead before any data flows. HTTP/1.1 and HTTP/2 run over TCP.

**UDP (User Datagram Protocol)** sends packets without waiting for acknowledgements. No handshake, no retransmission, no ordering guarantees. Much faster for applications that can tolerate occasional loss — DNS queries, video streaming, online gaming, and WebRTC (video calls). HTTP/3 runs over QUIC, which is built on UDP.

The trade-off: TCP is reliable but adds latency. UDP is fast but unreliable. The correct choice depends on whether your application needs every byte delivered in order (HTTP calls, file downloads) or just needs low latency with acceptable loss (video, gaming, DNS).

### The Protocol Stack — Layers of Abstraction

The internet is built in layers, each hiding the complexity of the one below it:

| Layer | Examples | What it handles |
|---|---|---|
| Application | HTTP, WebSocket, DNS, SMTP | The protocol your application uses |
| Transport | TCP, UDP | Reliability, ordering, ports |
| Internet | IP | Addressing and routing between networks |
| Link | Ethernet, Wi-Fi | Physical transmission between adjacent devices |

When you make an HTTP request from Angular, your browser creates an HTTP message (application layer), wraps it in TCP segments (transport), wraps those in IP packets (internet), and transmits them as electrical signals or radio waves (link). The receiving server unwraps in reverse order.

---

## HTTP and HTTPS

### The HTTP Request-Response Cycle

HTTP is the application-level protocol that web browsers and servers use to communicate. It is a request-response protocol: the client sends a request, the server sends a response. Every HTTP interaction follows this pattern.

**An HTTP request contains:**
- A method (GET, POST, PUT, PATCH, DELETE, etc.)
- A URL (`/api/users/123`)
- Headers (metadata: `Content-Type`, `Authorization`, `Accept`, `Cookie`)
- Optionally a body (for POST, PUT, PATCH)

**An HTTP response contains:**
- A status code (200, 404, 500, etc.)
- Headers (`Content-Type`, `Cache-Control`, `Set-Cookie`, CORS headers)
- Optionally a body (usually JSON for APIs, HTML for pages)

### HTTP Methods and Idempotency

Understanding which HTTP methods are safe and idempotent is important for API design, retry logic, and interview discussions.

An operation is **idempotent** if performing it multiple times produces the same result as performing it once. This matters because networks are unreliable — clients may need to retry requests when they don't receive a response.

| Method | Idempotent | Safe | Typical use |
|---|---|---|---|
| GET | Yes | Yes | Read a resource — always safe to retry |
| HEAD | Yes | Yes | Same as GET but no body |
| PUT | Yes | No | Replace a resource entirely — same result each time |
| DELETE | Yes | No | Delete a resource — deleting twice is same as deleting once |
| PATCH | Usually not | No | Partial update — depends on implementation |
| POST | No | No | Create a resource — creates a new resource each time |
| OPTIONS | Yes | Yes | Metadata query (used in CORS preflight) |

**Why idempotency matters:** When a client sends a POST request and the network drops the response, the client doesn't know whether the server processed it. If the operation creates a payment or an order, retrying blindly could charge the card twice or create duplicate orders. The solution is an **idempotency key** — the client generates a UUID for each distinct operation and includes it as a request header. The server stores the result keyed by this ID and returns the stored result on retry.

```
POST /api/orders
Idempotency-Key: 7f9c8b2a-1234-5678-abcd-ef0123456789
Content-Type: application/json

{ "userId": "123", "items": [...], "total": 99.99 }
```

GET, PUT, and DELETE are idempotent by design — your Angular retry interceptor can safely retry these without risk of duplicates. For POST, implement idempotency keys or design your retry logic to exclude POST requests.

### HTTP Status Codes

Status codes are grouped by their first digit:

**2xx — Success**
- `200 OK` — request succeeded, response body contains the result
- `201 Created` — resource created successfully; `Location` header points to the new resource
- `204 No Content` — success with no response body (common for DELETE and some PUT operations)

**3xx — Redirection**
- `301 Moved Permanently` — the resource has permanently moved; clients should update bookmarks
- `302 Found` — temporary redirect; clients should continue using the original URL
- `304 Not Modified` — cached response is still valid; no need to retransmit the body

**4xx — Client Error**
- `400 Bad Request` — malformed request, invalid parameters
- `401 Unauthorized` — not authenticated; include credentials
- `403 Forbidden` — authenticated but not authorised to access this resource
- `404 Not Found` — resource does not exist at this URL
- `409 Conflict` — request conflicts with current server state (duplicate unique key, version conflict)
- `422 Unprocessable Entity` — request is well-formed but semantically invalid (validation failure)
- `429 Too Many Requests` — rate limit exceeded; response usually includes `Retry-After` header

**5xx — Server Error**
- `500 Internal Server Error` — unhandled server-side exception
- `502 Bad Gateway` — gateway received invalid response from upstream server
- `503 Service Unavailable` — server temporarily unable to handle requests (overload, maintenance)
- `504 Gateway Timeout` — gateway timed out waiting for upstream response

### HTTP Versions

**HTTP/1.1** (1997, still widely used): One request per TCP connection at a time. Browsers work around this by opening multiple parallel connections (typically 6) per origin. This is why bundling, sprite sheets, and domain sharding were needed historically.

**HTTP/2** (2015, now dominant): Multiple requests multiplexed over a single TCP connection. Binary framing rather than text. Header compression (HPACK). Server push (server can push resources the client is likely to need). Eliminates the need for most HTTP/1.1 optimisation tricks.

**HTTP/3** (2022, growing adoption): Runs over QUIC (UDP-based) instead of TCP. Eliminates head-of-line blocking — a single lost packet in HTTP/2 blocks all streams, because TCP delivers in order. QUIC handles lost packets per-stream. Result: better performance on unreliable connections (mobile, high-latency links).

### HTTPS — Encryption and Trust

HTTPS is HTTP with TLS (Transport Layer Security) encryption. Without HTTPS, anyone who can intercept traffic between client and server can read the content — passwords, session tokens, personal data. On public Wi-Fi, this is trivially easy.

**How TLS works (simplified):**

1. Client connects to server and says "I want to use TLS, here are the cipher suites I support."
2. Server responds with its SSL certificate — a document containing the server's public key, signed by a Certificate Authority (CA).
3. Client verifies the certificate — checks the CA's signature, checks the domain name matches, checks the expiry date.
4. Client and server use the public key to negotiate a shared symmetric session key (via ECDHE or similar).
5. All subsequent communication is encrypted with this session key. Even if an attacker captures every packet, they cannot decrypt the content without the session key.

Certificate Authorities (CAs) — DigiCert, Let's Encrypt, Sectigo — are trusted organisations whose root certificates are pre-installed in browsers and operating systems. Their job is to verify that the person requesting a certificate for `example.com` actually controls that domain.

**Let's Encrypt** made HTTPS nearly universal by offering free, automatically renewable certificates. Most modern hosting platforms (Netlify, Vercel, Azure Static Web Apps, Firebase Hosting) provision and renew TLS certificates automatically.

**HSTS (HTTP Strict Transport Security):** A response header that tells browsers to always use HTTPS for this domain — even if the user types `http://` — for a specified duration. Prevents downgrade attacks.

---

## What Happens When You Load a Web Page

Understanding this sequence end-to-end is genuinely useful for diagnosing performance issues and is a common interview question:

1. **You press Enter on `https://app.example.com/dashboard`**
2. **Browser checks its cache** — is there a cached response for this URL that is still valid? If so, uses it.
3. **DNS lookup** — browser checks local cache, then asks the OS resolver, then the recursive resolver. Returns the IP address of `app.example.com`.
4. **TCP connection** — browser initiates a TCP three-way handshake with the server's IP address on port 443.
5. **TLS handshake** — browser and server negotiate encryption. One additional roundtrip (or zero with TLS 1.3 session resumption).
6. **HTTP request** — browser sends `GET /dashboard HTTP/2` with headers including `Accept`, `Accept-Encoding`, and the session cookie.
7. **Server processes the request** — the server (or CDN edge node) generates the response. For an Angular SPA, this is typically returning the pre-built `index.html`.
8. **HTTP response** — server sends `200 OK` with the HTML file. Browser begins receiving it.
9. **HTML parsing** — browser parses HTML and begins constructing the DOM. When it encounters `<link>` tags, it fetches CSS. When it encounters `<script>` tags, it fetches JavaScript (unless `defer` or `async`).
10. **CSS parsing** — browser parses CSS and constructs the CSSOM (CSS Object Model).
11. **Render tree construction** — browser combines DOM and CSSOM to create the render tree (the visual elements that actually appear).
12. **Layout** — browser computes the size and position of each render tree element.
13. **Paint** — browser paints pixels to the screen for each element.
14. **Composite** — browser composites painted layers into the final image visible to the user.
15. **JavaScript execution** — for Angular: the bootstrapped application module runs, Angular initialises, components render, HTTP calls are made to fetch data.
16. **Data fetched, components updated** — the application re-renders with real data.

**Why this matters for Angular performance:** Steps 3–5 happen before any bytes of your application are delivered. Steps 9–14 happen before Angular runs. This is why Core Web Vitals like LCP (Largest Contentful Paint) and FCP (First Contentful Paint) are measured the way they are, and why CDN placement, HTTP/2, and resource hints (`<link rel="preload">`) have such high leverage.

### How Caching Speeds This Up

**Browser cache:** HTTP response headers control what the browser caches and for how long. `Cache-Control: max-age=31536000, immutable` tells the browser to cache this resource for one year and never revalidate. Angular's build system adds content hashes to bundle filenames (e.g., `main.a3f8bc7.js`) — when the file changes, the filename changes, so old cached versions are never served stale.

**`ETag` and `Last-Modified`:** For resources that may change, the server sends an `ETag` (a hash of the content) or `Last-Modified` header. On subsequent requests, the browser sends `If-None-Match` or `If-Modified-Since`. If the content hasn't changed, the server responds `304 Not Modified` with no body — saving bandwidth.

**Service Workers:** A service worker is a JavaScript file that runs in a background thread and intercepts network requests. Angular's `@angular/pwa` package configures a service worker that caches application resources — making the app available offline and dramatically faster on repeat visits.

---

## Browsers and Rendering

### The Document Object Model (DOM)

The DOM is the browser's in-memory representation of an HTML document as a tree of objects. Each HTML element becomes a node in the tree. JavaScript can read and modify the DOM — adding elements, changing attributes, updating text — and the browser updates what the user sees.

The DOM is not HTML. HTML is text. The DOM is the live object tree the browser creates from that text. This distinction matters because: Angular does not manipulate HTML; it manipulates the DOM through its renderer. When Angular sets a property like `[value]="user.name"`, it is calling DOM APIs, not rewriting HTML strings.

**DOM performance:** DOM operations are expensive relative to pure JavaScript computation. Accessing a DOM property forces the browser to calculate layout (if the property is layout-dependent). Modifying the DOM may trigger reflow — recalculation of positions and sizes — which is one of the most expensive operations in the rendering pipeline. Angular's change detection system, virtual DOM diffing in React, and strategies like OnPush all exist to minimise unnecessary DOM manipulation.

### The Main Thread — Why JavaScript Blocking Matters

The browser's main thread handles: parsing HTML, executing JavaScript, running CSS style calculations, performing layout, and painting. It can only do one of these things at a time. If JavaScript is executing, nothing else can happen — the browser cannot respond to user input, cannot update animations, cannot paint.

This is why long-running JavaScript tasks cause the browser to "freeze". Any JavaScript task that takes more than 50ms (the threshold used by Google's Lighthouse tool) is considered a "long task" and is likely to cause jank — visible stuttering or unresponsiveness.

For Angular developers, the practical implications are:

- Never do heavy computation synchronously in a component or service — use Web Workers for CPU-intensive work
- `zone.js` runs Angular change detection on the main thread — `runOutsideAngular()` moves work off the detection cycle for animation loops and high-frequency events
- Signals and zoneless Angular reduce unnecessary change detection cycles, keeping the main thread free for rendering

### What Actually Happens in Angular's Rendering

When your Angular application loads:

1. The browser downloads and parses `index.html`
2. `index.html` includes `<script>` tags for Angular's JavaScript bundles
3. The browser downloads and executes the bundles
4. Angular's bootstrap sequence runs: `bootstrapApplication(AppComponent, appConfig)` executes
5. Angular initialises the dependency injection system, configures providers (router, HTTP client, etc.)
6. Angular creates the root component (`AppComponent`), renders its template, and mounts it into the `<app-root>` element
7. The router reads the current URL, activates the matching route, renders the routed component
8. Change detection runs, binding template expressions to the DOM
9. Any HTTP calls in `ngOnInit` or constructors execute; when responses arrive, change detection runs again and the DOM is updated

Zone.js wraps all browser async APIs (setTimeout, Promises, fetch, event listeners). When any async callback completes, Zone.js notifies Angular to run change detection. Signals and zoneless Angular replace this mechanism with fine-grained reactive tracking — only the specific DOM nodes that read a changed signal are updated.

---

## Servers, Hosting, and CDNs

### What a Web Server Does

A web server is software (running on a physical or virtual machine) that listens for HTTP requests and sends back HTTP responses. For an Angular application, the web server's primary job is simple: serve the built files. After `ng build`, you have a `dist/` folder containing `index.html`, JavaScript bundles, CSS files, and assets. A web server serves these as static files.

**Static file serving (the Angular deployment pattern):** Nginx, Apache, and cloud storage services (S3, Azure Blob Storage, Google Cloud Storage) all serve static files efficiently. The key configuration for an Angular SPA is to serve `index.html` for any URL that does not match a file — because Angular handles routing client-side, the server must not return 404 for `/dashboard` or `/users/123`.

```nginx
# Nginx configuration for Angular SPA
location / {
  try_files $uri $uri/ /index.html;
}
```

**Dynamic server-side rendering (SSR):** When Angular Universal or Angular's built-in SSR is used, a Node.js server renders the application on the server for each request, sending pre-rendered HTML. This improves initial load time and SEO. The server then "hydrates" the client-side Angular app, taking over interactivity.

### Content Delivery Networks (CDNs)

A CDN is a globally distributed network of servers that cache your content at locations close to users. Instead of every request going to your origin server (perhaps in a single US data centre), requests are served from the nearest CDN edge node — reducing latency dramatically.

For an Angular application, a CDN provides:

- **Faster initial load** — bundle files served from 20ms away instead of 200ms
- **Reduced origin load** — CDN serves cached files; your origin server only handles API calls
- **Automatic compression** — CDNs typically gzip or brotli-compress assets automatically
- **HTTP/2 or HTTP/3** — CDN edge nodes support modern protocols even if your origin doesn't
- **DDoS mitigation** — CDN absorbs traffic spikes

The major CDNs used in conjunction with Angular hosting: **CloudFront** (AWS), **Azure CDN**, **Cloudflare** (provider-agnostic, widely used for its free tier and performance), **Fastly**.

**CDN cache invalidation:** When you deploy a new version of your Angular app, you need the CDN to serve new files. Content-hashed filenames solve this automatically — `main.a3f8bc7.js` and `main.d4e9ca2.js` are different URLs, so old cache entries are never served for new files. Only `index.html` needs explicit cache invalidation on each deploy (it references the new hashed filenames).

### Static Hosting Platforms for Angular

| Platform | Notes |
|---|---|
| **AWS S3 + CloudFront** | S3 stores files, CloudFront is the CDN. Industry standard. Highly configurable, pay-per-use. |
| **Azure Static Web Apps** | Managed hosting with GitHub Actions integration, global CDN, automatic HTTPS, generous free tier. Natural choice for Azure environments. |
| **Firebase Hosting** | Google's static hosting. Fast global CDN, automatic HTTPS, custom domains, one-command deploy. Popular for Angular — built partly with Angular developers in mind. |
| **Netlify** | Developer-friendly. Automatic deploys from GitHub, preview URLs per branch, serverless functions, form handling. |
| **Vercel** | Originally built for Next.js but excellent for Angular SPAs. Fastest global CDN in independent benchmarks. |
| **GitHub Pages** | Free, simple. Limited to public repositories on the free tier. No built-in serverless functions. Adequate for personal projects and documentation. |

---

## API Gateways

An API Gateway is a server that acts as the single entry point for all client requests to your backend services. Instead of clients talking directly to multiple microservices, they talk to the gateway, which routes, transforms, and manages the requests.

Think of it as a receptionist in a large building — every visitor (request) goes through the receptionist (gateway), who directs them to the right department (service), checks their credentials, and logs their visit.

### What an API Gateway Does

**Routing:** Routes incoming requests to the appropriate backend service based on URL path, HTTP method, or request headers. `/api/users` goes to the User Service, `/api/orders` goes to the Order Service.

**Authentication and authorisation:** Validates JWT tokens, API keys, or OAuth credentials before requests reach your services. This centralises security so individual services do not all need to implement authentication.

**Rate limiting:** Throttles requests per client (by IP address or API key) to prevent abuse and ensure fair usage. Returns `429 Too Many Requests` when limits are exceeded.

**SSL termination:** Handles HTTPS at the gateway level. Backend services can communicate over plain HTTP within a private network, while external traffic is always encrypted.

**Load balancing:** Distributes requests across multiple instances of the same service.

**Request/response transformation:** Translates between formats, adds headers, strips internal implementation details from responses.

**Logging and monitoring:** Centralised request logging, metrics collection, and distributed tracing across all services.

**Caching:** Caches responses from backend services to reduce load.

### API Gateway vs Load Balancer

These are related but distinct:

| | API Gateway | Load Balancer |
|---|---|---|
| **Primary purpose** | Application-level request management | Network-level traffic distribution |
| **Operates at** | Application layer (L7) | Transport or application layer (L4/L7) |
| **Understands HTTP** | Yes — routes by path, method, headers | L7 load balancers do; L4 only by IP/port |
| **Authentication** | Yes | No |
| **Rate limiting** | Yes | No |
| **Request transformation** | Yes | No |
| **Typical position** | Edge — first thing clients hit | Between gateway and services |

In a typical architecture: `client → API Gateway → Load Balancer → Service instances`.

### Major API Gateway Solutions

**AWS API Gateway** — the dominant managed gateway for AWS-hosted applications. Integrates natively with Lambda, EC2, and ECS. Two flavours: HTTP API (lightweight, cheaper) and REST API (full features). Pay per request.

**Kong** — open-source, self-hosted or managed. Plugin-based architecture — authentication, rate limiting, logging, caching are all plugins. Popular in enterprise environments and Kubernetes deployments.

**Azure API Management** — Microsoft's managed gateway. Integrates with Azure Active Directory. Common in enterprises already using Azure.

**NGINX / Traefik** — can be configured as an API gateway with routing, SSL termination, and rate limiting. More DIY but highly performant.

**Apigee** (Google) — full lifecycle API management including developer portal, analytics, and monetisation. Common in large enterprise API programmes.

### What This Means for Your Angular Application

As an Angular developer, the API gateway is transparent — your Angular app makes HTTP calls to the gateway's URL, not directly to individual services. The gateway handles routing behind the scenes.

Understanding the gateway helps you:

- **Debug authentication issues:** A 401 from the gateway means your token was rejected before reaching your service. A 401 from the service means the service itself rejected it. Different root causes, different fixes.
- **Understand rate limiting:** A 429 response comes from the gateway, not your service. Your Angular HTTP retry interceptor should implement exponential backoff for 429 responses, respecting the `Retry-After` header if present.
- **Understand CORS:** CORS headers are often configured at the gateway level — if you get a CORS error in development, the gateway configuration may need updating, not the backend service.
- **Discuss architecture:** Senior developers are expected to understand system architecture well enough to discuss gateway patterns in interviews.

---

## Application Scalability

### Vertical vs Horizontal Scaling

**Vertical scaling (scaling up):** Adding more resources to a single server — more CPU, more RAM, faster storage. Simple but has limits: you can only make a single machine so powerful, and it creates a single point of failure. Also involves downtime for upgrades.

**Horizontal scaling (scaling out):** Adding more servers running the same application. Each server handles a portion of the load. This is how web-scale applications work — Netflix does not have one very fast server; it has thousands of ordinary servers, each handling a fraction of the traffic.

### Stateless Architecture — The Foundation of Horizontal Scaling

For horizontal scaling to work, any request must be handleable by any server instance. This requires **stateless** application design — the application does not store session state in memory between requests.

**Stateful (cannot scale horizontally):**
```
Request 1 → Server A: "login Alice" → Server A stores Alice's session in memory
Request 2 → Server B: "get Alice's data" → Server B has no session → 401 Unauthorized
```

**Stateless (can scale horizontally):**
```
Request 1 → any server: "login" → server returns JWT token to client
Request 2 → any server: "get data" + JWT token → any server validates the JWT → 200 OK
```

JWT tokens make authentication stateless. The token carries the user's identity, roles, and expiry. Any server can validate the token by checking the signature — no shared session storage needed. For other state that must persist between requests (shopping cart, wizard progress), use an external store: Redis, a database, or cloud storage.

### Caching Strategies

Caching stores the result of an expensive operation so future requests can use the stored result instead of repeating the computation.

**Client-side caching (browser):** HTTP `Cache-Control` headers tell the browser to cache responses. Angular's HTTP Client respects these headers. Good for static assets (JavaScript bundles, images, CSS) and reference data that changes infrequently.

**CDN caching:** Content Delivery Network edge nodes cache responses. Requests are served from the nearest edge location without reaching your servers. Good for static assets and publicly accessible API responses.

**Application-level caching (Redis):** Your backend caches database query results or expensive computations in Redis. Good for query results that are expensive and change infrequently, and computed aggregates (total counts, trending items).

**Cache invalidation strategies:**

| Strategy | How it works | Use when |
|---|---|---|
| TTL (time-to-live) | Cache entries expire after N seconds | Data can tolerate some staleness |
| Write-through | Cache updated whenever database is updated | Critical consistency required |
| Cache-aside (lazy loading) | App checks cache; on miss, reads DB and populates cache | Most common — simple and effective |
| Event-driven invalidation | Events trigger cache deletion | Real-time consistency needed |

### Database Scalability

The database is usually the bottleneck in a web application.

**Connection pooling:** Maintaining a pool of database connections rather than opening a new connection per request. Opening a database connection takes hundreds of milliseconds. A pool of 10–50 connections serves thousands of requests per second by reusing them.

**Read replicas:** A replica is a copy of the database kept in sync with the primary. Read queries are routed to replicas; write queries go to the primary. This scales read capacity horizontally. Most managed database services (AWS RDS, Azure SQL, Cloud SQL) support read replicas with a single configuration toggle.

**Database indexes:** Proper indexing is the highest-impact database performance improvement. An unindexed query on a 10-million-row table that takes 5 seconds takes 5 milliseconds with a proper index.

### Scalability Vocabulary for Interviews

As a senior Angular developer, you don't need to implement distributed caching or design database sharding. You need the vocabulary to participate in architecture discussions:

**Circuit breaker pattern:** Prevents cascading failures. When a service you depend on starts failing, the circuit breaker "trips" — calls to that service fail immediately with a fallback response rather than waiting for timeouts. After a cooling-off period, the circuit breaker tries again. Named after electrical circuit breakers.

**Eventual consistency:** A consistency model where all replicas of data converge to the same value given enough time. Common in distributed systems where strong consistency would require coordination that hurts performance. Your Angular app may see slightly stale data from a replica — design for it with loading states and refresh mechanisms.

**Horizontal pod autoscaling:** Kubernetes automatically adds or removes container instances based on CPU or memory utilisation. The cloud-native equivalent of manually adding servers.

**Immutable infrastructure:** Never patch running servers. Create a new server image with the changes, deploy it, retire the old one. Ensures reproducible environments and prevents configuration drift.

**Blue/green deployment:** Two identical production environments. Traffic switches from blue (current) to green (new version) instantly. Rollback is instant — switch back to blue.

**Canary deployment:** New version released to a small percentage of users first. If metrics stay healthy, percentage gradually increases. Reduces deployment risk compared to switching all traffic at once.

The key scalability insight to share in interviews: "For an Angular application specifically, I think about scalability as keeping application state stateless using JWT rather than server sessions, making intelligent HTTP caching decisions with Cache-Control headers and CDN for static assets, and ensuring my API calls are designed for load — using pagination, avoiding N+1 queries, and not returning unbounded result sets."

---

## Cloud Platforms — IaaS, PaaS, SaaS, and the Big Three

### The Three Layers of Cloud Services

The cloud industry uses a three-tier model — often explained with a pizza analogy:

**IaaS (Infrastructure as a Service):** You get raw compute, storage, and networking. You manage the operating system, runtime, middleware, and application. Like buying ingredients — full control, full responsibility. Examples: AWS EC2, Azure Virtual Machines, Google Compute Engine.

**PaaS (Platform as a Service):** The cloud provider manages the infrastructure and runtime. You deploy your application code; they handle OS patches, scaling, load balancing, and backups. Like getting a meal kit — you cook, they sourced and prepped. Examples: AWS Elastic Beanstalk, Azure App Service, Google App Engine, Heroku.

**SaaS (Software as a Service):** A complete, ready-to-use application delivered over the internet. You configure and use it; the provider manages everything. Like ordering delivery — just eat it. Examples: Gmail, Salesforce, GitHub, Jira, Slack.

As an Angular developer, you mostly interact with PaaS (for deployment) and SaaS (for development tools). Understanding IaaS is useful for conversations with DevOps teams and system design interviews.

### AWS — Amazon Web Services

AWS launched in 2006 and holds approximately **32% market share** with over 200 distinct services. AWS built most of the vocabulary the cloud industry uses: "instance", "availability zone", "security group", "IAM role". **AWS is the default choice for startups and technology companies.**

**Key services for web developers:**

- **S3 (Simple Storage Service)** — Object storage. The standard choice for hosting Angular SPA static files. Infinitely scalable, 11 nines durability, pay per GB and request.
- **EC2 (Elastic Compute Cloud)** — Virtual machines. Hundreds of instance types for different workload profiles.
- **Lambda** — Serverless compute. Run a function in response to an event without managing servers. Pay only when the function runs. The standard pattern: API Gateway → Lambda → DynamoDB.
- **CloudFront** — Global CDN with 400+ edge locations. Integrates with S3 for static hosting.
- **RDS (Relational Database Service)** — Managed PostgreSQL, MySQL, MariaDB, Oracle, SQL Server. AWS patches the server and manages backups.
- **Cognito** — Managed user authentication. Sign-up, sign-in, OAuth social login, MFA. Integrates directly with Angular apps.
- **API Gateway** — Managed API endpoint routing HTTP requests to Lambda or other services.
- **IAM (Identity and Access Management)** — Who can do what to which AWS resources. The most common source of AWS security misconfiguration.

> ⚠️ AWS's weakness: The volume of services creates complexity. Pricing is notoriously complex to understand and estimate.

### Azure — Microsoft Azure

Azure launched in 2010 and holds approximately **22% market share**. Azure's dominant strength is enterprise integration — organisations running Active Directory, Windows Server, SQL Server, and Office 365 have strong incentives to adopt Azure.

**If a job listing mentions .NET, SQL Server, Active Directory, or "enterprise environment", Azure is the likely cloud platform.**

**Key services for web developers:**

- **Azure Static Web Apps** — Managed hosting for Angular. Integrates with GitHub Actions for automatic deployments, global CDN, automatic HTTPS. Generous free tier.
- **Azure Functions** — Serverless compute. Supports C#, JavaScript, Python, Java, and PowerShell.
- **Azure App Service** — PaaS for web applications. Deploy without managing servers.
- **Azure SQL Database** — Fully managed SQL Server.
- **Azure DevOps** — CI/CD pipelines, source control, work item tracking. Widely used in enterprise environments regardless of cloud platform.
- **Azure Active Directory (Entra ID)** — Enterprise identity and single sign-on. Angular enterprise applications frequently integrate with Azure AD using MSAL (Microsoft Authentication Library).

> ⚠️ Azure's weakness: Microsoft has renamed services multiple times, creating a confusing service catalogue.

### GCP — Google Cloud Platform

GCP holds approximately **12% market share**. GCP's differentiators are technical sophistication and Google's expertise in data processing, machine learning, and global network infrastructure.

**GCP is the preferred choice for data-intensive and ML-heavy applications.**

**Key services for web developers:**

- **Firebase** — Google's mobile and web development platform. Includes Authentication, Firestore (real-time NoSQL database), Firebase Hosting (static hosting with global CDN), Cloud Functions, and Cloud Messaging. Particularly popular for Angular. Generous free tier.
- **Cloud Run** — Run containerised applications serverlessly. Scales to zero when idle — you pay nothing when your application has no traffic.
- **BigQuery** — Serverless data warehouse. Query terabytes of data using standard SQL. Pay per query.
- **GKE (Google Kubernetes Engine)** — Managed Kubernetes. Google invented Kubernetes; GKE is widely considered the most mature managed Kubernetes service.
- **Vertex AI** — Managed ML platform. Access to Gemini foundation models.

> ⚠️ GCP's weakness: Smaller market share means fewer third-party tools and smaller talent pools. GCP has cancelled services that customers depended on — a trust issue for enterprise adoption.

### Comparing the Three

| | AWS | Azure | GCP |
|---|---|---|---|
| **Market share** | ~32% | ~22% | ~12% |
| **Best for** | Startups, tech companies | Enterprise / Microsoft stack | Data, ML, AI workloads |
| **Angular hosting** | S3 + CloudFront | Azure Static Web Apps | Firebase Hosting |
| **Serverless** | Lambda | Azure Functions | Cloud Functions / Cloud Run |
| **Managed DB** | RDS | Azure SQL Database | Cloud SQL |
| **Auth** | Cognito | Azure AD (Entra ID) | Firebase Auth |
| **CDN** | CloudFront | Azure CDN | Cloud CDN |
| **Unique strength** | Broadest services, largest ecosystem | Enterprise integration, Active Directory | BigQuery, Kubernetes, AI/ML |
| **Certifications** | Most widely recognised globally | Highly valued in enterprise | Growing in value |

### Regions, Availability Zones, and Why They Matter

Every major cloud provider organises its infrastructure into **regions** — geographic clusters of data centres. AWS has regions like `us-east-1` (Northern Virginia), `eu-west-2` (London), and `ap-southeast-1` (Singapore). Each region is physically isolated — a disaster affecting one region does not affect another.

Within each region are multiple **Availability Zones (AZs)** — separate data centres connected by high-speed private fibre. Close enough for low latency (1–5ms), far enough apart that a fire, flood, or power failure affecting one AZ is unlikely to affect another.

- **High availability** — distribute your application across multiple AZs. If one AZ goes down, traffic routes automatically to healthy AZs.
- **Disaster recovery** — replicate to a second region so a regional disaster doesn't take down your service entirely.

Region selection is primarily driven by latency (closest to your users) and data residency requirements (some regulations require data to stay within a specific country or jurisdiction — GDPR in Europe, for example).

> 📝 From an Angular developer's perspective, you most commonly interact with cloud platforms for: deployment (S3+CloudFront, Azure Static Web Apps, Firebase Hosting), authentication (Cognito, Azure AD B2C, Firebase Auth), and lightweight serverless functions (Lambda, Azure Functions, Cloud Functions) for backend logic that doesn't warrant a full server. Deep cloud infrastructure knowledge is typically a DevOps specialty — but knowing the landscape and vocabulary makes you a more effective collaborator with infrastructure teams.

---

*Next: [Programming Foundations](./programming-foundations.md)*
