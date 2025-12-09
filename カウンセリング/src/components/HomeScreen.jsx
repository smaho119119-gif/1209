import { useApp } from '../contexts/AppContext';
import { HeartIcon, ArrowIcon } from './Icons';

/**
 * HomeScreen - ホーム画面（絵本モード）
 */
export function HomeScreen() {
    const { navigateTo, resetSession } = useApp();

    const handleStart = () => {
        resetSession();
        navigateTo('select-story');
    };

    return (
        <div className="screen active">
            <div className="home-content">
                {/* Logo */}
                <div className="logo-container">
                    <div className="logo-circle">
                        <HeartIcon />
                    </div>
                    <div className="floating-bubbles">
                        <span className="bubble"></span>
                        <span className="bubble"></span>
                        <span className="bubble"></span>
                    </div>
                </div>

                <h1 className="app-title">こころの絵本</h1>
                <p className="app-subtitle">物語を読んで、気持ちを見つけよう</p>

                {/* Feature Cards */}
                <div className="feature-cards">
                    <div className="feature-card">
                        <div className="feature-icon">📖</div>
                        <p>絵本を<br />よむ</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🐰</div>
                        <p>キャラクターと<br />いっしょに</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💙</div>
                        <p>気持ちを<br />みつける</p>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="safety-notice">
                    <div className="notice-icon">✨</div>
                    <p>好きな絵本をえらんで読むだけ。<br />むずかしいことは何もないよ。</p>
                </div>

                {/* Start Button */}
                <button className="primary-button" onClick={handleStart}>
                    <span>絵本をえらぶ</span>
                    <ArrowIcon />
                </button>

                <p className="time-notice">よむ時間：3〜5分くらい</p>
            </div>
        </div>
    );
}
