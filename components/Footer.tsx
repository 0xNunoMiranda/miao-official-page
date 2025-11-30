import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[var(--bg-primary)] pt-16 pb-12 px-6 md:px-12 lg:px-24 border-t-4 border-[var(--border-color)] overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12">
        {/* Left: Disclaimer */}
        <div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6">Disclaimer</h3>
          <p className="text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl">
            Miao Token is a meme coin created purely for entertainment and community purposes. It does not represent an
            investment contract, security, or guarantee of profit. Please invest only what you can afford to lose. By
            participating, you acknowledge the high-risk nature of meme coins, including potential loss of your entire
            investment.
          </p>
        </div>

        {/* Right: Copyright & Contact */}
        <div className="flex flex-col items-start md:items-end justify-between">
          <div className="text-right w-full">
            <p className="font-bold text-[var(--text-primary)] text-lg mb-4">All rights reserved © Miao Token. 2025</p>
            <a
              href="mailto:miaotokenonsol@gmail.com"
              className="inline-block bg-[var(--brand)] text-white px-8 py-3 rounded-full font-bold comic-border comic-shadow btn-comic"
            >
              Send Email
            </a>
          </div>
        </div>
      </div>

      <img
        src="/images/clouds3.png"
        alt="Miao cats relaxing on a tropical island"
        className="absolute bottom-0 right-0 w-[300px] md:w-[400px] lg:w-[500px] h-auto pointer-events-none select-none"
      />
    </footer>
  )
}

export default Footer
