import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, MessageSquare, Loader2, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTextGen } from '@/hooks/useTextGen'
import type { Note } from '@/store/notes'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIChatProps {
  notes: Note[]
  activeNote: Note | null
  onTPS?: (tps: number) => void
}

export default function AIChat({ notes, activeNote, onTPS }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatMode, setChatMode] = useState<'all' | 'current'>('all')
  const { output, isGenerating, tokensPerSecond, generate } = useTextGen()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, output])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const notesContext = chatMode === 'current' && activeNote
      ? `"${activeNote.title}": ${activeNote.content.slice(0, 400)}`
      : notes.slice(0, 5).map(n => `"${n.title}": ${n.content.slice(0, 400)}`).join('\n---\n')

    const fullPrompt = `Context notes:\n${notesContext}\n\nUser: ${userMsg.content}\nAssistant:`

    const result = await generate(fullPrompt, undefined, onTPS, 128)
    if (result) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result }])
    }
  }, [input, isGenerating, chatMode, activeNote, notes, generate, onTPS])

  return (
    <div className="w-80 h-full flex flex-col border-l border-border/60 bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/60 space-y-3 bg-card/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground/90">AI Chat</h2>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/8 border border-green-500/15">
            <Sparkles className="w-2.5 h-2.5 text-green-400" />
            <span className="text-[10px] text-green-400/90">Local</span>
          </div>
        </div>
        <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5">
          {(['all', 'current'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`flex-1 text-[11px] px-2.5 py-1.5 rounded-md transition-all duration-200 font-medium ${
                chatMode === mode
                  ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground/70 border border-transparent'
              }`}
            >
              {mode === 'all' ? 'All notes' : 'This note'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isGenerating && (
          <div className="text-center py-12 text-muted-foreground text-xs space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
              <Bot className="w-7 h-7 text-primary/20" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground/40">Ask your AI assistant</p>
              <p className="text-muted-foreground/60">It can search and reason about your notes</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-primary/10">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-lg shadow-primary/10'
                : 'glass rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-secondary/10">
                <User className="w-3 h-3 text-secondary" />
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-primary/10">
              <Bot className="w-3 h-3 text-primary" />
            </div>
            <div className="glass max-w-[85%] text-sm px-3 py-2 rounded-xl rounded-bl-sm">
              {output ? (
                <span className="cursor-blink">{output}</span>
              ) : (
                <div className="flex items-center gap-1 py-1 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Token speed badge */}
      {tokensPerSecond && !isGenerating && (
        <div className="px-3 pb-1 flex justify-center animate-fade-in">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/8 text-primary font-mono border border-primary/15 transition-all duration-300">
            ⚡ {tokensPerSecond} tok/s
          </span>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/60 bg-card/40">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your notes…"
            className="flex-1 bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all duration-200"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="h-9 w-9 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
