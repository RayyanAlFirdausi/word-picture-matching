"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "./locale-actions";
import type { Locale } from "./i18n";

export function LanguageToggle({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    language: string;
    english: string;
    indonesian: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale || isPending) {
      return;
    }

    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={labels.language}
      className="fixed bottom-5 right-5 z-40 flex h-[58px] items-end gap-[2px] overflow-hidden rounded-[64px] bg-white p-[2px] font-gasoek shadow-[0_8px_16px_rgba(0,0,0,0.18)] max-[700px]:bottom-3 max-[700px]:right-3 max-[700px]:h-13"
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        disabled={isPending}
        onClick={() => changeLocale("en")}
        className={`relative flex h-full items-center justify-center overflow-hidden rounded-[64px] px-8 pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9e5400] max-[700px]:px-5 max-[700px]:pb-4 max-[700px]:pt-3 max-[700px]:text-[13px] ${
          locale === "en"
            ? "border-2 border-[#9e5400] bg-[#ffe514] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]"
            : "text-[#8a8a8a] hover:bg-[#f1f1f1]"
        }`}
      >
        {labels.english}
      </button>
      <button
        type="button"
        aria-pressed={locale === "id"}
        disabled={isPending}
        onClick={() => changeLocale("id")}
        className={`relative flex h-full items-center justify-center overflow-hidden rounded-[64px] px-8 pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9e5400] max-[700px]:px-5 max-[700px]:pb-4 max-[700px]:pt-3 max-[700px]:text-[13px] ${
          locale === "id"
            ? "border-2 border-[#9e5400] bg-[#ffe514] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]"
            : "text-[#8a8a8a] hover:bg-[#f1f1f1]"
        }`}
      >
        {labels.indonesian}
      </button>
    </div>
  );
}
