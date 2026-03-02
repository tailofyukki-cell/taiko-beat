/**
 * GameEngine - ゲームロジック管理
 * 判定・スコア・コンボ計算を担当
 */

import {
  Note, Chart, GameScore, JudgeResult, JudgeType, NoteType,
  JUDGE_WINDOWS, SCORE_CONFIG
} from './types';

export class GameEngine {
  private chart: Chart | null = null;
  private notes: Note[] = [];
  private score: GameScore = this.initScore();
  private lastJudge: JudgeResult | null = null;
  private lastJudgeTime: number = 0;

  private initScore(): GameScore {
    return { score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, miss: 0 };
  }

  loadChart(chart: Chart): void {
    this.chart = chart;
    // ノーツをディープコピー（hit/missedフラグをリセット）
    this.notes = chart.notes.map(n => ({ ...n, hit: false, missed: false }));
    this.score = this.initScore();
    this.lastJudge = null;
  }

  /**
   * ゲーム内時間(ms)に基づいてMissノーツを処理
   * offsetを加算した絶対時間で比較
   */
  updateMisses(gameTimeMs: number): void {
    if (!this.chart) return;
    const absoluteTime = gameTimeMs - this.chart.offset;
    
    for (const note of this.notes) {
      if (!note.hit && !note.missed) {
        if (absoluteTime > note.time + JUDGE_WINDOWS.good) {
          note.missed = true;
          this.score.miss++;
          this.score.combo = 0;
          this.lastJudge = { type: 'miss', noteType: note.type, timeDiff: 0 };
          this.lastJudgeTime = Date.now();
        }
      }
    }
  }

  /**
   * 入力を処理して判定を返す
   */
  processInput(noteType: NoteType, gameTimeMs: number): JudgeResult | null {
    if (!this.chart) return null;
    const absoluteTime = gameTimeMs - this.chart.offset;
    
    // 判定ウィンドウ内で最も近いノーツを探す
    let bestNote: Note | null = null;
    let bestDiff = Infinity;
    
    for (const note of this.notes) {
      if (note.hit || note.missed) continue;
      if (note.type !== noteType) continue;
      
      const diff = Math.abs(absoluteTime - note.time);
      if (diff <= JUDGE_WINDOWS.good && diff < bestDiff) {
        bestDiff = diff;
        bestNote = note;
      }
    }
    
    if (!bestNote) return null;
    
    // 判定種別を決定
    let judgeType: JudgeType;
    if (bestDiff <= JUDGE_WINDOWS.perfect) {
      judgeType = 'perfect';
    } else if (bestDiff <= JUDGE_WINDOWS.great) {
      judgeType = 'great';
    } else {
      judgeType = 'good';
    }
    
    // ノーツをヒット済みにする
    bestNote.hit = true;
    
    // スコア更新
    this.score.combo++;
    if (this.score.combo > this.score.maxCombo) {
      this.score.maxCombo = this.score.combo;
    }
    
    const baseScore = SCORE_CONFIG[judgeType];
    const bonus = Math.floor(this.score.combo * SCORE_CONFIG.comboBonus);
    this.score.score += baseScore + bonus;
    this.score[judgeType]++;
    
    const result: JudgeResult = {
      type: judgeType,
      noteType,
      timeDiff: absoluteTime - bestNote.time,
    };
    this.lastJudge = result;
    this.lastJudgeTime = Date.now();
    
    return result;
  }

  /**
   * 表示用ノーツを返す（画面外のものを除く）
   * gameTimeMsはoffset込みの絶対時間
   */
  getVisibleNotes(gameTimeMs: number, lookAheadMs: number = 2500): Note[] {
    if (!this.chart) return [];
    const absoluteTime = gameTimeMs - this.chart.offset;
    
    return this.notes.filter(note => {
      if (note.hit || note.missed) return false;
      const timeDiff = note.time - absoluteTime;
      return timeDiff > -JUDGE_WINDOWS.good && timeDiff < lookAheadMs;
    });
  }

  getScore(): GameScore {
    return { ...this.score };
  }

  getLastJudge(): JudgeResult | null {
    // 500ms後にクリア
    if (this.lastJudge && Date.now() - this.lastJudgeTime > 500) {
      this.lastJudge = null;
    }
    return this.lastJudge;
  }

  isFinished(gameTimeMs: number): boolean {
    if (!this.chart) return false;
    const absoluteTime = gameTimeMs - this.chart.offset;
    
    // 全ノーツが処理済みかチェック
    const remaining = this.notes.filter(n => !n.hit && !n.missed);
    if (remaining.length === 0) return true;
    
    // 最後のノーツから2秒後
    const lastNoteTime = Math.max(...this.notes.map(n => n.time));
    return absoluteTime > lastNoteTime + 2000;
  }

  getTotalNotes(): number {
    return this.notes.length;
  }

  getProcessedNotes(): number {
    return this.notes.filter(n => n.hit || n.missed).length;
  }
}
