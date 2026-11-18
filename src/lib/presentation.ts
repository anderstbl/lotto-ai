import type { Prediction } from '@/types'

const strategies: Record<string, { label: string; description: string }> = {
  tilfaeldig: { label: 'Uniform udvælgelse', description: 'Tilfældig udvælgelse med samme sandsynlighed for alle gyldige rækker. Bruges som statistisk baseline.' },
  frekvens: { label: 'Frekvens', description: 'Tal vægtet efter deres observerede hyppighed i historiske trækninger.' },
  fordeling: { label: 'Intervalfordeling', description: 'Tal fordelt på tre intervaller for at variere rækkens sammensætning.' },
  omvendt_frekvens: { label: 'Omvendt frekvens', description: 'Tal vægtet mod dem, der optræder sjældnere i historiske trækninger.' },
}

export function strategyInfo(prediction: Prediction) {
  const key = prediction.strategy_type ?? ''
  return strategies[key] ?? {
    label: key.replace(/_/g, ' ') || 'Øvrige rækker',
    description: null,
  }
}

export function numberStats(numbers: number[]) {
  const even = numbers.filter(n => n % 2 === 0).length
  return { sum: numbers.reduce((sum, n) => sum + n, 0), even, odd: numbers.length - even }
}

export function predictionLabel(prediction: Prediction) {
  return prediction.strategy_type === 'tilfaeldig'
    ? prediction.label.replace(/^Tilfældig(?=\s|$)/i, 'Uniform')
    : prediction.label
}
