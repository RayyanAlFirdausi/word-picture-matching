import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "../../../i18n";
import { getRequestLocale } from "../../../request-locale";
import { LevelsList } from "./levels-list";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const themes = {
  hewan: {
    title: "Animal",
    unlockedLevel: 1,
    starsByLevel: [0, 0, 0],
  },
  rumah: {
    title: "House",
    unlockedLevel: 1,
    starsByLevel: [0, 0, 0],
  },
  transportasi: {
    title: "Transportation",
    unlockedLevel: 1,
    starsByLevel: [0, 0, 0],
  },
} as const;

type ThemeSlug = keyof typeof themes;

function isThemeSlug(value: string): value is ThemeSlug {
  return value in themes;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(themes).map((theme) => ({ theme }));
}

export default async function ThemeLevelsPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;

  if (!isThemeSlug(theme)) {
    notFound();
  }

  const themeData = themes[theme];
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#678cff] font-gasoek">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: backgroundPattern }}
      />

      <Link
        href="/"
        className="absolute left-10 top-10 z-10 flex h-18 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#4f001b] bg-[#ff679a] px-8 pb-6.5 pt-5 text-center text-[20px] leading-[1.3] text-[#4f001b] shadow-[inset_0_-8px_0_0_#ae276d] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {dictionary.common.back}
      </Link>

      <Link
        href={`/collection?from=${encodeURIComponent(`/themes/${theme}/levels`)}`}
        aria-label={dictionary.levels.collectionAria}
        className="absolute right-10 top-10 z-10 flex h-18 items-center justify-center gap-2 overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-8 pb-6.5 pt-5 text-center text-[20px] leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <Image src="/figma/archive-book.svg" alt="" width={32} height={32} className="size-8" />
        <span>{dictionary.levels.collectionLabel}</span>
      </Link>

      <h1
        className="absolute left-1/2 top-10 z-10 -translate-x-1/2 whitespace-nowrap text-center text-[clamp(3rem,5.86vw,3.75rem)] leading-[0.9] text-white"
        style={{
          textShadow:
            "6px 0 #30469f, -6px 0 #30469f, 0 6px #30469f, 0 -6px #30469f, 5px 5px #30469f, -5px 5px #30469f, 5px -5px #30469f, -5px -5px #30469f, 0 14px 34px rgba(0,0,0,0.25)",
        }}
      >
        {themeData.title}
      </h1>

      <section
        aria-label={dictionary.levels.listAria(themeData.title)}
        className="absolute left-1/2 top-[296px] z-10 flex w-[min(720px,calc(100%-32px))] -translate-x-1/2 flex-col gap-3"
      >
        <LevelsList
          theme={theme}
          unlockedLevel={themeData.unlockedLevel}
          fallbackStarsByLevel={themeData.starsByLevel}
          locale={locale}
        />
      </section>
    </main>
  );
}
