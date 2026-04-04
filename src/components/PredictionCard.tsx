import type { Prediction } from '@/types'
import LottoBall from './LottoBall'

const strategyEmoji: Record<string, string> = {
  'best_guess': '🏆',
  'strong_backup': '💪',
  'solid_alternative': '🎯',
  'balanced_play': '⚖️',
  'anti_crowding': '🦄',
  'wildcard': '🃏',
}

interface Props {
  prediction: Prediction
  index: number
}

export default function PredictionCard({ prediction, index }: Props) {
  const emoji = strategyEmoji[prediction.strategy_type ?? ''] ?? '🎱'
  const text = prediction.explanation ?? prediction.rationale ?? null

  return (
    <div
      className="card p-4 flex flex-col gap-3"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'kapow 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#2a2a3a', color: 'var(--text-muted)' }}
          >
            #{prediction.rank}
          </span>
          <span className="font-semibold text-sm">{prediction.label}</span>
          <span className="text-base">{emoji}</span>
        </div>
        {prediction.strategy_type && (
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#1e1e2a', color: '#666680', border: '1px solid #2a2a3a' }}
          >
            {prediction.strategy_type.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[...prediction.numbers].sort((a, b) => a - b).map((n) => (
          <LottoBall key={n} number={n} size="md" />
        ))}
      </div>

      {text && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  )
}
