import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "../i18n";
import { getRequestLocale } from "../request-locale";
import { getCollectionAssets } from "../word-assets";
import { CollectionGrid } from "./collection-grid";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "6px 0 #30469f, -6px 0 #30469f, 0 6px #30469f, 0 -6px #30469f, 5px 5px #30469f, -5px 5px #30469f, 5px -5px #30469f, -5px -5px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

const collectionThemes = {
  hewan: {
    backHref: "/themes/hewan/levels",
  },
  rumah: {
    backHref: "/themes/rumah/levels",
  },
  transportasi: {
    backHref: "/themes/transportasi/levels",
  },
} as const;

type CollectionTheme = keyof typeof collectionThemes;
type LevelPageHref = (typeof collectionThemes)[CollectionTheme]["backHref"];

export const metadata: Metadata = {
  title: "My Collection of Words | Word Picture Matching",
};

function getCollectionTheme(value: string | string[] | undefined): CollectionTheme {
  const href = Array.isArray(value) ? value[0] : value;
  const match = Object.entries(collectionThemes).find(([, theme]) => theme.backHref === href);

  return match ? (match[0] as CollectionTheme) : "rumah";
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { from } = await searchParams;
  const collectionTheme = getCollectionTheme(from);
  const backHref: LevelPageHref = collectionThemes[collectionTheme].backHref;
  const collectionItems = getCollectionAssets(collectionTheme);
  const dictionary = getDictionary(await getRequestLocale());

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#678cff] pb-10 font-gasoek">
      <div aria-hidden="true" className="fixed inset-0" style={{ backgroundImage: backgroundPattern }} />

      <Link
        href={backHref}
        className="absolute left-10 top-10 z-30 flex h-18 items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#4f001b] bg-[#ff679a] px-8 pb-6.5 pt-5 text-center text-[20px] leading-[1.3] text-[#4f001b] shadow-[inset_0_-8px_0_0_#ae276d] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white max-[700px]:left-5 max-[700px]:top-5 max-[700px]:px-6 max-[700px]:pb-5 max-[700px]:pt-4 max-[700px]:text-[16px]"
      >
        {dictionary.common.back}
      </Link>

      <section className="relative z-10 flex flex-col items-center px-9 pt-10 max-[700px]:px-4 max-[700px]:pt-28">
        <h1
          className="w-[min(458px,100%)] text-center text-[60px] leading-[0.9] text-white max-[700px]:text-[44px]"
          style={{ textShadow: titleShadow }}
        >
          {dictionary.collection.title}
        </h1>

        <CollectionGrid theme={collectionTheme} items={collectionItems} labels={dictionary.collection} />
      </section>
    </main>
  );
}
