import type { SelectionDetails } from '@/types'

const samplers: Record<string, string> = {
  sequential_weighted_without_replacement: 'Sekventiel udvælgelse uden tilbagelægning',
  uniform_without_replacement_per_band: 'Uniform udvælgelse uden tilbagelægning i hvert interval',
}
const formulas: Record<string, string> = {
  '1': 'Ens vægt for hvert tal',
  'observed_count + 1': 'Historisk antal forekomster + 1',
  'max_observed_count + 1 - observed_count': 'Højeste historiske antal + 1 − tallets antal',
}

export default function SelectionMethod({ details }: { details: SelectionDetails | null | undefined }) {
  if (!details) return null
  return (
    <details className="selection-method">
      <summary>Beregningsprincip <span aria-hidden="true">＋</span></summary>
      <dl>
        {details.sampler && <div><dt>Udvælgelse</dt><dd>{samplers[details.sampler] ?? details.sampler}</dd></div>}
        {details.weight_formula && <div><dt>Vægtning i generatoren</dt><dd>{formulas[details.weight_formula] ?? details.weight_formula}</dd></div>}
        {typeof details.smoothing === 'number' && <div><dt>Udjævning (smoothing)</dt><dd>{details.smoothing.toLocaleString('da-DK')}</dd></div>}
        {details.bands?.length ? <div><dt>Fordeling på intervaller</dt><dd>{details.bands.map(b => `${b.count} tal fra ${b.from}–${b.to}`).join(' · ')}</dd></div> : null}
      </dl>
      <p>Vægtene styrer talvalget i generatoren. De er ikke en prognose for næste trækning.</p>
    </details>
  )
}
