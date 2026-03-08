const SCORES_KEY = 'glider-gauntlet-scores';
const PROGRESSION_KEY = 'glider-gauntlet-progression';

export interface ScoreEntry {
  score: number;
  date: string;
}

export interface LevelScores {
  [levelId: number]: ScoreEntry[];
}

export interface Progression {
  unlockedLevels: number[];
  completedLevels: number[];
}

function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function loadScores(): LevelScores {
  return safeParseJSON<LevelScores>(localStorage.getItem(SCORES_KEY), {});
}

export function saveScore(levelId: number, score: number): boolean {
  const scores = loadScores();
  const levelScores = scores[levelId] ?? [];
  const entry: ScoreEntry = { score, date: new Date().toISOString() };

  levelScores.push(entry);
  levelScores.sort((a, b) => b.score - a.score);
  scores[levelId] = levelScores.slice(0, 10);

  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));

  // Return true if this is a new #1 record
  return scores[levelId][0].date === entry.date && scores[levelId][0].score === entry.score;
}

export function getTopScores(levelId: number): ScoreEntry[] {
  const scores = loadScores();
  return scores[levelId] ?? [];
}

export function loadProgression(): Progression {
  return safeParseJSON<Progression>(
    localStorage.getItem(PROGRESSION_KEY),
    { unlockedLevels: [1], completedLevels: [] },
  );
}

export function completeLevel(levelId: number): void {
  const prog = loadProgression();
  if (!prog.completedLevels.includes(levelId)) {
    prog.completedLevels.push(levelId);
  }
  const nextLevel = levelId + 1;
  if (!prog.unlockedLevels.includes(nextLevel)) {
    prog.unlockedLevels.push(nextLevel);
  }
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(prog));
}

export function isLevelUnlocked(levelId: number): boolean {
  return loadProgression().unlockedLevels.includes(levelId);
}

export function isLevelCompleted(levelId: number): boolean {
  return loadProgression().completedLevels.includes(levelId);
}
