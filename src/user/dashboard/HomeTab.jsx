import React from 'react';
import { buildVaccineInsights, formatDate } from './patientUtils';

function HomeTab({ patientProfile, reminderSettings }) {
    const windowDays = reminderSettings?.windowDays || 14;
    const insights = buildVaccineInsights(patientProfile, windowDays);
    const actionItems = insights.timeline.filter((item) => item.status === 'due_soon' || item.status === 'overdue').slice(0, 6);

    return (
        <div className="dash-stack">
            <section className="dash-grid-5">
                <article className="dash-metric-card">
                    <p className="dash-metric-label">Total Vaccines Completed</p>
                    <p className="dash-metric-value">{insights.summary.completedCount}</p>
                </article>
                <article className="dash-metric-card">
                    <p className="dash-metric-label">Due Soon Count</p>
                    <p className="dash-metric-value">{insights.summary.dueSoonCount}</p>
                </article>
                <article className="dash-metric-card">
                    <p className="dash-metric-label">Overdue Count</p>
                    <p className="dash-metric-value">{insights.summary.overdueCount}</p>
                </article>
                <article className="dash-metric-card">
                    <p className="dash-metric-label">Next Scheduled Vaccine</p>
                    <p className="dash-metric-value-small">{insights.summary.nextScheduledName}</p>
                    <p className="dash-muted-small">{formatDate(insights.summary.nextScheduledDate)}</p>
                </article>
            </section>

            <section className="dash-panel">
                <h2 className="dash-heading">What You Should Do Next</h2>
                {actionItems.length === 0 ? (
                    <p className="dash-subtext">No immediate vaccines due. Keep tracking your schedule.</p>
                ) : (
                    <div className="action-list">
                        {actionItems.map((item) => (
                            <article key={item.key} className="action-item">
                                <div>
                                    <p className="action-title">{item.vaccineName}</p>
                                    <p className="dash-muted-small">{item.reason}</p>
                                </div>
                                <span className={`status-pill status-${item.status}`}>{item.status.replace('_', ' ')}</span>
                            </article>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

export default HomeTab;
