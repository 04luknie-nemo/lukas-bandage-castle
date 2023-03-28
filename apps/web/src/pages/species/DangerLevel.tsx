const LABELS = ['', 'Cuddly', 'Nippy', 'Grumpy', 'Hazardous', 'Do not make eye contact']

export default function DangerLevel({ level }: { level: number }) {
  return (
    <span className={`danger danger-${level}`} title={LABELS[level]}>
      {'💀'.repeat(level)}
      <span className="danger-empty">{'💀'.repeat(5 - level)}</span>
    </span>
  )
}
