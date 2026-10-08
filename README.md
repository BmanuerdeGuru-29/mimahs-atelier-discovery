# Mimah's Atelier – Business & Website Discovery Questionnaire

Phase 1: business discovery only. No production website has been built.

| File | What it is |
|---|---|
| `index.html` (+ `styles.css`, `app.js`) | **The working questionnaire.** Open `index.html` in a browser. No server needed. |
| `questionnaire-data.js` | **Single source of truth.** Every section/question. Edit here, then run `node build.js`. |
| `questionnaire.schema.json` | **Form 2:** machine-readable schema (sections, types, required flags, options, conditions). |
| `01-questionnaire.md` / `01-questionnaire-printable.html` | **Form 1:** human-readable questionnaire (printable on paper). |
| `03-discovery-summary-template.md` | **Form 3:** summary template with `{{questionId}}` placeholders. The app also generates a populated summary (`Download discovery summary`). |
| `02-instructions-for-mimah.md` | How Mimah completes it. |
| `assets-to-prepare.md` | Files Mimah should prepare. |
| `04-quality-audit-and-open-questions.md` | Audit against the brief + remaining questions. |
| `build.js`, `serve.js` | `node build.js` regenerates outputs; `node serve.js` previews at http://localhost:5177. |

Response file format: `{ meta, responses[], raw:{answers,status} }`. `raw` lets the app re-import progress.
