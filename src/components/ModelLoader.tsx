import { useState, useEffect, useCallback } from 'react'
import { Shield, Cpu, Zap, Download, Lock, Brain, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSDK } from '@/hooks/useSDK'

interface ModelLoaderProps {
  onReady: () => void
}

export default function ModelLoader({ onReady }: ModelLoaderProps) {
  const { status, downloadProgress, modelReady, error, accelerationMode, initialize, downloadModel } = useSDK()
  const [step, setStep] = useState<'intro' | 'loading' | 'downloading' | 'ready'>('intro')

  useEffect(() => {
    if (modelReady) {
      setStep('ready')
      const t = setTimeout(onReady, 1500)
      return () => clearTimeout(t)
    }
  }, [modelReady, onReady])

  useEffect(() => {
    if (status === 'downloading') setStep('downloading')
  }, [status])

  const handleStart = async () => {
    setStep('loading')
    const alreadyReady = await initialize()
    if (!alreadyReady) {
      await downloadModel()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg w-full mx-4">
        <div className="glass-strong p-8 space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 glow-primary mb-2">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">ThinkLocal</h1>
            <p className="text-muted-foreground text-sm">Your AI second brain — 100% private, 100% local</p>
          </div>

          {step === 'intro' && (
            <div className="space-y-6 animate-fade-in">
              {/* Privacy features */}
              <div className="space-y-3">
                {[
                  { icon: Lock, text: 'All AI runs on YOUR device' },
                  { icon: Shield, text: 'Your data never leaves your browser' },
                  { icon: Zap, text: 'Works offline after first download' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="glass p-3 rounded-lg flex items-center gap-2 text-xs text-muted-foreground">
                <Download className="w-4 h-4 text-primary flex-shrink-0" />
                <span>One-time download: ~250MB model cached in your browser (OPFS). Never re-downloads.</span>
              </div>

              <Button onClick={handleStart} className="w-full h-12 text-base font-semibold glow-primary">
                <Sparkles className="w-5 h-5 mr-2" />
                Initialize AI Engine
              </Button>
            </div>
          )}

          {step === 'loading' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Initializing AI engine…</p>
            </div>
          )}

          {step === 'downloading' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">Downloading LFM2-350M model…</span>
                  <span className="text-primary font-mono">{Math.round(downloadProgress)}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Stored in OPFS — cached forever, no re-download on refresh
              </p>
            </div>
          )}

          {step === 'ready' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-foreground font-medium">AI Engine Ready!</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs text-primary">
                <Zap className="w-3 h-3" />
                {accelerationMode} Acceleration
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Privacy badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-glass-border text-xs text-muted-foreground">
              <Lock className="w-3 h-3 text-green-400" />
              🔒 Zero data transmitted. Ever.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
