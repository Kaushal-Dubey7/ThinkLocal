import { useState, useCallback, useRef } from 'react'
import { initSDK } from '@/lib/runanywhere'

interface STTState {
  isRecording: boolean
  isTranscribing: boolean
  transcript: string
  error: string | null
}

export function useSTT() {
  const [state, setState] = useState<STTState>({
    isRecording: false,
    isTranscribing: false,
    transcript: '',
    error: null,
  })
  const captureRef = useRef<any>(null)

  const startRecording = useCallback(async () => {
    setState(s => ({ ...s, isRecording: true, error: null, transcript: '' }))

    try {
      await initSDK()

      const { AudioCapture } = await import('@runanywhere/web')
      const capture = new AudioCapture({ sampleRate: 16000 })
      captureRef.current = capture

      // start() collects PCM internally; optional callback for each chunk
      await capture.start()
    } catch (err: any) {
      console.error('STT start error:', err)
      setState(s => ({ ...s, isRecording: false, error: err.message }))
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<string> => {
    setState(s => ({ ...s, isRecording: false, isTranscribing: true }))

    try {
      const capture = captureRef.current
      if (!capture) {
        setState(s => ({ ...s, isTranscribing: false, error: 'No active recording' }))
        return ''
      }

      // Get all collected audio then stop
      const allSamples = capture.getAudioBuffer()
      capture.stop()
      captureRef.current = null

      if (!allSamples || allSamples.length === 0) {
        setState(s => ({ ...s, isTranscribing: false, error: 'No audio recorded' }))
        return ''
      }

      // Transcribe using STT from web-onnx
      const { STT } = await import('@runanywhere/web-onnx')
      const result = await STT.transcribe(allSamples)
      const text = result.text?.trim() || ''

      setState(s => ({ ...s, isTranscribing: false, transcript: text }))
      return text
    } catch (err: any) {
      console.error('STT transcribe error:', err)
      setState(s => ({ ...s, isTranscribing: false, error: err.message }))
      return ''
    }
  }, [])

  return { ...state, startRecording, stopRecording }
}
