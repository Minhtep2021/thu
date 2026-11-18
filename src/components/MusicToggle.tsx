import type { RefObject } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { CONFIG } from '../config/confessionConfig';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

export function MusicToggle({ isPlaying, onToggle, buttonRef }: MusicToggleProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? CONFIG.audio.pauseLabel : CONFIG.audio.playLabel}
      aria-pressed={isPlaying}
      title={isPlaying ? CONFIG.audio.pauseLabel : CONFIG.audio.playLabel}
      className="fixed top-4 right-4 z-50 flex min-h-[44px] items-center gap-2.5 rounded-full border border-amber-200/25 bg-[#2a0d19]/75 px-3.5 py-2 text-amber-50/95 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-200 hover:border-amber-200/50 hover:bg-[#3a1223]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 active:scale-95 sm:top-6 sm:right-6"
    >
      {isPlaying ? (
        <Volume2 className="h-4 w-4 text-rose-200" aria-hidden="true" />
      ) : (
        <VolumeX className="h-4 w-4 text-amber-100/65" aria-hidden="true" />
      )}

      {/* Animated soundwave equalizer bars */}
      <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[2.5px] rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-amber-200' : 'bg-amber-100/35'
            }`}
            style={{
              height: isPlaying ? '14px' : '5px',
              animation: isPlaying
                ? `soundwave-bar ${0.7 + bar * 0.14}s ease-in-out ${bar * 0.12}s infinite`
                : 'none',
            }}
          />
        ))}
      </span>
    </button>
  );
}
