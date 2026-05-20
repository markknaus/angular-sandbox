# Engineering Practices
### Agile, Collaboration, Reliability & Deployment

> SDLC, Agile, Scrum, Kanban, code review, technical decision-making, mentoring, documentation, behavioural interviews, SLAs/SLOs, deployment strategies (blue/green, canary, feature flags), incident response, Infrastructure as Code, A/B testing, application scalability

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [SDLC and Agile Fundamentals](#sdlc-and-agile-fundamentals)
  - [What the SDLC Is and Why It Exists](#what-the-sdlc-is-and-why-it-exists)
  - [Waterfall — The Starting Point](#waterfall--the-starting-point)
  - [Agile — The Philosophy](#agile--the-philosophy)
  - [Scrum — The Framework](#scrum--the-framework)
  - [Roles](#roles)
  - [The Sprint](#the-sprint)
  - [Sprint Ceremonies](#sprint-ceremonies)
  - [Definition of Ready and Definition of Done](#definition-of-ready-and-definition-of-done)
  - [Estimation — Story Points and Why Estimation Is Hard](#estimation--story-points-and-why-estimation-is-hard)
  - [Kanban — The Lightweight Alternative](#kanban--the-lightweight-alternative)
- [Working in an Engineering Team](#working-in-an-engineering-team)
  - [Code Review — Giving and Receiving Feedback Well](#code-review--giving-and-receiving-feedback-well)
  - [Giving Code Review Feedback](#giving-code-review-feedback)
  - [Receiving Code Review Feedback](#receiving-code-review-feedback)
  - [Technical Decision-Making — RFCs and ADRs](#technical-decision-making--rfcs-and-adrs)
  - [Request for Comments (RFC)](#request-for-comments-rfc)
  - [Architectural Decision Records (ADRs)](#architectural-decision-records-adrs)
  - [Mentoring — The Senior Developer's Responsibility](#mentoring--the-senior-developers-responsibility)
  - [Working with Product and Design](#working-with-product-and-design)
  - [Async Communication Norms](#async-communication-norms)
- [Documentation as an Engineering Practice](#documentation-as-an-engineering-practice)
  - [Why Documentation Is a Senior Responsibility](#why-documentation-is-a-senior-responsibility)
  - [What to Document](#what-to-document)
  - [Code Comments — When, Not Always](#code-comments--when-not-always)
  - [README Files](#readme-files)
  - [Architectural Decision Records](#architectural-decision-records)
  - [Runbooks](#runbooks)
  - [Onboarding Guides](#onboarding-guides)
  - [What Not to Document](#what-not-to-document)
  - [Keeping Documentation Current — The Hardest Problem](#keeping-documentation-current--the-hardest-problem)
- [Behavioural Interview Preparation](#behavioural-interview-preparation)
  - [The STAR Framework](#the-star-framework)
  - [Worked STAR Answers for Common Senior Questions](#worked-star-answers-for-common-senior-questions)
  - ["Describe your development process."](#describe-your-development-process)
  - ["Tell me about a time you disagreed with a technical decision."](#tell-me-about-a-time-you-disagreed-with-a-technical-decision)
  - ["How do you handle changing requirements mid-sprint?"](#how-do-you-handle-changing-requirements-mid-sprint)
  - ["Tell me about a time you mentored someone."](#tell-me-about-a-time-you-mentored-someone)
  - ["How do you ensure code quality on your team?"](#how-do-you-ensure-code-quality-on-your-team)
  - ["How do you handle technical debt?"](#how-do-you-handle-technical-debt)
  - ["Tell me about a time a project went off the rails and what you did."](#tell-me-about-a-time-a-project-went-off-the-rails-and-what-you-did)
  - ["How do you work with non-technical stakeholders?"](#how-do-you-work-with-non-technical-stakeholders)
- [Reliability & Operational Excellence](#reliability--operational-excellence)
  - [Overview — Your Role Without Owning It](#overview--your-role-without-owning-it)
  - [SLAs, SLOs, and SLIs](#slas-slos-and-slis)
  - [Observability — Logging, Monitoring, Alerting](#observability--logging-monitoring-alerting)
  - [Deployment Strategies](#deployment-strategies)
  - [Incident Response — Your Role](#incident-response--your-role)
- [Infrastructure as Code](#infrastructure-as-code)
  - [What Infrastructure as Code Is](#what-infrastructure-as-code-is)
  - [Why IaC Matters for Senior Developers](#why-iac-matters-for-senior-developers)
  - [Terraform — The Dominant IaC Tool](#terraform--the-dominant-iac-tool)
- [A/B Testing and Feature Flags](#ab-testing-and-feature-flags)
  - [What A/B Testing Is](#what-ab-testing-is)
  - [How A/B Tests Work](#how-ab-tests-work)
  - [Statistical Significance — What It Actually Means](#statistical-significance--what-it-actually-means)
  - [Feature Flags — The Mechanism for A/B Tests](#feature-flags--the-mechanism-for-ab-tests)


## SDLC and Agile Fundamentals

### What the SDLC Is and Why It Exists

The Software Development Life Cycle (SDLC) is a structured process for planning, creating, testing, and delivering software. It exists because without a defined process, software projects are chaotic: requirements change without record, teams build the wrong thing, bugs reach production, and nobody knows what is actually done vs what is in progress.

The SDLC is not a single process — it is a framework that different methodologies implement differently.

### Waterfall — The Starting Point

Waterfall is the traditional SDLC model. Work flows in one direction through sequential phases: Requirements → Design → Implementation → Testing → Deployment → Maintenance. Each phase must be fully complete before the next begins.

**When it works:** projects with fixed, well-understood requirements that will not change — regulatory compliance systems, safety-critical software, embedded systems with hardware constraints. Government and defence contracts often use waterfall because they require formal sign-off at each phase.

**Why it fails for most software:** requirements change. Users do not know exactly what they want until they see something. A three-year waterfall project that delivers the completed system in year three often delivers the wrong thing. The market changed, the business needs changed, the technology changed.

### Agile — The Philosophy

Agile is not a methodology — it is a set of values and principles documented in the Agile Manifesto (2001). The four values:

- **Individuals and interactions** over processes and tools
- **Working software** over comprehensive documentation
- **Customer collaboration** over contract negotiation
- **Responding to change** over following a plan

The twelve principles emphasise: delivering working software frequently (weeks rather than months), welcoming changing requirements even late in development, sustainable development pace, technical excellence, simplicity, and self-organising teams.

### Scrum — The Framework

Scrum is the most widely used Agile framework. When a job posting says "Agile", it almost always means Scrum. Scrum organises work into fixed-length iterations called sprints (usually two weeks) with defined roles and ceremonies.

### Roles

**Product Owner:** owns the product backlog — the prioritised list of all work to be done. Makes decisions about what gets built and in what order. Represents the business and the users. Is not a manager of the development team.

**Scrum Master:** facilitates the Scrum process. Removes impediments (blockers). Coaches the team on Scrum practices. Is not a project manager or a technical lead — they do not tell developers what to do.

**Development Team:** self-organising cross-functional team (3–9 people) that does the actual work.

### The Sprint

A sprint is a fixed time-box (one to four weeks, usually two) during which the team builds a potentially shippable increment. "Potentially shippable" means it is built, tested, and meets the team's Definition of Done — not that it will necessarily be deployed, but that it could be.

### Sprint Ceremonies

**Sprint Planning (start of sprint):** the team selects items from the top of the product backlog. The Product Owner presents highest-priority items. The team estimates effort and commits to what they can complete. Output: the sprint backlog and a sprint goal.

**Daily Standup (every day, 15 minutes):** each team member answers: what did I do yesterday, what will I do today, what is blocking me? The standup surfaces blockers early and keeps the team synchronised. It is not a status report to management — it is for the team.

**Sprint Review (end of sprint):** the team demonstrates what they built to stakeholders. Working software is shown, not slides. Stakeholders give feedback. This is the primary feedback loop between the team and the business.

**Sprint Retrospective (after sprint review):** the team reflects on their process — not on the product, but on how they worked. What went well? What did not? What one thing will we do differently? The retrospective is where process improvements originate.

> In interviews, when asked about retrospectives, always describe a real improvement that came from one. "We noticed we were frequently discovering integration issues late in the sprint, so we added a mid-sprint integration checkpoint" is far more credible than a generic answer.

### Definition of Ready and Definition of Done

**Definition of Ready:** criteria a backlog item must meet before the team will bring it into a sprint. Typically: the requirement is clearly described, acceptance criteria are written, the item is estimated, dependencies are resolved.

**Definition of Done:** criteria that must be met before an item can be called complete. Typically: code written, code review complete, tests written and passing, accessibility requirements met, documentation updated, product owner accepted. Work that does not meet the DoD is not done — it is technical debt in disguise.

### Estimation — Story Points and Why Estimation Is Hard

Story points are a relative unit of effort. Rather than estimating in hours (notoriously inaccurate), teams estimate how complex a story is relative to other stories.

**Planning poker:** each team member independently selects an estimate card (typically Fibonacci: 1, 2, 3, 5, 8, 13, 20). Cards are revealed simultaneously. If estimates diverge significantly, the high and low estimators explain their thinking — this surfaces assumptions and risks.

**Velocity:** the number of story points a team completes per sprint, averaged over several sprints. A planning tool, not a performance metric. Comparing velocity between teams is meaningless.

### Kanban — The Lightweight Alternative

Kanban is a continuous flow model without sprints. Work items move through columns (Backlog → In Progress → Review → Done) with WIP limits on each column. When a column is full, new items cannot enter until existing ones progress.

**When Kanban fits better:** maintenance and support work where sprint planning is difficult because work arrives unpredictably. Small teams. Operations and DevOps workflows.

---

## Working in an Engineering Team

### Code Review — Giving and Receiving Feedback Well

Code review is not gatekeeping — it is collaboration. Its purposes: catching bugs before they reach production, sharing knowledge across the team, maintaining code quality standards, and ensuring more than one person understands any given part of the codebase.

### Giving Code Review Feedback

**Be specific and actionable:** "This function is hard to read" is not useful. "This function has three different responsibilities — consider extracting the validation logic into a separate function with a descriptive name" is useful.

**Use labels:** prefix comments to signal urgency and nature. "Nit:" for style preferences that do not need to be addressed. "Suggestion:" for improvements that would be nice but are not blocking. "Question:" when you genuinely do not understand something and are not assuming it is wrong. "Blocking:" for issues that must be addressed before merge. This prevents reviewees from spending time on nits when there are blocking issues.

**Distinguish opinion from fact:** "I prefer extracting this" vs "this will cause a null pointer exception if the list is empty." One is a suggestion; the other is a bug.

**Acknowledge good code:** code review often focuses on problems. When you see something done particularly well, say so. "Nice use of the builder pattern here — much cleaner than the alternatives."

**Suggest, do not dictate:** "What do you think about..." instead of "You should...". The code author has context the reviewer does not.

### Receiving Code Review Feedback

Assume good faith. The reviewer is trying to improve the code, not criticise you. Ask for clarification if feedback is ambiguous. Explain your reasoning if you disagree — "I did it this way because..." invites dialogue. You are not obligated to accept every suggestion, but you should acknowledge every comment and explain your decision.

### Technical Decision-Making — RFCs and ADRs

### Request for Comments (RFC)

An RFC is a document proposing a significant technical change, seeking feedback before implementation. RFC disciplines the proposer to think through implications, invites broader perspective, and creates a record of why decisions were made. Structure: problem, proposed solution, alternatives considered, trade-offs, open questions.

### Architectural Decision Records (ADRs)

An ADR is a short document recording an architectural decision, the context in which it was made, and its consequences. ADRs live in the repository (typically in `docs/decisions/`). They are written once and never modified (decisions are superseded by new ADRs, not edited). ADRs answer the question every new team member asks: "Why did we do it this way?"

A minimal ADR template:
- **Title** — short phrase describing the decision
- **Status** — proposed, accepted, deprecated, superseded
- **Context** — what was the situation that forced this decision?
- **Decision** — what did we decide to do?
- **Consequences** — what are the trade-offs? What becomes easier? Harder?

### Mentoring — The Senior Developer's Responsibility

Senior developers are expected to mentor junior and mid-level developers. Effective mentoring is about accelerating understanding, not giving answers.

**Ask questions before giving answers:** "What have you tried so far?" and "What do you think the issue might be?" teach problem-solving. Just giving the answer teaches dependency.

**Explain the why:** when showing how to do something, always explain why — what principle, pattern, or constraint drives the approach. "We extract this into a service because components should not know about HTTP — this is the Single Responsibility Principle applied..."

**Code review as mentorship:** code review is structured mentorship. Write comments that teach: "Using `switchMap` here instead of `mergeMap` because we want to cancel the previous request when the search term changes — `mergeMap` would give us results for old search terms interleaved with new ones."

### Working with Product and Design

As a senior developer, you are a product stakeholder, not an execution engine. Valuable contributions beyond code:

- **Technical risk assessment:** identify when a proposed feature will take 3x longer than expected, or when a design decision will cause accessibility problems. Raise these early — before the sprint starts.
- **Incremental delivery:** break large features into user-visible increments that can be shipped individually. "We can ship the list view this sprint and the detail view next sprint" is more valuable than "this will take three sprints."
- **Implementation constraints:** when a design is technically infeasible or will have performance problems, say so with specifics. "This animation will cause layout recalculation on every frame — we could achieve the same visual effect with a transform animation that runs on the GPU instead."

### Async Communication Norms

Remote and hybrid teams rely on async communication. Senior developers model good async norms:

- **Write for the person who reads it in three days.** Assume they have no context from the conversation that led to the message.
- **Include the full context in the message.** Not "this is broken" but "The checkout form's payment validation is failing for users with non-US phone numbers. Steps to reproduce: enter a UK phone number (+44...) and submit. Error: 'Invalid phone format'. This started after the PR merged on Tuesday."
- **Distinguish actionable requests from FYI.** "FYI: the API rate limit docs say..." vs "@alice I need your review on PR #123 by end of day — it blocks the release."
- **Use threads in Slack.** Reply in thread, not in channel. This keeps channels readable.

---

## Documentation as an Engineering Practice

### Why Documentation Is a Senior Responsibility

Documentation is one of the most visible signals of engineering maturity. A codebase without documentation is harder to onboard into, harder to maintain, and harder to hand off. Senior developers own the documentation culture of their team — by writing good documentation and by code-reviewing documentation as carefully as code.

### What to Document

### Code Comments — When, Not Always

Comments should explain why, not what. The code explains what (if it is well-named). Comments explain: unusual decisions, performance trade-offs, quirks of third-party APIs, known limitations, and non-obvious business rules.

```typescript
// The API returns dates as Unix timestamps (seconds) rather than ISO 8601.
// We convert here so the rest of the app works with Date objects consistently.
const createdAt = new Date(response.createdAtUnix * 1000);

// Do NOT use forkJoin here — the user observable never completes,
// which would cause forkJoin to never emit.
combineLatest({ user: this.userStore.currentUser$, prefs: this.prefsService.get() })
```

### README Files

Every project and every library package should have a README. Contents: what is it (one sentence), how to install/set up, how to run locally, how to run tests, environment variables, deployment instructions, known limitations. The README is the first thing a new team member reads. A good README reduces onboarding time by hours.

### Architectural Decision Records

As described above. Every non-obvious architectural decision should have an ADR.

### Runbooks

A runbook is an operational procedure: what to do when alert X fires, or how to perform operation Y safely. Runbooks live in a wiki or the repository. A good runbook is: specific (exact commands, not vague instructions), verified (someone has run through it), and kept current (updated when the procedure changes).

### Onboarding Guides

A step-by-step guide for a new team member to go from zero to running the application locally and making their first code change. Includes: prerequisites (Node version, tools), clone and setup steps, how to configure environment variables, common errors and their solutions.

### What Not to Document

Documentation that repeats what the code clearly says is noise. `// Increment i by 1` above `i++` wastes space and attention. Documentation that describes intent but not implementation is usually more valuable than documentation that describes implementation in prose.

### Keeping Documentation Current — The Hardest Problem

Documentation that is out of date is worse than no documentation — it actively misleads. Strategies to keep docs current: include documentation updates in the Definition of Done (documentation is part of done, not optional extra work). Review documentation in code review — if the PR changes behaviour, the README or ADR should be updated. Set a quarterly documentation review calendar event. Use tests as living documentation — well-named tests describe behaviour better than prose.

---

## Behavioural Interview Preparation

### The STAR Framework

STAR (Situation, Task, Action, Result) is the standard framework for behavioural interview answers. Interviewers ask behavioural questions ("Tell me about a time...") to understand how you have handled real situations.

- **Situation:** what was the context? Keep this brief — one or two sentences.
- **Task:** what was your specific responsibility in this situation?
- **Action:** what did YOU do? Use "I", not "we". Be specific about your individual contribution.
- **Result:** what happened? Quantify where possible. What did you learn?

### Worked STAR Answers for Common Senior Questions

### "Describe your development process."

I work in two-week sprints with sprint planning on Mondays. Before bringing a story into a sprint, I make sure it meets our Definition of Ready — clear acceptance criteria, design approved, dependencies identified. During development I work in small commits on feature branches, with a PR for each logical unit of work. I write tests alongside the code, not after, and I check accessibility during development (keyboard testing, running axe-core). After merge, I monitor error tracking and performance metrics for any regression. If a feature will take more than one sprint, I break it into user-visible increments that can be shipped and demoed independently.

### "Tell me about a time you disagreed with a technical decision."

In a previous role, the team decided to use a shared state management library for all component state — including state that was purely local to one component. I thought this was over-engineering: it added boilerplate, made the code harder to read, and made components harder to test in isolation. I wrote a short RFC explaining my concern and proposing a guideline: local state stays in the component; state that crosses feature boundaries goes in the shared store. I presented it at the next architecture meeting. There was discussion — some team members preferred consistency over pragmatism. We agreed on a trial: apply the guideline for the next three PRs and review. After three PRs, the team agreed the code was cleaner and adopted the guideline. The key was engaging with evidence rather than just asserting my preference.

### "How do you handle changing requirements mid-sprint?"

Requirements change in software — it is not a failure, it is reality. When requirements change mid-sprint, my first question is: does this invalidate current sprint work? If not, I add it to the backlog for next sprint planning. If it does invalidate current work, I stop the affected work, have a conversation with the Product Owner about priority and scope, and adjust the sprint plan. I document the change and why it was made — this protects the team from "we never asked for that" retrospective conversations. For large changes, I flag the sprint goal as at risk and communicate this clearly in the daily standup and to the Product Owner.

### "Tell me about a time you mentored someone."

A junior developer on my team was struggling with RxJS — they understood the concept but kept making subscription management mistakes that caused memory leaks. Rather than just code-reviewing the errors, I scheduled two 30-minute pair programming sessions. In the first session, we wrote a component together that demonstrated every common mistake and then fixed it — using takeUntilDestroyed(), the async pipe, toSignal(). In the second session, they drove and I observed. After the sessions, their RxJS code quality improved significantly — the next three PRs had no subscription management issues. I also asked them to write up what they learned as a team Confluence page, which forced them to consolidate the knowledge and helped the rest of the team.

### "How do you ensure code quality on your team?"

Code quality is a team responsibility, not an individual one. On the technical side: ESLint and Prettier enforced by pre-commit hooks (no style debates in code review). Automated tests with coverage gates in CI (80% line coverage; failing coverage blocks the PR). TypeScript strict mode (no `any`, no implicit `null` bypasses). Bundle size budgets that fail the build if exceeded. axe-core accessibility scan in CI. On the process side: a Definition of Done that includes tests, documentation, and accessibility. Code review with at least one approval before merge. Architectural Decision Records for non-obvious decisions. Regular architecture discussions (informal — not lengthy meetings). The goal is making the right thing the easy thing, not relying on individual vigilance.

### "How do you handle technical debt?"

Technical debt is a reality — sometimes taking shortcuts is the right business decision. The problem is unacknowledged technical debt that compounds silently. My approach: (1) make it visible — log every intentional shortcut as a ticket with a clear description of the shortcut and its impact; (2) distinguish between debt that slows future work in this area vs debt that is genuinely benign; (3) include debt repayment in sprint planning — not as a separate track, but alongside feature work; (4) negotiate refactoring as risk reduction — "fixing this authentication shortcut reduces the risk of a security incident" is a business argument, not a technical preference.

### "Tell me about a time a project went off the rails and what you did."

Situation: we were three weeks from a major client demo and discovered that the data visualisation component (which represented about 40% of the demo's value) had a performance problem: it was taking 8–12 seconds to render with realistic data volumes. Task: as the senior front-end developer, I owned diagnosing and fixing this. Action: I started by profiling — Chrome Performance panel revealed the chart library was rendering synchronously in the main thread, blocking interaction for the entire render time. I researched alternatives: switching libraries would take too long. I implemented three changes: moved the data aggregation to a web worker (removing it from the main thread), implemented virtual rendering (only rendering visible data points), and added a progressive loading pattern (showing a skeleton until the first render). Result: render time dropped to under 1 second for the full data set. We delivered the demo on time. I documented the architecture as an ADR. Lesson: performance should be in the Definition of Done from day one, not discovered three weeks before the deadline.

### "How do you work with non-technical stakeholders?"

The key skill is translation — not dumbing down, but choosing the right vocabulary for the audience. A product manager does not need to understand signals vs RxJS. They need to understand: "using the new Angular pattern for this feature reduces the risk of bugs in future changes and makes testing easier — it costs us two extra days now and saves us approximately a day of debugging on average per future feature in this area." I try to frame technical decisions in terms of: business outcomes affected (speed, cost, risk, quality), trade-offs being made, and what decision is being asked of the stakeholder. "Should we spend two days to do this right, or save two days now and accept higher maintenance cost later?" is a decision a product manager can make. "Should we use signals or BehaviorSubject?" is not.

---

## Reliability & Operational Excellence

### Overview — Your Role Without Owning It

Reliability engineering is primarily a DevOps and SRE discipline. As a senior Angular developer, you are expected to: understand the vocabulary, write code that supports observability, participate in incident response for systems you have built, and have informed conversations with the teams that do own reliability.

### SLAs, SLOs, and SLIs

**SLI (Service Level Indicator):** a specific metric that measures service behaviour. "The percentage of requests that complete in under 200ms." SLIs are what you measure.

**SLO (Service Level Objective):** a target for an SLI. "99.5% of requests complete in under 200ms." SLOs are internal targets the engineering team owns. When an SLO is breached, it triggers work to investigate and improve.

**SLA (Service Level Agreement):** a contract with customers about service behaviour. "We guarantee 99% uptime per month." Breaching an SLA has commercial consequences (refunds, penalties, contract termination).

The relationship: SLIs measure → SLOs target → SLAs commit. Internal SLOs are tighter than external SLAs to provide a buffer.

**Why this matters for front-end developers:** Angular bundle size, LCP, INP — these are SLIs for the user experience. Understanding that performance has business implications (SLA breaches have costs) makes the case for investing in Angular performance optimisation.

### Observability — Logging, Monitoring, Alerting

**Observability** is the ability to understand what is happening inside a system by examining its outputs. A system is observable if you can diagnose any failure from the data it produces.

**Logging:** recording events that happened. In an Angular application: unhandled errors via Angular's `ErrorHandler`, HTTP errors (status codes, endpoints, timing), significant user actions for audit trails, performance timing for key operations. Log to a centralised service (Datadog, Sentry, Splunk) — logs that only exist in the browser console are useless in production.

```typescript
// Angular global error handler — sends errors to monitoring service
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private monitoring = inject(MonitoringService);
  handleError(error: unknown): void {
    this.monitoring.captureException(error, {
      context: 'Angular ErrorHandler',
      url: window.location.href,
    });
    console.error(error);
  }
}
// Register: { provide: ErrorHandler, useClass: GlobalErrorHandler }
```

**Monitoring:** collecting and visualising metrics over time. Dashboards showing error rates, request latency, active user counts, Core Web Vitals scores. Makes patterns visible.

**Alerting:** notifying humans when something needs attention. Well-designed alerts are: actionable (alert means something needs to be done), specific (the alert tells you what is wrong), and appropriately sensitive (not so noisy that people ignore them).

### Deployment Strategies

**Blue/Green deployment:** run two identical production environments. "Blue" is the current live version. "Green" is the new version. Traffic switches from blue to green all at once. Rollback is instant — switch back to blue. Safe and fast to roll back, but requires double the infrastructure.

**Canary deployment:** release the new version to a small percentage of users (1%, 5%, 10%) while most users continue using the old version. Monitor error rates and performance in the canary group. If metrics look good, gradually increase the percentage. More complex than blue/green but provides a real-world test with limited blast radius.

**Feature flags:** ship code to production but enable features only for specific users (internal team, beta users, percentage rollout). The feature flag is a configuration value, not a deployment. You can enable a feature without a deployment and disable it without a rollback. See Part 7 for implementation.

**Rolling deployments:** gradually replace old instances with new ones, one at a time. Common in Kubernetes environments. Brief period where some instances serve the old version and some serve the new.

### Incident Response — Your Role

An incident is an unplanned interruption to service or degradation of quality.

**Your role during an incident (when you built the affected system):** diagnose what is happening in the front-end (check error monitoring, reproduce the issue). Communicate clearly: "I have confirmed the Angular routing is broken — the Angular router is not loading the component at /dashboard — investigating the cause now." Avoid speculation until you have evidence. If you identify a fix, estimate the time to deploy and communicate it.

**Post-incident review (PIR/Postmortem):** after a significant incident, the team conducts a blameless review: what happened, what the timeline was, why it happened (root causes, not who did what), what we can do to prevent it or reduce impact in the future. "Blameless" means focus on system and process improvements, not individual fault. The goal is learning, not accountability.

---

## Infrastructure as Code

### What Infrastructure as Code Is

Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure through machine-readable configuration files rather than manual processes. Instead of logging into a cloud console and clicking to create servers, you write code that describes the desired infrastructure state, and a tool creates it automatically.

**Without IaC:** a developer logs into the AWS console, clicks through menus to create an EC2 instance, configures a security group, sets up a load balancer. This process is manual, undocumented, not reproducible, and cannot be reviewed or version-controlled.

**With IaC:** a developer writes a Terraform file describing the infrastructure. This file is committed to git, reviewed in a pull request, and applied by a CI/CD pipeline. The same infrastructure can be reproduced identically in dev, staging, and production environments.

### Why IaC Matters for Senior Developers

You are not expected to be a Terraform expert as an Angular developer. But you should understand:

- What IaC is and why it exists — comes up in senior interviews about deployment and operations
- That infrastructure changes go through code review and version control — just like application code
- How environment configuration is managed — helps you understand why environment-specific settings are where they are
- The "immutable infrastructure" concept — instead of patching running servers, you create new server images and replace the old ones

### Terraform — The Dominant IaC Tool

Terraform (by HashiCorp) is the most widely used IaC tool. Works across all major cloud providers using the same language (HCL — HashiCorp Configuration Language). Uses a state file to track current infrastructure and computes a plan (diff) of what needs to change.

```hcl
# main.tf — host an Angular app on AWS

resource "aws_s3_bucket" "angular_app" {
  bucket = "my-angular-app-production"
}

resource "aws_cloudfront_distribution" "angular_app" {
  origin {
    domain_name = aws_s3_bucket.angular_app.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.angular_app.id}"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.angular_app.id}"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # SPA routing — always serve index.html for unknown paths
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}

output "app_url" {
  value = "https://${aws_cloudfront_distribution.angular_app.domain_name}"
}
```

```bash
terraform init     # download providers and modules
terraform plan     # show what will change (dry run)
terraform apply    # apply the changes
terraform destroy  # tear down all managed infrastructure
```

**Other IaC tools worth knowing:** AWS CloudFormation (AWS-only, JSON/YAML), Pulumi (write infrastructure in TypeScript/Python/Go — popular with Angular developers), Ansible (configuration management), AWS CDK (define AWS infrastructure in TypeScript).

---

## A/B Testing and Feature Flags

### What A/B Testing Is

A/B testing (split testing) is a method of comparing two or more versions of something to determine which performs better. In web development: show version A to some users and version B to other users, measure how each group behaves, and use statistical analysis to determine which version is better.

The "better" depends on what you are measuring — the **metric**. Common metrics: conversion rate, click-through rate, time on page, sign-up rate, revenue per user, task completion rate.

### How A/B Tests Work

1. **Define the hypothesis:** "Changing the checkout button from 'Proceed to Payment' to 'Complete Order' will increase checkout completion rate"
2. **Define the metric:** checkout completion rate
3. **Define the sample size:** statistical power analysis determines how many users you need to detect a meaningful difference
4. **Split traffic:** randomly assign users to control (A) or treatment (B) groups — typically 50/50
5. **Run the test:** show each group their version, collect data
6. **Analyse results:** was the difference statistically significant?
7. **Ship the winner:** roll out the winning variant to all users

### Statistical Significance — What It Actually Means

A result is statistically significant at 95% confidence if there is less than a 5% probability that the observed difference occurred by random chance.

**Common mistakes:**
- **Stopping early:** checking results daily and stopping when p < 0.05 inflates your false positive rate dramatically. Determine the sample size before starting and run until you reach it.
- **Multiple metrics:** testing 20 metrics means that by random chance alone, one will appear significant at the 5% level. Define your primary metric in advance.
- **Novelty effect:** users behave differently with new things. A test running for only a day may capture novelty rather than genuine preference.
- **Segment pollution:** if users switch between A and B groups, results are contaminated.

### Feature Flags — The Mechanism for A/B Tests

Feature flags are the technical mechanism that enables A/B testing. A feature flag is a configuration value that controls whether a feature is enabled for a given user.

```typescript
// Angular feature flag service
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal<Record<string, boolean>>({});

  async loadFlags(userId: string): Promise<void> {
    const flags = await firstValueFrom(
      this.http.get<Record<string, boolean>>(`/api/feature-flags?userId=${userId}`)
    );
    this.flags.set(flags);
  }

  isEnabled(flagName: string): boolean {
    return this.flags()[flagName] ?? false;
  }

  isEnabledSignal(flagName: string): Signal<boolean> {
    return computed(() => this.flags()[flagName] ?? false);
  }
}

// In a component
@Component({
  template: `
    @if (featureFlags.isEnabled('new-checkout-button')) {
      <button class="checkout-btn-v2">Complete Order</button>
    } @else {
      <button class="checkout-btn-v1">Proceed to Payment</button>
    }
  `
})
export class CheckoutComponent {
  featureFlags = inject(FeatureFlagService);
}
```

**Popular feature flag services:** LaunchDarkly (market leader, paid), Unleash (open-source), Flagsmith (open-source), AWS AppConfig, Split.io. These handle user assignment, percentage rollouts, targeting rules, and analytics integration.

**Feature flags beyond A/B testing:** gradual rollouts (enable for 1%, then 10%, then 100%), kill switches (instantly disable a broken feature without a deployment), canary deployments, and separating feature deployment from feature release. Feature flags in Angular are a configuration-driven way to ship code to production without making it visible to users — this decouples deployment from release and dramatically reduces deployment risk.

---

*Next: [Data Structures & Algorithms](./data-structures-and-algorithms.md)*
