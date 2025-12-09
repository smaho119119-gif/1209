import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateImage, toDataUrl, MODELS } from '../services/geminiApi';
import {
    speak, stopSpeaking, initSpeechSynthesis,
    VOICEVOX_SPEAKERS, OPENAI_VOICES,
    checkVoicevoxAvailable, isOpenAIAvailable
} from '../services/ttsService';

// LocalStorageから画像を読み込む
const STORAGE_KEY = 'storybook_images';
const TTS_SETTINGS_KEY = 'tts_settings';

function loadSavedImages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

function saveImagesToStorage(images) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
        console.warn('Failed to save images to localStorage:', e);
    }
}

function loadTTSSettings() {
    try {
        const saved = localStorage.getItem(TTS_SETTINGS_KEY);
        return saved ? JSON.parse(saved) : { engine: 'voicevox', voice: 'zundamon_normal' };
    } catch {
        return { engine: 'voicevox', voice: 'zundamon_normal' };
    }
}

function saveTTSSettings(settings) {
    try {
        localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save TTS settings:', e);
    }
}

/**
 * StoryScreen - 絵本閲覧画面（VOICEVOX対応）
 */
export function StoryScreen() {
    const {
        navigateTo,
        sessionData,
        getCurrentStory,
        getCurrentTheme,
        nextPage,
        prevPage
    } = useApp();

    // 画像関連
    const [allSavedImages, setAllSavedImages] = useState(loadSavedImages);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel] = useState('flash');
    const [error, setError] = useState(null);

    // バックグラウンド生成
    const [autoGenerating, setAutoGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
    const generationRef = useRef({ cancelled: false });

    // 音声関連
    const [ttsSettings, setTtsSettings] = useState(loadTTSSettings);
    const [isSpeakingState, setIsSpeakingState] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [autoRead, setAutoRead] = useState(true);
    const [showTTSSelector, setShowTTSSelector] = useState(false);
    const [voicevoxAvailable, setVoicevoxAvailable] = useState(false);

    const isMounted = useRef(true);
    const openAIAvailable = isOpenAIAvailable();

    const story = getCurrentStory();
    const theme = getCurrentTheme();
    const currentPage = sessionData.currentPage;
    const storyId = sessionData.selectedTheme;

    // マウント時
    useEffect(() => {
        isMounted.current = true;
        generationRef.current.cancelled = false;
        initSpeechSynthesis();

        // VOICEVOX確認
        checkVoicevoxAvailable().then(available => {
            setVoicevoxAvailable(available);
            if (!available && ttsSettings.engine === 'voicevox') {
                // VOICEVOXが使えない場合、他のエンジンにフォールバック
                const newSettings = {
                    engine: openAIAvailable ? 'openai' : 'browser',
                    voice: openAIAvailable ? 'nova' : ''
                };
                setTtsSettings(newSettings);
                saveTTSSettings(newSettings);
            }
        });

        // 自動生成開始
        if (story) {
            startBackgroundGeneration();
        }

        return () => {
            isMounted.current = false;
            generationRef.current.cancelled = true;
            stopSpeaking();
        };
    }, [storyId]);

    // ページ変更時
    useEffect(() => {
        setError(null);
        stopSpeaking();
        setIsSpeakingState(false);
        setIsLoadingAudio(false);

        if (autoRead && story && story.pages[currentPage]) {
            const timer = setTimeout(() => {
                if (isMounted.current) handleSpeak();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentPage, autoRead]);

    // バックグラウンドで全ページの画像を生成
    const startBackgroundGeneration = async () => {
        if (!story || autoGenerating) return;

        const storyImages = allSavedImages[storyId] || {};
        const pagesToGenerate = [];

        for (let i = 0; i < story.pages.length; i++) {
            if (!storyImages[i]) {
                pagesToGenerate.push(i);
            }
        }

        if (pagesToGenerate.length === 0) return;

        setAutoGenerating(true);
        setGenerationProgress({ current: 0, total: pagesToGenerate.length });

        for (let i = 0; i < pagesToGenerate.length; i++) {
            if (generationRef.current.cancelled) break;

            const pageIndex = pagesToGenerate[i];
            const page = story.pages[pageIndex];

            try {
                const result = await generateImage(page.imagePrompt, selectedModel);

                if (result.success && isMounted.current) {
                    const imageUrl = toDataUrl(result.imageData, result.mimeType);

                    setAllSavedImages(prev => {
                        const newImages = {
                            ...prev,
                            [storyId]: {
                                ...(prev[storyId] || {}),
                                [pageIndex]: imageUrl
                            }
                        };
                        saveImagesToStorage(newImages);
                        return newImages;
                    });
                }
            } catch (err) {
                console.error(`Failed to generate image for page ${pageIndex}:`, err);
            }

            if (isMounted.current) {
                setGenerationProgress({ current: i + 1, total: pagesToGenerate.length });
            }

            await new Promise(r => setTimeout(r, 500));
        }

        if (isMounted.current) {
            setAutoGenerating(false);
        }
    };

    if (!story || !theme) {
        navigateTo('select-story');
        return null;
    }

    const page = story.pages[currentPage];
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === story.pages.length - 1;
    const progress = ((currentPage + 1) / story.pages.length) * 100;

    const storyImages = allSavedImages[storyId] || {};
    const currentImage = storyImages[currentPage];

    // 音声読み上げ
    const handleSpeak = async () => {
        if (isSpeakingState || isLoadingAudio) {
            stopSpeaking();
            setIsSpeakingState(false);
            setIsLoadingAudio(false);
            return;
        }

        setIsLoadingAudio(true);
        setError(null);

        try {
            await speak(page.text, {
                engine: ttsSettings.engine,
                voice: ttsSettings.voice
            });

            if (isMounted.current) {
                setIsLoadingAudio(false);
                setIsSpeakingState(true);
            }
        } catch (err) {
            console.error('Speech error:', err);
            if (isMounted.current) {
                setError(`音声エラー: ${err.message}`);
                setIsLoadingAudio(false);
            }
        } finally {
            if (isMounted.current) {
                setIsSpeakingState(false);
            }
        }
    };

    // TTS設定を変更
    const handleChangeTTS = (engine, voice) => {
        const newSettings = { engine, voice };
        setTtsSettings(newSettings);
        saveTTSSettings(newSettings);
        setShowTTSSelector(false);
    };

    // 現在のページの画像を再生成
    const handleRegenerateImage = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateImage(page.imagePrompt, selectedModel);

            if (result.success) {
                const imageUrl = toDataUrl(result.imageData, result.mimeType);
                const newImages = {
                    ...allSavedImages,
                    [storyId]: { ...storyImages, [currentPage]: imageUrl }
                };
                setAllSavedImages(newImages);
                saveImagesToStorage(newImages);
            } else {
                setError(result.error || '画像の生成に失敗しました');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteImage = () => {
        const newStoryImages = { ...storyImages };
        delete newStoryImages[currentPage];
        const newImages = { ...allSavedImages, [storyId]: newStoryImages };
        setAllSavedImages(newImages);
        saveImagesToStorage(newImages);
    };

    // ホームに戻る
    const handleGoHome = () => {
        stopSpeaking();
        generationRef.current.cancelled = true;
        navigateTo('home');
    };

    // 絵本選択に戻る
    const handleGoToStorySelect = () => {
        stopSpeaking();
        generationRef.current.cancelled = true;
        navigateTo('select-story');
    };

    const savedCount = Object.keys(storyImages).length;
    const totalPages = story.pages.length;

    // 現在のTTS表示名
    const getCurrentTTSName = () => {
        if (ttsSettings.engine === 'voicevox') {
            return VOICEVOX_SPEAKERS[ttsSettings.voice]?.name || 'VOICEVOX';
        } else if (ttsSettings.engine === 'openai') {
            return OPENAI_VOICES[ttsSettings.voice]?.name || 'OpenAI';
        }
        return 'ブラウザ';
    };

    const getCurrentTTSEmoji = () => {
        if (ttsSettings.engine === 'voicevox') {
            return VOICEVOX_SPEAKERS[ttsSettings.voice]?.emoji || '🎤';
        } else if (ttsSettings.engine === 'openai') {
            return '✨';
        }
        return '📱';
    };

    return (
        <div
            className="screen active story-screen"
            style={{ backgroundColor: page.backgroundColor }}
        >
            {/* Header */}
            <div className="story-header">
                <div className="header-left">
                    <button className="icon-button" onClick={handleGoHome} title="ホームに戻る">
                        🏠
                    </button>
                    <button className="icon-button" onClick={handleGoToStorySelect} title="絵本選択に戻る">
                        📚
                    </button>
                </div>
                <div className="story-header-title">
                    <span className="story-header-emoji">{theme.emoji}</span>
                    <span>{story.title}</span>
                </div>
                <div className="page-indicator">
                    {currentPage + 1}/{totalPages}
                    {autoGenerating ? (
                        <span className="generation-badge">
                            🎨 {generationProgress.current}/{generationProgress.total}
                        </span>
                    ) : savedCount === totalPages ? (
                        <span className="saved-badge complete">✅</span>
                    ) : (
                        <span className="saved-badge">💾{savedCount}/{totalPages}</span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="story-progress">
                <div className="story-progress-bar" style={{ width: `${progress}%` }} />
            </div>

            {/* Story Content */}
            <div className="story-content">
                {/* Illustration */}
                <div className="story-illustration">
                    {currentImage ? (
                        <img src={currentImage} alt={`Page ${currentPage + 1}`} className="generated-image" />
                    ) : (
                        <div className="illustration-placeholder generating">
                            <span className="illustration-emoji">{theme.emoji}</span>
                            {autoGenerating && <span className="generating-text">生成中...</span>}
                        </div>
                    )}
                </div>

                {/* Audio Controls */}
                <div className="audio-controls">
                    <button
                        className={`speak-button ${isSpeakingState ? 'speaking' : ''} ${isLoadingAudio ? 'loading' : ''}`}
                        onClick={handleSpeak}
                    >
                        {isLoadingAudio ? (
                            <>
                                <span className="loading-spinner small"></span>
                                準備中...
                            </>
                        ) : isSpeakingState ? (
                            '⏹️ とめる'
                        ) : (
                            '🔊 よみあげる'
                        )}
                    </button>

                    <button
                        className="voice-toggle"
                        onClick={() => setShowTTSSelector(!showTTSSelector)}
                    >
                        {getCurrentTTSEmoji()} {getCurrentTTSName()}
                    </button>

                    <label className="auto-read-toggle">
                        <input
                            type="checkbox"
                            checked={autoRead}
                            onChange={(e) => setAutoRead(e.target.checked)}
                        />
                        <span>自動</span>
                    </label>
                </div>

                {/* TTS Selector */}
                {showTTSSelector && (
                    <div className="voice-selector">
                        {/* VOICEVOX */}
                        {voicevoxAvailable && (
                            <>
                                <div className="model-selector-title">🟢 VOICEVOX</div>
                                {Object.entries(VOICEVOX_SPEAKERS).map(([key, speaker]) => (
                                    <button
                                        key={key}
                                        className={`model-option ${ttsSettings.engine === 'voicevox' && ttsSettings.voice === key ? 'selected' : ''}`}
                                        onClick={() => handleChangeTTS('voicevox', key)}
                                    >
                                        <span className="model-name">{speaker.emoji} {speaker.name}</span>
                                    </button>
                                ))}
                            </>
                        )}

                        {!voicevoxAvailable && (
                            <div className="tts-unavailable">
                                ⚠️ VOICEVOXが起動していません
                            </div>
                        )}

                        {/* OpenAI */}
                        {openAIAvailable && (
                            <>
                                <div className="model-selector-title">✨ OpenAI</div>
                                {Object.entries(OPENAI_VOICES).map(([key, voice]) => (
                                    <button
                                        key={key}
                                        className={`model-option ${ttsSettings.engine === 'openai' && ttsSettings.voice === key ? 'selected' : ''}`}
                                        onClick={() => handleChangeTTS('openai', key)}
                                    >
                                        <span className="model-name">{voice.name}</span>
                                        <span className="model-desc">{voice.description}</span>
                                    </button>
                                ))}
                            </>
                        )}

                        {/* Browser */}
                        <div className="model-selector-title">📱 ブラウザ</div>
                        <button
                            className={`model-option ${ttsSettings.engine === 'browser' ? 'selected' : ''}`}
                            onClick={() => handleChangeTTS('browser', '')}
                        >
                            <span className="model-name">内蔵音声</span>
                            <span className="model-desc">オフライン対応</span>
                        </button>
                    </div>
                )}

                {/* Image Controls */}
                <div className="image-controls compact">
                    {currentImage && !isGenerating && (
                        <div className="image-actions">
                            <button className="regenerate-button small" onClick={handleRegenerateImage} disabled={autoGenerating}>
                                🔄
                            </button>
                            <button className="delete-button small" onClick={handleDeleteImage}>
                                🗑️
                            </button>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="generating-status">
                            <span className="loading-spinner"></span>
                        </div>
                    )}

                    {error && <div className="error-message compact">⚠️ {error}</div>}
                </div>

                {/* Story Text */}
                <div className="story-text-container">
                    <p className={`story-text ${isSpeakingState || isLoadingAudio ? 'reading' : ''}`}>{page.text}</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="story-navigation">
                <button
                    className="nav-button prev"
                    onClick={() => { stopSpeaking(); prevPage(); }}
                    disabled={isFirstPage || isGenerating || isLoadingAudio}
                >
                    ◀ もどる
                </button>

                <button
                    className="nav-button next primary"
                    onClick={() => { stopSpeaking(); nextPage(); }}
                    disabled={isGenerating || isLoadingAudio}
                >
                    {isLastPage ? 'おわり ▶' : 'つぎへ ▶'}
                </button>
            </div>
        </div>
    );
}
