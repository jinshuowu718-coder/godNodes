import { useState, useRef, useCallback } from 'react'
import type { StickyNote, NoteColor } from '../types'
import { useLocalStorage, useId } from '../hooks'
import NoteCard from './NoteCard'
import { Plus, StickyNote as StickyNoteIcon } from 'lucide-react'
import { cn } from '../lib/utils'

const defaultColors: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange']

export default function NotesBoard() {
  const [notes, setNotes] = useLocalStorage<StickyNote[]>('goodnotes-notes', [])
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow')
  const containerRef = useRef<HTMLDivElement>(null)
  const generateId = useId()

  const colorDots: Record<NoteColor, string> = {
    yellow: 'bg-[hsl(48_95%_82%)]',
    pink: 'bg-[hsl(340_80%_85%)]',
    blue: 'bg-[hsl(210_80%_85%)]',
    green: 'bg-[hsl(145_60%_82%)]',
    purple: 'bg-[hsl(270_60%_87%)]',
    orange: 'bg-[hsl(25_90%_83%)]',
  }

  const addNote = useCallback(() => {
    const container = containerRef.current
    const offsetX = (notes.length % 5) * 30
    const offsetY = (notes.length % 5) * 30
    const baseX = container ? Math.min(80 + offsetX, container.clientWidth - 220) : 80 + offsetX
    const baseY = container ? Math.min(80 + offsetY, container.clientHeight - 200) : 80 + offsetY

    const newNote: StickyNote = {
      id: generateId(),
      content: '',
      color: selectedColor,
      x: Math.max(0, baseX),
      y: Math.max(0, baseY),
      width: 200,
      height: 180,
      pinned: false,
      createdAt: Date.now(),
    }
    setNotes(prev => [...prev, newNote])
  }, [notes.length, selectedColor, generateId, setNotes])

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
  }, [setNotes])

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }, [setNotes])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <StickyNoteIcon className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">便签板</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {notes.length} 张
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Color selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg">
            {defaultColors.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-smooth hover:scale-110',
                  colorDots[c],
                  selectedColor === c ? 'border-foreground/40 scale-110' : 'border-transparent'
                )}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={addNote}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth shadow-soft hover:shadow-glow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            新建便签
          </button>
        </div>
      </div>

      {/* Notes Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden gradient-warm"
      >
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center">
              <StickyNoteIcon className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">还没有便签</p>
              <p className="text-xs mt-1">点击上方「新建便签」开始记录</p>
            </div>
          </div>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              containerRef={containerRef}
            />
          ))
        )}

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  )
}
