"use client"

import { useEffect, useRef, useState } from "react"

interface UseVideoSoundOptions {
  videoRef: React.RefObject<HTMLVideoElement>
  soundEnabled: boolean
  isChristmasMode: boolean
  onDisableSound?: () => void
}

export const useVideoSound = ({ videoRef, soundEnabled, isChristmasMode, onDisableSound }: UseVideoSoundOptions) => {
  const [playCount, setPlayCount] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const STORAGE_KEY = "miao_video_sound_play_count"
    const LAST_PLAY_KEY = "miao_video_sound_last_play"

    // Garante que o vídeo está sempre muted quando não está tocando
    video.muted = true

    if (!soundEnabled) return

    // Load play count from localStorage
    const storedCount = localStorage.getItem(STORAGE_KEY)
    let currentPlayCount = 0
    if (storedCount) {
      currentPlayCount = parseInt(storedCount, 10)
      setPlayCount(currentPlayCount)
    }

    // Se já tocou 3 vezes, desliga o som
    if (currentPlayCount >= 3) {
      if (onDisableSound) {
        onDisableSound()
      }
      return
    }

    const getWaitTime = (): number => {
      // Sempre 30 minutos (1800000ms)
      return 1800000
    }

    const fadeIn = (element: HTMLVideoElement, duration: number = 4000) => {
      const maxVolume = 0.15 // Volume máximo de 15% (mais baixo)
      element.volume = 0
      const steps = 120 // Mais steps para fade mais suave
      const stepTime = duration / steps
      const volumeStep = maxVolume / steps
      let currentStep = 0

      const fadeInterval = setInterval(() => {
        currentStep++
        element.volume = Math.min(volumeStep * currentStep, maxVolume)
        if (currentStep >= steps) {
          clearInterval(fadeInterval)
        }
      }, stepTime)

      return fadeInterval
    }

    const fadeOut = (element: HTMLVideoElement, duration: number = 4000) => {
      const initialVolume = element.volume
      const steps = 120 // Mais steps para fade mais suave
      const stepTime = duration / steps
      const volumeStep = initialVolume / steps
      let currentStep = 0

      const fadeInterval = setInterval(() => {
        currentStep++
        element.volume = Math.max(initialVolume - (volumeStep * currentStep), 0)
        if (currentStep >= steps) {
          element.volume = 0
          clearInterval(fadeInterval)
        }
      }, stepTime)

      return fadeInterval
    }

    const playSoundSegment = () => {
      if (!video || isPlayingRef.current) return
      
      // Verifica se já tocou 3 vezes antes de tocar
      const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10)
      if (currentCount >= 3) {
        if (onDisableSound) {
          onDisableSound()
        }
        return
      }

      isPlayingRef.current = true
      
      // Garante que o vídeo está muted inicialmente
      video.muted = false // Desmuta para poder controlar o volume
      video.currentTime = 2 // Começa no segundo 2
      video.volume = 0
      
      video.play().catch(() => {
        isPlayingRef.current = false
        video.muted = true // Volta a mutar se não conseguir tocar
      })

      // Fade in suave e longo usando o controle de volume
      fadeIntervalRef.current = fadeIn(video, 4000)

      // Para no segundo 7 e faz fade out suave e longo
      const checkTime = setInterval(() => {
        if (video.currentTime >= 7) {
          clearInterval(checkTime)
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
          }
          fadeIntervalRef.current = fadeOut(video, 4000)
          
          setTimeout(() => {
            // Volta a mutar após o fade out
            video.muted = true
            video.currentTime = 0
            isPlayingRef.current = false
            
            // Atualiza contador
            const newCount = currentPlayCount + 1
            setPlayCount(newCount)
            localStorage.setItem(STORAGE_KEY, newCount.toString())
            localStorage.setItem(LAST_PLAY_KEY, Date.now().toString())
            
            // Se chegou a 3 reproduções, desliga o som
            if (newCount >= 3 && onDisableSound) {
              onDisableSound()
            }
          }, 500)
        }
      }, 100)
    }

    const scheduleNextPlay = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Verifica se já tocou 3 vezes
      const currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10)
      if (currentCount >= 3) {
        if (onDisableSound) {
          onDisableSound()
        }
        return
      }

      const waitTime = getWaitTime()
      const lastPlay = localStorage.getItem(LAST_PLAY_KEY)
      const now = Date.now()
      
      let delay = waitTime
      if (lastPlay) {
        const timeSinceLastPlay = now - parseInt(lastPlay, 10)
        delay = Math.max(0, waitTime - timeSinceLastPlay)
      }

      // Primeira vez: espera 30 minutos
      if (currentCount === 0) {
        delay = Math.max(delay, 1800000) // 30 minutos (1800000ms)
      }

      timeoutRef.current = setTimeout(() => {
        playSoundSegment()
        // Só agenda próxima se ainda não chegou a 3
        const countAfterPlay = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10)
        if (countAfterPlay < 3) {
          scheduleNextPlay()
        }
      }, delay)
    }

    // Inicia o agendamento
    scheduleNextPlay()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [videoRef, soundEnabled, isChristmasMode, onDisableSound])

  return { playCount }
}

