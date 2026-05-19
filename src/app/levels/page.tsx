import { notFound, redirect } from "next/navigation";

const categoryToTheme = {
  hewan: "hewan",
  rumah: "rumah",
  transportasi: "transportasi",
} as const;

function getThemeSlug(category: string | string[] | undefined) {
  if (category === undefined) {
    return "rumah";
  }

  const value = Array.isArray(category) ? category[0] : category;
  const normalized = value.toLowerCase();

  if (!(normalized in categoryToTheme)) {
    notFound();
  }

  return categoryToTheme[normalized as keyof typeof categoryToTheme];
}

export default async function LevelsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;

  redirect(`/themes/${getThemeSlug(category)}/levels`);
}
