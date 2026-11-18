import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AmbientCanvas } from './components/AmbientCanvas';
import { MusicToggle } from './components/MusicToggle';
import { BloomingFlower, type FlowerPhase } from './components/BloomingFlower';
import { LoveLetter } from './components/LoveLetter';
import { CelebrationCard } from './components/CelebrationCard';
import { audioController } from './utils/audioController';

type ExperienceStep = 'flower' | 'letter' | 'celebration';

export default function App() {
  const [step, setStep] = useState<ExperienceStep>('flower');
  const [flowerPhase, setFlowerPhase] = useState<FlowerPhase>('bud');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [celebrateTrigger, setCelebrateTrigger] = useState(0);

  const musicButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleTapFlower = () => {
    if (flowerPhase !== 'bud') return;

    setFlowerPhase('blooming');
    // Start Track 1 (./nhac1.mp3) with smooth volume fade-in on first tap
    void audioController.startTrack1().then((playing) => {
      setIsMusicPlaying(playing);
    });

    // After layered petals unfurl, reveal the glowing wax-sealed envelope
    window.setTimeout(() => {
      setFlowerPhase('envelope_ready');
    }, 950);
  };

  const handleTapEnvelope = () => {
    setStep('letter');
  };

  const handleAcceptYes = () => {
    // Switch/crossfade smoothly to Track 2 (./nhac2.mp3)
    void audioController.switchToTrack2().then((playing) => {
      setIsMusicPlaying(playing);
    });

    setCelebrateTrigger((prev) => prev + 1);
    setStep('celebration');
  };

  const handleToggleMusic = () => {
    void audioController.toggle().then((playing) => {
      setIsMusicPlaying(playing);
    });
  };

  return (
    <div
      data-step={step}
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Dreamy Twilight Backdrop, Floating Fireflies, Falling Petals & Confetti */}
      <AmbientCanvas celebrateTrigger={celebrateTrigger} />

      {/* Top-Right Floating Aesthetic Music Toggle */}
      <MusicToggle
        isPlaying={isMusicPlaying}
        onToggle={handleToggleMusic}
        buttonRef={musicButtonRef}
      />

      {/* Centered 3-Step Interactive Confession Stage */}
      <main className="relative z-10 flex w-full flex-1 items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {step === 'flower' && (
            <motion.div
              key="step-flower"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full items-center justify-center"
            >
              <BloomingFlower
                phase={flowerPhase}
                onTapFlower={handleTapFlower}
                onTapEnvelope={handleTapEnvelope}
              />
            </motion.div>
          )}

          {step === 'letter' && (
            <motion.div
              key="step-letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45 }}
              className="flex w-full items-center justify-center"
            >
              <LoveLetter
                onAcceptYes={handleAcceptYes}
                musicButtonRef={musicButtonRef}
              />
            </motion.div>
          )}

          {step === 'celebration' && (
            <motion.div
              key="step-celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55 }}
              className="flex w-full items-center justify-center"
            >
              <CelebrationCard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
