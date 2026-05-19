"use client";

import { useSyncExternalStore } from "react";
import {
  readBackgroundMusicMuted,
  subscribeToBackgroundMusicState,
  toggleBackgroundMusicMuted,
} from "./background-music-controller";

function getServerMusicMutedSnapshot() {
  return false;
}

function MusicOnIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
      <path d="M3.5 9.4h4.1L14 4v16l-6.4-5.4H3.5z" fill="white" stroke="white" strokeLinejoin="round" strokeWidth="2" />
      <path d="M17.4 8.8c.9.9 1.4 2 1.4 3.2s-.5 2.3-1.4 3.2" stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d="M20 6.6c1.4 1.4 2.2 3.2 2.2 5.4s-.8 4-2.2 5.4" stroke="white" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
      <path d="M4 9.5h4.2L14.5 4v16l-6.3-5.5H4z" fill="white" stroke="white" strokeLinejoin="round" strokeWidth="2" />
      <path d="M18 9l4 6" stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d="M22 9l-4 6" stroke="white" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function MusicToggleControl() {
  const isMuted = useSyncExternalStore(
    subscribeToBackgroundMusicState,
    readBackgroundMusicMuted,
    getServerMusicMutedSnapshot,
  );

  return (
    <button
      type="button"
      aria-label={isMuted ? "Nyalakan musik" : "Matikan musik"}
      aria-pressed={!isMuted}
      onClick={toggleBackgroundMusicMuted}
      className="relative flex h-[58px] items-center justify-center overflow-hidden rounded-[64px] border-2 border-[#1d0032] bg-[#9500ff] px-8 pb-5 pt-4 text-white shadow-[inset_0_-8px_0_0_#6000a3] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white max-[700px]:h-13 max-[700px]:px-5 max-[700px]:pb-4 max-[700px]:pt-3"
    >
      {isMuted ? <MusicOffIcon /> : <MusicOnIcon />}
    </button>
  );
}
