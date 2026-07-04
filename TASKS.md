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

## Phase 5: Copilot Drawer & Actions `[ ]`
- [ ] Build the AI interaction workspace:
  - [ ] One-click action buttons: "Analyze Case" and "Draft SAR".
  - [ ] Integrate text chat field that triggers the `/api/chat` endpoint and updates the message feed.
  - [ ] Show a pulsing shimmery loader when waiting for Gemini.
- [ ] Wire up resolution action:
  - [ ] Add "Freeze Account & Network" button in the Action Center.
  - [ ] When clicked, toggle a React state (`isFrozen = true`), changing node status colors to solid crimson, updating the alert status to "RESOLVED: FROZEN", and showing a success toast.

---

## Phase 6: Demo Dry Run `[ ]`
- [ ] Start development server: `npm run dev`
- [ ] Execute script:
  - [ ] Triage dashboard shows critical Romance Scam alert.
  - [ ] Graph loads displaying the money movement network.
  - [ ] Click "Analyze Case" -> Copilot explains layering & shared devices.
  - [ ] Click "Draft SAR" -> Copilot drafts narrative text.
  - [ ] Click "Freeze Account" -> Nodes turn red.
