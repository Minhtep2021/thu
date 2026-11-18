import { motion } from 'motion/react';
import { CONFIG } from '../config/confessionConfig';

function FloralCorner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={`pointer-events-none h-14 w-14 text-[#c68e43]/75 sm:h-16 sm:w-16 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Delicate gold stem curl & rose petals */}
      <path
        d="M8,72 C8,34 34,8 72,8"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M14,56 C22,42 36,28 54,18"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
      <circle cx="19" cy="19" r="6" fill="#e11d48" fillOpacity="0.72" />
      <circle cx="19" cy="19" r="3" fill="#fda4af" fillOpacity="0.9" />
      <ellipse
        cx="32"
        cy="13"
        rx="5"
        ry="2.6"
        transform="rotate(-12 32 13)"
        fill="#4d7c5b"
        fillOpacity="0.72"
      />
      <ellipse
        cx="13"
        cy="32"
        rx="2.6"
        ry="5"
        transform="rotate(12 13 32)"
        fill="#4d7c5b"
        fillOpacity="0.72"
      />
      <circle cx="48" cy="12" r="2" fill="#f59e0b" fillOpacity="0.7" />
      <circle cx="12" cy="48" r="2" fill="#f59e0b" fillOpacity="0.7" />
    </svg>
  );
}

const FLOATING_HEARTS = [
  { left: '8%', delay: 0, duration: 5.4, size: 16 },
  { left: '22%', delay: 1.2, duration: 6.2, size: 13 },
  { left: '78%', delay: 0.6, duration: 5.8, size: 15 },
  { left: '90%', delay: 1.8, duration: 6.5, size: 14 },
  { left: '50%', delay: 2.2, duration: 6.0, size: 12 },
];

export function CelebrationCard() {
  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center justify-center px-4 py-10 sm:px-6">
      {/* Gentle floating hearts around the keepsake card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {FLOATING_HEARTS.map((heart, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 90, opacity: 0 }}
            animate={{
              y: [-20, -140],
              opacity: [0, 0.72, 0],
              x: [0, idx % 2 === 0 ? 14 : -14, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ left: heart.left, bottom: '18%' }}
            className="absolute"
          >
            <svg
              viewBox="0 0 24 24"
              style={{ width: heart.size, height: heart.size }}
              className="fill-rose-300/80 drop-shadow-[0_0_8px_rgba(251,113,133,0.55)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Keepsake Romantic Summary Card */}
      <motion.article
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="paper-texture relative w-full max-w-[580px] rounded-3xl border border-[#d4a359]/75 px-7 py-12 text-center shadow-[0_32px_90px_rgba(0,0,0,0.62),0_0_55px_rgba(251,113,133,0.22)] sm:px-12 sm:py-14"
      >
        {/* Inner fine double border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3.5 rounded-2xl border border-[#c68e43]/38"
        />

        {/* 4 Floral Botanical Corners */}
        <FloralCorner className="absolute top-3 left-3" />
        <FloralCorner className="absolute top-3 right-3 -scale-x-100" />
        <FloralCorner className="absolute bottom-3 left-3 -scale-y-100" />
        <FloralCorner className="absolute right-3 bottom-3 -scale-x-100 -scale-y-100" />

        <div className="relative z-10 mx-auto max-w-md space-y-6">
          {/* Glowing Heart Emblem */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 16 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-300/60 bg-gradient-to-br from-rose-500 to-rose-700 shadow-md shadow-rose-500/30"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-rose-50">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-vietnamese text-balance text-2xl leading-snug font-semibold text-[#4a0e20] sm:text-[1.75rem]"
          >
            {CONFIG.celebrationStep.mainHeading}
          </motion.h1>

          {/* Subtle Divider */}
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c68e43]/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c68e43]/70" />
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c68e43]/60" />
          </div>

          {/* Sub-message */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-vietnamese text-base leading-relaxed font-normal text-[#5c2334]/95 sm:text-[1.0625rem]"
          >
            {CONFIG.celebrationStep.subMessage}
          </motion.p>

          {/* Two-line Romantic Footer Note */}
          <motion.footer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.6 }}
            className="pt-3"
          >
            <p className="font-romantic text-xl font-semibold italic text-[#7a1c38] sm:text-2xl">
              {CONFIG.celebrationStep.footerLine1}
              <br />
              <span className="text-lg font-medium text-[#6f3b4a] sm:text-xl">
                {CONFIG.celebrationStep.footerLine2}
              </span>
            </p>
          </motion.footer>
        </div>
      </motion.article>
    </div>
  );
}
