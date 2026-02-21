import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../services/auth";
import "../user/PatientLogin.css";

export default function ClinicSignup() {
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
            const result = await signupUser({ name, email, password, role: "clinic" });
            let user = result?.user || result?.data?.user || { name, email, role: "clinic" };
            let token = result?.token || result?.accessToken || result?.jwt || result?.data?.token || "";

            if (!token) {
                const loginResult = await loginUser({ email, password, role: "clinic" });
                token =
                    loginResult?.token ||
                    loginResult?.accessToken ||
                    loginResult?.jwt ||
                    loginResult?.data?.token ||
                    "";
                user = loginResult?.user || loginResult?.data?.user || user;
            }

            sessionStorage.setItem("auth_user", JSON.stringify(user));
            if (token) sessionStorage.setItem("auth_token", token);
            sessionStorage.setItem("allow_clinic_first_time", "true");
            sessionStorage.setItem("clinic_signup_name", name.trim());
            sessionStorage.setItem("clinic_signup_email", email.trim());

            navigate("/clinic-first-time", { replace: true });
        } catch (err) {
            setError(err?.message || "Unable to create account. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Clinic Sign Up</h1>
                <p className="login-subtext">Create your clinic account to continue.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="clinic-name">Name</label>
                    <input
                        type="text"
                        id="clinic-name"
                        placeholder="Clinic or admin name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="clinic-signup-email">Email</label>
                    <input
                        type="email"
                        id="clinic-signup-email"
                        placeholder="clinic@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="clinic-signup-password">Password</label>
                    <input
                        type="password"
                        id="clinic-signup-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="login-btn" disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? "Creating..." : "Continue"}
                    </button>
                </form>

                {error ? <p className="signup-error">{error}</p> : null}

                <p className="signup-prompt">
                    Already have an account?{" "}
                    <Link to="/clinic-login" className="signup-link">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
