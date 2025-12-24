import { useCallback } from 'react';

export function useConfetti() {
  const triggerConfetti = useCallback(async (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
  }) => {
    const confetti = (await import('canvas-confetti')).default;
    
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FEBE10', '#00529F', '#FFFFFF'], // Madrid colors
      ...options
    };

    confetti(defaults);
  }, []);

  const triggerGoalCelebration = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FEBE10', '#00529F', '#FFFFFF'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  const triggerVictoryCelebration = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FEBE10', '#00529F', '#FFFFFF']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return {
    triggerConfetti,
    triggerGoalCelebration,
    triggerVictoryCelebration
  };
}
