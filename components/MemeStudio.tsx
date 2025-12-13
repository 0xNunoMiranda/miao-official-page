"use client"

import React, { useState } from "react"
import {
  Download,
  Share2,
  Palette,
  Type,
  Zap,
  ArrowLeft,
  Download as DownloadIcon,
  Copy,
  Twitter,
} from "lucide-react"

interface MemeStudioProps {
  onBack: () => void
}

export const MemeStudio: React.FC<MemeStudioProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState("")
  const [topText, setTopText] = useState("YOUR MEME TEXT HERE")
  const [bottomText, setBottomText] = useState("BOTTOM TEXT")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [memeTitle, setMemeTitle] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerateMeme = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    
    try {
      // Simular geração de imagem
      setTimeout(() => {
        setGeneratedImage("https://placehold.co/600x600/00d26a/ffffff?text=MIAO+MEME")
        setIsGenerating(false)
      }, 2000)
    } catch (e) {
      console.error(e)
      setIsGenerating(false)
    }
  }

  const handlePublish = () => {
    if (!generatedImage || !memeTitle.trim()) return
    // Publish logic here
    alert(`Meme "${memeTitle}" published! +50 gems earned 💎`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b-4 border-green-600 p-6 shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🎨</span> MEME STUDIO
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create hilarious memes and earn gems! 💎</p>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Controls */}
          <div className="space-y-6">
            {/* AI Prompt */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                AI Image Generator
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Describe your meme idea
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., cute cat looking confused, comic style, white background"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleGenerateMeme}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate Meme
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Text Customization */}
            {generatedImage && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Type size={20} className="text-blue-500" />
                  Text Customization
                </h3>
                <div className="space-y-4">
                  {/* Top Text */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Top Text
                    </label>
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value.toUpperCase())}
                      maxLength={50}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* Bottom Text */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Bottom Text
                    </label>
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value.toUpperCase())}
                      maxLength={50}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <div
                        className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-gray-900 dark:text-white"
                        style={{ backgroundColor: textColor + "20" }}
                      >
                        {textColor}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meme Title & Publish */}
            {generatedImage && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Publish Your Meme</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Meme Title
                    </label>
                    <input
                      type="text"
                      value={memeTitle}
                      onChange={(e) => setMemeTitle(e.target.value)}
                      placeholder="Give your masterpiece a name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={!memeTitle.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    🚀 Publish to Community
                  </button>
                  <button className="w-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2">
                    <Twitter size={20} />
                    Share on Twitter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Preview */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preview</h3>

              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden shadow-xl aspect-square flex items-center justify-center">
                    <div
                      className="absolute top-0 left-0 right-0 px-4 py-6 text-center font-black text-outline"
                      style={{
                        color: textColor,
                        fontSize: `${fontSize}px`,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {topText}
                    </div>
                    <img src={generatedImage} alt="Generated meme" className="w-full h-full object-cover" />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-4 py-6 text-center font-black text-outline"
                      style={{
                        color: textColor,
                        fontSize: `${fontSize}px`,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {bottomText}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <DownloadIcon size={20} />
                    Download Meme
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-5xl mb-3">🎨</p>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                      Enter a prompt and generate<br />
                      your first meme
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-2xl p-6 border border-blue-300 dark:border-blue-700">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ Be specific in your prompts - "cute cat confused" works better than just "cat"</li>
            <li>✅ Use UPPERCASE text for classic meme look</li>
            <li>✅ Add bold outlines to your text for better visibility</li>
            <li>✅ Keep text short and punchy - memes need quick laughs</li>
            <li>✅ Published memes earn you gems when they get likes! 🎁</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
