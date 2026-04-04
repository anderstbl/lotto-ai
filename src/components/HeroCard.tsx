import type { Prediction } from '@/types'
import LottoBall from './LottoBall'

interface Props {
  prediction: Prediction
}

export default function HeroCard({ prediction }: Props) {
  const text = prediction.explanation ?? prediction.rationale ?? null

  return (
    <div
      className="hero-card-animate relative overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{
        background: 'linear-gradient(135deg, #1a1040 0%, #0f0f1a 40%, #1a0f30 100%)',
        border: '1px solid #4a3080',
        boxShadow: '0 0 60px rgba(108,63,197,0.3), 0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Glow orbs */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6c3fc5, transparent)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f5c518, transparent)' }}
      />

      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase"
          style={{
            background: 'linear-gradient(90deg, #f5c518, #d4a812)',
            color: '#0d0d14',
            boxShadow: '0 2px 12px rgba(245,197,24,0.4)',
          }}
        >
          Bedste Bud 🏆
        </span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ background: 'rgba(108,63,197,0.3)', color: '#b39ddb', border: '1px solid #6c3fc5' }}
        >
          Rank #1
        </span>
      </div>

      {/* Label */}
      <h2
        className="text-2xl sm:text-3xl font-black mb-1 shimmer-text"
      >
        {prediction.label}
      </h2>

      {/* Numbers */}
      <div className="flex flex-wrap gap-3 mt-5 mb-5">
        {[...prediction.numbers].sort((a, b) => a - b).map((n, i) => (
          <LottoBall
            key={n}
            number={n}
            size="lg"
            animate={i % 2 === 0}
          />
        ))}
      </div>

      {/* Explanation */}
      {text && (
        <p
          className="text-sm leading-relaxed mt-3 max-w-lg"
          style={{ color: '#b0a0cc' }}
        >
          {text}
        </p>
      )}

      {/* Strategy chip */}
      {prediction.strategy_type && (
        <div className="mt-4">
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'rgba(245,197,24,0.1)', color: '#f5c518', border: '1px solid rgba(245,197,24,0.3)' }}
          >
            Strategi: {prediction.strategy_type.replace(/_/g, ' ')}
          </span>
        </div>
      )}
    </div>
  )
}
