import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "../../../../../../i18n";
import { getRequestLocale } from "../../../../../../request-locale";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
  InstructionBody,
  InstructionModalShell,
  InstructionScreen,
  PinkButtonLink,
  YellowButtonLink,
} from "../_components/instruction-screen";

const instructionImages = [
  "/figma/play-instruction-image-1.png",
  "/figma/play-instruction-image-2.png",
  "/figma/play-instruction-image-3.png",
] as const;

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 1 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function PhotoCard({ src, className, priority }: { src: string; className: string; priority?: boolean }) {
  return (
    <div
      className={`absolute h-[160px] w-[220px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] border-2 border-white bg-white shadow-[0_4px_34px_rgba(0,0,0,0.35),0_4px_4px_rgba(0,0,0,0.02)] ${className}`}
    >
      <Image src={src} alt="" fill sizes="220px" className="object-cover" priority={priority} />
    </div>
  );
}

function InstructionOneModal({ closeHref, nextHref, labels, commonLabels }: { closeHref: string; nextHref: string; labels: { guessImage: string; close: string }; commonLabels: { next: string } }) {
  return (
    <InstructionModalShell titleId="instruction-title">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] bg-[#f1f1f1]">
        <PhotoCard
          src={instructionImages[0]}
          priority
          className="left-[calc(50%+96px)] top-[calc(50%-64px)] z-10 rotate-2 max-[700px]:left-[calc(50%+32px)] max-[700px]:top-[calc(50%-54px)]"
        />
        <PhotoCard
          src={instructionImages[1]}
          className="left-[calc(50%-104px)] top-[calc(50%-32px)] z-20 max-[700px]:left-[calc(50%-85px)] max-[700px]:top-[calc(50%-18px)]"
        />
        <PhotoCard
          src={instructionImages[2]}
          className="left-[calc(50%+6px)] top-[calc(50%+37px)] z-30 rotate-2 max-[700px]:left-[calc(50%-24px)] max-[700px]:top-[calc(50%+28px)]"
        />
        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff8400]" />
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
        </div>
      </div>

      <InstructionBody titleId="instruction-title" prompt={labels.guessImage}>
        <PinkButtonLink href={closeHref}>{labels.close}</PinkButtonLink>
        <YellowButtonLink href={nextHref}>{commonLabels.next}</YellowButtonLink>
      </InstructionBody>
    </InstructionModalShell>
  );
}

export default async function InstructionOnePage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme, themeData } = getValidatedPlayContext(themeParam, level);
  const dictionary = getDictionary(await getRequestLocale());

  return (
    <InstructionScreen
      theme={theme}
      themeData={themeData}
      backLabel={dictionary.common.back}
      collectionLabel={dictionary.levels.collectionLabel}
    >
      <InstructionOneModal
        closeHref={`/themes/${theme}/levels`}
        nextHref={`/themes/${theme}/levels/${level}/play/instruction-2`}
        labels={dictionary.instruction}
        commonLabels={dictionary.common}
      />
    </InstructionScreen>
  );
}
