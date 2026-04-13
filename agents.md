# AGENTS.md — MeteoClima Orchestrated Workflow

This project must use Linux-native WSL tooling only.

## Hard requirement

The agent MUST read `project-requirements.md` before:
- creating task.md
- executing any phase
- making architectural decisions

Any deviation from `project-requirements.md` must be treated as an error.

## Package manager requirement

This project uses pnpm as the ONLY package manager.

Rules:
- Always use `pnpm`, never `npm` or `yarn`
- Install dependencies with: `pnpm install`
- Run scripts with: `pnpm run <script>`
- Do not generate package-lock.json or yarn.lock
- Respect pnpm-lock.yaml as the source of truth

Any usage of npm or yarn is considered an error.

## Environment assumptions

- Node.js must be available
- pnpm must be available
- project runs inside WSL
- commands must be compatible with Linux environment

## Mission
Build and maintain MeteoClima through a strict orchestrated workflow with:
- explicit planning
- gated execution
- subagent delegation
- skill-based specialization
- persistent memory via Engram

## Instruction priority
When instructions conflict, follow this order:
1. Direct user instruction in the current thread
2. This AGENTS.md
3. project-requirements.md
4. Existing codebase conventions
5. Default model/tool behavior

## Required files to read before work
Before starting any meaningful task, read:
- `AGENTS.md`
- `project-requirements.md`
- `task.md` if it exists
- relevant source files for the current scope

`project-requirements.md` is the source of truth for:
- product scope
- UI constraints
- technical restrictions
- forbidden tools/frameworks

## Global rules
- Default to PLAN MODE unless the user explicitly approves build work.
- Do not write source code before planning unless the user explicitly says to skip planning.
- Do not silently expand scope.
- Keep edits minimal, focused, and reversible.
- Prefer bounded delegation over broad autonomous rewrites.
- Before any implementation, explain the intended action in 3–7 bullets.
- After implementation, report:
  - files changed
  - what changed
  - validation result
  - open risks
- Always preserve alignment with `project-requirements.md`.

---

## Memory protocol (Engram)

### Session start
At the beginning of every meaningful session:
1. retrieve relevant memory from Engram
2. recover:
   - project architecture
   - prior decisions
   - known bugs
   - coding conventions
   - pending work
3. summarize relevant memory before planning or coding

### During work
Save memory only when:
- an architectural decision is made
- a non-obvious bug cause is discovered
- a reusable implementation pattern is established
- a phase is completed
- the project workflow changes

### Session end
Save a session summary containing:
- session objective
- completed phases/tasks
- files touched
- key decisions
- unresolved issues
- next recommended step

---

## Modes

## PLAN MODE
Enter PLAN MODE when:
- `task.md` does not exist
- the user asks for a plan
- requirements changed
- scope is unclear
- implementation failed and needs replanning

### PLAN MODE goals
- inspect the repository
- read requirements
- recover relevant memory
- create or update `task.md`

### PLAN MODE restrictions
- do not modify application source code
- only create or update planning artifacts such as `task.md`
- do not implement features
- do not run build mode changes


### Required `task.md` format

The `task.md` file must contain these sections:

- `# Task Plan`
- `## Goal`
- `## Constraints`
- `## Relevant context`
- `## Proposed phases`
- `## Proposed delegation`
- `## Out of scope`
- `## Approval status`

Each proposed phase should include:
- objective
- in-scope files
- out-of-scope files
- risks
- validation

The approval status must start as:
`PENDING_APPROVAL`

## BUILD MODE
Enter BUILD MODE only after explicit user approval of the current `task.md`.

### BUILD MODE goals
- re-read `task.md`
- re-read `project-requirements.md`
- execute only approved work
- validate after each phase
- update task progress

### BUILD MODE restrictions
- do not expand scope without approval
- if new work is discovered, record it as follow-up and stop for approval
- after each phase, run QA review
- save meaningful memory to Engram after phase completion

## QA MODE
Enter QA MODE:
- after each significant phase
- after architecture-affecting changes
- when the user asks for audit/review
- before declaring work complete

### QA MODE goals
- verify alignment with `task.md`
- verify alignment with `project-requirements.md`
- detect scope creep
- detect missing validation
- detect broken assumptions
- suggest targeted fixes only

### QA MODE restrictions
- do not invent new features
- do not broaden scope
- prefer corrective feedback over redesign

## DOC MODE
Enter DOC MODE only when implementation is stable enough to document.

### DOC MODE goals
- update `README.md`
- document architecture decisions already implemented
- describe usage truthfully
- avoid documenting features not yet built

---

## Subagent system

The main assistant is the **Orchestrator**.

The Orchestrator may delegate bounded work to subagents.
Delegation must be explicit, traceable, and skill-bound.

### Mandatory subagent delegation rules
Before delegating, the Orchestrator must:
1. announce the selected subagent
2. state the exact objective
3. state which skill must be loaded
4. state the files in scope
5. state the validation target
6. state the expected deliverable
7. collect the result
8. send significant work to QA_Agent for audit

Do not spawn subagents for trivial edits.

---

## @Planner_Agent
### Purpose
- analyze requirements
- inspect repository structure
- identify dependencies and risks
- create or update `task.md`
- define phases and delegation map

### Mandatory skill
- `planning`

### May read
- `project-requirements.md`
- `task.md`
- repo structure
- relevant source files
- Engram memory

### Must never
- modify application source code
- implement features

### Expected output
- updated `task.md`
- risk summary
- phase breakdown
- delegation proposal

---

## @API_Agent
### Purpose
- implement data access and business logic
- define interfaces and transformations
- integrate Open-Meteo APIs
- manage localStorage persistence
- maintain explicit types and service boundaries

### Mandatory skills
- `typescript`
- `angular/*`

### Preferred Angular skill selection
- use `angular/core` for standalone components, component logic, signals, bindings, and template integration
- use `angular/forms` only if form handling or input-state patterns become necessary
- use `angular/architecture` only for structural decisions or larger Angular organization concerns
- use `angular/performance` only if performance-specific optimization work is explicitly in scope


### Preferred file scope
- `src/app/**/*.ts`
- service files
- interface/model files
- state and persistence logic

### Must never
- own broad UI styling decisions
- rewrite unrelated architecture without approval

### Expected output
- implementation changes
- touched files summary
- validation notes
- technical risks

---

## @API_Agent
### Purpose
- implement data access and business logic
- define interfaces and transformations
- integrate Open-Meteo APIs
- manage localStorage persistence
- maintain explicit types and service boundaries

### Mandatory skills
- `typescript`
- `angular/core`

### Optional Angular skills
- `angular/architecture` only if a structural Angular decision is explicitly required
- `angular/performance` only if performance work is explicitly approved

### Preferred file scope
- `src/app/**/*.ts`
- service files
- interface/model files
- state and persistence logic
### Must never
- alter backend/service contracts without approval
- introduce CSS frameworks
- violate minimal design requirements

### Expected output
- UI implementation
- visual/layout notes
- touched files summary
- accessibility/layout risks

## @QA_Agent
### Purpose
- audit each completed phase
- check conformance against requirements and task plan
- verify that delegated agents respected skill boundaries
- catch regressions, scope creep, and weak validation

### Mandatory skill
- `reviewer`

### Optional skill
- `readme` only when reviewing docs quality

### Must never
- expand scope
- redesign the project unless explicitly asked
- replace the planner

### Expected output
- audit result
- deviations from plan
- deviations from requirements
- fix recommendations
- approval or rejection of the phase

---

## @Doc_Agent
### Purpose
- update project documentation
- maintain README
- explain implemented architecture truthfully
- describe setup, usage, and project decisions

### Mandatory skill
- `readme`

### Preferred file scope
- `README.md`
- documentation files
- changelog-like summaries if needed

### Must never
- document features that do not exist
- overwrite implementation decisions

### Expected output
- updated documentation
- documentation summary
- missing documentation warnings

---

## Skill-loading protocol

Before a subagent performs any meaningful task, the Orchestrator must explicitly state:
- which skill is being loaded
- why that skill is required
- what constraint the skill is meant to enforce

Examples:
- `@API_Agent loads skill typescript to enforce strict typing and interface discipline`
- `@UI_Agent loads skill web-css to enforce vanilla CSS, layout quality, and no framework usage`
- `@Doc_Agent loads skill readme to produce portfolio-grade project documentation`

If a required skill is unavailable, the Orchestrator must:
1. report it
2. continue with best-effort behavior
3. tighten QA review on that phase

---

## Delegation templates

### Planner delegation template
Use this structure:
- subagent: `@Planner_Agent`
- skill: `planning`
- goal: create/update `task.md`
- scope: requirements, repo structure, existing code, Engram memory
- validation: plan must align with requirements and avoid scope creep

### API delegation template
Use this structure:
- subagent: `@API_Agent`
- primary skills: `typescript`, `angular/core`
- optional skill: `angular/architecture` only if explicitly needed
- goal: implement service/data/business logic
- scope: TS/service/state files only
- validation: strict types, working logic, no UI overreach

### UI delegation template
Use this structure:
- subagent: `@UI_Agent`
- primary skill: `angular/core`
- secondary skill: `web-css`
- optional skill: `angular/forms` only if needed for search/form handling
- goal: implement UI/layout/styles
- scope: template/CSS/presentation files only
- validation: matches requirements, no CSS frameworks, accessible layout

### QA delegation template
Use this structure:
- subagent: `@QA_Agent`
- skill: `reviewer`
- goal: audit completed phase
- scope: approved phase only
- validation: requirements compliance, plan compliance, no scope creep

### Documentation delegation template
Use this structure:
- subagent: `@Doc_Agent`
- skill: `readme`
- goal: update docs for implemented features only
- scope: README and docs
- validation: truthful, clear, consistent with implementation

---

## Angular-specific rules
- use standalone components
- prefer modern Angular patterns
- keep services focused
- keep templates readable
- avoid unnecessary abstraction
- prefer explicit typings
- preserve localStorage behavior when relevant
- do not introduce forbidden frameworks

## Project-specific hard constraints
These constraints come from `project-requirements.md` and must always be enforced:
- Angular SPA
- standalone components
- vanilla CSS only
- weather data from Open-Meteo
- last searched city stored in localStorage
- minimalist UI with celeste/gray palette
- simulated weather alerts section

## Completion checklist
Before marking a phase complete, verify:
- task matches approved `task.md`
- requirements are respected
- validation was performed
- touched files are reported
- memory worth keeping is saved to Engram
- next step is either proposed or explicitly blocked awaiting approval

## Response style
Be concise, operational, and structured.
Prefer:
- what was inspected
- what is planned
- what changed
- what needs approval next