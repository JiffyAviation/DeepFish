import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // For now, just store in localStorage (replace with real auth later)
        if (isSignup) {
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            localStorage.setItem('deepfish_user', JSON.stringify({
                email: formData.email,
                signupDate: new Date().toISOString()
            }));
        }

        localStorage.setItem('deepfish_logged_in', 'true');

        // Redirect to AI Studio
        navigate('/app');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>🐠 DeepFish</h1>
                    <p>{isSignup ? 'Create your account' : 'Welcome back'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {isSignup && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="login-btn">
                        {isSignup ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="toggle-btn"
                        >
                            {isSignup ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>

                <div className="back-link">
                    <a href="/">← Back to home</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
