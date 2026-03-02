/**
 * ResultScreen - リザルト画面
 * Design: ダークアーケード・レトロフューチャー
 */

import { GameScore, Difficulty, Song } from '@/lib/types';

interface ResultScreenProps {
  score: GameScore;
  difficulty: Difficulty;
  song: Song;
  totalNotes: number;
  onRetry: () => void;
  onTitle: () => void;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#44CC88',
  normal: '#4488FF',
  hard: '#FF4444',
};

function getRank(score: GameScore, totalNotes: number): { rank: string; color: string } {
  const accuracy = totalNotes > 0
    ? (score.perfect * 2 + score.great * 1.5 + score.good) / (totalNotes * 2)
    : 0;
  
  if (accuracy >= 0.98 && score.miss === 0) return { rank: 'S+', color: '#FFD700' };
  if (accuracy >= 0.95) return { rank: 'S', color: '#FFD700' };
  if (accuracy >= 0.90) return { rank: 'A', color: '#FF8844' };
  if (accuracy >= 0.80) return { rank: 'B', color: '#44CC88' };
  if (accuracy >= 0.70) return { rank: 'C', color: '#4488FF' };
  return { rank: 'D', color: '#FF4444' };
}

export default function ResultScreen({
  score,
  difficulty,
  song,
  totalNotes,
  onRetry,
  onTitle,
}: ResultScreenProps) {
  const diffColor = DIFF_COLORS[difficulty];
  const { rank, color: rankColor } = getRank(score, totalNotes);
  const accuracy = totalNotes > 0
    ? ((score.perfect + score.great * 0.75 + score.good * 0.5) / totalNotes * 100).toFixed(1)
    : '0.0';

  const judgeItems = [
    { label: 'PERFECT', count: score.perfect, color: '#FFD700' },
    { label: 'GREAT', count: score.great, color: '#00FF88' },
    { label: 'GOOD', count: score.good, color: '#88AAFF' },
    { label: 'MISS', count: score.miss, color: '#FF6666' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a15 50%, #0d0d1a 100%)' }}
    >
      {/* 背景グリッド */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(80,80,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80,80,200,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        
        {/* ヘッダー */}
        <div className="text-center">
          <h2
            className="text-3xl font-black tracking-[0.3em] mb-1"
            style={{ fontFamily: '"Orbitron", monospace', color: '#CCCCEE' }}
          >
            RESULT
          </h2>
          <p className="text-sm opacity-50" style={{ color: '#8888AA', fontFamily: '"Noto Sans JP", sans-serif' }}>
            {song.title} · <span style={{ color: diffColor }}>{difficulty.toUpperCase()}</span>
          </p>
        </div>

        {/* ランク + スコア */}
        <div
          className="rounded-xl p-6 flex items-center gap-6"
          style={{
            background: 'rgba(15, 15, 35, 0.9)',
            border: `1px solid ${rankColor}44`,
            boxShadow: `0 0 30px ${rankColor}22`,
          }}
        >
          {/* ランク */}
          <div
            className="text-7xl font-black w-24 text-center shrink-0"
            style={{
              fontFamily: '"Orbitron", monospace',
              color: rankColor,
              textShadow: `0 0 20px ${rankColor}`,
            }}
          >
            {rank}
          </div>
          
          {/* スコア詳細 */}
          <div className="flex-1">
            <div
              className="text-3xl font-black tabular-nums mb-1"
              style={{ fontFamily: '"Share Tech Mono", monospace', color: '#EEEEFF' }}
            >
              {score.score.toLocaleString()}
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="opacity-40 text-xs" style={{ color: '#8888AA', fontFamily: '"Orbitron", monospace' }}>MAX COMBO</span>
                <div
                  className="font-bold tabular-nums"
                  style={{ fontFamily: '"Share Tech Mono", monospace', color: '#FFAA44' }}
                >
                  {score.maxCombo}
                </div>
              </div>
              <div>
                <span className="opacity-40 text-xs" style={{ color: '#8888AA', fontFamily: '"Orbitron", monospace' }}>ACCURACY</span>
                <div
                  className="font-bold tabular-nums"
                  style={{ fontFamily: '"Share Tech Mono", monospace', color: '#44DDAA' }}
                >
                  {accuracy}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 判定内訳 */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'rgba(15, 15, 35, 0.8)',
            border: '1px solid rgba(60, 60, 100, 0.3)',
          }}
        >
          <p
            className="text-xs tracking-[0.3em] mb-4 opacity-40"
            style={{ fontFamily: '"Orbitron", monospace', color: '#8888AA' }}
          >
            JUDGE BREAKDOWN
          </p>
          <div className="grid grid-cols-2 gap-3">
            {judgeItems.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <div className="flex-1 flex justify-between items-center">
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: '"Orbitron", monospace', color }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-base font-black tabular-nums"
                    style={{ fontFamily: '"Share Tech Mono", monospace', color: '#CCCCEE' }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* プログレスバー（ノーツ割合） */}
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(40, 40, 80, 0.6)' }}>
            {totalNotes > 0 && (() => {
              const pPct = (score.perfect / totalNotes) * 100;
              const grPct = (score.great / totalNotes) * 100;
              const goPct = (score.good / totalNotes) * 100;
              const mPct = (score.miss / totalNotes) * 100;
              return (
                <div className="h-full flex">
                  <div style={{ width: `${pPct}%`, background: '#FFD700' }} />
                  <div style={{ width: `${grPct}%`, background: '#00FF88' }} />
                  <div style={{ width: `${goPct}%`, background: '#88AAFF' }} />
                  <div style={{ width: `${mPct}%`, background: '#FF6666' }} />
                </div>
              );
            })()}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onTitle}
            className="flex-1 py-4 rounded-lg font-bold tracking-wider transition-all"
            style={{
              fontFamily: '"Orbitron", monospace',
              background: 'rgba(20, 20, 50, 0.8)',
              border: '2px solid rgba(80, 80, 160, 0.4)',
              color: '#8888AA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(120, 120, 200, 0.6)';
              e.currentTarget.style.color = '#AAAACC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(80, 80, 160, 0.4)';
              e.currentTarget.style.color = '#8888AA';
            }}
          >
            ⌂ TITLE
          </button>
          <button
            onClick={onRetry}
            className="flex-2 flex-1 py-4 rounded-lg font-bold tracking-wider transition-all"
            style={{
              fontFamily: '"Orbitron", monospace',
              background: 'linear-gradient(135deg, rgba(255,68,68,0.2) 0%, rgba(68,136,255,0.2) 100%)',
              border: '2px solid rgba(180, 100, 100, 0.6)',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 80, 80, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 120, 120, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(180, 100, 100, 0.6)';
            }}
          >
            ↺ RETRY
          </button>
        </div>
      </div>
    </div>
  );
}
