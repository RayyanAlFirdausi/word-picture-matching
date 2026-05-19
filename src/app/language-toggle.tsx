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
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-[64px] border-2 border-[#02324b] bg-white/90 p-1 font-geist shadow-[0_8px_16px_rgba(0,0,0,0.22)] backdrop-blur-[4px] max-[700px]:bottom-3 max-[700px]:right-3"
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        disabled={isPending}
        onClick={() => changeLocale("en")}
        className={`rounded-[64px] px-3 py-2 text-[13px] font-bold leading-none transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0af] ${
          locale === "en" ? "bg-[#0af] text-white" : "text-[#02324b] hover:bg-[#dff4ff]"
        }`}
      >
        {labels.english}
      </button>
      <button
        type="button"
        aria-pressed={locale === "id"}
        disabled={isPending}
        onClick={() => changeLocale("id")}
        className={`rounded-[64px] px-3 py-2 text-[13px] font-bold leading-none transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0af] ${
          locale === "id" ? "bg-[#0af] text-white" : "text-[#02324b] hover:bg-[#dff4ff]"
        }`}
      >
        {labels.indonesian}
      </button>
    </div>
  );
}
