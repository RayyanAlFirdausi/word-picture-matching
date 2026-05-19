import type { Metadata } from "next";
import { getRequestLocale } from "../../../../../../request-locale";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "../_components/instruction-screen";
import { SoalNyawaQuiz } from "./soal-nyawa-quiz";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Soal Nyawa | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

export default async function SoalNyawaPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme } = getValidatedPlayContext(themeParam, level);
  const locale = await getRequestLocale();

  return <SoalNyawaQuiz theme={theme} level={level} locale={locale} />;
}
