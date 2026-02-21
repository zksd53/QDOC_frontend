import { useState } from "react";
import { useNavigate } from "react-router-dom";

const getInitialClinicName = () => {
    const pendingName = sessionStorage.getItem("clinic_signup_name");
    if (pendingName) return pendingName;

    try {
        const authUser = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
        return authUser?.name || "";
    } catch {
        return "";
    }
};

const getInitialClinicEmail = () => {
    const pendingEmail = sessionStorage.getItem("clinic_signup_email");
    if (pendingEmail) return pendingEmail;

    try {
        const authUser = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
        return authUser?.email || "";
    } catch {
        return "";
    }
};

export default function FirstTimeClient() {
    const navigate = useNavigate();
    const [clinicName, setClinicName] = useState(getInitialClinicName);
    const [contactEmail, setContactEmail] = useState(getInitialClinicEmail);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        sessionStorage.setItem(
            "clinic_profile",
            JSON.stringify({ clinicName, contactEmail, address, phone }),
        );
        sessionStorage.removeItem("clinic_signup_name");
        sessionStorage.removeItem("clinic_signup_email");
        navigate("/clinic/dashboard");
    };

    return (
        <main className="page">
            <form className="form-card" onSubmit={handleSubmit}>
                <h1>Clinic First-Time Setup</h1>

                <div className="form-grid">
                    <label htmlFor="client-name">Clinic Name:</label>
                    <input
                        type="text"
                        id="client-name"
                        placeholder="Vaccine Hut"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                    />

                    <label htmlFor="client-email">Contact Email:</label>
                    <input
                        type="text"
                        id="client-email"
                        placeholder="vaccinehut@clinics.ca"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />

                    <label htmlFor="client-phone">Contact Number:</label>
                    <input
                        type="number"
                        id="client-phone"
                        placeholder="1231231234"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <label htmlFor="client-address">Address:</label>
                    <input
                        type="text"
                        id="client-address"
                        placeholder="123 Fun Street, Winnipeg, MB, A1A 1A1"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <div className="form-actions">
                        <button type="submit">Save Clinic</button>
                    </div>
                </div>
            </form>
        </main>
    );
}
