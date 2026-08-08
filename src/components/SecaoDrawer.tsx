import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function SecaoDrawer({
  icon: Icon,
  titulo,
  badge,
  acoes,
  aberto,
  onToggle,
  colapsadoExtra,
  children,
}: {
  icon: LucideIcon
  titulo: string
  badge?: ReactNode
  acoes?: ReactNode
  aberto: boolean
  onToggle: () => void
  colapsadoExtra?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              !aberto && '-rotate-90',
            )}
          />
          <Icon className="size-4 shrink-0" />
          {titulo}
          {badge}
        </button>
        {acoes}
      </div>
      {aberto ? children : colapsadoExtra}
    </div>
  )
}
