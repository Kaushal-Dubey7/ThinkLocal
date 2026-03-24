import { useState, useEffect, useCallback } from 'react'
import { Shield, Cpu, Zap, Download, Lock, Brain, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSDK } from '@/hooks/useSDK'

interface ModelLoaderProps {
  onReady: () => void
  onAccelerationMode?: (mode: string) => void
}

export default function ModelLoader({ onReady, onAccelerationMode }: ModelLoaderProps) {
  const { status, downloadProgress, modelReady, error, accelerationMode, initialize, downloadModel } = useSDK()
  const [step, setStep] = useState<'intro' | 'loading' | 'downloading' | 'ready'>('intro')

  useEffect(() => {
    if (modelReady) {
      setStep('ready')
      onAccelerationMode?.(accelerationMode)
      const t = setTimeout(onReady, 1500)
      return () => clearTimeout(t)
    }
  }, [modelReady, onReady, accelerationMode, onAccelerationMode])

  useEffect(() => {
    if (status === 'downloading') setStep('downloading')
  }, [status])

  useEffect(() => {
    if (accelerationMode) {
      onAccelerationMode?.(accelerationMode)
    }
  }, [accelerationMode, onAccelerationMode])

  const handleStart = async () => {
    setStep('loading')
    const alreadyReady = await initialize()
    if (!alreadyReady) {
      await downloadModel()
    }
  }

  const features = [
    { icon: Lock, text: 'All AI runs on YOUR device', delay: '0ms' },
    { icon: Shield, text: 'Your data never leaves your browser', delay: '100ms' },
    { icon: Zap, text: 'Works offline after first download', delay: '200ms' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/[0.04] rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-3xl" />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20 animate-float-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4">
        <div className="glass-strong p-8 space-y-8 shadow-2xl shadow-primary/5">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 glow-primary mb-2 p-4 border border-primary/10">
              <Brain className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">ThinkLocal</h1>
            <p className="text-muted-foreground text-sm">Your AI second brain — 100% private, 100% local</p>
          </div>

          {step === 'intro' && (
            <div className="space-y-6 animate-fade-in">
              {/* Privacy features */}
              <div className="space-y-3">
                {features.map(({ icon: Icon, text, delay }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm text-foreground/80 animate-fade-in group"
                    style={{ animationDelay: delay }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-primary/15 group-hover:border-primary/20 group-hover:scale-105">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="transition-colors duration-200 group-hover:text-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <div className="glass p-3 rounded-lg flex items-center gap-2 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Download className="w-4 h-4 text-primary flex-shrink-0" />
                <span>One-time download: ~250MB model cached in your browser (OPFS). Never re-downloads.</span>
              </div>

              <Button
                onClick={handleStart}
                className="w-full h-12 text-base font-semibold glow-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 animate-fade-in"
                style={{ animationDelay: '400ms' }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Initialize AI Engine
              </Button>
            </div>
          )}

          {step === 'loading' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-secondary/20 border-b-secondary/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted-foreground">Initializing AI engine…</p>
              <p className="text-[11px] text-muted-foreground/60">Setting up WASM runtime and model registry</p>
            </div>
          )}

          {step === 'downloading' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">Downloading LFM2-350M model…</span>
                  <span className="text-primary font-mono font-medium">{Math.round(downloadProgress)}%</span>
                </div>
                <div className="relative">
                  <Progress value={downloadProgress} className="h-2.5" />
                  {downloadProgress > 0 && downloadProgress < 100 && (
                    <div
                      className="absolute top-0 h-2.5 rounded-full bg-primary/20 animate-pulse"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground/60">
                  <span>{Math.round(downloadProgress * 2.5)}MB / 250MB</span>
                  <span>Cached forever after download</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Stored in OPFS — cached forever, no re-download on refresh
              </p>
            </div>
          )}

          {step === 'ready' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-30" />
                <div className="relative w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <p className="text-foreground font-medium text-lg">AI Engine Ready!</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-xs text-primary border border-primary/15">
                <Zap className="w-3.5 h-3.5" />
                {accelerationMode} Acceleration
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              <p className="font-medium mb-1">Error</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          )}

          {/* Privacy badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-glass-border text-xs text-muted-foreground transition-all duration-200 hover:border-green-500/20 hover:text-green-400/80">
              <Lock className="w-3 h-3 text-green-400" />
              🔒 Zero data transmitted. Ever.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
