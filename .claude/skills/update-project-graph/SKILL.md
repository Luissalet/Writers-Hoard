---
name: update-project-graph
description: >
  Keep the project knowledge graph in memory up to date after code changes.
  MUST trigger at the END of any session or task where you modified files under src/,
  especially src/engines/, src/stores/, src/db/, src/hooks/, src/components/, src/services/,
  src/types/, src/pages/, or src/config/. Also trigger when the user says "update the project graph",
  "refresh architecture", "rescan the project", or anything about keeping project knowledge current.
  This is a post-task housekeeping step — run it after your main work is done, not before.
---

# Update Project Knowledge Graph

You maintain a layered knowledge graph of the Writers Hoard codebase in memory files.
After making code changes, you need to check whether those changes affect the knowledge graph
and update it if they do. This keeps future sessions from working with stale architectural context.

## The Knowledge Graph Files

Three memory files at `/sessions/festive-cool-keller/mnt/.auto-memory/`:

| File | What it tracks |
|------|---------------|
| `project_architecture.md` | Tech stack, app structure, routing, stores, database schema (table list), services, hooks, shared layer, engine system overview, project modes |
| `project_engine_catalog.md` | All engines profiled: purpose, key files, hooks used, maturity status (complete vs WIP) |
| `MEMORY.md` | Index pointing to these files (keep in sync) |

## When to Update

After completing your main task, check: did any of your changes touch these areas?

**Architecture map triggers:**
- New/removed/renamed stores in `src/stores/`
- Dexie schema version bump or table changes in `src/db/`
- New/removed hooks in `src/hooks/`
- New/removed services in `src/services/`
- Route changes in `src/pages/` or `App.tsx`
- New dependencies in `package.json`
- Changes to `src/config/`
- Changes to `src/shared/`
- Changes to `src/types/index.ts` (new domain types)

**Engine catalog triggers:**
- Any file added/removed/renamed in `src/engines/*/`
- New engine registered in `src/engines/_registry.ts`
- Engine moved from thin-wrapper to self-contained pattern (or vice versa)
- Project mode presets changed in registry
- Engine status changed (WIP → complete, or new engine added)

**If none of these were touched, skip the update.** Don't rescan just because you edited a CSS class.

## How to Update

The goal is surgical updates, not full rescans. You already know what you changed.

### Step 1: Read the current memory files

Read `project_architecture.md` and/or `project_engine_catalog.md` — whichever is relevant to your changes.

### Step 2: Identify what's stale

Compare what the memory file says against what you just changed. Be specific — you know exactly which files you touched and what the diff was.

### Step 3: Edit the memory files

Use the Edit tool to make targeted updates. Common patterns:

- **Added a new engine**: Add its profile to `project_engine_catalog.md` following the existing format. Update the engine count in `project_architecture.md`. If it changed project mode presets, update those too.
- **Changed DB schema**: Update the table list in `project_architecture.md` under the Database section.
- **Added a new store**: Add it to the State Layer section in `project_architecture.md`.
- **New service**: Add to the Services section.
- **Engine matured from WIP to complete**: Update its status in `project_engine_catalog.md` and adjust the summary counts.
- **New hook**: Add to the Domain Hooks list.
- **New shared utility**: Add to the Shared Layer section.
- **New component area**: If a new component subdirectory was created, note it in the architecture map.

### Step 4: Keep MEMORY.md accurate

If you changed the engine count or any description in the index entries, update `MEMORY.md` to match. The index lines should be short hooks that help future sessions decide whether to load the full file.

## Format Conventions

Follow the existing format in each file — don't introduce new heading levels or restructure unless there's a good reason. The architecture map uses `##` for major sections and inline code for paths/names. The engine catalog uses `###` for each engine with bold labels for Files, Hooks, and Status.

Engine status values: **Complete** or **WIP** with a brief reason.

## What NOT to Do

- Don't do a full project rescan. You just made the changes — you know what they are.
- Don't crawl import/dependency trees. Update based on what you directly changed.
- Don't rewrite sections that haven't changed. Surgical edits only.
- Don't update memory files during your main task — do it after, as a final step.
- Don't add file-level details (like "line 42 of FooComponent.tsx does X"). Keep it at the architectural level.

## Full Rescan (Manual Trigger Only)

If the user explicitly asks for a full rescan ("rescan the project", "rebuild the knowledge graph"), then do a comprehensive pass:

1. Use subagents in parallel to scan each layer (stores, db, hooks, engines, services, etc.)
2. Rewrite the memory files from scratch with current state
3. This is the exception to the "surgical edits" rule — but only when the user asks for it
