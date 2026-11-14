import type { PredictionRunAnalysis } from '@/types'

export default function RankingExplanation({ analysis }: { analysis: PredictionRunAnalysis }) {
  return (
    <details className="method-details ranking-explanation">
      <summary>Sådan rangerer vi <span aria-hidden="true">＋</span></summary>
      <div>
        <p>Rank følger fordelingsscoren blandt denne kørsels ti forslag. Profilen omfatter antal lige tal, antal tal i intervallerne 1–12, 13–24 og 25–36 samt tallenes sum.</p>
        <p>Alle 8.347.680 mulige 7/36-rækker indgår i den teoretiske profilfordeling. Egenskaberne tælles samlet, så deres indbyrdes afhængighed indgår.</p>
        <p className="score-formula mono">Score = 100 × profilens antal rækker / største profilantal</p>
        <p>100 er scoren for en af de mest almindelige profiler i modellen. Det er ikke 100 % vinderchance. Alle bestemte gyldige rækker har samme chance ved en fair trækning.</p>
        <p>Scorer vises afrundet til én decimal. Rangeringen bruger de uafrundede værdier. Ved samme score afgør numerisk rækkefølge af de sorterede tal placeringen; det udtrykker ingen statistisk forskel.</p>
        <p className="muted mono">Version: {analysis.ranking_version}</p>
      </div>
    </details>
  )
}
