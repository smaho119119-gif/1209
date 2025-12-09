import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

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

    const story = getCurrentStory();
    const theme = getCurrentTheme();

    if (!story || !theme) {
        navigateTo('home');
        return null;
    }

    const questions = story.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = sessionData.answers[currentQuestion.id];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleSelectOption = (optionId) => {
        saveAnswer(currentQuestion.id, optionId);
    };

    const handleNext = () => {
        if (!selectedAnswer) return;

        if (isLastQuestion) {
            navigateTo('summary');
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    return (
        <div className="screen active questions-screen">
            {/* Header */}
            <div className="questions-header">
                <div className="character-badge">
                    <span className="character-emoji">{theme.emoji}</span>
                    <span className="character-name">{story.character}のこと</span>
                </div>
                <div className="question-progress">
                    {currentQuestionIndex + 1}/{questions.length}
                </div>
            </div>

            {/* Question */}
            <div className="question-container">
                <p className="question-text">{currentQuestion.text}</p>
            </div>

            {/* Options */}
            <div className="question-options">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option.id}
                        className={`question-option ${selectedAnswer === option.id ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(option.id)}
                    >
                        <span className="option-emoji">{option.emoji}</span>
                        <span className="option-label">{option.label}</span>
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <div className="question-action">
                {selectedAnswer && (
                    <button
                        className="primary-button"
                        onClick={handleNext}
                    >
                        {isLastQuestion ? 'おわり' : 'つぎへ'}
                    </button>
                )}
            </div>
        </div>
    );
}
