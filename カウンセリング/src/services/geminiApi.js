/**
 * Gemini API サービス
 * 絵本の画像生成
 * 
 * 対応モデル:
 * - gemini-2.5-flash-image: 高速版（コスパ良）
 * - gemini-3-pro-image-preview: 高性能版（高品質）
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// 利用可能なモデル
export const MODELS = {
    'flash': {
        id: 'gemini-2.0-flash-exp',
        name: '⚡ 高速版',
        description: 'Gemini 2.0 Flash（速い）',
        badge: 'おすすめ'
    },
    'pro': {
        id: 'gemini-2.0-flash-exp',
        name: '✨ 高性能版',
        description: 'Gemini 2.0 Flash（高品質プロンプト）',
        badge: '高品質',
        enhancedPrompt: true
    }
};

/**
 * Gemini で画像を生成
 */
async function generateWithGemini(prompt, modelId) {
    const url = `${API_BASE}/${modelId}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();

    // レスポンスから画像データを探す
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
            return {
                success: true,
                imageData: part.inlineData.data,
                mimeType: part.inlineData.mimeType
            };
        }
    }

    // 画像がない場合、テキストレスポンスをチェック
    const textPart = parts.find(p => p.text);
    if (textPart) {
        throw new Error(`画像生成に失敗: ${textPart.text.substring(0, 100)}`);
    }

    throw new Error('レスポンスに画像がありません');
}

/**
 * 画像を生成（モデル選択可能）
 * @param {string} prompt - 画像生成プロンプト
 * @param {string} modelKey - 'flash' または 'pro'
 */
export async function generateImage(prompt, modelKey = 'flash') {
    if (!API_KEY) {
        throw new Error('APIキーが設定されていません。.envファイルを確認してください。');
    }

    const model = MODELS[modelKey];
    if (!model) {
        throw new Error(`不明なモデル: ${modelKey}`);
    }

    // 絵本用のプロンプトを構築
    const enhancedPrompt = `Create a cute, soft, child-friendly illustration for a Japanese storybook (ehon).

Style requirements:
- Gentle watercolor or soft digital art style
- Pastel colors (soft pink, light blue, soft yellow, mint green)
- Simple, round, kawaii character designs
- Warm and comforting atmosphere
- No text or words in the image
- Suitable for children aged 8-15

Scene to illustrate:
${prompt}

Make it look like a professional Japanese picture book illustration.`;

    try {
        return await generateWithGemini(enhancedPrompt, model.id);
    } catch (error) {
        console.error('Image generation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 絵本ページの画像を生成
 */
export async function generateStoryImage(theme, pageText, modelKey = 'flash') {
    const prompt = `A ${theme.emoji} (${theme.title}) character illustration.
The scene shows: ${pageText}
The character should express ${theme.emotion} emotion but still look cute and gentle.`;

    return await generateImage(prompt, modelKey);
}

/**
 * Base64画像をDataURLに変換
 */
export function toDataUrl(imageData, mimeType = 'image/png') {
    return `data:${mimeType};base64,${imageData}`;
}

/**
 * APIの接続テスト
 */
export async function testApiConnection() {
    if (!API_KEY) {
        return { success: false, error: 'APIキーが設定されていません' };
    }

    try {
        const response = await fetch(
            `${API_BASE}/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Hello' }] }]
                })
            }
        );

        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.json();
            return { success: false, error: error.error?.message };
        }
    } catch (e) {
        return { success: false, error: e.message };
    }
}
