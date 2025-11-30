import type React from "react"

const Community: React.FC = () => {
  return (
    <section id="community" className="py-24 px-6 md:px-12 lg:px-24 bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-8">100% Community Owned</h2>

        <div className="bg-[var(--bg-primary)] rounded-3xl p-8 md:p-12 border-2 border-[var(--border-color)] border-b-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Liquidity Burned",
                desc: "No rug pulls. The pool is gone forever.",
                color: "bg-[var(--duo-red)]",
                shadow: "border-[var(--btn-shadow-red)]",
              },
              {
                title: "Contract Renounced",
                desc: "We can't change it even if we tried.",
                color: "bg-[var(--duo-blue)]",
                shadow: "border-[var(--btn-shadow-blue)]",
              },
              {
                title: "No Treasury",
                desc: "No dev wallet. No marketing tax. Pure chaos.",
                color: "bg-[var(--duo-yellow)]",
                shadow: "border-[var(--btn-shadow-orange)]",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div
                  className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-4 border-2 border-b-4 ${item.shadow} group-hover:scale-105 transition-transform`}
                />
                <h3 className="text-lg font-black text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[var(--bg-secondary)] p-6 rounded-2xl border-2 border-dashed border-[var(--border-color)]">
            <p className="text-base font-bold text-[var(--text-primary)] italic">
              "This token belongs to everyone. There is no team allocation. Just a green cat and the internet. Good
              luck."
            </p>
            <p className="text-right text-[var(--duo-green)] font-black mt-2">- The Shadows</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Community
