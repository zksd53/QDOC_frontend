import React from 'react';
import { calculateAge } from './patientUtils';
import clinicPatients from '../../shared/clinicPatients';

function ProfileTab({ patientProfile, onProfileUpdate }) {
    const [conditionInput, setConditionInput] = React.useState('');
    const aaravDetails = clinicPatients.find((item) => item.name.toLowerCase() === 'aarav sharma');

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
            {aaravDetails ? (
                <section className="dash-panel">
                    <h2 className="dash-heading">Clinic Shared Record</h2>
                    <div className="timeline-list">
                        <article className="timeline-item">
                            <div>
                                <p className="timeline-title">{aaravDetails.name}</p>
                                <p className="timeline-reason">{aaravDetails.dueVaccine}</p>
                            </div>
                            <div className="timeline-right">
                                <span className={`status-pill status-${aaravDetails.currentStatus === 'Overdue' ? 'overdue' : aaravDetails.currentStatus === 'Completed' ? 'completed' : 'due_soon'}`}>
                                    {aaravDetails.currentStatus}
                                </span>
                                <p className="timeline-date">Last dose: {aaravDetails.lastDoseDate}</p>
                            </div>
                        </article>
                        <article className="timeline-item">
                            <div>
                                <p className="timeline-title">Eligibility Explanation</p>
                                <p className="timeline-reason">{aaravDetails.eligibility}</p>
                            </div>
                            <div className="timeline-right">
                                <p className="timeline-date">Risk: {aaravDetails.riskFactors}</p>
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
