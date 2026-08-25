import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Section({
  id,
  kicker,
  title,
  desc,
  children,
  className = '',
}: {
  id?: string
  kicker?: string
  title: string
  desc?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 py-14 sm:py-20 ${className}`}>
      <div className="mb-8 sm:mb-10">
        {kicker && <div className="kicker mb-3">{kicker}</div>}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        {desc && <p className="mt-2 text-muted max-w-2xl text-sm sm:text-base">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'ghost', className = '', type = 'button', ...props }: ButtonProps) {
  const v = variant === 'primary' ? 'btn-primary' : 'btn-ghost'
  return <button type={type} className={`btn ${v} ${className}`} {...props} />
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="text-xs font-semibold">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="knob" />
      </button>
    </label>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`seg-btn ${o.value === value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Control({
  label,
  value,
  children,
}: {
  label: string
  value?: string | number
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
        {value !== undefined && <span className="mono text-xs text-acc">{value}</span>}
      </div>
      {children}
    </div>
  )
}
