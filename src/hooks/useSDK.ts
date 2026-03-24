import { useState, useCallback } from 'react'
import { initSDK, getEventBus, getModelManager, MODELS } from '@/lib/runanywhere'
import { ModelStatus } from '@runanywhere/web'

export type SDKStatus = 'idle' | 'initializing' | 'ready' | 'downloading' | 'error'

interface SDKState {
  status: SDKStatus
  downloadProgress: number
  modelReady: boolean
  error: string | null
  accelerationMode: string
}

export function useSDK() {
  const [state, setState] = useState<SDKState>({
    status: 'idle',
    downloadProgress: 0,
    modelReady: false,
    error: null,
    accelerationMode: 'CPU',
  })

  /** Returns true if model is already ready (cached) */
  const initialize = useCallback(async (): Promise<boolean> => {
    setState(s => ({ ...s, status: 'initializing' }))
    try {
      await initSDK()
      
      const EventBus = await getEventBus()
      
      EventBus.shared.on('model.downloadProgress', (data: any) => {
        const raw = typeof data === 'number' ? data : (data?.progress ?? 0)
        setState(s => ({
          ...s,
          status: 'downloading',
          downloadProgress: raw <= 1 ? raw * 100 : raw,
        }))
      })

      // Check if model is already downloaded
      const ModelManager = await getModelManager()
      const models = ModelManager.getModels()
      const model = models.find(m => m.id === MODELS[0].id)
      
      const alreadyReady = !!(model && (model.status === ModelStatus.Downloaded || model.status === ModelStatus.Loaded))
      
      if (alreadyReady) {
        await ModelManager.loadModel(MODELS[0].id)
        setState(s => ({ ...s, status: 'ready', modelReady: true, downloadProgress: 100 }))
      } else {
        setState(s => ({ ...s, status: 'ready' }))
      }

      // Detect WebGPU
      const gpu = (navigator as any).gpu
      if (gpu) {
        setState(s => ({ ...s, accelerationMode: 'WebGPU' }))
      }
      
      return alreadyReady
    } catch (err: any) {
      setState(s => ({ ...s, status: 'error', error: err.message }))
      return false
    }
  }, [])

  const downloadModel = useCallback(async () => {
    setState(s => ({ ...s, status: 'downloading', downloadProgress: 0 }))
    try {
      const ModelManager = await getModelManager()
      await ModelManager.downloadModel(MODELS[0].id)
      await ModelManager.loadModel(MODELS[0].id)
      setState(s => ({ ...s, status: 'ready', modelReady: true, downloadProgress: 100 }))
    } catch (err: any) {
      setState(s => ({ ...s, status: 'error', error: err.message }))
    }
  }, [])

  return { ...state, initialize, downloadModel }
}
