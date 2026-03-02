# 🥁 Taiko Beat

**Taiko Beat** は、ブラウザで遊べるオリジナル太鼓系リズムゲームです。既存ゲームの固有名詞・素材・譜面を一切使用せず、独自のデザイン・音源・譜面で制作されています。

> **公開URL:** https://[your-username].github.io/taiko-beat/

---

## ゲーム概要

- **ジャンル:** 太鼓系リズムゲーム（左右2打）
- **スタイル:** ダークアーケード・レトロフューチャー
- **収録曲:** Beat Storm（BPM 140、オリジナル楽曲）
- **難易度:** Easy / Normal / Hard の3段階
- **同期方式:** `AudioContext` + `performance.now()` による高精度タイミング同期

---

## 操作方法

### PC（キーボード）

| キー | 操作 |
|------|------|
| `F` または `J` | ドン（赤ノーツ・中心打） |
| `D` または `K` | カッ（青ノーツ・ふち打） |
| `Enter` | スタート |
| `ESC` | 一時停止 / 再開 |

### スマートフォン・タブレット

画面下部の **DON**（赤）ボタンと **KA**（青）ボタンをタップしてください。

---

## 判定幅仕様

| 判定 | タイミング幅 | スコア |
|------|------------|--------|
| **PERFECT** | ±45 ms | 1,000点 + コンボボーナス |
| **GREAT** | ±90 ms | 500点 + コンボボーナス |
| **GOOD** | ±135 ms | 100点 + コンボボーナス |
| **MISS** | それ以上 | 0点・コンボリセット |

コンボボーナス = コンボ数 × 10点

---

## 譜面JSON形式

譜面ファイルは `client/public/data/charts/` に配置します。

```json
{
  "songId": "original_01",
  "difficulty": "normal",
  "level": 5,
  "bpm": 140,
  "offset": 1000,
  "notes": [
    { "time": 0.0, "type": "don" },
    { "time": 428.6, "type": "don" },
    { "time": 857.1, "type": "ka" },
    { "time": 1285.7, "type": "don" }
  ]
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `songId` | string | 楽曲ID（`songs.json`と対応） |
| `difficulty` | string | `"easy"` / `"normal"` / `"hard"` |
| `level` | number | 難易度レベル（1〜10） |
| `bpm` | number | テンポ（BPM） |
| `offset` | number | 譜面開始オフセット（ms） |
| `notes[].time` | number | ノーツのタイムスタンプ（ms、offset後の相対時間） |
| `notes[].type` | string | `"don"`（赤）または `"ka"`（青） |

### 新しい譜面の追加方法

1. `client/public/data/charts/` に譜面JSONファイルを追加
2. `client/public/data/songs.json` の `difficulties` に参照を追加
3. 音源ファイル（OGG/MP3）を CDN にアップロードして URL を設定

---

## 技術スタック

- **フロントエンド:** React 19 + TypeScript + Vite
- **スタイリング:** Tailwind CSS 4
- **描画:** HTML5 Canvas API
- **音声:** Web Audio API（SE）+ HTMLAudioElement（BGM）
- **タイミング:** `AudioContext.currentTime` による高精度同期

---

## プロジェクト構成

```
taiko-beat/
├── client/
│   ├── public/
│   │   └── data/
│   │       ├── songs.json          # 楽曲リスト
│   │       └── charts/             # 譜面JSON
│   └── src/
│       ├── lib/
│       │   ├── types.ts            # 型定義・定数
│       │   ├── audioManager.ts     # 音声管理
│       │   ├── gameEngine.ts       # ゲームロジック・判定
│       │   └── renderer.ts         # Canvas描画
│       ├── components/
│       │   ├── GameCanvas.tsx      # ゲームキャンバス
│       │   ├── TitleScreen.tsx     # タイトル画面
│       │   ├── PlayScreen.tsx      # プレイ画面
│       │   └── ResultScreen.tsx    # リザルト画面
│       └── pages/
│           └── Home.tsx            # メインページ
└── README.md
```

---

## ライセンス・素材クレジット

### ゲームコード

MIT License © 2025 Taiko Beat Original

### 音源

本ゲームの音源はすべてオリジナルです。Python の `numpy` および `scipy` ライブラリを使用してプログラム的に生成されています。

- **BGM「Beat Storm」:** Python生成（正弦波合成・ドラムパターン合成）
- **SE「ドン」:** Python生成（低周波正弦波 + エンベロープ）
- **SE「カッ」:** Python生成（高周波正弦波 + ノイズ）

いずれも **CC0 相当（著作権放棄）** として扱います。

### フォント

- **Orbitron** - Google Fonts（[SIL Open Font License 1.1](https://scripts.sil.org/OFL)）
- **Share Tech Mono** - Google Fonts（[SIL Open Font License 1.1](https://scripts.sil.org/OFL)）
- **Noto Sans JP** - Google Fonts（[SIL Open Font License 1.1](https://scripts.sil.org/OFL)）

### 使用ライブラリ

| ライブラリ | ライセンス |
|-----------|-----------|
| React | MIT |
| Vite | MIT |
| TypeScript | Apache-2.0 |
| Tailwind CSS | MIT |

---

## 開発・ビルド

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# 譜面JSON生成
python3 generate_charts.py
```
