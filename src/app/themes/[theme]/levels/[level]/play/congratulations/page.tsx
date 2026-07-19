import type { Metadata } from "next";
import { getRequestLocale } from "../../../../../../request-locale";
import { QUESTIONS_PER_PLAY_SESSION } from "../../../../../../word-assets";
import { createGameStateStorageKey } from "../_components/game-state-storage";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "../_components/instruction-screen";
import { CongratulationsResult } from "./congratulations-result";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Congratulations | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function parseCorrectCount(value: string | string[] | undefined, totalCount: number) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.min(totalCount, Math.max(0, Math.floor(parsedValue)));
}

function parseTotalCount(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return QUESTIONS_PER_PLAY_SESSION;
  }

  return Math.min(QUESTIONS_PER_PLAY_SESSION, Math.max(1, Math.floor(parsedValue)));
}

export default async function CongratulationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ theme: string; level: string }>;
  searchParams: Promise<{ correct?: string | string[]; total?: string | string[] }>;
}) {
  const { theme: themeParam, level } = await params;
  const { correct, total } = await searchParams;
  const { theme } = getValidatedPlayContext(themeParam, level);

  const numericLevel = Number(level);
  const totalCount = parseTotalCount(total);
  const correctCount = parseCorrectCount(correct, totalCount);
  const canUnlockNextLevel = correctCount >= 3;
  const targetLevel = numericLevel >= 3 ? 2 : Math.min(3, numericLevel + 1);
  const repeatHref = `/themes/${theme}/levels/${level}/play/game`;
  const locale = await getRequestLocale();

  return (
    <CongratulationsResult
      correctCount={correctCount}
      totalCount={totalCount}
      theme={theme}
      level={level}
      levelHref={`/themes/${theme}/levels`}
      primaryHref={numericLevel < 3 && !canUnlockNextLevel ? repeatHref : `/themes/${theme}/levels/${targetLevel}/play/game`}
      primaryLabel={numericLevel >= 3 ? "Previous" : canUnlockNextLevel ? "Next" : "Repeat"}
      repeatHref={repeatHref}
      storageKey={createGameStateStorageKey(theme, level)}
      locale={locale}
    />
  );
}
