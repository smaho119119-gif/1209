import { useApp } from '../contexts/AppContext';
import { CopyIcon } from './Icons';

/**
 * SummaryScreen - 要約画面（絵本モード）
 */
export function SummaryScreen() {
    const {
        navigateTo,
        resetSession,
        generateSummary,
        copySummary,
        getCurrentTheme
    } = useApp();

    const summary = generateSummary();
    const theme = getCurrentTheme();

    const handleNewSession = () => {
        resetSession();
        navigateTo('home');
    };

    const handleReadAnother = () => {
        resetSession();
        navigateTo('select-story');
    };

    if (!summary || !theme) {
        navigateTo('home');
        return null;
    }

    return (
        <div className="screen active summary-screen">
            {/* Header */}
            <div className="summary-header">
                <div className="summary-emoji">{theme.emoji}</div>
                <h2>おつかれさま</h2>
            </div>

            {/* End Message */}
            <div className="end-message-card">
                <p className="end-message">{summary.endMessage}</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-content">
                <div className="summary-card">
                    <div className="card-label">読んだ絵本</div>
                    <div className="card-content">{summary.theme}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">{summary.character}の気持ち</div>
                    <div className="card-content">{summary.feeling}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">あなたも？</div>
                    <div className="card-content">{summary.relate}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">{summary.character}へのメッセージ</div>
                    <div className="card-content">{summary.wish}</div>
                </div>
            </div>

            {/* Actions */}
            <div className="summary-actions-stack">
                <button className="primary-button" onClick={handleReadAnother}>
                    <span>べつの絵本を読む</span>
                </button>
                <button className="secondary-button" onClick={handleNewSession}>
                    <span>おわる</span>
                </button>
                <button className="text-button" onClick={copySummary}>
                    <CopyIcon />
                    <span>記録をコピー（先生用）</span>
                </button>
            </div>
        </div>
    );
}
