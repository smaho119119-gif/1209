import { createContext, useContext, useState, useCallback } from 'react';
import { storyThemes, getStoryByTheme, getThemeById } from '../data/storybooks';

const AppContext = createContext(null);

const initialSessionData = {
    selectedTheme: null,
    currentPage: 0,
    answers: {},
    completedStory: false
};

export function AppProvider({ children }) {
    const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'select-story', 'story', 'questions', 'summary'
    const [sessionData, setSessionData] = useState(initialSessionData);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    // セッションをリセット
    const resetSession = useCallback(() => {
        setSessionData(initialSessionData);
    }, []);

    // 画面を切り替え
    const navigateTo = useCallback((screen) => {
        setCurrentScreen(screen);
    }, []);

    // テーマを選択
    const selectTheme = useCallback((themeId) => {
        setSessionData(prev => ({
            ...prev,
            selectedTheme: themeId,
            currentPage: 0,
            answers: {},
            completedStory: false
        }));
    }, []);

    // 次のページへ
    const nextPage = useCallback(() => {
        const story = getStoryByTheme(sessionData.selectedTheme);
        if (!story) return;

        if (sessionData.currentPage < story.pages.length - 1) {
            setSessionData(prev => ({
                ...prev,
                currentPage: prev.currentPage + 1
            }));
        } else {
            // 絵本終了、質問画面へ
            setSessionData(prev => ({
                ...prev,
                completedStory: true
            }));
            navigateTo('questions');
        }
    }, [sessionData.selectedTheme, sessionData.currentPage, navigateTo]);

    // 前のページへ
    const prevPage = useCallback(() => {
        if (sessionData.currentPage > 0) {
            setSessionData(prev => ({
                ...prev,
                currentPage: prev.currentPage - 1
            }));
        }
    }, [sessionData.currentPage]);

    // 質問への回答を保存
    const saveAnswer = useCallback((questionId, answerId) => {
        setSessionData(prev => ({
            ...prev,
            answers: {
                ...prev.answers,
                [questionId]: answerId
            }
        }));
    }, []);

    // 現在のストーリーを取得
    const getCurrentStory = useCallback(() => {
        return getStoryByTheme(sessionData.selectedTheme);
    }, [sessionData.selectedTheme]);

    // 現在のテーマを取得
    const getCurrentTheme = useCallback(() => {
        return getThemeById(sessionData.selectedTheme);
    }, [sessionData.selectedTheme]);

    // 要約を生成
    const generateSummary = useCallback(() => {
        const story = getCurrentStory();
        const theme = getCurrentTheme();
        if (!story || !theme) return null;

        const getAnswerLabel = (questionId, answerId) => {
            const question = story.questions.find(q => q.id === questionId);
            if (!question) return answerId;
            const option = question.options.find(o => o.id === answerId);
            return option ? `${option.emoji} ${option.label}` : answerId;
        };

        return {
            theme: `${theme.emoji} ${theme.title}`,
            character: story.character,
            feeling: getAnswerLabel('feeling', sessionData.answers.feeling),
            relate: getAnswerLabel('relate', sessionData.answers.relate),
            wish: getAnswerLabel('wish', sessionData.answers.wish),
            timestamp: new Date().toLocaleString('ja-JP'),
            endMessage: story.endMessage
        };
    }, [sessionData.answers, getCurrentStory, getCurrentTheme]);

    // 要約をクリップボードにコピー
    const copySummary = useCallback(async () => {
        const summary = generateSummary();
        if (!summary) return;

        const text = `
【絵本セラピー セッション記録】
日時: ${summary.timestamp}

● 読んだ絵本: ${summary.theme}
● キャラクター: ${summary.character}

【キャラクターを通した回答】
● ${summary.character}の気持ち: ${summary.feeling}
● 共感の度合い: ${summary.relate}
● キャラクターへのメッセージ: ${summary.wish}

※ キャラクターへの回答は、本人の気持ちの投影である可能性があります。
`.trim();

        try {
            await navigator.clipboard.writeText(text);
            showToastMessage('コピーしました！');
        } catch {
            showToastMessage('コピーに失敗しました');
        }
    }, [generateSummary]);

    // トースト表示
    const showToastMessage = useCallback((message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }, []);

    const value = {
        currentScreen,
        sessionData,
        toastMessage,
        showToast,
        storyThemes,

        resetSession,
        navigateTo,
        selectTheme,
        nextPage,
        prevPage,
        saveAnswer,
        getCurrentStory,
        getCurrentTheme,
        generateSummary,
        copySummary,
        showToastMessage
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
