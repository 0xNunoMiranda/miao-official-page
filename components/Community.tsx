import type React from "react"
import { ShieldCheck, Flame, Users } from "lucide-react"

const Community: React.FC = () => {
  return (
    <section
      id="community"
      className="py-24 px-6 md:px-12 lg:px-24 bg-[var(--bg-tertiary)] border-y-4 border-[var(--border-color)]"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block bg-[var(--brand)] p-4 rounded-full comic-border comic-shadow mb-8 animate-float">
          <Users size={48} className="text-white" />
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-8">100% Community Owned</h2>

        <div className="bg-[var(--bg-secondary)] p-8 md:p-12 rounded-[2rem] comic-border comic-shadow-hover transition-transform duration-300 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-red-500">
                <Flame size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">Liquidity Burned</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">No rug pulls. The pool is gone forever.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500">
                <ShieldCheck size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">Contract Renounced</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">We can't change it even if we tried.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-500">
                <div className="text-2xl font-black text-yellow-500">0%</div>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">No Treasury</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">No dev wallet. No marketing tax. Pure chaos.</p>
            </div>
          </div>

          <div className="mt-12 bg-[var(--bg-tertiary)] p-6 rounded-xl border-2 border-dashed border-[var(--border-color)]">
            <p className="text-lg font-bold text-[var(--text-primary)]">
              "This token belongs to everyone. There is no team allocation. Just a green cat and the internet. Good
              luck."
            </p>
            <p className="text-right text-[var(--brand)] font-black mt-2">- The Shadows</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Community
