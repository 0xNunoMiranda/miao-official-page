import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 text-center bg-[var(--bg-tertiary)] border-y-4 border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto">
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-[var(--text-primary)]">
          When dogs barked and frogs leapt, everyone thought the meme wars were done. 
          Yet in the shadows, something patient lingered. 
          Behind every bark or croak came a sharp, knowing <span className="text-[var(--brand)] font-black text-stroke">$MIAO</span> that no one could ignore. 
          The streets aren't safe <span className="inline-block animate-pulse text-[var(--brand)]">_</span>
        </p>
      </div>
    </section>
  );
};

export default About;
