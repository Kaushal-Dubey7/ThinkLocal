import { Cpu, Lock, Zap } from 'lucide-react'

interface StatusBarProps {
  modelReady: boolean
  accelerationMode: string
  lastTPS: number | null
}

export default function StatusBar({ modelReady, accelerationMode, lastTPS }: StatusBarProps) {
  return (
    <div className="h-8 border-t border-border bg-card/60 backdrop-blur-sm flex items-center px-4 gap-4 text-[11px] text-muted-foreground">
      {/* Model status */}
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${modelReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
        <span>{modelReady ? 'LFM2-350M Ready' : 'Loading model…'}</span>
      </div>

      {/* Acceleration */}
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3" />
        <span>{accelerationMode}</span>
      </div>

      {/* Last inference speed */}
      {lastTPS !== null && (
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span className="font-mono">{lastTPS} tok/s</span>
        </div>
      )}

      {/* Privacy badge */}
      <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
        <Lock className="w-3 h-3" />
        <span>On-Device AI</span>
      </div>
    </div>
  )
}
