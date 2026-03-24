import { useState, useRef, useCallback } from 'react'
import { Sparkles, Tag, Mic, MicOff, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTextGen } from '@/hooks/useTextGen'
import { useSTT } from '@/hooks/useSTT'
import type { Note } from '@/store/notes'

interface NoteEditorProps {
  note: Note | null
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onTPS?: (tps: number) => void
}

export default function NoteEditor({ note, onUpdateNote, onTPS }: NoteEditorProps) {
  const { output: summaryOutput, isGenerating: isSummarizing, tokensPerSecond, generate } = useTextGen()
  const { isRecording, isTranscribing, startRecording, stopRecording } = useSTT()
  const [isTagging, setIsTagging] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleSummarize = useCallback(async () => {
    if (!note) return
    const trimmed = note.content.slice(0, 500)
    const prompt = `Summarize in 2 sentences:\n${trimmed}`
    const result = await generate(prompt, undefined, onTPS, 80)
    if (result && note) {
      onUpdateNote(note.id, { summary: result })
    }
  }, [note, generate, onUpdateNote, onTPS])

  const handleAutoTag = useCallback(async () => {
    if (!note) return
    setIsTagging(true)
    const trimmed = note.content.slice(0, 300)
    const prompt = `Output 3-5 tags as comma-separated words for:\n${trimmed}`
    const result = await generate(prompt, undefined, onTPS, 40)
    if (result && note) {
      const tags = result.split(',').map(t => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '')).filter(Boolean).slice(0, 5)
      onUpdateNote(note.id, { tags })
    }
    setIsTagging(false)
  }, [note, generate, onUpdateNote, onTPS])

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
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-9 h-9 text-primary/20" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-secondary/40" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground/50">No note selected</p>
            <p className="text-xs text-muted-foreground/70">Select a note or create a new one to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="p-5 border-b border-border/60 bg-card/20">
        <input
          ref={titleRef}
          value={note.title}
          onChange={e => onUpdateNote(note.id, { title: e.target.value })}
          className="w-full bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors duration-200"
          placeholder="Note title…"
        />
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap animate-fade-in">
            {note.tags.map((tag, i) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-primary/8 text-primary/90 border border-primary/15 transition-all duration-200 hover:bg-primary/15 hover:border-primary/25"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <textarea
          value={note.content}
          onChange={e => onUpdateNote(note.id, { content: e.target.value })}
          className="w-full min-h-[200px] bg-transparent text-foreground/90 text-sm leading-relaxed outline-none resize-none placeholder:text-muted-foreground/50 transition-colors duration-200"
          placeholder="Start writing your thoughts…"
        />

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="glass p-3 flex items-center gap-2 text-xs text-primary animate-fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Transcribing audio…</span>
            <div className="ml-auto flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Summary section */}
        {(note.summary || isSummarizing) && (
          <div className="glass p-4 space-y-2 animate-fade-in relative overflow-hidden">
            {isSummarizing && (
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            )}
            <div className="flex items-center gap-2 text-xs text-primary font-medium relative z-10">
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary
              {tokensPerSecond && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 font-mono border border-primary/15 transition-all duration-300">
                  {tokensPerSecond} tok/s
                </span>
              )}
            </div>
            <p className={`text-sm text-foreground/80 relative z-10 ${isSummarizing ? 'cursor-blink' : ''}`}>
              {isSummarizing ? summaryOutput : note.summary}
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="p-4 border-t border-border/60 bg-card/20 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isSummarizing || !note.content}
              className="gap-1.5 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
            >
              {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Summarize
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate AI summary of this note</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoTag}
              disabled={isTagging || !note.content}
              className="gap-1.5 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
            >
              {isTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
              Auto-tag
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-generate tags using AI</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              onClick={toggleRecording}
              disabled={isTranscribing}
              className={`gap-1.5 ml-auto transition-all duration-200 ${isRecording ? 'animate-pulse-glow' : 'hover:border-primary/40 hover:bg-primary/5'}`}
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
          </TooltipTrigger>
          <TooltipContent>{isRecording ? 'Stop recording' : 'Start voice input'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
