import React from 'react';

export default function HeroGeometry() {
  return (
    <>
      {/* Animated grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Elegant thin-line grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Top-right: precision radial burst with gradient strokes */}
      <div
        className="absolute -top-20 -right-20 w-[680px] h-[680px] pointer-events-none select-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 680 680" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id="burstGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff69e0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8236be" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Spokes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x2 = 340 + Math.cos(angle) * 340;
            const y2 = 340 + Math.sin(angle) * 340;
            return (
              <line
                key={i}
                x1="340" y1="340" x2={x2} y2={y2}
                stroke="white"
                strokeWidth={i % 6 === 0 ? '1' : '0.4'}
                strokeOpacity={i % 6 === 0 ? 0.18 : 0.08}
              />
            );
          })}
          {/* Concentric arcs — graduated */}
          {[60, 110, 170, 240, 320].map((r, i) => (
            <circle key={r} cx="340" cy="340" r={r}
              stroke="white"
              strokeWidth={i === 0 ? '1.2' : '0.5'}
              strokeOpacity={0.22 - i * 0.03}
              fill="none"
            />
          ))}
          {/* Soft radial fill */}
          <circle cx="340" cy="340" r="320" fill="url(#burstGrad)" />
          {/* Accent dots on rings */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={340 + Math.cos(rad) * 170}
                cy={340 + Math.sin(rad) * 170}
                r="3"
                fill="white"
                fillOpacity="0.35"
              />
            );
          })}
          {/* Centre jewel */}
          <circle cx="340" cy="340" r="8" fill="white" fillOpacity="0.5" />
          <circle cx="340" cy="340" r="3" fill="white" fillOpacity="0.9" />
        </svg>
      </div>

      {/* Bottom-left: refined mesh with triangular lattice */}
      <div
        className="absolute -bottom-10 -left-10 w-[440px] h-[440px] pointer-events-none select-none opacity-25"
        aria-hidden="true"
      >
        <svg viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Triangular grid */}
          {[
            [80, 380], [160, 320], [240, 380], [0, 320],
            [80, 260], [160, 200], [240, 260], [0, 200],
            [80, 140], [160, 80],  [20, 380],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <polygon
                points={`${cx},${cy - 36} ${cx + 32},${cy + 18} ${cx - 32},${cy + 18}`}
                stroke="white"
                strokeWidth="0.6"
                strokeOpacity={0.2 + (i % 3) * 0.08}
                fill="none"
              />
              <polygon
                points={`${cx},${cy + 36} ${cx + 32},${cy - 18} ${cx - 32},${cy - 18}`}
                stroke="white"
                strokeWidth="0.4"
                strokeOpacity={0.12 + (i % 3) * 0.05}
                fill="none"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Centre-right: large elegant circle ring with inner detail */}
      <div
        className="absolute top-1/2 right-[3%] -translate-y-1/2 w-[260px] h-[260px] pointer-events-none select-none hidden xl:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff69e0" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="130" cy="130" r="118" stroke="url(#ringStroke)" strokeWidth="1.2" fill="none" />
          <circle cx="130" cy="130" r="90"  stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
          <circle cx="130" cy="130" r="60"  stroke="white" strokeWidth="0.4" strokeOpacity="0.08" fill="none" />
          {/* Cross hairs */}
          <line x1="12" y1="130" x2="248" y2="130" stroke="white" strokeWidth="0.4" strokeOpacity="0.1" />
          <line x1="130" y1="12" x2="130" y2="248" stroke="white" strokeWidth="0.4" strokeOpacity="0.1" />
          {/* Cardinal dots */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle key={i} cx={130 + Math.cos(rad) * 118} cy={130 + Math.sin(rad) * 118}
                r="3.5" fill="white" fillOpacity="0.4" />
            );
          })}
          {/* Centre mark */}
          <circle cx="130" cy="130" r="5" fill="white" fillOpacity="0.25" />
        </svg>
      </div>

      {/* Thin diagonal accent lines — top left */}
      <div
        className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none opacity-[0.07]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {[0, 24, 48, 72, 96, 120].map((offset, i) => (
            <line key={i}
              x1={offset} y1="0" x2="0" y2={offset}
              stroke="white" strokeWidth="0.8"
            />
          ))}
          {[150, 174, 198, 222, 246, 270, 294].map((offset, i) => (
            <line key={i}
              x1={offset} y1="0" x2="0" y2={offset}
              stroke="white" strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>
    </>
  );
}
