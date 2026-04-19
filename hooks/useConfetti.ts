import confetti from "canvas-confetti";

export function useConfetti() {
  const fire = (options?: confetti.Options) => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ffffff"],
      ...options,
    });
  };

  const rankUp = () => {
    fire({ particleCount: 200, spread: 100 });
    setTimeout(
      () => fire({ particleCount: 100, spread: 60, origin: { y: 0.8 } }),
      300
    );
  };

  return { fire, rankUp };
}
