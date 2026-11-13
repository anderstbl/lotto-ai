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
  selection_details?: SelectionDetails | null
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

export interface SelectionDetails {
  method?: string
  sampler?: string
  smoothing?: number
  weight_formula?: string
  bands?: Array<{ from: number; to: number; count: number }> | null
  unique_row_attempts?: number
  observed_counts_for_selected_numbers?: Array<{ number: number; count: number }>
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface PredictionRunAnalysis {
  prediction_run_id: string
  analysis_version: string
  game_numbers: number
  numbers_per_draw: number
  draw_count: number
  first_draw_date: string
  last_draw_date: string
  data_cutoff_at: string
  source_description: string
  source_dataset_hash: string
  random_seed: number
  generation_parameters: { [key: string]: JsonValue }
  excluded_draw_count: number
  validation_summary: { [key: string]: JsonValue }
  backtest_status: string
  created_at: string
}

export interface PredictionNumberStatistic {
  prediction_run_id: string
  number: number
  observed_count: number
  observed_frequency: number
  expected_count: number
  expected_frequency: number
  deviation_count: number
  standardized_deviation: number
  null_count_interval_lower: number
  null_count_interval_upper: number
  interval_level: number
  interval_method: string
}

export type RunDistribution =
  | { status: 'ready'; analysis: PredictionRunAnalysis; statistics: PredictionNumberStatistic[] }
  | { status: 'missing' | 'unavailable' | 'invalid' }
