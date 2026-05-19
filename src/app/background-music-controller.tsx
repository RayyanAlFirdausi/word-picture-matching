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

export type GameSoundEffect = "correct" | "wrong";

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
  const audioConfig = useMemo(() => getRouteAudioConfig(pathname), [pathname]);

  const playBackground = useCallback(async () => {
    const audio = backgroundAudioRef.current;

    if (!audio || hasAudioError) {
      return;
    }

    audio.volume = backgroundVolume;

    try {
      await audio.play();
    } catch {
    }
  }, [hasAudioError]);

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
    [hasAudioError, switchBackground],
  );

  useEffect(() => {
    if (hasAudioError) {
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
  }, [audioConfig, hasAudioError, playIntroThenBackground, switchBackground]);

  useEffect(() => {
    function retryPendingPlayback() {
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
  }, [playBackground, playIntroThenBackground]);

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
