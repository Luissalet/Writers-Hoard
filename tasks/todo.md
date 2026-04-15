# Plan: Writer's Hoard — Unified Creative Platform

## Architecture Overhaul
See **[architecture-unified-app.md](./architecture-unified-app.md)** for the full spec: engine registry, project modes, all 9+ engines, database strategy, and migration path.

## Previous Feature Batch (pre-merge)
7 features/fixes spanning Yarn Board, Codex, Gallery, and AI systems. These will be absorbed into the engine refactor.

---

## Phase 1: Fix Yarn Board (Core Bugs)
**Files:** `YarnBoard.tsx`, `useYarnBoard.ts`

- [ ] **1.1 Persist node positions on drag** — `onNodesChange` fires but never calls `updateNode()`. Add debounced position save on drag-end via `onNodeDragStop`.
- [ ] **1.2 Node deletion** — Wire up `onDeleteNode` (already exists in hook). Add right-click context menu or delete button on node hover.
- [ ] **1.3 Edge deletion** — Wire up `onDeleteEdge`. Add click-to-select + delete key, or context menu on edges.

## Phase 2: Edit Names & Content in Yarn Board
**Files:** `YarnBoard.tsx` (new modal or inline edit)

- [ ] **2.1 Node edit modal** — Double-click node opens modal with: title input, content textarea, color picker, type selector, edge style options. Uses existing `updateNode` from hook.
- [ ] **2.2 Edge edit** — Click edge to change label/type/color/style (solid/dashed/dotted). Add `updateEdge` to hook and operations.

## Phase 3: Images in Yarn Board
**Files:** `YarnBoard.tsx`, node component

- [ ] **3.1 Image upload in node edit modal** — Add dropzone/file input in the edit modal. Store as base64 in `YarnNode.image`.
- [ ] **3.2 Render images in nodes** — Show image as background or thumbnail in YarnNodeComponent.

## Phase 4: Save/Load Yarn Projects (Import/Export)
**Files:** `operations.ts`, `ProjectDetail.tsx`

- [ ] **4.1 Import project JSON** — Add `importProjectData()` function in operations.ts. Parse exported JSON, create all entities with new IDs to avoid conflicts.
- [ ] **4.2 Import UI** — Add "Import Project" button on Dashboard with file picker.

## Phase 5: Character Images (Codex Avatars)
**Files:** `CodexEntryForm.tsx`, `CodexEntryList.tsx`

- [ ] **5.1 Avatar upload in CodexEntryForm** — Add image dropzone/file input at top of form. Preview current avatar. Store as base64 in `CodexEntry.avatar`.
- [ ] **5.2 Larger avatar display in detail modal** — Show bigger avatar in the detail view (currently 10x10px).

## Phase 6: Gallery Albums
**Files:** `InspirationGallery.tsx`, `useGallery.ts` (new hook), `operations.ts`

- [ ] **6.1 Album CRUD** — Create/rename/delete albums using existing `ImageCollection` type and DB operations.
- [ ] **6.2 Album UI** — Tab/sidebar to switch between albums. "All Images" default view. Drag or assign images to albums.
- [ ] **6.3 Move images between albums** — Update `collectionId` on InspirationImage.

## Phase 7: AI Character Merge
**Files:** `aiFeatures.ts`, new merge UI component, codex operations

- [ ] **7.1 Detect duplicates on extraction** — After AI returns characters, fuzzy-match `nombre` against existing CodexEntry titles (using Fuse.js already in deps).
- [ ] **7.2 Merge UI** — Show side-by-side comparison: existing entry vs extracted data. Let user pick which fields to keep/merge.
- [ ] **7.3 Merge operation** — Update existing CodexEntry with merged fields instead of creating duplicate.

---

## Execution Order
Phases 1→2→3 (Yarn Board cluster), then 4→5→6→7 (independent features).
Each phase is independently testable.
