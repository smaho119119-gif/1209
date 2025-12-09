import { useApp } from '../contexts/AppContext';

/**
 * Toast - トースト通知コンポーネント
 */
export function Toast() {
    const { toastMessage, showToast } = useApp();

    return (
        <div className={`toast ${showToast ? 'show' : ''}`}>
            {toastMessage}
        </div>
    );
}
