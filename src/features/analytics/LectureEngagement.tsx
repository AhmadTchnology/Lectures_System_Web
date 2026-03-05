import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import ChartCard from './ChartCard';
import type { LectureStat, SubjectDistribution } from './analyticsService';

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface LectureEngagementProps {
    lectureStats: LectureStat[];
    subjectDistribution: SubjectDistribution[];
}

export default function LectureEngagement({ lectureStats, subjectDistribution }: LectureEngagementProps) {
    const [sortKey, setSortKey] = useState<'viewCount' | 'favoritesCount' | 'completionCount'>('viewCount');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const top10 = [...lectureStats]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10)
        .map((l) => ({ name: l.title.length > 20 ? l.title.slice(0, 20) + '…' : l.title, views: l.viewCount }));

    const sortedStats = [...lectureStats].sort((a, b) => {
        const diff = a[sortKey] - b[sortKey];
        return sortDir === 'asc' ? diff : -diff;
    });

    function handleSort(key: typeof sortKey) {
        if (key === sortKey) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    const sortIndicator = (key: typeof sortKey) =>
        sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <div className="analytics-engagement-section">
            <div className="analytics-charts-row">
                <ChartCard title="Top 10 Most Viewed Lectures">
                    {top10.length === 0 ? (
                        <p className="analytics-empty">No lecture data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={top10} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" angle={-35} textAnchor="end" fontSize={11} tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-background)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <Bar dataKey="views" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Lectures by Subject">
                    {subjectDistribution.length === 0 ? (
                        <p className="analytics-empty">No subject data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={subjectDistribution}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={{ stroke: 'var(--text-secondary)', strokeWidth: 1 }}
                                    fontSize={12}
                                >
                                    {subjectDistribution.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg, white)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                    }}
                                    formatter={(value) => [`${value ?? 0} lecture${value !== 1 ? 's' : ''}`, 'Count']}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={10}
                                    formatter={(value: string) => (
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            <ChartCard title="All Lecture Statistics">
                <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Stage</th>
                                <th className="analytics-sortable" onClick={() => handleSort('viewCount')}>
                                    Views{sortIndicator('viewCount')}
                                </th>
                                <th className="analytics-sortable" onClick={() => handleSort('favoritesCount')}>
                                    Favorites{sortIndicator('favoritesCount')}
                                </th>
                                <th className="analytics-sortable" onClick={() => handleSort('completionCount')}>
                                    Completions{sortIndicator('completionCount')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStats.map((l) => (
                                <tr key={l.id}>
                                    <td title={l.title}>{l.title}</td>
                                    <td>{l.subject}</td>
                                    <td>{l.stage}</td>
                                    <td>{l.viewCount}</td>
                                    <td>{l.favoritesCount}</td>
                                    <td>{l.completionCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}
