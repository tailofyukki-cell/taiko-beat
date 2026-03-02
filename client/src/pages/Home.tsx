/**
 * Home - ゲームメインページ
 * 画面遷移: title → playing → result → title/playing
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import TitleScreen from '@/components/TitleScreen';
import PlayScreen from '@/components/PlayScreen';
import ResultScreen from '@/components/ResultScreen';
import { AudioManager } from '@/lib/audioManager';
import { GameEngine } from '@/lib/gameEngine';
import { GameScore, Difficulty, Song, Chart, JudgeResult } from '@/lib/types';

type Screen = 'title' | 'loading' | 'playing' | 'result';

const INITIAL_SCORE: GameScore = {
  score: 0, combo: 0, maxCombo: 0,
  perfect: 0, great: 0, good: 0, miss: 0,
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [score, setScore] = useState<GameScore>(INITIAL_SCORE);
  const [isPaused, setIsPaused] = useState(false);
  const [totalNotes, setTotalNotes] = useState(0);
  const [chartOffset, setChartOffset] = useState(1000);
  const [loadError, setLoadError] = useState<string | null>(null);

  const engineRef = useRef<GameEngine>(new GameEngine());

  // songs.jsonを読み込む
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/songs.json')
      .then(r => r.json())
      .then((data: Song[]) => {
        setSongs(data);
        setCurrentSong(data[0]);
      })
      .catch(e => {
        console.error('Failed to load songs.json', e);
        setLoadError('楽曲データの読み込みに失敗しました。');
      });
  }, []);

  const handleStart = useCallback(async (diff: Difficulty) => {
    if (!currentSong) return;
    
    setDifficulty(diff);
    setScreen('loading');
    setLoadError(null);
    
    try {
      // AudioManagerを初期化（ユーザー操作後）
      await AudioManager.init();
      
      // 譜面を読み込む
      const chartFile = currentSong.difficulties[diff].chart;
      const res = await fetch(import.meta.env.BASE_URL + `data/charts/${chartFile}`);
      if (!res.ok) throw new Error(`Failed to load chart: ${chartFile}`);
      const chart: Chart = await res.json();
      
      // ゲームエンジンに譜面をロード
      engineRef.current.loadChart(chart);
      setTotalNotes(engineRef.current.getTotalNotes());
      setChartOffset(chart.offset);
      setScore(INITIAL_SCORE);
      setIsPaused(false);
      
      // BGM再生開始
      await AudioManager.startBGM(currentSong.bgm_ogg, currentSong.bgm_mp3);
      
      setScreen('playing');
    } catch (e) {
      console.error('Failed to start game', e);
      setLoadError(`ゲームの開始に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
      setScreen('title');
    }
  }, [currentSong]);

  const handleJudge = useCallback((result: JudgeResult) => {
    setScore(engineRef.current.getScore());
  }, []);

  const handleFinish = useCallback(() => {
    AudioManager.stopBGM();
    setScore(engineRef.current.getScore());
    setScreen('result');
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    AudioManager.pauseBGM();
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    AudioManager.resumeBGM();
  }, []);

  const handleRetry = useCallback(() => {
    AudioManager.stopBGM();
    handleStart(difficulty);
  }, [difficulty, handleStart]);

  const handleTitle = useCallback(() => {
    AudioManager.stopBGM();
    setScreen('title');
    setScore(INITIAL_SCORE);
  }, []);

  // Enterキーでスタート（タイトル画面）
  useEffect(() => {
    if (screen !== 'title') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentSong) {
        handleStart(difficulty);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, difficulty, currentSong, handleStart]);

  if (!currentSong) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0d0d1a' }}
      >
        {loadError ? (
          <div className="text-center">
            <p style={{ color: '#FF6666', fontFamily: '"Noto Sans JP", sans-serif' }}>{loadError}</p>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="text-lg tracking-widest animate-pulse"
              style={{ fontFamily: '"Orbitron", monospace', color: '#4488FF' }}
            >
              LOADING...
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0d0d1a' }}
      >
        <div className="text-center flex flex-col items-center gap-4">
          <div
            className="text-lg tracking-widest animate-pulse"
            style={{ fontFamily: '"Orbitron", monospace', color: '#4488FF' }}
          >
            LOADING...
          </div>
          {loadError && (
            <p style={{ color: '#FF6666', fontFamily: '"Noto Sans JP", sans-serif' }}>{loadError}</p>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'title') {
    return <TitleScreen song={currentSong} onStart={handleStart} />;
  }

  if (screen === 'playing') {
    return (
      <PlayScreen
        engine={engineRef.current}
        difficulty={difficulty}
        score={score}
        offset={chartOffset}
        totalNotes={totalNotes}
        onJudge={handleJudge}
        onFinish={handleFinish}
        onPause={handlePause}
        onResume={handleResume}
        isPaused={isPaused}
      />
    );
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        score={score}
        difficulty={difficulty}
        song={currentSong}
        totalNotes={totalNotes}
        onRetry={handleRetry}
        onTitle={handleTitle}
      />
    );
  }

  return null;
}
