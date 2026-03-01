import { useState, useRef, useCallback, useEffect } from 'react'
import type { StickyNote, NoteColor } from '../types'
import { Pin, Trash2, GripVertical, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '../lib/utils'

const colorClasses: Record<NoteColor, string> = {
  yellow: 'note-yellow',
  pink: 'note-pink',
  blue: 'note-blue',
  green: 'note-green',
  purple: 'note-purple',
  orange: 'note-orange',
}

const colorDots: Record<NoteColor, string> = {
  yellow: 'bg-[hsl(48_95%_72%)]',
  pink: 'bg-[hsl(340_80%_75%)]',
  blue: 'bg-[hsl(210_80%_75%)]',
  green: 'bg-[hsl(145_60%_70%)]',
  purple: 'bg-[hsl(270_60%_77%)]',
  orange: 'bg-[hsl(25_90%_73%)]',
}

interface NoteCardProps {
  note: StickyNote
  onUpdate: (id: string, updates: Partial<StickyNote>) => void
  onDelete: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function NoteCard({ note, onUpdate, onDelete, containerRef }: NoteCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0, startY: 0, origX: 0, origY: 0,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isEditing) return
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: note.x,
      origY: note.y,
    }
  }, [isEditing, note.x, note.y])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      let newX = dragRef.current.origX + dx
      let newY = dragRef.current.origY + dy

      // Clamp within container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        newX = Math.max(0, Math.min(newX, rect.width - note.width))
        newY = Math.max(0, Math.min(newY, rect.height - note.height))
      }

      onUpdate(note.id, { x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, note.id, note.width, note.height, onUpdate, containerRef])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(note.id, { content: e.target.value })
  }

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(note.id, { pinned: !note.pinned })
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleColorChange = (color: NoteColor) => {
    onUpdate(note.id, { color })
    setShowColorPicker(false)
  }

  const expandedStyle = isExpanded
    ? { width: 320, height: 280 }
    : { width: note.width, height: note.height }

  return (
    <div
      ref={noteRef}
      className={cn(
        'absolute rounded-lg transition-shadow duration-200 flex flex-col group',
        colorClasses[note.color],
        isDragging ? 'shadow-note-hover z-50 cursor-grabbing scale-[1.02]' : 'shadow-note z-10 hover:shadow-note-hover',
        note.pinned && 'ring-2 ring-primary/30',
        'animate-scale-in'
      )}
      style={{
        left: note.x,
        top: note.y,
        width: expandedStyle.width,
        height: expandedStyle.height,
        transition: isDragging ? 'box-shadow 0.2s, transform 0.1s' : 'all 0.2s ease',
      }}
    >
      {/* Header / Drag Handle */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity" />
          {/* Color picker trigger */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker) }}
            className={cn(
              'w-3.5 h-3.5 rounded-full border border-foreground/10 transition-smooth hover:scale-125',
              colorDots[note.color]
            )}
          />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleExpand}
            className="p-1 rounded hover:bg-foreground/10 transition-smooth"
          >
            {isExpanded
              ? <Minimize2 className="w-3 h-3 text-foreground/50" />
              : <Maximize2 className="w-3 h-3 text-foreground/50" />
            }
          </button>
          <button
            onClick={togglePin}
            className={cn(
              'p-1 rounded hover:bg-foreground/10 transition-smooth',
              note.pinned && 'animate-pin-bounce'
            )}
          >
            <Pin className={cn('w-3 h-3', note.pinned ? 'text-primary fill-primary' : 'text-foreground/50')} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
            className="p-1 rounded hover:bg-destructive/20 transition-smooth"
          >
            <Trash2 className="w-3 h-3 text-foreground/50 hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Color Picker Dropdown */}
      {showColorPicker && (
        <div className="absolute top-9 left-3 z-50 flex gap-1.5 bg-card p-2 rounded-lg shadow-note-hover animate-scale-in">
          {(Object.keys(colorDots) as NoteColor[]).map(c => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-smooth hover:scale-125',
                colorDots[c],
                note.color === c ? 'border-foreground/40 scale-110' : 'border-transparent'
              )}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 px-3 pb-3 note-texture overflow-hidden"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={note.content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            className="w-full h-full bg-transparent resize-none outline-none text-sm leading-[28px] text-foreground/80 placeholder:text-foreground/30"
            placeholder="双击编辑便签内容..."
          />
        ) : (
          <p className="text-sm leading-[28px] text-foreground/80 whitespace-pre-wrap break-words cursor-text">
            {note.content || '双击编辑便签内容...'}
          </p>
        )}
      </div>
    </div>
  )
}
