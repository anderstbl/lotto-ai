# 🎱 LottoAI

**A Danish Lotto dashboard for AI-generated number suggestions, draw history, and model insights.**

LottoAI brings the latest predictions and their explanations into a responsive, dark-themed interface with purple and gold accents. Explore alternative strategies, revisit earlier prediction runs, and compare historical backtest results—all with Danish labels and date formatting.

## What you can explore

| Page | Route | What it shows |
| --- | --- | --- |
| This week's picks | `/` | The latest prediction run, its top-ranked suggestion, alternative rows, and strategy explanations. |
| Lotto simulator | `/simulator` | Pick 7 of 36, simulate independent draws, and track fictional spending, matches, and weekly time equivalents. The original mode works without database access; the historical quick search loads last week’s draw. |
| Prediction history | `/history` | The 30 most recent prediction runs, including model versions and notes. |
| Run details | `/history/[id]` | The ranked predictions from a specific run. |
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
| `predictions` | `id`, `prediction_run_id`, `rank`, `label`, `play_priority`, `strategy_type`, `numbers`, `explanation`, `rationale` |
| `draws` | `id`, `draw_date`, `numbers`, `bonus_numbers`, `created_at` |
| `backtests` | `id`, `prediction_run_id`, `model_version`, `strategy_type`, `score`, `matches`, `notes`, `evaluated_at`, `created_at` |

- IDs are represented as strings, dates as date/timestamp strings, and number lists as numeric arrays in the application types.
- `predictions.prediction_run_id` links a prediction to its run. `backtests.prediction_run_id` may also reference a run, but can be null.
- Nullable metadata and evaluation fields are defined in `src/types/index.ts`.
- Prediction rows are ordered by ascending `rank`; the first row is highlighted as the primary suggestion. Runs and backtests are ordered by `created_at`, and draws by `draw_date`, newest first.
- The query layer also normalizes number lists stored as JSON-array strings or comma-separated strings.

The data pages render dynamically and query Supabase on each request. The frontend displays stored predictions and scores; it computes draw frequencies and strategy summaries for the records retrieved on the relevant page.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create a production build. |
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

## Simulator

The simulator runs entirely in the browser using uniformly sampled draws without replacement (Web Crypto, rejection sampling, partial Fisher–Yates). Each attempt compares the same seven chosen numbers against a new independent draw. It pauses on jackpot or one million attempts; manual pause, reset, and three speed settings are available. The adjustable row price defaults to an explicitly labeled 5 DKK example, and spending excludes winnings. No purchases or stored results are involved.

Jackpot odds are 1 in 8,347,680 (`36 choose 7`). The cumulative chance is `1 - (1 - 1 / 8347680)^attempts`, not a promise of an eventual win. Bonus balls and prize payouts are excluded.

Run the simulator math checks with `node --experimental-strip-types --test src/lib/lotto-simulator.test.mjs src/lib/jackpot-search.test.mjs` (Node 22.6+).

### Historical quick search

“Lynjagten” uses the most recent imported draw from the previous Monday–Sunday calendar week in `Europe/Copenhagen`, and shows its exact date. Missing database configuration, missing draws and invalid winning numbers leave the challenge unavailable while the original simulator remains usable. The draw loads in a streamed server component.

A dedicated Web Worker samples uniform combination ranks (one rank per possible seven-number row), using unbiased Web Crypto random integers. This is equivalent to generating independent random rows and comparing all seven numbers, without allocating and sorting millions of arrays. It reports the precise attempt of the first match and elapsed time, has no one-million-attempt cap, and terminates on success, manual stop or navigation. Stopping shows the last reported attempt count as a lower bound; each new run starts at zero. The search never writes to the database.
