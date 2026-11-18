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

This repository contains the **frontend and its database queries**. Prediction generation, draw imports, and backtest evaluation run outside this repository and must populate the database separately.

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

One game at `/simulator` always targets the latest imported winning row up to today in Denmark, with the draw date displayed. Every attempt generates seven uniformly sampled distinct numbers (Web Crypto, rejection sampling, partial Fisher–Yates). Try one ten-row ticket at a time with a prominent lottery-drum dialog that remains open until “Vis min kupon” is selected and a ten-row result card, or run at roughly 1, 100 or 1,000 tickets per second. Every ticket costs 100 fictional DKK (10 rows at 10 DKK). The weekly time equivalent assumes one ten-row ticket per week. A ticket is always fully evaluated and charged, including when an early row wins. Manual and automatic play share counts and best rows; the game pauses before buying the next ticket after either six or seven matches. A celebration dialog shows the winning row, ticket count and exact cumulative cost. Continuing acknowledges the event without resetting spending; cashing out ends play and displays a final receipt, without inventing a prize payout. Escape dismisses the prize dialog into a paused game. Reduced-motion preferences show a static drum; an explicit playback button lets the visitor start or pause the animation. The computer section appears above “Prøv selv”; both sections share one game and receipt. Pause, resume and reset are available; there is no one-million-row cap. Missing or invalid draw data disables play with an explicit message. No purchases or stored results are involved.

Jackpot odds are 1 in 8,347,680 (`36 choose 7`). The cumulative chance is `1 - (1 - 1 / 8347680)^attempts`, not a promise of an eventual win. Bonus balls and prize payouts are excluded.

Run simulator checks with `node --experimental-strip-types --test src/lib/lotto-simulator.test.mjs` (Node 22.6+).
