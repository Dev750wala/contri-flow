"use client";
import React, { useEffect, useRef } from 'react';

const CryzeoAnimatedBackground = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (svgRef.current) svgRef.current.style.willChange = 'transform';
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900" />
      <div
        className="absolute top-[-30%] left-[-20%] w-[1200px] h-[1200px] rounded-full"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.08) 35%, rgba(14, 165, 233, 0.04) 60%, transparent 100%)',
          animation: 'morphSlow 35s ease-in-out infinite',
          filter: 'blur(100px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute bottom-[-35%] right-[-25%] w-[1400px] h-[1400px] rounded-full"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(20, 184, 166, 0.12) 0%, rgba(6, 182, 212, 0.06) 40%, rgba(8, 145, 178, 0.03) 70%, transparent 100%)',
          animation: 'morphSlow 40s ease-in-out infinite reverse',
          animationDelay: '10s',
          filter: 'blur(120px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(6, 182, 212, 0.08) 0%, rgba(14, 165, 233, 0.04) 50%, transparent 80%)',
          animation: 'gentleFloat 25s ease-in-out infinite',
          animationDelay: '15s',
          filter: 'blur(80px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full opacity-50"
        style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[...Array(5)].map((_, i) => {
          const startX = 10 + Math.random() * 80;
          const startY = 10 + Math.random() * 80;
          const endX = 10 + Math.random() * 80;
          const endY = 10 + Math.random() * 80;
          return (
            <line
              key={`line-${i}`}
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke="rgba(6, 182, 212, 0.3)"
              strokeWidth="1"
              filter="url(#glow)"
              style={{
                animation: `lineMove ${12 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 15}s`,
                transform: 'translateZ(0)',
              }}
            >
              <animate
                attributeName="x1"
                values={`${startX}%;${startX + 10}%;${startX - 5}%;${startX}%`}
                dur={`${8 + Math.random() * 6}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y1"
                values={`${startY}%;${startY - 8}%;${startY + 12}%;${startY}%`}
                dur={`${10 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={`${endX}%;${endX - 15}%;${endX + 8}%;${endX}%`}
                dur={`${9 + Math.random() * 7}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                values={`${endY}%;${endY + 10}%;${endY - 6}%;${endY}%`}
                dur={`${11 + Math.random() * 9}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}
        {[...Array(10)].map((_, i) => {
          const startX = 5 + Math.random() * 90;
          const startY = 5 + Math.random() * 90;
          const r = 1.5 + Math.random() * 2.5;
          return (
            <circle
              key={`node-${i}`}
              cx={`${startX}%`}
              cy={`${startY}%`}
              r={r}
              fill="rgba(6, 182, 212, 0.8)"
              filter="url(#glow)"
              style={{
                animation: `nodeFloat ${6 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 20}s`,
                transform: 'translateZ(0)',
              }}
            >
              <animate
                attributeName="cx"
                values={`${startX}%;${startX + 15}%;${startX - 10}%;${startX + 5}%;${startX}%`}
                dur={`${15 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${startY}%;${startY - 12}%;${startY + 18}%;${startY - 8}%;${startY}%`}
                dur={`${18 + Math.random() * 12}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${r};${r * 1.5};${r * 0.8};${r * 1.2};${r}`}
                dur={`${4 + Math.random() * 6}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
        {[...Array(5)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <circle
              key={`particle-${i}`}
              cx={`${startX}%`}
              cy={`${startY}%`}
              r="0.8"
              fill="rgba(20, 184, 166, 0.6)"
              filter="url(#glow)"
              style={{ transform: 'translateZ(0)' }}
            >
              <animate
                attributeName="cx"
                values={`${startX}%;${startX + 30}%;${startX - 20}%;${startX}%`}
                dur={`${20 + Math.random() * 15}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${startY}%;${startY - 25}%;${startY + 35}%;${startY}%`}
                dur={`${25 + Math.random() * 20}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.4;0.9;0.3"
                dur={`${6 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.4) 70%, rgba(15, 23, 42, 0.8) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <style jsx>{`
        @keyframes morphSlow {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          25% {
            transform: translate(40px, -60px) scale(1.1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-30px, 40px) scale(0.9);
            opacity: 1.2;
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
            opacity: 0.9;
          }
        }
        @keyframes gentleFloat {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.8;
          }
          33% {
            transform: translateY(-40px) translateX(30px) scale(1.05);
            opacity: 1;
          }
          66% {
            transform: translateY(20px) translateX(-25px) scale(0.95);
            opacity: 0.9;
          }
        }
        @keyframes lineMove {
          0%,
          100% {
            opacity: 0.3;
            stroke-width: 1;
          }
          50% {
            opacity: 0.7;
            stroke-width: 1.5;
          }
        }
        @keyframes nodeFloat {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CryzeoAnimatedBackground;