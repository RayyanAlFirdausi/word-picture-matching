"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const menuMusicSrc = "/audio/Musik.mp3";
const inGameMusicSrc = "/audio/In_game.mp3";
const congratsSoundSrc = "/audio/Congrats.mp3";
const nyawaHabisSoundSrc = "/audio/Nyawahabis.mp3";
const correctSoundSrc = "/audio/Benar.mp3";
const wrongSoundSrc = "/audio/Salah.mp3";
const backgroundVolume = 0.25;
const effectVolume = 0.65;
const soundEffectEventName = "word-picture-matching:sound-effect";
const musicMutedStorageKey = "word-picture-matching:music-muted";
const musicStateEventName = "word-picture-matching:music-state";

export type GameSoundEffect = "correct" | "wrong";

type BackgroundMusicState = {
  muted: boolean;
};

export function readBackgroundMusicMuted() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(musicMutedStorageKey) === "true";
}

export function toggleBackgroundMusicMuted() {
  const nextMuted = !readBackgroundMusicMuted();
  writeBackgroundMusicMuted(nextMuted);
  dispatchBackgroundMusicState(nextMuted);
}

export function subscribeToBackgroundMusicState(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === musicMutedStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener(musicStateEventName, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(musicStateEventName, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function writeBackgroundMusicMuted(muted: boolean) {
  try {
    window.localStorage.setItem(musicMutedStorageKey, String(muted));
  } catch {
  }
}

function dispatchBackgroundMusicState(muted: boolean) {
  window.dispatchEvent(new CustomEvent<BackgroundMusicState>(musicStateEventName, { detail: { muted } }));
}

type RouteAudioConfig = {
  backgroundSrc: string;
  introSrc?: string;
  introKey?: string;
};

export function playGameSoundEffect(effect: GameSoundEffect) {
  window.dispatchEvent(new CustomEvent<GameSoundEffect>(soundEffectEventName, { detail: effect }));
}

function getRouteAudioConfig(pathname: string): RouteAudioConfig {
  if (pathname.includes("/play/congratulations")) {
    return {
      backgroundSrc: menuMusicSrc,
      introSrc: congratsSoundSrc,
      introKey: "congratulations",
    };
  }

  if (pathname.includes("/play/nyawa_habis")) {
    return {
      backgroundSrc: inGameMusicSrc,
      introSrc: nyawaHabisSoundSrc,
      introKey: "nyawa-habis",
    };
  }

  if (
    pathname.includes("/play/game") ||
    pathname.includes("/play/loading") ||
    pathname.includes("/play/soal_nyawa") ||
    pathname.includes("/play/hasil_nyawa")
  ) {
    return { backgroundSrc: inGameMusicSrc };
  }

  return { backgroundSrc: menuMusicSrc };
}

export function BackgroundMusicController() {
  const pathname = usePathname();
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastIntroKeyRef = useRef<string | null>(null);
  const pendingIntroRef = useRef<{ introSrc: string; backgroundSrc: string } | null>(null);
  const [hasAudioError, setHasAudioError] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(() => readBackgroundMusicMuted());
  const audioConfig = useMemo(() => getRouteAudioConfig(pathname), [pathname]);

  useEffect(() => subscribeToBackgroundMusicState(() => setIsMusicMuted(readBackgroundMusicMuted())), []);

  const playBackground = useCallback(async () => {
    const audio = backgroundAudioRef.current;

    if (!audio || hasAudioError || isMusicMuted) {
      return;
    }

    audio.volume = backgroundVolume;

    try {
      await audio.play();
    } catch {
    }
  }, [hasAudioError, isMusicMuted]);

  const switchBackground = useCallback(
    (src: string) => {
      const audio = backgroundAudioRef.current;

      if (!audio || hasAudioError) {
        return;
      }

      if (!audio.src.endsWith(src)) {
        audio.pause();
        audio.src = src;
        audio.currentTime = 0;
      }

      audio.loop = true;
      void playBackground();
    },
    [hasAudioError, playBackground],
  );

  const playIntroThenBackground = useCallback(
    async (introSrc: string, backgroundSrc: string) => {
      const backgroundAudio = backgroundAudioRef.current;
      const introAudio = introAudioRef.current;

      if (isMusicMuted) {
        pendingIntroRef.current = null;
        return;
      }

      if (!introAudio || hasAudioError) {
        switchBackground(backgroundSrc);
        return;
      }

      backgroundAudio?.pause();
      introAudio.pause();
      introAudio.src = introSrc;
      introAudio.currentTime = 0;
      introAudio.loop = false;
      introAudio.volume = effectVolume;

      introAudio.onended = () => {
        switchBackground(backgroundSrc);
      };

      pendingIntroRef.current = { introSrc, backgroundSrc };

      try {
        await introAudio.play();
        pendingIntroRef.current = null;
      } catch {
      }
    },
    [hasAudioError, isMusicMuted, switchBackground],
  );

  useEffect(() => {
    if (hasAudioError) {
      return;
    }

    if (isMusicMuted) {
      backgroundAudioRef.current?.pause();
      introAudioRef.current?.pause();
      pendingIntroRef.current = null;
      return;
    }

    if (audioConfig.introSrc && audioConfig.introKey !== lastIntroKeyRef.current) {
      lastIntroKeyRef.current = audioConfig.introKey ?? null;
      void playIntroThenBackground(audioConfig.introSrc, audioConfig.backgroundSrc);
      return;
    }

    if (!audioConfig.introSrc) {
      lastIntroKeyRef.current = null;
    }

    switchBackground(audioConfig.backgroundSrc);
  }, [audioConfig, hasAudioError, isMusicMuted, playIntroThenBackground, switchBackground]);

  useEffect(() => {
    function retryPendingPlayback() {
      if (isMusicMuted) {
        return;
      }

      const pendingIntro = pendingIntroRef.current;

      if (pendingIntro) {
        void playIntroThenBackground(pendingIntro.introSrc, pendingIntro.backgroundSrc);
        return;
      }

      void playBackground();
    }

    window.addEventListener("pointerdown", retryPendingPlayback);
    window.addEventListener("keydown", retryPendingPlayback);

    return () => {
      window.removeEventListener("pointerdown", retryPendingPlayback);
      window.removeEventListener("keydown", retryPendingPlayback);
    };
  }, [isMusicMuted, playBackground, playIntroThenBackground]);

  useEffect(() => {
    function handleSoundEffect(event: Event) {
      const effect = (event as CustomEvent<GameSoundEffect>).detail;
      const audio = soundEffectAudioRef.current;
      const src = effect === "correct" ? correctSoundSrc : wrongSoundSrc;

      if (!audio || hasAudioError) {
        return;
      }

      audio.pause();
      audio.src = src;
      audio.currentTime = 0;
      audio.loop = false;
      audio.volume = effectVolume;

      void audio.play().catch(() => {});
    }

    window.addEventListener(soundEffectEventName, handleSoundEffect);

    return () => {
      window.removeEventListener(soundEffectEventName, handleSoundEffect);
    };
  }, [hasAudioError]);

  if (hasAudioError) {
    return null;
  }

  return (
    <>
      <audio ref={backgroundAudioRef} loop autoPlay preload="auto" aria-hidden="true" onError={() => setHasAudioError(true)} />
      <audio ref={introAudioRef} preload="auto" aria-hidden="true" onError={() => setHasAudioError(true)} />
      <audio ref={soundEffectAudioRef} preload="auto" aria-hidden="true" onError={() => setHasAudioError(true)} />
    </>
  );
}
