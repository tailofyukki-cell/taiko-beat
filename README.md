# 🥁 Taiko Beat — オリジナル太鼓系リズムゲーム

ブラウザで遊べるオリジナルの太鼓系（左右2打）リズムゲームです。  
既存ゲームの固有名詞・素材・譜面は一切使用せず、すべてオリジナルで制作しています。

🌐 **公開URL**: https://tailofyukki-cell.github.io/taiko-beat/

---

## 🎮 ゲーム概要

- **ジャンル**: 太鼓系リズムゲーム（左右2打式）
- **曲**: Beat Storm（BPM 140、オリジナル楽曲）
- **ノーツ種別**: ドン（赤・中心打）/ カッ（青・ふち打）
- **難易度**: EASY / NORMAL / HARD（3段階）
- **判定**: PERFECT / GOOD / MISS の3段階判定
- **スコア**: コンボ倍率付きスコアシステム
- **ランク**: S / A / B / C / D の5段階評価

---

## 🕹️ 操作方法

### PC（キーボード）

| 操作 | キー |
|------|------|
| ドン（赤・中心打） | `F` または `J` |
| カッ（青・ふち打） | `D` または `K` |
| スタート / リトライ | `Enter` |
| ポーズ | `Esc` |
| ポーズ解除 | `Esc` |

### スマートフォン / タブレット（タッチ）

画面下部の4つのボタンをタップしてプレイします。

| ボタン | 操作 |
|--------|------|
| ◀ カッ | カッ（左手・ふち打） |
| ドン ▶ | ドン（左手・中心打） |
| ◀ ドン | ドン（右手・中心打） |
| カッ ▶ | カッ（右手・ふち打） |

---

## ⚖️ 判定幅仕様

| 判定 | 判定幅（ms） | スコア |
|------|------------|--------|
| PERFECT | ±60ms | 1,000点（コンボ倍率付き） |
| GOOD | ±120ms | 500点（コンボ倍率付き） |
| MISS | ±200ms超 | 0点・コンボリセット |

- 同期方式: **AudioContext + performance.now()** による高精度タイミング制御
- ノーツ表示: ゲーム開始から1.5秒のリードタイムを設けてノーツが右端から流れてきます

---

## 📊 スコア・ランク仕様

### スコア計算式
```
PERFECT: 1000 × (1 + combo × 0.01)
GOOD:    500  × (1 + combo × 0.005)
```

### ランク基準（正確度）

| ランク | 正確度 |
|--------|--------|
| S | 95%以上 |
| A | 85%以上 |
| B | 70%以上 |
| C | 50%以上 |
| D | 50%未満 |

### クリア条件
MISS率が全ノーツの30%未満でCLEAR、それ以上でFAILED。

---

## 📁 譜面JSON形式

譜面ファイルは `data/charts/` ディレクトリに格納されています。

### ファイル命名規則
```
data/charts/{曲ID}_{難易度}.json
例: data/charts/original_01_normal.json
```

### JSONフォーマット

```json
{
  "songId": "original_01",
  "difficulty": "normal",
  "bpm": 140,
  "duration": 62.14,
  "notes": [
    { "time": 0.857, "type": "don" },
    { "time": 1.286, "type": "ka" },
    { "time": 1.714, "type": "don" }
  ]
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `songId` | string | 曲の識別子 |
| `difficulty` | string | 難易度（easy/normal/hard） |
| `bpm` | number | 曲のBPM |
| `duration` | number | 曲の長さ（秒） |
| `notes[].time` | number | ノーツのタイミング（秒） |
| `notes[].type` | string | ノーツ種別（`don` または `ka`） |

### 曲リスト（songs.json）

```json
[
  {
    "id": "original_01",
    "title": "Beat Storm",
    "artist": "Taiko Beat Original",
    "bpm": 140,
    "difficulties": ["easy", "normal", "hard"]
  }
]
```

### 新しい譜面の追加方法

1. `data/charts/{曲ID}_{難易度}.json` を上記フォーマットで作成
2. `data/songs.json` に曲情報を追加
3. `index.html` の `SONGS` 配列に曲IDを追加

---

## 🛠️ 技術仕様

- **言語**: HTML5 / CSS3 / JavaScript（ES6+）
- **描画**: Canvas 2D API
- **音声**: Web Audio API（AudioContext）
- **同期方式**: `AudioContext.currentTime` + `performance.now()` による高精度タイミング
- **依存ライブラリ**: なし（Pure JavaScript）
- **対応ブラウザ**: Chrome / Edge / Firefox / Safari（最新版）
- **レスポンシブ**: スマートフォン・タブレット対応

---

## 📂 ファイル構成

```
taiko-beat/
├── index.html          # ゲーム本体（HTML/CSS/JS一体型）
├── data/
│   ├── songs.json      # 曲リスト
│   └── charts/
│       ├── original_01_easy.json    # Easy譜面
│       ├── original_01_normal.json  # Normal譜面
│       └── original_01_hard.json   # Hard譜面
└── README.md
```

---

## 📄 ライセンス・素材クレジット

### ゲーム本体
- **ライセンス**: MIT License
- **著作権**: © 2026 Taiko Beat Project

### 音源
- **BGM「Beat Storm」**: Web Audio API（AudioContext）を使用してプログラムで生成したオリジナル楽曲
  - 使用技術: OscillatorNode（サイン波・矩形波・ノコギリ波）、BiquadFilterNode、DynamicsCompressorNode
  - ライセンス: オリジナル制作（CC0相当）
- **SE（ドン音・カッ音）**: Web Audio API（AudioContext）を使用してプログラムで生成
  - ドン音: 低周波サイン波 + ノイズバースト
  - カッ音: 高周波クリック + バンドパスフィルタ
  - ライセンス: オリジナル制作（CC0相当）

### 譜面データ
- **全譜面**: オリジナル制作（CC0相当）

### フォント
- **Orbitron**: Google Fonts（[SIL Open Font License](https://fonts.google.com/specimen/Orbitron)）
- **Share Tech Mono**: Google Fonts（[SIL Open Font License](https://fonts.google.com/specimen/Share+Tech+Mono)）
- **Noto Sans JP**: Google Fonts（[SIL Open Font License](https://fonts.google.com/noto/specimen/Noto+Sans+JP)）

---

## 🚀 ローカル実行方法

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

ブラウザで `http://localhost:8000` を開いてください。

---

## 受入基準チェック

- [x] 曲に合わせてノーツが流れ、ドン/カッの入力で判定できる
- [x] スコア/コンボが正しく更新される
- [x] Missでコンボがリセットされる
- [x] リザルト画面が出る（内訳含む）
- [x] 難易度で譜面が変わる（Easy/Normal/Hard）
- [x] GitHub Pagesで公開されている
- [x] 素材ライセンスがREADMEに明記されている
