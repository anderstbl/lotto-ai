// Color bands matching Danish Lotto ball colors (roughly)
function ballColor(n: number): { bg: string; shadow: string } {
  if (n <= 5)  return { bg: 'linear-gradient(135deg, #e53e3e, #c53030)', shadow: '#c53030' }
  if (n <= 10) return { bg: 'linear-gradient(135deg, #dd6b20, #c05621)', shadow: '#c05621' }
  if (n <= 15) return { bg: 'linear-gradient(135deg, #d69e2e, #b7791f)', shadow: '#b7791f' }
  if (n <= 20) return { bg: 'linear-gradient(135deg, #38a169, #276749)', shadow: '#276749' }
  if (n <= 25) return { bg: 'linear-gradient(135deg, #3182ce, #2b6cb0)', shadow: '#2b6cb0' }
  if (n <= 30) return { bg: 'linear-gradient(135deg, #6b46c1, #553c9a)', shadow: '#553c9a' }
  if (n <= 35) return { bg: 'linear-gradient(135deg, #d53f8c, #b83280)', shadow: '#b83280' }
  return         { bg: 'linear-gradient(135deg, #718096, #4a5568)', shadow: '#4a5568' }
}

interface Props {
  number: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function LottoBall({ number, size = 'md', animate = false }: Props) {
  const { bg, shadow } = ballColor(number)
  const sizeClass = size === 'sm' ? 'lotto-ball-sm' : size === 'lg' ? 'lotto-ball-lg' : ''

  return (
    <span
      className={`lotto-ball ${sizeClass} ${animate ? 'float-anim' : ''}`}
      style={{
        background: bg,
        boxShadow: `0 3px 10px ${shadow}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      }}
    >
      {number}
    </span>
  )
}
