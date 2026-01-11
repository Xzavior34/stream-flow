import confetti from 'canvas-confetti';

// Stream-themed confetti with neon green colors
export const triggerStreamConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Stream.fun brand colors - neon green and cyan
  const colors = ['#00FF88', '#00FFAA', '#00FFCC', '#00DDFF', '#FFFFFF'];

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors,
  });

  fire(0.2, {
    spread: 60,
    colors,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors,
  });
};

// Money rain effect for streaming
export const triggerMoneyRain = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0 },
      colors: ['#00FF88', '#00FFAA'],
      zIndex: 9999,
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0 },
      colors: ['#00FF88', '#00FFAA'],
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

// Quick burst for smaller celebrations
export const triggerBurst = (x = 0.5, y = 0.5) => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x, y },
    colors: ['#00FF88', '#00FFAA', '#00FFCC'],
    zIndex: 9999,
  });
};