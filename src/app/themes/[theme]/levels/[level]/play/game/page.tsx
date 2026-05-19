import type { Metadata } from "next";
import { getRequestLocale } from "../../../../../../request-locale";
import { createGameStateStorageKey } from "../_components/game-state-storage";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "../_components/instruction-screen";
import { GameLevel } from "./game-level";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Game Level | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

export default async function GameLevelPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme } = getValidatedPlayContext(themeParam, level);
  const locale = await getRequestLocale();

  return (
    <GameLevel
      congratulationsHref={`/themes/${theme}/levels/${level}/play/congratulations`}
      gameOverHref={`/themes/${theme}/levels/${level}/play/nyawa_habis`}
      theme={theme}
      level={level}
      storageKey={createGameStateStorageKey(theme, level)}
      locale={locale}
    />
  );
}
