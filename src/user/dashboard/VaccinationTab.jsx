import React from 'react';
import { buildVaccineInsights, formatDate } from './patientUtils';

function normalize(value) {
    return String(value || '').toLowerCase().trim();
}

function VaccinationTab({ patientProfile, reminderSettings, onProfileUpdate }) {
    const windowDays = reminderSettings?.windowDays || 14;
    const insights = buildVaccineInsights(patientProfile, windowDays);
    const [statusFilter, setStatusFilter] = React.useState('all');

    const visibleTimeline = insights.timeline.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    const isMarkedDone = (vaccineName) => {
        const target = normalize(vaccineName);
        return (patientProfile?.vaccinations || []).some((record) => {
            const current = normalize(record?.vaccineName);
            return current && (current.includes(target) || target.includes(current));
        });
    };

    const toggleVaccineDone = (vaccineName, checked) => {
        const existing = Array.isArray(patientProfile?.vaccinations) ? patientProfile.vaccinations : [];
        if (checked) {
            if (isMarkedDone(vaccineName)) return;
            const today = new Date().toISOString().slice(0, 10);
            onProfileUpdate({
                ...patientProfile,
                vaccinations: [...existing, { vaccineName, dateTaken: today }]
            });
            return;
        }

        const target = normalize(vaccineName);
        let removed = false;
        const next = existing.filter((record) => {
            if (removed) return true;
            const current = normalize(record?.vaccineName);
            const match = current && (current.includes(target) || target.includes(current));
            if (match) {
                removed = true;
                return false;
            }
            return true;
        });

        onProfileUpdate({
            ...patientProfile,
            vaccinations: next
        });
    };

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
                                <label className="vaccine-check-row">
                                    <input
                                        type="checkbox"
                                        checked={isMarkedDone(item.vaccineName)}
                                        onChange={(e) => toggleVaccineDone(item.vaccineName, e.target.checked)}
                                    />
                                    <span>Mark as done</span>
                                </label>
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
        </div>
    );
}

export default VaccinationTab;
