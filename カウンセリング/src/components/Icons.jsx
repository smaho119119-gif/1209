/**
 * HeartIcon - ロゴ用ハートアイコン
 */
export function HeartIcon() {
    return (
        <svg className="heart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="heartGradient" x1="2" y1="3" x2="22" y2="21">
                    <stop offset="0%" stopColor="#7C9EFF" />
                    <stop offset="100%" stopColor="#91E8C4" />
                </linearGradient>
            </defs>
            <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="url(#heartGradient)"
            />
        </svg>
    );
}

/**
 * ArrowIcon - 矢印アイコン
 */
export function ArrowIcon() {
    return (
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * BackIcon - 戻るアイコン
 */
export function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * SendIcon - 送信アイコン
 */
export function SendIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none">
            <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * CopyIcon - コピーアイコン
 */
export function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
