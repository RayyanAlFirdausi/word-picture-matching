export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";
export const localeCookieName = "wpm-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "id" || value === "en";
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export const dictionaries = {
  id: {
    common: {
      back: "KEMBALI",
      select: "PILIH",
      play: "MAIN",
      next: "BERIKUTNYA",
      previous: "SEBELUMNYA",
      seeResult: "LIHAT HASIL",
      checkAnswer: "CEK JAWABAN",
      hint: "Bantuan",
      removeAll: "HAPUS SEMUA",
      repeat: "ULANGI",
      backToLevels: "Kembali ke Level",
    },
    home: {
      gamesLabel: "Pilihan permainan",
      language: "Bahasa",
      english: "English",
      indonesian: "Indonesia",
      categoryAria: (title: string) => `Pilih kategori ${title}`,
    },
    levels: {
      collectionAria: "Buka koleksi kata",
      listAria: (title: string) => `Daftar level ${title}`,
      lockedLevel: "Level terkunci",
      stars: (earned: number) => `${earned} dari 3 bintang`,
      level: (level: number | string) => `Level ${level}`,
    },
    collection: {
      title: "Koleksi Kataku",
      gridAria: "Koleksi kata",
      lockedAlt: "Item koleksi belum terbuka",
    },
    instruction: {
      guessImage: "Tebak nama gambar yang muncul",
      arrangeWord: "Susun menjadi kata yang benar",
      checkButtonDemo: "CEK JAWABAN!",
      clickCheck: "Klik tombol cek jawaban!",
      close: "TUTUP",
      play: "MAIN!",
    },
    game: {
      level: (level: string | number) => `Level ${level}`,
      livesRemaining: (lives: number) => `${lives} nyawa tersisa`,
      answerLetters: (count: number) => `${count} huruf jawaban`,
      questionProgress: (current: number, total: number) => `${current} dari ${total} soal`,
      letterChoices: "Pilihan huruf",
      chooseLetter: (letter: string) => `Pilih huruf ${letter}`,
      correctTitle: "Jawaban benar!",
      correctDescription: "Silakan klik tombol berikutnya.",
      wrongTitle: "Jawaban salah!",
      wrongDescription: "Coba periksa lagi!",
    },
    recovery: {
      progress: (current: number, total: number) => `Soal ${current} dari ${total} soal`,
      prompt: "Apa kata bahasa Inggris yang tepat untuk gambar ini?",
      correctTitle: "Jawaban benar!",
      correctDescription: "+1 nyawa dipulihkan",
      wrongTitle: "Jawaban salah!",
      correctAnswerIs: (answer: string) => `Jawaban yang benar adalah "${answer}"`,
      emptyLivesTitle: "NYAWA HABIS",
      intro: "Jawab 3 soal pilihan ganda untuk memulihkan nyawamu.",
      miniQuiz: "Kuis Mini - Pemulihan Nyawa",
      questionLife: (question: number) => `Soal ${question} = 1 nyawa`,
      startQuiz: "MULAI KUIS",
      next: "BERIKUTNYA",
      seeResult: "LIHAT HASIL",
      resultTitle: (correct: number, total: number) => `Benar ${correct} dari ${total} soal`,
      livesRestored: (lives: number) => `${lives} nyawa berhasil dipulihkan!`,
      continuePlaying: "LANJUT MAIN",
    },
    congratulations: {
      perfectTitle: "SELAMAT!!!",
      perfectDescription: "Hebat! Kamu menjawab semua soal dengan benar!",
      greatTitle: "BAGUS SEKALI!",
      greatDescription: "Hampir sempurna! Tinggal sedikit lagi untuk lebih baik.",
      retryTitle: "AYO COBA LAGI!",
      retryDescription: "Jangan menyerah! Ulangi level ini dan kamu pasti bisa lebih baik.",
      failTitle: "OOPS, COBA LAGI YA!",
      failDescription: "Nyawa habis. Yuk belajar dari kesalahan dan coba lagi!",
      stars: (earned: number) => `${earned} dari 3 bintang`,
      score: (correct: number, total: number) => `${correct} dari ${total} soal benar!`,
    },
  },
  en: {
    common: {
      back: "BACK",
      select: "SELECT",
      play: "PLAY",
      next: "NEXT",
      previous: "PREVIOUS",
      seeResult: "SEE RESULT",
      checkAnswer: "CHECK ANSWER",
      hint: "Hint",
      removeAll: "REMOVE ALL",
      repeat: "REPEAT",
      backToLevels: "Back to levels",
    },
    home: {
      gamesLabel: "Game choices",
      language: "Language",
      english: "English",
      indonesian: "Indonesia",
      categoryAria: (title: string) => `Choose ${title} category`,
    },
    levels: {
      collectionAria: "Open word collection",
      listAria: (title: string) => `${title} level list`,
      lockedLevel: "Level locked",
      stars: (earned: number) => `${earned} of 3 stars`,
      level: (level: number | string) => `Level ${level}`,
    },
    collection: {
      title: "My Collection of Words",
      gridAria: "Word collection",
      lockedAlt: "Locked collection item",
    },
    instruction: {
      guessImage: "Guess the name of the image that appears",
      arrangeWord: "Arrange into the correct word",
      checkButtonDemo: "CHECK ANSWER!",
      clickCheck: "Click the check button!",
      close: "CLOSE",
      play: "PLAY!",
    },
    game: {
      level: (level: string | number) => `Level ${level}`,
      livesRemaining: (lives: number) => `${lives} lives remaining`,
      answerLetters: (count: number) => `${count} answer letters`,
      questionProgress: (current: number, total: number) => `${current} of ${total} questions`,
      letterChoices: "Letter choices",
      chooseLetter: (letter: string) => `Choose letter ${letter}`,
      correctTitle: "Correct answer!",
      correctDescription: "Please click the next button.",
      wrongTitle: "Incorrect answer!",
      wrongDescription: "Please check again!",
    },
    recovery: {
      progress: (current: number, total: number) => `Question ${current} of ${total}`,
      prompt: "What is the correct English word for this picture?",
      correctTitle: "Correct answer!",
      correctDescription: "+1 life restored",
      wrongTitle: "Incorrect answer!",
      correctAnswerIs: (answer: string) => `The correct answer is "${answer}"`,
      emptyLivesTitle: "OUT OF LIVES",
      intro: "Answer 3 multiple choice questions to restore your life.",
      miniQuiz: "Mini Quiz - Health Recovery",
      questionLife: (question: number) => `Question ${question} = 1 life`,
      startQuiz: "START QUIZ",
      next: "NEXT",
      seeResult: "SEE RESULT",
      resultTitle: (correct: number, total: number) => `Correct ${correct} of ${total} questions`,
      livesRestored: (lives: number) => lives === 1 ? "1 life has been successfully restored!" : `${lives} lives have been successfully restored!`,
      continuePlaying: "CONTINUE PLAYING",
    },
    congratulations: {
      perfectTitle: "CONGRATULATION!!!",
      perfectDescription: "Amazing! You answered all the questions correctly!",
      greatTitle: "GREAT JOB!",
      greatDescription: "You're almost perfect! There's just a little bit that can be improved.",
      retryTitle: "LET'S TRY AGAIN!",
      retryDescription: "Don't give up! Retry this level and you can definitely do better.",
      failTitle: "OOPS, TRY AGAIN!",
      failDescription: "Out of lives. Let's learn from mistakes and try again!",
      stars: (earned: number) => `${earned} of 3 stars`,
      score: (correct: number, total: number) => `${correct} of ${total} questions correct!`,
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
