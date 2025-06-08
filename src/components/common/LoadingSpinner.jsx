import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <div className="loading">
        <svg width="128px" height="96px" className="scale-150">
          <polyline 
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" 
            className="fill-none stroke-red-400/20 stroke-[4]"
            strokeLinecap="round"
          />
          <polyline 
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" 
            className="fill-none stroke-red-500 stroke-[4] animate-pulse"
            strokeLinecap="round"
            style={{
              strokeDasharray: '48, 144',
              strokeDashoffset: '192',
              animation: 'dash 1.4s linear infinite'
            }}
          />
        </svg>
      </div>
      <style>{`
        @keyframes dash {
          72.5% {
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;