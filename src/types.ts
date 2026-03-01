export interface StickyNote {
  id: string
  content: string
  color: NoteColor
  x: number
  y: number
  width: number
  height: number
  pinned: boolean
  createdAt: number
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
}

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange'

export type ViewMode = 'notes' | 'todos'
