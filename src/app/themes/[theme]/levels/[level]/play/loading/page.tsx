import type { Metadata } from "next";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
  InstructionScreen,
} from "../_components/instruction-screen";
import { LoadingCountdown } from "../_components/loading-countdown";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Loading | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

export default async function LoadingPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme, themeData } = getValidatedPlayContext(themeParam, level);

  return (
    <InstructionScreen theme={theme} themeData={themeData}>
      <LoadingCountdown nextHref={`/themes/${theme}/levels/${level}/play/game`} />
    </InstructionScreen>
  );
}
