/**
 * Renderer - Canvas描画エンジン
 * ダークアーケード・レトロフューチャースタイル
 */

import { Note, JudgeResult, JudgeType } from './types';

interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ParticleEffect[] = [];
  
  // レイアウト定数
  private LANE_Y: number = 0;
  private JUDGE_X: number = 0;
  private NOTE_RADIUS: number = 28;
  private LANE_HEIGHT: number = 80;
  private SPEED_PX_PER_MS: number = 0.5; // 500px/s
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.updateLayout();
  }

  updateLayout(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    // タッチボタン(約80px)を除いた有効エリアの中央
    const touchAreaH = Math.min(80, h * 0.12);
    const playAreaH = h - touchAreaH;
    this.LANE_Y = playAreaH * 0.5;
    this.JUDGE_X = Math.min(160, w * 0.18);
    this.NOTE_RADIUS = Math.min(28, playAreaH * 0.06);
    this.LANE_HEIGHT = this.NOTE_RADIUS * 2.8;
    this.SPEED_PX_PER_MS = (w - this.JUDGE_X) / 2200;
  }

  clear(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    // 背景グラデーション
    const grad = this.ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(0.5, '#0a0a15');
    grad.addColorStop(1, '#0d0d1a');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, width, height);
    
    // 微細なグリッドパターン
    this.drawGrid();
  }

  private drawGrid(): void {
    const { width, height } = this.canvas;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(100, 100, 200, 0.04)';
    this.ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawLane(): void {
    const { width } = this.canvas;
    const y = this.LANE_Y;
    const h = this.LANE_HEIGHT;
    
    // レーン背景
    const laneGrad = this.ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    laneGrad.addColorStop(0, 'rgba(20, 20, 50, 0.8)');
    laneGrad.addColorStop(0.5, 'rgba(30, 30, 70, 0.9)');
    laneGrad.addColorStop(1, 'rgba(20, 20, 50, 0.8)');
    this.ctx.fillStyle = laneGrad;
    this.ctx.fillRect(0, y - h / 2, width, h);
    
    // レーン上下のライン
    this.ctx.strokeStyle = 'rgba(80, 80, 180, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y - h / 2);
    this.ctx.lineTo(width, y - h / 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, y + h / 2);
    this.ctx.lineTo(width, y + h / 2);
    this.ctx.stroke();
    
    // 中央ライン（薄く）
    this.ctx.strokeStyle = 'rgba(60, 60, 140, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([8, 8]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.JUDGE_X + this.NOTE_RADIUS * 2, y);
    this.ctx.lineTo(width, y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawJudgeCircle(hitType: 'don' | 'ka' | null, pulse: number = 0): void {
    const x = this.JUDGE_X;
    const y = this.LANE_Y;
    const r = this.NOTE_RADIUS;
    const ctx = this.ctx;
    
    // 外側リング（脈動）
    const outerR = r * (1.4 + pulse * 0.2);
    ctx.save();
    ctx.strokeStyle = hitType === 'don' 
      ? `rgba(255, 80, 80, ${0.6 + pulse * 0.4})`
      : hitType === 'ka'
      ? `rgba(80, 160, 255, ${0.6 + pulse * 0.4})`
      : 'rgba(150, 150, 220, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, outerR, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内側リング
    ctx.strokeStyle = hitType === 'don'
      ? 'rgba(255, 120, 120, 0.9)'
      : hitType === 'ka'
      ? 'rgba(120, 180, 255, 0.9)'
      : 'rgba(180, 180, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    
    // 中心円
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (hitType === 'don') {
      grad.addColorStop(0, 'rgba(255, 200, 200, 0.9)');
      grad.addColorStop(1, 'rgba(180, 40, 40, 0.8)');
    } else if (hitType === 'ka') {
      grad.addColorStop(0, 'rgba(200, 220, 255, 0.9)');
      grad.addColorStop(1, 'rgba(40, 80, 200, 0.8)');
    } else {
      grad.addColorStop(0, 'rgba(180, 180, 240, 0.5)');
      grad.addColorStop(1, 'rgba(80, 80, 160, 0.4)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  drawNote(note: Note, gameTimeMs: number, offset: number): void {
    const absoluteTime = gameTimeMs - offset;
    const timeDiff = note.time - absoluteTime;
    const x = this.JUDGE_X + timeDiff * this.SPEED_PX_PER_MS;
    const y = this.LANE_Y;
    const r = this.NOTE_RADIUS;
    const ctx = this.ctx;
    
    // 画面外は描画しない
    if (x < -r * 2 || x > this.canvas.width + r * 2) return;
    
    ctx.save();
    
    const isDon = note.type === 'don';
    const innerColor = isDon ? '#FF4444' : '#4488FF';
    const outerColor = isDon ? '#FF8888' : '#88BBFF';
    const glowColor = isDon ? 'rgba(255, 68, 68, 0.6)' : 'rgba(68, 136, 255, 0.6)';
    
    // グロー効果
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    
    // 外側グラデーション
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, outerColor);
    grad.addColorStop(0.6, innerColor);
    grad.addColorStop(1, isDon ? 'rgba(180, 20, 20, 0.9)' : 'rgba(20, 60, 180, 0.9)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    // 外枠
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isDon ? 'rgba(255, 180, 180, 0.9)' : 'rgba(180, 210, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // ハイライト（光沢）
    const hlGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r * 0.7);
    hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hlGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  drawJudgeText(judge: JudgeResult | null): void {
    if (!judge || !judge.type) return;
    
    const x = this.JUDGE_X;
    const y = this.LANE_Y - this.NOTE_RADIUS * 2.5;
    const ctx = this.ctx;
    
    ctx.save();
    
    const colors: Record<JudgeType & string, string> = {
      perfect: '#FFD700',
      great: '#00FF88',
      good: '#88AAFF',
      miss: '#FF6666',
    };
    
    const texts: Record<JudgeType & string, string> = {
      perfect: 'PERFECT',
      great: 'GREAT',
      good: 'GOOD',
      miss: 'MISS',
    };
    
    const color = colors[judge.type] || '#FFFFFF';
    const text = texts[judge.type] || '';
    
    ctx.font = `bold ${Math.max(16, this.NOTE_RADIUS)}px "Orbitron", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // グロー
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    ctx.restore();
  }

  addParticles(x: number, y: number, type: 'don' | 'ka', judgeType: JudgeType): void {
    const count = judgeType === 'perfect' ? 12 : judgeType === 'great' ? 8 : 4;
    const color = type === 'don' ? '#FF6666' : '#6699FF';
    const accentColor = judgeType === 'perfect' ? '#FFD700' : color;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        maxLife: 1.0,
        color: i % 3 === 0 ? accentColor : color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  updateAndDrawParticles(): void {
    const ctx = this.ctx;
    this.particles = this.particles.filter(p => p.life > 0);
    
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // 重力
      p.life -= 0.03;
      
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawProgressBar(progress: number): void {
    const { width } = this.canvas;
    const y = this.LANE_Y + this.LANE_HEIGHT / 2 + 8;
    const h = 4;
    
    // 背景
    this.ctx.fillStyle = 'rgba(60, 60, 100, 0.5)';
    this.ctx.fillRect(0, y, width, h);
    
    // 進捗
    const grad = this.ctx.createLinearGradient(0, 0, width * progress, 0);
    grad.addColorStop(0, '#4488FF');
    grad.addColorStop(1, '#FF44AA');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, y, width * progress, h);
  }
}
