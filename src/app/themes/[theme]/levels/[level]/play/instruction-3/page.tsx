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

const correctCards = [
  { image: "/figma/game-question-tiger.png", objectPosition: "object-bottom" },
  { image: "/figma/collection-cow.png", objectPosition: "object-center" },
] as const;

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Instruction 3 | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

function CheckIcon() {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-[#58cd04] text-[18px] leading-none text-white shadow-[inset_0_-4px_0_0_#43a000]">
      ✓
    </span>
  );
}

function CorrectAnswerCard({
  image,
  objectPosition,
  label,
}: {
  image: string;
  objectPosition: string;
  label: string;
}) {
  return (
    <div className="relative flex w-fit flex-col items-center gap-5">
      <div className="relative h-[100px] w-[140px] overflow-hidden rounded-[12px] border-2 border-white bg-white shadow-[0_20px_44px_rgba(0,0,0,0.2)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="140px"
          className={`object-cover ${objectPosition}`}
        />
      </div>
      <div className="inline-flex w-fit shrink-0 items-center gap-1 rounded-[64px] bg-white py-1 pl-1 pr-4 text-center font-geist text-[14px] font-medium leading-normal text-black">
        <CheckIcon />
        <span className="w-fit shrink-0 whitespace-nowrap">{label}</span>
      </div>
    </div>
  );
}

function HintReward() {
  return (
    <div className="relative inline-flex items-center justify-center overflow-hidden rounded-[16px] border-2 border-[#347d00] bg-[#58cd04] px-5 pb-[18px] pt-3 font-geist text-[16px] font-semibold leading-normal text-white shadow-[inset_0_-8px_0_0_#43a000]">
      +1 hint
    </div>
  );
}

function InstructionThreeModal({
  previousHref,
  loadingHref,
  labels,
  commonLabels,
}: {
  previousHref: string;
  loadingHref: string;
  labels: {
    play: string;
    hintRewardTitle: string;
    hintRewardHelper: string;
    correctAnswerBadge: (count: number) => string;
  };
  commonLabels: { previous: string };
}) {
  return (
    <InstructionModalShell titleId="instruction-three-title">
      <InstructionVisualPanel>
        <div className="absolute left-1/2 top-10 flex -translate-x-1/2 items-start justify-center gap-8 max-[560px]:gap-3">
          {correctCards.map((card, index) => (
            <CorrectAnswerCard
              key={card.image}
              image={card.image}
              objectPosition={card.objectPosition}
              label={labels.correctAnswerBadge(index + 1)}
            />
          ))}
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 108 42"
          className="absolute left-[calc(50%-108px)] top-[198.5px] h-[41.5px] w-[108px] overflow-visible"
        >
          <path d="M0 1 H74 C93 1 107 16 107 35" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 106 42"
          className="absolute left-1/2 top-[198.5px] h-[41.5px] w-[105.5px] overflow-visible"
        >
          <path d="M105 1 H32 C13 1 1 16 1 35" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="absolute left-1/2 top-60 -translate-x-1/2">
          <HintReward />
        </div>

        <p className="absolute left-1/2 top-[303px] w-[min(300px,calc(100%-48px))] -translate-x-1/2 text-center font-geist text-[14px] font-medium leading-normal text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
          {labels.hintRewardHelper}
        </p>

        <InstructionPaginationDots activeIndex={2} />
      </InstructionVisualPanel>

      <InstructionBody titleId="instruction-three-title" prompt={labels.hintRewardTitle}>
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
    <InstructionScreen
      theme={theme}
      themeData={themeData}
      backLabel={dictionary.common.back}
      collectionLabel={dictionary.levels.collectionLabel}
    >
      <InstructionThreeModal
        previousHref={`/themes/${theme}/levels/${level}/play/instruction-2`}
        loadingHref={`/themes/${theme}/levels/${level}/play/loading`}
        labels={dictionary.instruction}
        commonLabels={dictionary.common}
      />
    </InstructionScreen>
  );
}
