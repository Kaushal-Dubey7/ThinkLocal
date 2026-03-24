import { Cpu, Lock, Zap, Activity } from 'lucide-react'

interface StatusBarProps {
  modelReady: boolean
  accelerationMode: string
  lastTPS: number | null
}

export default function StatusBar({ modelReady, accelerationMode, lastTPS }: StatusBarProps) {
  return (
    <div className="h-9 border-t border-border/60 bg-card/60 backdrop-blur-md flex items-center px-4 gap-5 text-[11px] text-muted-foreground relative z-10">
      {/* Model status */}
      <div className="flex items-center gap-1.5 group">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${modelReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
          {modelReady && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400/40 animate-ping" />
          )}
        </div>
        <span className="transition-colors duration-200 group-hover:text-foreground/80">
          {modelReady ? 'LFM2-350M Ready' : 'Loading model…'}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-3 bg-border/50" />

      {/* Acceleration */}
      <div className="flex items-center gap-1.5 group">
        <Zap className="w-3 h-3 transition-colors duration-200 group-hover:text-primary/70" />
        <span className="transition-colors duration-200 group-hover:text-foreground/80">{accelerationMode}</span>
      </div>

      {/* Last inference speed */}
      {lastTPS !== null && (
        <>
          <div className="w-px h-3 bg-border/50" />
          <div className="flex items-center gap-1.5 animate-fade-in group">
            <Activity className="w-3 h-3 text-primary/50 transition-colors duration-200 group-hover:text-primary/70" />
            <span className="font-mono transition-colors duration-200 group-hover:text-foreground/80">
              {lastTPS} tok/s
            </span>
          </div>
        </>
      )}

      {/* Privacy badge */}
      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/8 text-green-400/90 border border-green-500/15 transition-all duration-200 hover:bg-green-500/12 hover:border-green-500/25 cursor-default">
        <Lock className="w-3 h-3" />
        <span className="text-[10px]">On-Device AI</span>
      </div>
    </div>
  )
}
