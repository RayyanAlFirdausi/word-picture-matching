import type { GameLetter } from "./themes/[theme]/levels/[level]/play/_components/game-state-storage";

export type WordTheme = "hewan" | "rumah" | "transportasi";
export type WordLevel = 1 | 2 | 3;

export type WordAsset = {
  id: string;
  theme: WordTheme;
  level: WordLevel;
  name: string;
  answer: string;
  image: string;
};

export type WordGameQuestion = WordAsset & {
  letters: GameLetter[];
};

export type MultipleChoiceQuestion = WordAsset & {
  options: string[];
  correctAnswer: string;
};

const themeFolders = {
  hewan: "Animal",
  rumah: "House",
  transportasi: "Transportation",
} as const satisfies Record<WordTheme, string>;

const wordNames = {
  hewan: {
    1: ["Ant", "Bat", "Bee", "Cat", "Cow", "Dog", "Fish", "Fox", "Owl", "Pig"],
    2: ["Eagle", "Goose", "Horse", "Koala", "Shark", "Sheep", "Snail", "Snake", "Tiger", "Zebra"],
    3: ["Buffalo", "Cheetah", "Dolphin", "Elephant", "Gorilla", "Hamster", "Lobster", "Marmot", "Penguin", "Raccoon"],
  },
  rumah: {
    1: ["Bed", "Desk", "Door", "Lamp", "Mat", "Oven", "Roof", "Sink", "Sofa", "Wall"],
    2: ["Broom", "Brush", "Chair", "Clock", "Shelf", "Spoon", "Stair", "Stove", "Table", "Towel"],
    3: ["Balcony", "Bathtub", "Bedroom", "Blanket", "Cupboard", "Doormat", "Freezer", "Hallway", "Kitchen", "Windows"],
  },
  transportasi: {
    1: ["Bike", "Boat", "Bus", "Car", "Jeep", "Ship", "Sled", "Taxi", "Tram", "Van"],
    2: ["Blimp", "Crane", "Ferry", "MRT", "Plane", "Rocket", "Train", "Truck", "Vespa", "Yacht"],
    3: ["Ambulance", "Bajaj", "Bicycle", "Cargo", "Helicopter", "Minibus", "Scooter", "Skateboard", "Tractor", "Trolley"],
  },
} as const satisfies Record<WordTheme, Record<WordLevel, readonly string[]>>;

export const QUESTIONS_PER_PLAY_SESSION = 6;

const levels = [1, 2, 3] as const;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function getCollectionAssets(theme: WordTheme) {
  return levels.flatMap((level) => getLevelAssets(theme, level));
}

export function getLevelAssets(theme: WordTheme, level: string | number) {
  const normalizedLevel = normalizeLevel(level);

  return wordNames[theme][normalizedLevel].map((name) => createWordAsset(theme, normalizedLevel, name));
}

export function createGameQuestions(theme: WordTheme, level: string | number): WordGameQuestion[] {
  return withLetterBanks(getLevelAssets(theme, level));
}

export function createRandomGameQuestionIds(theme: WordTheme, level: string | number) {
  const shuffledAssets = [...getLevelAssets(theme, level)];

  for (let index = shuffledAssets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledAssets[index], shuffledAssets[swapIndex]] = [shuffledAssets[swapIndex], shuffledAssets[index]];
  }

  return shuffledAssets.slice(0, Math.min(QUESTIONS_PER_PLAY_SESSION, shuffledAssets.length)).map((asset) => asset.id);
}

export function createGameQuestionsFromIds(
  theme: WordTheme,
  level: string | number,
  questionIds: string[],
): WordGameQuestion[] {
  return withLetterBanks(getLevelAssetsFromIds(theme, level, questionIds));
}

export function createMultipleChoiceQuestionsFromIds(
  theme: WordTheme,
  level: string | number,
  questionIds: string[],
  count = 3,
): MultipleChoiceQuestion[] {
  const levelAssets = getLevelAssets(theme, level);
  const selectedAssets = getLevelAssetsFromIds(theme, level, questionIds).slice(0, count);
  const fallbackAssets = selectedAssets.length > 0 ? selectedAssets : shuffleItems(levelAssets).slice(0, count);

  return fallbackAssets.map((asset) => {
    const wrongOptions = shuffleItems(levelAssets.map((levelAsset) => levelAsset.name).filter((name) => name !== asset.name)).slice(0, 2);

    return {
      ...asset,
      correctAnswer: asset.name,
      options: shuffleItems([asset.name, ...wrongOptions]),
    };
  });
}

function getLevelAssetsFromIds(theme: WordTheme, level: string | number, questionIds: string[]) {
  const assetsById = new Map(getLevelAssets(theme, level).map((asset) => [asset.id, asset]));

  return questionIds.flatMap((id) => {
    const asset = assetsById.get(id);

    return asset ? [asset] : [];
  });
}

function shuffleItems<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function withLetterBanks(assets: WordAsset[]): WordGameQuestion[] {
  return assets.map((asset) => ({
    ...asset,
    letters: createLetterBank(asset.answer),
  }));
}

function createWordAsset(theme: WordTheme, level: WordLevel, name: string): WordAsset {
  return {
    id: `${theme}:${level}:${name.toLowerCase()}`,
    theme,
    level,
    name,
    answer: name.toUpperCase(),
    image: `/${themeFolders[theme]}/Level_${level}/${name}.png`,
  };
}

function createLetterBank(answer: string): GameLetter[] {
  const answerLetters = answer.split("");
  const distractors = alphabet.filter((letter) => !answerLetters.includes(letter));
  const targetLength = Math.max(12, answerLetters.length + 8);
  const letters = [...answerLetters];

  for (let index = 0; letters.length < targetLength; index += 1) {
    const answerSeed = answer.charCodeAt(index % answer.length);
    letters.push(distractors[(answerSeed + index * 5) % distractors.length]);
  }

  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swapIndex = (answer.charCodeAt(index % answer.length) + index * 7) % (index + 1);
    [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
  }

  return letters.map((value, index) => ({
    id: `${answer}-${value}-${index}`,
    value,
  }));
}

function normalizeLevel(level: string | number): WordLevel {
  const parsedLevel = Number(level);

  if (parsedLevel === 2 || parsedLevel === 3) {
    return parsedLevel;
  }

  return 1;
}
