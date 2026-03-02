/**
 * GameCanvas - ゲームのCanvas描画コンポーネント
 * Design: ダークアーケード・レトロフューチャー
 */

import { useEffect, useRef, useCallback } from 'react';
import { Renderer } from '@/lib/renderer';
import { GameEngine } from '@/lib/gameEngine';
import { AudioManager } from '@/lib/audioManager';
import { JudgeResult, NoteType } from '@/lib/types';

interface GameCanvasProps {
  engine: GameEngine;
  isPlaying: boolean;
  isPaused: boolean;
  offset: number;
  onJudge?: (result: JudgeResult) => void;
  onFinish?: () => void;
  totalNotes: number;
}

export default function GameCanvas({
  engine,
  isPlaying,
  isPaused,
  offset,
  onJudge,
  onFinish,
  totalNotes,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animFrameRef = useRef<number>(0);
  const hitTypeRef = useRef<'don' | 'ka' | null>(null);
  const hitTimeRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);

  // Canvasリサイズ
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (rendererRef.current) {
      rendererRef.current.updateLayout();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rendererRef.current = new Renderer(canvas);
    resizeCanvas();
    
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  // ゲームループ
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }
    
    finishedRef.current = false;
    
    const loop = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      
      if (isPaused) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      
      const gameTimeMs = AudioManager.getGameTimeMs();
      
      // Miss判定更新
      engine.updateMisses(gameTimeMs);
      
      // 描画
      renderer.clear();
      renderer.drawLane();
      
      // 判定円のパルス計算
      const now = Date.now();
      const elapsed = now - hitTimeRef.current;
      if (elapsed < 200) {
        pulseRef.current = Math.max(0, 1 - elapsed / 200);
      } else {
        pulseRef.current = 0;
        hitTypeRef.current = null;
      }
      
      renderer.drawJudgeCircle(hitTypeRef.current, pulseRef.current);
      
      // ノーツ描画
      const visibleNotes = engine.getVisibleNotes(gameTimeMs);
      for (const note of visibleNotes) {
        renderer.drawNote(note, gameTimeMs, offset);
      }
      
      // 判定テキスト
      renderer.drawJudgeText(engine.getLastJudge());
      
      // パーティクル
      renderer.updateAndDrawParticles();
      
      // 進捗バー
      const processed = engine.getProcessedNotes();
      const progress = totalNotes > 0 ? processed / totalNotes : 0;
      renderer.drawProgressBar(progress);
      
      // 終了判定
      if (!finishedRef.current && engine.isFinished(gameTimeMs)) {
        finishedRef.current = true;
        onFinish?.();
        return;
      }
      
      animFrameRef.current = requestAnimationFrame(loop);
    };
    
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, isPaused, engine, offset, onFinish, totalNotes]);

  // 入力処理
  const handleInput = useCallback((noteType: NoteType) => {
    if (!isPlaying || isPaused) return;
    
    const gameTimeMs = AudioManager.getGameTimeMs();
    const result = engine.processInput(noteType, gameTimeMs);
    
    // SE再生
    if (noteType === 'don') {
      AudioManager.playDon();
    } else {
      AudioManager.playKa();
    }
    
    // ヒットエフェクト
    hitTypeRef.current = noteType;
    hitTimeRef.current = Date.now();
    
    // パーティクル
    if (result && rendererRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const renderer = rendererRef.current;
        const judgeX = Math.min(160, canvas.width * 0.18);
        const laneY = canvas.height * 0.5;
        renderer.addParticles(judgeX, laneY, noteType, result.type);
      }
    }
    
    if (result) {
      onJudge?.(result);
    }
  }, [isPlaying, isPaused, engine, onJudge]);

  // キーボード入力
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key.toLowerCase()) {
        case 'f':
        case 'j':
          handleInput('don');
          break;
        case 'd':
        case 'k':
          handleInput('ka');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  return (
    <div className="relative w-full h-full" style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
      {/* タッチボタン（スマホ用） */}
      <div className="absolute bottom-0 left-0 right-0 flex h-16 sm:h-20">
        <button
          className="flex-1 flex items-center justify-center text-white font-bold text-lg tracking-widest select-none active:opacity-70 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, rgba(200,40,40,0.85) 0%, rgba(140,20,20,0.9) 100%)',
            borderTop: '2px solid rgba(255,120,120,0.5)',
            borderRight: '1px solid rgba(255,80,80,0.3)',
          }}
          onPointerDown={(e) => { e.preventDefault(); handleInput('don'); }}
        >
          <span style={{ fontFamily: '"Orbitron", monospace', letterSpacing: '0.1em' }}>DON</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center text-white font-bold text-lg tracking-widest select-none active:opacity-70 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, rgba(40,80,200,0.85) 0%, rgba(20,50,160,0.9) 100%)',
            borderTop: '2px solid rgba(120,160,255,0.5)',
            borderLeft: '1px solid rgba(80,120,255,0.3)',
          }}
          onPointerDown={(e) => { e.preventDefault(); handleInput('ka'); }}
        >
          <span style={{ fontFamily: '"Orbitron", monospace', letterSpacing: '0.1em' }}>KA</span>
        </button>
      </div>
    </div>
  );
}
