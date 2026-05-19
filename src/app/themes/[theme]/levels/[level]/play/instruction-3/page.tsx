import type { Metadata } from "next";
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

const letters = ["A", "B", "R", "I", "P", "N", "G", "F", "Z", "Q", "E", "D", "D", "D", "D", "D"] as const;

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 3 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function LetterTile({ value }: { value: string }) {
  return (
    <div className="relative flex h-[52px] w-[108px] shrink-0 items-center justify-center rounded-[16px] bg-white px-4 pb-4 pt-3 shadow-[inset_0_-5px_0_0_#d5d5d5] max-[560px]:w-[82px]">
      <span className="font-sans text-[24px] font-medium leading-normal text-black">{value}</span>
    </div>
  );
}

function BlueCheckButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="absolute left-1/2 top-1/2 z-30 flex h-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#02324b] bg-[#0af] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-white shadow-[inset_0_-8px_0_0_#0064bf]"
    >
      {label}
    </button>
  );
}

function InstructionThreeModal({ previousHref, loadingHref, labels, commonLabels }: { previousHref: string; loadingHref: string; labels: { clickCheck: string; checkButtonDemo: string; play: string }; commonLabels: { previous: string } }) {
  return (
    <InstructionModalShell titleId="instruction-three-title">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] bg-[#f1f1f1]">
        <div className="absolute left-1/2 top-1/2 z-10 grid w-[708px] -translate-x-1/2 -translate-y-1/2 grid-cols-6 content-start justify-center gap-3 max-[700px]:w-[calc(100%+180px)] max-[560px]:grid-cols-4">
          {letters.map((letter, index) => (
            <LetterTile key={`${letter}-${index}`} value={letter} />
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-0 z-20 bg-white/20 backdrop-blur-[4px]" />
        <BlueCheckButton label={labels.checkButtonDemo} />
        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
          <span className="size-2.5 rounded-full bg-[#ff8400]" />
        </div>
      </div>

      <InstructionBody titleId="instruction-three-title" prompt={labels.clickCheck}>
        <PinkButtonLink href={previousHref}>{commonLabels.previous}</PinkButtonLink>
        <YellowButtonLink href={loadingHref}>{labels.play}</YellowButtonLink>
      </InstructionBody>
    </InstructionModalShell>
  );
}

export default async function InstructionThreePage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme, themeData } = getValidatedPlayContext(themeParam, level);
  const dictionary = getDictionary(await getRequestLocale());

  return (
    <InstructionScreen theme={theme} themeData={themeData} backLabel={dictionary.common.back}>
      <InstructionThreeModal
        previousHref={`/themes/${theme}/levels/${level}/play/instruction-2`}
        loadingHref={`/themes/${theme}/levels/${level}/play/loading`}
        labels={dictionary.instruction}
        commonLabels={dictionary.common}
      />
    </InstructionScreen>
  );
}
