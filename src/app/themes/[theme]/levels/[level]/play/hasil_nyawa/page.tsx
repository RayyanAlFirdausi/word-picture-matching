import type { Metadata } from "next";
import { getRequestLocale } from "../../../../../../request-locale";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "../_components/instruction-screen";
import { HasilNyawaResult } from "./hasil-nyawa-result";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Hasil Nyawa | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function parseRestoredLives(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.min(3, Math.max(0, Math.floor(parsedValue)));
}

export default async function HasilNyawaPage({
  params,
  searchParams,
}: {
  params: Promise<{ theme: string; level: string }>;
  searchParams: Promise<{ correct?: string | string[] }>;
}) {
  const { theme, level } = await params;
  const { correct } = await searchParams;
  getValidatedPlayContext(theme, level);
  const locale = await getRequestLocale();

  return <HasilNyawaResult theme={theme} level={level} restoredLives={parseRestoredLives(correct)} locale={locale} />;
}
