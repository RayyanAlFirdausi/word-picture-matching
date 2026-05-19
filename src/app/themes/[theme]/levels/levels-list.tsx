"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { defaultLocale, getDictionary, type Locale } from "../../../i18n";
import {
  readPersistedProgressSnapshot,
  subscribeToProgressChanges,
} from "./[level]/play/_components/progress-storage";

const levels = [1, 2, 3] as const;

export type ThemeSlug = "hewan" | "rumah" | "transportasi";

type LevelLabels = {
  play: string;
  lockedLevel: string;
  stars: (earned: number) => string;
  level: (level: number | string) => string;
};

type LevelsListProps = {
  theme: ThemeSlug;
  unlockedLevel: number;
  fallbackStarsByLevel: readonly number[];
  locale?: Locale;
};

function getLevelLabels(locale: Locale): LevelLabels {
  const dictionary = getDictionary(locale);

  return {
    play: dictionary.common.play,
    lockedLevel: dictionary.levels.lockedLevel,
    stars: dictionary.levels.stars,
    level: dictionary.levels.level,
  };
}

function LevelBadge({ number, unlocked }: { number: number; unlocked: boolean }) {
  return (
    <div className="relative size-[76px] shrink-0 overflow-hidden">
      <Image
        src={unlocked ? "/figma/level-badge-active-new.svg" : "/figma/level-badge-locked-new.svg"}
        alt=""
        fill
        className="object-fill"
        priority={number === 1}
      />
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[48%] text-[20px] leading-[1.3] ${
          unlocked ? "text-white" : "text-[#8a8a8a]"
        }`}
      >
        {number}
      </span>
    </div>
  );
}

function Stars({ earned, labels }: { earned: number; labels: LevelLabels }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={labels.stars(earned)}>
      {levels.map((level) => (
        <Image
          key={level}
          src={level <= earned ? "/figma/level-star-active-new.svg" : "/figma/level-star-inactive-new.svg"}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
        />
      ))}
    </div>
  );
}

function PlayButton({ theme, level, labels }: { theme: ThemeSlug; level: number; labels: LevelLabels }) {
  return (
    <Link
      href={`/themes/${theme}/levels/${level}/play`}
      className="relative flex h-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      {labels.play}
    </Link>
  );
}

function LockedButton({ labels }: { labels: LevelLabels }) {
  return (
    <button
      type="button"
      disabled
      aria-label={labels.lockedLevel}
      className="relative flex h-[58px] w-[99px] shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#8a8a8a] bg-[#d8d8d8] px-[26px] pb-5 pt-4 shadow-[inset_0_-8px_0_0_#b8b8b8]"
    >
      <Image src="/figma/level-lock-new.svg" alt="" width={24} height={24} className="size-6" />
    </button>
  );
}

export function LevelCard({
  theme,
  number,
  unlocked,
  stars,
  interactive = true,
  labels,
}: {
  theme: ThemeSlug;
  number: number;
  unlocked: boolean;
  stars: number;
  interactive?: boolean;
  labels: LevelLabels;
}) {
  return (
    <article className="flex w-full items-center gap-4 rounded-[24px] bg-white p-4">
      <LevelBadge number={number} unlocked={unlocked} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <h2 className="w-full text-left text-[20px] uppercase leading-normal text-black">{labels.level(number)}</h2>
        <Stars earned={stars} labels={labels} />
      </div>
      {unlocked ? (
        interactive ? (
          <PlayButton theme={theme} level={number} labels={labels} />
        ) : (
          <div className="relative flex h-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]">
            {labels.play}
          </div>
        )
      ) : (
        <LockedButton labels={labels} />
      )}
    </article>
  );
}

function stringifyProgressSnapshot(starsByLevel: readonly number[], unlockedLevel: number) {
  return JSON.stringify({ starsByLevel, unlockedLevel });
}

function parseProgressSnapshot(snapshot: string) {
  return JSON.parse(snapshot) as { starsByLevel: number[]; unlockedLevel: number };
}

export function LevelsList({ theme, unlockedLevel, fallbackStarsByLevel, locale = defaultLocale }: LevelsListProps) {
  const labels = getLevelLabels(locale);
  const progressSnapshot = useSyncExternalStore(
    subscribeToProgressChanges,
    () => {
      const progress = readPersistedProgressSnapshot(theme);

      return stringifyProgressSnapshot(progress.starsByLevel, progress.unlockedLevel);
    },
    () => stringifyProgressSnapshot(fallbackStarsByLevel, unlockedLevel),
  );
  const progress = parseProgressSnapshot(progressSnapshot);

  return (
    <>
      {levels.map((level) => (
        <LevelCard
          key={level}
          theme={theme}
          number={level}
          unlocked={level <= progress.unlockedLevel}
          stars={progress.starsByLevel[level - 1] ?? 0}
          labels={labels}
        />
      ))}
    </>
  );
}
