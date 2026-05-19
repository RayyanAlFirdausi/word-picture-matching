"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { clearAllPersistedGameStates } from "./themes/[theme]/levels/[level]/play/_components/game-state-storage";
import { resetPersistedProgress } from "./themes/[theme]/levels/[level]/play/_components/progress-storage";

type ResetGameControlProps = {
  labels: {
    resetGame: string;
    confirmPrompt: string;
    cancel: string;
    confirm: string;
  };
};

function ExitIllustration() {
  return (
    <div className="relative h-[246px] w-[296px]" aria-hidden="true">
      <div className="absolute left-[50px] top-[38px] h-[168px] w-[96px] rounded-[10px] border-[8px] border-black bg-[#ffb321] shadow-[inset_10px_0_0_rgba(255,255,255,0.35),inset_-8px_0_0_rgba(0,0,0,0.12)]" />
      <div className="absolute left-[136px] top-[60px] h-[126px] w-[72px] rounded-[8px] border-[8px] border-black bg-[#48d6c7]" />
      <div className="absolute left-[154px] top-[82px] h-[82px] w-[46px] border-[8px] border-black bg-[#f1f1f1]" />
      <div className="absolute left-[108px] top-[112px] size-[24px] rounded-[4px] border-[6px] border-black bg-[#00c5ad]" />
      <div className="absolute left-[188px] top-[84px] h-[82px] w-[84px] rounded-r-[18px] bg-[#ffb321]" />
      <div className="absolute left-[188px] top-[98px] h-[54px] w-[78px] border-y-[8px] border-r-[8px] border-black bg-[#ffb321]" />
      <div className="absolute left-[246px] top-[76px] h-[98px] w-[72px] bg-[#ffb321] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <div className="absolute left-[236px] top-[68px] h-[114px] w-[88px] border-[8px] border-black bg-[#ffb321] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <div className="absolute left-[250px] top-[91px] h-[68px] w-[54px] bg-[#ffb321] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <div className="absolute left-[70px] top-[58px] h-[120px] w-[12px] bg-white/50" />
    </div>
  );
}

export function ResetGameControl({ labels }: ResetGameControlProps) {
  const router = useRouter();
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);

  function resetGame() {
    resetPersistedProgress();
    clearAllPersistedGameStates();
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-[58px] items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-8 pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white max-[700px]:bottom-3 max-[700px]:left-3 max-[700px]:h-13 max-[700px]:px-5 max-[700px]:pb-4 max-[700px]:pt-3 max-[700px]:text-[13px]"
      >
        {labels.resetGame}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[6px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex h-[min(520px,calc(100dvh-32px))] w-[min(600px,calc(100%-32px))] flex-col overflow-hidden rounded-[24px] bg-white p-[2px] shadow-[0_24px_48px_rgba(0,0,0,0.24)]"
          >
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] bg-[#f1f1f1]">
              <ExitIllustration />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center gap-12 bg-white p-6">
              <p id={titleId} className="w-full text-center font-geist text-[20px] font-semibold leading-normal text-black">
                {labels.confirmPrompt}
              </p>
              <div className="flex w-full items-end gap-2 max-[560px]:flex-col">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="relative flex h-[58px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#4f001b] bg-[#ff679a] px-8 pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#4f001b] shadow-[inset_0_-8px_0_0_#ae276d] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#4f001b] max-[560px]:w-full"
                >
                  {labels.cancel}
                </button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="relative flex h-[58px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9e5400] max-[560px]:w-full"
                >
                  {labels.confirm}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
