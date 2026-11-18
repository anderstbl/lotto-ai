interface Props {
  number: number
  size?: 'sm' | 'md' | 'lg'
}

export default function LottoBall({ number, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'lotto-ball-sm' : size === 'lg' ? 'lotto-ball-lg' : ''
  const colorBand = Math.min(6, Math.max(1, Math.ceil(number / 6)))
  return <span className={`lotto-ball ball-color-${colorBand} ${sizeClass}`}>{number}</span>
}
