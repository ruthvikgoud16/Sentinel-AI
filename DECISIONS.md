# Technical Decisions

This document records all locked decisions for the hackathon. Once recorded here, decisions should not be re-evaluated unless a critical blocker is encountered.

## 1. Core Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI Integration:** Google Gemini via Vercel AI SDK

## 2. Methodology
- **Development Workflow:** READ DOCS → PLAN → BUILD → TEST → REVIEW → UPDATE TASKS
- **Prioritization:** P0 (Required for demo) → P1 (Improves judging score) → P2 (Optional)
- **Demo-First:** Build ONLY what is necessary to deliver an impressive demo. Hardcode edge cases if needed.

## 3. Architecture & Deployment
- **Deployment:** Vercel (push to main)
- **Data Access:** Next.js Server Actions (No standalone API routes unless required for webhooks)
- **State Management:** URL Search Params and simple `useState`. Avoid Redux/Zustand unless absolutely critical.
