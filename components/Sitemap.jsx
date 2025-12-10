import React from 'react';
import './Sitemap.css';

const Sitemap = () => {
    const routes = [
        {
            path: '/',
            name: 'Home / Landing Page',
            description: 'Email gate and main landing page with agent carousel',
            status: '✅ Live'
        },
        {
            path: '/login',
            name: 'Login / Sign Up',
            description: 'User authentication and account creation',
            status: '✅ Live'
        },
        {
            path: '/admin',
            name: 'Admin Dashboard',
            description: 'Agent management, training, and system monitoring',
            status: '✅ Live',
            features: [
                'Add New Agent',
                'Agent Tuning',
                'Agent Status',
                'Training Queue',
                'System Health'
            ]
        },
        {
            path: '/app',
            name: 'AI Studio',
            description: 'Chat with AI agents (Einstein, Oracle, Hanna, Mei, IT, Vesper, ABACUS)',
            status: '🚀 Deployed',
            features: [
                'Multi-agent conversations',
                'Room-based workspaces',
                'Oracle mode',
                'Speech recognition',
                'Image upload'
            ]
        }
    ];

    return (
        <div className="sitemap-container">
            <div className="sitemap-content">
                <header className="sitemap-header">
                    <h1>🐠 DeepFish Site Map</h1>
                    <p>Navigate to any part of the DeepFish platform</p>
                </header>

                <div className="routes-grid">
                    {routes.map((route) => (
                        <div key={route.path} className="route-card">
                            <div className="route-header">
                                <h2>{route.name}</h2>
                                <span className="status-badge">{route.status}</span>
                            </div>

                            <p className="route-description">{route.description}</p>

                            {route.features && (
                                <div className="features-list">
                                    <h3>Features:</h3>
                                    <ul>
                                        {route.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <a href={route.path} className="visit-button">
                                Visit {route.name} →
                            </a>
                        </div>
                    ))}
                </div>

                <div className="quick-links">
                    <h2>Quick Links</h2>
                    <div className="links-grid">
                        <a href="/" className="quick-link">🏠 Home</a>
                        <a href="/login" className="quick-link">🔐 Login</a>
                        <a href="/admin" className="quick-link">⚙️ Admin</a>
                        <a href="/app" className="quick-link">🤖 AI Studio</a>
                    </div>
                </div>

                <div className="system-info">
                    <h2>System Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Live URL:</strong>
                            <a href="https://deepfish.app" target="_blank" rel="noopener noreferrer">
                                deepfish.app
                            </a>
                        </div>
                        <div className="info-item">
                            <strong>Hosting:</strong> Railway
                        </div>
                        <div className="info-item">
                            <strong>Repository:</strong>
                            <a href="https://github.com/JiffyAviation/DeepFish" target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a>
                        </div>
                        <div className="info-item">
                            <strong>AI Engine:</strong> Google Gemini
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
