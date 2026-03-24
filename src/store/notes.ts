export interface Note {
  id: string
  title: string
  content: string
  summary: string
  createdAt: string
  tags: string[]
}

const STORAGE_KEY = 'thinklocal_notes'

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function createNote(partial?: Partial<Note>): Note {
  return {
    id: crypto.randomUUID(),
    title: partial?.title ?? 'Untitled Note',
    content: partial?.content ?? '',
    summary: partial?.summary ?? '',
    createdAt: new Date().toISOString(),
    tags: partial?.tags ?? [],
  }
}

export function deleteNote(notes: Note[], id: string): Note[] {
  return notes.filter(n => n.id !== id)
}

export function updateNote(notes: Note[], id: string, updates: Partial<Note>): Note[] {
  return notes.map(n => n.id === id ? { ...n, ...updates } : n)
}
