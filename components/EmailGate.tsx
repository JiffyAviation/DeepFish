import React, { useState } from 'react';
import './EmailGate.css';
import { safeLocalStorage } from '../utils/storage';

interface EmailGateProps {
    onSuccess: () => void;
}

const EmailGate: React.FC<EmailGateProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        // Temporarily bypass FormSubmit until we set it up properly
        // Just store the email and show the landing page
        safeLocalStorage.setItem('deepfish_email_submitted', 'true');
        safeLocalStorage.setItem('deepfish_user_email', email);

        // Show success and reveal landing page
        setTimeout(() => {
            onSuccess();
        }, 800);

        /* TODO: Add real email collection later
        try {
            const response = await fetch('https://formsubmit.co/ajax/jeffreyphoneLG@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    _subject: 'New DeepFish Waitlist Signup',
                    _template: 'table'
                })
            });

            if (response.ok) {
                localStorage.setItem('deepfish_email_submitted', 'true');
                localStorage.setItem('deepfish_user_email', email);
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            } else {
                setError('Something went wrong. Please try again.');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setIsSubmitting(false);
        }
        */
    };

    return (
        <div className="email-gate">
            <div className="email-gate-container">
                <div className="email-gate-content">
                    {/* Logo / Branding */}
                    <div className="gate-logo">
                        <span className="logo-icon">🐟</span>
                        <h1 className="logo-text">DeepFish</h1>
                    </div>

                    {/* Headline */}
                    <h2 className="gate-headline">
                        Your Elite AI Team
                        <br />
                        <span className="gradient-text">18 Specialized Agents</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="gate-description">
                        From concept to deployment. Join the waitlist for early access.
                    </p>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="gate-form">
                        <div className="input-wrapper">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="gate-input"
                                disabled={isSubmitting}
                                required
                            />
                            <button
                                type="submit"
                                className="gate-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="loading">Joining...</span>
                                ) : (
                                    <span>Get Early Access →</span>
                                )}
                            </button>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </form>

                    {/* Trust Indicators */}
                    <div className="trust-badges">
                        <span className="badge">🔒 No spam, ever</span>
                        <span className="badge">⚡ Instant access</span>
                        <span className="badge">🎨 Elite quality</span>
                    </div>

                    {/* Login Link */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <a
                            href="/login"
                            style={{
                                color: '#00d4ff',
                                textDecoration: 'none',
                                fontSize: '14px',
                                opacity: 0.8,
                                transition: 'opacity 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                            Already have an account? Log in →
                        </a>
                    </div>
                </div>
            </div>

            {/* Animated background */}
            <div className="gate-background"></div>
        </div>
    );
};

export default EmailGate;
