# Hackathon Playbook

This is the operating manual for our hackathon execution.

## 1. Theme Response Framework
When the theme is announced, execute this sequence:
1. **Analyze Theme** (Identify 3 potential angles/ideas).
2. **Evaluate Ideas** (Use `IDEA_MATRIX.md` to select the best one).
3. **Generate PRD** (Fill out `PRD.md`).
4. **Generate Architecture** (Fill out `ARCHITECTURE.md`).
5. **Generate Schema** (Fill out `SCHEMA.md`).
6. **Generate API Contract** (Fill out `API_CONTRACT.md`).
7. **Generate Tasks** (Fill out `TASKS.md` with P0 checklist).
8. **Start P0 Implementation** (Code!).

## 2. P0/P1/P2 Rules
- **P0 (Critical Path):** Features required for the core demo to function from end to end. MUST be completed before touching anything else.
- **P1 (Wow Factor):** High-impact UI/UX Polish, animations, advanced AI features. Do not start until P0 is 100% complete.
- **P2 (Nice-to-Haves):** Settings pages, user profiles, real authentication flows (if mockable). Avoid entirely unless time permits at the end.

## 3. Demo-First Rules
- **Mock Everything First:** Hardcode the data the judges will see. Replace with real API calls *only* if required for the narrative.
- **The Golden Path:** Ensure the one specific flow you will demo is flawless. Edge cases do not exist.
- **Error Handling:** Don't build elaborate error states. Assume the "happy path" will succeed during the demo.

## 4. Token-Efficiency Rules
- Pass only the necessary files for a task.
- Refer to established docs (`PRD.md`, `DECISIONS.md`) instead of repeating context.
- Keep agent outputs focused strictly on code modifications.

## 5. Deployment Rules
- Push to `main` immediately.
- Verify the deployed Vercel link matches local behavior early.
- Do not make massive sweeping changes in the final 2 hours. Code freeze for critical paths 2 hours before the deadline.
