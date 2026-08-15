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
  const conteudo = aberto ? children : colapsadoExtra

  return (
    <div className="flex flex-col">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-2 px-5 py-5 select-none',
          conteudo && 'pb-3',
        )}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              !aberto && '-rotate-90',
            )}
          />
          <Icon className="size-4 shrink-0" />
          {titulo}
          {badge}
        </div>
        {acoes ? (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center">
            {acoes}
          </div>
        ) : null}
      </div>
      {conteudo ? <div className="px-5 pb-5">{conteudo}</div> : null}
    </div>
  )
}
