export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="9.5" y="9.5" width="13" height="13" stroke="var(--accent)" strokeWidth="2" />
      <rect x="9.5" y="9.5" width="13" height="13" stroke="var(--accent-2)" strokeWidth="2" transform="rotate(45 16 16)" />
      <rect x="0.5" y="0.5" width="3" height="3" fill="var(--accent)" />
      <rect x="28" y="0.5" width="3" height="3" fill="var(--accent-3)" />
      <rect x="0.5" y="28" width="3" height="3" fill="var(--accent-3)" />
      <rect x="28" y="28" width="3" height="3" fill="var(--accent)" />
    </svg>
  )
}
