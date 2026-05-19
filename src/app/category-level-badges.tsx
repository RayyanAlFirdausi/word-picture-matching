"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  readPersistedUnlockedLevel,
  subscribeToProgressChanges,
  type ThemeSlug,
} from "./themes/[theme]/levels/[level]/play/_components/progress-storage";

const levels = [1, 2, 3] as const;

type CategoryLevelBadgesProps = {
  theme: ThemeSlug;
  fallbackUnlockedLevel: number;
};

function createAriaLabel(unlockedLevel: number) {
  const openLevels = levels.filter((level) => level <= unlockedLevel);
  const lockedLevels = levels.filter((level) => level > unlockedLevel);
  const openText = `Level ${openLevels.join(", ")} terbuka`;

  if (lockedLevels.length === 0) {
    return openText;
  }

  return `${openText}, level ${lockedLevels.join(", ")} terkunci`;
}

export function CategoryLevelBadges({ theme, fallbackUnlockedLevel }: CategoryLevelBadgesProps) {
  const unlockedLevelSnapshot = useSyncExternalStore(
    subscribeToProgressChanges,
    () => String(readPersistedUnlockedLevel(theme)),
    () => String(fallbackUnlockedLevel),
  );
  const unlockedLevel = Number(unlockedLevelSnapshot) || fallbackUnlockedLevel;

  return (
    <div className="flex items-center" aria-label={createAriaLabel(unlockedLevel)}>
      {levels.map((level) => {
        const isActive = level <= unlockedLevel;

        return (
          <div key={level} className="relative size-[52px] shrink-0 overflow-hidden">
            <Image
              src={isActive ? "/figma/category-badge-active.svg" : "/figma/category-badge-locked.svg"}
              alt=""
              fill
              className="object-fill"
            />
            <span
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[48%] text-center text-[16px] leading-[1.3] ${
                isActive ? "text-white" : "text-[#8a8a8a]"
              }`}
            >
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
