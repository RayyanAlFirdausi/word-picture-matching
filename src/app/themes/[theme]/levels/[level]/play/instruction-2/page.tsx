import type { Metadata } from "next";
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

const answerSlots = ["L", "I", null, null] as const;
const letterRows = [
  ["A", "T", "B", "F", "K", "R"],
  ["L", "M", "U", "Y", "E"],
] as const;

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 2 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function DemoLetterTile({ value, wide = false }: { value: string; wide?: boolean }) {
  return (
    <div
      className={`flex h-[52px] items-center justify-center rounded-[16px] bg-white px-4 pb-4 pt-3 shadow-[inset_0_-5px_0_0_#d5d5d5] ${
        wide ? "w-full" : "w-[64px]"
      }`}
    >
      <span className="font-geist text-[24px] font-medium leading-normal text-black">{value}</span>
    </div>
  );
}

function InstructionTwoModal({
  previousHref,
  nextHref,
  labels,
  commonLabels,
}: {
  previousHref: string;
  nextHref: string;
  labels: { arrangeWord: string; arrangeHelper: string };
  commonLabels: { previous: string; next: string };
}) {
  return (
    <InstructionModalShell titleId="instruction-two-title">
      <InstructionVisualPanel>
        <div className="absolute left-1/2 top-[60px] flex w-[min(476px,calc(100%-48px))] -translate-x-1/2 flex-col gap-10">
          <div className="grid grid-cols-4 gap-2">
            {answerSlots.map((letter, index) => (
              <div key={index} className="flex min-w-0 flex-col items-center gap-2">
                <div className="flex h-[52px] w-full items-center justify-center">
                  {letter ? <DemoLetterTile value={letter} wide /> : null}
                </div>
                <span className="h-1 w-full rounded-[64px] bg-white" />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            {letterRows.map((row) => (
              <div key={row.join("")} className="flex flex-wrap justify-center gap-3">
                {row.map((letter) => (
                  <DemoLetterTile key={letter} value={letter} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="absolute left-1/2 top-[304px] w-[min(442px,calc(100%-48px))] -translate-x-1/2 text-center font-geist text-[14px] font-medium leading-normal text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
          {labels.arrangeHelper}
        </p>

        <InstructionPaginationDots activeIndex={1} />
      </InstructionVisualPanel>

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
    <InstructionScreen
      theme={theme}
      themeData={themeData}
      backLabel={dictionary.common.back}
      collectionLabel={dictionary.levels.collectionLabel}
    >
      <InstructionTwoModal
        previousHref={`/themes/${theme}/levels/${level}/play/instruction-1`}
        nextHref={`/themes/${theme}/levels/${level}/play/instruction-3`}
        labels={dictionary.instruction}
        commonLabels={dictionary.common}
      />
    </InstructionScreen>
  );
}
