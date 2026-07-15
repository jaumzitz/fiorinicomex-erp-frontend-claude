import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Ship, BarChart3, Settings, Package } from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Boas-vindas', icon: LayoutDashboard, end: true },
  { to: '/processos', label: 'Processos de Importação', icon: Ship },
  { to: '/bi', label: 'BI', icon: BarChart3 },
  { to: '/admin', label: 'Administração', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border flex h-svh w-64 shrink-0 flex-col border-r">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
          <Package className="size-4.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Fiorini Comex</span>
          <span className="text-muted-foreground text-xs">Gestão de Importação</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
