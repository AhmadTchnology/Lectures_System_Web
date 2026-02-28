interface ProgressBarProps {
    label: string;
    completed: number;
    total: number;
    percentage: number;
}

export default function ProgressBar({ label, completed, total, percentage }: ProgressBarProps) {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar-header">
                <span className="progress-bar-label">{label}</span>
                <span className="progress-bar-text">
                    {completed}/{total} ({percentage}%)
                </span>
            </div>
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
