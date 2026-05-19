"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CountdownStep = 3 | 2 | 1 | "GO";

export function LoadingCountdown({ nextHref }: { nextHref: string }) {
  const router = useRouter();
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);
  const [count, setCount] = useState<CountdownStep>(3);

  useEffect(() => {
    const audio = timerAudioRef.current;

    async function playTimerSound() {
      if (!audio) {
        return;
      }

      audio.volume = 0.7;

      try {
        await audio.play();
      } catch {
      }
    }

    void playTimerSound();
    window.addEventListener("pointerdown", playTimerSound, { once: true });
    window.addEventListener("keydown", playTimerSound, { once: true });

    const timeouts = [
      window.setTimeout(() => setCount(2), 1000),
      window.setTimeout(() => setCount(1), 2000),
      window.setTimeout(() => setCount("GO"), 3000),
      window.setTimeout(() => router.replace(nextHref), 3800),
    ];

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener("pointerdown", playTimerSound);
      window.removeEventListener("keydown", playTimerSound);
      audio?.pause();
    };
  }, [nextHref, router]);

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label={count === "GO" ? "Game dimulai" : `Game dimulai dalam ${count}`}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black/30 backdrop-blur-[6px]"
    >
      <audio ref={timerAudioRef} src="/audio/Timer.mp3" preload="auto" aria-hidden="true" />
      <div className="relative size-[240px] overflow-hidden rounded-full bg-white/20 backdrop-blur-[20px]">
        <div aria-hidden="true" className="loading-countdown-fill absolute inset-0" />
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] text-center leading-none text-[#5F80F4] ${count === "GO" ? "text-[82px]" : "text-[120px]"}`}>
          {count}
        </span>
      </div>
    </section>
  );
}
