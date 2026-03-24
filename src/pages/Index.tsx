import { useState, useCallback } from 'react'
import { loadNotes, saveNotes, createNote, deleteNote, updateNote, type Note } from '@/store/notes'
import NotesSidebar from '@/components/NotesSidebar'
import NoteEditor from '@/components/NoteEditor'
import AIChat from '@/components/AIChat'
import StatusBar from '@/components/StatusBar'
import ModelLoader from '@/components/ModelLoader'

const Index = () => {
  const [appReady, setAppReady] = useState(false)
  const [notes, setNotes] = useState<Note[]>(() => loadNotes())
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [modelReady, setModelReady] = useState(false)
  const [lastTPS, setLastTPS] = useState<number | null>(null)

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null

  const persistNotes = useCallback((updated: Note[]) => {
    setNotes(updated)
    saveNotes(updated)
  }, [])

  const handleNewNote = useCallback(() => {
    const note = createNote()
    const updated = [note, ...notes]
    persistNotes(updated)
    setActiveNoteId(note.id)
  }, [notes, persistNotes])

  const handleDeleteNote = useCallback((id: string) => {
    const updated = deleteNote(notes, id)
    persistNotes(updated)
    if (activeNoteId === id) setActiveNoteId(updated[0]?.id ?? null)
  }, [notes, activeNoteId, persistNotes])

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updated = updateNote(notes, id, updates)
    persistNotes(updated)
  }, [notes, persistNotes])

  const handleReady = useCallback(() => {
    setAppReady(true)
    setModelReady(true)
  }, [])

  if (!appReady) {
    return <ModelLoader onReady={handleReady} />
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        <NotesSidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          onDeleteNote={handleDeleteNote}
        />
        <NoteEditor note={activeNote} onUpdateNote={handleUpdateNote} />
        <AIChat notes={notes} activeNote={activeNote} />
      </div>
      <StatusBar
        modelReady={modelReady}
        accelerationMode="CPU"
        lastTPS={lastTPS}
      />
    </div>
  )
}

export default Index
