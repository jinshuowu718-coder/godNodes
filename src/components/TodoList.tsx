import { useState } from 'react'
import type { TodoItem } from '../types'
import { useLocalStorage, useId } from '../hooks'
import {
  Plus, Trash2, CheckCircle2, Circle, ListTodo,
  AlertTriangle, ArrowUp, Minus, ChevronDown
} from 'lucide-react'
import { cn } from '../lib/utils'

const priorityConfig = {
  high: { label: '高', icon: ArrowUp, className: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  medium: { label: '中', icon: AlertTriangle, className: 'text-[hsl(35_80%_50%)]', bg: 'bg-[hsl(35_80%_50%/0.1)]', border: 'border-[hsl(35_80%_50%/0.2)]' },
  low: { label: '低', icon: Minus, className: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border' },
}

export default function TodoList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('goodnotes-todos', [])
  const [inputText, setInputText] = useState('')
  const [inputPriority, setInputPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const generateId = useId()

  const addTodo = () => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    const newTodo: TodoItem = {
      id: generateId(),
      text: trimmed,
      completed: false,
      priority: inputPriority,
      createdAt: Date.now(),
    }
    setTodos(prev => [newTodo, ...prev])
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTodo()
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed))
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  const PriorityIcon = priorityConfig[inputPriority].icon

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <ListTodo className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">待办事项</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {activeTodos.length} 项待完成
          </span>
        </div>

        {completedTodos.length > 0 && (
          <button
            onClick={clearCompleted}
            className="text-xs text-muted-foreground hover:text-destructive transition-smooth px-2 py-1 rounded hover:bg-destructive/10"
          >
            清除已完成 ({completedTodos.length})
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          {/* Priority picker */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-2 rounded-lg border text-xs font-medium transition-smooth',
                priorityConfig[inputPriority].bg,
                priorityConfig[inputPriority].border,
                priorityConfig[inputPriority].className
              )}
            >
              <PriorityIcon className="w-3.5 h-3.5" />
              {priorityConfig[inputPriority].label}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showPriorityMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-note-hover overflow-hidden animate-scale-in">
                {(['high', 'medium', 'low'] as const).map(p => {
                  const config = priorityConfig[p]
                  const Icon = config.icon
                  return (
                    <button
                      key={p}
                      onClick={() => { setInputPriority(p); setShowPriorityMenu(false) }}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted/50 transition-smooth',
                        config.className
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}优先级
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加新的待办事项..."
            className="flex-1 px-3 py-2 bg-muted/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-transparent focus:border-primary/30 focus:bg-card transition-smooth"
          />

          <button
            onClick={addTodo}
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth shadow-soft hover:shadow-glow active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-5 py-2 border-b border-border/30">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-smooth',
              filter === f
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            <span className="ml-1 opacity-60">
              {f === 'all' ? todos.length : f === 'active' ? activeTodos.length : completedTodos.length}
            </span>
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {filter === 'completed' ? '暂无已完成事项' : filter === 'active' ? '所有事项已完成!' : '暂无待办事项'}
              </p>
              <p className="text-xs mt-1">
                {filter === 'all' ? '在上方输入框添加新事项' : '切换筛选查看其他事项'}
              </p>
            </div>
          </div>
        ) : (
          filteredTodos.map((todo, index) => {
            const config = priorityConfig[todo.priority]
            const PIcon = config.icon
            return (
              <div
                key={todo.id}
                className={cn(
                  'group flex items-center gap-3 px-3 py-3 rounded-xl border transition-smooth hover:shadow-soft animate-fade-in',
                  todo.completed
                    ? 'bg-muted/30 border-border/30'
                    : 'bg-card border-border/50 hover:border-primary/20'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 transition-smooth"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary animate-check-pop" />
                  ) : (
                    <Circle className="w-5 h-5 text-border hover:text-primary transition-smooth" />
                  )}
                </button>

                {/* Priority indicator */}
                <div className={cn('flex-shrink-0', config.className)}>
                  <PIcon className="w-3.5 h-3.5" />
                </div>

                {/* Text */}
                <span className={cn(
                  'flex-1 text-sm transition-smooth',
                  todo.completed ? 'line-through text-muted-foreground/50' : 'text-foreground'
                )}>
                  {todo.text}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-smooth"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-smooth" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer stats */}
      {todos.length > 0 && (
        <div className="px-5 py-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>共 {todos.length} 项</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              {activeTodos.length} 进行中
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              {completedTodos.length} 已完成
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
