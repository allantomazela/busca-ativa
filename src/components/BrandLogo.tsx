import { cn } from '@/lib/utils'

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 p-2 shadow-lg shadow-primary/15">
        <img
          src="/brand-logo.webp"
          alt="Logo Replay Sports"
          width={207}
          height={256}
          className="h-full w-full object-contain"
        />
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <span className="block text-sm font-medium text-muted-foreground">Busca Ativa</span>
          <strong className="block truncate text-lg font-bold tracking-tight text-foreground">
            Replay Sports
          </strong>
        </div>
      )}
    </div>
  )
}

interface BrandLogoProps {
  compact?: boolean
  className?: string
}
