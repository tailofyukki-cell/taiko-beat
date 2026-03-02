/**
 * PlayScreen - ゲームプレイ画面
 * Design: ダークアーケード・レトロフューチャー
 */

import { useEffect, useCallback, useState } from 'react';
import GameCanvas from './GameCanvas';
import { GameEngine } from '@/lib/gameEngine';
import { AudioManager } from '@/lib/audioManager';
import { GameScore, JudgeResult, Difficulty } from '@/lib/types';

interface PlayScreenProps {
  engine: GameEngine;
  difficulty: Difficulty;
  score: GameScore;
  offset: number;
  totalNotes: number;
  onJudge: (result: JudgeResult) => void;
  onFinish: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#44CC88',
  normal: '#4488FF',
  hard: '#FF4444',
};

export default function PlayScreen({
  engine,
  difficulty,
  score,
  offset,
  totalNotes,
  onJudge,
  onFinish,
  onPause,
  onResume,
  isPaused,
}: PlayScreenProps) {
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const handlePause = useCallback(() => {
    setShowPauseMenu(true);
    onPause();
  }, [onPause]);

  const handleResume = useCallback(() => {
    setShowPauseMenu(false);
    onResume();
  }, [onResume]);

  // ESCキーでポーズ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPaused) {
          handleResume();
        } else {
          handlePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, handlePause, handleResume]);

  const diffColor = DIFF_COLORS[difficulty];

  return (
    <div
      className="flex flex-col"
      style={{ background: '#0d0d1a', height: '100dvh', overflow: 'hidden' }}
    >
      {/* ヘッダー HUD */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{
          background: 'rgba(10, 10, 25, 0.95)',
          borderBottom: '1px solid rgba(60, 60, 100, 0.4)',
        }}
      >
        {/* 左: タイトル・難易度 */}
        <div className="flex items-center gap-3">
          <span
            className="text-base font-black tracking-wider"
            style={{ fontFamily: '"Orbitron", monospace', color: '#CCCCEE' }}
          >
            TAIKO BEAT
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              fontFamily: '"Orbitron", monospace',
              color: diffColor,
              border: `1px solid ${diffColor}66`,
              background: `${diffColor}11`,
            }}
          >
            {difficulty.toUpperCase()}
          </span>
        </div>

        {/* 中央: スコア・コンボ */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div
              className="text-2xl font-black tabular-nums"
              style={{ fontFamily: '"Share Tech Mono", monospace', color: '#EEEEFF' }}
            >
              {score.score.toLocaleString()}
            </div>
            <div className="text-xs opacity-40" style={{ color: '#8888AA', fontFamily: '"Orbitron", monospace' }}>
              SCORE
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-black tabular-nums"
              style={{
                fontFamily: '"Share Tech Mono", monospace',
                color: score.combo >= 50 ? '#FFD700' : score.combo >= 20 ? '#FF8844' : '#EEEEFF',
                textShadow: score.combo >= 20 ? `0 0 10px ${score.combo >= 50 ? '#FFD700' : '#FF8844'}` : 'none',
              }}
            >
              {score.combo}
            </div>
            <div className="text-xs opacity-40" style={{ color: '#8888AA', fontFamily: '"Orbitron", monospace' }}>
              COMBO
            </div>
          </div>
        </div>

        {/* 右: ポーズボタン */}
        <button
          onClick={handlePause}
          className="px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-all"
          style={{
            fontFamily: '"Orbitron", monospace',
            color: '#AAAACC',
            border: '1px solid rgba(100, 100, 160, 0.4)',
            background: 'rgba(20, 20, 50, 0.6)',
          }}
        >
          ⏸ PAUSE
        </button>
      </div>

      {/* ゲームキャンバス */}
      <div className="flex-1 relative" style={{ minHeight: 0, overflow: 'hidden' }}>
        <GameCanvas
          engine={engine}
          isPlaying={true}
          isPaused={isPaused}
          offset={offset}
          onJudge={onJudge}
          onFinish={onFinish}
          totalNotes={totalNotes}
        />
      </div>

      {/* ポーズメニュー */}
      {showPauseMenu && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-6 w-72"
            style={{
              background: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(80, 80, 180, 0.4)',
              boxShadow: '0 0 40px rgba(60, 60, 160, 0.3)',
            }}
          >
            <h2
              className="text-2xl font-black tracking-widest"
              style={{ fontFamily: '"Orbitron", monospace', color: '#CCCCEE' }}
            >
              PAUSED
            </h2>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-lg font-bold tracking-wider transition-all"
                style={{
                  fontFamily: '"Orbitron", monospace',
                  background: 'linear-gradient(135deg, rgba(68,136,255,0.3) 0%, rgba(68,68,200,0.3) 100%)',
                  border: '2px solid rgba(68,136,255,0.6)',
                  color: '#88AAFF',
                }}
              >
                ▶ RESUME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
