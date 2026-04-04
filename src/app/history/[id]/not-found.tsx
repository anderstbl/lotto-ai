import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold mb-2">Run ikke fundet</h1>
      <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-6">
        Dette prediction run eksisterer ikke (eller er slettet).
      </p>
      <Link
        href="/history"
        className="text-sm px-4 py-2 rounded-lg inline-block"
        style={{ background: '#2a2a3a', color: 'var(--text)' }}
      >
        ← Tilbage til historik
      </Link>
    </div>
  )
}
