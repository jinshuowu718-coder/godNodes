import type { ViewMode } from '../types'
import { StickyNote, ListTodo } from 'lucide-react'
import { cn } from '../lib/utils'

interface SidebarProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const navItems = [
  { id: 'notes' as ViewMode, label: '便签', icon: StickyNote },
  { id: 'todos' as ViewMode, label: '待办', icon: ListTodo },
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-[68px] gradient-sidebar flex flex-col items-center py-5 gap-2 shadow-lg">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-6">
        <span className="text-primary-foreground font-bold text-lg">G</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-smooth group',
                isActive
                  ? 'bg-primary-foreground/20 backdrop-blur-sm'
                  : 'hover:bg-primary-foreground/10'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-smooth',
                isActive ? 'text-primary-foreground' : 'text-primary-foreground/60 group-hover:text-primary-foreground/80'
              )} />
              <span className={cn(
                'text-[10px] font-medium transition-smooth',
                isActive ? 'text-primary-foreground' : 'text-primary-foreground/50 group-hover:text-primary-foreground/70'
              )}>
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="text-[9px] text-primary-foreground/30 font-medium">
        v1.0
      </div>
    </aside>
  )
}
