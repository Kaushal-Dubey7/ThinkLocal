import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, MessageSquare, Loader2, Bot, User } from 'lucide-react'
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
}

export default function AIChat({ notes, activeNote }: AIChatProps) {
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
      ? `Note: "${activeNote.title}"\n${activeNote.content}`
      : notes.map(n => `Note: "${n.title}"\n${n.content}`).join('\n\n---\n\n')

    const systemPrompt = `You are a helpful personal assistant. The user's notes are:\n\n${notesContext}\n\nAnswer questions about them helpfully and concisely.`
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMsg.content}\nAssistant:`

    const result = await generate(fullPrompt)
    if (result) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result }])
    }
  }, [input, isGenerating, chatMode, activeNote, notes, generate])

  return (
    <div className="w-80 h-full flex flex-col border-l border-border bg-card/40">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground/90">AI Chat</h2>
        </div>
        <div className="flex gap-1">
          {(['all', 'current'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                chatMode === mode
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
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
          <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
            <Bot className="w-8 h-8 mx-auto text-primary/20" />
            <p>Ask anything about your notes</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] text-sm px-3 py-2 rounded-xl ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'glass rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-secondary" />
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-primary" />
            </div>
            <div className="glass max-w-[85%] text-sm px-3 py-2 rounded-xl rounded-bl-sm">
              <span className="cursor-blink">{output}</span>
            </div>
          </div>
        )}
      </div>

      {/* Token speed badge */}
      {tokensPerSecond && !isGenerating && (
        <div className="px-3 pb-1 flex justify-center">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
            {tokensPerSecond} tok/s
          </span>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your notes…"
            className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
          <Button size="icon" onClick={handleSend} disabled={isGenerating || !input.trim()} className="h-9 w-9">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
