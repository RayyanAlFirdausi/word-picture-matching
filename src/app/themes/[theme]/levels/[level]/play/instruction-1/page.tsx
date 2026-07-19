import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "../../../../../../i18n";
import { getRequestLocale } from "../../../../../../request-locale";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
  InstructionBody,
  InstructionModalShell,
  InstructionPaginationDots,
  InstructionScreen,
  InstructionVisualPanel,
  PinkButtonLink,
  YellowButtonLink,
} from "../_components/instruction-screen";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 1 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function StepItem({ number, label }: { number: number; label: string }) {
  return (
    <div className="relative z-10 flex w-[148px] flex-col items-center gap-3 text-center">
      <div className="flex size-7 items-center justify-center rounded-full bg-white p-1 font-geist text-[14px] font-semibold leading-normal text-black">
        {number}
      </div>
      <p className="font-geist text-[14px] font-medium leading-normal text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
        {label}
      </p>
    </div>
  );
}

function InstructionOneModal({
  closeHref,
  nextHref,
  labels,
  commonLabels,
}: {
  closeHref: string;
  nextHref: string;
  labels: { guessImage: string; close: string; imageStepLabels: readonly string[] };
  commonLabels: { next: string };
}) {
  return (
    <InstructionModalShell titleId="instruction-title">
      <InstructionVisualPanel>
        <div className="absolute left-1/2 top-8 h-[160px] w-[220px] -translate-x-1/2 overflow-hidden rounded-[12px] border-2 border-white bg-white shadow-[0_4px_34px_rgba(0,0,0,0.35),0_4px_4px_rgba(0,0,0,0.02)]">
          <Image
            src="/figma/game-question-tiger.png"
            alt=""
            fill
            sizes="220px"
            className="object-cover object-bottom"
            priority
          />
        </div>

        <div className="absolute left-1/2 top-56 flex w-[min(476px,calc(100%-48px))] -translate-x-1/2 items-start justify-between">
          <span aria-hidden="true" className="absolute left-[74px] right-[74px] top-3.5 border-t-2 border-dashed border-white/70" />
          {labels.imageStepLabels.map((label, index) => (
            <StepItem key={label} number={index + 1} label={label} />
          ))}
        </div>

        <InstructionPaginationDots activeIndex={0} />
      </InstructionVisualPanel>

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
