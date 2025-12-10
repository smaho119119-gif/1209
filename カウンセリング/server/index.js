/**
 * 管理画面APIサーバー（SQLite版）
 * 
 * 機能:
 * - アセット管理（画像・音声の生成状況確認）
 * - 物語管理（CRUD）
 * - アクセスログ記録
 * - 統計データ
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// ディレクトリパス
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'storybook.db');

// データディレクトリ作成
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// SQLiteデータベース初期化
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// テーブル作成
db.exec(`
    -- 物語テーブル
    CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        emoji TEXT,
        title TEXT NOT NULL,
        description TEXT,
        theme TEXT,
        speaker TEXT DEFAULT 'zundamon',
        pages TEXT NOT NULL,  -- JSON形式
        questions TEXT,        -- JSON形式
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- アクセスログテーブル
    CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        type TEXT NOT NULL,
        story_id TEXT,
        page_index INTEGER,
        data TEXT,  -- JSON形式で追加データ
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 統計テーブル
    CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        story_id TEXT,
        page_index INTEGER,
        views INTEGER DEFAULT 0,
        UNIQUE(date, story_id, page_index)
    );

    -- 回答履歴テーブル
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        story_id TEXT NOT NULL,
        question_index INTEGER,
        answer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// speakerカラム追加（既存DBへの対応）
try {
    db.exec('ALTER TABLE stories ADD COLUMN speaker TEXT DEFAULT "zundamon"');
} catch (e) {
    // カラムが既に存在する場合は無視
}

// 話者一覧
const SPEAKERS = {
    zundamon: { id: 3, name: 'ずんだもん（ノーマル）', folder: 'zundamon' },
    zundamon_amaama: { id: 1, name: 'ずんだもん（あまあま）', folder: 'zundamon_amaama' },
    zundamon_tsun: { id: 7, name: 'ずんだもん（ツンツン）', folder: 'zundamon_tsun' },
    metan: { id: 2, name: '四国めたん（ノーマル）', folder: 'metan' },
    metan_amaama: { id: 0, name: '四国めたん（あまあま）', folder: 'metan_amaama' },
    tsumugi: { id: 8, name: '春日部つむぎ', folder: 'tsumugi' },
    ritsu: { id: 9, name: '波音リツ', folder: 'ritsu' },
    himari: { id: 14, name: '冥鳴ひまり', folder: 'himari' },
    sora: { id: 16, name: '九州そら（ノーマル）', folder: 'sora' },
};

// デフォルトの物語データを挿入
const defaultStories = [
    {
        id: 'lonely',
        emoji: '🐰',
        title: 'ひとりぼっちのうさぎ',
        description: 'みんなと遊べない日',
        theme: 'loneliness',
        pages: JSON.stringify([
            { text: 'うさぎのミミは、今日もひとりでお部屋にいました。窓の外では、他の動物たちが楽しそうに遊んでいます。', backgroundColor: '#FFF5F5' },
            { text: '「どうして私は、みんなと遊べないんだろう」ミミはため息をつきました。', backgroundColor: '#FFF0F0' },
            { text: 'そんな時、小さなてんとう虫がミミの窓辺にやってきました。「こんにちは、何をしているの？」', backgroundColor: '#FFF5F0' },
            { text: 'ミミは驚きましたが、少しだけ嬉しくなりました。「ひとりで...お空を見てたの」', backgroundColor: '#FFFAF0' },
            { text: 'てんとう虫は言いました。「ひとりの時間も大切だよ。でも、話したくなったら私がいるからね」ミミの心が少しあたたかくなりました。', backgroundColor: '#FFFFF0' }
        ]),
        questions: JSON.stringify([
            { character: 'ミミ', question: 'ミミはどうしてひとりでいたのかな？' },
            { character: 'てんとう虫', question: 'てんとう虫の言葉で、ミミはどんな気持ちになったと思う？' }
        ])
    },
    {
        id: 'angry',
        emoji: '🐻',
        title: 'おこったくまさん',
        description: 'イライラしちゃう日',
        theme: 'anger',
        pages: JSON.stringify([
            { text: 'くまのポンタは、朝からイライラしていました。何をしても、うまくいかない気がします。', backgroundColor: '#FFF5F5' },
            { text: 'お気に入りのはちみつ壺が空っぽだったのです。「もう！どうして！」ポンタは大きな声を出しました。', backgroundColor: '#FFEFEF' },
            { text: '怒ったポンタは、森の中をドスドス歩きました。すると、小川のそばで小鳥が歌っていました。', backgroundColor: '#F5FFF5' },
            { text: '「どうしたの、くまさん？」小鳥が聞きました。ポンタは「はちみつがなくて...悔しいんだ」と言いました。', backgroundColor: '#F0FFF0' },
            { text: '小鳥は言いました。「怒ってもいいんだよ。でも、深呼吸してみて」ポンタが深呼吸すると、少し落ち着いてきました。', backgroundColor: '#EFFFEF' }
        ]),
        questions: JSON.stringify([
            { character: 'ポンタ', question: 'ポンタはどうして怒っていたのかな？' },
            { character: '小鳥', question: '深呼吸すると、どうして落ち着くと思う？' }
        ])
    },
    {
        id: 'anxious',
        emoji: '🐱',
        title: 'こわがりねこちゃん',
        description: '不安でドキドキする日',
        theme: 'anxiety',
        pages: JSON.stringify([
            { text: 'ねこのタマは、いつもドキドキしていました。知らない場所や、大きな音が怖いのです。', backgroundColor: '#F5F5FF' },
            { text: '今日は初めての場所に行かなければなりません。タマの心臓はバクバクします。', backgroundColor: '#F0F0FF' },
            { text: '「怖いよ...どうしよう」タマは小さな声でつぶやきました。', backgroundColor: '#EBEBFF' },
            { text: 'その時、年寄りのふくろうがやってきました。「怖いと感じるのは、自分を守ろうとしているからだよ」', backgroundColor: '#F0F5FF' },
            { text: '「小さな一歩でいいんだ。無理しなくていい」ふくろうの言葉で、タマは少しだけ勇気が出ました。', backgroundColor: '#F5FAFF' }
        ]),
        questions: JSON.stringify([
            { character: 'タマ', question: 'タマはどんなことが怖かったのかな？' },
            { character: 'ふくろう', question: '「小さな一歩でいい」ってどういう意味だと思う？' }
        ])
    },
    {
        id: 'sad',
        emoji: '🐧',
        title: 'かなしいペンギン',
        description: '泣きたくなる日',
        theme: 'sadness',
        pages: JSON.stringify([
            { text: 'ペンギンのペンは、大切な友達と会えなくなって、とても悲しい気持ちでした。', backgroundColor: '#F0F5FF' },
            { text: '涙がポロポロ流れます。「もう会えないのかな...」ペンは海を見つめました。', backgroundColor: '#E8F0FF' },
            { text: 'アザラシのおじさんがやってきました。「泣いてもいいんだよ。悲しい時は泣くのが一番だ」', backgroundColor: '#E0ECFF' },
            { text: 'ペンは思いっきり泣きました。泣いているうちに、少しずつ心が軽くなってきました。', backgroundColor: '#E8F2FF' },
            { text: '「大切な思い出は、心の中にずっとあるんだよ」その言葉がペンの心にしみました。', backgroundColor: '#F0F8FF' }
        ]),
        questions: JSON.stringify([
            { character: 'ペン', question: 'ペンはどうして泣いていたのかな？' },
            { character: 'アザラシ', question: '泣いた後、ペンの心はどうなったと思う？' }
        ])
    },
    {
        id: 'tired',
        emoji: '🐶',
        title: 'つかれたわんこ',
        description: 'もう何もしたくない日',
        theme: 'exhaustion',
        pages: JSON.stringify([
            { text: 'いぬのポチは、毎日がんばりすぎて、とても疲れていました。何もする気が起きません。', backgroundColor: '#FFF8F0' },
            { text: '「もう何もしたくない...」ポチはベッドに横になりました。', backgroundColor: '#FFF5E8' },
            { text: 'お母さん犬がやってきて、そっと寄り添いました。「今日はゆっくり休もうね」', backgroundColor: '#FFF8E0' },
            { text: 'ポチは安心して目を閉じました。休むことも大切なお仕事なのです。', backgroundColor: '#FFFAE8' },
            { text: '次の日、ポチは少しだけ元気になりました。「無理しなくていいんだ」とわかったからです。', backgroundColor: '#FFFCF0' }
        ]),
        questions: JSON.stringify([
            { character: 'ポチ', question: 'ポチはどうして疲れていたのかな？' },
            { character: 'お母さん', question: '休むことが「大切なお仕事」ってどういうことだと思う？' }
        ])
    },
    {
        id: 'confused',
        emoji: '🦊',
        title: 'まよったきつねさん',
        description: 'どうしていいかわからない日',
        theme: 'confusion',
        pages: JSON.stringify([
            { text: 'きつねのコンは、道に迷ってしまいました。どっちに行けばいいかわかりません。', backgroundColor: '#FFF8F5' },
            { text: '「右かな？左かな？」コンは立ち止まって考えました。', backgroundColor: '#FFF5F0' },
            { text: 'そこにたぬきのおじいさんが通りかかりました。「どうしたんじゃ？」', backgroundColor: '#FFF0EC' },
            { text: '「道がわからなくて...」コンは正直に言いました。', backgroundColor: '#FFF5F2' },
            { text: '「迷ったら、誰かに聞いていいんじゃよ。一人で抱え込まなくていい」たぬきは優しく道を教えてくれました。', backgroundColor: '#FFFAF5' }
        ]),
        questions: JSON.stringify([
            { character: 'コン', question: 'コンはどうして迷っていたのかな？' },
            { character: 'たぬき', question: '困った時、誰かに聞くのはどうして大切なんだろう？' }
        ])
    }
];

// デフォルトデータ挿入（存在しない場合のみ）
const insertStory = db.prepare(`
    INSERT OR IGNORE INTO stories (id, emoji, title, description, theme, pages, questions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const story of defaultStories) {
    insertStory.run(story.id, story.emoji, story.title, story.description, story.theme, story.pages, story.questions);
}

// ミドルウェア
app.use(cors());
app.use(express.json());

// =====================================
// アセット管理API
// =====================================

// 話者一覧を取得
app.get('/api/speakers', (req, res) => {
    res.json(SPEAKERS);
});

// アセット状況を取得（話者別対応）
app.get('/api/assets/status', (req, res) => {
    const stories = db.prepare('SELECT * FROM stories').all();
    const status = {};

    for (const story of stories) {
        const pages = JSON.parse(story.pages);
        const speaker = story.speaker || 'zundamon';
        const speakerInfo = SPEAKERS[speaker] || SPEAKERS.zundamon;

        const storyStatus = {
            id: story.id,
            title: story.title,
            emoji: story.emoji,
            speaker: speaker,
            speakerName: speakerInfo.name,
            availableSpeakers: [],
            pages: []
        };

        // 利用可能な話者を検索
        for (const [key, spk] of Object.entries(SPEAKERS)) {
            const testPath = path.join(AUDIO_DIR, spk.folder, story.id, 'page_0.wav');
            if (fs.existsSync(testPath)) {
                storyStatus.availableSpeakers.push({
                    key,
                    name: spk.name,
                    folder: spk.folder
                });
            }
        }

        for (let i = 0; i < pages.length; i++) {
            const audioPath = path.join(AUDIO_DIR, speakerInfo.folder, story.id, `page_${i}.wav`);
            const imagePngPath = path.join(IMAGES_DIR, story.id, `page_${i}.png`);
            const imageJpgPath = path.join(IMAGES_DIR, story.id, `page_${i}.jpg`);

            storyStatus.pages.push({
                index: i,
                hasAudio: fs.existsSync(audioPath),
                hasImage: fs.existsSync(imagePngPath) || fs.existsSync(imageJpgPath),
                audioPath: fs.existsSync(audioPath) ? `/audio/${speakerInfo.folder}/${story.id}/page_${i}.wav` : null,
                imagePath: fs.existsSync(imagePngPath) ? `/images/${story.id}/page_${i}.png` :
                    fs.existsSync(imageJpgPath) ? `/images/${story.id}/page_${i}.jpg` : null
            });
        }

        status[story.id] = storyStatus;
    }

    res.json(status);
});

// 物語の話者を変更
app.put('/api/stories/:id/speaker', (req, res) => {
    const { speaker } = req.body;
    if (!SPEAKERS[speaker]) {
        return res.status(400).json({ error: 'Unknown speaker' });
    }

    db.prepare('UPDATE stories SET speaker = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(speaker, req.params.id);

    res.json({ success: true, speaker });
});

// =====================================
// 物語管理API
// =====================================

app.get('/api/stories', (req, res) => {
    const stories = db.prepare('SELECT * FROM stories').all();
    const result = {};
    for (const story of stories) {
        const speaker = story.speaker || 'zundamon';
        result[story.id] = {
            ...story,
            speaker,
            speakerName: SPEAKERS[speaker]?.name || speaker,
            pages: JSON.parse(story.pages),
            questions: story.questions ? JSON.parse(story.questions) : []
        };
    }
    res.json(result);
});

app.get('/api/stories/:id', (req, res) => {
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
    if (!story) {
        return res.status(404).json({ error: 'Story not found' });
    }
    res.json({
        ...story,
        pages: JSON.parse(story.pages),
        questions: story.questions ? JSON.parse(story.questions) : []
    });
});

app.put('/api/stories/:id', (req, res) => {
    const { emoji, title, description, theme, pages, questions } = req.body;
    db.prepare(`
        UPDATE stories SET emoji = ?, title = ?, description = ?, theme = ?, 
        pages = ?, questions = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(emoji, title, description, theme, JSON.stringify(pages), JSON.stringify(questions), req.params.id);

    res.json({ success: true });
});

app.post('/api/stories', (req, res) => {
    const { id, emoji, title, description, theme, pages, questions } = req.body;
    const storyId = id || `story_${Date.now()}`;

    db.prepare(`
        INSERT INTO stories (id, emoji, title, description, theme, pages, questions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(storyId, emoji, title, description, theme, JSON.stringify(pages), JSON.stringify(questions));

    res.json({ id: storyId, success: true });
});

app.delete('/api/stories/:id', (req, res) => {
    db.prepare('DELETE FROM stories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// =====================================
// アクセスログAPI
// =====================================

app.post('/api/logs', (req, res) => {
    const { sessionId, type, storyId, pageIndex, data } = req.body;

    db.prepare(`
        INSERT INTO access_logs (session_id, type, story_id, page_index, data)
        VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, type, storyId, pageIndex, data ? JSON.stringify(data) : null);

    // 統計更新
    if (type === 'page_view' && storyId !== undefined) {
        const today = new Date().toISOString().split('T')[0];
        db.prepare(`
            INSERT INTO stats (date, story_id, page_index, views) VALUES (?, ?, ?, 1)
            ON CONFLICT(date, story_id, page_index) DO UPDATE SET views = views + 1
        `).run(today, storyId, pageIndex || 0);
    }

    res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const logs = db.prepare(`
        SELECT * FROM access_logs ORDER BY created_at DESC LIMIT ?
    `).all(limit);
    res.json(logs);
});

// =====================================
// 回答履歴API
// =====================================

app.post('/api/answers', (req, res) => {
    const { sessionId, storyId, questionIndex, answer } = req.body;

    db.prepare(`
        INSERT INTO answers (session_id, story_id, question_index, answer)
        VALUES (?, ?, ?, ?)
    `).run(sessionId, storyId, questionIndex, answer);

    res.json({ success: true });
});

app.get('/api/answers', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const answers = db.prepare(`
        SELECT a.*, s.title as story_title FROM answers a
        LEFT JOIN stories s ON a.story_id = s.id
        ORDER BY a.created_at DESC LIMIT ?
    `).all(limit);
    res.json(answers);
});

// =====================================
// 統計API
// =====================================

app.get('/api/stats', (req, res) => {
    // 人気の物語ランキング
    const storyRanking = db.prepare(`
        SELECT s.id, s.title, s.emoji, COALESCE(SUM(st.views), 0) as views
        FROM stories s
        LEFT JOIN stats st ON s.id = st.story_id
        GROUP BY s.id
        ORDER BY views DESC
    `).all();

    // 人気のページランキング
    const pageRanking = db.prepare(`
        SELECT st.story_id, s.title as story_title, st.page_index, SUM(st.views) as views
        FROM stats st
        LEFT JOIN stories s ON st.story_id = s.id
        GROUP BY st.story_id, st.page_index
        ORDER BY views DESC
        LIMIT 20
    `).all();

    // 日別統計
    const dailyStats = db.prepare(`
        SELECT date, SUM(views) as views,
        (SELECT COUNT(DISTINCT session_id) FROM access_logs WHERE DATE(created_at) = stats.date) as sessions
        FROM stats
        GROUP BY date
        ORDER BY date DESC
        LIMIT 30
    `).all();

    // 総閲覧数
    const totalViews = db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM stats').get();

    res.json({
        storyRanking,
        pageRanking,
        dailyStats,
        totalViews: totalViews.total
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`📊 管理APIサーバー起動: http://localhost:${PORT}`);
    console.log(`📁 データベース: ${DB_PATH}`);
    console.log('================================');
});
