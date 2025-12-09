import { useApp } from '../contexts/AppContext';
import { BackIcon } from './Icons';

/**
 * StorySelectScreen - 絵本選択画面
 */
export function StorySelectScreen() {
    const { navigateTo, storyThemes, selectTheme } = useApp();

    const handleSelectStory = (themeId) => {
        selectTheme(themeId);
        navigateTo('story');
    };

    const handleBack = () => {
        navigateTo('home');
    };

    return (
        <div className="screen active story-select-screen">
            <div className="story-select-header">
                <button className="icon-button" onClick={handleBack}>
                    <BackIcon />
                </button>
                <h2>今日はどの絵本を読む？</h2>
            </div>

            <div className="story-grid">
                {storyThemes.map((theme) => (
                    <button
                        key={theme.id}
                        className="story-card"
                        style={{ backgroundColor: theme.color }}
                        onClick={() => handleSelectStory(theme.id)}
                    >
                        <span className="story-emoji">{theme.emoji}</span>
                        <span className="story-title">{theme.title}</span>
                        <span className="story-description">{theme.description}</span>
                    </button>
                ))}
            </div>

            <p className="select-hint">
                気になる絵本をタップしてね 📖
            </p>
        </div>
    );
}
