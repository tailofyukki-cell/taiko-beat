/**
 * AudioManager - WebAudio APIによる音声管理
 * BGMはAudioElement、SEはAudioContext+BufferSourceで実装
 */

const SE_DON_OGG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/se_don_b0a174a6.ogg';
const SE_DON_MP3 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/se_don_5a201ceb.mp3';
const SE_KA_OGG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/se_ka_d96ad1f8.ogg';
const SE_KA_MP3 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/se_ka_7259fca6.mp3';

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private donBuffer: AudioBuffer | null = null;
  private kaBuffer: AudioBuffer | null = null;
  private bgmElement: HTMLAudioElement | null = null;
  private bgmStartTime: number = 0;  // AudioContext.currentTime at BGM start
  private bgmOffset: number = 0;     // BGM内のオフセット(秒)
  private isPlaying: boolean = false;
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    this.ctx = new AudioContext();
    
    // SEバッファをロード
    const [donBuf, kaBuf] = await Promise.all([
      this.loadBuffer(SE_DON_OGG, SE_DON_MP3),
      this.loadBuffer(SE_KA_OGG, SE_KA_MP3),
    ]);
    this.donBuffer = donBuf;
    this.kaBuffer = kaBuf;
    
    this.initialized = true;
  }

  private async loadBuffer(oggUrl: string, mp3Url: string): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    
    // OGGを試みて失敗したらMP3にフォールバック
    const urls = [oggUrl, mp3Url];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arrayBuf = await res.arrayBuffer();
        return await this.ctx.decodeAudioData(arrayBuf);
      } catch {
        continue;
      }
    }
    throw new Error(`Failed to load audio buffer`);
  }

  async ensureResumed(): Promise<void> {
    if (!this.ctx) await this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  playDon(): void {
    this.playBuffer(this.donBuffer);
  }

  playKa(): void {
    this.playBuffer(this.kaBuffer);
  }

  private playBuffer(buffer: AudioBuffer | null): void {
    if (!this.ctx || !buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(0);
  }

  async startBGM(oggUrl: string, mp3Url: string): Promise<void> {
    await this.ensureResumed();
    
    // 既存のBGMを停止
    this.stopBGM();
    
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    // OGGを試みてMP3にフォールバック
    const canPlayOgg = audio.canPlayType('audio/ogg; codecs="vorbis"');
    audio.src = canPlayOgg ? oggUrl : mp3Url;
    
    this.bgmElement = audio;
    
    // AudioContextに接続してタイミング同期
    if (this.ctx) {
      const source = this.ctx.createMediaElementSource(audio);
      source.connect(this.ctx.destination);
      this.bgmStartTime = this.ctx.currentTime;
    }
    
    await audio.play();
    this.isPlaying = true;
  }

  stopBGM(): void {
    if (this.bgmElement) {
      this.bgmElement.pause();
      this.bgmElement.src = '';
      this.bgmElement = null;
    }
    this.isPlaying = false;
  }

  pauseBGM(): void {
    if (this.bgmElement && this.isPlaying) {
      this.bgmElement.pause();
      this.isPlaying = false;
    }
  }

  resumeBGM(): void {
    if (this.bgmElement && !this.isPlaying) {
      this.bgmElement.play();
      this.isPlaying = true;
    }
  }

  /**
   * ゲーム内時間(ms)を返す
   * AudioContextのcurrentTimeを基準に計算
   */
  getGameTimeMs(): number {
    if (!this.ctx || !this.isPlaying) return 0;
    return (this.ctx.currentTime - this.bgmStartTime) * 1000;
  }

  getBGMCurrentTime(): number {
    return this.bgmElement?.currentTime ?? 0;
  }

  isReady(): boolean {
    return this.initialized;
  }
}

export const AudioManager = new AudioManagerClass();
