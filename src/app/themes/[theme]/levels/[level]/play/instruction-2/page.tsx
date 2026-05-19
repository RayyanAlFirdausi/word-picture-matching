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

const letters = [
  { value: "L", className: "left-[60px] top-[134px] max-[700px]:left-[calc(50%-172px)]" },
  { value: "O", className: "left-[302px] top-[134px] max-[700px]:left-[calc(50%-52px)]" },
  { value: "N", className: "left-[423px] top-[134px] max-[700px]:left-[calc(50%+68px)]" },
] as const;

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 2 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function LetterTile({ value, className }: { value: string; className: string }) {
  return (
    <div
      className={`absolute flex h-[52px] w-[113px] items-center justify-center rounded-[16px] bg-white px-4 pb-4 pt-3 shadow-[inset_0_-5px_0_0_#d5d5d5] ${className}`}
    >
      <span className="font-sans text-[24px] font-medium leading-normal text-black">{value}</span>
    </div>
  );
}

function InstructionTwoModal({ previousHref, nextHref, labels, commonLabels }: { previousHref: string; nextHref: string; labels: { arrangeWord: string }; commonLabels: { previous: string; next: string } }) {
  return (
    <InstructionModalShell titleId="instruction-two-title">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] bg-[#f1f1f1]">
        {letters.map((letter) => (
          <LetterTile key={letter.value} value={letter.value} className={letter.className} />
        ))}
        <div className="absolute left-[60px] top-[194px] flex w-[476px] items-start justify-center gap-2 max-[700px]:left-1/2 max-[700px]:w-[min(476px,calc(100%-72px))] max-[700px]:-translate-x-1/2">
          {[1, 2, 3, 4].map((bar) => (
            <span key={bar} className="h-1 min-w-0 flex-1 rounded-[64px] bg-[#e1e1e1] backdrop-blur-[12px]" />
          ))}
        </div>
        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
          <span className="size-2.5 rounded-full bg-[#ff8400]" />
          <span className="size-2.5 rounded-full bg-[#d8d8d8]" />
        </div>
      </div>

      <InstructionBody titleId="instruction-two-title" prompt={labels.arrangeWord}>
        <PinkButtonLink href={previousHref}>{commonLabels.previous}</PinkButtonLink>
        <YellowButtonLink href={nextHref}>{commonLabels.next}</YellowButtonLink>
      </InstructionBody>
    </InstructionModalShell>
  );
}

export default async function InstructionTwoPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme: themeParam, level } = await params;
  const { theme, themeData } = getValidatedPlayContext(themeParam, level);
  const dictionary = getDictionary(await getRequestLocale());

  return (
    <InstructionScreen theme={theme} themeData={themeData} backLabel={dictionary.common.back}>
      <InstructionTwoModal
        previousHref={`/themes/${theme}/levels/${level}/play/instruction-1`}
        nextHref={`/themes/${theme}/levels/${level}/play/instruction-3`}
        labels={dictionary.instruction}
        commonLabels={dictionary.common}
      />
    </InstructionScreen>
  );
}
