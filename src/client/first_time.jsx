import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FirstTimeClient() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [chronicConditions, setChronicConditions] = useState("");
    const [vaccinationHistory, setVaccinationHistory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        sessionStorage.setItem(
            "clinic_profile",
            JSON.stringify({ firstName, lastName, dob, chronicConditions, vaccinationHistory }),
        );
        navigate("/clinic/dashboard");
    };

    return (
        <main className="page">
            <form className="form-card" onSubmit={handleSubmit}>
                <h1>Clinic First-Time Setup</h1>

                <div className="form-grid">
                    <label htmlFor="client-first-name">First name:</label>
                    <input
                        type="text"
                        id="client-first-name"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <label htmlFor="client-last-name">Last name:</label>
                    <input
                        type="text"
                        id="client-last-name"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <label htmlFor="client-dob">DOB:</label>
                    <input
                        type="date"
                        id="client-dob"
                        name="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />

                    <label htmlFor="client-chronic-conditions">Chronic conditions:</label>
                    <textarea
                        id="client-chronic-conditions"
                        name="chronicConditions"
                        rows="4"
                        placeholder="List any ongoing health conditions"
                        value={chronicConditions}
                        onChange={(e) => setChronicConditions(e.target.value)}
                    />

                    <label htmlFor="client-vaccination-history">Vaccination history:</label>
                    <textarea
                        id="client-vaccination-history"
                        name="vaccinationHistory"
                        rows="4"
                        placeholder="Enter recent vaccines or dates"
                        value={vaccinationHistory}
                        onChange={(e) => setVaccinationHistory(e.target.value)}
                    />

                    <div className="form-actions">
                        <button type="submit">Save Profile</button>
                    </div>
                </div>
            </form>
        </main>
    );
}
