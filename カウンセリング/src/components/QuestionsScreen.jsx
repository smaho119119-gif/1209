import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const API_URL = 'http://localhost:3001';

// セッションIDを取得
function getSessionId() {
    return sessionStorage.getItem('storybook_session_id') || 'unknown';
}

// 回答を送信
async function sendAnswer(storyId, questionIndex, answer) {
    try {
        await fetch(`${API_URL}/api/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: getSessionId(),
                storyId,
                questionIndex,
                answer
            })
        });
    } catch (e) {
        console.warn('Failed to send answer:', e);
    }
}

/**
 * QuestionsScreen - キャラクターを通した質問画面
 */
export function QuestionsScreen() {
    const {
        navigateTo,
        getCurrentStory,
        getCurrentTheme,
        sessionData,
        saveAnswer
    } = useApp();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [textAnswer, setTextAnswer] = useState('');

    const story = getCurrentStory();
    const theme = getCurrentTheme();
    const storyId = sessionData.selectedTheme;

    if (!story || !theme) {
        navigateTo('home');
        return null;
    }

    const questions = story.questions || [];

    if (questions.length === 0) {
        // 質問がない場合は要約へ
        navigateTo('summary');
        return null;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleSubmitAnswer = () => {
        if (!textAnswer.trim()) return;

        // ローカルに保存
        saveAnswer(`q${currentQuestionIndex}`, textAnswer);

        // APIに送信
        sendAnswer(storyId, currentQuestionIndex, textAnswer);

        if (isLastQuestion) {
            navigateTo('summary');
        } else {
            setTextAnswer('');
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        if (isLastQuestion) {
            navigateTo('summary');
        } else {
            setTextAnswer('');
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    return (
        <div className="screen active questions-screen">
            {/* Header */}
            <div className="questions-header">
                <button className="icon-button" onClick={() => navigateTo('home')}>
                    🏠
                </button>
                <div className="character-badge">
                    <span className="character-emoji">{theme.emoji}</span>
                    <span className="character-name">{currentQuestion.character}のこと</span>
                </div>
                <div className="question-progress">
                    {currentQuestionIndex + 1}/{questions.length}
                </div>
            </div>

            {/* Question */}
            <div className="question-container">
                <p className="question-text">{currentQuestion.question}</p>
            </div>

            {/* Text Input */}
            <div className="question-input-container">
                <textarea
                    className="question-textarea"
                    placeholder={`${currentQuestion.character}について思ったことを教えてね...`}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    rows={4}
                />
            </div>

            {/* Action Buttons */}
            <div className="question-actions">
                <button className="skip-button" onClick={handleSkip}>
                    スキップ
                </button>
                <button
                    className="primary-button"
                    onClick={handleSubmitAnswer}
                    disabled={!textAnswer.trim()}
                >
                    {isLastQuestion ? 'おわり' : 'つぎへ'}
                </button>
            </div>
        </div>
    );
}
