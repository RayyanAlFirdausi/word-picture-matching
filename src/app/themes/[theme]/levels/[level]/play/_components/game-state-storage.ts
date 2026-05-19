export type GameLetter = {
  id: string;
  value: string;
};

export const initialGameLetters: GameLetter[] = [
  "A",
  "T",
  "B",
  "R",
  "I",
  "P",
  "N",
  "G",
  "F",
  "Z",
  "Q",
  "E",
  "D",
].map((value, index) => ({
  id: `${value}-${index}`,
  value,
}));

export type GameAnswerStatus = "idle" | "correct" | "wrong";

export type PersistedGameState = {
  version: 5;
  questionIds: string[];
  lives: number;
  round: number;
  questionIndex: number;
  correctCount: number;
  letterBank: GameLetter[];
  placedLetters: GameLetter[];
  answerStatus: GameAnswerStatus;
  hintsAvailable: number;
  correctAnswersTowardHint: number;
};

export function createGameStateStorageKey(theme: string, level: string) {
  return `wpm:${theme}:${level}:game-state`;
}

export function createInitialGameState(questionIds: string[], letterBank: GameLetter[], lives = 3): PersistedGameState {
  return {
    version: 5,
    questionIds,
    lives: clampLives(lives),
    round: 0,
    questionIndex: 0,
    correctCount: 0,
    letterBank,
    placedLetters: [],
    answerStatus: "idle",
    hintsAvailable: 0,
    correctAnswersTowardHint: 0,
  };
}

export function readPersistedGameState(storageKey: string): PersistedGameState | null {
  try {
    const value = window.sessionStorage.getItem(storageKey);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as Partial<PersistedGameState>;

    if (isPersistedGameState(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function writePersistedGameState(storageKey: string, state: PersistedGameState) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
  }
}

export function clearPersistedGameState(storageKey: string) {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
  }
}

export function restoreLivesInPersistedGameState(storageKey: string, restoredLives: number) {
  const currentState = readPersistedGameState(storageKey);

  if (!currentState) {
    return;
  }

  writePersistedGameState(storageKey, {
    ...currentState,
    lives: clampLives(restoredLives),
    answerStatus: "idle",
  });
}

function clampLives(value: number) {
  return Math.min(3, Math.max(0, value));
}

function isPersistedGameState(value: Partial<PersistedGameState>): value is PersistedGameState {
  return (
    value.version === 5 &&
    isStringArray(value.questionIds) &&
    hasBaseGameState(value) &&
    typeof value.hintsAvailable === "number" &&
    typeof value.correctAnswersTowardHint === "number"
  );
}

function hasBaseGameState(value: Partial<PersistedGameState>) {
  return (
    typeof value.lives === "number" &&
    typeof value.round === "number" &&
    typeof value.questionIndex === "number" &&
    typeof value.correctCount === "number" &&
    isGameLetterArray(value.letterBank) &&
    isGameLetterArray(value.placedLetters) &&
    (value.answerStatus === "idle" || value.answerStatus === "correct" || value.answerStatus === "wrong")
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isGameLetterArray(value: unknown): value is GameLetter[] {
  return (
    Array.isArray(value) &&
    value.every(
      (letter) =>
        typeof letter === "object" &&
        letter !== null &&
        "id" in letter &&
        "value" in letter &&
        typeof letter.id === "string" &&
        typeof letter.value === "string",
    )
  );
}
