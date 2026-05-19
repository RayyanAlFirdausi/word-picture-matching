import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { CategoryLevelBadges } from "./category-level-badges";
import { getDictionary, localeCookieName, normalizeLocale } from "./i18n";
import { LanguageToggle } from "./language-toggle";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "6px 0 #30469f, -6px 0 #30469f, 0 6px #30469f, 0 -6px #30469f, 5px 5px #30469f, -5px 5px #30469f, 5px -5px #30469f, -5px -5px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

const categories = [
  {
    slug: "hewan",
    title: "ANIMAL",
    ariaLabel: "Pilih kategori Animal",
    titleColor: "text-[#ff679a]",
    image: "/figma/category-hewan.png",
    imagePosition: "center bottom",
    buttonBorder: "border-[#4f001b]",
    buttonBackground: "bg-[#ff679a]",
    buttonShadow: "shadow-[inset_0_-8px_0_0_#ae276d]",
  },
  {
    slug: "rumah",
    title: "HOUSE",
    ariaLabel: "Pilih kategori House",
    titleColor: "text-[#00466a]",
    image: "/figma/category-rumah.png",
    imagePosition: "center center",
    buttonBorder: "border-[#02324b]",
    buttonBackground: "bg-[#00aaff]",
    buttonShadow: "shadow-[inset_0_-8px_0_0_#0064bf]",
  },
  {
    slug: "transportasi",
    title: "TRANSPORTATION",
    ariaLabel: "Pilih kategori Transportation",
    titleColor: "text-[#47cc8a]",
    image: "/figma/category-transportasi.png",
    imagePosition: "center bottom",
    buttonBorder: "border-[#006b36]",
    buttonBackground: "bg-[#47cc8a]",
    buttonShadow: "shadow-[inset_0_-8px_0_0_#1d7e6d]",
  },
] as const;

function CategoryCard({
  category,
  selectLabel,
  categoryAriaLabel,
}: {
  category: (typeof categories)[number];
  selectLabel: string;
  categoryAriaLabel: string;
}) {
  return (
    <Link
      href={`/themes/${category.slug}/levels`}
      className="relative flex h-[456px] min-w-[343px] flex-1 shrink-0 flex-col gap-[2px] rounded-[24px] bg-white p-[2px] shadow-[0_14px_17px_rgba(0,0,0,0.12)] transition-transform hover:z-20 hover:-translate-y-1 focus-visible:z-20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
      aria-label={categoryAriaLabel}
    >
      <div className="flex h-10 w-full shrink-0 items-center justify-center px-5 py-2">
        <h2
          className={`min-w-0 flex-1 truncate text-left text-[20px] leading-normal uppercase ${category.titleColor}`}
        >
          {category.title}
        </h2>
      </div>

      <div className="relative flex min-h-0 w-full flex-1 flex-col justify-end overflow-hidden rounded-[22px] bg-white p-4">
        <Image
          src={category.image}
          alt=""
          fill
          sizes="343px"
          className="object-cover"
          style={{ objectPosition: category.imagePosition }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[257px] bg-gradient-to-b from-black/0 to-black/80" />
        <div className="relative z-10 flex flex-col gap-5">
          <CategoryLevelBadges
            theme={category.slug}
            fallbackUnlockedLevel={1}
          />
          <div
            className={`relative flex w-full items-center justify-center overflow-hidden rounded-[64px] border-2 px-8 pb-[26px] pt-5 ${category.buttonBorder} ${category.buttonBackground} ${category.buttonShadow}`}
          >
            <span className="min-w-0 flex-1 text-center text-[20px] leading-[1.3] text-white">
              {selectLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function House() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  const dictionary = getDictionary(locale);

  return (
    <main className="relative min-h-[max(744px,100dvh)] overflow-hidden bg-[#678cff] font-gasoek">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: backgroundPattern }}
      />

      <h1
        className="absolute left-1/2 top-10 z-10 w-108.25 -translate-x-1/2 text-center text-[60px] leading-[0.9] text-white max-[520px]:w-[calc(100%-32px)] max-[520px]:text-[44px]"
        style={{ textShadow: titleShadow }}
      >
        Word Picture Matching
      </h1>

      <section
        aria-label={dictionary.home.gamesLabel}
        className="absolute left-1/2 top-[248px] z-10 flex min-h-[496px] w-[1053px] -translate-x-1/2 items-start gap-3 overflow-y-visible pb-10 max-[1120px]:left-0 max-[1120px]:w-full max-[1120px]:translate-x-0 max-[1120px]:overflow-x-auto max-[1120px]:px-9 max-[700px]:top-55 max-[700px]:px-4"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            selectLabel={dictionary.common.select}
            categoryAriaLabel={dictionary.home.categoryAria(category.title)}
          />
        ))}
      </section>

      <LanguageToggle
        locale={locale}
        labels={{
          language: dictionary.home.language,
          english: dictionary.home.english,
          indonesian: dictionary.home.indonesian,
        }}
      />
    </main>
  );
}
