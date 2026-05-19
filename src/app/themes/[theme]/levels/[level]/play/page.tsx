import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "./_components/instruction-screen";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Play | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

export default async function PlayPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme, level } = await params;
  getValidatedPlayContext(theme, level);

  redirect(`/themes/${theme}/levels/${level}/play/instruction-1`);
}
