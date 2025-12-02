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
        <path d="M 2 0 L 98 0 Q 100 0 100 2 L 100 8 Q 90 18 80 10 T 60 10 T 40 15 T 20 5 Q 10 15 0 15 Q 0 13 0 11 L 0 2 Q 0 0 2 0 Z" />
      </svg>
    </div>
  );
};

export default SnowCap;
