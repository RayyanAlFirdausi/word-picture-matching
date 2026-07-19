const progressStorageKey = "wpm:level-progress";
const progressChangedEvent = "wpm:progress-changed";
const themes = ["hewan", "rumah", "transportasi"] as const;
const levels = [1, 2, 3] as const;

export type ThemeSlug = (typeof themes)[number];
type StarsByLevel = Record<string, number>;
type UnlockedLevelByTheme = Record<ThemeSlug, number>;
type AnsweredCollectionItemsByTheme = Record<ThemeSlug, string[]>;

type PersistedProgress = {
  version: 3;
  starsByTheme: Record<ThemeSlug, StarsByLevel>;
  unlockedLevelByTheme: UnlockedLevelByTheme;
  answeredCollectionItemsByTheme: AnsweredCollectionItemsByTheme;
};

type PersistedProgressV2 = {
  version: 2;
  starsByTheme: Record<ThemeSlug, StarsByLevel>;
  unlockedLevelByTheme: UnlockedLevelByTheme;
};

type PersistedProgressV1 = {
  version: 1;
  starsByTheme: Record<ThemeSlug, StarsByLevel>;
};

export type ProgressSnapshot = {
  starsByLevel: number[];
  unlockedLevel: number;
};

function createDefaultStarsByTheme(): Record<ThemeSlug, StarsByLevel> {
  return {
    hewan: { "1": 0, "2": 0, "3": 0 },
    rumah: { "1": 0, "2": 0, "3": 0 },
    transportasi: { "1": 0, "2": 0, "3": 0 },
  };
}

function createDefaultUnlockedLevelByTheme(): UnlockedLevelByTheme {
  return {
    hewan: 1,
    rumah: 1,
    transportasi: 1,
  };
}

function createDefaultAnsweredCollectionItemsByTheme(): AnsweredCollectionItemsByTheme {
  return {
    hewan: [],
    rumah: [],
    transportasi: [],
  };
}

function createDefaultProgress(): PersistedProgress {
  return {
    version: 3,
    starsByTheme: createDefaultStarsByTheme(),
    unlockedLevelByTheme: createDefaultUnlockedLevelByTheme(),
    answeredCollectionItemsByTheme: createDefaultAnsweredCollectionItemsByTheme(),
  };
}

export function readPersistedStars(theme: string, level: string | number) {
  return readPersistedProgress().starsByTheme[normalizeTheme(theme)]?.[String(level)] ?? 0;
}

export function readPersistedStarsByTheme(theme: string) {
  const themeStars = readPersistedProgress().starsByTheme[normalizeTheme(theme)];

  return levels.map((level) => themeStars?.[String(level)] ?? 0);
}

export function readPersistedUnlockedLevel(theme: string) {
  return readPersistedProgress().unlockedLevelByTheme[normalizeTheme(theme)] ?? 1;
}

export function readPersistedProgressSnapshot(theme: string): ProgressSnapshot {
  return {
    starsByLevel: readPersistedStarsByTheme(theme),
    unlockedLevel: readPersistedUnlockedLevel(theme),
  };
}

export function readAnsweredCollectionItems(theme: string) {
  return readPersistedProgress().answeredCollectionItemsByTheme[normalizeTheme(theme)] ?? [];
}

export function isCollectionItemAnswered(theme: string, itemId: string) {
  return readAnsweredCollectionItems(theme).includes(itemId);
}

export function resetPersistedProgress() {
  writePersistedProgress(createDefaultProgress());
}

export function persistAnsweredCollectionItem(theme: string, itemId: string) {
  const progress = readPersistedProgress();
  const themeSlug = normalizeTheme(theme);
  const answeredItems = progress.answeredCollectionItemsByTheme[themeSlug] ?? [];

  if (answeredItems.includes(itemId)) {
    return;
  }

  writePersistedProgress({
    ...progress,
    answeredCollectionItemsByTheme: {
      ...progress.answeredCollectionItemsByTheme,
      [themeSlug]: [...answeredItems, itemId],
    },
  });
}

export function persistBestStars(theme: string, level: string | number, earnedStars: number) {
  const progress = readPersistedProgress();
  const themeSlug = normalizeTheme(theme);
  const levelKey = String(level);
  const currentStars = progress.starsByTheme[themeSlug]?.[levelKey] ?? 0;
  const nextStars = Math.max(currentStars, clampStars(earnedStars));

  writePersistedProgress({
    ...progress,
    starsByTheme: {
      ...progress.starsByTheme,
      [themeSlug]: {
        ...progress.starsByTheme[themeSlug],
        [levelKey]: nextStars,
      },
    },
  });
}

export function persistLevelCompletion(theme: string, level: string | number, earnedStars: number, correctCount: number) {
  const progress = readPersistedProgress();
  const themeSlug = normalizeTheme(theme);
  const numericLevel = normalizeLevel(level);
  const levelKey = String(numericLevel);
  const currentStars = progress.starsByTheme[themeSlug]?.[levelKey] ?? 0;
  const nextStars = Math.max(currentStars, clampStars(earnedStars));
  const currentUnlockedLevel = progress.unlockedLevelByTheme[themeSlug] ?? 1;
  const nextUnlockedLevel = correctCount >= 3
    ? Math.max(currentUnlockedLevel, Math.min(3, numericLevel + 1))
    : currentUnlockedLevel;

  writePersistedProgress({
    ...progress,
    starsByTheme: {
      ...progress.starsByTheme,
      [themeSlug]: {
        ...progress.starsByTheme[themeSlug],
        [levelKey]: nextStars,
      },
    },
    unlockedLevelByTheme: {
      ...progress.unlockedLevelByTheme,
      [themeSlug]: nextUnlockedLevel,
    },
  });
}

export function subscribeToProgressChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === progressStorageKey) {
      onStoreChange();
    }
  }

  function handleProgressChanged() {
    onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(progressChangedEvent, handleProgressChanged);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(progressChangedEvent, handleProgressChanged);
  };
}

function readPersistedProgress(): PersistedProgress {
  try {
    if (typeof window === "undefined") {
      return createDefaultProgress();
    }

    const value = window.localStorage.getItem(progressStorageKey);

    if (!value) {
      return createDefaultProgress();
    }

    const parsed = JSON.parse(value) as Partial<PersistedProgress | PersistedProgressV2 | PersistedProgressV1>;

    if (isPersistedProgress(parsed)) {
      return normalizeProgress(parsed);
    }

    if (isPersistedProgressV2(parsed)) {
      return migrateProgressV2(parsed);
    }

    if (isPersistedProgressV1(parsed)) {
      return migrateProgressV1(parsed);
    }

    return createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

function writePersistedProgress(progress: PersistedProgress) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    window.dispatchEvent(new Event(progressChangedEvent));
  } catch {
  }
}

function migrateProgressV1(progress: PersistedProgressV1): PersistedProgress {
  const normalizedStars = normalizeStarsByTheme(progress.starsByTheme);

  return {
    version: 3,
    starsByTheme: normalizedStars,
    unlockedLevelByTheme: {
      hewan: inferUnlockedLevel(normalizedStars.hewan),
      rumah: inferUnlockedLevel(normalizedStars.rumah),
      transportasi: inferUnlockedLevel(normalizedStars.transportasi),
    },
    answeredCollectionItemsByTheme: createDefaultAnsweredCollectionItemsByTheme(),
  };
}

function migrateProgressV2(progress: PersistedProgressV2): PersistedProgress {
  return {
    version: 3,
    starsByTheme: normalizeStarsByTheme(progress.starsByTheme),
    unlockedLevelByTheme: normalizeUnlockedLevelByTheme(progress.unlockedLevelByTheme),
    answeredCollectionItemsByTheme: createDefaultAnsweredCollectionItemsByTheme(),
  };
}

function normalizeProgress(progress: PersistedProgress): PersistedProgress {
  return {
    version: 3,
    starsByTheme: normalizeStarsByTheme(progress.starsByTheme),
    unlockedLevelByTheme: normalizeUnlockedLevelByTheme(progress.unlockedLevelByTheme),
    answeredCollectionItemsByTheme: normalizeAnsweredCollectionItemsByTheme(progress.answeredCollectionItemsByTheme),
  };
}

function normalizeStarsByTheme(starsByTheme: Record<ThemeSlug, StarsByLevel>) {
  return {
    hewan: normalizeStarsByLevel(starsByTheme.hewan),
    rumah: normalizeStarsByLevel(starsByTheme.rumah),
    transportasi: normalizeStarsByLevel(starsByTheme.transportasi),
  };
}

function normalizeUnlockedLevelByTheme(unlockedLevelByTheme: UnlockedLevelByTheme) {
  return {
    hewan: clampUnlockedLevel(unlockedLevelByTheme.hewan),
    rumah: clampUnlockedLevel(unlockedLevelByTheme.rumah),
    transportasi: clampUnlockedLevel(unlockedLevelByTheme.transportasi),
  };
}

function normalizeAnsweredCollectionItemsByTheme(answeredItemsByTheme: AnsweredCollectionItemsByTheme) {
  return {
    hewan: normalizeAnsweredItems(answeredItemsByTheme.hewan),
    rumah: normalizeAnsweredItems(answeredItemsByTheme.rumah),
    transportasi: normalizeAnsweredItems(answeredItemsByTheme.transportasi),
  };
}

function normalizeStarsByLevel(starsByLevel: StarsByLevel) {
  return Object.fromEntries(levels.map((level) => [String(level), clampStars(starsByLevel[String(level)] ?? 0)]));
}

function normalizeAnsweredItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return Array.from(new Set(items.filter((item): item is string => typeof item === "string")));
}

function inferUnlockedLevel(starsByLevel: StarsByLevel) {
  if ((starsByLevel["2"] ?? 0) > 0) {
    return 3;
  }

  if ((starsByLevel["1"] ?? 0) > 0) {
    return 2;
  }

  return 1;
}

function normalizeTheme(theme: string): ThemeSlug {
  return themes.includes(theme as ThemeSlug) ? (theme as ThemeSlug) : "rumah";
}

function normalizeLevel(level: string | number) {
  const parsedLevel = Number(level);

  if (!Number.isFinite(parsedLevel)) {
    return 1;
  }

  return Math.min(3, Math.max(1, Math.floor(parsedLevel)));
}

function clampStars(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(3, Math.max(0, Math.floor(value)));
}

function clampUnlockedLevel(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(3, Math.max(1, Math.floor(value)));
}

function isPersistedProgress(
  value: Partial<PersistedProgress | PersistedProgressV2 | PersistedProgressV1>,
): value is PersistedProgress {
  return (
    value.version === 3 &&
    isStarsByTheme(value.starsByTheme) &&
    isUnlockedLevelByTheme(value.unlockedLevelByTheme) &&
    isAnsweredCollectionItemsByTheme(value.answeredCollectionItemsByTheme)
  );
}

function isPersistedProgressV2(
  value: Partial<PersistedProgress | PersistedProgressV2 | PersistedProgressV1>,
): value is PersistedProgressV2 {
  return value.version === 2 && isStarsByTheme(value.starsByTheme) && isUnlockedLevelByTheme(value.unlockedLevelByTheme);
}

function isPersistedProgressV1(
  value: Partial<PersistedProgress | PersistedProgressV2 | PersistedProgressV1>,
): value is PersistedProgressV1 {
  return value.version === 1 && isStarsByTheme(value.starsByTheme);
}

function isStarsByTheme(value: unknown): value is Record<ThemeSlug, StarsByLevel> {
  return (
    typeof value === "object" &&
    value !== null &&
    themes.every((theme) => {
      const themeStars = (value as Partial<Record<ThemeSlug, unknown>>)[theme];

      return (
        typeof themeStars === "object" &&
        themeStars !== null &&
        levels.every((level) => typeof (themeStars as StarsByLevel)[String(level)] === "number")
      );
    })
  );
}

function isUnlockedLevelByTheme(value: unknown): value is UnlockedLevelByTheme {
  return (
    typeof value === "object" &&
    value !== null &&
    themes.every((theme) => typeof (value as Partial<Record<ThemeSlug, unknown>>)[theme] === "number")
  );
}

function isAnsweredCollectionItemsByTheme(value: unknown): value is AnsweredCollectionItemsByTheme {
  return (
    typeof value === "object" &&
    value !== null &&
    themes.every((theme) => Array.isArray((value as Partial<Record<ThemeSlug, unknown>>)[theme]))
  );
}
