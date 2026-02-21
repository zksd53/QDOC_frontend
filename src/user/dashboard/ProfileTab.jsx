import React from 'react';
import { buildVaccineInsights, calculateAge, formatDate } from './patientUtils';

function ProfileTab({ patientProfile, onProfileUpdate }) {
    const [conditionInput, setConditionInput] = React.useState('');
    const insights = buildVaccineInsights(patientProfile, 14);

    const prioritizedItem =
        insights.timeline.find((item) => item.status === 'overdue') ||
        insights.timeline.find((item) => item.status === 'due_soon') ||
        insights.timeline.find((item) => item.status === 'completed') ||
        null;

    const profileName = patientProfile?.name?.trim() || 'Patient';

    const riskFactors = [];
    if (Array.isArray(patientProfile?.conditions) && patientProfile.conditions.length > 0) {
        riskFactors.push('Chronic conditions');
    }
    if (patientProfile?.pregnancyStatus) riskFactors.push('Pregnancy');
    if (patientProfile?.immunocompromisedStatus) riskFactors.push('Immunocompromised');
    const riskLabel = riskFactors.length ? riskFactors.join(', ') : 'None';

    const statusLabel = prioritizedItem?.status === 'overdue'
        ? 'Overdue'
        : prioritizedItem?.status === 'due_soon'
            ? 'Due This Week'
            : prioritizedItem?.status === 'completed'
                ? 'Completed'
                : 'No Schedule';

    const statusClass = prioritizedItem?.status === 'overdue'
        ? 'status-overdue'
        : prioritizedItem?.status === 'due_soon'
            ? 'status-due_soon'
            : prioritizedItem?.status === 'completed'
                ? 'status-completed'
                : 'status-not_eligible';

    const addCondition = () => {
        const value = conditionInput.trim();
        if (!value) return;
        if (patientProfile.conditions.includes(value)) return;
        onProfileUpdate({
            ...patientProfile,
            conditions: [...patientProfile.conditions, value]
        });
        setConditionInput('');
    };

    const removeCondition = (value) => {
        onProfileUpdate({
            ...patientProfile,
            conditions: patientProfile.conditions.filter((item) => item !== value)
        });
    };

    const updateVaccination = (index, field, value) => {
        const next = patientProfile.vaccinations.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onProfileUpdate({ ...patientProfile, vaccinations: next });
    };

    const addVaccination = () => {
        onProfileUpdate({
            ...patientProfile,
            vaccinations: [...patientProfile.vaccinations, { vaccineName: '', dateTaken: '' }]
        });
    };

    const removeVaccination = (index) => {
        onProfileUpdate({
            ...patientProfile,
            vaccinations: patientProfile.vaccinations.filter((_, i) => i !== index)
        });
    };

    const handleCsvUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const parsed = rows
            .map((line) => line.split(',').map((part) => part.trim()))
            .filter((parts) => parts.length >= 2)
            .filter((parts, idx) => idx !== 0 || !parts[0].toLowerCase().includes('vaccine'))
            .map((parts) => ({ vaccineName: parts[0], dateTaken: parts[1] }));

        if (parsed.length === 0) return;

        onProfileUpdate({
            ...patientProfile,
            vaccinations: [...patientProfile.vaccinations, ...parsed]
        });

        event.target.value = '';
    };

    return (
        <div className="dash-stack">
            {prioritizedItem ? (
                <section className="dash-panel">
                    <h2 className="dash-heading">Clinic Shared Record</h2>
                    <div className="timeline-list">
                        <article className="timeline-item">
                            <div>
                                <p className="timeline-title">{profileName}</p>
                                <p className="timeline-reason">{prioritizedItem.vaccineName}</p>
                            </div>
                            <div className="timeline-right">
                                <span className={`status-pill ${statusClass}`}>
                                    {statusLabel}
                                </span>
                                <p className="timeline-date">Last dose: {formatDate(prioritizedItem.lastDate)}</p>
                            </div>
                        </article>
                        <article className="timeline-item">
                            <div>
                                <p className="timeline-title">Eligibility Explanation</p>
                                <p className="timeline-reason">{prioritizedItem.reason}</p>
                            </div>
                            <div className="timeline-right">
                                <p className="timeline-date">Risk: {riskLabel}</p>
                            </div>
                        </article>
                    </div>
                </section>
            ) : null}

            <section className="dash-panel">
                <h2 className="dash-heading">Profile Management</h2>
                <div className="profile-grid profile-grid-2">
                    <div className="profile-item">
                        <p className="profile-label">DOB</p>
                        <input
                            type="date"
                            className="dash-input"
                            value={patientProfile.dob || ''}
                            onChange={(e) => onProfileUpdate({ ...patientProfile, dob: e.target.value })}
                        />
                    </div>
                    <div className="profile-item">
                        <p className="profile-label">Age</p>
                        <p className="profile-value">{calculateAge(patientProfile.dob) ?? '-'}</p>
                    </div>
                </div>

                <div className="toggle-row">
                    <label className="toggle-item">
                        <span>Pregnancy status</span>
                        <input
                            type="checkbox"
                            checked={Boolean(patientProfile.pregnancyStatus)}
                            onChange={(e) => onProfileUpdate({ ...patientProfile, pregnancyStatus: e.target.checked })}
                        />
                    </label>
                    <label className="toggle-item">
                        <span>Immunocompromised status</span>
                        <input
                            type="checkbox"
                            checked={Boolean(patientProfile.immunocompromisedStatus)}
                            onChange={(e) => onProfileUpdate({ ...patientProfile, immunocompromisedStatus: e.target.checked })}
                        />
                    </label>
                </div>
            </section>

            <section className="dash-panel">
                <h3 className="dash-section-title">Chronic Conditions</h3>
                <div className="list-input-row">
                    <input
                        className="dash-input"
                        type="text"
                        value={conditionInput}
                        onChange={(e) => setConditionInput(e.target.value)}
                        placeholder="Add condition"
                    />
                    <button type="button" className="small-btn" onClick={addCondition}>Add</button>
                </div>
                <div className="dash-chip-row">
                    {patientProfile.conditions.length > 0 ? patientProfile.conditions.map((condition) => (
                        <span key={condition} className="dash-chip">
                            {condition}
                            <button type="button" className="tag-remove" onClick={() => removeCondition(condition)}>×</button>
                        </span>
                    )) : <p className="dash-empty">No chronic conditions added.</p>}
                </div>
            </section>

            <section className="dash-panel">
                <h3 className="dash-section-title">Vaccination History Input</h3>
                <div className="vax-form-list">
                    {patientProfile.vaccinations.map((item, index) => (
                        <div key={`${item.vaccineName}-${item.dateTaken}-${index}`} className="vax-row">
                            <input
                                className="dash-input"
                                type="text"
                                placeholder="Vaccine name"
                                value={item.vaccineName || ''}
                                onChange={(e) => updateVaccination(index, 'vaccineName', e.target.value)}
                            />
                            <input
                                className="dash-input"
                                type="date"
                                value={item.dateTaken || ''}
                                onChange={(e) => updateVaccination(index, 'dateTaken', e.target.value)}
                            />
                            <button type="button" className="small-btn danger-btn" onClick={() => removeVaccination(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="profile-actions">
                    <button type="button" className="small-btn" onClick={addVaccination}>Add Vaccine</button>
                    <label className="small-btn csv-btn">
                        Upload CSV
                        <input type="file" accept=".csv" className="hidden-file" onChange={handleCsvUpload} />
                    </label>
                </div>
            </section>
        </div>
    );
}

export default ProfileTab;
