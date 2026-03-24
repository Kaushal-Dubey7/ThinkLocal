import { Plus, FileText, Trash2 } from 'lucide-react'
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
  return (
    <div className="w-64 h-full flex flex-col border-r border-border bg-card/40">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground/90">Notes</h2>
        <Button variant="ghost" size="icon" onClick={onNewNote} className="h-8 w-8">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No notes yet. Create one!
          </div>
        )}
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`group p-3 rounded-lg cursor-pointer transition-all duration-150 ${
              activeNoteId === note.id
                ? 'bg-primary/10 border border-primary/20'
                : 'hover:bg-muted/50 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
                </div>
                {note.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content.slice(0, 80)}</p>
                )}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeleteNote(note.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
