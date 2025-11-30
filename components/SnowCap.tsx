import React from 'react';

interface SnowCapProps {
  className?: string;
  visible?: boolean;
}

const SnowCap: React.FC<SnowCapProps> = ({ className = "", visible = true }) => {
  if (!visible) return null;
  
  return (
    <div className={`absolute top-0 left-0 w-full h-8 z-20 pointer-events-none ${className}`}>
      <svg 
        viewBox="0 0 100 20" 
        preserveAspectRatio="none" 
        className="w-full h-full text-white drop-shadow-sm" 
        fill="currentColor"
      >
        <path d="M0 0 L100 0 L100 10 Q 90 20 80 10 T 60 10 T 40 15 T 20 5 T 0 15 Z" />
      </svg>
    </div>
  );
};

export default SnowCap;
