import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeTab from './HomeTab';
import ProfileTab from './ProfileTab';
import VaccinationTab from './VaccinationTab';
import ReminderTab from './ReminderTab';
import '../App.css';

function PatientDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('home');
    const [patientProfile, setPatientProfile] = React.useState({
        name: '',
        dob: '',
        conditions: [],
        pregnancyStatus: false,
        immunocompromisedStatus: false,
        vaccinations: []
    });
    const [reminderSettings, setReminderSettings] = React.useState({
        email: true,
        sms: false,
        inApp: true,
        windowDays: 14
    });

    React.useEffect(() => {
        const rawProfile = sessionStorage.getItem('patient_profile');
        if (rawProfile) {
            try {
                const parsed = JSON.parse(rawProfile);
                setPatientProfile((prev) => ({
                    ...prev,
                    ...parsed,
                    conditions: Array.isArray(parsed?.conditions) ? parsed.conditions : [],
                    vaccinations: Array.isArray(parsed?.vaccinations) ? parsed.vaccinations : []
                }));
            } catch {
                setPatientProfile((prev) => prev);
            }
        }

        const rawReminder = sessionStorage.getItem('patient_reminders');
        if (rawReminder) {
            try {
                const parsed = JSON.parse(rawReminder);
                setReminderSettings((prev) => ({ ...prev, ...parsed }));
            } catch {
                setReminderSettings((prev) => prev);
            }
        }
    }, []);

    const handleProfileUpdate = (nextProfile) => {
        setPatientProfile(nextProfile);
        sessionStorage.setItem('patient_profile', JSON.stringify(nextProfile));
    };

    const handleReminderUpdate = (nextReminder) => {
        setReminderSettings(nextReminder);
        sessionStorage.setItem('patient_reminders', JSON.stringify(nextReminder));
    };

    const authUser = React.useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem('auth_user') || '{}');
        } catch {
            return {};
        }
    }, []);

    const patientName = patientProfile?.name || authUser?.name || 'Patient Portal';

    const handleHelp = () => {
        setActiveTab('reminders');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('allow_patient_first_time');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        navigate('/');
    };

    return (
        <div className="patient-page">
            <div className="patient-topbar">
                <span className="patient-topbar-name">{patientName}</span>
                <div className="patient-topbar-actions">
                    <button type="button" className="patient-topbar-btn" onClick={handleHelp}>Help</button>
                    <button type="button" className="patient-topbar-btn patient-topbar-btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="patient-shell">
                <header className="patient-header">
                    <h1 className="dashboard-title">Welcome, {patientName}</h1>
                </header>

                <div className="patient-layout">
                    <aside className="patient-sidebar">
                        <h2>Navigation</h2>
                        <div className="patient-side-tabs">
                            <button onClick={() => setActiveTab('home')} className={`patient-side-tab ${activeTab === 'home' ? 'patient-side-tab-active' : ''}`}>Home</button>
                            <button onClick={() => setActiveTab('profile')} className={`patient-side-tab ${activeTab === 'profile' ? 'patient-side-tab-active' : ''}`}>Profile</button>
                            <button onClick={() => setActiveTab('vaccination')} className={`patient-side-tab ${activeTab === 'vaccination' ? 'patient-side-tab-active' : ''}`}>Vaccination</button>
                            <button onClick={() => setActiveTab('reminders')} className={`patient-side-tab ${activeTab === 'reminders' ? 'patient-side-tab-active' : ''}`}>Reminders</button>
                        </div>
                    </aside>

                    <main className="patient-main">
                        {activeTab === 'home' && (
                            <HomeTab
                                patientProfile={patientProfile}
                                reminderSettings={reminderSettings}
                            />
                        )}
                        {activeTab === 'profile' && (
                            <ProfileTab
                                patientProfile={patientProfile}
                                onProfileUpdate={handleProfileUpdate}
                            />
                        )}
                        {activeTab === 'vaccination' && (
                            <VaccinationTab
                                patientProfile={patientProfile}
                                reminderSettings={reminderSettings}
                            />
                        )}
                        {activeTab === 'reminders' && (
                            <ReminderTab
                                reminderSettings={reminderSettings}
                                onReminderUpdate={handleReminderUpdate}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;
