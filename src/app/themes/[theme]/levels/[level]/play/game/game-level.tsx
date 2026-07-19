"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playGameSoundEffect } from "../../../../../../background-music-controller";
import { defaultLocale, getDictionary, type Locale } from "../../../../../../i18n";
import {
  createGameQuestionsFromIds,
  createRandomGameQuestionIds,
  QUESTIONS_PER_PLAY_SESSION,
  type WordGameQuestion,
  type WordTheme,
} from "../../../../../../word-assets";
import {
  createInitialGameState,
  readPersistedGameState,
  type GameAnswerStatus,
  type GameLetter,
  writePersistedGameState,
} from "../_components/game-state-storage";
import { persistAnsweredCollectionItem } from "../_components/progress-storage";

type Letter = GameLetter & {
  isPlaceholder?: boolean;
};
type AnswerStatus = GameAnswerStatus;

type GameLabels = {
  level: (level: string | number) => string;
  livesRemaining: (lives: number) => string;
  answerLetters: (count: number) => string;
  questionProgress: (current: number, total: number) => string;
  letterChoices: string;
  chooseLetter: (letter: string) => string;
  correctTitle: string;
  correctDescription: string;
  wrongTitle: string;
  wrongDescription: string;
};

type CommonLabels = {
  removeAll: string;
  seeResult: string;
  next: string;
  checkAnswer: string;
  hint: string;
};

const gameBackgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";
const roundDurationSeconds = 60;
const roundDurationMs = roundDurationSeconds * 1000;
const autoAdvanceDelayMs = 3000;

function createPlayableLetter(letter: Letter): Letter {
  return {
    id: letter.id,
    value: letter.value,
  };
}

function createLetterPlaceholder(letter: Letter): Letter {
  return {
    ...createPlayableLetter(letter),
    isPlaceholder: true,
  };
}

function restoreLettersToBank(letterBank: Letter[], letters: Letter[]) {
  return letters.reduce((bank, letter) => {
    const placeholderIndex = bank.findIndex((bankLetter) => bankLetter.id === letter.id && bankLetter.isPlaceholder);
    const restoredLetter = createPlayableLetter(letter);

    if (placeholderIndex === -1) {
      return bank.some((bankLetter) => bankLetter.id === letter.id && !bankLetter.isPlaceholder)
        ? bank
        : [...bank, restoredLetter];
    }

    const nextBank = [...bank];
    nextBank[placeholderIndex] = restoredLetter;
    return nextBank;
  }, letterBank);
}

function GameButton({
  children,
  disabled,
  wide,
  onClick,
  variant = "blue",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  wide?: boolean;
  onClick?: () => void;
  variant?: "blue" | "yellow";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative flex h-[58px] items-center justify-center overflow-hidden rounded-[64px] border-2 px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] ${
        wide ? "min-w-0 flex-1" : "shrink-0"
      } ${
        disabled
          ? "border-[#8a8a8a] bg-[#d8d8d8] text-[#8a8a8a] shadow-[inset_0_-8px_0_0_#b8b8b8]"
          : variant === "yellow"
            ? "border-[#9e5400] bg-[#ffe514] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
            : "border-[#02324b] bg-[#0af] text-white shadow-[inset_0_-8px_0_0_#0064bf] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
      }`}
    >
      {children}
    </button>
  );
}

function LetterTile({
  letter,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  ariaLabel,
  disabled,
  status = "idle",
  width = "fixed",
  size = "bank",
}: {
  letter: Letter;
  onClick?: () => void;
  onDragStart: () => void;
  onDragEnd?: () => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  ariaLabel: string;
  disabled?: boolean;
  status?: AnswerStatus;
  width?: "fixed" | "full";
  size?: "bank" | "answer";
}) {
  const widthClass = width === "full" ? "w-full" : "w-[64px]";
  const textClass = size === "answer" ? "text-[clamp(20px,4vw,24px)]" : "text-[24px]";
  const paddingClass = size === "answer" ? "px-1 pb-4 pt-3" : "px-4 pb-4 pt-3";
  const statusClass = {
    idle: "bg-white shadow-[inset_0_-5px_0_0_#d5d5d5]",
    correct: "bg-[#ddffc5] shadow-[inset_0_-5px_0_0_#84d747]",
    wrong: "bg-[#ffd5d5] shadow-[inset_0_-5px_0_0_#ff9d9d]",
  }[status];

  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      aria-label={ariaLabel}
      className={`relative flex h-[52px] ${widthClass} shrink-0 items-center justify-center rounded-[16px] ${paddingClass} ${textClass} font-medium leading-normal text-black transition-transform focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white ${
        disabled
          ? "cursor-default"
          : "cursor-grab hover:-translate-y-0.5 active:cursor-grabbing"
      } ${statusClass}`}
      style={{
        fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        fontWeight: 500,
      }}
    >
      {letter.value}
    </button>
  );
}

function LetterPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none h-[52px] w-[64px] shrink-0 rounded-[16px] bg-[#d4d4d4] shadow-[inset_0_-5px_0_0_#ababab]"
    />
  );
}

function AnswerToast({ status, labels }: { status: Exclude<AnswerStatus, "idle">; labels: GameLabels }) {
  const content = {
    correct: {
      icon: "/figma/game-toast-correct.svg",
      title: labels.correctTitle,
      description: labels.correctDescription,
    },
    wrong: {
      icon: "/figma/game-toast-wrong.svg",
      title: labels.wrongTitle,
      description: labels.wrongDescription,
    },
  }[status];

  return (
    <div
      role="status"
      className="absolute left-1/2 top-16 z-30 flex -translate-x-1/2 items-center gap-3 rounded-[24px] bg-white py-3 pl-3 pr-8 drop-shadow-[0_14px_12px_rgba(0,0,0,0.25)]"
    >
      <Image
        src={content.icon}
        alt=""
        width={76}
        height={76}
        className="size-[76px] shrink-0"
        priority
      />
      <div className="flex shrink-0 flex-col gap-1 font-geist leading-normal text-left">
        <p className="w-full text-[24px] font-semibold text-black">
          {content.title}
        </p>
        <p className="w-full text-[16px] font-normal text-[#757575]">
          {content.description}
        </p>
      </div>
    </div>
  );
}

function Hearts({ lives, labels }: { lives: number; labels: GameLabels }) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      aria-label={labels.livesRemaining(lives)}
    >
      {[0, 1, 2].map((index) => (
        <Image
          key={index}
          src="/figma/game-heart.svg"
          alt=""
          width={32}
          height={32}
          className={`size-8 ${index < lives ? "opacity-100" : "grayscale opacity-35"}`}
        />
      ))}
    </div>
  );
}

function HintEarnedToast() {
  return (
    <div
      role="status"
      className="absolute left-1/2 top-[590px] z-30 flex w-[min(520px,calc(100%-32px))] -translate-x-1/2 animate-[hint-toast_1s_ease-in-out_forwards] justify-end pr-3"
    >
      <div className="relative flex items-center overflow-hidden rounded-[16px] border-2 border-[#347d00] bg-[#58cd04] px-5 pb-[18px] pt-3 font-geist text-[16px] font-semibold leading-normal text-white shadow-[inset_0_-8px_0_0_#43a000]">
        +1 hint
      </div>
    </div>
  );
}

function AnswerLines({
  answer,
  placedLetters,
  onDragStart,
  onDropToSlot,
  onReturnLetter,
  onAnswerDragEnd,
  answerStatus,
  locked,
  labels,
}: {
  answer: string;
  placedLetters: Letter[];
  onDragStart: (source: "bank" | "answer", index: number) => void;
  onDropToSlot: (slotIndex: number) => void;
  onReturnLetter: (index: number) => void;
  onAnswerDragEnd: (index: number) => void;
  answerStatus: AnswerStatus;
  locked: boolean;
  labels: GameLabels;
}) {
  return (
    <div className="flex w-full items-start justify-center gap-2">
      {answer.split("").map((_, index) => {
        const letter = placedLetters[index];

        return (
          <div
            key={index}
            onDragOver={(event) => {
              if (!locked) {
                event.preventDefault();
              }
            }}
            onDrop={() => {
              if (!locked) {
                onDropToSlot(index);
              }
            }}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-[52px] w-full items-center justify-center">
              {letter ? (
                <LetterTile
                  letter={letter}
                  disabled={locked}
                  onClick={() => {
                    if (!locked) {
                      onReturnLetter(index);
                    }
                  }}
                  onDragStart={() => onDragStart("answer", index)}
                  onDragEnd={() => onAnswerDragEnd(index)}
                  onDragOver={(event) => {
                    if (!locked) {
                      event.preventDefault();
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();

                    if (!locked) {
                      onDropToSlot(index);
                    }
                  }}
                  ariaLabel={labels.answerLetters(answer.length)}
                  status={answerStatus}
                  width="full"
                  size="answer"
                />
              ) : null}
            </div>
            <span className="h-1 w-full rounded-[64px] bg-white" />
          </div>
        );
      })}
    </div>
  );
}

export function GameLevel({
  congratulationsHref,
  gameOverHref,
  theme,
  level,
  storageKey,
  locale = defaultLocale,
}: {
  congratulationsHref: string;
  gameOverHref: string;
  theme: WordTheme;
  level: string;
  storageKey: string;
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);
  const labels: GameLabels = dictionary.game;
  const commonLabels: CommonLabels = dictionary.common;
  const router = useRouter();
  const [questionIds, setQuestionIds] = useState<string[] | null>(null);
  const gameQuestions = useMemo<WordGameQuestion[]>(
    () => (questionIds ? createGameQuestionsFromIds(theme, level, questionIds) : []),
    [level, questionIds, theme],
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [letterBank, setLetterBank] = useState<Letter[]>([]);
  const [placedLetters, setPlacedLetters] = useState<Letter[]>([]);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(roundDurationSeconds);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [correctAnswersTowardHint, setCorrectAnswersTowardHint] = useState(0);
  const [showHintEarnedToast, setShowHintEarnedToast] = useState(false);
  const [hasHydratedState, setHasHydratedState] = useState(false);
  const draggedLetterRef = useRef<{
    source: "bank" | "answer";
    index: number;
  } | null>(null);
  const dropHandledRef = useRef(false);
  const timerStateRef = useRef({
    answerStatus: "idle" as AnswerStatus,
    correctCount: 0,
    lives: 3,
    questionIndex: 0,
  });
  const currentQuestion = gameQuestions[Math.min(questionIndex, Math.max(0, gameQuestions.length - 1))];
  const answer = currentQuestion?.answer ?? "";
  const isLastQuestion = questionIndex === gameQuestions.length - 1;
  const hasAnswer = placedLetters.length > 0;
  const hasCheckedAnswer = answerStatus !== "idle";
  const answerComplete = answer.length > 0 && placedLetters.length === answer.length;
  const currentAnswer = placedLetters.map((letter) => letter.value).join("");
  const nextHintLetter = answer[placedLetters.length];
  const canUseHint =
    hintsAvailable > 0 &&
    !hasCheckedAnswer &&
    !answerComplete &&
    letterBank.some((letter) => !letter.isPlaceholder && letter.value === nextHintLetter);
  const timerColor =
    secondsLeft > 20 ? "#58CD04" : secondsLeft > 10 ? "#FFE514" : "#FF0000";
  const timerWidth = `${(secondsLeft / roundDurationSeconds) * 100}%`;

  useEffect(() => {
    timerStateRef.current = {
      answerStatus,
      correctCount,
      lives,
      questionIndex,
    };
  }, [answerStatus, correctCount, lives, questionIndex]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const persistedState = readPersistedGameState(storageKey);
      const persistedQuestions = persistedState
        ? createGameQuestionsFromIds(theme, level, persistedState.questionIds)
        : [];
      const hasValidPersistedState =
        persistedState !== null &&
        persistedState.questionIds.length > 0 &&
        persistedState.questionIds.length <= QUESTIONS_PER_PLAY_SESSION &&
        new Set(persistedState.questionIds).size === persistedState.questionIds.length &&
        persistedQuestions.length === persistedState.questionIds.length &&
        persistedState.questionIndex < persistedQuestions.length;

      if (persistedState && hasValidPersistedState) {
        setQuestionIds([...persistedState.questionIds]);
        setQuestionIndex(persistedState.questionIndex);
        setCorrectCount(Math.min(persistedQuestions.length, Math.max(0, persistedState.correctCount)));
        setLetterBank(persistedState.letterBank);
        setPlacedLetters(persistedState.placedLetters);
        setLives(persistedState.lives);
        setRound(persistedState.round);
        setAnswerStatus(persistedState.answerStatus);
        setHintsAvailable(Math.max(0, Math.floor(persistedState.hintsAvailable)));
        setCorrectAnswersTowardHint(Math.max(0, Math.floor(persistedState.correctAnswersTowardHint)));
      } else {
        const nextQuestionIds = createRandomGameQuestionIds(theme, level);
        const nextQuestions = createGameQuestionsFromIds(theme, level, nextQuestionIds);
        const initialState = createInitialGameState(nextQuestionIds, nextQuestions[0]?.letters ?? []);

        setQuestionIds(initialState.questionIds);
        setQuestionIndex(initialState.questionIndex);
        setCorrectCount(initialState.correctCount);
        setLetterBank(initialState.letterBank);
        setPlacedLetters(initialState.placedLetters);
        setLives(initialState.lives);
        setRound(initialState.round);
        setAnswerStatus(initialState.answerStatus);
        setHintsAvailable(initialState.hintsAvailable);
        setCorrectAnswersTowardHint(initialState.correctAnswersTowardHint);
      }

      setHasHydratedState(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [level, storageKey, theme]);

  useEffect(() => {
    if (!hasHydratedState || !questionIds || gameQuestions.length === 0) {
      return;
    }

    writePersistedGameState(storageKey, {
      version: 5,
      questionIds,
      lives,
      round,
      questionIndex,
      correctCount,
      letterBank,
      placedLetters,
      answerStatus,
      hintsAvailable,
      correctAnswersTowardHint,
    });
  }, [
    answerStatus,
    correctAnswersTowardHint,
    correctCount,
    gameQuestions.length,
    hasHydratedState,
    hintsAvailable,
    letterBank,
    lives,
    placedLetters,
    questionIds,
    questionIndex,
    round,
    storageKey,
  ]);

  const resetRound = useCallback((nextQuestionIndex = questionIndex) => {
    setLetterBank(gameQuestions[nextQuestionIndex].letters);
    setPlacedLetters([]);
    setAnswerStatus("idle");
    setSecondsLeft(roundDurationSeconds);
    draggedLetterRef.current = null;
    dropHandledRef.current = false;
    setRound((current) => current + 1);
  }, [gameQuestions, questionIndex]);

  useEffect(() => {
    if (!hasHydratedState || gameQuestions.length === 0) {
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setSecondsLeft(Math.max(0, roundDurationSeconds - elapsedSeconds));
    }, 50);
    const timeout = window.setTimeout(() => {
      const {
        answerStatus: statusAtTimeout,
        lives: livesAtTimeout,
        questionIndex: questionIndexAtTimeout,
      } = timerStateRef.current;

      if (statusAtTimeout !== "idle") {
        return;
      }

      const nextLives = Math.max(0, livesAtTimeout - 1);
      setLives(nextLives);

      if (nextLives <= 0) {
        return;
      }

      resetRound(questionIndexAtTimeout);
    }, roundDurationMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [gameQuestions.length, hasHydratedState, resetRound, round]);

  useEffect(() => {
    if (hasHydratedState && lives === 0) {
      router.replace(gameOverHref);
    }
  }, [gameOverHref, hasHydratedState, lives, router]);

  function loseLife() {
    setLives((current) => Math.max(0, current - 1));
  }

  function chooseBankLetter(index: number) {
    const selected = letterBank[index];

    if (
      !selected ||
      selected.isPlaceholder ||
      placedLetters.length >= answer.length ||
      hasCheckedAnswer
    ) {
      return;
    }

    setAnswerStatus("idle");
    setLetterBank((current) =>
      current.map((letter, bankIndex) =>
        bankIndex === index ? createLetterPlaceholder(letter) : letter,
      ),
    );
    setPlacedLetters((current) => [...current, createPlayableLetter(selected)]);
  }

  function removeAll() {
    if (hasCheckedAnswer || !hasAnswer) {
      return;
    }

    setLetterBank((current) => restoreLettersToBank(current, placedLetters));
    setPlacedLetters([]);
    setAnswerStatus("idle");
    draggedLetterRef.current = null;
    dropHandledRef.current = false;
  }

  function checkAnswer() {
    if (!answerComplete || hasCheckedAnswer) {
      return;
    }

    if (currentAnswer === answer) {
      playGameSoundEffect("correct");
      persistAnsweredCollectionItem(theme, currentQuestion.id);
      setAnswerStatus("correct");
      return;
    }

    playGameSoundEffect("wrong");
    setAnswerStatus("wrong");
    loseLife();
  }

  function useHint() {
    if (!canUseHint) {
      return;
    }

    const hintedLetterIndex = letterBank.findIndex(
      (letter) => !letter.isPlaceholder && letter.value === nextHintLetter,
    );
    const hintedLetter = letterBank[hintedLetterIndex];

    if (!hintedLetter) {
      return;
    }

    setHintsAvailable((current) => Math.max(0, current - 1));
    setLetterBank((current) =>
      current.map((letter, index) =>
        index === hintedLetterIndex ? createLetterPlaceholder(letter) : letter,
      ),
    );
    setPlacedLetters((current) => [...current, createPlayableLetter(hintedLetter)]);
  }

  const advanceQuestion = useCallback(() => {
    if (!hasCheckedAnswer) {
      return;
    }

    const isCorrectAnswer = answerStatus === "correct";
    const nextCorrectCount = isCorrectAnswer ? correctCount + 1 : correctCount;

    if (isCorrectAnswer) {
      const nextCorrectAnswersTowardHint = correctAnswersTowardHint + 1;

      if (nextCorrectAnswersTowardHint >= 2) {
        setHintsAvailable((current) => current + 1);
        setShowHintEarnedToast(true);
        setCorrectAnswersTowardHint(0);
      } else {
        setCorrectAnswersTowardHint(nextCorrectAnswersTowardHint);
      }
    }

    if (isLastQuestion) {
      router.replace(`${congratulationsHref}?correct=${nextCorrectCount}&total=${gameQuestions.length}`);
      return;
    }

    const nextQuestionIndex = questionIndex + 1;
    setCorrectCount(nextCorrectCount);
    setQuestionIndex(nextQuestionIndex);
    resetRound(nextQuestionIndex);
  }, [
    answerStatus,
    congratulationsHref,
    correctAnswersTowardHint,
    correctCount,
    gameQuestions.length,
    hasCheckedAnswer,
    isLastQuestion,
    questionIndex,
    resetRound,
    router,
  ]);

  useEffect(() => {
    if (!hasCheckedAnswer) {
      return;
    }

    const timeout = window.setTimeout(() => advanceQuestion(), autoAdvanceDelayMs);

    return () => window.clearTimeout(timeout);
  }, [advanceQuestion, hasCheckedAnswer]);

  useEffect(() => {
    if (!showHintEarnedToast) {
      return;
    }

    const timeout = window.setTimeout(() => setShowHintEarnedToast(false), 1000);

    return () => window.clearTimeout(timeout);
  }, [showHintEarnedToast]);

  function handleDragStart(source: "bank" | "answer", index: number) {
    if (hasCheckedAnswer) {
      return;
    }

    draggedLetterRef.current = { source, index };
    dropHandledRef.current = false;
  }

  function returnAnswerLetter(index: number) {
    const selected = placedLetters[index];

    if (!selected || hasCheckedAnswer) {
      return;
    }

    setAnswerStatus("idle");
    setPlacedLetters((current) =>
      current.filter((_, letterIndex) => letterIndex !== index),
    );
    setLetterBank((current) => restoreLettersToBank(current, [selected]));
    draggedLetterRef.current = null;
  }

  function handleAnswerDragEnd(index: number) {
    const dragged = draggedLetterRef.current;

    if (
      !dropHandledRef.current &&
      dragged?.source === "answer" &&
      dragged.index === index
    ) {
      returnAnswerLetter(index);
      return;
    }

    draggedLetterRef.current = null;
    dropHandledRef.current = false;
  }

  function handleDropToSlot(slotIndex: number) {
    const dragged = draggedLetterRef.current;

    if (!dragged || hasCheckedAnswer) {
      return;
    }

    dropHandledRef.current = true;

    if (dragged.source === "bank") {
      const selected = letterBank[dragged.index];

      if (!selected || selected.isPlaceholder || placedLetters.length >= answer.length) {
        draggedLetterRef.current = null;
        return;
      }

      setAnswerStatus("idle");
      setLetterBank((current) =>
        current.map((letter, index) =>
          index === dragged.index ? createLetterPlaceholder(letter) : letter,
        ),
      );
      setPlacedLetters((current) => {
        const next = [...current];
        const targetIndex = Math.min(slotIndex, answer.length - 1, next.length);
        next.splice(targetIndex, 0, createPlayableLetter(selected));
        return next;
      });
      draggedLetterRef.current = null;
      return;
    }

    setAnswerStatus("idle");
    setPlacedLetters((current) => {
      const next = [...current];
      const [selected] = next.splice(dragged.index, 1);

      if (!selected) {
        return current;
      }

      next.splice(Math.min(slotIndex, next.length), 0, selected);
      return next;
    });
    draggedLetterRef.current = null;
  }

  if (!hasHydratedState || !currentQuestion) {
    return (
      <main className="relative min-h-dvh overflow-x-clip bg-[#678cff] font-gasoek">
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: gameBackgroundPattern }} />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#678cff] font-gasoek">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: gameBackgroundPattern }}
      />

      <header className="absolute left-2.5 right-2.5 top-2.5 z-10 flex items-center gap-5">
        <p className="shrink-0 text-center text-[16px] uppercase leading-[1.3] text-white">
          {labels.level(level)}
        </p>
        <div className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-[64px] bg-white/40">
          <div
            key={round}
            className="absolute left-0 top-0 h-full rounded-[64px] transition-colors duration-200 ease-linear"
            style={{ backgroundColor: timerColor, width: timerWidth }}
          />
        </div>
        <Hearts lives={lives} labels={labels} />
      </header>

      {answerStatus !== "idle" ? <AnswerToast status={answerStatus} labels={labels} /> : null}
      {showHintEarnedToast ? <HintEarnedToast /> : null}

      <section className="absolute left-1/2 top-[82px] z-10 h-[240px] w-[min(520px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-[24px] bg-[#f1f1f1] shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
        <Image
          src={currentQuestion.image}
          alt=""
          fill
          sizes="(max-width: 552px) calc(100vw - 32px), 520px"
          className="object-cover object-[center_40%]"
          priority={questionIndex === 0}
        />
        <div className="absolute left-2 top-2 flex h-12 items-center justify-center rounded-[64px] bg-black/20 px-5 py-3 font-geist text-[20px] font-medium leading-normal text-white backdrop-blur-[32px]">
          {labels.questionProgress(questionIndex + 1, gameQuestions.length)}
        </div>
        <button
          type="button"
          disabled={!hasAnswer || hasCheckedAnswer}
          onClick={removeAll}
          className={`absolute right-2 top-2 flex h-12 items-center justify-center overflow-hidden rounded-[64px] border-2 px-5 pb-5 pt-4 text-center text-[12px] uppercase leading-[1.3] ${
            hasAnswer && !hasCheckedAnswer
              ? "border-[#840000] bg-[#ff0000] text-white shadow-[inset_0_-8px_0_0_#b90000] transition-transform hover:-translate-y-0.5"
              : "border-[#8a8a8a] bg-[#d8d8d8] text-[#8a8a8a] shadow-[inset_0_-8px_0_0_#b8b8b8]"
          }`}
        >
          {commonLabels.removeAll}
        </button>
      </section>

      <section className="absolute left-1/2 top-[342px] z-10 w-[min(520px,calc(100%-32px))] -translate-x-1/2">
        <AnswerLines
          answer={answer}
          placedLetters={placedLetters}
          onDragStart={handleDragStart}
          onDropToSlot={handleDropToSlot}
          onReturnLetter={returnAnswerLetter}
          onAnswerDragEnd={handleAnswerDragEnd}
          answerStatus={answerStatus}
          locked={hasCheckedAnswer}
          labels={labels}
        />
      </section>

      <section
        aria-label={labels.letterChoices}
        className="absolute left-1/2 top-[438px] z-10 flex w-[min(520px,calc(100%-32px))] -translate-x-1/2 flex-wrap justify-center gap-3"
      >
        {letterBank.map((letter, index) =>
          letter.isPlaceholder ? (
            <LetterPlaceholder key={letter.id} />
          ) : (
            <LetterTile
              key={letter.id}
              letter={letter}
              disabled={hasCheckedAnswer}
              onClick={() => chooseBankLetter(index)}
              onDragStart={() => handleDragStart("bank", index)}
              onDragOver={(event) => {
                if (!hasCheckedAnswer) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDropToSlot(placedLetters.length);
              }}
              ariaLabel={labels.chooseLetter(letter.value)}
            />
          ),
        )}
      </section>

      <section className="absolute left-1/2 top-[650px] z-10 flex w-[min(520px,calc(100%-32px))] -translate-x-1/2 items-center gap-2">
        {hasCheckedAnswer ? (
          <GameButton wide onClick={advanceQuestion} variant="yellow">
            {isLastQuestion ? commonLabels.seeResult : commonLabels.next}
          </GameButton>
        ) : (
          <GameButton
            wide
            disabled={!answerComplete}
            onClick={checkAnswer}
            variant="yellow"
          >
            {commonLabels.checkAnswer}
          </GameButton>
        )}
        <GameButton disabled={!canUseHint} onClick={useHint}>
          {commonLabels.hint} [{hintsAvailable}]
        </GameButton>
      </section>
    </main>
  );
}
