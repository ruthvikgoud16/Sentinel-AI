# Sentinel AI Task Checklist

This task board outlines the bare minimum steps required to build Sentinel AI for a 3-minute winning demo.

---

## Phase 1: Environment & Mock Setup `[x]`
- [x] Install required NPM packages:
  - [x] Visual Graph: `vis-network` (or `@xyflow/react` / `reactflow`)
  - [x] AI: `@google/genai` (or `@google/generative-ai`)
  - [x] UI Icons: `lucide-react`
- [x] Save Gemini API Key:
  - [x] Add `GEMINI_API_KEY` to `.env.local`
- [x] Create Mock Scenario:
  - [x] Create `src/lib/mockData.ts` with the `ROMANCE_SCAM_SCENARIO` data containing 4 nodes, 3 edges, and 5 timeline events (from `SCHEMA.md`).

---

## Phase 2: Backend Gemini Route `[x]`
- [x] Build the Copilot API endpoint:
  - [x] Create `src/app/api/chat/route.ts`
  - [x] Accept prompt and structured context object
  - [x] Compose system instructions: "Act as an expert AML compliance investigator. Analyze the transaction graph context and provide concise evidence and narrative drafts."
  - [x] Fetch response from Gemini API and return as JSON stream or text.

---

## Phase 3: Frontend Dashboard UI `[x]`
- [x] Design a premium layout with a dark color scheme:
  - [x] Header: "Sentinel AI" logo, status badge ("1 Active Critical Alert"), connection indicators.
  - [x] Sidebar: Preloaded list displaying exactly one active critical alert card (`alert-1042`).
- [x] Core Split Pane Container:
  - [x] Left column: Visual network canvas + vertical timeline feed.
  - [x] Right column: Customer metadata card + Copilot chat drawer.

---

## Phase 4: Graph & Timeline Integration `[x]`
- [x] Integrate graph rendering in `src/components/MoneyFlowGraph.tsx`:
  - [x] Load node coordinates and edges from `mockData.ts`.
  - [x] Apply node colors: Green (Victim), Orange (Intermediaries), Red (Mule Target), Grey/Blue (Crypto cash-out).
  - [x] Implement hover state tooltips showing IP and device fingerprints.
- [x] Integrate timeline list:
  - [x] Build clean list showing icons for transaction types, device flags, and police notices.

---

## Phase 5: Copilot Drawer & Actions `[x]`
- [x] Build the AI interaction workspace:
  - [x] One-click action buttons: "Analyze Case" and "Draft SAR".
  - [x] Integrate text chat field that triggers the `/api/chat` endpoint and updates the message feed.
  - [x] Show a pulsing shimmery loader when waiting for Gemini.
- [x] Wire up resolution action:
  - [x] Add "Freeze Account & Network" button in the Action Center.
  - [x] When clicked, toggle a React state (`isFrozen = true`), changing node status colors to solid crimson, updating the alert status to "RESOLVED: FROZEN", and showing a success toast.

---

## Phase 6: Demo Dry Run `[x]`
- [x] Start development server: `npm run dev`
- [x] Execute script:
  - [x] Triage dashboard shows critical Romance Scam alert.
  - [x] Graph loads displaying the money movement network.
  - [x] Click "Analyze Case" -> Copilot explains layering & shared devices.
  - [x] Click "Draft SAR" -> Copilot drafts narrative text.
  - [x] Click "Freeze Account" -> Nodes turn red.

---

## Phase 7: Demo Visual Polish (P0) `[x]`
- [x] Node Visual Styling: Upgrade `vis-network` nodes to use circular avatars and custom neon shadows representing roles (Victim=Green, Mule=Orange, Target=Red). `[Est: 15 min]`
- [x] Animated Edge Flows: Add animated dashing to transaction edges to visually direct the money flow. `[Est: 10 min]`
- [x] Custom Info Inspector: Create an HTML absolute-positioned card that displays node metadata on selection (replacing plain browser tooltips). `[Est: 20 min]`
- [x] Rich Markdown Response Styles: Style Gemini markdown output to render warning/alert boxes and risk metrics. `[Est: 15 min]`
- [x] Quick Prompt Suggestion Chips: Add clickable prompt buttons below the chat input box (e.g., "Analyze Layering", "Draft SAR"). `[Est: 10 min]`
- [x] Timeline Connection Line: Style a background connection line behind the timeline cards. `[Est: 15 min]`
- [x] Live Mitigation Timeline Log: Dynamically insert a "Mitigation Executed" event card to the timeline on Freeze action. `[Est: 10 min]`
- [x] Canvas Metrics Overlay: Overlay top graph stats (e.g., "Velocity: 180s", "Shared Devices: 1") on the graph canvas. `[Est: 10 min]`
- [x] Alert Queue Pulse: Add a glowing red indicator ring around the suspect card in the alert sidebar. `[Est: 10 min]`
- [x] Glassmorphism Container styling: Apply refined backdrop-blur styles to the dashboard containers. `[Est: 15 min]`

---

## Phase 8: Explainable Detection Engine (P0) `[x]`
- [x] Implement Detection Logic: Create `src/lib/detectionEngine.ts` to evaluate the 6 signals (Velocity, Devices, Senders, Cyber tip, Layering, New account) and calculate a risk score with text reasons. `[Est: 15 min]`
- [x] Display Risk Diagnostics in UI: Render a dedicated "Threat Signal Analysis" card in the dashboard showing checked/crossed badges for each of the 6 signals. `[Est: 15 min]`
- [x] Wire raw transaction simulator: Allow showing the input transactions, running the detection engine, and updating the risk score live. `[Est: 15 min]`
