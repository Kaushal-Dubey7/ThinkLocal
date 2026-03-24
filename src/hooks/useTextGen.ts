import { useState, useCallback, useRef } from 'react'
import { initSDK, getTextGeneration, ensureModelReady } from '@/lib/runanywhere'

interface TextGenState {
  output: string
  isGenerating: boolean
  tokensPerSecond: number | null
}

interface GenerateOptions {
  maxTokens?: number
  temperature?: number
  onToken?: (token: string) => void
  onTPS?: (tps: number) => void
}

export function useTextGen() {
  const [state, setState] = useState<TextGenState>({
    output: '',
    isGenerating: false,
    tokensPerSecond: null,
  })
  const cancelRef = useRef<(() => void) | null>(null)

  const generate = useCallback(async (prompt: string, onToken?: (token: string) => void, onTPS?: (tps: number) => void, maxTokens: number = 150) => {
    setState({ output: '', isGenerating: true, tokensPerSecond: null })

    let fullOutput = ''

    try {
      await initSDK()
      const TextGeneration = await getTextGeneration()
      await ensureModelReady()

      const { stream, result, cancel } = await TextGeneration.generateStream(prompt, {
        maxTokens,
        temperature: 0.5,
        topP: 0.85,
        repeatPenalty: 1.1,
        // Override context size - default was 8192 which causes huge WASM memory allocation delays
        // 1024 is plenty for summaries and short chats while being much faster to allocate
        n_ctx: 1024,
      })

      cancelRef.current = cancel

      for await (const token of stream) {
        fullOutput += token
        setState(s => ({ ...s, output: fullOutput }))
        onToken?.(token)
      }

      const finalResult = await result
      const tps = Math.round(finalResult.tokensPerSecond * 10) / 10
      setState(s => ({
        ...s,
        isGenerating: false,
        tokensPerSecond: tps,
      }))
      onTPS?.(tps)
      return fullOutput
    } catch (err) {
      console.error('Text generation error:', err)
      setState(s => ({ ...s, isGenerating: false }))
      return fullOutput
    }
  }, [])

  const abort = useCallback(() => {
    cancelRef.current?.()
  }, [])

  return { ...state, generate, abort }
}
