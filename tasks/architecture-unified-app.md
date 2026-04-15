# Architecture Plan: Unified Writer's Hoard — Engine-Based Creative Platform

## Vision

Transform Writer's Hoard from a novel-writing tool into a **modular creative platform** where different writer types (novelist, biographer, reporter, theater writer, content creator) use the same powerful engine layer but see different default configurations. Absorb Rabbitholer's investigative tools as engines within this unified system.

---

## 1. Core Concept: Engine Registry

Every feature is an **Engine** — a self-contained module with its own types, database tables, hooks, components, and operations. Engines are registered in a central registry and activated per-project based on the project's **mode**.

```
src/
  engines/
    _registry.ts          ← Engine manifest: metadata, icons, default configs
    _types.ts             ← Shared engine interfaces (EngineDefinition, EngineConfig)
    yarn-board/           ← One folder per engine
      types.ts
      schema.ts           ← Dexie table definitions for this engine
      operations.ts       ← DB CRUD
      hooks.ts            ← React hooks
      components/
        YarnBoard.tsx
        YarnNodeEditor.tsx
        YarnEdgeEditor.tsx
        YarnGroupNode.tsx
        YarnLegend.tsx
      index.ts            ← Public API: { engine: EngineDefinition }
    timeline/
      ...same pattern...
    scrapper/
    gallery/
    brainstorm/
    dialog-scene/
    storyboard/
    biography/
    video-planner/
    codex/
    writings/
    maps/
    links/
```

### Engine Definition Interface

```typescript
interface EngineDefinition {
  id: string;                        // 'yarn-board', 'timeline', etc.
  name: string;                      // Display name
  description: string;               // One-liner for project setup
  icon: LucideIcon;                  // Tab icon
  category: EngineCategory;          // 'core' | 'creative' | 'research' | 'planning'
  tables: DexieTableSpec[];          // Database tables this engine needs
  component: React.LazyComponent;    // Lazy-loaded root component
  hooks: Record<string, Function>;   // Exported hooks
  operations: Record<string, Function>; // Exported DB ops
  defaultConfig?: Record<string, any>;  // Engine-specific settings
}

type EngineCategory = 'core' | 'creative' | 'research' | 'planning';
```

### Engine Registry

```typescript
// engines/_registry.ts
const ENGINE_REGISTRY: Map<string, EngineDefinition> = new Map();

export function registerEngine(engine: EngineDefinition) {
  ENGINE_REGISTRY.set(engine.id, engine);
}

export function getEngine(id: string): EngineDefinition | undefined {
  return ENGINE_REGISTRY.get(id);
}

export function getEnginesForMode(mode: ProjectMode): EngineDefinition[] {
  const config = PROJECT_MODES[mode];
  return config.engines
    .map(id => ENGINE_REGISTRY.get(id))
    .filter(Boolean) as EngineDefinition[];
}

export function getAllEngines(): EngineDefinition[] {
  return Array.from(ENGINE_REGISTRY.values());
}
```

---

## 2. Project Modes

A **Mode** is a preset that determines which engines are visible by default when creating a project. Users can always add or remove engines after creation.

```typescript
type ProjectMode =
  | 'novelist'       // Fiction writers: novels, short stories, sagas
  | 'biographer'     // Real or fictional biographies
  | 'reporter'       // Investigative journalism, research
  | 'playwright'     // Theater, screenwriting, dialog-heavy work
  | 'content-creator'// YouTubers, podcasters, video planners
  | 'custom';        // Pick your own engines

interface ProjectModeConfig {
  id: ProjectMode;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  defaultEngines: string[];    // Engine IDs enabled by default
  suggestedEngines: string[];  // Shown as "you might also want..."
}
```

### Mode → Engine Mapping

| Mode | Default Engines | Suggested |
|------|----------------|-----------|
| **Novelist** | writings, codex, timeline, yarn-board, maps, gallery | brainstorm, storyboard |
| **Biographer** | biography, timeline, codex, gallery, scrapper, yarn-board | writings, links |
| **Reporter** | scrapper, timeline, yarn-board, codex, gallery, links | writings, brainstorm |
| **Playwright** | dialog-scene, codex, timeline, storyboard, yarn-board | gallery, brainstorm |
| **Content Creator** | video-planner, storyboard, gallery, scrapper, timeline | brainstorm, links |
| **Custom** | *(user picks)* | *(all shown)* |

### Updated Project Model

```typescript
interface Project {
  id: string;
  title: string;
  mode: ProjectMode;                    // Replaces `type`
  type: 'saga' | 'standalone' | 'collection' | 'idea'; // Kept for scope
  color: string;
  coverImage?: string;
  description: string;
  parentId?: string;
  children?: string[];
  status: 'draft' | 'in-progress' | 'completed';
  enabledEngines: string[];             // NEW: active engine IDs for this project
  engineOrder: string[];                // NEW: tab order (user-customizable)
  engineConfigs?: Record<string, any>;  // NEW: per-engine settings
  createdAt: number;
  updatedAt: number;
}
```

---

## 3. Engine Specifications

### 3.1 Yarn Board (EXISTING — enhanced)

**Category:** core
**What it does:** Conceptual maps with nodes, edges, groups, and entity linking.

**Enhancements from Rabbitholer merge:**
- Add `group` node type (sub-flow parenting from Rabbitholer)
- Add `organization`, `evidence`, `location` node types alongside existing ones
- Add `parentId`, `width`, `height` to YarnNode for group containment
- Add `sourceHandle`, `targetHandle` to YarnEdge for multi-handle connections
- Port `YarnGroupNode` component with resize handles
- Keep existing node types: `character`, `event`, `concept`, `note`

**Updated Types:**
```typescript
interface YarnNode {
  id: string;
  projectId: string;
  boardId: string;
  type: 'character' | 'event' | 'concept' | 'note' | 'person' | 'organization' | 'evidence' | 'location' | 'group';
  title: string;
  content: string;
  image?: string;
  color: string;
  position: { x: number; y: number };
  width?: number;       // For group nodes
  height?: number;      // For group nodes
  parentId?: string;    // Group containment
  linkedEntryId?: string;
  linkedEntityType?: string;  // 'codex' | 'person' | 'snapshot' | etc.
}

interface YarnEdge {
  id: string;
  boardId: string;
  sourceId: string;
  targetId: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

---

### 3.2 Timeline (EXISTING — enhanced)

**Category:** core
**What it does:** Chronological event sequencing with lanes, colors, and entity links.

**Enhancements:**
- **Clickable expandables:** Events expand inline to show full description + linked entity preview
- **Entity linking:** Link to any engine entity (codex entry, person, snapshot, scene, etc.) via generic `linkedEntityId` + `linkedEntityType`
- **Drag-and-drop reorder:** When "reorder mode" is toggled on, events become draggable (react-beautiful-dnd or @dnd-kit/sortable)
- **Drag-to-add:** Drag items from other engines onto the timeline to auto-create events
- **Zoom levels:** Year → Month → Day → Custom (for fictional calendars)

**Updated Types:**
```typescript
interface TimelineEvent {
  id: string;
  projectId: string;
  timelineId: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;           // NEW: for date ranges/spans
  order: number;
  lane: string;
  color: string;
  linkedEntityId?: string;
  linkedEntityType?: string;  // NEW: generic entity linking
  tags?: string[];            // NEW
  expandedContent?: string;   // NEW: rich text for expanded view
  createdAt: number;
  updatedAt: number;
}
```

---

### 3.3 Scrapper (NEW — ported from Rabbitholer)

**Category:** research
**What it does:** Capture and archive web content — URLs, tweets, Instagram posts, videos — for research.

**Ported from Rabbitholer:**
- `urlCapture.ts` → Full Puppeteer-based URL capture with Readability extraction
- `tweetCapture.ts` → Tweet archiving with media, metrics, quoted tweets
- `instagramCapture.ts` → Instagram post/reel capture with carousel support
- `screenshotCapture.ts` → html2canvas screenshot utility
- `mediaDownload.ts` → Video/media download service
- Auth services (`xAuth.ts`, `igAuth.ts`)

**New Database Tables:**
```typescript
// Snapshots (captured content)
snapshots: 'id, projectId, url, status, createdAt, [projectId+createdAt]'
snapshotContents: 'id, snapshotId'

// Will reuse existing tags system
```

**Types:**
```typescript
interface Snapshot {
  id: string;
  projectId: string;
  url: string;
  title: string;
  source: 'url' | 'tweet' | 'instagram' | 'youtube' | 'manual';
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  thumbnail?: string;
  author?: string;
  publishDate?: string;
  tags: string[];
  preservedAt: number;
  createdAt: number;
}

interface SnapshotContent {
  id: string;
  snapshotId: string;
  htmlContent: string;
  extractedText: string;
  screenshotBase64?: string;
  pdfBase64?: string;
  metadata: ArticleMetadata;
  tweetData?: StoredTweetData;       // From Rabbitholer
  instagramData?: StoredInstagramData; // From Rabbitholer
}
```

**Components:**
```
engines/scrapper/
  components/
    ScrapperView.tsx          ← Main view: URL input bar + captured items grid
    CaptureCard.tsx           ← Card showing captured content preview
    CaptureDetailModal.tsx    ← Full view of captured content
    TweetPreview.tsx          ← Styled tweet card
    InstagramPreview.tsx      ← Styled Instagram card
    ArticlePreview.tsx        ← Readability-extracted article
    CaptureToolbar.tsx        ← Quick-capture buttons (URL, Tweet, IG, Screenshot)
  services/
    urlCapture.ts
    tweetCapture.ts
    instagramCapture.ts
    screenshotCapture.ts
    mediaDownload.ts
    xAuth.ts
    igAuth.ts
```

---

### 3.4 Gallery (EXISTING — enhanced)

**Category:** core
**What it does:** Image collections with tagging, albums, and entity linking.

**Enhancements:**
- Already well-built. Minor additions:
- Allow linking to any entity type (not just codex entries)
- Add `linkedEntityType` field
- Better integration with other engines (drag image into storyboard, scene, etc.)

---

### 3.5 Brainstorm Board (NEW)

**Category:** creative
**What it does:** A freeform canvas where you can pull in items from ANY engine and arrange them spatially. Mix a timeline event, a character card, a captured tweet, a gallery image, and a note — all on one board.

**Key Design Decisions:**
- Built on the same React Flow base as Yarn Board (shared canvas infrastructure)
- Unlike Yarn Board (which has its own node types), Brainstorm nodes are **entity references** — they render previews of items from other engines
- Also supports freeform sticky notes, text blocks, and images
- Sections/regions for grouping (similar to Yarn Board groups)

**Types:**
```typescript
interface BrainstormBoard {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface BrainstormItem {
  id: string;
  boardId: string;
  projectId: string;
  type: 'note' | 'image' | 'entity-ref' | 'text-block' | 'section';
  position: { x: number; y: number };
  width?: number;
  height?: number;

  // For 'note' type
  content?: string;       // Plain text or short markdown
  color?: string;         // Sticky note color

  // For 'image' type
  imageData?: string;     // Base64

  // For 'entity-ref' type — links to any engine item
  refEntityId?: string;
  refEntityType?: string; // 'codex-entry' | 'timeline-event' | 'snapshot' | 'scene' | 'writing' | etc.
  refPreviewData?: string; // Cached preview (title + snippet) so board renders fast

  // For 'text-block' type
  richContent?: string;   // HTML from TipTap

  // For 'section' type (grouping region)
  label?: string;
  sectionColor?: string;
}

interface BrainstormConnection {
  id: string;
  boardId: string;
  sourceId: string;
  targetId: string;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}
```

**Components:**
```
engines/brainstorm/
  components/
    BrainstormView.tsx         ← React Flow canvas
    BrainstormItemNode.tsx     ← Renders based on item type
    EntityRefPreview.tsx       ← Mini preview card for linked entities
    BrainstormToolbar.tsx      ← Add note, image, search entities to add
    EntityPicker.tsx           ← Search across all engines to add references
```

**Key Feature — Entity Picker:**
A cross-engine search dialog: "Add from... Codex | Timeline | Scrapper | Gallery | Scenes | Writings" — searches that engine's data and creates a reference node on the board.

---

### 3.6 Dialog / Scene Generator (NEW)

**Category:** creative
**What it does:** Create scenes as colored dialog boxes. A scene has a cast of characters/persons. Each dialog block belongs to a character, is color-coded, and can be reordered via drag-and-drop.

**Workflow:**
1. Open the Dialog engine tab
2. Click "New Scene" → name it "Scene 1"
3. Scene opens. Quick bar at top shows: `+ Juan` `+ Pedro` `+ Maria` (characters from Codex, or create ad-hoc)
4. Click `+ Juan` → gold box appears in the document
5. Click `+ Pedro` → blue box appears below
6. Click `+ Juan` → another gold box appears below
7. Type dialog in each box
8. Drag and drop to reorder
9. Insert/delete blocks in the middle
10. Stage directions appear as gray italic blocks between dialog

**Types:**
```typescript
interface Scene {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  order: number;           // Scene ordering within project
  setting?: string;        // Location/context
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface DialogBlock {
  id: string;
  sceneId: string;
  projectId: string;
  type: 'dialog' | 'stage-direction' | 'note' | 'action';
  characterId?: string;    // Links to codex entry or Person
  characterName: string;   // Denormalized for display
  characterColor: string;  // Assigned color for this character in this scene
  content: string;         // The dialog text or stage direction
  order: number;           // Position within scene
  parenthetical?: string;  // Acting direction "(whispering)"
  createdAt: number;
  updatedAt: number;
}

interface SceneCast {
  id: string;
  sceneId: string;
  characterId?: string;    // Optional link to codex/person
  characterName: string;
  color: string;           // Color for this character's dialog boxes
  shortcut?: string;       // Keyboard shortcut or quick-bar label
}
```

**Components:**
```
engines/dialog-scene/
  components/
    SceneListView.tsx         ← All scenes, reorderable
    SceneEditor.tsx           ← The main scene editing view
    DialogBlock.tsx           ← Individual colored dialog box
    StageDirectionBlock.tsx   ← Gray italic block
    CastBar.tsx               ← Quick-add bar: click character → new block
    CastManager.tsx           ← Add/remove/color-assign characters
    SceneExporter.tsx         ← Export to screenplay format / PDF
  hooks.ts
  operations.ts
  types.ts
```

**Drag-and-Drop:** Use `@dnd-kit/sortable` for reordering blocks within a scene. Each block is a sortable item. Insert points appear between blocks on hover.

---

### 3.7 Storyboard Mode (NEW)

**Category:** planning
**What it does:** Comic-strip style layout. Rectangular boxes arranged in a grid/rows. Each box holds an image (pasted, uploaded, or dragged from Gallery). Between boxes: notes, arrows, symbols. Under each box: subtitle/description text.

**Layout Model:**
```
[ Box 1 ]  →note→  [ Box 2 ]  →note→  [ Box 3 ]
 subtitle           subtitle           subtitle

[ Box 4 ]  →note→  [ Box 5 ]  →note→  [ Box 6 ]
 subtitle           subtitle           subtitle
```

**Types:**
```typescript
interface Storyboard {
  id: string;
  projectId: string;
  title: string;
  columns: number;          // Boxes per row (default: 3, adjustable)
  createdAt: number;
  updatedAt: number;
}

interface StoryboardPanel {
  id: string;
  storyboardId: string;
  projectId: string;
  order: number;             // Position in sequence
  imageData?: string;        // Base64 image
  imageRef?: string;         // Reference to gallery image ID
  subtitle: string;          // Text below the panel
  description?: string;      // Longer description (expandable)
  duration?: string;         // For video storyboards: "00:15-00:23"
  linkedSceneId?: string;    // Link to a Dialog/Scene
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface StoryboardConnector {
  id: string;
  storyboardId: string;
  fromPanelId: string;
  toPanelId: string;
  type: 'arrow' | 'note' | 'cut' | 'fade' | 'dissolve' | 'custom';
  label?: string;            // Text between panels
  symbol?: string;           // Emoji or icon identifier
}
```

**Components:**
```
engines/storyboard/
  components/
    StoryboardView.tsx        ← Main grid layout
    StoryboardPanel.tsx       ← Individual box: image + subtitle
    PanelEditor.tsx           ← Edit panel content, upload image
    ConnectorBadge.tsx        ← Note/arrow between panels
    StoryboardToolbar.tsx     ← Add panel, adjust columns, reorder mode
    StoryboardExporter.tsx    ← Export as PDF / image strip
  hooks.ts
  operations.ts
  types.ts
```

**Key interactions:**
- Drag panels to reorder
- Drag images from Gallery directly into panels
- Click between panels to add connectors/notes
- Adjust column count for different layouts (2-col for comparison, 4-col for rapid sequences)

---

### 3.8 Biography Mode (NEW)

**Category:** creative
**What it does:** Build a biography (real or fictional) by collecting facts, events, and sources about a person/character, then organizing them into a narrative structure.

**Workflow:**
1. Select or create a subject (from Codex, or new)
2. Add facts/events: "Born in Madrid, 1923", "Met Rosa at university", "Published first book"
3. Each fact can have: sources (snapshots, links), dates, categories (personal, professional, etc.)
4. Drag to reorder — the biography takes shape
5. Toggle between "Fact Cards" view and "Narrative" view (auto-generated prose outline)
6. Export as timeline, document, or structured data

**Types:**
```typescript
interface Biography {
  id: string;
  projectId: string;
  subjectId?: string;        // Codex entry ID
  subjectName: string;
  subjectPhoto?: string;
  createdAt: number;
  updatedAt: number;
}

interface BiographyFact {
  id: string;
  biographyId: string;
  projectId: string;
  title: string;             // Short summary: "Born in Madrid"
  content: string;           // Rich text: full description
  date?: string;             // When it happened
  endDate?: string;          // For periods
  category: BiographyCategory;
  order: number;             // Position in narrative
  sources: FactSource[];     // Where this info came from
  confidence: 'confirmed' | 'likely' | 'uncertain' | 'disputed';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

type BiographyCategory =
  | 'birth' | 'death' | 'education' | 'career'
  | 'relationship' | 'achievement' | 'conflict'
  | 'travel' | 'health' | 'personal' | 'political'
  | 'creative' | 'custom';

interface FactSource {
  type: 'snapshot' | 'link' | 'manual' | 'interview';
  entityId?: string;         // Snapshot or link ID
  description: string;       // "Interview with Rosa, 2024"
  url?: string;
}
```

**Components:**
```
engines/biography/
  components/
    BiographyView.tsx         ← Main view: subject header + fact list
    BiographySubject.tsx      ← Subject card (photo, name, vital dates)
    FactCard.tsx              ← Individual fact with sources, confidence
    FactEditor.tsx            ← Add/edit fact modal
    NarrativeView.tsx         ← Auto-generated prose outline from facts
    BiographyTimeline.tsx     ← Timeline visualization of this person's facts
    SourceLinker.tsx           ← Link facts to snapshots/links
  hooks.ts
  operations.ts
  types.ts
```

**Cross-engine integration:**
- Facts auto-generate Timeline events (opt-in)
- Subject links to Codex entry
- Sources link to Scrapper snapshots
- Can export fact sequence to Writings as a draft

---

### 3.9 Video Planner (NEW)

**Category:** planning
**What it does:** Plan video content by combining dialog/script with visual references and timing. Think of it as a "director's document" — for each segment you define what's said, what's shown, and when.

**Types:**
```typescript
interface VideoPlan {
  id: string;
  projectId: string;
  title: string;
  totalDuration?: string;    // Estimated total "12:30"
  createdAt: number;
  updatedAt: number;
}

interface VideoSegment {
  id: string;
  videoPlanId: string;
  projectId: string;
  order: number;
  title: string;             // Segment name: "Intro", "Main argument", "CTA"
  startTime?: string;        // "00:00"
  endTime?: string;          // "00:45"

  // Script
  script: string;            // What to say (rich text)
  speakerId?: string;        // Who's speaking (codex/person ref)
  speakerName?: string;

  // Visuals
  visualType: 'camera' | 'broll' | 'screen-capture' | 'graphic' | 'text-overlay' | 'custom';
  visualDescription?: string; // "Show product close-up"
  visualImageRef?: string;    // Gallery image ID or base64
  visualVideoRef?: string;    // Reference to scraped video

  // Audio
  audioNotes?: string;        // "Background music: upbeat"

  // Production notes
  notes?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
```

**Components:**
```
engines/video-planner/
  components/
    VideoPlanView.tsx         ← Main view: segments in sequence
    SegmentCard.tsx           ← Script + visual side-by-side
    SegmentEditor.tsx         ← Full segment editor
    ScriptTeleprompter.tsx    ← Read-only scrolling script view
    VideoTimeline.tsx         ← Horizontal timeline with segments
    VisualPicker.tsx          ← Pick from gallery/scrapper or upload
  hooks.ts
  operations.ts
  types.ts
```

**Key feature — Teleprompter mode:** A read-only view that scrolls through just the script text at adjustable speed. For content creators to read while recording.

---

## 4. Shared Infrastructure

### 4.1 Shared Component Library

Things used by multiple engines, extracted to `src/shared/`:

```
src/shared/
  components/
    EntityPicker.tsx        ← Cross-engine entity search & select
    DraggableList.tsx       ← @dnd-kit wrapper for sortable lists
    RichTextEditor.tsx      ← TipTap editor (already exists)
    ImageDropzone.tsx       ← Drag-drop image upload
    ColorPicker.tsx         ← Consistent color selection
    TagInput.tsx            ← Already exists
    Modal.tsx               ← Already exists
    EmptyState.tsx          ← Already exists
    ConfirmDialog.tsx       ← From Rabbitholer
    EntityCard.tsx          ← Generic card for any entity type
  hooks/
    useDraggable.ts         ← Shared drag-and-drop logic
    useEntitySearch.ts      ← Cross-engine search
    useCRUD.ts              ← Generic CRUD hook factory (reduce duplication)
  utils/
    idGenerator.ts          ← Already exists
    entityResolver.ts       ← Given (entityId, entityType) → fetch & return preview data
    exportHelpers.ts        ← Shared export/import patterns
```

### 4.2 Generic CRUD Hook Factory

All current hooks follow the exact same pattern. Extract into a factory:

```typescript
// shared/hooks/useCRUD.ts
export function useCRUD<T>(
  fetchFn: (contextId: string) => Promise<T[]>,
  contextId: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const items = await fetchFn(contextId);
    setData(items);
    setLoading(false);
  }, [contextId, fetchFn]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh, setData };
}
```

Each engine hook then composes on top of this with engine-specific add/edit/remove functions.

### 4.3 Cross-Engine Entity Resolution

When engines reference entities from other engines (Timeline linking to a Codex entry, Brainstorm referencing a Snapshot), they need a universal resolver:

```typescript
// shared/utils/entityResolver.ts
interface EntityPreview {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  color?: string;
  engineId: string;
}

async function resolveEntity(entityId: string, entityType: string): Promise<EntityPreview | null> {
  // Delegates to the appropriate engine's operations
  const engine = getEngine(entityTypeToEngineId(entityType));
  if (!engine) return null;
  return engine.operations.getPreview(entityId);
}

async function searchEntities(query: string, engineIds?: string[]): Promise<EntityPreview[]> {
  // Searches across specified engines (or all)
  // Each engine provides a `search(query)` operation
}
```

### 4.4 Unified Tagging System

The existing `tags` table stays as-is but becomes shared infrastructure. Add a `tagLinks` table (from Rabbitholer) for many-to-many relationships:

```typescript
// Already have: tags: 'id, name'
// Add:
tagLinks: 'id, tagId, entityId, entityType, [tagId+entityType], [entityId+entityType]'
```

This replaces the `*tags` array indices on individual tables with a proper join table. Existing `*tags` fields can be kept for backward compatibility but new engines use `tagLinks`.

---

## 5. Database Strategy

### 5.1 Modular Schema Registration

Instead of one giant Dexie schema, each engine registers its tables:

```typescript
// db/index.ts
import { engineSchemas } from '@/engines/_registry';

class WritersHoardDB extends Dexie {
  constructor() {
    super('WritersHoardDB');

    // Combine all engine schemas + core tables
    const allTables = {
      projects: 'id, mode, type, parentId, status, updatedAt',
      tags: 'id, name',
      tagLinks: 'id, tagId, entityId, entityType, [tagId+entityType], [entityId+entityType]',
      settings: 'id, key',
      ...mergeEngineSchemas(engineSchemas),
    };

    this.version(CURRENT_VERSION).stores(allTables);
  }
}
```

### 5.2 New Tables Summary

**Kept from Writer's Hoard (v4):**
- projects (modified: +mode, +enabledEngines, +engineOrder)
- codexEntries, writings, timelines, timelineEvents
- yarnBoards, yarnNodes (modified: +group type, +parentId, +width/height), yarnEdges (modified: +handles)
- worldMaps, mapPins
- imageCollections, inspirationImages
- externalLinks
- tags, settings

**Ported from Rabbitholer:**
- snapshots, snapshotContents

**New for new engines:**
- tagLinks
- brainstormBoards, brainstormItems, brainstormConnections
- scenes, dialogBlocks, sceneCasts
- storyboards, storyboardPanels, storyboardConnectors
- biographies, biographyFacts
- videoPlans, videoSegments

**Total: ~30 tables** (up from 15), but each engine only touches its own.

---

## 6. Updated Project Detail Page

The monolithic `ProjectDetail.tsx` (currently 607 lines managing all 7 engines) gets refactored:

```typescript
// pages/ProjectDetail.tsx — simplified
export default function ProjectDetail() {
  const { id } = useParams();
  const { project } = useProject(id);

  // Get only the engines this project has enabled
  const engines = useProjectEngines(project);

  return (
    <>
      <TopBar title={project.title} subtitle={`${project.mode} · ${project.status}`} />
      <EngineTabBar engines={engines} />
      <EngineContent engine={activeEngine} projectId={id} />
    </>
  );
}
```

Each engine provides its own wrapper component that handles sub-resource management (boards, timelines, etc.) internally. No more 50+ useState calls in ProjectDetail.

### Engine Settings Panel

A gear icon on each tab opens engine-specific settings. For example:
- Storyboard: columns count, panel aspect ratio
- Dialog/Scene: default character colors, export format
- Video Planner: default segment duration, teleprompter speed

---

## 7. Routing Update

```
/                                    → Dashboard
/project/:id                         → ProjectDetail (first enabled engine)
/project/:id/:engineId               → ProjectDetail (specific engine tab)
/project/:id/:engineId/:subId        → Engine sub-view (e.g., /project/x/timeline/tl_123)
/settings                            → App settings (AI, Google, Scrapper auth, etc.)
```

---

## 8. Migration Path

### Phase 0: Preparation (no breaking changes)
- [ ] Extract shared components to `src/shared/`
- [ ] Create `useCRUD` hook factory, refactor existing hooks to use it
- [ ] Create engine folder structure with `_registry.ts` and `_types.ts`
- [ ] Move existing engines into `src/engines/` folders (writings, codex, timeline, yarn-board, maps, gallery, links) — keep imports working via barrel exports

### Phase 1: Engine Registry + Project Modes
- [ ] Implement `EngineDefinition` interface and registry
- [ ] Add `mode`, `enabledEngines`, `engineOrder` to Project type
- [ ] DB migration v5: add new project fields, backfill existing projects as `mode: 'novelist'` with all current engines enabled
- [ ] Refactor `ProjectDetail.tsx` to use engine registry
- [ ] Create project creation flow with mode selection
- [ ] Build EngineTabBar and EngineContent components

### Phase 2: Enhance Existing Engines
- [ ] Yarn Board: port group nodes, new types, handles from Rabbitholer
- [ ] Timeline: add expandables, drag-and-drop reorder, entity type linking
- [ ] Gallery: add generic entity linking
- [ ] Implement cross-engine entity resolution

### Phase 3: Port Scrapper from Rabbitholer
- [ ] Port capture services (url, tweet, instagram, screenshot)
- [ ] Port auth services
- [ ] Create Scrapper engine (types, schema, operations, hooks, components)
- [ ] Add snapshots + snapshotContents tables (DB migration v6)
- [ ] Build ScrapperView, CaptureCard, preview components

### Phase 4: Build New Engines (can be parallelized)
- [ ] **Dialog/Scene Generator** — scenes, dialog blocks, cast bar, drag-and-drop reorder
- [ ] **Storyboard Mode** — panel grid, connectors, image integration
- [ ] **Biography Mode** — facts, sources, narrative view, confidence levels
- [ ] **Brainstorm Board** — entity references, cross-engine search, freeform canvas
- [ ] **Video Planner** — segments, teleprompter, visual picker

### Phase 5: Polish & Integration
- [ ] Unified tagging system (tagLinks table)
- [ ] Cross-engine drag-and-drop (drag codex entry onto timeline, gallery image onto storyboard)
- [ ] Engine-to-engine export (biography facts → timeline events, scenes → storyboard panels)
- [ ] Project templates (pre-configured projects with sample data for each mode)
- [ ] Global search across all engines

---

## 9. Future Engine Ideas (Placeholder)

The architecture supports adding engines without touching core code:

- **Research Notes** — structured note-taking with citation management
- **Worldbuilding Rules** — define magic systems, physics, calendars with validation
- **Music/Soundtrack Planner** — map music to scenes/segments
- **Collaboration Board** — real-time multi-user editing (would require backend)
- **AI Assistant** — per-engine AI features (character generation, plot suggestions, fact-checking)
- **Publishing Pipeline** — format manuscripts for submission/self-publishing

Each is just a new folder in `src/engines/` with a registration call.

---

## 10. Technical Notes

**Bundle Size:** Lazy-load engine components. Only the active engine's code loads. Use `React.lazy()` + Suspense.

**Database Size:** Base64 images in IndexedDB can grow large. Consider:
- Thumbnail generation for all images (already done in Gallery)
- Optional external storage adapter (future)
- DB size monitoring in settings

**Testing Strategy:** Each engine is independently testable. Shared infrastructure has its own tests. Integration tests verify cross-engine linking.

**Naming Convention:**
- Engine folder: kebab-case (`dialog-scene`, `yarn-board`)
- Engine ID: same as folder name
- Types: PascalCase (`DialogBlock`, `StoryboardPanel`)
- Hooks: camelCase prefixed with `use` (`useScenes`, `useDialogBlocks`)
- Operations: camelCase verbs (`getScenes`, `createDialogBlock`)
