import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config/confessionConfig';

export type FlowerPhase = 'bud' | 'blooming' | 'envelope_ready';

interface BloomingFlowerProps {
  phase: FlowerPhase;
  onTapFlower: () => void;
  onTapEnvelope: () => void;
}

const OUTER_ANGLES = [0, 60, 120, 180, 240, 300];
const MIDDLE_ANGLES = [30, 90, 150, 210, 270, 330];
const INNER_ANGLES = [0, 72, 144, 216, 288];

export function BloomingFlower({
  phase,
  onTapFlower,
  onTapEnvelope,
}: BloomingFlowerProps) {
  const isBloomed = phase === 'blooming' || phase === 'envelope_ready';
  const showEnvelope = phase === 'envelope_ready';

  return (
    <div className="relative flex flex-col items-center justify-center px-6 py-8 text-center">
      {/* Warm twilight halo behind the rose (pure radial gradient, zero expensive blur filter) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-80 w-80 rounded-full sm:h-[420px] sm:w-[420px]"
        animate={{
          scale: isBloomed ? 1.24 : 1,
          opacity: isBloomed ? 0.85 : 0.55,
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background:
            'radial-gradient(circle, rgba(251, 113, 133, 0.32) 0%, rgba(251, 191, 36, 0.14) 44%, transparent 70%)',
        }}
      />

      {/* Interactive Flower / Revealed Envelope Stage (stationary button hitbox for accessibility) */}
      <div className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[400px] sm:w-[400px]">
        <button
          type="button"
          onClick={showEnvelope ? onTapEnvelope : onTapFlower}
          aria-label={
            showEnvelope
              ? CONFIG.flowerStep.envelopeButtonAriaLabel
              : CONFIG.flowerStep.flowerButtonAriaLabel
          }
          className="group relative flex h-full w-full cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 active:scale-[0.98]"
        >
          {/* Inner Breathing Wrapper (keeps outer <button> stable) */}
          <div
            className={`relative flex h-full w-full items-center justify-center ${
              !isBloomed ? 'animate-breathe' : ''
            }`}
          >
            {/* Multi-layered SVG Blooming Rose centered at (0,0) */}
            <svg
              viewBox="-165 -165 330 330"
              className="h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="outerPetalGrad" cx="50%" cy="22%" r="78%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="32%" stopColor="#e11d48" />
                  <stop offset="82%" stopColor="#881337" />
                  <stop offset="100%" stopColor="#4c0519" />
                </radialGradient>

                <radialGradient id="middlePetalGrad" cx="50%" cy="24%" r="76%">
                  <stop offset="0%" stopColor="#fecdd3" />
                  <stop offset="38%" stopColor="#f43f5e" />
                  <stop offset="90%" stopColor="#9f1239" />
                </radialGradient>

                <radialGradient id="innerPetalGrad" cx="50%" cy="28%" r="74%">
                  <stop offset="0%" stopColor="#fff1f2" />
                  <stop offset="45%" stopColor="#fb7185" />
                  <stop offset="95%" stopColor="#be123c" />
                </radialGradient>

                <radialGradient id="leafGrad" cx="35%" cy="20%" r="80%">
                  <stop offset="0%" stopColor="#5b8e6b" />
                  <stop offset="65%" stopColor="#264b35" />
                  <stop offset="100%" stopColor="#14291d" />
                </radialGradient>

                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="52%" stopColor="#fbbf24" stopOpacity="0.48" />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="dewdrop" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#fde68a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.14" />
                </radialGradient>
              </defs>

              {/* Calyx / Emerald Leaves — tucked near bud, fan out on bloom */}
              {OUTER_ANGLES.map((angle, idx) => (
                <g key={`leaf-${angle}`} transform={`rotate(${angle + 25})`}>
                  <motion.path
                    d="M0,-14 C18,-56 26,-96 0,-134 C-26,-96 -18,-56 0,-14 Z"
                    fill="url(#leafGrad)"
                    stroke="rgba(167, 243, 208, 0.24)"
                    strokeWidth="1"
                    initial={false}
                    animate={{
                      y: isBloomed ? -22 : 12,
                      scale: isBloomed ? 1.12 : 0.7,
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                    transition={{
                      duration: 1.35,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </g>
              ))}

              {/* Layer 1: Outer Petals (tucked in bud, unfurl radially outward first) */}
              {OUTER_ANGLES.map((angle, idx) => (
                <g key={`outer-${angle}`} transform={`rotate(${angle})`}>
                  <motion.path
                    d="M0,-6 C46,-18 72,-78 0,-124 C-72,-78 -46,-18 0,-6 Z"
                    fill="url(#outerPetalGrad)"
                    stroke="rgba(254, 215, 170, 0.34)"
                    strokeWidth="1.2"
                    initial={false}
                    animate={{
                      y: isBloomed ? -32 : 16,
                      scale: isBloomed ? 1.15 : 0.56,
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                    transition={{
                      duration: 1.25,
                      delay: isBloomed ? idx * 0.055 : 0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </g>
              ))}

              {/* Layer 2: Middle Petals (unfurl radially second) */}
              {MIDDLE_ANGLES.map((angle, idx) => (
                <g key={`mid-${angle}`} transform={`rotate(${angle})`}>
                  <motion.path
                    d="M0,-4 C40,-16 58,-68 0,-104 C-58,-68 -40,-16 0,-4 Z"
                    fill="url(#middlePetalGrad)"
                    stroke="rgba(255, 228, 230, 0.4)"
                    strokeWidth="1.1"
                    initial={false}
                    animate={{
                      y: isBloomed ? -24 : 12,
                      scale: isBloomed ? 1.1 : 0.52,
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                    transition={{
                      duration: 1.2,
                      delay: isBloomed ? 0.22 + idx * 0.055 : 0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </g>
              ))}

              {/* Layer 3: Inner Petals (unfurl radially third) */}
              {INNER_ANGLES.map((angle, idx) => (
                <g key={`inner-${angle}`} transform={`rotate(${angle})`}>
                  <motion.path
                    d="M0,-2 C28,-12 42,-50 0,-78 C-42,-50 -28,-12 0,-2 Z"
                    fill="url(#innerPetalGrad)"
                    stroke="rgba(255, 241, 242, 0.48)"
                    strokeWidth="1"
                    initial={false}
                    animate={{
                      y: isBloomed ? -18 : 8,
                      scale: isBloomed ? 1.06 : 0.5,
                      opacity: showEnvelope ? 0.88 : 1,
                    }}
                    style={{ transformOrigin: '0px 0px' }}
                    transition={{
                      duration: 1.1,
                      delay: isBloomed ? 0.42 + idx * 0.055 : 0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </g>
              ))}

              {/* Golden Heart Core Glow */}
              <motion.circle
                cx="0"
                cy="0"
                r="58"
                fill="url(#coreGlow)"
                initial={false}
                animate={{
                  scale: isBloomed ? 1.5 : 0.78,
                  opacity: isBloomed ? 0.95 : 0.5,
                }}
                style={{ transformOrigin: '0px 0px' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* Closed Bud Spiral Center (nestled cleanly at (0,0), fades out as envelope emerges) */}
              <motion.g
                initial={false}
                animate={{
                  opacity: showEnvelope ? 0 : 1,
                  scale: isBloomed ? 0.45 : 1,
                }}
                style={{ transformOrigin: '0px 0px' }}
                transition={{ duration: 0.65 }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="30"
                  fill="#be123c"
                  stroke="rgba(255,228,230,0.4)"
                  strokeWidth="1.2"
                />
                <path
                  d="M-14,-4 C-10,-20 16,-20 16,-2 C16,14 -12,18 -18,2 C-22,-12 -8,-26 12,-22"
                  fill="none"
                  stroke="#ffe4e6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.88"
                />
                <path
                  d="M-5,-2 C-2,-8 6,-7 6,-1 C6,5 -4,7 -7,1"
                  fill="none"
                  stroke="#fff1f2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.92"
                />
              </motion.g>

              {/* Glistening Dewdrops perched symmetrically on petals */}
              {[
                { x: -26, y: -36, r: 4.2 },
                { x: 34, y: -16, r: 3.5 },
                { x: -16, y: 30, r: 3.8 },
                { x: 22, y: 34, r: 3.0 },
              ].map((drop, i) => (
                <motion.g
                  key={i}
                  initial={false}
                  animate={{
                    x: isBloomed ? drop.x * 1.9 : drop.x,
                    y: isBloomed ? drop.y * 1.9 : drop.y,
                    opacity: showEnvelope ? 0.65 : 0.94,
                  }}
                  transition={{ duration: 1.2, delay: 0.18 }}
                >
                  <circle cx="0" cy="0" r={drop.r} fill="url(#dewdrop)" />
                  <circle
                    cx={-drop.r * 0.3}
                    cy={-drop.r * 0.3}
                    r={drop.r * 0.28}
                    fill="#ffffff"
                  />
                </motion.g>
              ))}
            </svg>

            {/* Rising Vintage Cream Envelope with Red Wax Heart Seal */}
            <AnimatePresence>
              {showEnvelope && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.35, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: -2 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="animate-float-slow pointer-events-none absolute flex items-center justify-center"
                >
                  <div className="relative h-[126px] w-[184px] rounded-xl border border-amber-300/60 bg-[#fbf4e7] shadow-[0_18px_45px_rgba(251,191,36,0.35),0_10px_30px_rgba(0,0,0,0.5)] sm:h-[144px] sm:w-[210px]">
                    <div
                      className="absolute -inset-6 -z-10 rounded-full"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(253, 224, 71, 0.38) 0%, transparent 70%)',
                      }}
                    />
                    <svg
                      viewBox="0 0 208 142"
                      className="h-full w-full rounded-xl"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="envCream" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fffaf2" />
                          <stop offset="100%" stopColor="#efe0c9" />
                        </linearGradient>
                      </defs>
                      <rect width="208" height="142" rx="12" fill="url(#envCream)" />
                      <path
                        d="M4,138 L104,68 L204,138"
                        fill="none"
                        stroke="#d4a359"
                        strokeOpacity="0.42"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M4,4 L104,82 L204,4"
                        fill="#f7ebd7"
                        stroke="#d4a359"
                        strokeOpacity="0.55"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {/* Crimson Red Wax Heart Seal */}
                    <div className="absolute top-[54%] left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rose-300/40 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 shadow-[0_4px_12px_rgba(136,19,55,0.65)]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-rose-100" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>

      {/* Prompt Caption below the rose/envelope */}
      <div className="mt-6 min-h-[60px] max-w-md px-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={showEnvelope ? 'envelope-prompt' : 'flower-prompt'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="font-vietnamese text-base font-medium tracking-wide text-amber-50/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-lg"
          >
            {showEnvelope ? CONFIG.flowerStep.envelopePrompt : CONFIG.flowerStep.initialPrompt}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
