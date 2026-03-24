import { ModelCategory, LLMFramework } from '@runanywhere/web'
import type { CompactModelDef } from '@runanywhere/web'

export type { CompactModelDef }

export const MODELS: CompactModelDef[] = [
  {
    id: 'lfm2-350m',
    name: 'LFM2 350M (Fast)',
    repo: 'LiquidAI/LFM2-350M-GGUF',
    files: ['LFM2-350M-Q4_K_M.gguf'],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 250_000_000,
  },
]

let _initPromise: Promise<void> | null = null

export async function initSDK() {
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    const { RunAnywhere, SDKEnvironment } = await import('@runanywhere/web')
    const { LlamaCPP } = await import('@runanywhere/web-llamacpp')
    const { ONNX } = await import('@runanywhere/web-onnx')
    
    await RunAnywhere.initialize({ environment: SDKEnvironment.Development, debug: false })
    await LlamaCPP.register()
    await ONNX.register()
    RunAnywhere.registerModels([...MODELS])
  })()
  return _initPromise
}

export async function getEventBus() {
  const { EventBus } = await import('@runanywhere/web')
  return EventBus
}

export async function getModelManager() {
  const { ModelManager } = await import('@runanywhere/web')
  return ModelManager
}

export async function getTextGeneration() {
  const { TextGeneration } = await import('@runanywhere/web-llamacpp')
  return TextGeneration
}
