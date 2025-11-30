"use client"

import React, { useState } from "react"
import type { WalletState } from "../types"
import {
  ArrowLeft,
  Lock,
  Palette,
  CheckSquare,
  Trophy,
  Zap,
  Download,
  RefreshCw,
  Share2,
  Crown,
  Gem,
  Users,
  Twitter,
  Send,
  Share,
  AlertTriangle,
  MessageCircle,
} from "lucide-react"

interface ToolsPageProps {
  onBack: () => void
  walletState: WalletState
}

const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, walletState }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "meme" | "tasks">("dashboard")
  const [points, setPoints] = useState(1250)
  const [showWarning, setShowWarning] = useState(true)

  // Meme Studio State
  const [prompt, setPrompt] = useState("")
  const [topText, setTopText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // --- Auth Gate (Comic Style) ---
  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center px-6 bg-[var(--bg-primary)]">
        <div className="max-w-xl w-full bg-white dark:bg-slate-800 border-b-8 border-r-4 border-l-4 border-t-4 border-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden">
          {/* Diagonal Stripes Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 20px)",
            }}
          ></div>

          <div className="relative z-10">
            <div className="w-28 h-28 bg-slate-200 rounded-full border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
              <Lock size={48} className="text-slate-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Locked!
            </h1>
            <p className="text-lg text-slate-500 font-bold mb-8 leading-snug">
              This zone is for the <span className="text-[var(--brand)]">Miao Army</span> only.
              <br />
              Connect your wallet to enter the barracks.
            </p>
            <button
              onClick={onBack}
              className="bg-[var(--brand)] text-white w-full font-black text-xl px-8 py-4 rounded-2xl border-b-4 border-green-700 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all btn-comic"
            >
              GO BACK
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Logic ---
  const handleGenerateMemeBase = async () => {
    if (!prompt) return
    setIsGenerating(true)
    try {
      if (window.puter && window.puter.ai) {
        const basePrompt =
          "comic style vector art, cute green cat mascot named Miao, white background, expressive, high quality"
        const fullPrompt = `${basePrompt}, ${prompt}`
        const img = await window.puter.ai.txt2img(fullPrompt)
        setGeneratedImage(img.src)
        // Reward points for generation
        setPoints((p) => p + 50)
      } else {
        // Fallback for demo if no API
        setTimeout(() => {
          setGeneratedImage("https://placehold.co/500x500/00d26a/white?text=MIAO+AI")
          setIsGenerating(false)
        }, 1000)
      }
    } catch (e) {
      console.error(e)
      setIsGenerating(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShareMeme = () => {
    setPoints((p) => p + 100)
    alert("Published to Community Feed! +100 MP")
    setTopText("")
    setBottomText("")
    setGeneratedImage(null)
    setPrompt("")
  }

  const handleSocialShare = async (platform: "twitter" | "telegram" | "native") => {
    if (!generatedImage) return

    const caption = `Check out my MIAO meme! ${topText} ${bottomText} #MIAO`
    const encodedCaption = encodeURIComponent(caption)
    const url = encodeURIComponent("https://miaotoken.vip")

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodedCaption}&url=${url}`, "_blank")
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${url}&text=${encodedCaption}`, "_blank")
    } else if (platform === "native") {
      if (navigator.share) {
        try {
          // Try to fetch blob to share actual image if possible
          const response = await fetch(generatedImage)
          const blob = await response.blob()
          const file = new File([blob], "miao.png", { type: blob.type })

          await navigator.share({
            title: "Miao Meme",
            text: caption,
            files: [file],
          })
        } catch (e) {
          console.error(e)
          // Fallback if file sharing fails
          navigator.share({
            title: "Miao Meme",
            text: caption,
            url: "https://miaotoken.vip",
          })
        }
      } else {
        alert("Web Share API not supported on this device.")
      }
    }
  }

  // --- Components ---
  const NavButton = ({ id, icon: Icon, label }: { id: typeof activeTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        w-full text-left p-4 rounded-2xl font-black flex items-center gap-4 transition-all border-2 border-transparent btn-comic
        ${
          activeTab === id
            ? "bg-blue-100 text-blue-500 border-blue-200 border-b-4"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }
      `}
    >
      <Icon size={28} className={activeTab === id ? "fill-current" : ""} strokeWidth={2.5} />
      <span className="text-lg tracking-tight">{label}</span>
    </button>
  )

  const WarningModal = () => {
    if (!showWarning) return null

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div
          className="relative max-w-lg w-full rounded-3xl p-8 border-4 border-b-8 shadow-2xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--brand)",
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <AlertTriangle size={40} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black text-center mb-4" style={{ color: "var(--text-primary)" }}>
            Aviso Importante
          </h2>

          {/* Message */}
          <div className="space-y-4 text-center mb-8">
            <p className="font-bold" style={{ color: "var(--text-secondary)" }}>
              Esta pagina apresenta apenas uma <span style={{ color: "var(--brand)" }}>pequena ideia</span> do que
              podera vir a ser.
            </p>
            <p className="font-bold" style={{ color: "var(--text-secondary)" }}>
              Ainda nao tem qualquer utilidade e este sera um{" "}
              <span style={{ color: "var(--brand)" }}>projeto a ser debatido pela comunidade</span>.
            </p>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 mt-4">
              <p className="font-bold flex items-center justify-center gap-2" style={{ color: "var(--text-primary)" }}>
                <MessageCircle size={20} style={{ color: "var(--brand)" }} />
                Se tiveres ideias, passa pelo chat da comunidade e partilha-as!
              </p>
              <p className="text-sm mt-2 font-semibold" style={{ color: "var(--text-secondary)" }}>
                E esse mesmo o proposito do{" "}
                <span className="font-black" style={{ color: "var(--brand)" }}>
                  $MIAO Token
                </span>
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => setShowWarning(false)}
            className="w-full font-black text-lg py-4 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 text-white"
            style={{
              backgroundColor: "var(--brand)",
              borderBottomColor: "var(--brand-dark)",
            }}
          >
            Compreendo, continuar
          </button>

          {/* Footer */}
          <p className="text-center mt-4 text-sm font-bold" style={{ color: "var(--text-muted)" }}>
            Obrigado pela compreensao!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[var(--bg-primary)] text-[var(--text-primary)] font-fredoka">
      <WarningModal />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border-b-4 border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center active:border-b-0 active:translate-y-1 btn-comic"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                Miao Tools
              </h1>
              <span className="text-slate-400 font-bold text-sm">Community HQ</span>
            </div>
          </div>

          {/* Gem Counter */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-2 pr-6 shadow-sm">
            <div className="w-12 h-12 bg-transparent flex items-center justify-center animate-bounce">
              <Gem size={32} className="text-blue-400 fill-current" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black text-blue-500 tracking-tight">{points}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GEMS</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation (Duolingo Style) */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 space-y-2">
              <NavButton id="dashboard" icon={Trophy} label="Dashboard" />
              <NavButton id="meme" icon={Palette} label="Meme Studio" />
              <NavButton id="tasks" icon={CheckSquare} label="Quests" />

              <div className="mt-8 pt-6 border-t-2 border-slate-100 dark:border-slate-800 px-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Profile</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-yellow-800 font-black text-xs">
                    {walletState.address?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-700 dark:text-slate-200">Recruit</div>
                    <div className="text-xs font-bold text-slate-400 truncate w-24">{walletState.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-up">
                {/* Welcome Banner */}
                <div className="bg-yellow-400 rounded-3xl p-8 relative overflow-hidden border-b-8 border-yellow-600">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-black text-yellow-900 mb-2">Ready for training?</h2>
                      <p className="text-yellow-800 font-bold text-lg">
                        Complete 3 daily quests to earn a streak bonus!
                      </p>
                      <button className="mt-4 bg-white text-yellow-600 font-black px-6 py-3 rounded-xl border-b-4 border-yellow-200 hover:bg-yellow-50 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide text-sm btn-comic">
                        Start Quests
                      </button>
                    </div>
                    <div className="w-32 h-32 bg-yellow-300 rounded-full border-4 border-yellow-500 flex items-center justify-center rotate-3">
                      <Crown size={64} className="text-yellow-600 fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="font-black text-xl text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-500 flex items-center justify-center">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      Recent Activity
                    </h3>
                    <ul className="space-y-4">
                      {[
                        { action: "Created 'Moon Miao'", reward: "+50", time: "2h ago" },
                        { action: "Daily Login", reward: "+10", time: "5h ago" },
                        { action: "Quest Complete", reward: "+100", time: "1d ago" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{item.action}</div>
                            <div className="text-xs font-bold text-slate-400">{item.time}</div>
                          </div>
                          <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg font-black text-sm">
                            {item.reward}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center rotate-6">
                      <Share2 size={32} strokeWidth={3} />
                    </div>
                    <h3 className="font-black text-xl text-slate-700 dark:text-slate-200 mb-2">Invite Friends</h3>
                    <p className="text-sm text-slate-500 font-bold mb-6">
                      Earn 10% of gems from every recruit you bring to the army.
                    </p>

                    <div className="flex gap-2">
                      <div className="flex-grow bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center px-4 font-mono text-xs font-bold text-slate-500">
                        miao.vip/u/7x...
                      </div>
                      <button className="bg-blue-500 text-white font-black px-4 py-3 rounded-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all btn-comic">
                        COPY
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MEME STUDIO TAB */}
            {activeTab === "meme" && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 md:p-8 animate-fade-up">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Meme Studio</h2>
                    <p className="text-slate-400 font-bold text-sm">Create viral content, earn gems.</p>
                  </div>
                  <div className="bg-green-100 text-green-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide">
                    AI Powered
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        1. The Idea
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Miao holding a diamond"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                        <button
                          onClick={handleGenerateMemeBase}
                          disabled={isGenerating || !prompt}
                          className="absolute right-2 top-2 bottom-2 bg-blue-500 text-white px-4 rounded-xl font-black text-sm border-b-4 border-blue-700 hover:brightness-110 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 transition-all btn-comic"
                        >
                          {isGenerating ? <RefreshCw className="animate-spin" /> : "GENERATE"}
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        2. The Captions
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="TOP TEXT"
                          value={topText}
                          onChange={(e) => setTopText(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black uppercase text-slate-700 dark:text-white focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="BOTTOM TEXT"
                          value={bottomText}
                          onChange={(e) => setBottomText(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-black uppercase text-slate-700 dark:text-white focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="bg-slate-900 rounded-3xl aspect-square flex items-center justify-center relative overflow-hidden shadow-inner group">
                    {generatedImage ? (
                      <>
                        <img
                          src={generatedImage || "/placeholder.svg"}
                          alt="Meme Base"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-6 left-0 w-full text-center pointer-events-none px-4">
                          <span
                            className="text-white font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none drop-shadow-[0_4px_0_rgba(0,0,0,1)] stroke-black"
                            style={{ WebkitTextStroke: "2px black" }}
                          >
                            {topText}
                          </span>
                        </div>
                        <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none px-4">
                          <span
                            className="text-white font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none drop-shadow-[0_4px_0_rgba(0,0,0,1)] stroke-black"
                            style={{ WebkitTextStroke: "2px black" }}
                          >
                            {bottomText}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 opacity-30 group-hover:opacity-50 transition-opacity">
                        <div className="text-7xl mb-4 grayscale">🖼️</div>
                        <p className="text-white font-black uppercase tracking-widest">Preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {generatedImage && (
                  <div className="mt-8 flex flex-col md:flex-row flex-wrap gap-4 justify-between items-center border-t-2 border-slate-100 dark:border-slate-700 pt-6">
                    <button className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-600 px-4 py-3 btn-comic">
                      <Download size={20} strokeWidth={3} /> Save Image
                    </button>

                    <div className="flex flex-wrap gap-3">
                      {/* Social Share Group */}
                      <button
                        onClick={() => handleSocialShare("twitter")}
                        className="bg-[#1DA1F2] text-white p-4 rounded-xl border-b-4 border-[#1681bf] active:border-b-0 active:translate-y-1 transition-all hover:brightness-110 btn-icon-pop"
                        title="Share on Twitter"
                      >
                        <Twitter size={20} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => handleSocialShare("telegram")}
                        className="bg-[#229ED9] text-white p-4 rounded-xl border-b-4 border-[#1b7db0] active:border-b-0 active:translate-y-1 transition-all hover:brightness-110 btn-icon-pop"
                        title="Share on Telegram"
                      >
                        <Send size={20} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => handleSocialShare("native")}
                        className="bg-slate-200 text-slate-600 p-4 rounded-xl border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-300 btn-icon-pop"
                        title="More Options"
                      >
                        <Share size={20} strokeWidth={3} />
                      </button>

                      <button
                        onClick={handleShareMeme}
                        className="bg-green-500 text-white px-6 py-4 rounded-xl font-black text-lg border-b-4 border-green-700 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3 shadow-lg shadow-green-200 dark:shadow-none ml-2 btn-comic"
                      >
                        <Share2 size={24} strokeWidth={3} /> PUBLISH & EARN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Daily Quests</h2>

                <div className="grid gap-4">
                  {[
                    {
                      title: "Retweet Pinned Post",
                      reward: 200,
                      icon: <Share2 />,
                      color: "bg-blue-500 border-blue-700",
                    },
                    {
                      title: "Join Discord Server",
                      reward: 500,
                      icon: <Users />,
                      color: "bg-indigo-500 border-indigo-700",
                    },
                    {
                      title: "Meme Warrior: Create 1 Meme",
                      reward: 150,
                      icon: <Palette />,
                      color: "bg-purple-500 border-purple-700",
                    },
                    { title: "Hold 1000 $MIAO", reward: 1000, icon: <Gem />, color: "bg-green-500 border-green-700" },
                  ].map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-16 h-16 rounded-2xl ${task.color} text-white flex items-center justify-center shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]`}
                        >
                          {React.cloneElement(task.icon as any, { size: 32, strokeWidth: 2.5 })}
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-slate-800 dark:text-white">{task.title}</h4>
                          <div className="h-3 w-32 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-yellow-400 w-2/3"></div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPoints((p) => p + task.reward)
                          alert(`Quest Complete! +${task.reward} Gems`)
                        }}
                        className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-black text-sm border-b-4 border-yellow-600 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all btn-comic"
                      >
                        CLAIM {task.reward}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolsPage
