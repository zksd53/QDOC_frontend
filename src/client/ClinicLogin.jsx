import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "../user/PatientLogin.css";

export default function ClinicLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const isFormValid = email && password;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        setError("");

        try {
            const result = await loginUser({ email, password, role: "clinic" });
            const user = result?.user || result?.data?.user || { email, role: "clinic" };
            const token = result?.token || result?.accessToken || result?.jwt || result?.data?.token || "";

            sessionStorage.setItem("auth_user", JSON.stringify(user));
            if (token) sessionStorage.setItem("auth_token", token);
            navigate("/clinic/dashboard", { replace: true });
        } catch (err) {
            setError(err?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Clinic Login</h1>
                <p className="login-subtext">Enter clinic credentials to continue.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="clinic-email">Email</label>
                    <input
                        type="email"
                        id="clinic-email"
                        placeholder="clinic@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="clinic-password">Password</label>
                    <input
                        type="password"
                        id="clinic-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="login-btn" disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Continue"}
                    </button>
                </form>

                {error ? <p className="signup-error">{error}</p> : null}

                <p className="signup-prompt">
                    New clinic account?{" "}
                    <Link to="/clinic-signup" className="signup-link">
                        Set Up Profile
                    </Link>
                </p>
            </div>
        </div>
    );
}
