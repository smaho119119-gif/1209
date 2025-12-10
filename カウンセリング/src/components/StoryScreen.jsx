import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { stopSpeaking } from '../services/ttsService';

const API_URL = 'http://localhost:3001';

// セッションIDを生成
function getSessionId() {
    let sessionId = sessionStorage.getItem('storybook_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('storybook_session_id', sessionId);
    }
    return sessionId;
}

// ログを送信
async function sendLog(type, storyId, pageIndex, data = null) {
    try {
        await fetch(`${API_URL}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: getSessionId(),
                type,
                storyId,
                pageIndex,
                data
            })
        });
    } catch (e) {
        console.warn('Failed to send log:', e);
    }
}

/**
 * StoryScreen - 絵本閲覧画面（事前生成アセット対応版）
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

    // アセット関連
    const [assetInfo, setAssetInfo] = useState(null);
    const [isLoadingAssets, setIsLoadingAssets] = useState(true);

    // 音声関連
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoRead, setAutoRead] = useState(true);
    const audioRef = useRef(null);

    const isMounted = useRef(true);

    const story = getCurrentStory();
    const theme = getCurrentTheme();
    const currentPage = sessionData.currentPage;
    const storyId = sessionData.selectedTheme;

    // マウント時にアセット情報を取得
    useEffect(() => {
        isMounted.current = true;

        const fetchAssets = async () => {
            try {
                const res = await fetch(`${API_URL}/api/assets/status`);
                const data = await res.json();
                setAssetInfo(data[storyId]);

                // セッション開始ログ
                sendLog('session_start', storyId, 0);
            } catch (e) {
                console.warn('Failed to fetch assets:', e);
            } finally {
                setIsLoadingAssets(false);
            }
        };

        fetchAssets();

        return () => {
            isMounted.current = false;
            stopAudio();
        };
    }, [storyId]);

    // ページ変更時
    useEffect(() => {
        stopAudio();

        // ページビューログ
        sendLog('page_view', storyId, currentPage);

        // 自動読み上げ
        if (autoRead && assetInfo?.pages?.[currentPage]?.hasAudio) {
            const timer = setTimeout(() => {
                if (isMounted.current) playAudio();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentPage, assetInfo, autoRead]);

    // 音声を停止
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        stopSpeaking();
    };

    // 音声を再生
    const playAudio = () => {
        const pageData = assetInfo?.pages?.[currentPage];
        if (!pageData?.hasAudio || !pageData?.audioPath) return;

        if (isPlaying) {
            stopAudio();
            return;
        }

        const audio = new Audio(pageData.audioPath);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        audio.play().catch(console.error);
    };

    if (!story || !theme) {
        navigateTo('select-story');
        return null;
    }

    const page = story.pages[currentPage];
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === story.pages.length - 1;
    const progress = ((currentPage + 1) / story.pages.length) * 100;

    const pageAsset = assetInfo?.pages?.[currentPage];
    const hasImage = pageAsset?.hasImage;
    const hasAudio = pageAsset?.hasAudio;
    const imagePath = pageAsset?.imagePath;

    // ホームに戻る
    const handleGoHome = () => {
        stopAudio();
        navigateTo('home');
    };

    // 絵本選択に戻る
    const handleGoToStorySelect = () => {
        stopAudio();
        navigateTo('select-story');
    };

    // 次のページへ
    const handleNext = () => {
        stopAudio();
        if (isLastPage) {
            // 質問画面へ
            navigateTo('questions');
        } else {
            nextPage();
        }
    };

    // 前のページへ
    const handlePrev = () => {
        stopAudio();
        prevPage();
    };

    const totalPages = story.pages.length;

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
                    {isLoadingAssets ? (
                        <div className="illustration-placeholder">
                            <span className="loading-spinner"></span>
                        </div>
                    ) : hasImage ? (
                        <img src={imagePath} alt={`Page ${currentPage + 1}`} className="generated-image" />
                    ) : (
                        <div className="illustration-placeholder">
                            <span className="illustration-emoji">{theme.emoji}</span>
                        </div>
                    )}
                </div>

                {/* Audio Controls */}
                <div className="audio-controls">
                    <button
                        className={`speak-button ${isPlaying ? 'speaking' : ''}`}
                        onClick={playAudio}
                        disabled={!hasAudio}
                    >
                        {isPlaying ? '⏹️ とめる' : '🔊 よみあげる'}
                    </button>

                    {assetInfo?.speakerName && (
                        <span className="voice-badge">
                            🎤 {assetInfo.speakerName}
                        </span>
                    )}

                    <label className="auto-read-toggle">
                        <input
                            type="checkbox"
                            checked={autoRead}
                            onChange={(e) => setAutoRead(e.target.checked)}
                        />
                        <span>自動</span>
                    </label>
                </div>

                {/* Story Text */}
                <div className="story-text-container">
                    <p className={`story-text ${isPlaying ? 'reading' : ''}`}>{page.text}</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="story-navigation">
                <button
                    className="nav-button prev"
                    onClick={handlePrev}
                    disabled={isFirstPage}
                >
                    ◀ もどる
                </button>

                <button
                    className="nav-button next primary"
                    onClick={handleNext}
                >
                    {isLastPage ? 'しつもんへ ▶' : 'つぎへ ▶'}
                </button>
            </div>
        </div>
    );
}
