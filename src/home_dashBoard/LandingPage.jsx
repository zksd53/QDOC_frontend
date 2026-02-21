import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import BlurText from "./BlurText";
import ScrollReveal from "./ScrollReveal";
import "./LandingPage.css";

export default function LandingPage() {
    const [showIntro, setShowIntro] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [patientVisible, setPatientVisible] = useState(false);
    const [clinicVisible, setClinicVisible] = useState(false);
    const patientRef = useRef(null);
    const clinicRef = useRef(null);
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowIntro(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showIntro) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    if (entry.target === patientRef.current) setPatientVisible(true);
                    if (entry.target === clinicRef.current) setClinicVisible(true);
                });
            },
            { threshold: 0.25 },
        );

        if (patientRef.current) observer.observe(patientRef.current);
        if (clinicRef.current) observer.observe(clinicRef.current);

        return () => observer.disconnect();
    }, [showIntro]);

    if (showIntro) {
        return (
            <div className="intro-screen">
                <BlurText text="Welcome to VaxShield" className="intro-text" delay={150} />
            </div>
        );
    }

    return (
        <div className="landing-container">
            <header className="top-shell">
                <button
                    type="button"
                    className={`menu-button ${menuOpen ? "menu-button-open" : ""}`}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span />
                    <span />
                </button>
                <div className="brand-wrap">
                    <img
                        className="brand-logo"
                        src={`${process.env.PUBLIC_URL}/web-icon.png`}
                        alt="VaxShield Logo"
                    />
                    <span className="brand-name">VaxShield</span>
                </div>
                <button
                    type="button"
                    className="get-started-btn"
                    onClick={() => scrollToSection("patients")}
                >
                    Get Started
                </button>
            </header>

            <div className="entry-tabs" role="tablist" aria-label="User type tabs">
                <button
                    type="button"
                    className="entry-tab"
                    onClick={() => scrollToSection("patients")}
                >
                    Patient
                </button>
                <button
                    type="button"
                    className="entry-tab"
                    onClick={() => scrollToSection("clinics")}
                >
                    Clinic
                </button>
            </div>

            {menuOpen && (
                <section className="card-nav" aria-label="Main navigation">
                    <article className="nav-card nav-card-patient">
                        <h3>Patient</h3>
                        <div className="nav-links">
                            <Link to="/patient-signup" onClick={() => setMenuOpen(false)}>
                                {" "}
                                Sign in{" "}
                            </Link>
                            <Link to="/patient-login" onClick={() => setMenuOpen(false)}>
                                {" "}
                                Log in
                            </Link>
                        </div>
                    </article>

                    <article className="nav-card nav-card-clinic">
                        <h3>Clinic</h3>
                        <div className="nav-links">
                            <Link to="/clinic-signup" onClick={() => setMenuOpen(false)}>
                                Sign in
                            </Link>
                            <Link to="/clinic-login" onClick={() => setMenuOpen(false)}>
                                Log in
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            <section className="hero-section" id="hero">
                <h1 className="hero-title">Modern Immunization &amp; Clinic Management Platform</h1>
                <p className="hero-description">
                    Securely manage patient records, appointments, and vaccination history all in
                    one place.
                </p>
                <div className="hero-actions">
                    <button
                        type="button"
                        className="hero-action-btn"
                        onClick={() => scrollToSection("patients")}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        className="hero-action-btn"
                        onClick={() => scrollToSection("clinics")}
                    >
                        Clinic
                    </button>
                </div>
            </section>

            <section className="feature-section patient-section" id="patients" ref={patientRef}>
                <div className="split-layout">
                    <div className="split-title">
                        <ScrollReveal
                            className="section-kicker"
                            baseOpacity={0.1}
                            enableBlur
                            baseRotation={3}
                            blurStrength={4}
                        >
                            Designed for Patients
                        </ScrollReveal>
                    </div>
                    <ul className={`feature-list from-right ${patientVisible ? "in-view" : ""}`}>
                        <li className="feature-item">
                            <span className="feature-item-icon">📄</span>
                            <div>
                                <h3>View immunization history</h3>
                                <p>Access your complete vaccination timeline in seconds.</p>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-item-icon">📅</span>
                            <div>
                                <h3>Book appointments easily</h3>
                                <p>Schedule clinic visits quickly with fewer steps.</p>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-item-icon">🔔</span>
                            <div>
                                <h3>Receive reminders &amp; updates</h3>
                                <p>Stay on track with timely notifications and alerts.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="feature-section clinic-section" id="clinics" ref={clinicRef}>
                <div className="split-layout clinic-left-layout">
                    <div className="split-title">
                        <ScrollReveal
                            className="section-kicker"
                            baseOpacity={0.1}
                            enableBlur
                            baseRotation={3}
                            blurStrength={4}
                        >
                            Built for Clinics
                        </ScrollReveal>
                    </div>
                    <ul className={`feature-list from-left ${clinicVisible ? "in-view" : ""}`}>
                        <li className="feature-item">
                            <span className="feature-item-icon">👥</span>
                            <div>
                                <h3>Manage patient records</h3>
                                <p>Store and review patient data with secure workflows.</p>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-item-icon">📊</span>
                            <div>
                                <h3>Track vaccine inventory</h3>
                                <p>Monitor available stock and avoid shortages in real time.</p>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-item-icon">📈</span>
                            <div>
                                <h3>Monitor appointments &amp; analytics</h3>
                                <p>Measure daily activity and improve clinic operations.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
