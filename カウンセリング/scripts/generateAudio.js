/**
 * VOICEVOX音声事前生成スクリプト（話者選択対応版）
 * 
 * 使い方:
 * node scripts/generateAudio.js                          # 全物語をずんだもんで
 * node scripts/generateAudio.js --speaker=metan          # 全物語を四国めたんで
 * node scripts/generateAudio.js --story=lonely --speaker=tsumugi  # 特定物語を特定話者で
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOICEVOX_URL = 'http://127.0.0.1:50021';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

// VOICEVOXの話者一覧
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
    takehiro: { id: 21, name: '剣崎雌雄', folder: 'takehiro' },
    kotarou: { id: 51, name: 'WhiteCUL', folder: 'whitecul' },
};

// 物語ごとのおすすめ話者
const STORY_RECOMMENDED_SPEAKERS = {
    lonely: 'metan',       // 寂しいうさぎ → 優しい四国めたん
    angry: 'zundamon',     // 怒ったくま → 元気なずんだもん
    anxious: 'tsumugi',    // こわがりねこ → 明るい春日部つむぎ
    sad: 'metan_amaama',   // かなしいペンギン → 甘めたん
    tired: 'himari',       // つかれたわんこ → ひまり
    confused: 'sora',      // まよったきつね → 九州そら
};

// 物語データ
const storybooks = {
    lonely: {
        id: 'lonely',
        title: 'ひとりぼっちのうさぎ',
        pages: [
            { text: 'うさぎのミミは、今日もひとりでお部屋にいました。窓の外では、他の動物たちが楽しそうに遊んでいます。' },
            { text: '「どうして私は、みんなと遊べないんだろう」ミミはため息をつきました。' },
            { text: 'そんな時、小さなてんとう虫がミミの窓辺にやってきました。「こんにちは、何をしているの？」' },
            { text: 'ミミは驚きましたが、少しだけ嬉しくなりました。「ひとりで...お空を見てたの」' },
            { text: 'てんとう虫は言いました。「ひとりの時間も大切だよ。でも、話したくなったら私がいるからね」ミミの心が少しあたたかくなりました。' }
        ]
    },
    angry: {
        id: 'angry',
        title: 'おこったくまさん',
        pages: [
            { text: 'くまのポンタは、朝からイライラしていました。何をしても、うまくいかない気がします。' },
            { text: 'お気に入りのはちみつ壺が空っぽだったのです。「もう！どうして！」ポンタは大きな声を出しました。' },
            { text: '怒ったポンタは、森の中をドスドス歩きました。すると、小川のそばで小鳥が歌っていました。' },
            { text: '「どうしたの、くまさん？」小鳥が聞きました。ポンタは「はちみつがなくて...悔しいんだ」と言いました。' },
            { text: '小鳥は言いました。「怒ってもいいんだよ。でも、深呼吸してみて」ポンタが深呼吸すると、少し落ち着いてきました。' }
        ]
    },
    anxious: {
        id: 'anxious',
        title: 'こわがりねこちゃん',
        pages: [
            { text: 'ねこのタマは、いつもドキドキしていました。知らない場所や、大きな音が怖いのです。' },
            { text: '今日は初めての場所に行かなければなりません。タマの心臓はバクバクします。' },
            { text: '「怖いよ...どうしよう」タマは小さな声でつぶやきました。' },
            { text: 'その時、年寄りのふくろうがやってきました。「怖いと感じるのは、自分を守ろうとしているからだよ」' },
            { text: '「小さな一歩でいいんだ。無理しなくていい」ふくろうの言葉で、タマは少しだけ勇気が出ました。' }
        ]
    },
    sad: {
        id: 'sad',
        title: 'かなしいペンギン',
        pages: [
            { text: 'ペンギンのペンは、大切な友達と会えなくなって、とても悲しい気持ちでした。' },
            { text: '涙がポロポロ流れます。「もう会えないのかな...」ペンは海を見つめました。' },
            { text: 'アザラシのおじさんがやってきました。「泣いてもいいんだよ。悲しい時は泣くのが一番だ」' },
            { text: 'ペンは思いっきり泣きました。泣いているうちに、少しずつ心が軽くなってきました。' },
            { text: '「大切な思い出は、心の中にずっとあるんだよ」その言葉がペンの心にしみました。' }
        ]
    },
    tired: {
        id: 'tired',
        title: 'つかれたわんこ',
        pages: [
            { text: 'いぬのポチは、毎日がんばりすぎて、とても疲れていました。何もする気が起きません。' },
            { text: '「もう何もしたくない...」ポチはベッドに横になりました。' },
            { text: 'お母さん犬がやってきて、そっと寄り添いました。「今日はゆっくり休もうね」' },
            { text: 'ポチは安心して目を閉じました。休むことも大切なお仕事なのです。' },
            { text: '次の日、ポチは少しだけ元気になりました。「無理しなくていいんだ」とわかったからです。' }
        ]
    },
    confused: {
        id: 'confused',
        title: 'まよったきつねさん',
        pages: [
            { text: 'きつねのコンは、道に迷ってしまいました。どっちに行けばいいかわかりません。' },
            { text: '「右かな？左かな？」コンは立ち止まって考えました。' },
            { text: 'そこにたぬきのおじいさんが通りかかりました。「どうしたんじゃ？」' },
            { text: '「道がわからなくて...」コンは正直に言いました。' },
            { text: '「迷ったら、誰かに聞いていいんじゃよ。一人で抱え込まなくていい」たぬきは優しく道を教えてくれました。' }
        ]
    }
};

// コマンドライン引数を解析
function parseArgs() {
    const args = process.argv.slice(2);
    const options = { speaker: null, story: null };

    for (const arg of args) {
        if (arg.startsWith('--speaker=')) {
            options.speaker = arg.split('=')[1];
        } else if (arg.startsWith('--story=')) {
            options.story = arg.split('=')[1];
        }
    }

    return options;
}

// VOICEVOXで音声を生成
async function generateAudio(text, speakerId) {
    const queryResponse = await fetch(
        `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        { method: 'POST' }
    );

    if (!queryResponse.ok) {
        throw new Error(`audio_query failed: ${queryResponse.status}`);
    }

    const query = await queryResponse.json();
    query.speedScale = 0.85;
    query.pitchScale = 0.02;
    query.volumeScale = 1.2;

    const synthesisResponse = await fetch(
        `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        }
    );

    if (!synthesisResponse.ok) {
        throw new Error(`synthesis failed: ${synthesisResponse.status}`);
    }

    return Buffer.from(await synthesisResponse.arrayBuffer());
}

// メイン処理
async function main() {
    const options = parseArgs();

    console.log('🎤 VOICEVOX音声生成スクリプト（話者選択対応版）');
    console.log('================================');
    console.log('利用可能な話者:');
    for (const [key, speaker] of Object.entries(SPEAKERS)) {
        console.log(`  ${key}: ${speaker.name} (ID: ${speaker.id})`);
    }
    console.log('================================');

    // VOICEVOXの接続確認
    try {
        const versionRes = await fetch(`${VOICEVOX_URL}/version`);
        if (!versionRes.ok) throw new Error('接続失敗');
        const version = await versionRes.text();
        console.log(`✅ VOICEVOX接続OK (version: ${version})\n`);
    } catch (e) {
        console.error('❌ VOICEVOXに接続できません。VOICEVOXを起動してください。');
        process.exit(1);
    }

    // 生成対象を決定
    const storiesToGenerate = options.story
        ? { [options.story]: storybooks[options.story] }
        : storybooks;

    let totalGenerated = 0;
    let totalSkipped = 0;

    for (const [storyId, story] of Object.entries(storiesToGenerate)) {
        if (!story) {
            console.log(`⚠️ 物語 "${storyId}" が見つかりません`);
            continue;
        }

        // 話者を決定（引数 > おすすめ > デフォルト）
        const speakerKey = options.speaker || STORY_RECOMMENDED_SPEAKERS[storyId] || 'zundamon';
        const speaker = SPEAKERS[speakerKey];

        if (!speaker) {
            console.log(`⚠️ 話者 "${speakerKey}" が見つかりません`);
            continue;
        }

        console.log(`📖 ${story.title} [${speaker.name}]`);

        // 話者別のディレクトリ: public/audio/{speaker}/{storyId}/
        const storyDir = path.join(OUTPUT_DIR, speaker.folder, storyId);
        if (!fs.existsSync(storyDir)) {
            fs.mkdirSync(storyDir, { recursive: true });
        }

        for (let i = 0; i < story.pages.length; i++) {
            const page = story.pages[i];
            const outputPath = path.join(storyDir, `page_${i}.wav`);

            if (fs.existsSync(outputPath)) {
                console.log(`  ⏭️  ページ ${i + 1}: スキップ（既存）`);
                totalSkipped++;
                continue;
            }

            try {
                console.log(`  🔊 ページ ${i + 1}: 生成中...`);
                const audioBuffer = await generateAudio(page.text, speaker.id);
                fs.writeFileSync(outputPath, audioBuffer);
                console.log(`  ✅ ページ ${i + 1}: 完了`);
                totalGenerated++;

                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.error(`  ❌ ページ ${i + 1}: エラー - ${e.message}`);
            }
        }
    }

    console.log('\n================================');
    console.log(`✨ 完了！ 生成: ${totalGenerated}件, スキップ: ${totalSkipped}件`);
    console.log(`📁 出力先: ${OUTPUT_DIR}`);
}

main().catch(console.error);
