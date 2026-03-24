import { useState, useMemo } from 'react'
import { Plus, FileText, Trash2, Search, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Note } from '@/store/notes'

interface NotesSidebarProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onNewNote: () => void
  onDeleteNote: (id: string) => void
}

export default function NotesSidebar({ notes, activeNoteId, onSelectNote, onNewNote, onDeleteNote }: NotesSidebarProps) {
  const [search, setSearch] = useState('')

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [notes, search])

  return (
    <div className="w-64 h-full flex flex-col border-r border-border/60 bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <StickyNote className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground/90">Notes</h2>
            {notes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono">
                {notes.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewNote}
            className="h-8 w-8 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-muted/20 border border-border/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/15 placeholder:text-muted-foreground/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNotes.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-xs space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-primary/15" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground/40">
                {search ? 'No matches found' : 'No notes yet'}
              </p>
              <p className="text-muted-foreground/50 text-[11px]">
                {search ? 'Try a different search' : 'Create your first note!'}
              </p>
            </div>
          </div>
        )}
        {filteredNotes.map((note, i) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in ${
              activeNoteId === note.id
                ? 'bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5'
                : 'hover:bg-muted/30 border border-transparent hover:border-border/30'
            }`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 ${
                    activeNoteId === note.id ? 'text-primary/70' : 'text-muted-foreground/50'
                  }`} />
                  <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
                </div>
                {note.content && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 pl-5.5">{note.content.slice(0, 80)}</p>
                )}
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap pl-5.5">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/8 text-primary/80 border border-primary/10">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground/50">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeleteNote(note.id) }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-destructive/10 hover:scale-110"
              >
                <Trash2 className="w-3 h-3 text-destructive/70" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-1.5 pl-5.5">
              {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
