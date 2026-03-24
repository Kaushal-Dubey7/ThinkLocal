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

// Cached references — avoid repeated dynamic imports
let _ModelManager: any = null
let _TextGeneration: any = null
let _modelLoaded = false

export async function getModelManager() {
  if (_ModelManager) return _ModelManager
  const { ModelManager } = await import('@runanywhere/web')
  _ModelManager = ModelManager
  return ModelManager
}

export async function getTextGeneration() {
  if (_TextGeneration) return _TextGeneration
  const { TextGeneration } = await import('@runanywhere/web-llamacpp')
  _TextGeneration = TextGeneration
  return TextGeneration
}

/** Ensure model is downloaded + loaded, skips if already done */
export async function ensureModelReady() {
  if (_modelLoaded) return
  const ModelManager = await getModelManager()
  const models = ModelManager.getModels()
  const model = models.find((m: any) => m.id === MODELS[0].id)
  if (model && model.status !== 'downloaded' && model.status !== 'loaded') {
    await ModelManager.downloadModel(MODELS[0].id)
  }
  await ModelManager.loadModel(MODELS[0].id)
  _modelLoaded = true
}
