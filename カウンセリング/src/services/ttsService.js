/**
 * 音声読み上げ（TTS）サービス
 * 
 * 対応TTS:
 * 1. VOICEVOX（ローカル - ずんだもん等）
 * 2. OpenAI TTS（クラウド - 高品質）
 * 3. ブラウザ内蔵（フォールバック）
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const VOICEVOX_URL = 'http://127.0.0.1:50021';

// VOICEVOX話者ID
export const VOICEVOX_SPEAKERS = {
    'zundamon_normal': { id: 3, name: 'ずんだもん（ノーマル）', emoji: '🟢' },
    'zundamon_amaama': { id: 1, name: 'ずんだもん（あまあま）', emoji: '💚' },
    'zundamon_tsuntsun': { id: 7, name: 'ずんだもん（ツンツン）', emoji: '💢' },
    'metan_normal': { id: 2, name: '四国めたん（ノーマル）', emoji: '🟣' },
    'tsumugi': { id: 8, name: '春日部つむぎ', emoji: '🌸' },
};

// OpenAI話者
export const OPENAI_VOICES = {
    'nova': { name: 'ノヴァ', description: '明るい女性的な声', recommended: true },
    'shimmer': { name: 'シマー', description: '優しい女性的な声' },
    'fable': { name: 'フェイブル', description: '物語向きの温かい声' },
    'alloy': { name: 'アロイ', description: '中性的でバランスの良い声' },
};

// 現在再生中のAudioオブジェクト
let currentAudio = null;
let isPlaying = false;

/**
 * VOICEVOXが起動しているかチェック
 */
export async function checkVoicevoxAvailable() {
    try {
        const response = await fetch(`${VOICEVOX_URL}/version`, {
            method: 'GET',
            mode: 'cors',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * VOICEVOX APIで音声を生成
 */
async function generateWithVoicevox(text, speakerId = 3) {
    // 1. 音声合成用クエリを作成
    const queryResponse = await fetch(
        `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        { method: 'POST' }
    );

    if (!queryResponse.ok) {
        throw new Error('VOICEVOX audio_query failed');
    }

    const query = await queryResponse.json();

    // 読み上げ速度を調整（子供向けにゆっくり）
    query.speedScale = 0.9;
    query.pitchScale = 0.02; // 少し高め

    // 2. 音声データを生成
    const synthesisResponse = await fetch(
        `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        }
    );

    if (!synthesisResponse.ok) {
        throw new Error('VOICEVOX synthesis failed');
    }

    return await synthesisResponse.blob();
}

/**
 * VOICEVOXで音声を再生
 */
export async function speakWithVoicevox(text, speakerKey = 'zundamon_normal') {
    stopSpeaking();

    const speaker = VOICEVOX_SPEAKERS[speakerKey];
    if (!speaker) throw new Error('Unknown VOICEVOX speaker');

    const audioBlob = await generateWithVoicevox(text, speaker.id);
    const url = URL.createObjectURL(audioBlob);

    return new Promise((resolve, reject) => {
        currentAudio = new Audio(url);
        isPlaying = true;

        currentAudio.onended = () => {
            URL.revokeObjectURL(url);
            currentAudio = null;
            isPlaying = false;
            resolve();
        };
        currentAudio.onerror = (e) => {
            URL.revokeObjectURL(url);
            currentAudio = null;
            isPlaying = false;
            reject(new Error('音声の再生に失敗しました'));
        };
        currentAudio.play().catch(reject);
    });
}

/**
 * OpenAI TTS APIで音声を生成
 */
async function generateWithOpenAI(text, voice = 'nova') {
    const response = await fetch(OPENAI_TTS_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voice,
            response_format: 'mp3',
            speed: 0.9
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenAI API Error: ${response.status}`);
    }

    return await response.blob();
}

/**
 * OpenAIで音声を再生
 */
export async function speakWithOpenAI(text, voice = 'nova') {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
        throw new Error('OpenAI APIキーが設定されていません');
    }

    stopSpeaking();

    const audioBlob = await generateWithOpenAI(text, voice);
    const url = URL.createObjectURL(audioBlob);

    return new Promise((resolve, reject) => {
        currentAudio = new Audio(url);
        isPlaying = true;

        currentAudio.onended = () => {
            URL.revokeObjectURL(url);
            currentAudio = null;
            isPlaying = false;
            resolve();
        };
        currentAudio.onerror = (e) => {
            URL.revokeObjectURL(url);
            currentAudio = null;
            isPlaying = false;
            reject(new Error('音声の再生に失敗しました'));
        };
        currentAudio.play().catch(reject);
    });
}

/**
 * ブラウザ内蔵のWeb Speech APIで読み上げ
 */
export function speakWithBrowser(text, options = {}) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('このブラウザは音声合成に対応していません'));
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(v =>
            v.lang.startsWith('ja') &&
            (v.name.includes('Kyoko') || v.name.includes('O-Ren'))
        ) || voices.find(v => v.lang.startsWith('ja'));

        if (japaneseVoice) utterance.voice = japaneseVoice;

        utterance.lang = 'ja-JP';
        utterance.rate = options.rate || 0.85;
        utterance.pitch = options.pitch || 1.1;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        window.speechSynthesis.speak(utterance);
    });
}

/**
 * 音声を停止
 */
export function stopSpeaking() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isPlaying = false;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * 音声が再生中かチェック
 */
export function isSpeaking() {
    return isPlaying || ('speechSynthesis' in window && window.speechSynthesis.speaking);
}

/**
 * 統合的な音声読み上げ関数
 */
export async function speak(text, options = {}) {
    const { engine = 'voicevox', voice = 'zundamon_normal' } = options;

    if (engine === 'voicevox') {
        return await speakWithVoicevox(text, voice);
    } else if (engine === 'openai') {
        return await speakWithOpenAI(text, voice);
    } else {
        return await speakWithBrowser(text);
    }
}

/**
 * OpenAI APIが利用可能かチェック
 */
export function isOpenAIAvailable() {
    return OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';
}

/**
 * 音声合成の初期化
 */
export function initSpeechSynthesis() {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
            resolve([]);
            return;
        }

        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }

        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        };

        setTimeout(() => resolve([]), 1000);
    });
}
