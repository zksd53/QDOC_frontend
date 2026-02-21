import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/auth";
import "./PatientLogin.css";

export default function PatientSignup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const isFormValid = name && email && password;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        setError("");

        try {
            const result = await signupUser({ name, email, password });
            const user = result?.user || result?.data?.user || { name, email };
            const token =
                result?.token || result?.accessToken || result?.jwt || result?.data?.token || "";

            sessionStorage.setItem("auth_user", JSON.stringify(user));
            if (token) sessionStorage.setItem("auth_token", token);
            sessionStorage.setItem("allow_patient_first_time", "true");

            navigate("/patient-first-time", { replace: true });
        } catch (err) {
            setError(err?.message || "Unable to create account. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Patient Sign Up</h1>
                <p className="login-subtext">Create your account to continue.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="patient-name">Name</label>
                    <input
                        type="text"
                        id="patient-name"
                        placeholder="Your full name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="patient-signup-email">Email</label>
                    <input
                        type="email"
                        id="patient-signup-email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="patient-signup-password">Password</label>
                    <input
                        type="password"
                        id="patient-signup-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Continue"}
                    </button>
                </form>

                {error ? <p className="signup-error">{error}</p> : null}

                <p className="signup-prompt">
                    Already have an account?{" "}
                    <Link to="/patient-login" className="signup-link">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
