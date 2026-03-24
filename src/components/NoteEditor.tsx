import { useState, useRef, useCallback } from 'react'
import { Sparkles, Tag, Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTextGen } from '@/hooks/useTextGen'
import { useSTT } from '@/hooks/useSTT'
import type { Note } from '@/store/notes'

interface NoteEditorProps {
  note: Note | null
  onUpdateNote: (id: string, updates: Partial<Note>) => void
}

export default function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const { output: summaryOutput, isGenerating: isSummarizing, tokensPerSecond, generate } = useTextGen()
  const { isRecording, isTranscribing, startRecording, stopRecording } = useSTT()
  const [isTagging, setIsTagging] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleSummarize = useCallback(async () => {
    if (!note) return
    const prompt = `Summarize the following note concisely in 2-3 sentences:\n\n${note.content}`
    const result = await generate(prompt)
    if (result && note) {
      onUpdateNote(note.id, { summary: result })
    }
  }, [note, generate, onUpdateNote])

  const handleAutoTag = useCallback(async () => {
    if (!note) return
    setIsTagging(true)
    const prompt = `Generate exactly 3-5 short tags (single words or two-word phrases) for this note. Output ONLY the tags separated by commas, nothing else:\n\n${note.content}`
    const result = await generate(prompt)
    if (result && note) {
      const tags = result.split(',').map(t => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '')).filter(Boolean).slice(0, 5)
      onUpdateNote(note.id, { tags })
    }
    setIsTagging(false)
  }, [note, generate, onUpdateNote])

  const toggleRecording = useCallback(async () => {
    if (!note) return

    if (!isRecording) {
      await startRecording()
    } else {
      const transcript = await stopRecording()
      if (transcript && note) {
        const separator = note.content ? '\n' : ''
        onUpdateNote(note.id, { content: note.content + separator + transcript })
      }
    }
  }, [isRecording, note, startRecording, stopRecording, onUpdateNote])

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-primary/30" />
          <p className="text-sm">Select a note or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="p-4 border-b border-border">
        <input
          ref={titleRef}
          value={note.title}
          onChange={e => onUpdateNote(note.id, { title: e.target.value })}
          className="w-full bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Note title…"
        />
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <textarea
          value={note.content}
          onChange={e => onUpdateNote(note.id, { content: e.target.value })}
          className="w-full min-h-[200px] bg-transparent text-foreground/90 text-sm leading-relaxed outline-none resize-none placeholder:text-muted-foreground"
          placeholder="Start writing your thoughts…"
        />

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="glass p-3 flex items-center gap-2 text-xs text-primary animate-fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Transcribing audio…
          </div>
        )}

        {/* Summary section */}
        {(note.summary || isSummarizing) && (
          <div className="glass p-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary
              {tokensPerSecond && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 font-mono">
                  {tokensPerSecond} tok/s
                </span>
              )}
            </div>
            <p className={`text-sm text-foreground/80 ${isSummarizing ? 'cursor-blink' : ''}`}>
              {isSummarizing ? summaryOutput : note.summary}
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="p-4 border-t border-border flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={isSummarizing || !note.content}
          className="gap-1.5"
        >
          {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Summarize
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoTag}
          disabled={isTagging || !note.content}
          className="gap-1.5"
        >
          {isTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
          Auto-tag
        </Button>
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          size="sm"
          onClick={toggleRecording}
          disabled={isTranscribing}
          className="gap-1.5 ml-auto"
        >
          {isTranscribing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
          {isTranscribing ? 'Transcribing…' : isRecording ? 'Stop' : 'Voice'}
        </Button>
      </div>
    </div>
  )
}
