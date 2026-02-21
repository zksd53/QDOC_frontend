import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "./PatientLogin.css";

export default function PatientLogin() {
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
            const result = await loginUser({ email, password });
            const user = result?.user || result?.data?.user || { email };
            const token =
                result?.token || result?.accessToken || result?.jwt || result?.data?.token || "";

            sessionStorage.setItem("auth_user", JSON.stringify(user));
            if (token) sessionStorage.setItem("auth_token", token);
            navigate("/patient/dashboard", { replace: true });
        } catch (err) {
            setError(err?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Patient Login</h1>
                <p className="login-subtext">Enter your email and password to continue.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
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
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {error ? <p className="signup-error">{error}</p> : null}

                <p className="signup-prompt">
                    Don’t have an account?{" "}
                    <Link to="/patient-signup" className="signup-link">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
