"use client"

import { Mic, MicOff, X } from "lucide-react"
import { useLanguage } from "../lib/language-context"

interface VoiceIndicatorProps {
  isListening: boolean
  transcript: string
  onStop: () => void
  onCancel: () => void
}

export function VoiceIndicator({ 
  isListening, 
  transcript, 
  onStop,
  onCancel 
}: VoiceIndicatorProps) {
  const { language } = useLanguage()
  
  if (!isListening) return null

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex flex-col items-center justify-center gap-6 p-6"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--brand)]/20 rounded-full animate-ping" />
        <div className="absolute inset-2 bg-[var(--brand)]/30 rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-[var(--brand)] rounded-full flex items-center justify-center">
          <Mic className="h-10 w-10 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-white">
          {language === "pt" ? "A ouvir..." : "Listening..."}
        </h3>
        {transcript ? (
          <p className="text-gray-300 text-lg">{transcript}</p>
        ) : (
          <p className="text-gray-400">
            {language === "pt" ? "Fala agora" : "Speak now"}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="bg-[var(--bg-secondary)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all flex items-center gap-2 border-2 border-[var(--border-color)]"
        >
          <X className="h-5 w-5" />
          {language === "pt" ? "Cancelar" : "Cancel"}
        </button>
        
        <button
          onClick={onStop}
          className="bg-[var(--brand)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
        >
          <MicOff className="h-5 w-5" />
          {language === "pt" ? "Parar" : "Stop"}
        </button>
      </div>
    </div>
  )
}
