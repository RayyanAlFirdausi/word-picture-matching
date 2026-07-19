"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  defaultLocale,
  getDictionary,
  type Locale,
} from "../../../../../../i18n";
import { clearPersistedGameState } from "../_components/game-state-storage";
import { persistLevelCompletion } from "../_components/progress-storage";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "4px 0 #30469f, -4px 0 #30469f, 0 4px #30469f, 0 -4px #30469f, 3px 3px #30469f, -3px 3px #30469f, 3px -3px #30469f, -3px -3px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

type ConfettiPiece = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  shape: "rect" | "circle";
  delay: number;
};

const confettiColors = [
  "#ff2f6d",
  "#ffd400",
  "#35d07f",
  "#20a8ff",
  "#8b5cf6",
  "#ff7a1a",
  "#ffffff",
];

function createConfettiPieces(width: number, height: number) {
  return Array.from({ length: 260 }, (_, index): ConfettiPiece => {
    const column = index % 26;
    const row = Math.floor(index / 26);
    const x = width * ((column + 0.5) / 26) + ((row % 2) - 0.5) * 18;
    const y = -height * 0.35 - row * 34 - (index % 5) * 9;
    const driftDirection = index % 2 === 0 ? -1 : 1;

    return {
      x,
      y,
      velocityX: driftDirection * (0.35 + (index % 7) * 0.12),
      velocityY: 2.4 + (index % 9) * 0.18,
      gravity: 0.012 + (index % 4) * 0.004,
      rotation: (index * 47) % 360,
      rotationSpeed: (driftDirection * (3 + (index % 10))) / 100,
      width: 5 + (index % 4) * 2,
      height: 9 + (index % 5) * 2,
      color: confettiColors[index % confettiColors.length],
      shape: index % 9 === 0 ? "circle" : "rect",
      delay: row * 90 + (column % 4) * 28,
    };
  });
}

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const confettiCanvas = canvas;
    const confettiContext = context;
    let animationFrame = 0;
    let startedAt = performance.now();
    let pieces: ConfettiPiece[] = [];

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      confettiCanvas.width = window.innerWidth * dpr;
      confettiCanvas.height = window.innerHeight * dpr;
      confettiCanvas.style.width = `${window.innerWidth}px`;
      confettiCanvas.style.height = `${window.innerHeight}px`;
      confettiContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      pieces = createConfettiPieces(window.innerWidth, window.innerHeight);
      startedAt = performance.now();
    }

    function drawPiece(piece: ConfettiPiece, elapsed: number) {
      const activeElapsed = elapsed - piece.delay;

      if (activeElapsed < 0) {
        return;
      }

      const time = activeElapsed / 16.67;
      const sway = Math.sin(time / 18 + piece.rotation) * 16;
      const x = piece.x + piece.velocityX * time + sway;
      const y = piece.y + piece.velocityY * time + piece.gravity * time * time;

      if (
        y > window.innerHeight + 80 ||
        x < -120 ||
        x > window.innerWidth + 120
      ) {
        return;
      }

      confettiContext.save();
      confettiContext.globalAlpha = y < -20 ? 0.7 : 0.95;
      confettiContext.translate(x, y);
      confettiContext.rotate(piece.rotation + piece.rotationSpeed * time);
      confettiContext.fillStyle = piece.color;

      if (piece.shape === "circle") {
        confettiContext.beginPath();
        confettiContext.arc(0, 0, piece.width * 0.55, 0, Math.PI * 2);
        confettiContext.fill();
      } else {
        confettiContext.fillRect(
          -piece.width / 2,
          -piece.height / 2,
          piece.width,
          piece.height,
        );
      }

      confettiContext.restore();
    }

    function draw(now: number) {
      const elapsed = now - startedAt;
      confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach((piece) => drawPiece(piece, elapsed));

      if (elapsed > 7600) {
        startedAt = now;
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    resizeCanvas();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
      aria-hidden="true"
    />
  );
}

function getStars(correctCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return 0;
  }

  const ratio = correctCount / totalCount;

  if (ratio === 1) {
    return 3;
  }

  if (ratio >= 2 / 3) {
    return 2;
  }

  if (correctCount >= 1) {
    return 1;
  }

  return 0;
}

type CongratulationsLabels = {
  perfectTitle: string;
  perfectDescription: string;
  greatTitle: string;
  greatDescription: string;
  retryTitle: string;
  retryDescription: string;
  failTitle: string;
  failDescription: string;
  stars: (earned: number) => string;
  score: (correct: number, total: number) => string;
};

type CongratulationsCommonLabels = {
  repeat: string;
  next: string;
  previous: string;
  backToLevels: string;
  exit: string;
};

function getResultContent(
  correctCount: number,
  totalCount: number,
  labels: CongratulationsLabels,
) {
  const stars = getStars(correctCount, totalCount);

  if (stars === 3) {
    return {
      stars,
      title: labels.perfectTitle,
      description: labels.perfectDescription,
    };
  }

  if (stars === 2) {
    return {
      stars,
      title: labels.greatTitle,
      description: labels.greatDescription,
    };
  }

  if (stars === 1) {
    return {
      stars,
      title: labels.retryTitle,
      description: labels.retryDescription,
    };
  }

  return {
    stars,
    title: labels.failTitle,
    description: labels.failDescription,
  };
}

function StarRow({
  earned,
  labels,
}: {
  earned: number;
  labels: CongratulationsLabels;
}) {
  return (
    <div
      className="flex h-[124px] w-full items-center justify-center gap-0.5"
      aria-label={labels.stars(earned)}
    >
      {[0, 1, 2].map((star) => (
        <div
          key={star}
          className="relative size-[124px] shrink-0 overflow-visible"
        >
          <div className="absolute inset-[-19.02%_-31.61%_-40.7%_-31.61%]">
            <Image
              src={
                star < earned
                  ? "/figma/congratulations-star-active.svg"
                  : "/figma/congratulations-star-inactive.svg"
              }
              alt=""
              fill
              sizes="202px"
              className="object-contain"
              priority={star === 0}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultButton({
  children,
  onClick,
  variant,
  wide = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "pink" | "yellow" | "blue";
  wide?: boolean;
}) {
  const variantClass = {
    pink: "border-[#4f001b] bg-[#ff679a] text-[#4f001b] shadow-[inset_0_-8px_0_0_#ae276d]",
    yellow:
      "border-[#9e5400] bg-[#ffe514] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]",
    blue: "border-[#02324b] bg-[#0af] text-white shadow-[inset_0_-8px_0_0_#0064bf]",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[58px] items-center justify-center overflow-hidden rounded-[64px] border-2 px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white ${
        wide ? "w-full" : "min-w-0 flex-1"
      } ${variantClass}`}
    >
      {children}
    </button>
  );
}

export function CongratulationsResult({
  correctCount,
  totalCount,
  theme,
  level,
  levelHref,
  primaryHref,
  primaryLabel,
  repeatHref,
  storageKey,
  locale = defaultLocale,
}: {
  correctCount: number;
  totalCount: number;
  theme: string;
  level: string;
  levelHref: string;
  primaryHref: string;
  primaryLabel: "Next" | "Previous" | "Repeat";
  repeatHref: string;
  storageKey: string;
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);
  const labels: CongratulationsLabels = dictionary.congratulations;
  const commonLabels: CongratulationsCommonLabels = dictionary.common;
  const router = useRouter();
  const content = getResultContent(correctCount, totalCount, labels);

  useEffect(() => {
    persistLevelCompletion(theme, level, content.stars, correctCount);
  }, [content.stars, correctCount, level, theme]);

  function repeatLevel() {
    clearPersistedGameState(storageKey);
    router.replace(repeatHref);
  }

  function goPrimary() {
    clearPersistedGameState(storageKey);
    router.replace(primaryHref);
  }

  function goToLevels() {
    clearPersistedGameState(storageKey);
    router.replace(levelHref);
  }

  return (
    <main className="relative min-h-[max(744px,100dvh)] overflow-x-clip bg-[#678cff] font-gasoek">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: backgroundPattern }}
      />
      <ConfettiCanvas />

      <section className="absolute left-1/2 top-[100px] z-10 flex w-[min(552px,calc(100%-32px))] -translate-x-1/2 flex-col items-center gap-20 text-center">
        <div className="flex w-full flex-col items-center gap-10">
          <StarRow earned={content.stars} labels={labels} />

          <div className="flex w-full flex-col items-center gap-6">
            <h1
              className="whitespace-nowrap text-center text-[40px] leading-[0.9] text-white max-[620px]:text-[32px]"
              style={{
                textShadow: titleShadow,
              }}
            >
              {content.title}
            </h1>
            <p className="w-[min(424px,100%)] text-center font-geist text-[24px] font-medium leading-normal text-white">
              {content.description}
            </p>
            <div className="rounded-[64px] bg-white/20 px-5 py-3 font-geist text-[20px] font-medium leading-normal text-white backdrop-blur-[2px]">
              {labels.score(correctCount, totalCount)}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex h-[58px] w-full items-start gap-3">
            {primaryLabel === "Repeat" ? (
              <ResultButton onClick={goPrimary} variant="yellow" wide>
                {commonLabels.repeat}
              </ResultButton>
            ) : (
              <>
                <ResultButton onClick={repeatLevel} variant="pink">
                  {commonLabels.repeat}
                </ResultButton>
                <ResultButton onClick={goPrimary} variant="yellow">
                  {primaryLabel === "Next" ? commonLabels.next : commonLabels.previous}
                </ResultButton>
              </>
            )}
          </div>
          <ResultButton onClick={goToLevels} variant="blue" wide>
            {commonLabels.exit}
          </ResultButton>
        </div>
      </section>
    </main>
  );
}
