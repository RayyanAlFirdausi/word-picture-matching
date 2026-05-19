import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LevelsList } from "../../../levels-list";

export const themes = {
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

export type ThemeSlug = keyof typeof themes;

export const levels = [1, 2, 3] as const;

export function generatePlayableStaticParams() {
  return Object.keys(themes).flatMap((theme) => levels.map((level) => ({ theme, level: String(level) })));
}

function isThemeSlug(value: string): value is ThemeSlug {
  return value in themes;
}

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "6px 0 #30469f, -6px 0 #30469f, 0 6px #30469f, 0 -6px #30469f, 5px 5px #30469f, -5px 5px #30469f, 5px -5px #30469f, -5px -5px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

export function getValidatedPlayContext(theme: string, level: string) {
  const numericLevel = Number(level);

  if (!isThemeSlug(theme) || !levels.includes(numericLevel as (typeof levels)[number])) {
    notFound();
  }

  const themeData = themes[theme];

  return { theme: theme as ThemeSlug, level, numericLevel, themeData };
}

export function InstructionScreen({
  theme,
  themeData,
  children,
  backLabel = "BACK",
  collectionLabel = "Koleksi",
}: {
  theme: ThemeSlug;
  themeData: (typeof themes)[ThemeSlug];
  children: ReactNode;
  backLabel?: string;
  collectionLabel?: string;
}) {
  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#678cff] font-gasoek">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: backgroundPattern }} />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 z-10 flex h-18 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#4f001b] bg-[#ff679a] px-8 pb-6.5 pt-5 text-center text-[20px] leading-[1.3] text-[#4f001b] shadow-[inset_0_-8px_0_0_#ae276d]">
          {backLabel}
        </div>

        <div className="absolute right-10 top-10 z-10 flex h-18 items-center justify-center gap-2 overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-8 pb-6.5 pt-5 text-center text-[20px] leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]">
          <Image src="/figma/archive-book.svg" alt="" width={32} height={32} className="size-8" />
          <span>{collectionLabel}</span>
        </div>

        <h1
          className="absolute left-1/2 top-10 z-10 -translate-x-1/2 whitespace-nowrap text-center text-[clamp(3rem,5.86vw,3.75rem)] leading-[0.9] text-white"
          style={{ textShadow: titleShadow }}
        >
          {themeData.title}
        </h1>

        <section className="absolute left-1/2 top-[296px] z-10 flex w-[min(720px,calc(100%-32px))] -translate-x-1/2 flex-col gap-3">
          <LevelsList
            theme={theme}
            unlockedLevel={themeData.unlockedLevel}
            fallbackStarsByLevel={themeData.starsByLevel}
          />
        </section>
      </div>

      <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[6px]" />
      {children}
    </main>
  );
}

export function InstructionModalShell({
  titleId,
  children,
}: {
  titleId: string;
  children: ReactNode;
}) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute left-1/2 top-20 z-30 flex h-[520px] w-[min(600px,calc(100%-32px))] -translate-x-1/2 flex-col gap-0.5 overflow-hidden rounded-[24px] bg-white p-0.5 max-[700px]:top-24 max-[700px]:h-[min(520px,calc(100dvh-112px))]"
    >
      {children}
    </section>
  );
}

export function InstructionBody({
  titleId,
  prompt,
  children,
}: {
  titleId: string;
  prompt: string;
  children: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-12 bg-white p-6 max-[700px]:gap-8">
      <p id={titleId} className="w-full text-center font-sans text-[20px] font-semibold leading-normal text-black">
        {prompt}
      </p>
      <div className="flex w-full items-end gap-2">{children}</div>
    </div>
  );
}

export function PinkButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="relative flex h-[58px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#4f001b] px-8 pb-5 pt-4 text-center transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-[64px] bg-[#ff679a]" />
      <span className="relative text-[16px] leading-[1.3] text-[#4f001b]">{children}</span>
      <span aria-hidden="true" className="absolute inset-0 rounded-[inherit] shadow-[inset_0_-8px_0_0_#ae276d]" />
    </Link>
  );
}

export function YellowButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="relative flex h-[58px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      {children}
    </Link>
  );
}

export function YellowButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="relative flex h-[58px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216]"
    >
      {children}
    </button>
  );
}
