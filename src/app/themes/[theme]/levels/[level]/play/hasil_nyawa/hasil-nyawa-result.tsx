"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { defaultLocale, getDictionary, type Locale } from "../../../../../../i18n";
import {
  createGameStateStorageKey,
  restoreLivesInPersistedGameState,
} from "../_components/game-state-storage";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "4px 0 #30469f, -4px 0 #30469f, 0 4px #30469f, 0 -4px #30469f, 3px 3px #30469f, -3px 3px #30469f, 3px -3px #30469f, -3px -3px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

type HasilNyawaLabels = {
  resultTitle: (correct: number, total: number) => string;
  livesRestored: (lives: number) => string;
  continuePlaying: string;
};

export function HasilNyawaResult({
  theme,
  level,
  restoredLives,
  locale = defaultLocale,
}: {
  theme: string;
  level: string;
  restoredLives: number;
  locale?: Locale;
}) {
  const labels: HasilNyawaLabels = getDictionary(locale).recovery;
  const router = useRouter();

  function continuePlaying() {
    restoreLivesInPersistedGameState(createGameStateStorageKey(theme, level), restoredLives);
    router.replace(`/themes/${theme}/levels/${level}/play/game`);
  }

  return (
    <main className="relative min-h-[max(744px,100dvh)] overflow-hidden bg-[#678cff] font-geist">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: backgroundPattern }} />

      <section className="absolute left-1/2 top-[100px] z-10 flex w-[min(552px,calc(100%-32px))] -translate-x-1/2 flex-col items-center gap-20 text-center">
        <div className="flex w-full flex-col items-center gap-6">
          <h1
            className="whitespace-nowrap text-center text-[40px] leading-[0.9] text-white max-[620px]:text-[34px]"
            style={{
              fontFamily: "var(--font-gasoek-one), Arial, Helvetica, sans-serif",
              textShadow: titleShadow,
            }}
          >
            {labels.resultTitle(restoredLives, 3)}
          </h1>

          <div className="flex items-center justify-center gap-0.5" aria-label={labels.livesRestored(restoredLives)}>
            {[0, 1, 2].map((heart) => {
              const filled = heart < restoredLives;

              return (
                <div key={heart} className="relative size-[124px] shrink-0 overflow-visible">
                  {filled ? (
                    <Image
                      src="/figma/life-filled-large.svg"
                      alt=""
                      width={124}
                      height={124}
                      className="size-[124px] object-contain"
                      priority={heart === 0}
                    />
                  ) : (
                    <div className="absolute inset-[-16.53%_-30.95%_-39.11%_-30.95%]">
                      <Image
                        src="/figma/life-empty-large.svg"
                        alt=""
                        fill
                        sizes="201px"
                        className="object-contain"
                        priority={heart === 0}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="w-[min(272px,100%)] text-center text-[24px] font-medium leading-normal text-white">
            {labels.livesRestored(restoredLives)}
          </p>
        </div>

        <button
          type="button"
          onClick={continuePlaying}
          className="relative flex h-[58px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{
            fontFamily: "var(--font-gasoek-one), Arial, Helvetica, sans-serif",
          }}
        >
          {labels.continuePlaying}
        </button>
      </section>
    </main>
  );
}
