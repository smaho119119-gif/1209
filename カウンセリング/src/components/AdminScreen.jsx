import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const API_URL = 'http://localhost:3001';

/**
 * 管理画面コンポーネント
 */
export function AdminScreen() {
    const { navigateTo } = useApp();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [assets, setAssets] = useState({});
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [stories, setStories] = useState({});
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // データ取得
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, statsRes, logsRes, storiesRes, answersRes] = await Promise.all([
                fetch(`${API_URL}/api/assets/status`),
                fetch(`${API_URL}/api/stats`),
                fetch(`${API_URL}/api/logs?limit=50`),
                fetch(`${API_URL}/api/stories`),
                fetch(`${API_URL}/api/answers?limit=50`)
            ]);

            setAssets(await assetsRes.json());
            setStats(await statsRes.json());
            setLogs(await logsRes.json());
            setStories(await storiesRes.json());
            setAnswers(await answersRes.json());
            setError(null);
        } catch (e) {
            setError('サーバーに接続できません。server/index.js を起動してください。');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'dashboard', label: '📊 ダッシュボード' },
        { id: 'assets', label: '🎨 アセット管理' },
        { id: 'stories', label: '📚 物語管理' },
        { id: 'logs', label: '📋 アクセスログ' },
        { id: 'answers', label: '💭 回答履歴' },
    ];

    return (
        <div className="admin-screen">
            <div className="admin-header">
                <button className="icon-button" onClick={() => navigateTo('home')}>
                    🏠
                </button>
                <h1>📊 管理画面</h1>
                <button className="refresh-button" onClick={fetchData}>
                    🔄 更新
                </button>
            </div>

            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-content">
                {loading && <div className="admin-loading">読み込み中...</div>}
                {error && <div className="admin-error">{error}</div>}

                {!loading && !error && (
                    <>
                        {activeTab === 'dashboard' && (
                            <DashboardTab stats={stats} stories={stories} />
                        )}
                        {activeTab === 'assets' && (
                            <AssetsTab assets={assets} onRefresh={fetchData} />
                        )}
                        {activeTab === 'stories' && (
                            <StoriesTab stories={stories} onRefresh={fetchData} />
                        )}
                        {activeTab === 'logs' && (
                            <LogsTab logs={logs} />
                        )}
                        {activeTab === 'answers' && (
                            <AnswersTab answers={answers} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ダッシュボードタブ
function DashboardTab({ stats, stories }) {
    if (!stats) return null;

    return (
        <div className="dashboard-tab">
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalViews || 0}</div>
                    <div className="stat-label">総閲覧数</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{Object.keys(stories).length}</div>
                    <div className="stat-label">物語数</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.dailyStats?.length || 0}</div>
                    <div className="stat-label">アクティブ日数</div>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>📈 人気の物語</h3>
                <div className="ranking-list">
                    {stats.storyRanking?.slice(0, 5).map((item, i) => (
                        <div key={item.id} className="ranking-item">
                            <span className="rank">{i + 1}</span>
                            <span className="emoji">{item.emoji}</span>
                            <span className="title">{item.title}</span>
                            <span className="views">{item.views}回</span>
                        </div>
                    ))}
                    {(!stats.storyRanking || stats.storyRanking.length === 0) && (
                        <div className="empty-message">まだデータがありません</div>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h3>📖 よく読まれるページ</h3>
                <div className="ranking-list">
                    {stats.pageRanking?.slice(0, 5).map((item, i) => (
                        <div key={`${item.story_id}_${item.page_index}`} className="ranking-item">
                            <span className="rank">{i + 1}</span>
                            <span className="title">{item.story_title} - ページ{item.page_index + 1}</span>
                            <span className="views">{item.views}回</span>
                        </div>
                    ))}
                    {(!stats.pageRanking || stats.pageRanking.length === 0) && (
                        <div className="empty-message">まだデータがありません</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// アセット管理タブ
function AssetsTab({ assets, onRefresh }) {
    const [changingSpeaker, setChangingSpeaker] = useState(null);

    const handleChangeSpeaker = async (storyId, newSpeaker) => {
        try {
            await fetch(`${API_URL}/api/stories/${storyId}/speaker`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ speaker: newSpeaker })
            });
            setChangingSpeaker(null);
            onRefresh();
        } catch (e) {
            console.error('Failed to change speaker:', e);
        }
    };

    const totalAssets = Object.values(assets).reduce((acc, story) => {
        return acc + story.pages.length * 2; // 画像 + 音声
    }, 0);

    const completedAssets = Object.values(assets).reduce((acc, story) => {
        return acc + story.pages.filter(p => p.hasAudio).length +
            story.pages.filter(p => p.hasImage).length;
    }, 0);

    return (
        <div className="assets-tab">
            <div className="assets-summary">
                <div className="summary-item">
                    <strong>進捗:</strong> {completedAssets} / {totalAssets} ({Math.round(completedAssets / totalAssets * 100) || 0}%)
                </div>
            </div>

            {Object.entries(assets).map(([storyId, story]) => (
                <div key={storyId} className="asset-story">
                    <div className="asset-story-header">
                        <h3>{story.emoji} {story.title}</h3>
                        <div className="speaker-selector">
                            <span className="current-speaker">🎙️ {story.speakerName}</span>
                            {story.availableSpeakers?.length > 1 && (
                                <button
                                    className="change-speaker-btn"
                                    onClick={() => setChangingSpeaker(storyId === changingSpeaker ? null : storyId)}
                                >
                                    変更
                                </button>
                            )}
                        </div>
                    </div>

                    {changingSpeaker === storyId && (
                        <div className="speaker-options">
                            {story.availableSpeakers?.map(spk => (
                                <button
                                    key={spk.key}
                                    className={`speaker-option ${story.speaker === spk.key ? 'selected' : ''}`}
                                    onClick={() => handleChangeSpeaker(storyId, spk.key)}
                                >
                                    {spk.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="asset-pages">
                        {story.pages.map((page, i) => (
                            <div key={i} className="asset-page">
                                <span className="page-num">ページ {i + 1}</span>
                                <span className={`asset-status ${page.hasImage ? 'complete' : 'missing'}`}>
                                    🖼️ {page.hasImage ? '✅' : '❌'}
                                </span>
                                <span className={`asset-status ${page.hasAudio ? 'complete' : 'missing'}`}>
                                    🔊 {page.hasAudio ? '✅' : '❌'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="asset-instructions">
                <h4>📝 アセット生成方法</h4>
                <pre>
                    {`# VOICEVOX音声生成（VOICEVOXを起動してから）
node scripts/generateAudio.js                    # 全物語をおすすめ話者で
node scripts/generateAudio.js --speaker=tsumugi  # 春日部つむぎで
node scripts/generateAudio.js --story=lonely --speaker=metan  # 特定物語のみ

# Gemini画像生成
VITE_GEMINI_API_KEY=xxx node scripts/generateImages.js`}
                </pre>
            </div>
        </div>
    );
}

// 物語管理タブ
function StoriesTab({ stories, onRefresh }) {
    const [editingId, setEditingId] = useState(null);

    return (
        <div className="stories-tab">
            <div className="stories-list">
                {Object.entries(stories).map(([id, story]) => (
                    <div key={id} className="story-item">
                        <div className="story-header">
                            <span className="story-emoji">{story.emoji}</span>
                            <span className="story-title">{story.title}</span>
                            <span className="story-pages">{story.pages?.length || 0}ページ</span>
                        </div>
                        <div className="story-description">{story.description}</div>
                        <div className="story-actions">
                            <button onClick={() => setEditingId(id)}>✏️ 編集</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ログタブ
function LogsTab({ logs }) {
    return (
        <div className="logs-tab">
            <table className="logs-table">
                <thead>
                    <tr>
                        <th>日時</th>
                        <th>タイプ</th>
                        <th>物語</th>
                        <th>ページ</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i}>
                            <td>{new Date(log.created_at).toLocaleString('ja-JP')}</td>
                            <td>{log.type}</td>
                            <td>{log.story_id || '-'}</td>
                            <td>{log.page_index !== null ? log.page_index + 1 : '-'}</td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan="4" className="empty-message">ログがありません</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// 回答履歴タブ
function AnswersTab({ answers }) {
    return (
        <div className="answers-tab">
            <table className="logs-table">
                <thead>
                    <tr>
                        <th>日時</th>
                        <th>物語</th>
                        <th>質問</th>
                        <th>回答</th>
                    </tr>
                </thead>
                <tbody>
                    {answers.map((answer, i) => (
                        <tr key={i}>
                            <td>{new Date(answer.created_at).toLocaleString('ja-JP')}</td>
                            <td>{answer.story_title || answer.story_id}</td>
                            <td>Q{(answer.question_index || 0) + 1}</td>
                            <td className="answer-text">{answer.answer}</td>
                        </tr>
                    ))}
                    {answers.length === 0 && (
                        <tr>
                            <td colSpan="4" className="empty-message">回答がありません</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
