/**
 * Gemini画像事前生成スクリプト
 * 
 * 全ての物語のページ画像をGemini APIで生成して保存
 * 
 * 使い方:
 * VITE_GEMINI_API_KEY=xxx node scripts/generateImages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

// 物語データ（画像プロンプト付き）
const storybooks = {
    lonely: {
        id: 'lonely',
        title: 'ひとりぼっちのうさぎ',
        pages: [
            { imagePrompt: 'A cute lonely white rabbit sitting alone in a cozy room, looking out the window at other animals playing outside, soft watercolor style, children book illustration, warm colors, gentle atmosphere' },
            { imagePrompt: 'A sad white rabbit sighing by the window, soft pastel colors, children book illustration style, emotional, gentle lighting' },
            { imagePrompt: 'A small red ladybug on a windowsill talking to a surprised but happy white rabbit, cute children book illustration, watercolor style, warm and friendly' },
            { imagePrompt: 'A white rabbit and a tiny ladybug having a gentle conversation by the window, soft afternoon light, children book illustration, tender moment' },
            { imagePrompt: 'A white rabbit with a warm smile, a tiny ladybug friend nearby, hearts of friendship, gentle children book illustration, happy ending, soft colors' }
        ]
    },
    angry: {
        id: 'angry',
        title: 'おこったくまさん',
        pages: [
            { imagePrompt: 'An irritated brown bear in the morning, messy fur, grumpy expression, children book illustration, soft watercolor style' },
            { imagePrompt: 'An angry brown bear looking at an empty honey pot, frustrated expression, children book illustration style, dramatic but cute' },
            { imagePrompt: 'An angry brown bear stomping through the forest, a small bird singing by a stream, contrast of emotions, children book illustration' },
            { imagePrompt: 'A brown bear talking to a kind small bird by a stream, sharing feelings, children book illustration, empathetic scene' },
            { imagePrompt: 'A calm brown bear taking a deep breath, peaceful expression, small bird nearby, children book illustration, resolution, soft colors' }
        ]
    },
    anxious: {
        id: 'anxious',
        title: 'こわがりねこちゃん',
        pages: [
            { imagePrompt: 'A nervous small cat with big worried eyes, slightly trembling, children book illustration, soft pastel colors, empathetic style' },
            { imagePrompt: 'A scared cat at the edge of an unfamiliar path, heart pounding visible, children book illustration, gentle anxiety representation' },
            { imagePrompt: 'A frightened small cat whispering to itself, looking small and vulnerable, children book illustration, soft colors, emotional' },
            { imagePrompt: 'A wise old owl approaching a scared small cat, kind and understanding expression, children book illustration, comforting scene' },
            { imagePrompt: 'A small cat taking a tiny brave step forward, owl watching supportively, children book illustration, hopeful, soft warm colors' }
        ]
    },
    sad: {
        id: 'sad',
        title: 'かなしいペンギン',
        pages: [
            { imagePrompt: 'A sad penguin looking at the ocean, missing a friend, tears in eyes, children book illustration, melancholic but gentle, blue tones' },
            { imagePrompt: 'A crying penguin with tears flowing, looking at the sea, children book illustration, emotional, soft watercolor style' },
            { imagePrompt: 'A kind seal approaching a crying penguin, offering comfort, children book illustration, empathetic scene, soft colors' },
            { imagePrompt: 'A penguin crying freely, seal nearby offering support, cathartic moment, children book illustration, healing tears' },
            { imagePrompt: 'A penguin with a gentle smile, holding memories in heart, sunset over ocean, children book illustration, peaceful resolution, warm colors' }
        ]
    },
    tired: {
        id: 'tired',
        title: 'つかれたわんこ',
        pages: [
            { imagePrompt: 'An exhausted puppy dog, droopy eyes, no energy, lying down, children book illustration, soft muted colors, relatable tiredness' },
            { imagePrompt: 'A tired puppy lying in bed, wanting to do nothing, children book illustration, cozy but exhausted feeling, gentle style' },
            { imagePrompt: 'A mother dog gently cuddling with a tired puppy, comforting presence, children book illustration, warm and loving, soft colors' },
            { imagePrompt: 'A peaceful sleeping puppy with mother nearby, safe and resting, children book illustration, serene atmosphere, gentle lighting' },
            { imagePrompt: 'A slightly more energetic puppy the next day, gentle smile, understanding self-care, children book illustration, hopeful, soft morning light' }
        ]
    },
    confused: {
        id: 'confused',
        title: 'まよったきつねさん',
        pages: [
            { imagePrompt: 'A confused orange fox at a crossroads in the forest, looking lost, children book illustration, soft watercolor style, gentle confusion' },
            { imagePrompt: 'A fox standing still, thinking hard about which direction to go, question marks around, children book illustration, cute thinking pose' },
            { imagePrompt: 'An old wise tanuki (raccoon dog) approaching a confused fox, kind expression, children book illustration, helpful encounter' },
            { imagePrompt: 'A fox honestly admitting being lost to a kind old tanuki, vulnerable moment, children book illustration, trust building' },
            { imagePrompt: 'An old tanuki pointing the way to a relieved fox, friendship forming, children book illustration, helpful ending, warm colors' }
        ]
    }
};

// Geminiで画像を生成
async function generateImage(prompt) {
    const enhancedPrompt = `Create a children's storybook illustration: ${prompt}. 
Style: Soft watercolor, gentle colors, warm and comforting, suitable for ages 13-18 therapeutic storytelling.
The image should be emotionally supportive and healing.`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: enhancedPrompt }]
            }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
            return {
                data: Buffer.from(part.inlineData.data, 'base64'),
                mimeType: part.inlineData.mimeType
            };
        }
    }

    throw new Error('No image in response');
}

// メイン処理
async function main() {
    console.log('🎨 Gemini画像生成スクリプト');
    console.log('================================');

    if (!API_KEY) {
        console.error('❌ VITE_GEMINI_API_KEYが設定されていません');
        console.log('使い方: VITE_GEMINI_API_KEY=xxx node scripts/generateImages.js');
        process.exit(1);
    }

    console.log('✅ APIキー確認OK');

    // 出力ディレクトリを作成
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [storyId, story] of Object.entries(storybooks)) {
        console.log(`\n📖 ${story.title}`);

        const storyDir = path.join(OUTPUT_DIR, storyId);
        if (!fs.existsSync(storyDir)) {
            fs.mkdirSync(storyDir, { recursive: true });
        }

        for (let i = 0; i < story.pages.length; i++) {
            const page = story.pages[i];
            const outputPath = path.join(storyDir, `page_${i}.png`);

            // 既存ファイルをスキップ
            if (fs.existsSync(outputPath)) {
                console.log(`  ⏭️  ページ ${i + 1}: スキップ（既存）`);
                totalSkipped++;
                continue;
            }

            try {
                console.log(`  🖼️  ページ ${i + 1}: 生成中...`);
                const result = await generateImage(page.imagePrompt);

                const ext = result.mimeType.includes('png') ? 'png' : 'jpg';
                const finalPath = path.join(storyDir, `page_${i}.${ext}`);
                fs.writeFileSync(finalPath, result.data);

                console.log(`  ✅ ページ ${i + 1}: 完了`);
                totalGenerated++;

                // API制限対策で待機
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.error(`  ❌ ページ ${i + 1}: エラー - ${e.message}`);
                totalErrors++;
                // エラー時は少し長めに待機
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    console.log('\n================================');
    console.log(`✨ 完了！ 生成: ${totalGenerated}件, スキップ: ${totalSkipped}件, エラー: ${totalErrors}件`);
    console.log(`📁 出力先: ${OUTPUT_DIR}`);
}

main().catch(console.error);
