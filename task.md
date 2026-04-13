# Task Plan

## Goal
Build MeteoClima as a minimal Angular SPA that lets the user search for a city, fetch current weather data from Open-Meteo, display the required weather information and simulated alerts, and persist the last searched city in `localStorage`, while staying fully aligned with `project-requirements.md`.

## Status
- Phase 1: completed / approved
- Validation note: `pnpm run build` OK in WSL
- Phase 2: completed / approved
- Validation note: `pnpm run build` OK in WSL; UI reviewed manually in local execution; CSS size warning was non-blocking
- Phase 3: completed / approved
- Validation note: QA audit approved Phase 3 integration and behavior coverage

## Constraints
- The application must remain a single-page application built with Angular.
- The implementation must use Standalone Components.
- Styling must use pure CSS only.
- No CSS or UI frameworks may be introduced.
- Weather data must come only from Open-Meteo APIs:
  - Geocoding API
  - Weather API
- The application must support all required features from `project-requirements.md`:
  - search city by name
  - current weather conditions
  - minimum and maximum temperature
  - emoji-based weather icon
  - feels-like temperature
  - local time of the selected location
  - last searched city persisted in `localStorage`
  - simulated weather alerts section
- The UI must remain minimal and follow the required visual style:
  - centered main container
  - rounded borders
  - soft shadow
  - clear hierarchy
  - light blues, soft grays, black text
- Code quality must maintain strong typing, clean separation of concerns, and readable structure.
- No authentication, backend server, routing expansion, complex state libraries, or speculative features may be introduced.
- No work may expand scope beyond `project-requirements.md`.
- BUILD MODE may begin only after explicit user approval of this plan.

## Relevant context

### Repository context
- `/home/yorch/projects/apps/meteo-clima/src/app/app.ts` currently contains a minimal standalone root component with a simple title signal.
- `/home/yorch/projects/apps/meteo-clima/src/app/app.html` still contains the default Angular placeholder scaffold content.
- `/home/yorch/projects/apps/meteo-clima/src/app/app.css` is empty.
- `/home/yorch/projects/apps/meteo-clima/src/app/app.config.ts` contains only basic application providers.
- `/home/yorch/projects/apps/meteo-clima/src/main.ts` bootstraps the standalone root component.
- `/home/yorch/projects/apps/meteo-clima/src/app/app.spec.ts` exists and is expected to be scaffold-oriented until updated in implementation phases.
- `/home/yorch/projects/apps/meteo-clima/task.md` did not exist before this planning pass.

### Engram context
- No relevant prior memory was found for architecture decisions, previous work, known issues, or conventions.
- No prior project-specific implementation patterns were recovered.

### Workflow context
- `/home/yorch/projects/apps/meteo-clima/agents.md` defines the current assistant as the Orchestrator.
- `project-requirements.md` is the source of truth for scope, constraints, and success criteria.
- Planning must remain explicit, incremental, and minimal.
- This file is a planning artifact only and must not imply approval to implement.

## Proposed phases

### Phase 1 — Architecture and data-flow foundation
**Status**: completed / approved

#### 1.1 Define data responsibilities and component/service boundaries
- **Objective**: establish the minimum internal structure needed to support city search, weather retrieval, persistence, and view state without over-engineering.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.config.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` (new service/model/helper files only if strictly necessary)
- **Out-of-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.css`
  - `/home/yorch/projects/apps/meteo-clima/src/styles.css`
- **Risks**:
  - introducing unnecessary abstraction too early
  - mixing UI concerns with API and persistence concerns
  - creating boundaries that do not match the limited scope
- **Validation**:
  - confirm the proposed structure directly supports only the required features
  - confirm separation of concerns remains readable and minimal
  - confirm all decisions stay within Angular standalone patterns

#### 1.2 Define typed Open-Meteo integration shape
- **Objective**: define the typed input/output flow for geocoding lookup, weather retrieval, and transformed UI-ready weather state.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` (API, model, mapper, or helper files if needed)
- **Out-of-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.css`
- **Risks**:
  - mismatch between geocoding results and weather query inputs
  - unclear ownership of data transformation logic
  - local time handling errors caused by incorrect timezone assumptions
- **Validation**:
  - confirm each required field from `project-requirements.md` has a clear source in the data flow
  - confirm strong typing can cover API response mapping and derived view state
  - confirm the weather icon remains emoji-based and not dependent on external assets

#### 1.3 Define persistence and state restoration behavior
- **Objective**: define how the last searched city is stored, restored, and used on reload, strictly using `localStorage`.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` (persistence/helper files if needed)
- **Out-of-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.css`
- **Risks**:
  - undefined behavior when storage is empty or unavailable
  - unclear initial-load behavior
  - accidental scope expansion into complex state management
- **Validation**:
  - confirm persistence is limited to the last searched city only
  - confirm reload behavior remains aligned with the requirements
  - confirm no external state library is introduced

### Phase 2 — UI structure and presentation
**Status**: completed / approved

#### 2.1 Replace scaffold UI with MeteoClima layout structure
- **Objective**: define the final top-level layout for header, search section, main weather card, and alerts card.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts` (bindings only if required by the template)
- **Out-of-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.service.ts` unless required by approved architecture
  - `/home/yorch/projects/apps/meteo-clima/src/styles.css`
- **Risks**:
  - layout structure diverging from the required sections
  - embedding too much logic into the template
  - accidental introduction of non-required UI blocks
- **Validation**:
  - confirm the structure includes exactly the required UI sections
  - confirm the main weather card matches the required top/middle/bottom arrangement
  - confirm no extra views or navigation are introduced

#### 2.2 Define minimalist component styling
- **Objective**: define the component-level styling for spacing, container, cards, palette, typography hierarchy, and readable weather presentation.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.css`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html` (only if styling hooks require class alignment)
- **Out-of-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/styles.css` unless a minimal global reset is strictly necessary
  - any third-party style dependency
- **Risks**:
  - over-styling and visual clutter
  - weak contrast or hierarchy
  - divergence from the celeste/gray/black palette
- **Validation**:
  - confirm the styling remains minimal and consistent
  - confirm the required visual constraints are directly represented
  - confirm CSS remains vanilla and local to the component unless a minimal global rule is justified

#### 2.3 Define simulated weather alerts presentation
- **Objective**: define the alerts card as a clearly separate but visually consistent section with simulated content only.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.css`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts` (only if simple presentation data is required)
- **Out-of-scope files**:
  - real alerts API integration
  - backend logic
  - extra alert workflows or settings
- **Risks**:
  - making the alerts section appear dynamic or API-backed when it is only simulated
  - visual inconsistency with the main weather card
  - excessive complexity for a non-goal section
- **Validation**:
  - confirm the section is explicitly simulated in behavior/design intent
  - confirm visual separation without breaking overall consistency
  - confirm no external data dependency is introduced for alerts

### Phase 3 — Integration and validation alignment
**Status**: completed / approved

#### 3.1 Align UI bindings with approved data flow
- **Objective**: connect the planned UI structure to the typed weather, city, local-time, and persistence state.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` introduced in Phase 1
- **Out-of-scope files**:
  - unrelated Angular app structure changes
  - routing or multi-page expansion
- **Risks**:
  - inconsistent naming between state, template, and transformed data
  - missing graceful states for invalid or empty search flows
  - accidental coupling between template and raw API responses
- **Validation**:
  - confirm each displayed value maps to a defined typed state
  - confirm the template does not depend on raw transport structures
  - confirm required empty/error/loading behaviors are accounted for without adding new features

#### 3.2 Update validation coverage for the real application behavior
- **Objective**: replace scaffold-oriented test expectations with validations that reflect MeteoClima requirements.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/app.spec.ts`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` (test-adjacent helpers only if necessary)
- **Out-of-scope files**:
  - end-to-end frameworks
  - build pipeline changes
  - unrelated test infrastructure rewrites
- **Risks**:
  - stale scaffold tests creating false failures
  - overly broad tests that lock implementation unnecessarily
  - weak coverage of persistence and integration behavior
- **Validation**:
  - confirm tests reflect user-visible success criteria
  - confirm validation includes persistence, search flow, and weather rendering expectations
  - confirm test changes remain proportional to the project scope

#### 3.3 Final compliance audit before BUILD completion
- **Objective**: verify the implemented result matches `task.md`, `agents.md`, and `project-requirements.md` with no scope creep.
- **In-scope files**:
  - `/home/yorch/projects/apps/meteo-clima/task.md`
  - `/home/yorch/projects/apps/meteo-clima/project-requirements.md`
  - `/home/yorch/projects/apps/meteo-clima/agents.md`
  - all files touched during approved implementation phases
- **Out-of-scope files**:
  - new features not already approved in this plan
- **Risks**:
  - unnoticed requirement drift across phases
  - unreviewed extra files or helpers introduced during implementation
  - documentation or validation claims exceeding the actual implementation
- **Validation**:
  - confirm each success criterion is explicitly satisfied
  - confirm no forbidden frameworks or non-goal features were introduced
  - confirm final reporting includes changed files, validations, and open risks

## Proposed delegation

### Planning delegation
- **Subagent**: `@Planner_Agent`
- **Skill**: `planning`
- **Goal**: create and maintain `task.md` as the authoritative implementation plan
- **Scope**:
  - `/home/yorch/projects/apps/meteo-clima/agents.md`
  - `/home/yorch/projects/apps/meteo-clima/project-requirements.md`
  - `/home/yorch/projects/apps/meteo-clima/task.md`
  - repository structure and relevant source files
  - Engram memory relevant to architecture, prior work, known issues, and conventions
- **Validation target**: plan must remain aligned with requirements, incremental, and free of scope creep

### API/data delegation
- **Subagent**: `@API_Agent`
- **Skills**: `typescript`, `angular`
- **Goal**: implement typed business logic, Open-Meteo access, data transformations, and `localStorage` persistence
- **Scope**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts`
- **Validation target**: strict typing, clean logic boundaries, no UI overreach

### UI delegation
- **Subagent**: `@UI_Agent`
- **Skills**: `angular`, `web-css`
- **Goal**: implement template structure, visual hierarchy, and CSS styling for the required MeteoClima layout
- **Scope**:
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.html`
  - `/home/yorch/projects/apps/meteo-clima/src/app/**/*.css`
  - presentation-only bindings in `/home/yorch/projects/apps/meteo-clima/src/app/**/*.ts` when strictly necessary
- **Validation target**: minimal design, requirements compliance, no CSS frameworks, readable layout

### QA delegation
- **Subagent**: `@QA_Agent`
- **Skill**: `reviewer`
- **Goal**: audit each approved phase for compliance with requirements and plan
- **Scope**:
  - approved phase outputs only
  - `/home/yorch/projects/apps/meteo-clima/task.md`
  - `/home/yorch/projects/apps/meteo-clima/project-requirements.md`
- **Validation target**: detect scope creep, broken assumptions, weak validation, and requirement drift

### Documentation delegation
- **Subagent**: `@Doc_Agent`
- **Skill**: `readme`
- **Goal**: document implemented behavior truthfully after implementation is stable
- **Scope**:
  - `/home/yorch/projects/apps/meteo-clima/README.md`
  - relevant documentation files if needed
- **Validation target**: documentation must reflect only implemented and approved behavior

## Risks
- Scope creep beyond the requirements due to avoidable abstraction or extra features.
- Data-shape mismatch between geocoding, weather retrieval, local time, and UI state.
- Default scaffold artifacts causing incomplete replacement or stale assumptions.
- Over-designed UI that conflicts with the requested minimalist style.
- Persistence behavior becoming ambiguous on first load or invalid search cases.
- Validation quality drifting if tests and QA checks remain scaffold-oriented.

## Validation strategy
- Re-read `project-requirements.md` before each implementation phase.
- Re-read `task.md` before each implementation phase.
- Keep phase boundaries explicit and narrow.
- Validate every subphase against its objective, risks, and success conditions.
- Prefer focused unit/integration-level validation over broad or speculative testing.
- Ensure final validation covers:
  - city search
  - current weather display
  - min/max temperature
  - emoji icon
  - feels-like temperature
  - local time
  - `localStorage` persistence
  - simulated alerts section
  - minimal visual layout compliance
- Confirm no forbidden framework, backend, auth, or non-goal feature is introduced.

## Out of scope
- Authentication
- Backend server
- Routing or multi-page navigation
- Complex state management libraries
- UI frameworks or CSS frameworks
- Real weather alerts integration
- User preferences beyond last searched city persistence
- Any feature not explicitly required by `project-requirements.md`

## Approval status
PENDING_APPROVAL
