"use client"

import type React from "react"
import { useState } from "react"
import type { GeneratedCat } from "@/types"
import { Sparkles, RefreshCw, Zap, Send, Download } from "lucide-react"
import SnowCap from "./SnowCap"

interface CatGeneratorProps {
  isChristmasMode?: boolean
}

const CAT_REFERENCE_IMAGE = "/images/cat.png"

const CatGenerator: React.FC<CatGeneratorProps> = ({ isChristmasMode = false }) => {
  const [cats, setCats] = useState<GeneratedCat[]>([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)

  const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
  const TELEGRAM_CHAT_ID = "-1002345678901"

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt!")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      if (data.success && data.imageUrl) {
        const newCat: GeneratedCat = {
          id: Date.now().toString(),
          imageUrl: data.imageUrl,
        }
        setCats((prev) => [newCat, ...prev])
      } else {
        throw new Error("No image returned from API")
      }
    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate image. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (cat: GeneratedCat) => {
    try {
      if (cat.imageUrl.startsWith("data:")) {
        const a = document.createElement("a")
        a.href = cat.imageUrl
        a.download = `miao-${cat.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        const response = await fetch(cat.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `miao-${cat.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error(e)
      alert("Failed to download image.")
    }
  }

  const shareToTelegram = async (cat: GeneratedCat) => {
    if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
      alert("Telegram Bot Token not configured in code!")
      return
    }
    try {
      let blob: Blob
      if (cat.imageUrl.startsWith("data:")) {
        const base64Data = cat.imageUrl.split(",")[1]
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        blob = new Blob([bytes], { type: "image/png" })
      } else {
        const response = await fetch(cat.imageUrl)
        blob = await response.blob()
      }

      const formData = new FormData()
      formData.append("chat_id", TELEGRAM_CHAT_ID)
      formData.append("photo", blob, "miao-generated.png")
      formData.append("caption", `Generated via MIAO Army: ${prompt}`)

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData,
      })
      alert("Sent to Telegram!")
    } catch (e) {
      console.error(e)
      alert("Failed to share.")
    }
  }

  return (
    <section
      id="generator"
      className="py-24 bg-[var(--bg-primary)] text-center px-6 md:px-12 lg:px-24 overflow-hidden border-t-4 border-[var(--border-color)]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="inline-block mb-4">
          <Zap className="inline text-yellow-400 fill-current animate-bounce" size={48} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6">Miao Army Generator</h2>
        <p className="text-[var(--text-secondary)] text-xl font-bold mb-12 max-w-2xl mx-auto">
          Spawn unique variants of Miao using AI and share them with the community!
        </p>

        <div className="max-w-3xl mx-auto bg-[var(--bg-secondary)] border-b-8 border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden text-left shadow-lg">
          <SnowCap className="h-12" visible={isChristmasMode} />

          <div className="mb-6 relative z-10 flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-2xl border-2 border-[var(--border-color)]">
            <img
              src={CAT_REFERENCE_IMAGE || "/placeholder.svg"}
              alt="Miao Reference"
              className="w-20 h-20 object-contain rounded-xl bg-white"
            />
            <div className="flex-1">
              <p className="font-black text-sm uppercase text-[var(--brand)] tracking-wide">Base Character</p>
              <p className="text-[var(--text-secondary)] text-sm">
                All generations will be based on this green cat character. Just describe what you want it to do or wear!
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 relative z-10">
            <label className="block font-black text-sm uppercase text-[var(--text-secondary)] mb-3 tracking-widest">
              Your Prompt
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
              placeholder="e.g., wearing a space suit, eating pizza, as a superhero..."
              className="w-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] rounded-2xl p-5 font-bold text-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/20 transition-all"
            />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Tip: Describe actions, costumes, or scenarios for the green cat!
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`
              w-full bg-[#1CB0F6] text-white px-6 py-5 rounded-2xl font-black text-2xl 
              flex items-center justify-center gap-3 uppercase tracking-wide
              border-b-[6px] border-[#1899D6] active:border-b-0 active:translate-y-[6px]
              hover:brightness-110 transition-all relative z-10
              ${loading ? "opacity-70 cursor-wait" : ""}
            `}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={28} />
            ) : (
              <Sparkles size={28} className="text-yellow-300 fill-current" />
            )}
            {loading ? "SUMMONING..." : "GENERATE MIAO"}
          </button>
        </div>

        {cats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {cats.map((cat) => (
              <div
                key={cat.id}
                className="bg-[var(--bg-secondary)] rounded-[2rem] p-4 border-b-8 border-[var(--border-color)] hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="aspect-square bg-[var(--bg-tertiary)] rounded-3xl overflow-hidden mb-4 border-2 border-[var(--border-color)]">
                  <img
                    src={cat.imageUrl || "/placeholder.svg"}
                    alt="Generated Green Cat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                  <span className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wide">
                    #{cat.id.slice(-4)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(cat)}
                      className="bg-[var(--brand)] text-white p-3 rounded-xl border-b-4 border-[#2a9d6a] active:border-b-0 active:translate-y-1 transition-all"
                      title="Download Image"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => shareToTelegram(cat)}
                      className="bg-[#229ED9] text-white p-3 rounded-xl border-b-4 border-[#1b7db0] active:border-b-0 active:translate-y-1 transition-all"
                      title="Send to Telegram"
                    >
                      <Send size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CatGenerator
