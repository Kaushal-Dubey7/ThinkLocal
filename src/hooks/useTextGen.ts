import { useState, useCallback, useRef } from 'react'
import { initSDK, getTextGeneration, getModelManager, MODELS } from '@/lib/runanywhere'

interface TextGenState {
  output: string
  isGenerating: boolean
  tokensPerSecond: number | null
}

export function useTextGen() {
  const [state, setState] = useState<TextGenState>({
    output: '',
    isGenerating: false,
    tokensPerSecond: null,
  })
  const cancelRef = useRef<(() => void) | null>(null)

  const generate = useCallback(async (prompt: string, onToken?: (token: string) => void) => {
    setState({ output: '', isGenerating: true, tokensPerSecond: null })

    let fullOutput = ''

    try {
      // Ensure SDK is initialized first
      await initSDK()
      
      const TextGeneration = await getTextGeneration()
      const ModelManager = await getModelManager()

      // Ensure model is downloaded and loaded
      const models = ModelManager.getModels()
      const model = models.find((m: any) => m.id === MODELS[0].id)
      
      if (model && model.status !== 'downloaded' && model.status !== 'loaded') {
        await ModelManager.downloadModel(MODELS[0].id)
      }
      
      await ModelManager.loadModel(MODELS[0].id)

      const { stream, result, cancel } = await TextGeneration.generateStream(prompt, {
        maxTokens: 512,
        temperature: 0.7,
      })

      cancelRef.current = cancel

      for await (const token of stream) {
        fullOutput += token
        setState(s => ({ ...s, output: fullOutput }))
        onToken?.(token)
      }

      const finalResult = await result
      setState(s => ({
        ...s,
        isGenerating: false,
        tokensPerSecond: Math.round(finalResult.tokensPerSecond * 10) / 10,
      }))
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
