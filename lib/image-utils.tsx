"use client"

import { useState } from "react"
import Image from "next/image"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallback?: string
  style?: React.CSSProperties
  onError?: () => void
}

/**
 * Componente de imagem com fallback automático
 * Tenta carregar a imagem original, se falhar usa o fallback ou placeholder
 */
export function SafeImage({
  src,
  alt,
  className = "",
  width,
  height,
  fallback = "/placeholder.svg",
  style,
  onError,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setHasError(true)
      setImgSrc(fallback)
      onError?.()
    }
  }

  // Se a imagem for externa, usa img normal
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        onError={handleError}
        loading="lazy"
      />
    )
  }

  // Para imagens locais, usa img normal também (já que images.unoptimized está true)
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  )
}

