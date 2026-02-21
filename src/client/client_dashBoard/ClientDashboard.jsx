import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildVaccineInsights, calculateAge, formatDate, VACCINE_CATALOG } from '../../user/dashboard/patientUtils';
import './ClientDashboard.css';

const CLINIC_PATIENTS_KEY = 'clinic_patient_profiles';

const defaultPatients = [
    {
        id: 'P-1001',
        name: 'Aarav Sharma',
        age: 6,
        riskStatus: 'Low',
        dueVaccine: 'MMRV Booster',
        currentStatus: 'Due This Week',
        lastDoseDate: '2025-08-12',
        timeline: ['DTaP-IPV-Hib', 'Pneu-C-15', 'MMRV'],
        eligibility: 'Eligible now due to age and schedule interval',
        riskFactors: 'None'
    },
    {
        id: 'P-1002',
        name: 'Emma Patel',
        age: 64,
        riskStatus: 'Medium',
        dueVaccine: 'Influenza',
        currentStatus: 'Overdue',
        lastDoseDate: '2024-01-22',
        timeline: ['Tdap', 'COVID Booster', 'Influenza'],
        eligibility: 'Eligible now due to annual flu recommendation',
        riskFactors: 'Chronic respiratory condition'
    },
    {
        id: 'P-1003',
        name: 'Noah Singh',
        age: 33,
        riskStatus: 'High',
        dueVaccine: 'Hepatitis B',
        currentStatus: 'Due This Week',
        lastDoseDate: '2022-09-19',
        timeline: ['COVID Booster', 'Tdap'],
        eligibility: 'Eligible now due to risk-based recommendation',
        riskFactors: 'Immunocompromised'
    }
];

function statusClass(status) {
    if (status === 'Overdue') return 'status-overdue';
    if (status === 'Due This Week') return 'status-due';
    if (status === 'Completed') return 'status-completed';
    return 'status-default';
}

function calcOverview(patients) {
    const totalActivePatients = patients.length;
    const dueThisWeek = patients.filter((p) => p.currentStatus === 'Due This Week').length;
    const overduePatients = patients.filter((p) => p.currentStatus === 'Overdue').length;
    const remindersSentToday = dueThisWeek + overduePatients;
    const complianceRate = Math.round(
        (patients.filter((p) => p.currentStatus === 'Completed').length / Math.max(totalActivePatients, 1)) * 100
    );

    return {
        totalActivePatients,
        dueThisWeek,
        overduePatients,
        remindersSentToday,
        complianceRate
    };
}

function buildRuleText(vaccine) {
    const ageText = vaccine.maxAge != null
        ? `Age ${vaccine.minAge ?? 0}-${vaccine.maxAge}`
        : `Age ${vaccine.minAge ?? 0}+`;
    const cadenceText = vaccine.intervalDays >= 3650
        ? 'booster interval: 10 years'
        : `booster interval: ${vaccine.intervalDays} day(s)`;

    return `${ageText}, ${cadenceText}.`;
}

function getRiskStatus(profile) {
    const conditionsCount = Array.isArray(profile?.conditions) ? profile.conditions.length : 0;
    if (profile?.immunocompromisedStatus || conditionsCount >= 2) return 'High';
    if (profile?.pregnancyStatus || conditionsCount === 1) return 'Medium';
    return 'Low';
}

function getRiskFactors(profile) {
    const factors = [];
    if (Array.isArray(profile?.conditions) && profile.conditions.length) factors.push('Chronic conditions');
    if (profile?.pregnancyStatus) factors.push('Pregnancy');
    if (profile?.immunocompromisedStatus) factors.push('Immunocompromised');
    return factors.length ? factors.join(', ') : 'None';
}

function mapProfileToClinicPatient(profile, index) {
    const insights = buildVaccineInsights(profile, 14);
    const prioritized =
        insights.timeline.find((item) => item.status === 'overdue') ||
        insights.timeline.find((item) => item.status === 'due_soon') ||
        insights.timeline.find((item) => item.status === 'completed') ||
        null;

    const name =
        profile?.name ||
        [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
        profile?.email ||
        `Patient ${index + 1}`;

    const timeline = (profile?.vaccinations || [])
        .map((item) => item?.vaccineName)
        .filter(Boolean);

    return {
        id: profile?.userId || profile?.email || `LP-${index + 1}`,
        name,
        age: calculateAge(profile?.dob) ?? '-',
        riskStatus: getRiskStatus(profile),
        dueVaccine: prioritized?.vaccineName || '-',
        currentStatus:
            prioritized?.status === 'overdue'
                ? 'Overdue'
                : prioritized?.status === 'due_soon'
                    ? 'Due This Week'
                    : 'Completed',
        lastDoseDate: formatDate(prioritized?.lastDate),
        timeline,
        eligibility: prioritized?.reason || 'No schedule data available',
        riskFactors: getRiskFactors(profile)
    };
}

function loadUploadedPatients() {
    try {
        const raw = JSON.parse(localStorage.getItem(CLINIC_PATIENTS_KEY) || '[]');
        const profiles = Array.isArray(raw) ? raw : [];
        return profiles
            .filter((profile) => Array.isArray(profile?.vaccinations) && profile.vaccinations.length > 0)
            .map(mapProfileToClinicPatient);
    } catch {
        return [];
    }
}

function ClientDashboard() {
    const navigate = useNavigate();
    const [patients] = React.useState(() => {
        const uploadedPatients = loadUploadedPatients();
        return uploadedPatients.length > 0 ? uploadedPatients : defaultPatients;
    });
    const [activeTab, setActiveTab] = React.useState('patients');
    const [selectedPatientId, setSelectedPatientId] = React.useState('');
    const [autoReminder, setAutoReminder] = React.useState(true);
    const [scheduleWindow, setScheduleWindow] = React.useState('09:00');

    const clinicName = React.useMemo(() => {
        try {
            const profile = JSON.parse(sessionStorage.getItem('clinic_profile') || '{}');
            if (profile?.clinicName) return profile.clinicName;

            const authUser = JSON.parse(sessionStorage.getItem('auth_user') || '{}');
            if (authUser?.name) return authUser.name;
        } catch {
            // ignore parse errors
        }

        return sessionStorage.getItem('clinic_signup_name') || 'Clinic Dashboard';
    }, []);

    const summary = calcOverview(patients);
    const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

    const openPatientDetail = (patientId) => {
        setSelectedPatientId(patientId);
    };

    const handleHelp = () => {
        setActiveTab('reminders');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('allow_clinic_first_time');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        navigate('/');
    };

    return (
        <div className="client-dashboard-page">
            <div className="clinic-topbar">
                <span className="clinic-name">{clinicName}</span>
                <div className="clinic-topbar-actions">
                    <button type="button" className="clinic-topbar-btn" onClick={handleHelp}>Help</button>
                    <button type="button" className="clinic-topbar-btn clinic-topbar-btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <section className="client-dashboard-shell">
                <header className="client-dashboard-header">
                    <h1>Client Dashboard</h1>
                    <p>Operations view for immunization compliance and patient follow-up.</p>
                </header>

                <section className="client-overview-grid">
                    <article className="client-card"><p>Total Active Patients</p><h3>{summary.totalActivePatients}</h3></article>
                    <article className="client-card"><p>Due This Week</p><h3>{summary.dueThisWeek}</h3></article>
                    <article className="client-card"><p>Overdue Patients</p><h3>{summary.overduePatients}</h3></article>
                    <article className="client-card"><p>Reminders Sent Today</p><h3>{summary.remindersSentToday}</h3></article>
                    <article className="client-card"><p>Compliance Rate</p><h3>{summary.complianceRate}%</h3></article>
                </section>

                <section className="client-layout">
                    <aside className="client-sidebar">
                        <h2>Navigation</h2>
                        <div className="sidebar-tabs">
                            <button
                                type="button"
                                className={`sidebar-tab ${activeTab === 'patients' ? 'sidebar-tab-active' : ''}`}
                                onClick={() => setActiveTab('patients')}
                            >
                                Patients
                            </button>
                            <button
                                type="button"
                                className={`sidebar-tab ${activeTab === 'reminders' ? 'sidebar-tab-active' : ''}`}
                                onClick={() => setActiveTab('reminders')}
                            >
                                Reminder Control
                            </button>
                            <button
                                type="button"
                                className={`sidebar-tab ${activeTab === 'rules' ? 'sidebar-tab-active' : ''}`}
                                onClick={() => setActiveTab('rules')}
                            >
                                Vaccine Rules
                            </button>
                        </div>
                    </aside>

                    <div className="client-main">
                        {activeTab === 'patients' && (
                            <section className="client-panel">
                                <h2>Patients</h2>
                                <div className="client-table-wrap">
                                    <table className="client-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Age</th>
                                                <th>Risk status</th>
                                                <th>Due vaccine</th>
                                                <th>Current status</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.map((patient) => (
                                                <tr key={patient.id}>
                                                    <td>{patient.name}</td>
                                                    <td>{patient.age}</td>
                                                    <td>{patient.riskStatus}</td>
                                                    <td>{patient.dueVaccine}</td>
                                                    <td><span className={`client-pill ${statusClass(patient.currentStatus)}`}>{patient.currentStatus}</span></td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="table-link-btn"
                                                            onClick={() => openPatientDetail(patient.id)}
                                                        >
                                                            View Record
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {selectedPatient ? (
                                    <section className="client-panel">
                                        <div className="detail-head">
                                            <h2>Patient Detail Overview</h2>
                                            <button
                                                type="button"
                                                className="small-btn"
                                                onClick={() => setSelectedPatientId('')}
                                            >
                                                Close
                                            </button>
                                        </div>
                                        <h3 className="client-subtitle">{selectedPatient.name}</h3>
                                        <p><strong>Full immunization timeline:</strong> {selectedPatient.timeline.join(' -> ')}</p>
                                        <p><strong>Eligibility explanation:</strong> {selectedPatient.eligibility}</p>
                                        <p><strong>Last dose date:</strong> {selectedPatient.lastDoseDate}</p>
                                        <p><strong>Risk factors applied:</strong> {selectedPatient.riskFactors}</p>
                                    </section>
                                ) : null}
                            </section>
                        )}

                        {activeTab === 'reminders' && (
                            <section className="client-panel">
                                <div className="detail-head">
                                    <h2>Reminder Control Panel</h2>
                                    <button
                                        type="button"
                                        className="small-btn"
                                        onClick={() => setActiveTab('patients')}
                                    >
                                        Back to Patients
                                    </button>
                                </div>
                                <div className="control-actions">
                                    <button type="button" className="small-btn">Send Reminder Manually</button>
                                    <button type="button" className="small-btn">Send Bulk Reminders</button>
                                </div>
                                <label className="reminder-item">
                                    <span>Auto-reminder</span>
                                    <input
                                        type="checkbox"
                                        checked={autoReminder}
                                        onChange={(e) => setAutoReminder(e.target.checked)}
                                    />
                                </label>
                                <div className="schedule-config">
                                    <label htmlFor="reminder-time">Reminder schedule configuration</label>
                                    <input
                                        id="reminder-time"
                                        type="time"
                                        className="dash-input"
                                        value={scheduleWindow}
                                        onChange={(e) => setScheduleWindow(e.target.value)}
                                    />
                                </div>
                            </section>
                        )}

                        {activeTab === 'rules' && (
                            <section className="client-panel">
                                <div className="detail-head">
                                    <h2>Vaccine Rule Monitoring</h2>
                                    <button
                                        type="button"
                                        className="small-btn"
                                        onClick={() => setActiveTab('patients')}
                                    >
                                        Back to Patients
                                    </button>
                                </div>
                                <ul className="rule-list">
                                    {VACCINE_CATALOG.map((vaccine) => (
                                        <li key={vaccine.key}>
                                            {vaccine.name}: {buildRuleText(vaccine)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </section>
            </section>
        </div>
    );
}

export default ClientDashboard;
