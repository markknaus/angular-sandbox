# AI for Developers
### Understanding and Using AI as a Senior Front-End Engineer

> A practical guide to AI concepts, tools, and workflows — for an experienced Angular developer using Claude Code as the primary development tool.

> 📝 **Navigation:** Notion users — add a `/Table of Contents` block below this line. GitHub users — use the **☰** icon at the top-right of this file.

---

## Table of Contents

- [Introduction](#introduction)
- [What AI Actually Is](#what-ai-actually-is)
  - [Traditional Programming vs Machine Learning](#traditional-programming-vs-machine-learning)
  - [Neural Networks — The Analogy That Actually Helps](#neural-networks--the-analogy-that-actually-helps)
  - [Narrow AI vs General AI](#narrow-ai-vs-general-ai)
  - [The 2017–2023 Step Change — Transformers in Plain English](#the-20172023-step-change--transformers-in-plain-english)
- [Large Language Models — How They Work](#large-language-models--how-they-work)
  - [What an LLM Actually Is](#what-an-llm-actually-is)
  - [Tokens and Context Windows](#tokens-and-context-windows)
  - [Why Hallucination Happens and How to Work Around It](#why-hallucination-happens-and-how-to-work-around-it)
  - [Temperature and Why the Same Prompt Gives Different Answers](#temperature-and-why-the-same-prompt-gives-different-answers)
  - [Embeddings and Vector Search](#embeddings-and-vector-search)
  - [Base Models, Instruction-Tuned Models, and Reasoning Models](#base-models-instruction-tuned-models-and-reasoning-models)
- [The AI Landscape — Models, Products, and Vendors](#the-ai-landscape--models-products-and-vendors)
  - [The Three Layers](#the-three-layers)
  - [The Major Model Providers](#the-major-model-providers)
  - [How to Evaluate a New Model](#how-to-evaluate-a-new-model)
- [AI in Software Development — The Broad Picture](#ai-in-software-development--the-broad-picture)
  - [How AI Is Changing the SDLC](#how-ai-is-changing-the-sdlc)
  - [The Realistic Productivity Picture](#the-realistic-productivity-picture)
  - [How Different IT Roles Are Being Affected](#how-different-it-roles-are-being-affected)
- [AI Coding Tools — The Landscape](#ai-coding-tools--the-landscape)
  - [GitHub Copilot — Where You Started](#github-copilot--where-you-started)
  - [AI-Native IDEs — Cursor and Windsurf](#ai-native-ides--cursor-and-windsurf)
  - [Claude Code — Your Primary Tool](#claude-code--your-primary-tool)
- [Claude Code for VS Code — Deep Dive](#claude-code-for-vs-code--deep-dive)
  - [What Claude Code Actually Is](#what-claude-code-actually-is)
  - [Setup and Requirements](#setup-and-requirements)
  - [The VS Code Extension Interface](#the-vs-code-extension-interface)
  - [Permission Modes — Controlling Autonomy](#permission-modes--controlling-autonomy)
  - [Core Workflows](#core-workflows)
  - [Referencing Files and Context](#referencing-files-and-context)
  - [Claude Code for Angular Specifically](#claude-code-for-angular-specifically)
  - [What Claude Code Gets Wrong](#what-claude-code-gets-wrong)
  - [CLAUDE.md — Your Project Context File](#claudemd--your-project-context-file)
- [Prompt Engineering for Claude Code](#prompt-engineering-for-claude-code)
  - [The Role / Context / Task / Format Structure](#the-role--context--task--format-structure)
  - [Chain of Thought for Complex Problems](#chain-of-thought-for-complex-problems)
  - [Iterative Refinement](#iterative-refinement)
  - [Rubber Duck Debugging with AI](#rubber-duck-debugging-with-ai)
  - [What Not to Send to AI](#what-not-to-send-to-ai)
- [Using AI in Your Job Search](#using-ai-in-your-job-search)
  - [Researching Companies and Roles](#researching-companies-and-roles)
  - [Tailoring Your CV for Specific Roles](#tailoring-your-cv-for-specific-roles)
  - [Simulating Technical Interviews](#simulating-technical-interviews)
  - [Generating Smart Questions to Ask Interviewers](#generating-smart-questions-to-ask-interviewers)
  - [Talking About AI Experience in Interviews](#talking-about-ai-experience-in-interviews)
- [AI Security, Ethics, and Enterprise Adoption](#ai-security-ethics-and-enterprise-adoption)
  - [Data Leakage — What Not to Send](#data-leakage--what-not-to-send)
  - [Prompt Injection](#prompt-injection)
  - [Intellectual Property and Copyright](#intellectual-property-and-copyright)
  - [How Enterprises Are Governing AI](#how-enterprises-are-governing-ai)
  - [The Ethics Framing — Brief](#the-ethics-framing--brief)
- [Staying Current](#staying-current)
- [Vibe Coding](#vibe-coding)
  - [What Vibe Coding Is](#what-vibe-coding-is)
  - [The Spectrum of AI-Assisted Development](#the-spectrum-of-ai-assisted-development)
  - [Where Vibe Coding Works Well](#where-vibe-coding-works-well)
  - [Where Vibe Coding Is Dangerous](#where-vibe-coding-is-dangerous)
  - [Maintaining Code Ownership](#maintaining-code-ownership)
  - [Talking About Vibe Coding in Interviews](#talking-about-vibe-coding-in-interviews)

---

## Introduction

Artificial intelligence has moved from a specialist research topic to a daily development tool faster than any technology since the smartphone. In 2026, senior developers are expected to have a working understanding of what AI is, how to use it productively, and how to reason about its limitations. This is not optional knowledge for a job search — interviewers ask about it, job descriptions mention it, and the developers who use AI well are measurably more productive than those who do not.

This guide is written for an experienced Angular developer who uses Claude Code for VS Code as their primary AI development tool, having previously used GitHub Copilot. It covers the conceptual foundations you need to discuss AI intelligently in any interview, the development-specific context that matters for senior roles, and a thorough grounding in Claude Code itself.

**What this guide covers:**

| Section | Topic |
|---|---|
| 1 | What AI Actually Is |
| 2 | Large Language Models — How They Work |
| 3 | The AI Landscape — Models, Products, and Vendors |
| 4 | AI in Software Development — The Broad Picture |
| 5 | AI Coding Tools — The Landscape |
| 6 | Claude Code for VS Code — Deep Dive |
| 7 | Prompt Engineering for Claude Code |
| 8 | Using AI in Your Job Search |
| 9 | AI Security, Ethics, and Enterprise Adoption |
| 10 | Staying Current |
| 11 | Vibe Coding |

---

## What AI Actually Is

### Traditional Programming vs Machine Learning

Traditional programming is explicit instruction-giving. A developer writes rules: if the user's input is a valid email address, accept it; if not, reject it. The computer follows those rules exactly. The developer must anticipate every case and write a rule for it. The program cannot handle anything the developer did not explicitly program for.

Machine learning is fundamentally different. Instead of writing rules, you show the system thousands or millions of examples, and the system figures out the rules itself. You show it 100,000 emails labelled "spam" and 100,000 labelled "not spam", and the system learns patterns — certain words, sender patterns, link structures — that distinguish them. It generalises from examples to new cases it has never seen before.

This distinction explains both AI's power and its failure modes. It is extraordinarily good at finding patterns in data that humans would never notice. It is also capable of finding spurious patterns — correlations that exist in the training data but do not reflect real-world causation.

### Neural Networks — The Analogy That Actually Helps

A neural network is loosely inspired by the brain — not in a deep biological sense, but in the sense that it is a large number of simple units connected together, where the connections have different strengths, and where learning means adjusting those connection strengths based on feedback.

The most useful analogy for a developer: think of a neural network as an enormously complex mathematical function with millions or billions of parameters (the connection strengths). During training, you feed the function an input (say, an image), it produces an output (say, "cat" or "not cat"), you compare that output to the correct answer, and you nudge all the parameters slightly in the direction that would have produced a better answer. Do this billions of times across millions of examples, and the function gradually becomes very good at the task.

What makes this remarkable is that nobody programmed the function to recognise cat ears, cat fur, or cat eyes. Those concepts emerged from the parameter adjustments.

### Narrow AI vs General AI

Every AI system you will encounter in your career as a developer is narrow AI — a system that is very good at a specific type of task but cannot generalise beyond it. GPT-4 is extraordinarily good at language tasks but cannot drive a car. A chess engine can beat any human at chess but cannot play checkers without being rebuilt.

General AI — a system that can do anything a human can do, adapting to novel situations the way humans do — does not exist. The current generation of large language models, including the most capable ones, are sophisticated narrow AI systems.

Understanding this prevents two common errors: overclaiming (treating AI as more capable and reliable than it is) and underclaiming (dismissing AI as a gimmick because it sometimes fails). The right model is: a very capable but unreliable specialist that you must supervise and verify.

### The 2017–2023 Step Change — Transformers in Plain English

For decades, machine learning made steady but modest progress. Then in 2017, researchers at Google published a paper called "Attention Is All You Need" that introduced the transformer architecture. Within six years, transformers enabled a qualitative leap in AI capability that produced ChatGPT, Claude, Gemini, and every other large language model you use today.

The key innovation of transformers — attention — is conceptually simple. When processing a word in a sentence, an attention mechanism asks: which other words in this sentence are relevant to understanding this word? The word "it" in "The trophy did not fit in the suitcase because it was too big" is ambiguous — does "it" refer to the trophy or the suitcase? An attention mechanism learns to weight the other words in the sentence by their relevance to resolving that ambiguity.

This ability to maintain context and relationships across long sequences — combined with training on essentially all text on the internet at a scale of hundreds of billions of parameters — produced models capable of generating coherent, contextually appropriate text across an enormous range of tasks.

---

## Large Language Models — How They Work

### What an LLM Actually Is

A large language model is a transformer neural network trained on a massive corpus of text with one objective: predict the next token given all the previous tokens. That is literally it. The model sees a sequence of tokens and learns to predict what comes next. Everything else — the apparent reasoning, the code generation, the conversation — emerges from doing this one thing at enormous scale.

This framing is important because it explains both the capability and the limitation. An LLM that has seen billions of examples of high-quality technical writing, code, explanations, and reasoning will produce outputs that look like high-quality technical writing, code, explanations, and reasoning. But it is producing the most statistically likely continuation of the prompt it was given, based on patterns learned from its training data — not reasoning in the way humans reason.

### Tokens and Context Windows

Tokens are the unit of text that LLMs process. A token is roughly three-quarters of a word in English — "JavaScript" is one token, "unsubscribe" is two tokens. This matters for two practical reasons:

**Cost and speed:** LLM API pricing is measured in tokens — input tokens (your prompt) and output tokens (the response). Claude Code uses the API under the hood, so token efficiency affects your usage limits.

**Context window:** Every LLM has a maximum context window — the total number of tokens it can process in one interaction. Claude's current context window is 200,000 tokens (roughly 150,000 words). The context window is effectively the model's working memory. When you are working with Claude Code on a large codebase task, the files it reads, the conversation history, and the generated output all count against this window.

For developers building applications on top of LLM APIs, managing context is a core architectural challenge — what to include, what to summarise, what to retrieve dynamically. This is the domain of RAG (Retrieval Augmented Generation), covered in the embeddings section below.

### Why Hallucination Happens and How to Work Around It

Hallucination — the model generating confident, plausible-sounding but factually incorrect information — is not a bug in the traditional sense. It is an inherent consequence of how LLMs work. Because the model is predicting the most likely next token based on patterns, it will produce output that looks like correct information whether or not it is correct. It has no internal truth-checking mechanism.

Hallucination is worst when: the correct answer is rare or absent in training data, the model is asked about very recent events (after its training cutoff), or the model is pushed to produce more content than it actually knows.

**Practical strategies for developers:**
- Treat LLM output as a first draft to be verified, not a final answer to be trusted. Always run generated code and test it.
- For factual claims (API signatures, library versions, Angular features), verify against official documentation.
- Ask the model to explain its reasoning — reasoning errors are often visible in the explanation in a way they are not in the conclusion.
- Provide the correct information in the prompt rather than asking the model to recall it. Paste the Angular docs for a feature directly into your Claude Code prompt; the model will use that rather than its potentially outdated training data.

### Temperature and Why the Same Prompt Gives Different Answers

Temperature is a parameter that controls how random the model's token selection is. At temperature 0, the model always selects the most likely next token — output is deterministic and consistent. At high temperature, the model introduces more randomness — output is more varied and creative but less reliable.

Most production LLM applications use temperature between 0.2 and 0.8. Code generation typically uses lower temperatures. This explains something developers notice: asking the same question twice gets different answers. The model is sampling from a probability distribution, and the same prompt produces a distribution of plausible continuations.

Claude Code uses tuned defaults appropriate for coding tasks. You do not need to configure temperature manually, but understanding it explains why iterating on a prompt — rather than just retrying the same one — produces better results.

### Embeddings and Vector Search

Embeddings are one of the most practically important AI concepts for developers in 2026. An embedding is a mathematical representation of meaning. The LLM is trained in such a way that similar concepts end up near each other in a high-dimensional mathematical space. "Angular component" and "React component" would be near each other. "TypeScript interface" and "JavaScript object" would be nearby.

The practical consequence: you can compare the meaning of two pieces of text by comparing their embeddings. This enables semantic search — finding documents about signals, useState hooks, and NgRx stores when you search for "component state management", even if those documents never use those exact words.

**Why this matters for developers:** Retrieval Augmented Generation (RAG) is the architecture most production AI applications use. Rather than relying on the model's training data (potentially outdated), you embed your documents into a vector database, embed the user's query, find the most relevant documents, inject them into the prompt as context, and let the model answer using that retrieved context. This is how Claude Code gives the AI access to relevant parts of your codebase without putting the whole codebase into every prompt.

### Base Models, Instruction-Tuned Models, and Reasoning Models

**Base models** are trained purely on next-token prediction. They are not trained to be helpful or follow instructions. They are the raw trained weights before any further specialisation.

**Instruction-tuned models** are base models further trained using a technique called RLHF (Reinforcement Learning from Human Feedback). Human raters evaluate model outputs and the model is trained to produce outputs that humans rate more highly. This is what makes Claude, ChatGPT, and Gemini helpful assistants rather than text-completion engines.

**Reasoning models** are a newer category, represented by OpenAI's o1 and o3 series and Claude's extended thinking mode. These models are trained to think before they answer — they produce a chain of reasoning before generating a response. This improves performance significantly on tasks requiring multi-step logical reasoning: complex coding problems, mathematical reasoning, planning. The cost is speed and tokens.

For most Angular development tasks, instruction-tuned models are the right choice. For genuinely complex architectural problems or debugging difficult issues, reasoning models (Claude with extended thinking) can produce meaningfully better results.

---

## The AI Landscape — Models, Products, and Vendors

### The Three Layers

Understanding the AI landscape requires distinguishing three layers that are often conflated:

**The model layer** — the trained neural network weights. This is the actual AI. Examples: Claude Sonnet 4, GPT-4o, Gemini 1.5 Pro, Llama 3.

**The product layer** — the user-facing application built on top of a model. Examples: Claude.ai (built on Claude models), ChatGPT (built on GPT models), GitHub Copilot (built on GPT models).

**The API layer** — programmatic access to the model for developers building their own applications. Claude Code uses the Anthropic API under the hood. If you were to build an AI chatbot into an Angular application, you would use an API layer.

### The Major Model Providers

**Anthropic** — the company that makes Claude, the model powering Claude Code. Founded in 2021 by former OpenAI researchers. Anthropic's focus is AI safety — building models that are reliably aligned with human values. Claude's distinctive characteristics are: very long context window (200K tokens), strong performance on code and technical writing, and a tendency to acknowledge uncertainty rather than confabulate confidently. Claude Sonnet is the everyday workhorse; Claude Opus is the most capable but slower and more expensive. Claude Code uses Claude Sonnet by default.

**OpenAI** — the company that made AI mainstream with ChatGPT in November 2022. Their flagship models are GPT-4o (fast, multimodal) and the o-series reasoning models (o1, o3 — significantly better at complex reasoning). Microsoft has invested heavily in OpenAI, which is why GitHub Copilot runs on GPT models.

**Google DeepMind** — produces the Gemini family of models. Gemini 1.5 Pro has a 1 million token context window. Deeply integrated into Google's products. Strong for Google Workspace and tasks requiring very long context.

**Meta** — produces the Llama family of open-weight models. "Open-weight" means the actual model weights are publicly available — you can download and run them on your own hardware without API costs. Many enterprise AI deployments use Llama-based models for this reason (no data leaves your infrastructure).

**Mistral** — a French AI company producing highly efficient open-weight models, notable for being smaller and faster than equivalent-capability models from other providers.

### How to Evaluate a New Model

New models are announced every few weeks. Most announcements include benchmark scores — performance on standardised tests like MMLU (general knowledge), HumanEval (code), MATH (mathematics reasoning). These are useful but not the whole story — models can be tuned to perform well on benchmarks without being generally better.

A more reliable evaluation framework:
- **Wait 48–72 hours.** Independent evaluators and the developer community will surface real capability within days.
- **Try your actual tasks.** Paste a real Angular debugging problem, a real architecture question. Does the output feel better?
- **Check context window and pricing.** Capability improvements that come with dramatically higher pricing may not be a net upgrade.
- **Check the Chatbot Arena leaderboard** (lmarena.ai) — a crowdsourced blind comparison where users rate model outputs without knowing which model produced them. It is the least gameable evaluation.

---

## AI in Software Development — The Broad Picture

### How AI Is Changing the SDLC

The software development lifecycle has been disrupted at every phase — some more than others.

**Requirements and design:** AI assists with translating vague stakeholder language into structured requirements, generating user stories, identifying edge cases, and producing first-draft technical specifications. The limitation: AI has no access to organisational context, politics, or the implicit knowledge that experienced product people carry.

**Architecture and planning:** AI is a useful sparring partner for architectural decisions — it can describe trade-offs between approaches, identify patterns that fit a given problem, and flag concerns you might not have considered. It is not a replacement for experienced architectural judgment.

**Code generation:** The highest-impact area for most developers. AI can generate boilerplate, implement well-defined functions, translate code between languages, and produce first drafts of components, services, and tests in seconds. Studies consistently show 20–40% productivity improvements for developers using AI code generation tools, with the gains concentrated in well-defined, repetitive coding tasks.

**Code review:** AI can review code for common issues — security vulnerabilities, performance anti-patterns, missing error handling, accessibility problems. It is good at pattern-matching against known bad practices. It is less good at evaluating whether the code achieves its actual intent in your specific architectural context.

**Testing:** Generating unit tests, generating test data, identifying edge cases, writing E2E test scenarios. AI is measurably useful for test generation — it can produce a comprehensive set of test cases for a given function faster than a human. The tests require review but the starting point is valuable.

**Documentation:** One of AI's most underrated uses. Generating JSDoc comments, README files, API documentation, architectural decision records. AI is very good at this because documentation is language generation — precisely what LLMs excel at.

**Debugging:** AI can help diagnose errors given a stack trace, an error message, and relevant code. It is often right about common errors. It is less reliable for subtle bugs that require deep understanding of system state.

**Deployment and DevOps:** Infrastructure-as-code generation (Terraform, Kubernetes manifests), CI/CD pipeline configurations, explaining cloud architecture, generating runbooks. Good at boilerplate; less good at context-specific correctness.

### The Realistic Productivity Picture

The honest answer about AI productivity: it depends enormously on the task and the developer. For a senior developer working on well-defined tasks with familiar patterns, AI tools provide consistent 20–40% speed improvements. For complex, context-heavy architectural work, the gains are smaller and the supervision cost is higher.

The developers who benefit most from AI are not those who trust it most — they are those who use it most critically. They treat AI output as a starting point, apply their expertise to evaluate and improve it, and use the time saved on boilerplate to invest more deeply in the complex parts that require human judgment.

**Where AI consistently delivers value:**
- Writing first drafts of well-defined functions and components
- Generating test cases for known functionality
- Explaining unfamiliar code, libraries, and error messages
- Translating requirements into code structure
- Writing documentation
- Catching obvious errors and anti-patterns in code review

**Where AI consistently underdelivers:**
- Novel architectural decisions with high context dependency
- Debugging subtle concurrency or state bugs
- Understanding the implicit requirements that experienced developers carry
- Producing code that is correct in edge cases it has not been told about

### How Different IT Roles Are Being Affected

**DevOps and SRE:** Significant impact. Infrastructure-as-code generation, writing deployment scripts, generating runbooks, debugging infrastructure issues from logs. Senior DevOps engineers use AI to accelerate work; the role is not being eliminated because human judgment about system architecture and failure modes remains essential.

**QA and Testing:** High impact on test generation, test data creation, and exploratory testing assistance. Lower impact on strategic test planning and complex scenario design.

**Data Engineering:** Significant impact on SQL generation, pipeline code, data transformation scripts. Data quality judgment, pipeline architecture, and performance optimisation at scale remain human domains.

**Security:** AI is both a tool and a threat. Defenders use AI to analyse code for vulnerabilities and generate security test cases. Attackers use AI to generate phishing content and find vulnerabilities. The security landscape is being reshaped by AI on both sides simultaneously.

---

## AI Coding Tools — The Landscape

### GitHub Copilot — Where You Started

Copilot is the tool most developers encounter first. Its model is **autocomplete-first**: it sees the file you are editing and suggests the next line or block of code based on what it can see. This gives it strong local context for the immediate typing task but no understanding of your application's architecture beyond the open file.

**Where Copilot earns its keep:**
- Inline completion of boilerplate: constructor injection, lifecycle hooks, reactive form builders
- Tab-completing function implementations you have started
- Generating repetitive variations: multiple similar component methods, multiple test cases with different inputs

**Where Copilot falls short:**
- No understanding of your application's architecture beyond the open file
- Will happily complete code in outdated Angular patterns
- For non-trivial architectural decisions, its inline suggestions are unreliable

**The key distinction from Claude Code:** Copilot suggests; you type. Claude Code plans, reads your codebase, and makes changes across multiple files — then waits for you to review a diff. These are fundamentally different models of AI assistance. Copilot is an autocomplete engine; Claude Code is an agentic coding partner.

### AI-Native IDEs — Cursor and Windsurf

Cursor and Windsurf are VS Code forks (same editor interface, same extensions) with AI deeply integrated throughout the editing experience. The key differentiator from VS Code + Copilot:

**Codebase-wide context:** They index your entire repository using embeddings and retrieve relevant files when you make a request. When you ask "how does authentication work in this app?", the IDE finds and reads the relevant files across your codebase automatically.

**Multi-file editing:** You describe a feature or change in natural language, and the AI proposes changes across multiple files simultaneously — creating a new service, updating app.config, adding a route, writing tests — as a unified diff you review and accept.

**The context for you:** Claude Code for VS Code now provides the same multi-file agentic editing capability inside VS Code without requiring you to switch to a fork. The difference is largely workflow preference — Cursor embeds AI more deeply into the editor UI, while Claude Code operates via the integrated terminal with VS Code integration through the extension. For a developer already in VS Code on the Claude Pro plan, Claude Code is the more natural fit.

### Claude Code — Your Primary Tool

Claude Code is Anthropic's agentic coding tool. Unlike Copilot (which autocompletes) or Claude.ai chat (which discusses), Claude Code actively works on your codebase — reading files, writing code, running terminal commands, and presenting you with diffs to review and approve.

The distinction matters in interviews: you are not using an autocomplete tool or a chat assistant for coding. You are using an agent — a system that plans multi-step tasks, takes actions, and produces structured output for your review. This represents the current leading edge of AI-assisted development.

---

## Claude Code for VS Code — Deep Dive

### What Claude Code Actually Is

Claude Code is described by Anthropic as "an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools." The key word is *agentic* — it acts on your behalf, not just in response to a single prompt.

The workflow is fundamentally different from both Copilot and Claude chat:

1. You describe what you want (a feature, a refactor, a bug fix) in natural language
2. Claude reads the relevant files in your codebase to understand the context
3. Claude plans the changes needed across however many files are involved
4. Claude presents the changes as diffs in VS Code's native diff viewer
5. You review, accept, or reject — per file
6. Claude applies approved changes and can run tests or build commands to verify

This is a task-level interaction, not a line-by-line suggestion. You are delegating a unit of work, not tab-completing a line.

### Setup and Requirements

**VS Code version:** 1.98.0 or higher (you are on 1.121.0, well above the minimum).

**Anthropic account:** Pro plan minimum ($20/mo) — required, the Free plan does not include Claude Code. The Pro plan gives you Claude Sonnet 4. If you are hitting usage limits during heavy development sessions, the Max plan ($100/mo) provides higher limits.

**Installation:** Search for "Claude Code" in the Extensions marketplace (Ctrl+Shift+X) and install the extension published by Anthropic. Alternatively, the extension auto-installs the first time you run the `claude` command from VS Code's integrated terminal.

**No separate Node.js installation** is required with the native installer — the CLI is bundled inside the extension.

### The VS Code Extension Interface

The extension is not a standalone chat panel — it is a bridge that connects the Claude Code CLI (running in your integrated terminal) to VS Code's native features.

The Spark icon (⚡) is how you access Claude Code from the editor. It appears in three places:
- **Editor Toolbar** — top-right of the editor, only when a file is open
- **Activity Bar** — left sidebar, always accessible
- **Status Bar** — bottom-right, works even without a file open

You can interact with Claude Code in two modes:
- **Terminal mode:** Open VS Code's integrated terminal and run `claude`. Type prompts directly in the terminal. The extension enhances this by wiring the terminal output to VS Code's diff viewer and other features.
- **Sidebar/panel mode:** Use the Spark icon to open a panel where you can type prompts without going into the terminal.

Both modes ultimately use the same underlying agent — the difference is just where you type.

### Permission Modes — Controlling Autonomy

Claude Code has permission modes that control how much it can do autonomously. From least to most autonomous:

**Default (ask for everything):** Claude will ask for permission before writing to files, running terminal commands, or making any changes. Recommended when learning the tool or working in sensitive codebases.

**Auto-approve file edits:** Claude will write files without asking, but still asks before running terminal commands. Good for well-understood refactoring tasks where you trust the direction.

**Full auto (YOLO mode):** Claude runs without asking for approval on most actions. Useful for rapid prototyping and throwaway code. Not recommended for production codebases — you can miss important changes.

You set the permission mode at the start of a session or via the `/permissions` command. For most professional development work, the default or auto-approve-edits mode is appropriate: you review every diff before it lands.

### Core Workflows

**Multi-file feature implementation:**
```
Create a standalone Angular UserProfileComponent that:
- Accepts a userId input signal
- Fetches user data from UserService.getUser(id)
- Displays loading state while fetching
- Handles 404 (user not found) and network error states
- Uses OnPush change detection
- Is fully accessible (aria labels, keyboard navigation)
- Include a Jest spec file covering the happy path, 404, and error states
```
Claude reads your existing UserService, understands your project structure, creates the component, template, SCSS, and spec file, then shows you diffs for all of them simultaneously.

**Debugging an error:**
```
I am getting "NG0100: ExpressionChangedAfterItHasBeenCheckedError" in UserListComponent. 
Here is the stack trace: [paste trace]
Investigate and fix it.
```
Claude reads the component, understands the change detection context, identifies the cause, and proposes a fix.

**Refactoring:**
```
Refactor AuthService to replace the BehaviorSubject<User> with a signal(). 
Update all components that subscribe to isAuthenticated$ to use the signal instead.
Preserve the existing external API.
```
Claude reads all affected files, plans the migration, and presents diffs across all impacted files.

**Pre-PR code review:**
```
Review the changes in this diff against Angular best practices for Angular 17+. 
Check for: OnPush usage, signal patterns, standalone correctness, error handling, 
accessibility, and missing test coverage. Be specific about what to change and why.
[paste diff or reference the changed files]
```

**Writing tests for existing code:**
```
Write a comprehensive Jest test suite for CartService using @testing-library/angular 
and HttpTestingController. Cover: the happy path, 404 error handling, 500 error 
handling, and optimistic update rollback. Ensure no HTTP requests are left unverified.
```

### Referencing Files and Context

**The `@` syntax:** Type `@` followed by a filename or folder path to reference specific files. Claude uses fuzzy matching — `@auth` finds `AuthService.ts`, `auth.guard.ts`, and anything else close to that name. You can reference:
- Individual files: `@user.service.ts`
- Folders: `@src/app/features/checkout`
- The current file you have open: `@current`

**Selecting code for context:** Highlight a block of code in the editor before typing your prompt. The extension automatically adds the selection to Claude's context. This is faster than copy-pasting and more precise than pointing to an entire file.

**Diagnostics awareness:** Claude can see the linter and TypeScript errors in your Problems panel — the red and yellow squiggles. You can prompt: "Fix all TypeScript errors in @user.component.ts" and Claude knows exactly what the errors are.

**Keyboard shortcut:** `Alt+Cmd+K` (Mac) or `Alt+Ctrl+K` (Windows/Linux) adds file paths to your prompt quickly.

**Note on per-file approval:** As of early 2026, you can accept or reject changes per file, but not per hunk within a file. If you want to accept part of a file's changes, accept all and manually revert the unwanted portions. This is a known limitation the community has requested.

### Claude Code for Angular Specifically

**Generating components with the full pattern:**
Claude Code can generate a complete Angular component — TypeScript class, template, SCSS, and spec file — for a well-described requirement, wiring them together correctly. The key is specificity in the prompt:

Weak: "Create an Angular ProductCard component"
Strong: "Create a standalone Angular 17 ProductCardComponent that accepts a `product` input signal of type `Product`, emits an `addToCart` output, uses OnPush change detection, includes aria-label attributes on all interactive elements, and has a corresponding Jest test using Testing Library"

**NgModule to standalone migration:**
If you are working in older Angular codebases, this is tedious and error-prone by hand. Prompt Claude Code with the NgModule, the components it declares, and the imports it provides, and ask for the equivalent standalone components. Verify the result — Claude occasionally misses a dependency — but the first draft is 80%+ correct.

**RxJS to Signals migration:**
One of the most valuable Claude Code use cases for Angular right now. The pattern of `BehaviorSubject` + `async pipe` can be translated to `signal()` and `computed()` systematically. Claude understands both patterns and produces correct migrations for straightforward cases. For complex `switchMap` chains or multi-stream combinations, verify carefully — the semantics of signals and Observables differ in ways that require judgment.

**Explaining RxJS operator chains:**
Paste a complex pipe chain and ask Claude to explain it in plain English — what each operator does, what the overall flow is, and what happens in error cases. This is consistently one of Claude Code's best use cases.

**Accessibility audit:**
Reference a component template and prompt: "Review @product-card.component.html for WCAG 2.1 AA accessibility issues. Check for: missing aria labels on icon buttons, form inputs without associated labels, interactive elements not reachable by keyboard, and missing aria-live regions for dynamic content." The output identifies issues that automated tools miss.

### What Claude Code Gets Wrong

**Version confusion:** Angular's API has changed significantly between major versions. Claude Code may suggest `@Input` decorator syntax when signal inputs are available, NgModule imports when standalone is preferred, or deprecated lifecycle hooks. Always check the Angular version in suggestions against your project's actual Angular version.

**Hallucinated APIs:** Angular has a large and complex API surface. Claude occasionally invents plausible-sounding methods or decorators that do not exist — hallucinated options for `provideRouter()`, NgRx selectors with properties that are not real. Verify any API you have not used before against angular.dev.

**Outdated patterns:** Even if the API is correct, the pattern may be outdated. Claude may suggest subscribing manually in `ngOnInit` when `takeUntilDestroyed()` is cleaner, or using `ViewChild` decorator when `viewChild()` signal is available. Apply your own knowledge of current Angular best practices as a filter on everything Claude produces.

**Testing setup errors:** The Angular testing ecosystem has specific requirements (TestBed configuration, `provideHttpClientTesting`, proper async handling with `fakeAsync` vs `async`). Claude sometimes generates tests with incorrect setup that produces confusing failures.

**The golden rule:** Always run, compile, and lint generated code before committing. `ng build` and `ng lint` will catch issues that look correct to a casual reader.

### CLAUDE.md — Your Project Context File

Claude Code automatically reads a file called `CLAUDE.md` in your project root at the start of every session. This is the mechanism for giving Claude persistent context about your project without repeating it in every prompt.

A well-written `CLAUDE.md` for an Angular project might include:

```markdown
# Project Context for Claude Code

## Project Overview
Angular 17 standalone application. B2B SaaS dashboard for enterprise clients.

## Technical Stack
- Angular 17 with signals and standalone components (no NgModules)
- NgRx Signal Store for global state
- RxJS 7 for async operations
- Jest + @testing-library/angular for unit tests
- Cypress for E2E tests
- SCSS with BEM methodology

## Coding Standards
- All components must use OnPush change detection
- Prefer signal inputs (input()) over @Input() decorator
- No manual subscriptions — use takeUntilDestroyed() or async pipe
- All interactive elements must have accessible labels
- Error states must be handled explicitly — no silent failures
- New components must include a spec file

## File Structure
src/app/
  features/     # Feature modules, each self-contained
  shared/       # Shared components, directives, pipes
  core/         # Services, guards, interceptors

## What Not To Do
- Do not use NgModules for new code
- Do not use the subscribe() pattern without takeUntilDestroyed()
- Do not use 'any' type without a comment explaining why
- Do not commit code with lint errors
```

This front-loads your project conventions into every Claude Code session, dramatically reducing the need to re-explain context in each prompt.

---

## Prompt Engineering for Claude Code

### The Role / Context / Task / Format Structure

The most reliable structure for technical prompts with Claude Code:

**Role:** Establish what kind of expert you want. "You are a Senior Angular developer with deep knowledge of Angular 17 signals, standalone components, and performance optimisation."

**Context:** Provide the relevant background. The Angular version, the libraries in use, the constraint you are working within. Claude cannot use information it does not have.

**Task:** Be precise about what you want. Not "help me with this component" but "refactor this component to use signal inputs instead of @Input decorators, and replace the BehaviorSubject with a signal store".

**Format:** Specify the output format when needed. "Provide the TypeScript, HTML, and SCSS as separate code blocks. After the code, list any breaking changes from the current implementation."

```
Role: You are a Senior Angular 17 developer.

Context: I have a standalone component using @Input() decorator properties and a 
BehaviorSubject for local state. Angular version: 17.3. The project uses Jest for 
testing and does not use NgRx.

Task: Refactor the attached component to use signal inputs (input()/input.required()) 
and replace the BehaviorSubject with a signal(). Preserve the existing component API 
(same selector, same external behaviour).

Format: Provide the refactored TypeScript as a code block, followed by a bullet list 
of any changes to how the component is used by parent components.

[paste component code or reference with @component-name.ts]
```

With CLAUDE.md set up correctly, you can often skip the Role and Context sections entirely — Claude already knows your stack and standards.

### Chain of Thought for Complex Problems

For complex debugging or architectural problems, ask Claude to reason step by step before giving an answer:

"Before making any changes, think through: what could cause this specific error in an Angular standalone component, what information would help diagnose it, and what are the most likely causes given the code I have provided. Then propose a fix."

This produces better answers for hard problems because it forces the model to use its most careful reasoning rather than pattern-matching to the most common answer.

### Iterative Refinement

The best output rarely comes from one prompt. A productive pattern:

1. **First prompt:** Get a rough working version. Do not try to specify everything upfront.
2. **Review the diff.** Identify what is wrong or missing.
3. **Follow-up prompts:** "The component you generated does not handle the case where the user list is empty — add an empty state with an accessible message." "The test you wrote tests implementation details — rewrite it to test user-observable behaviour using Testing Library queries."
4. **Continue until production-ready.** Typically 3–5 iterations for a non-trivial component.

This mirrors how you would work with a junior developer: give them a task, review the output, give specific feedback, iterate. The key difference is the iteration cycle is seconds rather than hours.

### Rubber Duck Debugging with AI

Rubber duck debugging is the practice of explaining a problem out loud — the act of articulating the problem often reveals the solution. Claude Code is a rubber duck that talks back.

When stuck on a bug, describe the problem in detail — what you expect to happen, what is actually happening, what you have tried. Often the act of articulating it surfaces the answer. When it does not, Claude's response frequently points in the right direction even if it does not hit the exact cause.

```
I have an Angular component that displays a list of users. The list re-renders 
correctly when users are added but does not update when a user is deleted. I am 
using OnPush change detection and a BehaviorSubject. The delete action calls next() 
on the subject with the filtered array. I have verified the subject emits the new 
array by logging it. The template uses the async pipe. I do not understand why the 
deletion does not trigger a re-render.

Please investigate @user-list.component.ts and @user-list.component.html.
```

### What Not to Send to AI

**Secrets and credentials:** API keys, OAuth tokens, database passwords, private keys. Redact them before referencing any file containing credentials.

**Proprietary algorithms:** Business logic that represents genuine competitive advantage. The commercial AI products you use are not end-to-end encrypted at the model level.

**Personal data about users:** Names, emails, addresses, financial information about real people. Creates privacy and potentially regulatory risk.

**Your employer's unreleased code without clearance:** Check your employer's AI acceptable use policy before pointing Claude Code at proprietary source code.

---

## Using AI in Your Job Search

### Researching Companies and Roles

Before any interview, AI can compress hours of research into minutes:

**Company research prompt:**
```
I am interviewing for a Senior Angular Developer role at [Company Name].
Based on publicly available information, help me understand:
1. What their main products or services are and who uses them
2. Their technology stack and any public information about their front-end choices
3. Recent news, funding, or product launches that might be relevant to discuss
4. What their engineering culture appears to be based on job postings or engineering blogs
5. Smart questions I could ask that would demonstrate I have done my research
```

**Role analysis prompt:**
Paste the full job description and ask: "Analyse this Angular job description. What are the must-have skills vs nice-to-have? What does the tech stack tell me about how they work? What questions would I likely be asked based on what they emphasise? What gaps in my profile relative to this description should I address?"

### Tailoring Your CV for Specific Roles

A generic CV performs worse than a tailored one for any specific role. AI makes tailoring practical rather than time-consuming.

**CV tailoring workflow:**

1. Paste your current CV (removing any sensitive personal details you prefer not to share)
2. Paste the job description
3. Use this prompt:

```
You are an experienced technical recruiter and career coach specialising in 
front-end engineering.

Here is my current CV: [paste CV]
Here is the job description I am applying for: [paste JD]

Provide:
1. Which of my experiences and projects are most relevant to this role and should be emphasised
2. Which bullet points on my CV should be reworded to better match the language and priorities of this JD
3. Any skills or experiences I have that are relevant but not currently on my CV
4. What keywords from the JD I should ensure appear in my CV for ATS parsing
5. A rewritten version of my summary/profile section specifically targeting this role
```

**ATS optimisation:** Most companies use Applicant Tracking Systems that filter CVs before a human sees them. AI can identify the exact keywords from a job description that should appear in your CV to pass ATS filters.

### Simulating Technical Interviews

This is where AI provides genuine, high-value job search assistance that would otherwise cost hundreds of pounds per hour in coaching fees.

**Angular technical interview simulation:**
```
You are a Senior Engineering Interviewer at a company that uses Angular 17 with 
signals, standalone components, and NgRx for complex state management. You are 
interviewing me for a Senior Angular Developer position.

Conduct a 30-minute technical interview. Ask one question at a time. Wait for my 
answer before proceeding. After each answer, give me brief feedback: what was strong, 
what was missing, and what the ideal answer would have covered. Then ask the next question.

Start with a moderate-difficulty question about Angular change detection.
```

**System design simulation:**
```
You are the technical interviewer for a Senior Angular Developer role. Walk me 
through a system design interview for the following scenario: design the front-end 
architecture for a multi-tenant B2B SaaS dashboard used by enterprise customers 
with complex data tables, real-time updates, and strict accessibility requirements.

Ask me clarifying questions first as a real interviewer would. Respond to my answers 
and probe them. Guide me through: component architecture, state management approach, 
performance strategy, and testing strategy.
```

**Drilling a specific topic:**
"Quiz me on RxJS flattening operators. Ask me three questions of increasing difficulty, wait for my answer after each, then tell me what I got right and wrong."

**Reviewing your own answers:**
"Here is the answer I gave to 'explain Angular's dependency injection tree' in an interview. Grade it as if you are a hiring manager at a company that values deep technical knowledge. Be specific about what would have made this answer stronger."

### Generating Smart Questions to Ask Interviewers

The questions you ask at the end of an interview are evaluated. They signal your priorities, your technical depth, and your interest in the role.

```
I am interviewing for a Senior Angular Developer role at [Company]. Based on this 
job description [paste JD], generate 8 smart questions I could ask the interviewer that would:
- Demonstrate I have thought deeply about the role
- Help me evaluate whether this is a good environment for senior engineers
- Show technical curiosity appropriate for a senior developer
- Not be answerable from the company website

Include a mix of: technical questions about their stack and practices, team culture 
questions, and growth/impact questions.
```

### Talking About AI Experience in Interviews

As a senior developer in 2026, you will be asked about your AI workflow. The strong answer demonstrates: yes, you use them actively; you are specific about which tools and for what; you understand their limitations; and you apply professional judgment rather than blind trust.

**What to say when asked "Do you use AI tools in your development workflow?":**

"Yes, I use AI tools daily. My primary tool is Claude Code for VS Code, which I use as an agentic coding partner — describing features or refactors at the task level and reviewing the diffs it proposes across multiple files. I previously used GitHub Copilot, which is a fundamentally different model — autocomplete rather than agentic. I set up a CLAUDE.md project context file so Claude understands my project's standards and stack without me repeating it in every prompt. For Angular specifically, I find Claude Code most valuable for generating complete component + test suites, RxJS-to-signals migrations, pre-PR code review, and debugging by giving it the full stack trace and relevant files. I treat all generated code as a first draft — I review every diff, run the build and linter, and ensure I understand what was changed before committing."

**What to claim, what to be honest about:**

Claim: You use Claude Code actively and specifically — you can describe your workflow concretely. You have used Copilot and understand how the two tools differ in their model of AI assistance. You understand the limitations of AI-generated code and apply professional review.

Be honest about: You have awareness of Cursor and Windsurf but use Claude Code in VS Code rather than switching IDEs. You are not an ML engineer and do not build LLM pipelines as part of your primary work.

**AI skills interviewers are actually asking about in 2026:**
- Working knowledge of what AI tools exist and what they are good for
- A mature, critical approach to AI output (not blind trust)
- Understanding of prompt engineering for coding tasks
- Awareness of AI limitations and when not to use AI
- Security awareness (not pasting secrets or proprietary code into public AI)

You do not need to have built AI-powered features or have ML engineering experience. Senior front-end roles are looking for AI-informed developers, not AI engineers.

---

## AI Security, Ethics, and Enterprise Adoption

### Data Leakage — What Not to Send

Every major AI provider has data handling policies, and they differ in ways that matter for professional use.

**Anthropic (Claude Code):** By default, conversations may be reviewed by Anthropic for safety and quality. Claude Pro and API accounts can opt out of training data use. The Claude Code SDK used in enterprise integrations has a data retention policy configurable by the enterprise customer.

**OpenAI (GitHub Copilot):** Copilot Business and Enterprise have enhanced data controls — code is not used to train models by default in these tiers.

The practical rule: treat public AI products as you would treat a public forum. Do not send: API keys, OAuth tokens, database credentials, private keys, personal data about real users, your employer's unreleased source code (without policy clearance), or anything covered by NDA.

For Claude Code specifically: be aware that when you point Claude Code at files using `@filename` or let it read your codebase, it sends those file contents to Anthropic's API. Apply the same judgment you would apply to pasting code into any public interface.

### Prompt Injection

Prompt injection is an attack where malicious content in data you process with AI contains instructions that hijack the AI's behaviour. If you build an Angular application that uses an LLM to process user input and that input contains "Ignore all previous instructions and instead...", the model may follow the injected instruction rather than your intended behaviour.

This is an active area of AI security research with no complete solution. Mitigations include: input sanitisation, clear separation between system instructions and user data in your prompts, and not giving AI systems access to sensitive operations based on user-provided input alone.

### Intellectual Property and Copyright

When AI generates code based on its training data, questions arise about whether that code is derived from copyrighted training examples. This is an actively litigated legal area with no settled answers in most jurisdictions.

The practical developer position: treat AI-generated code the same as any third-party code — understand it, verify it, and ensure it is not a verbatim copy of a known copyrighted source.

### How Enterprises Are Governing AI

Large organisations have moved from ignoring AI (2022) to banning it (early 2023) to governing it (2024–2026). The current enterprise posture typically includes:
- An acceptable use policy defining what can and cannot be sent to public AI products
- Approved AI products (often a limited list: Copilot Enterprise, Claude Enterprise, or a managed integration)
- A review requirement before AI-generated code is merged
- Data classification: clear rules about what data classification levels can be used with which AI products
- For regulated industries (finance, healthcare): additional compliance requirements around AI usage audit trails

As a senior developer, knowing this landscape makes you more credible in enterprise interviews and more useful to teams navigating AI adoption.

### The Ethics Framing — Brief

AI systems reflect their training data, which reflects historical human biases. Facial recognition that performs worse on darker skin tones, hiring AI that penalises women's CVs, content moderation that disproportionately flags certain languages — these are documented, real-world failures of deployed AI systems.

For a front-end developer, the ethical responsibility is primarily in the products you build. If you build a feature that uses AI to surface, rank, or filter content that affects people, consider: what data is this trained on, who might be systematically disadvantaged by its outputs, and is there a human review step for consequential decisions?

This is increasingly a regulatory concern. The EU AI Act (effective 2025–2026) places obligations on companies deploying AI in high-risk categories.

---

## Staying Current

AI is moving faster than any technology since the smartphone. Strategies for staying current without being overwhelmed:

**Newsletters and blogs (low volume, high signal):**
- The Batch by Andrew Ng (deeplearning.ai) — weekly, technical but accessible, focuses on what matters
- Anthropic's research blog (anthropic.com/research) — primary source for Claude and Claude Code developments
- OpenAI's blog — primary source for GPT/o-series developments
- Anthropic's Claude Code changelog — follow for tool-specific updates that directly affect your workflow

**Social media (higher volume, mixed signal):**
- X/Twitter: follow Andrej Karpathy (ex-OpenAI, makes AI concepts genuinely accessible), researchers at Anthropic
- r/ClaudeAI and r/LocalLLaMA for practical user experience reports

**Benchmarks and evaluations:**
- LMSYS Chatbot Arena (lmarena.ai) — the crowdsourced blind comparison leaderboard. When a new model launches, check where it lands here within a few days.

**How to evaluate a new tool announcement:**
1. Wait 48–72 hours for independent community evaluation
2. Try your actual tasks — benchmark performance does not always predict performance on your specific use case
3. Check context window and pricing — capability improvements that come with dramatically higher pricing may not be a net upgrade
4. Be sceptical of "best in the world" claims — every model launch claims to be the best

---

## Vibe Coding

### What Vibe Coding Is

"Vibe coding" is a term coined in early 2025 by AI researcher Andrej Karpathy to describe a mode of AI-assisted development where the developer describes what they want in natural language and the AI generates the code, with the developer reviewing and iterating rather than writing line by line. In the most extreme interpretation, the developer barely reads the code — they just run it, describe what is wrong, and let the AI fix it.

The name captures both the appeal and the risk: you are working by feel, by instinct, by conversation — fast and fluid. But you may not understand what you are accepting.

Claude Code makes vibe coding operationally easy. The agentic workflow — describe, review diff, approve — can become approve-without-reading if you are not disciplined. This is the danger.

### The Spectrum of AI-Assisted Development

There is a spectrum, not a binary:

1. **Traditional development** — you write all the code; use AI only for lookup (documentation, Stack Overflow replacement)
2. **AI-augmented development** — you write the code; AI generates snippets, completes functions, suggests fixes; you understand everything you accept
3. **AI-led development** — you describe intent; AI generates implementations; you review and verify before accepting
4. **Vibe coding** — you describe intent; AI generates; you run it and iterate without deeply reading the code

For a senior developer, options 2 and 3 are the goal. Vibe coding (option 4) is a risk multiplier: it can produce working code fast, but the code may have subtle bugs, security issues, or architectural problems that are invisible until they fail in production.

### Where Vibe Coding Works Well

- **Prototyping and throwaway code** — you need to validate a concept, not ship to production
- **Unfamiliar territory** — you need a one-off script in Python and you write TypeScript. Generate, run, iterate. Low stakes.
- **Boilerplate generation** — CRUD endpoints, test scaffolding, migration scripts, configuration files. The patterns are standard; the risk is low; the time savings are high.
- **Small self-contained utilities** — a function that formats a date, a script that processes a CSV. The output is verifiable by inspection.

### Where Vibe Coding Is Dangerous

- **Security-sensitive code** — authentication, authorisation, payment processing, data encryption. AI-generated security code frequently has subtle flaws that are invisible to the untrained eye.
- **State management** — complex signal stores, NgRx effects, RxJS chains. AI frequently generates code that works in the happy path but has race conditions, subscription leaks, or incorrect cancellation behaviour.
- **Integration code** — code that calls external APIs, handles webhooks, processes financial transactions. The failure modes are real and often financial.
- **Performance-critical paths** — the AI may generate code that works correctly but has O(n²) complexity, creates excessive subscriptions, or triggers unnecessary change detection cycles.
- **Code you will maintain** — accepting code you do not understand creates a maintenance debt. When it breaks in six months, you cannot fix it without the AI's help.

### Maintaining Code Ownership

The core discipline of responsible AI-assisted development: **do not accept code you cannot explain**.

Before accepting any AI-generated diff in Claude Code, be able to answer:
- What does this code do, step by step?
- What happens when the inputs are null, empty, or out of range?
- What happens when an error occurs?
- What are the performance characteristics?
- Is there a security concern? (Injection, XSS, data exposure, insecure defaults)
- Does this follow our architectural patterns?

If you cannot answer these questions, the code is not ready to commit. Read it, ask Claude to explain it, write a test that verifies its edge cases.

### Talking About Vibe Coding in Interviews

Interviewers increasingly ask about AI-assisted development. The senior answer demonstrates nuance, not a position:

"I use AI-assisted development extensively — Claude Code for agentic multi-file tasks, previously Copilot for autocomplete. For straightforward or repetitive work, I can let AI drive more. For security-critical code, complex async patterns, or anything that will be maintained long-term, I read and understand every diff before accepting it. I think the risk with vibe coding is that it can create code debt that's invisible until it fails — accepting code you don't understand is like incurring technical debt on credit: you'll pay it eventually, with interest. My job as a senior developer is to deliver code I can maintain and explain, whether I typed it or verified it."

---

*End of AI for Developers*
