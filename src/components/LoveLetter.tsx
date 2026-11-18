import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion } from 'motion/react';
import { CONFIG } from '../config/confessionConfig';
import {
  computeSafeDodgePosition,
  computeTooltipShiftX,
  getDodgeTooltip,
  getYesButtonBoost,
  inflateRect,
  type Point,
  type RectBounds,
} from '../utils/dodgePhysics';

interface LoveLetterProps {
  onAcceptYes: () => void;
  musicButtonRef?: RefObject<HTMLButtonElement | null>;
}

type EnvelopeStage = 'unsealing' | 'unfolded';

export function LoveLetter({ onAcceptYes, musicButtonRef }: LoveLetterProps) {
  const [stage, setStage] = useState<EnvelopeStage>('unsealing');
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPos, setNoPos] = useState<Point | null>(null);
  const [noWidth, setNoWidth] = useState(96);
  const lastDodgeTimeRef = useRef<number>(0);

  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStage('unfolded');
    }, 640);
    return () => window.clearTimeout(timer);
  }, []);

  const buildExclusionRects = (): RectBounds[] => {
    const exclusions: RectBounds[] = [];

    const musicRectRaw = musicButtonRef?.current?.getBoundingClientRect();
    if (musicRectRaw) {
      exclusions.push({
        x: musicRectRaw.left,
        y: musicRectRaw.top,
        width: musicRectRaw.width,
        height: musicRectRaw.height,
      });
    }

    // Protect the romantic confession text so neither "No" nor its wide tooltip ever covers it
    const headingRectRaw = headingRef.current?.getBoundingClientRect();
    if (headingRectRaw) {
      exclusions.push(
        inflateRect(
          {
            x: headingRectRaw.left,
            y: headingRectRaw.top,
            width: headingRectRaw.width,
            height: headingRectRaw.height,
          },
          72,
          24,
          56
        )
      );
    }

    return exclusions;
  };

  const triggerDodge = () => {
    const now = Date.now();
    // Guard against double firing from pointerdown + click on the same tap
    if (now - lastDodgeTimeRef.current < 110) {
      return;
    }
    lastDodgeTimeRef.current = now;

    const yesEl = yesButtonRef.current;
    const noEl = noButtonRef.current;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const yesRectRaw = yesEl?.getBoundingClientRect();
    const noRectRaw = noEl?.getBoundingClientRect();

    const yesButtonRect: RectBounds = yesRectRaw
      ? {
          x: yesRectRaw.left,
          y: yesRectRaw.top,
          width: yesRectRaw.width,
          height: yesRectRaw.height,
        }
      : {
          x: viewport.width * 0.5 - 75,
          y: viewport.height * 0.62,
          width: 150,
          height: 52,
        };

    const noButtonSize = noRectRaw
      ? { width: Math.max(88, noRectRaw.width), height: Math.max(44, noRectRaw.height) }
      : { width: 96, height: 44 };

    setNoWidth(noButtonSize.width);

    const currentPos: Point | null =
      noPos ??
      (noRectRaw ? { x: Math.round(noRectRaw.left), y: Math.round(noRectRaw.top) } : null);

    const nextPos = computeSafeDodgePosition({
      viewport,
      noButtonSize,
      yesButtonRect,
      currentNoPos: currentPos,
      exclusionRects: buildExclusionRects(),
      margin: 20,
      yesBuffer: 34,
    });

    setNoPos(nextPos);
    setDodgeCount((prev) => prev + 1);
  };

  // Re-clamp floating "No" button if viewport resizes
  useEffect(() => {
    if (!noPos) return;
    const handleResize = () => {
      const yesRectRaw = yesButtonRef.current?.getBoundingClientRect();
      const noRectRaw = noButtonRef.current?.getBoundingClientRect();
      if (!yesRectRaw || !noRectRaw) return;
      const safe = computeSafeDodgePosition({
        viewport: { width: window.innerWidth, height: window.innerHeight },
        noButtonSize: { width: noRectRaw.width, height: noRectRaw.height },
        yesButtonRect: {
          x: yesRectRaw.left,
          y: yesRectRaw.top,
          width: yesRectRaw.width,
          height: yesRectRaw.height,
        },
        currentNoPos: noPos,
        exclusionRects: buildExclusionRects(),
      });
      setNoPos(safe);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [noPos]);

  const { scale: yesScale, glowLevel } = getYesButtonBoost(dodgeCount);
  const activeTooltip = getDodgeTooltip(dodgeCount, CONFIG.letterStep.noDodgeTooltips);
  const confessionWords = CONFIG.letterStep.confessionText.split(' ');
  const estimatedTooltipWidth = activeTooltip ? Math.min(270, activeTooltip.length * 7.5 + 32) : 200;
  const tooltipShiftX = noPos
    ? computeTooltipShiftX(
        noPos.x + noWidth / 2,
        estimatedTooltipWidth,
        typeof window !== 'undefined' ? window.innerWidth : 1440,
        14
      )
    : 0;

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center justify-center px-4 py-8 sm:px-6">
      {stage === 'unsealing' ? (
        <motion.div
          key="envelope-unsealing"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[210px] w-[300px] items-center justify-center sm:h-[240px] sm:w-[340px]"
        >
          {/* Envelope Base */}
          <div className="relative h-full w-full overflow-visible rounded-2xl border border-amber-300/60 bg-[#faf1e2] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            {/* Rising inner letter peek */}
            <motion.div
              initial={{ y: 12, opacity: 0.7 }}
              animate={{ y: -48, opacity: 1 }}
              transition={{ duration: 0.52, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="paper-texture absolute inset-x-4 top-4 bottom-6 rounded-xl border border-amber-500/40 shadow-md"
            />

            {/* Envelope pocket front */}
            <svg
              viewBox="0 0 340 240"
              className="relative z-10 h-full w-full rounded-2xl"
              aria-hidden="true"
            >
              <path
                d="M0,240 L170,115 L340,240 Z"
                fill="#f3e3ca"
                stroke="#d4a359"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              <path
                d="M0,0 L170,132 L0,240 Z"
                fill="#f8ecda"
                stroke="#d4a359"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <path
                d="M340,0 L170,132 L340,240 Z"
                fill="#f6e8d2"
                stroke="#d4a359"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            </svg>

            {/* Top Flap opening upward */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: 165 }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center', perspective: 800 }}
              className="absolute top-0 right-0 left-0 z-20 h-[126px]"
            >
              <svg viewBox="0 0 340 126" className="h-full w-full" aria-hidden="true">
                <path
                  d="M2,2 L170,122 L338,2 Z"
                  fill="#fcf5e8"
                  stroke="#d4a359"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>

            {/* Wax seal cracking & fading */}
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="absolute top-[52%] left-1/2 z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rose-300/40 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-rose-100" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.section
          key="letter-unfolded"
          aria-label="Love Letter"
          initial={{ opacity: 0.85, y: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="paper-texture relative w-full max-w-[540px] rounded-2xl border border-[#d4a359]/65 p-6 text-center shadow-[0_28px_75px_rgba(0,0,0,0.6),0_0_40px_rgba(251,191,36,0.16)] sm:p-10"
        >
          {/* Inner delicate gold trim frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-xl border border-[#c68e43]/40"
          />

          {/* Subtle top gold heart ornament */}
          <div className="relative z-10 mb-5 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c68e43]/60" />
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-rose-700/80">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c68e43]/60" />
          </div>

          {/* Smooth Romantic Word-by-Word Reveal */}
          <h1
            ref={headingRef}
            className="font-romantic relative z-10 mx-auto max-w-md text-balance text-[2rem] leading-[1.22] font-semibold italic text-[#3b0d1b] sm:text-[2.75rem]"
          >
            {confessionWords.map((word, idx) => (
              <motion.span
                key={`${word}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.42,
                  delay: 0.08 + idx * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mr-[0.26em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Action Buttons Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="relative z-10 mt-9 flex min-h-[60px] flex-wrap items-center justify-center gap-5"
          >
            {/* Primary "Yes ❤️" Button — scales and brightens as "No" dodges */}
            <motion.button
              ref={yesButtonRef}
              type="button"
              onClick={onAcceptYes}
              animate={{ scale: yesScale }}
              whileHover={{ scale: yesScale * 1.05 }}
              whileTap={{ scale: yesScale * 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              style={{
                filter: `brightness(${Math.min(1.25, 1 + (glowLevel - 1) * 0.14)})`,
              }}
              className="relative inline-flex min-h-[48px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-8 py-3 text-base font-semibold text-white shadow-[0_12px_34px_-4px_rgba(225,29,72,0.65),0_0_24px_rgba(251,113,133,0.42)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-rose-700"
            >
              <span className="animate-heartbeat inline-flex items-center gap-1.5">
                {CONFIG.letterStep.yesButtonText}
              </span>
            </motion.button>

            {/* Inline "No" Button before first dodge */}
            {!noPos && (
              <button
                ref={noButtonRef}
                type="button"
                onMouseEnter={triggerDodge}
                onPointerDown={(e) => {
                  if (e.pointerType !== 'mouse') {
                    e.preventDefault();
                    triggerDodge();
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  triggerDodge();
                }}
                className="inline-flex min-h-[44px] min-w-[90px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-rose-900/20 bg-white/85 px-6 py-2.5 text-sm font-medium text-rose-950/80 shadow-sm transition-colors duration-150 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              >
                {CONFIG.letterStep.noButtonText}
              </button>
            )}
          </motion.div>
        </motion.section>
      )}

      {/* Escaped Floating "No" Button + Teasing Tooltip (strictly within safe viewport bounds) */}
      {stage === 'unfolded' && noPos && (
        <motion.div
          initial={false}
          animate={{ x: noPos.x, y: noPos.y }}
          transition={{ type: 'spring', stiffness: 380, damping: 24, mass: 0.7 }}
          className="fixed top-0 left-0 z-40"
        >
          {/* Cute Teasing Tooltip floating above the dodging button (horizontally clamped inside viewport) */}
          {activeTooltip && (
            <div
              className="pointer-events-none absolute -top-11 left-1/2"
              style={{ transform: `translateX(calc(-50% + ${tooltipShiftX}px))` }}
            >
              <motion.div
                key={`${dodgeCount}-${activeTooltip}`}
                initial={{ opacity: 0.6, y: 5, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                role="status"
                aria-live="polite"
                className="whitespace-nowrap rounded-xl border border-amber-200/45 bg-[#2d0f1b]/95 px-3 py-1.5 text-xs font-medium text-amber-50 shadow-xl backdrop-blur-md"
              >
                {activeTooltip}
              </motion.div>
            </div>
          )}

          <button
            ref={noButtonRef}
            type="button"
            onMouseEnter={triggerDodge}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') {
                e.preventDefault();
                triggerDodge();
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              triggerDodge();
            }}
            className="inline-flex min-h-[44px] min-w-[90px] cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-rose-200/60 bg-[#fffaf2]/95 px-6 py-2.5 text-sm font-medium text-rose-950 shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-colors duration-150 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          >
            {CONFIG.letterStep.noButtonText}
          </button>
        </motion.div>
      )}
    </div>
  );
}
