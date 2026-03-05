interface ChartCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function ChartCard({ title, description, children }: ChartCardProps) {
    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <h3 className="chart-card-title">{title}</h3>
                {description && (
                    <p className="chart-card-description">{description}</p>
                )}
            </div>
            <div className="chart-card-body">{children}</div>
        </div>
    );
}
