import React, { useState } from 'react';
import { Game, WalletState } from '../types';
import { Play, Star, Trophy, Users, Search, ArrowLeft, Gamepad2, Flame, Zap, Crown } from 'lucide-react';

interface GamesPageProps {
  onBack: () => void;
  walletState: WalletState;
}

const mockGames: Game[] = [
  { id: '1', title: 'Super Miao Bros', category: 'Action', rating: 4.8, plays: '1.2M', image: 'https://placehold.co/300x200/00d26a/white?text=Super+Miao', isHot: true },
  { id: '2', title: 'Shadow Runner', category: 'Arcade', rating: 4.5, plays: '850K', image: 'https://placehold.co/300x200/1e293b/00d26a?text=Shadow+Run', isNew: true },
  { id: '3', title: 'Token Crush', category: 'Puzzle', rating: 4.2, plays: '2.1M', image: 'https://placehold.co/300x200/a855f7/white?text=Token+Crush' },
  { id: '4', title: 'Miao Kart', category: 'Racing', rating: 4.9, plays: '3.5M', image: 'https://placehold.co/300x200/f97316/white?text=Miao+Kart', isHot: true },
  { id: '5', title: 'Frog Splat', category: 'Action', rating: 4.0, plays: '500K', image: 'https://placehold.co/300x200/ef4444/white?text=Frog+Splat' },
  { id: '6', title: 'Moon Rocket', category: 'Strategy', rating: 4.6, plays: '900K', image: 'https://placehold.co/300x200/3b82f6/white?text=Moon+Rocket' },
];

const GamesPage: React.FC<GamesPageProps> = ({ onBack, walletState }) => {
  const [activeTab, setActiveTab] = useState('all');

  const NavButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`
        w-full text-left p-4 rounded-2xl font-black flex items-center gap-4 transition-all border-2 border-transparent btn-comic
        ${activeTab === id 
            ? 'bg-green-100 text-green-600 border-green-200 border-b-4' 
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
      `}
    >
        <Icon size={28} className={activeTab === id ? "fill-current" : ""} strokeWidth={2.5} />
        <span className="text-lg tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[var(--bg-primary)] text-[var(--text-primary)] font-fredoka">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-4">
                <button 
                  onClick={onBack} 
                  className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border-b-4 border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center active:border-b-0 active:translate-y-1 btn-comic"
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Miao Arcade</h1>
                  <span className="text-slate-400 font-bold text-sm">Play to Earn</span>
                </div>
            </div>

            {/* Wallet / Points Status */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-2 pr-6 shadow-sm">
                <div className="w-12 h-12 bg-transparent flex items-center justify-center">
                    <Crown size={32} className="text-yellow-400 fill-current animate-bounce" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-2xl font-black text-yellow-500 tracking-tight">RANK #14</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {walletState.isConnected ? walletState.address?.slice(0,6) : 'GUEST'}
                    </span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
              <div className="sticky top-28 space-y-2">
                  <NavButton id="all" icon={Gamepad2} label="All Games" />
                  <NavButton id="action" icon={Zap} label="Action" />
                  <NavButton id="hot" icon={Flame} label="Hot" />
                  
                  <div className="mt-8 pt-6 border-t-2 border-slate-100 dark:border-slate-800 px-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Your Stats</p>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Games Played</span>
                              <span className="text-green-500 font-black">12</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-slate-600 dark:text-slate-300">Win Rate</span>
                              <span className="text-blue-500 font-black">64%</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8 animate-fade-up">
            
            {/* Featured Banner */}
            <div className="bg-indigo-500 rounded-[2.5rem] p-8 relative overflow-hidden border-b-8 border-indigo-700 shadow-xl group cursor-pointer hover:brightness-105 transition-all">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left text-white max-w-md">
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wide inline-block mb-3 border-b-2 border-yellow-600">
                           Featured
                        </span>
                        <h2 className="text-4xl font-black mb-2 leading-tight">Super Miao Bros</h2>
                        <p className="text-indigo-100 font-bold text-lg mb-6">Jump, run, and collect tokens in this classic platformer adventure!</p>
                        <button className="bg-white text-indigo-600 font-black px-8 py-4 rounded-xl border-b-4 border-indigo-200 hover:bg-indigo-50 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide flex items-center gap-2 mx-auto md:mx-0 btn-comic">
                            <Play size={20} fill="currentColor" /> Play Now
                        </button>
                    </div>
                    
                    {/* Hero Image / Placeholder */}
                    <div className="w-64 h-48 bg-indigo-400 rounded-2xl border-4 border-indigo-300 transform rotate-3 shadow-lg flex items-center justify-center">
                        <Gamepad2 size={64} className="text-indigo-200" />
                    </div>
                </div>
                
                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for a game..." 
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={3} />
            </div>

            {/* Games Grid */}
            <div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                   <Star className="text-yellow-400 fill-current" /> Trending Now
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockGames.map(game => (
                    <div key={game.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all group hover:-translate-y-1">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 relative overflow-hidden">
                            <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                            {game.isHot && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-b-2 border-red-700">HOT</span>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{game.title}</h4>
                                <span className="text-xs font-bold text-slate-400">{game.category}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-black">
                                <Star size={12} fill="currentColor" /> {game.rating}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-slate-100 dark:border-slate-700">
                             <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                 <Users size={14} /> {game.plays}
                             </span>
                             <button className="bg-green-500 text-white px-6 py-2 rounded-xl font-black text-sm border-b-4 border-green-700 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all btn-comic">
                                 PLAY
                             </button>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;