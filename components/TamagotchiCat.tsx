"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Utensils, Moon, Gamepad2, BookOpen, BarChart3 } from "lucide-react"
import { useLanguage } from "../lib/language-context"

const catEmotions = [
  { name: "excited", src: "/images/header-cat.png" },
  { name: "happy", src: "/images/cat-happy.png" },
  { name: "laugh", src: "/images/cat-laugh.png" },
  { name: "surprise", src: "/images/cat-surprise.png" },
  { name: "sleepy", src: "/images/cat-sleepy.png" },
  { name: "sad", src: "/images/cat-sad.png" },
  { name: "mad", src: "/images/cat-mad.png" },
]

// Debug: verificar se as imagens existem
if (typeof window !== 'undefined') {
  console.log('Cat emotions:', catEmotions.map(e => e.src))
}

interface Stats {
  hunger: number
  energy: number
  happiness: number
  intelligence: number
}

interface TamagotchiCatProps {
  isChatMode?: boolean
  emotion?: string
}

export default function TamagotchiCat({ isChatMode = false, emotion }: TamagotchiCatProps) {
  const { t } = useLanguage()
  const [currentEmotion, setCurrentEmotion] = useState(0)
  const [previousEmotion, setPreviousEmotion] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousOpacity, setPreviousOpacity] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))
  const imageRef = useRef<HTMLImageElement>(null)
  const chatImageRef = useRef<HTMLImageElement>(null)
  const [stats, setStats] = useState<Stats>({
    hunger: 80,
    energy: 70,
    happiness: 90,
    intelligence: 60,
  })

  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Aplicar animação após montagem para evitar problemas de hidratação
  useEffect(() => {
    if (isMounted && imageRef.current) {
      imageRef.current.style.animation = 'cat-vertical-float 3s ease-in-out infinite'
      imageRef.current.style.willChange = 'opacity'
      imageRef.current.style.imageRendering = 'auto'
    }
  }, [isMounted])

  useEffect(() => {
    if (isMounted && chatImageRef.current) {
      chatImageRef.current.style.animation = 'cat-vertical-float 3s ease-in-out infinite'
      chatImageRef.current.style.willChange = 'opacity'
      chatImageRef.current.style.imageRendering = 'auto'
    }
  }, [isMounted])

  // Preload images - carregar todas as imagens de emoção
  useEffect(() => {
    const loadPromises: Promise<void>[] = []
    
    catEmotions.forEach((emotion, index) => {
      const img = new Image()
      const loadPromise = new Promise<void>((resolve) => {
        img.onload = () => {
          setLoadedImages(prev => {
            const newSet = new Set([...prev, index])
            console.log(`[TamagotchiCat] Image loaded: ${emotion.name} (${emotion.src}), index: ${index}`)
            return newSet
          })
          resolve()
        }
        img.onerror = () => {
          // Se a imagem falhar ao carregar, ainda marcar como carregada para não bloquear
          // Mas logar o erro para debug
          console.warn(`[TamagotchiCat] Failed to load image: ${emotion.name} (${emotion.src})`)
          setLoadedImages(prev => new Set([...prev, index]))
          resolve()
        }
      })
      img.src = emotion.src
      loadPromises.push(loadPromise)
    })
    
    // Log todas as imagens que devem ser carregadas
    console.log('[TamagotchiCat] Preloading images:', catEmotions.map(e => `${e.name}: ${e.src}`))
  }, [])

  const changeEmotion = useCallback((newIndex: number, force: boolean = false) => {
    // Verificar se o índice é válido
    if (newIndex >= 0 && newIndex < catEmotions.length) {
      // No modo chat ou se forçado, mudar mesmo que a imagem não esteja carregada
      // A imagem será carregada quando necessário
      if (force || isChatMode || loadedImages.has(newIndex)) {
        // Se já está na mesma emoção, não fazer nada
        if (newIndex === currentEmotion) {
          return true
        }
        
        // Pré-carregar a nova imagem para garantir que está pronta
        const newImageSrc = catEmotions[newIndex]?.src || "/images/header-cat.png"
        const preloadImage = new Image()
        preloadImage.src = newImageSrc
        
        // Função para iniciar a transição quando a imagem estiver pronta
        const startTransition = () => {
          // Guardar a emoção anterior para fazer crossfade
          const oldEmotion = currentEmotion
          setPreviousEmotion(oldEmotion)
          setPreviousOpacity(1) // Começar visível
          setIsTransitioning(true)
          
          // Aguardar um frame para garantir que ambas as imagens sejam renderizadas
          requestAnimationFrame(() => {
            // Atualizar a emoção atual
            setCurrentEmotion(newIndex)
            
            // Aguardar mais um frame para iniciar a transição
            requestAnimationFrame(() => {
              // Pequeno delay adicional para garantir renderização
              setTimeout(() => {
                // Iniciar fade out da imagem anterior e fade in da nova
                setPreviousOpacity(0) // Fade out da anterior
                
                // Após a transição CSS completar, remover a imagem anterior
                setTimeout(() => {
                  setIsTransitioning(false)
                  setPreviousEmotion(null)
                  setPreviousOpacity(1) // Reset para próxima transição
                }, 500) // Duração da transição CSS (500ms)
              }, 50) // Pequeno delay para garantir que ambas estão renderizadas
            })
          })
        }
        
        // Se a imagem já está carregada, iniciar transição imediatamente
        if (preloadImage.complete) {
          startTransition()
        } else {
          // Aguardar a imagem carregar antes de iniciar transição
          preloadImage.onload = () => {
            startTransition()
          }
          preloadImage.onerror = () => {
            // Mesmo se falhar, tentar transição com fallback
            console.warn(`[TamagotchiCat] Failed to preload image: ${newImageSrc}, proceeding anyway`)
            startTransition()
          }
        }
        
        return true
      }
    }
    return false
  }, [loadedImages, isChatMode, currentEmotion])

  // Atualizar emoção quando receber nova do chat
  useEffect(() => {
    if (isChatMode && emotion) {
      // Mapear emoção do chat para índice da emoção do gato
      // A função detectEmotion retorna: "excited", "happy", "laugh", "surprise", "sleepy", "sad", "mad"
      const mapEmotionToIndex = (emotionName: string): number => {
        const emotionLower = emotionName.toLowerCase().trim()
        
        // Mapeamento direto dos nomes de emoções retornados por detectEmotion
        const emotionMap: Record<string, number> = {
          'excited': 0,
          'happy': 1,
          'laugh': 2,
          'surprise': 3,
          'sleepy': 4,
          'sad': 5,
          'mad': 6,
        }
        
        // Verificar mapeamento direto primeiro
        if (emotionMap[emotionLower] !== undefined) {
          return emotionMap[emotionLower]
        }
        
        // Fallback: verificar se contém palavras-chave (para compatibilidade)
        if (emotionLower.includes('happy') || emotionLower.includes('alegre') || emotionLower.includes('feliz') || emotionLower.includes('joy')) {
          return 1 // happy
        }
        if (emotionLower.includes('laugh') || emotionLower.includes('riso') || emotionLower.includes('haha') || emotionLower.includes('funny')) {
          return 2 // laugh
        }
        if (emotionLower.includes('surprise') || emotionLower.includes('surpreso') || emotionLower.includes('wow') || emotionLower.includes('incrível')) {
          return 3 // surprise
        }
        if (emotionLower.includes('sleepy') || emotionLower.includes('sono') || emotionLower.includes('cansado') || emotionLower.includes('tired')) {
          return 4 // sleepy
        }
        if (emotionLower.includes('sad') || emotionLower.includes('triste') || emotionLower.includes('sorry') || emotionLower.includes('desculpa')) {
          return 5 // sad
        }
        if (emotionLower.includes('mad') || emotionLower.includes('bravo') || emotionLower.includes('angry') || emotionLower.includes('raiva')) {
          return 6 // mad
        }
        if (emotionLower.includes('excited') || emotionLower.includes('empolgado') || emotionLower.includes('emocionado')) {
          return 0 // excited
        }
        
        // Default: excited
        return 0
      }
      
      const emotionIndex = mapEmotionToIndex(emotion)
      
      // Sempre atualizar a emoção imediatamente, forçando a mudança
      // No modo chat, queremos que a imagem mude imediatamente
      if (emotionIndex !== currentEmotion) {
        const emotionData = catEmotions[emotionIndex]
        const imageSrc = emotionData?.src || "/images/header-cat.png"
        
        console.log(`[TamagotchiCat] Emotion changed: "${emotion}" -> index: ${emotionIndex}, image: ${imageSrc}, name: ${emotionData?.name}`)
        
        setCurrentEmotion(emotionIndex)
        setIsPaused(true)
        
        // Voltar a animar após 3 segundos
        const timeoutId = setTimeout(() => setIsPaused(false), 3000)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isChatMode, emotion, currentEmotion])

  useEffect(() => {
    // Não animar automaticamente em modo chat ou quando stats estão abertos
    if (isChatMode || isPaused || showStats) return

    const interval = setInterval(() => {
      const nextIndex = (currentEmotion + 1) % catEmotions.length
      
      // Verificar se a próxima imagem está carregada
      if (loadedImages.has(nextIndex)) {
        // Pré-carregar a imagem para garantir que está pronta
        const nextImageSrc = catEmotions[nextIndex].src
        const preloadImg = new Image()
        preloadImg.src = nextImageSrc
        
        // Função para mudar após garantir que está carregada
        const changeAfterLoad = () => {
          // Pequeno delay para garantir que não há transição em andamento
          if (!isTransitioning) {
            changeEmotion(nextIndex)
          }
        }
        
        // Se já está carregada, mudar imediatamente
        if (preloadImg.complete) {
          changeAfterLoad()
        } else {
          // Aguardar carregar antes de mudar
          preloadImg.onload = changeAfterLoad
          preloadImg.onerror = () => {
            // Mesmo se falhar, tentar mudar (pode estar no cache)
            console.warn(`[TamagotchiCat] Preload failed for ${nextImageSrc}, proceeding anyway`)
            changeAfterLoad()
          }
        }
      }
      // Se não está carregada, esperar pelo próximo intervalo
    }, 5000)

    return () => clearInterval(interval)
  }, [currentEmotion, isPaused, isChatMode, showStats, changeEmotion, loadedImages, isTransitioning])

  const handleFeed = () => {
    setIsPaused(true)
    // Only change if image is loaded
    if (loadedImages.has(1)) {
      changeEmotion(1) // happy
      setStats((prev) => ({ ...prev, hunger: Math.min(100, prev.hunger + 20) }))
    }
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleSleep = () => {
    setIsPaused(true)
    // Only change if image is loaded
    if (loadedImages.has(4)) {
      changeEmotion(4) // sleepy
      setStats((prev) => ({ ...prev, energy: Math.min(100, prev.energy + 30) }))
    }
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handlePlay = () => {
    setIsPaused(true)
    // Only change if image is loaded
    if (loadedImages.has(2)) {
      changeEmotion(2) // laugh
      setStats((prev) => ({ ...prev, happiness: Math.min(100, prev.happiness + 25) }))
    }
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleStudy = () => {
    setIsPaused(true)
    // Only change if image is loaded
    if (loadedImages.has(3)) {
      changeEmotion(3) // surprise
      setStats((prev) => ({ ...prev, intelligence: Math.min(100, prev.intelligence + 15) }))
    }
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleClick = () => {
    setIsPaused(true)
    // Try random emotions until we find one that's loaded
    const availableEmotions = Array.from({ length: catEmotions.length }, (_, i) => i)
      .filter(index => loadedImages.has(index))
    
    if (availableEmotions.length > 0) {
      const randomIndex = availableEmotions[Math.floor(Math.random() * availableEmotions.length)]
      changeEmotion(randomIndex)
    }
    setTimeout(() => setIsPaused(false), 10000)
  }

  const handlePet = () => {
    setIsPaused(true)
    const happyEmotions = [0, 1, 2].filter(index => loadedImages.has(index))
    if (happyEmotions.length > 0) {
      const randomHappy = happyEmotions[Math.floor(Math.random() * happyEmotions.length)]
      changeEmotion(randomHappy)
    }
  }

  const handleMouseLeave = () => {
    setTimeout(() => setIsPaused(false), 10000)
  }

  const ActionButton = ({
    icon: Icon,
    onClick,
    label,
  }: {
    icon: typeof Utensils
    onClick: () => void
    label: string
  }) => (
    <button
      onClick={onClick}
      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border-4 border-[var(--border-color)] border-b-6 active:border-b-4 active:translate-y-[2px] flex items-center justify-center transition-all shadow-sm relative z-40"
      style={{
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 40,
        borderColor: 'var(--border-color)',
        opacity: 1,
      }}
      title={label}
    >
      <Icon size={18} className="text-[var(--text-primary)] sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
    </button>
  )

  // Se estiver em modo chat, renderizar estilo Visual Novel (apenas da barriga para cima)
  if (isChatMode) {
    const emotionIndex = currentEmotion >= 0 && currentEmotion < catEmotions.length ? currentEmotion : 0
    const emotionData = catEmotions[emotionIndex]
    const currentImageSrc = emotionData?.src || "/images/header-cat.png"
    const emotionName = emotionData?.name || 'excited'
    
    // Log para debug apenas quando a emoção realmente mudou (usando useRef para rastrear)
    // Removido log repetitivo que estava causando spam no console
    
    return (
      <div className="w-full h-full relative flex items-center justify-center" style={{ overflow: 'hidden' }}>
        {/* Visual Novel Style: mostrar apenas metade superior (da barriga para cima), centralizado */}
        <div 
          className="relative w-full h-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Container para crossfade */}
          <div className="relative w-full h-full" style={{ position: 'relative' }} suppressHydrationWarning>
            {/* Imagem anterior (fade out) */}
            {isMounted && previousEmotion !== null && isTransitioning && (
              <img
                src={catEmotions[previousEmotion]?.src || "/images/header-cat.png"}
                alt={`Miao ${catEmotions[previousEmotion]?.name || 'cat'}`}
                className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out"
                style={{ 
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                  animation: 'cat-vertical-float 3s ease-in-out infinite',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  position: 'absolute',
                  opacity: previousOpacity, // Controlado pelo estado
                  pointerEvents: 'none',
                  zIndex: 1,
                  willChange: 'opacity',
                  imageRendering: 'auto',
                }}
                draggable={false}
                aria-hidden="true"
              />
            )}
            {/* Imagem atual (fade in) */}
            <img
              ref={chatImageRef}
              src={currentImageSrc}
              alt={`Miao ${emotionName}`}
              className="relative w-full h-full transition-opacity duration-500 ease-in-out"
              onLoad={() => {
                console.log(`[TamagotchiCat] Image loaded successfully: ${currentImageSrc} (emotion: ${emotionName})`)
              }}
              onError={(e) => {
                // Fallback se a imagem não carregar
                console.warn(`[TamagotchiCat] Failed to load image: ${currentImageSrc}, using fallback`)
                const target = e.target as HTMLImageElement
                target.src = "/images/header-cat.png"
              }}
              style={{ 
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                objectFit: 'contain',
                objectPosition: 'center bottom',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                position: 'relative',
                opacity: isMounted && previousEmotion !== null && isTransitioning ? 1 - previousOpacity : 1,
                zIndex: 2,
              }}
              draggable={false}
              suppressHydrationWarning
            />
          </div>
          {/* Gradient na parte inferior para esconder suavemente as pernas - vai até o input do chat - escuro mesmo no light mode */}
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '45%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)',
              zIndex: 10,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-row items-center justify-center lg:justify-start gap-1 sm:gap-2 md:gap-3 transition-all duration-700 ease-out relative mx-auto lg:mx-0 w-full max-w-full ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ overflow: 'visible', padding: '0 8px' }}
    >
      {/* Botões verticais à esquerda */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 relative z-40 flex-shrink-0" style={{ position: 'relative', pointerEvents: 'auto' }}>
        <ActionButton icon={Utensils} onClick={handleFeed} label={t("tamagotchi.feed")} />
        <ActionButton icon={Moon} onClick={handleSleep} label={t("tamagotchi.sleep")} />
        <ActionButton icon={Gamepad2} onClick={handlePlay} label={t("tamagotchi.play")} />
        <ActionButton icon={BookOpen} onClick={handleStudy} label={t("tamagotchi.study")} />
        <button
          onClick={() => setShowStats(!showStats)}
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full border-4 border-b-6 active:border-b-4 active:translate-y-[2px] flex items-center justify-center transition-all shadow-sm relative z-40 ${
            showStats
              ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
              : "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-color)]"
          }`}
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 40,
            borderColor: 'var(--border-color)',
            opacity: 1,
          }}
          title={t("tamagotchi.stats")}
        >
          <BarChart3 size={18} className="sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* Cat image */}
      <div
        className="relative cursor-pointer select-none flex-shrink-0 z-30 w-full"
        style={{
          animation: "tamagotchi-float 3s ease-in-out infinite",
          position: 'relative',
          maxWidth: 'calc(100% - 80px)',
        }}
        onClick={handleClick}
      >
        {/* Shadow circle below cat feet */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[60%] h-8 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Container para crossfade - usar position relative para manter layout */}
        <div 
          className="relative w-full" 
          style={{ minHeight: '200px', position: 'relative' }}
          suppressHydrationWarning
        >
          {/* Imagem anterior (fade out) - só renderizar durante transição */}
          {isMounted && previousEmotion !== null && isTransitioning && (
            <img
              src={catEmotions[previousEmotion]?.src || "/images/header-cat.png"}
              alt={`Miao ${catEmotions[previousEmotion]?.name || 'cat'}`}
              className="absolute inset-0 w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[550px] h-auto object-contain mx-auto transition-opacity duration-500 ease-in-out"
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                animation: 'cat-vertical-float 3s ease-in-out infinite',
                opacity: previousOpacity, // Controlado pelo estado
                pointerEvents: 'none',
                zIndex: 1,
                willChange: 'opacity',
                imageRendering: 'auto',
              }}
              draggable={false}
              aria-hidden="true"
            />
          )}
          {/* Imagem atual (fade in) */}
          <img
            ref={imageRef}
            src={catEmotions[currentEmotion]?.src || "/images/header-cat.png"}
            alt={`Miao ${catEmotions[currentEmotion]?.name || 'cat'}`}
            className="relative w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[550px] h-auto object-contain mx-auto transition-opacity duration-500 ease-in-out"
            onError={(e) => {
              // Fallback se a imagem não carregar
              console.warn(`[TamagotchiCat] Failed to load image: ${catEmotions[currentEmotion]?.src}, using fallback`)
              const target = e.target as HTMLImageElement
              target.src = "/images/header-cat.png"
            }}
            onLoad={() => {
              // Quando a nova imagem carregar, garantir que está visível se não estiver em transição
              if (!isTransitioning || previousEmotion === null) {
                // Forçar atualização se necessário
              }
            }}
            style={{ 
              maxHeight: 'calc(100vh - 200px)',
              opacity: isMounted && previousEmotion !== null && isTransitioning ? 1 - previousOpacity : 1,
              zIndex: 2,
            }}
            draggable={false}
            suppressHydrationWarning
          />
        </div>
      </div>

      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-secondary)] border-4 border-[var(--border-color)] border-b-6 rounded-2xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[450px] shadow-2xl transition-opacity duration-300 ease-in-out"
        style={{
          borderColor: 'var(--border-color)',
          opacity: showStats ? 1 : 0,
          visibility: showStats ? 'visible' : 'hidden',
          pointerEvents: showStats ? 'auto' : 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          isolation: 'isolate',
        }}>
        <div className="space-y-4 md:space-y-5">
          <StatBar label={t("tamagotchi.hunger")} value={stats.hunger} color="#FF6B6B" />
          <StatBar label={t("tamagotchi.energy")} value={stats.energy} color="#4ECDC4" />
          <StatBar label={t("tamagotchi.happiness")} value={stats.happiness} color="#FFE66D" />
          <StatBar label={t("tamagotchi.intelligence")} value={stats.intelligence} color="#A78BFA" />
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm md:text-base font-bold w-16 md:w-20 text-[var(--text-primary)]">{label}</span>
      <div className="flex-1 h-4 md:h-5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border-4 border-[var(--border-color)]"
        style={{
          borderColor: 'var(--border-color)',
          opacity: 1,
          willChange: 'auto',
        }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${value}%`, 
            backgroundColor: color,
            willChange: 'width',
            backfaceVisibility: 'hidden',
          }}
        />
      </div>
      <span className="text-sm md:text-base font-bold w-10 md:w-12 text-right text-[var(--text-primary)]">{value}%</span>
    </div>
  )
}
