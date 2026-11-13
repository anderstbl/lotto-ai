'use client'

export default function AnalysisLink() {
  return (
    <a href="#statistics-panel" className="outline-link" onClick={() => {
      const panel = document.getElementById('statistics-panel')
      if (panel instanceof HTMLDetailsElement) panel.open = true
    }}>
      Se fordelingsanalysen
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14m-6-6 6 6 6-6" /></svg>
    </a>
  )
}
