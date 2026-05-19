"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { playGameSoundEffect } from "../../../../../../background-music-controller";
import { defaultLocale, getDictionary, type Locale } from "../../../../../../i18n";
import {
  createMultipleChoiceQuestionsFromIds,
  type MultipleChoiceQuestion,
  type WordTheme,
} from "../../../../../../word-assets";
import {
  createGameStateStorageKey,
  readPersistedGameState,
} from "../_components/game-state-storage";

const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

const titleShadow =
  "6px 0 #30469f, -6px 0 #30469f, 0 6px #30469f, 0 -6px #30469f, 5px 5px #30469f, -5px 5px #30469f, 5px -5px #30469f, -5px -5px #30469f, 0 14px 34px rgba(0,0,0,0.25)";

type AnswerStatus = "correct" | "wrong";

type RecoveryQuestion = MultipleChoiceQuestion & {
  prompt: string;
};

type RecoveryLabels = {
  progress: (current: number, total: number) => string;
  prompt: string;
  correctTitle: string;
  correctDescription: string;
  wrongTitle: string;
  correctAnswerIs: (answer: string) => string;
  next: string;
  seeResult: string;
};

function getAnswerStatus(question: RecoveryQuestion, option: string | null): AnswerStatus | null {
  if (!option) {
    return null;
  }

  return option === question.correctAnswer ? "correct" : "wrong";
}

function getRecoveryQuestionIds(questionIds: string[], questionIndex: number) {
  if (questionIds.length === 0) {
    return [];
  }

  const startIndex = Math.min(Math.max(0, questionIndex), questionIds.length - 1);

  return [...questionIds.slice(startIndex), ...questionIds.slice(0, startIndex)].slice(0, 3);
}

function createRecoveryQuestions(theme: WordTheme, level: string, questionIds: string[], questionIndex = 0, prompt: string) {
  const recoveryQuestionIds = getRecoveryQuestionIds(questionIds, questionIndex);
  const questions = createMultipleChoiceQuestionsFromIds(theme, level, recoveryQuestionIds, 3);

  return questions.map((question) => ({
    ...question,
    prompt,
  }));
}

function AnswerButton({
  question,
  option,
  selected,
  disabled,
  onClick,
}: {
  question: RecoveryQuestion;
  option: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const status = selected ? getAnswerStatus(question, option) : null;
  const stateClass = {
    idle: "bg-white shadow-[inset_0_-5px_0_0_#d5d5d5]",
    correct: "bg-[#ddffc5] shadow-[inset_0_-5px_0_0_#84d747]",
    wrong: "bg-[#ffd5d5] shadow-[inset_0_-5px_0_0_#ff9d9d]",
  }[status ?? "idle"];

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex h-13 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl px-4 pb-4 pt-3 text-[24px] font-bold leading-normal text-black transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white ${
        disabled ? "cursor-default" : "hover:-translate-y-0.5"
      } ${stateClass}`}
      style={{
        fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        fontWeight: 500,
      }}
    >
      {option}
    </button>
  );
}

function AnswerToast({ status, question, labels }: { status: AnswerStatus; question: RecoveryQuestion; labels: RecoveryLabels }) {
  const content = {
    correct: {
      icon: "/figma/game-toast-correct.svg",
      title: labels.correctTitle,
      description: labels.correctDescription,
    },
    wrong: {
      icon: "/figma/game-toast-wrong.svg",
      title: labels.wrongTitle,
      description: labels.correctAnswerIs(question.correctAnswer),
    },
  }[status];

  return (
    <div
      role="status"
      className="absolute left-1/2 top-[121px] z-30 flex -translate-x-1/2 items-center gap-3 rounded-[24px] bg-white py-3 pl-3 pr-8 drop-shadow-[0_14px_12px_rgba(0,0,0,0.25)] max-[700px]:top-[112px]"
    >
      <Image src={content.icon} alt="" width={76} height={76} className="size-[76px] shrink-0" />
      <div className="flex shrink-0 flex-col gap-1 font-geist leading-normal text-left">
        <p className="w-full text-[24px] font-semibold text-black">{content.title}</p>
        <p className="w-full text-[16px] font-normal text-[#757575]">{content.description}</p>
      </div>
    </div>
  );
}

export function SoalNyawaQuiz({
  theme,
  level,
  locale = defaultLocale,
}: {
  theme: WordTheme;
  level: string;
  locale?: Locale;
}) {
  const labels: RecoveryLabels = getDictionary(locale).recovery;
  const router = useRouter();
  const fallbackQuestions = useMemo(() => createRecoveryQuestions(theme, level, [], 0, labels.prompt), [labels.prompt, level, theme]);
  const [questions, setQuestions] = useState<RecoveryQuestion[]>(fallbackQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const answerStatus = currentQuestion ? getAnswerStatus(currentQuestion, selectedAnswer) : null;
  const hasSelectedAnswer = selectedAnswer !== null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    const persistedState = readPersistedGameState(createGameStateStorageKey(theme, level));

    if (!persistedState) {
      return;
    }

    const nextQuestions = createRecoveryQuestions(
      theme,
      level,
      persistedState.questionIds,
      persistedState.questionIndex,
      labels.prompt,
    );

    if (nextQuestions.length > 0) {
      window.setTimeout(() => {
        setQuestions(nextQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setCorrectCount(0);
      }, 0);
    }
  }, [labels.prompt, level, theme]);

  if (!currentQuestion) {
    return null;
  }

  function selectAnswer(option: string) {
    if (hasSelectedAnswer) {
      return;
    }

    const nextAnswerStatus = getAnswerStatus(currentQuestion, option);

    if (nextAnswerStatus) {
      playGameSoundEffect(nextAnswerStatus);
    }

    setSelectedAnswer(option);
  }

  function handleNextQuestion() {
    if (!selectedAnswer || !answerStatus) {
      return;
    }

    const nextCorrectCount = answerStatus === "correct" ? correctCount + 1 : correctCount;

    if (isLastQuestion) {
      router.push(`/themes/${theme}/levels/${level}/play/hasil_nyawa?correct=${nextCorrectCount}`);
      return;
    }

    setCorrectCount(nextCorrectCount);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((current) => current + 1);
  }

  return (
    <main className="relative min-h-[max(744px,100dvh)] overflow-x-clip bg-[#678cff] font-geist">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: backgroundPattern }} />

      <h1
        className="absolute left-1/2 top-10 z-10 w-[min(644px,calc(100%-32px))] -translate-x-1/2 text-center text-[60px] leading-[0.9] text-white max-[700px]:text-[44px]"
        style={{
          fontFamily: "var(--font-gasoek-one), Arial, Helvetica, sans-serif",
          textShadow: titleShadow,
        }}
      >
        {labels.progress(currentQuestionIndex + 1, questions.length)}
      </h1>

      {answerStatus ? <AnswerToast status={answerStatus} question={currentQuestion} labels={labels} /> : null}

      <section className="absolute left-1/2 top-[154px] z-10 flex w-[min(596px,calc(100%-32px))] -translate-x-1/2 flex-col items-start gap-10">
        <div className="flex w-full flex-col items-center gap-5">
          <div className="relative h-[331px] w-full overflow-hidden rounded-[24px] bg-[#f1f1f1] shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
            <Image
              src={currentQuestion.image}
              alt=""
              fill
              sizes="596px"
              preload={currentQuestionIndex === 0}
              className="object-cover object-bottom"
            />
            <div className="absolute inset-x-0 bottom-0 h-[132px] bg-linear-to-b from-black/0 to-black/80" />
            <p className="absolute bottom-[22px] left-1/2 w-[min(403px,calc(100%-32px))] -translate-x-1/2 text-center text-[24px] font-medium leading-normal text-white">
              {currentQuestion.prompt}
            </p>
          </div>

          <div className="flex w-full items-start gap-2 max-[620px]:flex-col">
            {currentQuestion.options.map((option) => (
              <AnswerButton
                key={option}
                question={currentQuestion}
                option={option}
                selected={selectedAnswer === option}
                disabled={hasSelectedAnswer}
                onClick={() => selectAnswer(option)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!hasSelectedAnswer}
          onClick={handleNextQuestion}
          className={`relative flex h-[58px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[64px] border-2 px-[26px] pb-5 pt-4 text-center text-[16px] uppercase leading-[1.3] ${
            hasSelectedAnswer
              ? "border-[#9e5400] bg-[#ffe514] text-[#e18216] shadow-[inset_0_-8px_0_0_#e18216] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
              : "border-[#8a8a8a] bg-[#d8d8d8] text-[#8a8a8a] shadow-[inset_0_-8px_0_0_#b8b8b8]"
          }`}
          style={{
            fontFamily: "var(--font-gasoek-one), Arial, Helvetica, sans-serif",
          }}
        >
          {isLastQuestion ? labels.seeResult : labels.next}
        </button>
      </section>
    </main>
  );
}
