import { useState } from 'react'
import type { ViewMode } from './types'
import Sidebar from './components/Sidebar'
import NotesBoard from './components/NotesBoard'
import TodoList from './components/TodoList'

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('notes')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {activeView === 'notes' ? <NotesBoard /> : <TodoList />}
      </main>
    </div>
  )
}
