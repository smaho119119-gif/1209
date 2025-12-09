import { AppProvider, useApp } from './contexts/AppContext';
import { HomeScreen } from './components/HomeScreen';
import { StorySelectScreen } from './components/StorySelectScreen';
import { StoryScreen } from './components/StoryScreen';
import { QuestionsScreen } from './components/QuestionsScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { Toast } from './components/Toast';

/**
 * AppContent - メインコンテンツコンポーネント
 */
function AppContent() {
  const { currentScreen } = useApp();

  return (
    <div className="app-container">
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'select-story' && <StorySelectScreen />}
      {currentScreen === 'story' && <StoryScreen />}
      {currentScreen === 'questions' && <QuestionsScreen />}
      {currentScreen === 'summary' && <SummaryScreen />}
      <Toast />
    </div>
  );
}

/**
 * App - ルートコンポーネント
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
