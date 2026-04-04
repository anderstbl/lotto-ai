export interface Draw {
  id: string
  draw_date: string
  numbers: number[]
  bonus_numbers: number[]
  created_at: string
}

export interface PredictionRun {
  id: string
  created_at: string
  model_version: string | null
  notes: string | null
}

export interface Prediction {
  id: string
  prediction_run_id: string
  rank: number
  label: string
  play_priority: number | null
  strategy_type: string | null
  numbers: number[]
  explanation: string | null
  rationale: string | null
}

export interface Backtest {
  id: string
  prediction_run_id: string | null
  model_version: string | null
  strategy_type: string | null
  score: number | null
  matches: number | null
  notes: string | null
  evaluated_at: string | null
  created_at: string
}
