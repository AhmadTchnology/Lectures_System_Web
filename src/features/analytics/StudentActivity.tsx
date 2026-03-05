import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import type { StageCompletion, TopStudent } from './analyticsService';

interface StudentActivityProps {
    stageCompletion: StageCompletion[];
    topStudents: TopStudent[];
}

export default function StudentActivity({ stageCompletion, topStudents }: StudentActivityProps) {
    const chartData = stageCompletion.map((s) => ({
        name: s.stage,
        percentage: s.percentage,
    }));

    return (
        <div className="analytics-activity-section">
            <div className="analytics-charts-row">
                <ChartCard title="Completion by Stage">
                    {chartData.length === 0 ? (
                        <p className="analytics-empty">No stage data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)' }} unit="%" />
                                <Tooltip
                                    formatter={(val) => [`${val ?? 0}%`, 'Completion']}
                                    contentStyle={{
                                        backgroundColor: 'var(--card-background)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Top Students by Completion">
                    {topStudents.length === 0 ? (
                        <p className="analytics-empty">No student data yet</p>
                    ) : (
                        <div className="analytics-table-wrapper">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Completed</th>
                                        <th>Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStudents.map((s, i) => (
                                        <tr key={s.id}>
                                            <td>{i + 1}</td>
                                            <td>{s.name}</td>
                                            <td>{s.completedCount}</td>
                                            <td>
                                                <div className="analytics-progress-bar">
                                                    <div
                                                        className="analytics-progress-fill"
                                                        style={{ width: `${s.percentage}%` }}
                                                    />
                                                    <span className="analytics-progress-text">{s.percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
