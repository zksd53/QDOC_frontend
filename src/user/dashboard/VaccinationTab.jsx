import React from 'react';
import { buildVaccineInsights, formatDate } from './patientUtils';

function VaccinationTab({ patientProfile, reminderSettings }) {
    const windowDays = reminderSettings?.windowDays || 14;
    const insights = buildVaccineInsights(patientProfile, windowDays);
    const [statusFilter, setStatusFilter] = React.useState('all');

    const visibleTimeline = insights.timeline.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    const filterOptions = [
        { key: 'all', label: 'All' },
        { key: 'due_soon', label: 'Due Soon' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'completed', label: 'Completed' },
        { key: 'not_eligible', label: 'Not Eligible' }
    ];

    return (
        <div className="dash-stack">
            <section className="dash-panel">
                <h2 className="dash-heading">Immunization Timeline</h2>
                <div className="filter-row">
                    {filterOptions.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`window-btn ${statusFilter === option.key ? 'window-btn-active' : ''}`}
                            onClick={() => setStatusFilter(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="timeline-list">
                    {visibleTimeline.length === 0 ? (
                        <p className="dash-empty">No records for this filter.</p>
                    ) : visibleTimeline.map((item) => (
                        <article key={item.key} className="timeline-item">
                            <div>
                                <p className="timeline-title">{item.vaccineName}</p>
                                <p className="timeline-reason">{item.reason}</p>
                            </div>
                            <div className="timeline-right">
                                <span className={`status-pill status-${item.status}`}>{item.status.replace('_', ' ')}</span>
                                <p className="timeline-date">Last dose: {formatDate(item.lastDate)}</p>
                                <p className="timeline-date">Next due: {formatDate(item.dueDate)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="dash-panel">
                <h2 className="dash-heading">Eligibility Results</h2>
                <div className="eligibility-grid">
                    <article className="dash-panel">
                        <h3 className="eligibility-title">Eligible Now</h3>
                        {insights.eligibility.eligibleNow.length === 0 ? (
                            <p className="dash-empty">No immediate vaccines.</p>
                        ) : (
                            <ul className="eligibility-list">
                                {insights.eligibility.eligibleNow.map((item) => (
                                    <li key={`now-${item.key}`}>{item.vaccineName} - {item.reason}</li>
                                ))}
                            </ul>
                        )}
                    </article>
                    <article className="dash-panel">
                        <h3 className="eligibility-title">Upcoming</h3>
                        {insights.eligibility.eligibleSoon.length === 0 ? (
                            <p className="dash-empty">No upcoming vaccines in 90 days.</p>
                        ) : (
                            <ul className="eligibility-list">
                                {insights.eligibility.eligibleSoon.map((item) => (
                                    <li key={`soon-${item.key}`}>{item.vaccineName} - Due {formatDate(item.dueDate)}</li>
                                ))}
                            </ul>
                        )}
                    </article>
                    <article className="dash-panel">
                        <h3 className="eligibility-title">Not Eligible</h3>
                        {insights.eligibility.notEligible.length === 0 ? (
                            <p className="dash-empty">All listed vaccines are currently eligible by profile.</p>
                        ) : (
                            <ul className="eligibility-list">
                                {insights.eligibility.notEligible.map((item) => (
                                    <li key={`not-${item.key}`}>{item.vaccineName} - {item.reason}</li>
                                ))}
                            </ul>
                        )}
                    </article>
                </div>
            </section>
        </div>
    );
}

export default VaccinationTab;
