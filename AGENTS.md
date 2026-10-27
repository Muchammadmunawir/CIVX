<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
## CIVX engineering rules

- Treat `docs/PRODUCT.md`, `docs/DATA.md`, `docs/METHODOLOGY.md`, `docs/ARCHITECTURE.md`, and `docs/TASKS.md` as the planning source of truth until superseded by an explicit decision.
- Never fabricate statistics, fill missing production observations silently, or present synthetic fixtures as production data.
- Preserve data-source traceability from published result to processed observation and raw source artifact.
- Keep geography, period, unit, denominator, revision, missingness, confidence, and methodology/version metadata intact.
- Use TypeScript strictly; preserve the repository's `strict: true` and `noEmit: true` settings.
- Prefer small, reusable, strictly typed components and data contracts over duplicated UI or business logic.
- Keep scoring and data-processing rules out of presentation components.
- Avoid unrelated changes; implement only the requested scope and clean up obsolete code when a documented cutover makes it unnecessary.
- Do not add npm or Python dependencies without a written justification, explicit approval, and documentation of the dependency decision.
- Do not build dashboard UI before the Data, Scoring, and Data Model milestones in `docs/TASKS.md` are complete.
- Before considering an implementation complete, run the applicable checks, including `npm run lint` and `npm run build`, and report their results.
