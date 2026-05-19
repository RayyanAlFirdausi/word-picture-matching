import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "../../../../../../i18n";
import { getRequestLocale } from "../../../../../../request-locale";
import {
  generatePlayableStaticParams,
  getValidatedPlayContext,
} from "../_components/instruction-screen";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Nyawa Habis | Word Picture Matching",
};

export function generateStaticParams() {
  return generatePlayableStaticParams();
}

export default async function NyawaHabisPage({ params }: { params: Promise<{ theme: string; level: string }> }) {
  const { theme, level } = await params;
  getValidatedPlayContext(theme, level);
  const dictionary = getDictionary(await getRequestLocale());

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#678cff] font-gasoek">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: backgroundPattern }} />

      <section className="absolute left-1/2 top-[100px] z-10 flex w-[min(552px,calc(100%-32px))] -translate-x-1/2 flex-col items-center gap-20 text-center">
        <div className="flex w-full flex-col items-center gap-10">
          <div className="flex items-center justify-center gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((heart) => (
              <div key={heart} className="relative size-[124px] shrink-0 overflow-visible">
                <Image
                  src="/figma/life-empty-large.svg"
                  alt=""
                  fill
                  sizes="124px"
                  className="scale-[1.62] object-contain"
                  priority={heart === 0}
                />
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <h1
              className="whitespace-nowrap text-center text-[40px] leading-[0.9] text-white"
              style={{
                textShadow:
                  "4px 0 #30469f, -4px 0 #30469f, 0 4px #30469f, 0 -4px #30469f, 3px 3px #30469f, -3px 3px #30469f, 3px -3px #30469f, -3px -3px #30469f, 0 14px 34px rgba(0,0,0,0.25)",
              }}
            >
              {dictionary.recovery.emptyLivesTitle}
            </h1>
            <p className="w-[min(344px,100%)] font-geist text-[24px] font-medium leading-normal text-white">
              {dictionary.recovery.intro}
            </p>
            <div className="rounded-[64px] bg-white/20 px-5 py-3 font-geist text-[20px] font-medium leading-normal text-white backdrop-blur-[2px]">
              {dictionary.recovery.miniQuiz}
            </div>
          </div>

          <div className="flex w-full items-start gap-2 max-[620px]:flex-col">
            {[1, 2, 3].map((question) => (
              <div key={question} className="flex min-w-0 flex-1 items-center rounded-[16px] bg-white p-3 max-[620px]:w-full">
                <p className="min-w-0 flex-1 text-center font-geist text-[20px] font-medium leading-normal text-black">
                  {dictionary.recovery.questionLife(question)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={`/themes/${theme}/levels/${level}/play/soal_nyawa`}
          className="relative flex h-[58px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#9e5400] bg-[#ffe514] px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {dictionary.recovery.startQuiz}
        </Link>
      </section>
    </main>
  );
}
