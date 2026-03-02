"""
Taiko Beat - 譜面JSON生成スクリプト
BPM=140、4/4拍子
ノーツ種別: don (赤/中心打), ka (青/ふち打)
"""
import json
import os

BPM = 140
BEAT_MS = 60000 / BPM  # 428.57ms per beat
MEASURE_MS = BEAT_MS * 4  # 1714.28ms per measure

def beat(measure, beat_num, subdivision=1, sub_idx=0):
    """指定した小節・拍・細分化位置のタイムスタンプ(ms)を返す"""
    t = measure * MEASURE_MS + (beat_num + sub_idx / subdivision) * BEAT_MS
    return round(t, 1)

def gen_easy():
    """Easy: 4分音符中心、シンプルなパターン"""
    notes = []
    # 8小節のパターンを繰り返す
    pattern_measures = 16  # 16小節分
    
    for m in range(pattern_measures):
        p = m % 4  # 4小節ごとにパターンを変える
        if p == 0:
            # ドン ドン カッ ドン
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
        elif p == 1:
            # ドン カッ ドン カッ
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "ka"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 3), "type": "ka"})
        elif p == 2:
            # ドン ドン ドン カッ
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 3), "type": "ka"})
        elif p == 3:
            # カッ ドン カッ ドン
            notes.append({"time": beat(m, 0), "type": "ka"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
    
    return notes

def gen_normal():
    """Normal: 8分音符も含む、バランスの取れたパターン"""
    notes = []
    pattern_measures = 16
    
    for m in range(pattern_measures):
        p = m % 8
        if p == 0:
            # 4分: ドン ドン カッ ドン
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
        elif p == 1:
            # 8分: ドドカッ ドン
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 0, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "ka"})
            notes.append({"time": beat(m, 1, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 3), "type": "don"})
        elif p == 2:
            # 4分: カッ ドン ドン カッ
            notes.append({"time": beat(m, 0), "type": "ka"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 3), "type": "ka"})
        elif p == 3:
            # 8分連打
            for i in range(8):
                t = "don" if i % 2 == 0 else "ka"
                notes.append({"time": beat(m, 0, 8, i), "type": t})
        elif p == 4:
            # ドン カッ ドドン カッ
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "ka"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 2, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 3), "type": "ka"})
        elif p == 5:
            # 8分: カカドン ドン
            notes.append({"time": beat(m, 0), "type": "ka"})
            notes.append({"time": beat(m, 0, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 2, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
        elif p == 6:
            # ドン ドン カッ カッ
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "ka"})
        elif p == 7:
            # フィルイン: 8分ドン連打
            for i in range(8):
                notes.append({"time": beat(m, 0, 8, i), "type": "don"})
    
    return notes

def gen_hard():
    """Hard: 16分音符も含む、高密度パターン"""
    notes = []
    pattern_measures = 16
    
    for m in range(pattern_measures):
        p = m % 8
        if p == 0:
            # 16分: ドドカカ ドドカカ
            for i in range(16):
                t = "don" if i % 4 < 2 else "ka"
                notes.append({"time": beat(m, 0, 16, i), "type": t})
        elif p == 1:
            # 8分+16分混合
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 0, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 1), "type": "ka"})
            notes.append({"time": beat(m, 1, 4, 1), "type": "don"})
            notes.append({"time": beat(m, 1, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 1, 4, 3), "type": "ka"})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 2, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
            notes.append({"time": beat(m, 3, 4, 1), "type": "don"})
            notes.append({"time": beat(m, 3, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 3, 4, 3), "type": "don"})
        elif p == 2:
            # 16分連打
            for i in range(16):
                t = "don" if i % 2 == 0 else "ka"
                notes.append({"time": beat(m, 0, 16, i), "type": t})
        elif p == 3:
            # 複合パターン
            notes.append({"time": beat(m, 0), "type": "don"})
            notes.append({"time": beat(m, 0, 4, 1), "type": "don"})
            notes.append({"time": beat(m, 0, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 0, 4, 3), "type": "ka"})
            notes.append({"time": beat(m, 1), "type": "don"})
            notes.append({"time": beat(m, 1, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 2), "type": "ka"})
            notes.append({"time": beat(m, 2, 4, 1), "type": "don"})
            notes.append({"time": beat(m, 2, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 2, 4, 3), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
            notes.append({"time": beat(m, 3, 4, 1), "type": "ka"})
            notes.append({"time": beat(m, 3, 2, 1), "type": "don"})
            notes.append({"time": beat(m, 3, 4, 3), "type": "don"})
        elif p == 4:
            # 16分: カカドド パターン
            for i in range(16):
                t = "ka" if i % 4 < 2 else "don"
                notes.append({"time": beat(m, 0, 16, i), "type": t})
        elif p == 5:
            # 8分基本+16分アクセント
            for beat_i in range(4):
                notes.append({"time": beat(m, beat_i), "type": "don"})
                notes.append({"time": beat(m, beat_i, 4, 1), "type": "ka"})
                notes.append({"time": beat(m, beat_i, 2, 1), "type": "don"})
                notes.append({"time": beat(m, beat_i, 4, 3), "type": "don" if beat_i % 2 == 0 else "ka"})
        elif p == 6:
            # 難しいパターン: 16分ドドカカ + 8分
            for i in range(8):
                t = "don" if i % 4 < 2 else "ka"
                notes.append({"time": beat(m, 0, 8, i), "type": t})
            notes.append({"time": beat(m, 2), "type": "don"})
            notes.append({"time": beat(m, 2, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 3), "type": "don"})
            notes.append({"time": beat(m, 3, 4, 1), "type": "don"})
            notes.append({"time": beat(m, 3, 2, 1), "type": "ka"})
            notes.append({"time": beat(m, 3, 4, 3), "type": "ka"})
        elif p == 7:
            # フィルイン: 16分全打
            for i in range(16):
                notes.append({"time": beat(m, 0, 16, i), "type": "don"})
    
    return notes

def create_chart(difficulty, notes, level):
    return {
        "songId": "original_01",
        "difficulty": difficulty,
        "level": level,
        "bpm": BPM,
        "offset": 1000,  # 1秒のカウントイン
        "notes": sorted(notes, key=lambda n: n["time"])
    }

# 出力先ディレクトリ
out_dir = "/home/ubuntu/taiko-beat/client/public/data/charts"
os.makedirs(out_dir, exist_ok=True)

# songs.json
songs_data = [
    {
        "id": "original_01",
        "title": "Beat Storm",
        "artist": "Taiko Beat Original",
        "bpm": BPM,
        "duration": 16 * MEASURE_MS / 1000 + 2,  # 秒
        "bgm_ogg": "https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/bgm_original_8d1bf03a.ogg",
        "bgm_mp3": "https://d2xsxph8kpxj0f.cloudfront.net/310519663182530348/H5nAVRoKLyRvzTJVdfWePb/bgm_original_acbe27fe.mp3",
        "difficulties": {
            "easy": {"level": 2, "chart": "original_01_easy.json"},
            "normal": {"level": 5, "chart": "original_01_normal.json"},
            "hard": {"level": 8, "chart": "original_01_hard.json"}
        }
    }
]

with open("/home/ubuntu/taiko-beat/client/public/data/songs.json", "w", encoding="utf-8") as f:
    json.dump(songs_data, f, ensure_ascii=False, indent=2)
print(f"songs.json: {len(songs_data)} songs")

# Easy
easy_notes = gen_easy()
easy_chart = create_chart("easy", easy_notes, 2)
with open(f"{out_dir}/original_01_easy.json", "w") as f:
    json.dump(easy_chart, f, indent=2)
print(f"Easy: {len(easy_notes)} notes")

# Normal
normal_notes = gen_normal()
normal_chart = create_chart("normal", normal_notes, 5)
with open(f"{out_dir}/original_01_normal.json", "w") as f:
    json.dump(normal_chart, f, indent=2)
print(f"Normal: {len(normal_notes)} notes")

# Hard
hard_notes = gen_hard()
hard_chart = create_chart("hard", hard_notes, 8)
with open(f"{out_dir}/original_01_hard.json", "w") as f:
    json.dump(hard_chart, f, indent=2)
print(f"Hard: {len(hard_notes)} notes")

print("Done!")
