"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import type { WordAsset, WordTheme } from "../word-assets";
import {
  readAnsweredCollectionItems,
  subscribeToProgressChanges,
} from "../themes/[theme]/levels/[level]/play/_components/progress-storage";

export function CollectionGrid({
  theme,
  items,
  labels = { gridAria: "Koleksi kata", lockedAlt: "Locked collection item" },
}: {
  theme: WordTheme;
  items: WordAsset[];
  labels?: { gridAria: string; lockedAlt: string };
}) {
  const answeredSnapshot = useSyncExternalStore(
    subscribeToProgressChanges,
    () => JSON.stringify(readAnsweredCollectionItems(theme)),
    () => "[]",
  );
  const answeredItems = useMemo(() => new Set(JSON.parse(answeredSnapshot) as string[]), [answeredSnapshot]);

  return (
    <section
      aria-label={labels.gridAria}
      className="mt-25 flex w-full max-w-263.25 flex-wrap justify-center gap-3 max-[700px]:mt-10"
    >
      {items.map((item, index) => (
        <CollectionCard key={item.id} item={item} answered={answeredItems.has(item.id)} priority={index === 0} lockedAlt={labels.lockedAlt} />
      ))}
    </section>
  );
}

function CollectionCard({
  item,
  answered,
  priority,
  lockedAlt,
}: {
  item: WordAsset;
  answered: boolean;
  priority: boolean;
  lockedAlt: string;
}) {
  return (
    <article className="flex h-81.5 w-85.75 shrink-0 flex-col items-start justify-center rounded-3xl bg-white p-0.5 shadow-[0_14px_17px_rgba(0,0,0,0.12)]">
      <div className="relative flex min-h-0 w-full flex-1 flex-col justify-end overflow-hidden rounded-[22px] bg-white p-4">
        <Image
          src={item.image}
          alt={answered ? item.name : lockedAlt}
          fill
          sizes="343px"
          preload={priority}
          className={`object-cover transition duration-300 ${answered ? "" : "grayscale"}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-64.25 bg-linear-to-b from-black/0 to-black/80" />
        <p className="relative z-10 w-full text-left text-[20px] uppercase leading-normal text-white">
          {answered ? item.name : "???"}
        </p>
      </div>
    </article>
  );
}
