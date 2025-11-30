
import React, { useState } from 'react';
import { GeneratedCat } from '../types';
import { Sparkles, RefreshCw, Zap, Send } from 'lucide-react';
import SnowCap from './SnowCap';

interface CatGeneratorProps {
  isChristmasMode?: boolean;
}

const CatGenerator: React.FC<CatGeneratorProps> = ({ isChristmasMode = false }) => {
  const [cats, setCats] = useState<GeneratedCat[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('stabilityai/stable-diffusion-3-medium');
  const [quality, setQuality] = useState('medium');

  const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; 
  const TELEGRAM_CHAT_ID = '-1002345678901';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    setLoading(true);

    try {
      if (window.puter && window.puter.ai) {
        const baseCharacteristics = 'a cute green cat mascot named Miao, big black eyes, comic style, vibrant colors';
        const finalPrompt = `${baseCharacteristics}, ${prompt}`;
        
        const imgElement = await window.puter.ai.txt2img(finalPrompt, { model, quality });
        
        if (imgElement && imgElement.src) {
           const newCat: GeneratedCat = {
             id: Date.now().toString(),
             imageUrl: imgElement.src
           };
           setCats(prev => [newCat, ...prev]);
        }
      } else {
        alert("Puter.js AI service not available.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareToTelegram = async (cat: GeneratedCat) => {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
      alert("Telegram Bot Token not configured in code!");
      return;
    }
    try {
      const response = await fetch(cat.imageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', blob, 'miao-generated.png');
      formData.append('caption', `Generated via MIAO Army: ${prompt}`);

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      alert("Sent to Telegram!");
    } catch (e) {
      console.error(e);
      alert("Failed to share.");
    }
  };

  return (
    <section id="generator" className="py-24 bg-[var(--bg-primary)] text-center px-6 md:px-12 lg:px-24 overflow-hidden border-t-4 border-[var(--border-color)]">
      <div className="max-w-5xl mx-auto">
        <div className="inline-block mb-4">
             <Zap className="inline text-yellow-400 fill-current animate-bounce" size={48}/>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6">
          Miao Army Generator
        </h2>
        <p className="text-[var(--text-secondary)] text-xl font-bold mb-12 max-w-2xl mx-auto">
          Spawn unique variants of Miao using AI and share them with the community!
        </p>

        {/* Control Panel */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 border-b-8 border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden text-left shadow-lg">
          <SnowCap className="h-12" visible={isChristmasMode} />
          
          {/* Prompt Input */}
          <div className="mb-6 relative z-10">
            <label className="block font-black text-sm uppercase text-slate-400 mb-3 tracking-widest">Your Prompt</label>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., wearing a space suit, eating pizza..."
              className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 font-bold text-lg text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
             <div>
               <label className="block font-black text-sm uppercase text-slate-400 mb-3 tracking-widest">Model</label>
               <select 
                 value={model}
                 onChange={(e) => setModel(e.target.value)}
                 className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-800 dark:text-white appearance-none"
               >
                 <option value="stabilityai/stable-diffusion-3-medium">Stable Diffusion 3</option>
                 <option value="dall-e-3">DALL·E 3 (Premium)</option>
                 <option value="gpt-image-1">GPT Image-1</option>
               </select>
             </div>

             <div>
               <label className="block font-black text-sm uppercase text-slate-400 mb-3 tracking-widest">Quality</label>
               <select 
                 value={quality}
                 onChange={(e) => setQuality(e.target.value)}
                 className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-800 dark:text-white appearance-none"
               >
                 <option value="medium">Medium (Fast)</option>
                 <option value="high">High (Slower)</option>
               </select>
             </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className={`
              w-full bg-[#1CB0F6] text-white px-6 py-5 rounded-2xl font-black text-2xl 
              flex items-center justify-center gap-3 uppercase tracking-wide
              border-b-[6px] border-[#1899D6] active:border-b-0 active:translate-y-[6px]
              hover:brightness-110 transition-all relative z-10
              ${loading ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={28} />
            ) : (
              <Sparkles size={28} className="text-yellow-300 fill-current" />
            )}
            {loading ? 'SUMMONING...' : 'GENERATE MIAO'}
          </button>
        </div>

        {/* Generated Results */}
        {cats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {cats.map((cat) => (
              <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-4 border-b-8 border-slate-200 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300">
                <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-800">
                   <img 
                    src={cat.imageUrl} 
                    alt="Generated Green Cat" 
                    className="w-full h-full object-cover"
                   />
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                   <span className="font-bold text-sm text-slate-400 uppercase tracking-wide">#{cat.id.slice(-4)}</span>
                   <button 
                     onClick={() => shareToTelegram(cat)}
                     className="bg-[#229ED9] text-white p-3 rounded-xl border-b-4 border-[#1b7db0] active:border-b-0 active:translate-y-1 transition-all"
                     title="Send to Telegram"
                   >
                     <Send size={18} fill="currentColor" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CatGenerator;
