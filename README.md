# 🎱 LottoAI

**A Danish Lotto dashboard for AI-generated number suggestions, draw history, and model insights.**

LottoAI brings the latest predictions and their explanations into a responsive, dark-themed interface with colorful number balls, a restrained dark visual theme, and stored-run status. Explore alternative strategies, revisit earlier prediction runs, and compare historical backtest results—all with Danish labels and date formatting.

## What you can explore

| Page | Route | What it shows |
| --- | --- | --- |
| This week's picks | `/` | The latest stored run, a featured row, method groups, and row statistics. |
| Lotto simulator | `/simulator` | Try random rows against the latest winning numbers, manually or automatically, and track matches and fictional spending at 10 DKK per row. |
| Prediction history | `/history` | The 30 most recent prediction runs, including model versions and notes. |
| Run details | `/history/[id]` | The rows from a specific run, grouped by method. |
| Draw history | `/draws` | The latest 52 draws, bonus numbers, and number-frequency summaries. |
| Model insights | `/backtests` | The latest 50 backtests, scores, match counts, and summaries by strategy. |

This repository contains the **frontend, database queries and shared highscore API**. Prediction generation, draw imports, and backtest evaluation run outside this repository and must populate the database separately.

## Built with

- **Next.js 16.2.1** with the App Router and React Server Components
- **React 19.2.4** and **TypeScript 5**
- **Tailwind CSS 4** and custom CSS animations
- **Supabase** for reading predictions, draws, and evaluation results

## Run locally

### 1. Install dependencies

You need **Node.js 20.9 or newer**, npm, and access to a Supabase project containing the tables described below.

```bash
git clone https://github.com/anderstbl/lotto-ai.git
cd lotto-ai
npm ci
```

### 2. Configure the environment

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These are the exact variable names read by `src/lib/supabase.ts`. Use the project's public anon key; never place a service-role or secret key in a `NEXT_PUBLIC_` variable. `.env.local` is ignored by Git.

The app reads data without a user sign-in flow. Configure table grants and Row Level Security policies to permit anonymous reads of only the data intended for this dashboard. See Supabase's [Data API security guide](https://supabase.com/docs/guides/api/securing-your-api).

### 3. Start the app

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). A configured database with no records will display empty states until your backend adds data.

## Database expectations

The following contract is based on `src/types/index.ts` and `src/lib/queries.ts`. This repository does **not** include schema migrations, seed data, or backend jobs; provision a compatible database separately.

| Table | Expected fields |
| --- | --- |
| `prediction_runs` | `id`, `created_at`, `model_version`, `notes` |
| `predictions` | `id`, `prediction_run_id`, `rank`, `label`, `play_priority`, `strategy_type`, `numbers`, `explanation`, `rationale`, optional `selection_details` |
| `draws` | `id`, `draw_date`, `numbers`, `bonus_numbers`, `created_at` |
| `backtests` | `id`, `prediction_run_id`, `model_version`, `strategy_type`, `score`, `matches`, `notes`, `evaluated_at`, `created_at` |

- IDs are represented as strings, dates as date/timestamp strings, and number lists as numeric arrays in the application types.
- `predictions.prediction_run_id` links a prediction to its run. `backtests.prediction_run_id` may also reference a run, but can be null.
- Nullable metadata and evaluation fields are defined in `src/types/index.ts`.
- Prediction rows are ordered by ascending `rank`; the first row is featured for inspection. For validated `distribution_profile_v1` runs, rank follows the saved distribution score. Older runs retain display order and are labeled as such; neither indicates win probability. Runs and backtests are ordered by `created_at`, and draws by `draw_date`, newest first.
- The query layer also normalizes number lists stored as JSON-array strings or comma-separated strings.

The data pages render dynamically and query Supabase on each request. The frontend displays stored predictions and scores; it computes draw frequencies and strategy summaries for the records retrieved on the relevant page.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create a production build. |
| `npm test` | Validate snapshot integrity and run isolation (Node.js 22.6+). |
| `npm start` | Serve the production build after building. |

For production, configure the same environment variables on your host before building and running the app. Use a hosting environment that supports a Next.js server, since these pages need database access at request time.

## Project structure

```text
src/
├── app/
│   ├── page.tsx             # Latest predictions
│   ├── history/             # Run archive and individual run pages
│   ├── draws/               # Draw history and number frequencies
│   ├── backtests/           # Model and strategy insights
│   ├── layout.tsx           # Shared navigation, metadata, and footer
│   └── globals.css          # Theme and animations
├── components/              # Lotto balls, prediction cards, and navigation
├── lib/
│   ├── queries.ts           # Database reads and frequency calculation
│   └── supabase.ts          # Lazy-initialized Supabase client
└── types/
    └── index.ts             # Shared data contracts
```

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Missing Supabase environment-variable error | Add both variables to `.env.local` and restart the development server. |
| Empty pages despite existing data | Check the Supabase URL/key, table names, anonymous `SELECT` grants, and RLS read policies. Query failures are logged in the server terminal and return empty results. |
| No rows on the latest-picks page | Ensure a `prediction_runs` record exists and predictions reference that run's ID. The homepage selects the newest run, even if an older run has predictions. |

## A note on predictions

LottoAI is for entertainment and exploration. Lottery draws are random; historical frequencies, AI-generated suggestions, and backtest results do not guarantee future wins. Play responsibly.

## Interface conventions

The featured row appears directly below the page title. A compact status line underneath reports the saved row count and run timestamp, with model version and run ID in expandable details. It does not report live generator progress. Loading UI describes fetching saved data. Method explanations appear once per group; the original explanation and rationale strings remain available in expandable notes, deduplicated within each group. Row totals and even/odd counts are calculated directly from each row. A shared responsible-play disclaimer appears in the footer.


The expandable distribution panel reads immutable snapshots from `prediction_run_analyses` (one row per run) and `prediction_number_statistics` (36 rows per run). It displays the saved observed and expected frequencies, deviations, standardized deviations, reference intervals, source, date range, cutoff, exclusions, backtest status, seed and generation parameters. Exact field types are defined in `src/types/index.ts`. Both tables need anonymous SELECT access with RLS configured for the published data.

Both the homepage and historical run pages fetch the snapshot by the displayed run ID. Incomplete or inconsistent snapshots are withheld with an explicit message; older runs without snapshots remain readable. Query failures have a separate unavailable message. The panel never fills missing analysis with newer draws or a live 52-draw sample. The draw-history page continues to use its own latest-52 sample.

The reader checks the 7/36 game format, all 36 unique numbers, count totals, expected values, derived deviations, consistent intervals, run identity and chronological data boundaries. These are consistency checks, not an independent recomputation of the stored interval quantiles. Individual reference intervals are descriptive and are not a multiple-comparison-adjusted significance test or a forecast. Stored `selection_details` exposes the actual sampler, weights, smoothing and interval allocation under each strategy’s expandable calculation principle.

## Profile-based ranking

New runs may store `distribution_score`, `profile_probability` and `score_details` on each prediction, plus `ranking_version`, `ranking_definition` and `ranking_parameters` on the run analysis. `distribution_profile_v1` scores the joint even-count, three interval counts and sum profile by `100 * profile_combination_count / max_profile_combination_count` over all 8,347,680 possible rows. This describes profile-category frequency, not the chance of a particular row winning.

The frontend validates version, run identity, all ten unique rows and ranks, score formulas, profile values derived from the actual row, artifact identity, descending order, and the numeric lexicographic tie-breaker. It does not independently enumerate or verify the theoretical cache's counts. Validated runs display a global rank-ordered grid, scores out of 100, per-row score details and an explanation. Legacy runs have display numbers without scores or a “best pick” claim. Unavailable or inconsistent ranking data is not presented as a verified score.

## Simulator

One game at `/simulator` always targets the latest imported winning row up to today in Denmark, with the draw date displayed. Every attempt generates seven uniformly sampled distinct numbers (Web Crypto, rejection sampling, partial Fisher–Yates). Manual play opens an uncharged ready dialog; only “Start” generates and charges a ticket. Ten random rows then reveal automatically with a brief staggered animation, each row shows its match count, and a compact summary above the rows shows the best row and distribution of matches. The compact mobile layout keeps all ten rows and actions visible at common phone sizes. “Prøv igen” generates and charges a new ten-row ticket within the same dialog; “Luk” returns to the page with the result and cumulative receipt preserved. Closing during the reveal cleans up its timer. Reduced-motion preferences skip decorative movement while rows still reveal progressively. Six/seven matches are celebrated within the manual result, with an optional cash-out action. The computer section remains above manual play, running at roughly 1, 100 or 1,000 tickets per second and using its separate six/seven-match celebration dialog. Every ticket costs 100 fictional DKK (10 rows at 10 DKK); the weekly time equivalent assumes one ticket per week. A ticket is always fully evaluated and charged. Continue preserves spending; cash-out ends play without inventing a prize amount. No purchases are involved. Game state stays in browser memory, while explicitly submitted named highscores persist in Supabase.

Jackpot odds are 1 in 8,347,680 (`36 choose 7`). The cumulative chance is `1 - (1 - 1 / 8347680)^attempts`, not a promise of an eventual win. Bonus balls and prize payouts are excluded.

Run simulator checks with `node --experimental-strip-types --test src/lib/lotto-simulator.test.mjs` (Node 22.6+).


### Manual highscore

Only completed manual reveals can set the personal highscore, saved under `lottoai.manual-highscore.v1` in this browser's localStorage. The score is `10,000 × best matches on the current ticket + floor(9,999 / sqrt(manual tickets in this game))`; zero matches earn zero. Match tiers do not overlap, so more correct numbers always beat fewer. Equal rounded scores favor fewer attempts. Opening/closing the ready dialog and computer play never add manual attempts. Closing and reopening keeps the manual counter; resetting the game starts a new counter and retains the personal record. Storage failures leave a session-only record, clearly labeled. The permanent summary and fixed dialog/header/footer dimensions keep the popup stationary through ready, drawing, result and retry states.

Scoring checks: `node --experimental-strip-types --test src/lib/manual-score.test.mjs`.


### Shared named leaderboard

`GET /api/simulator/highscores` returns the top 20 entries, sorted by points descending, attempts ascending, creation time and ID. `POST` accepts an explicit player name, submission UUID, completed draw ID, seven row numbers and the manual attempt counter; it never accepts a score from the client. The opt-in form states that the name/result are public. Input is validated in the API and again in Postgres. The DB trigger recomputes matches from the stored draw and the generated `points` column uses the same formula as the game. A unique submission ID makes retries idempotent. Existing saved local records are not silently published.

The applied schema is retained in `supabase/schema/simulator_highscores.sql` (hosted migration `create_simulator_highscores`). RLS permits public reads and append-only submissions through explicitly granted input columns. Anonymous users cannot edit/delete entries, set timestamps or insert computed points/matches. No service-role key or additional deployment secrets are needed. The local `.env.local` remains ignored. Treat the table as an entertainment leaderboard: browser-generated rows and attempt counts are self-reported, not a server-authoritative anti-cheat protocol. No cash prizes or verified identities are involved.

New UI checks cover name entry, error/retry, persistence to a separate visitor, duplicate submissions, invalid payloads, unchanged manual popup geometry and mobile rendering. DB checks verify the generated score and anonymous read/insert/update/delete privileges. Validation checks: `node --experimental-strip-types --test src/lib/shared-highscore.test.mjs`.
