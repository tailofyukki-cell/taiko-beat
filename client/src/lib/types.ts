// ゲームの型定義

export type NoteType = 'don' | 'ka';
export type JudgeType = 'perfect' | 'great' | 'good' | 'miss' | null;
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameState = 'title' | 'playing' | 'paused' | 'result';

export interface Note {
  time: number;   // ms (offset後の相対時間)
  type: NoteType;
  hit?: boolean;
  missed?: boolean;
}

export interface Chart {
  songId: string;
  difficulty: Difficulty;
  level: number;
  bpm: number;
  offset: number;  // ms
  notes: Note[];
}

export interface SongDifficulty {
  level: number;
  chart: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  bgm_ogg: string;
  bgm_mp3: string;
  difficulties: {
    easy: SongDifficulty;
    normal: SongDifficulty;
    hard: SongDifficulty;
  };
}

export interface JudgeResult {
  type: JudgeType;
  noteType: NoteType;
  timeDiff: number;
}

export interface GameScore {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
}

// 判定ウィンドウ (ms)
export const JUDGE_WINDOWS = {
  perfect: 45,
  great: 90,
  good: 135,
} as const;

// スコア設定
export const SCORE_CONFIG = {
  perfect: 1000,
  great: 500,
  good: 100,
  miss: 0,
  comboBonus: 10,  // combo * comboBonus が加算
} as const;
