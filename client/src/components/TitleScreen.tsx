/**
 * TitleScreen - タイトル画面
 * Design: ダークアーケード・レトロフューチャー
 * - 深い宇宙黒の背景
 * - Orbitronフォントによる宇宙SF感
 * - ネオンカラーのアクセント
 */

import { useState } from 'react';
import { Difficulty, Song } from '@/lib/types';

interface TitleScreenProps {
  song: Song;
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'EASY', color: '#44CC88', glow: 'rgba(68,204,136,0.4)', level: 2 },
  normal: { label: 'NORMAL', color: '#4488FF', glow: 'rgba(68,136,255,0.4)', level: 5 },
  hard: { label: 'HARD', color: '#FF4444', glow: 'rgba(255,68,68,0.4)', level: 8 },
} as const;

export default function TitleScreen({ song, onStart }: TitleScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('normal');

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
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

      {/* 背景の光の柱 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-px h-full opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent, #FF4444, transparent)' }}
        />
        <div
          className="absolute top-0 right-1/4 w-px h-full opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent, #4488FF, transparent)' }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        
        {/* タイトル */}
        <div className="text-center">
          <h1
            className="text-5xl sm:text-7xl font-black tracking-widest mb-2"
            style={{
              fontFamily: '"Orbitron", monospace',
              background: 'linear-gradient(135deg, #FF4444 0%, #FF8888 30%, #FFFFFF 50%, #88AAFF 70%, #4488FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255,100,100,0.3))',
            }}
          >
            TAIKO
          </h1>
          <h1
            className="text-5xl sm:text-7xl font-black tracking-widest"
            style={{
              fontFamily: '"Orbitron", monospace',
              background: 'linear-gradient(135deg, #4488FF 0%, #88AAFF 30%, #FFFFFF 50%, #FF8888 70%, #FF4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(100,100,255,0.3))',
            }}
          >
            BEAT
          </h1>
          <p
            className="text-xs tracking-[0.4em] mt-3 opacity-60"
            style={{ fontFamily: '"Orbitron", monospace', color: '#8888AA' }}
          >
            ORIGINAL RHYTHM GAME
          </p>
        </div>

        {/* 曲情報 */}
        <div
          className="w-full rounded-lg p-4 text-center"
          style={{
            background: 'rgba(20, 20, 50, 0.8)',
            border: '1px solid rgba(80, 80, 180, 0.3)',
            boxShadow: '0 0 20px rgba(60, 60, 160, 0.2)',
          }}
        >
          <p
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: '"Orbitron", monospace' }}
          >
            {song.title}
          </p>
          <p className="text-sm opacity-60" style={{ color: '#8888AA', fontFamily: '"Noto Sans JP", sans-serif' }}>
            {song.artist} · BPM {song.bpm}
          </p>
        </div>

        {/* 難易度選択 */}
        <div className="w-full">
          <p
            className="text-center text-xs tracking-[0.3em] mb-3 opacity-50"
            style={{ fontFamily: '"Orbitron", monospace', color: '#8888AA' }}
          >
            SELECT DIFFICULTY
          </p>
          <div className="flex gap-3">
            {difficulties.map((diff) => {
              const config = DIFFICULTY_CONFIG[diff];
              const isSelected = selected === diff;
              const levelStars = song.difficulties[diff].level;
              
              return (
                <button
                  key={diff}
                  onClick={() => setSelected(diff)}
                  className="flex-1 py-4 rounded-lg transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${config.color}22 0%, ${config.color}11 100%)`
                      : 'rgba(15, 15, 35, 0.8)',
                    border: isSelected
                      ? `2px solid ${config.color}`
                      : '2px solid rgba(60, 60, 100, 0.4)',
                    boxShadow: isSelected ? `0 0 20px ${config.glow}` : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div
                    className="text-sm font-black tracking-wider mb-1"
                    style={{
                      fontFamily: '"Orbitron", monospace',
                      color: isSelected ? config.color : '#666688',
                    }}
                  >
                    {config.label}
                  </div>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: i < levelStars
                            ? (isSelected ? config.color : '#555577')
                            : 'rgba(60,60,80,0.4)',
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="text-xs opacity-60"
                    style={{ color: isSelected ? config.color : '#555577', fontFamily: '"Share Tech Mono", monospace' }}
                  >
                    Lv.{levelStars}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* スタートボタン */}
        <button
          onClick={() => onStart(selected)}
          className="w-full py-5 rounded-lg font-black text-xl tracking-[0.3em] transition-all duration-200 relative overflow-hidden group"
          style={{
            fontFamily: '"Orbitron", monospace',
            background: 'linear-gradient(135deg, rgba(255,68,68,0.2) 0%, rgba(68,136,255,0.2) 100%)',
            border: '2px solid rgba(180, 100, 100, 0.6)',
            color: '#FFFFFF',
            boxShadow: '0 0 30px rgba(180, 80, 80, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 80, 80, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 120, 120, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(180, 80, 80, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(180, 100, 100, 0.6)';
          }}
        >
          ▶ START
        </button>

        {/* 操作説明 */}
        <div
          className="w-full rounded-lg p-4"
          style={{
            background: 'rgba(15, 15, 35, 0.6)',
            border: '1px solid rgba(60, 60, 100, 0.3)',
          }}
        >
          <p
            className="text-center text-xs tracking-[0.2em] mb-3 opacity-50"
            style={{ fontFamily: '"Orbitron", monospace', color: '#8888AA' }}
          >
            HOW TO PLAY
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.5)', color: '#FF8888' }}>F</kbd>
                <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.5)', color: '#FF8888' }}>J</kbd>
              </div>
              <span style={{ color: '#FF8888', fontFamily: '"Noto Sans JP", sans-serif' }}>ドン（赤）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(68,136,255,0.2)', border: '1px solid rgba(68,136,255,0.5)', color: '#88AAFF' }}>D</kbd>
                <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(68,136,255,0.2)', border: '1px solid rgba(68,136,255,0.5)', color: '#88AAFF' }}>K</kbd>
              </div>
              <span style={{ color: '#88AAFF', fontFamily: '"Noto Sans JP", sans-serif' }}>カッ（青）</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(60,60,100,0.3)', border: '1px solid rgba(100,100,160,0.4)', color: '#AAAACC' }}>ESC</kbd>
              <span style={{ color: '#AAAACC', fontFamily: '"Noto Sans JP", sans-serif' }}>一時停止</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'rgba(60,60,100,0.3)', border: '1px solid rgba(100,100,160,0.4)', color: '#AAAACC' }}>Enter</kbd>
              <span style={{ color: '#AAAACC', fontFamily: '"Noto Sans JP", sans-serif' }}>スタート</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-center opacity-40" style={{ color: '#8888AA', fontFamily: '"Noto Sans JP", sans-serif' }}>
              スマホ: 画面下のDON/KAボタンをタップ
            </p>
          </div>
          {/* 判定幅 */}
          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }} />
              <span style={{ color: '#FFD700', fontFamily: '"Share Tech Mono", monospace' }}>PERFECT ±45ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#00FF88' }} />
              <span style={{ color: '#00FF88', fontFamily: '"Share Tech Mono", monospace' }}>GREAT ±90ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#88AAFF' }} />
              <span style={{ color: '#88AAFF', fontFamily: '"Share Tech Mono", monospace' }}>GOOD ±135ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#FF6666' }} />
              <span style={{ color: '#FF6666', fontFamily: '"Share Tech Mono", monospace' }}>MISS それ以上</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
