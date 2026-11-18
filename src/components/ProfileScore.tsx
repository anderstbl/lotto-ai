import type { Prediction } from '@/types'

export function scoreLabel(value: number) {
  return value.toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export default function ProfileScore({ prediction }: { prediction: Prediction }) {
  const d = prediction.score_details
  if (!d || typeof prediction.distribution_score !== 'number') return null
  return (
    <details className="profile-score-details">
      <summary>Scoregrundlag <span aria-hidden="true">＋</span></summary>
      <dl>
        <div><dt>Lige / ulige</dt><dd>{d.profile.even_count} / {7 - d.profile.even_count}</dd></div>
        <div><dt>Sum</dt><dd>{d.profile.sum}</dd></div>
        <div><dt>Tal i 1–12 / 13–24 / 25–36</dt><dd>{d.profile.band_1_12_count} / {d.profile.band_13_24_count} / {d.profile.band_25_36_count}</dd></div>
        <div><dt>Rækker med samme profil</dt><dd>{d.profile_combination_count.toLocaleString('da-DK')} af {d.total_combinations.toLocaleString('da-DK')}</dd></div>
      </dl>
      <p>Fordelingsscore = 100 × {d.profile_combination_count.toLocaleString('da-DK')} / {d.max_profile_combination_count.toLocaleString('da-DK')} = {scoreLabel(prediction.distribution_score)}.</p>
      <p>Profilen deles af {(prediction.profile_probability! * 100).toLocaleString('da-DK', { maximumFractionDigits: 3 })} % af alle gyldige rækker. Det er en andel for hele profilgruppen, ikke denne rækkes vinderchance.</p>
    </details>
  )
}
