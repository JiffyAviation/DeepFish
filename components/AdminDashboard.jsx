import React, { useState } from 'react';
import NewAgentForm from './NewAgentForm';
import AgentTuning from './AgentTuning';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('agents');

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>🔧 DeepFish Admin Dashboard</h1>
                <p>Engineering & Administrative Platform</p>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-nav">
                <button
                    className={activeTab === 'agents' ? 'active' : ''}
                    onClick={() => setActiveTab('agents')}
                >
                    Add New Agent
                </button>
                <button
                    className={activeTab === 'tuning' ? 'active' : ''}
                    onClick={() => setActiveTab('tuning')}
                >
                    Agent Tuning
                </button>
                <button
                    className={activeTab === 'status' ? 'active' : ''}
                    onClick={() => setActiveTab('status')}
                >
                    Agent Status
                </button>
                <button
                    className={activeTab === 'queue' ? 'active' : ''}
                    onClick={() => setActiveTab('queue')}
                >
                    Training Queue
                </button>
                <button
                    className={activeTab === 'system' ? 'active' : ''}
                    onClick={() => setActiveTab('system')}
                >
                    System Health
                </button>
            </div>

            {/* Content Area */}
            <div className="dashboard-content">
                {activeTab === 'agents' && (
                    <div className="tab-content">
                        <NewAgentForm />
                    </div>
                )}

                {activeTab === 'tuning' && (
                    <div className="tab-content">
                        <AgentTuning />
                    </div>
                )}

                {activeTab === 'status' && (
                    <div className="tab-content">
                        <h2>Agent Status Overview</h2>
                        <div className="status-grid">
                            <div className="status-card active">
                                <div className="status-header">
                                    <h3>The Architect</h3>
                                    <span className="status-badge online">Online</span>
                                </div>
                                <p className="role">Omniscient System</p>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="metric-label">Training:</span>
                                        <span className="metric-value">Complete</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Last Active:</span>
                                        <span className="metric-value">2 min ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="status-card active">
                                <div className="status-header">
                                    <h3>Hanna</h3>
                                    <span className="status-badge online">Online</span>
                                </div>
                                <p className="role">Senior Art Director</p>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="metric-label">Training:</span>
                                        <span className="metric-value">Complete</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Last Active:</span>
                                        <span className="metric-value">5 min ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="status-card pending">
                                <div className="status-header">
                                    <h3>Einstein</h3>
                                    <span className="status-badge queued">Queued</span>
                                </div>
                                <p className="role">Theoretical Physicist</p>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="metric-label">Training:</span>
                                        <span className="metric-value">Queued</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Source:</span>
                                        <span className="metric-value">Julia McCoy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'queue' && (
                    <div className="tab-content">
                        <h2>Oracle Training Queue</h2>
                        <div className="queue-list">
                            <div className="queue-item processing">
                                <div className="queue-status">
                                    <div className="spinner"></div>
                                    <span>Processing</span>
                                </div>
                                <div className="queue-details">
                                    <h4>Einstein - Theoretical Physicist</h4>
                                    <p>Source: Julia McCoy YouTube Channel</p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '45%' }}></div>
                                    </div>
                                    <span className="progress-text">45% Complete</span>
                                </div>
                            </div>

                            <div className="queue-item pending">
                                <div className="queue-status">
                                    <span className="queue-number">1</span>
                                    <span>Pending</span>
                                </div>
                                <div className="queue-details">
                                    <h4>Next agent in queue...</h4>
                                    <p>Waiting for new config file</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="tab-content">
                        <h2>System Health</h2>
                        <div className="health-grid">
                            <div className="health-card healthy">
                                <h3>🟢 Website</h3>
                                <p className="health-status">Operational</p>
                                <p className="health-detail">deepfish.app</p>
                                <p className="uptime">Uptime: 99.9%</p>
                            </div>

                            <div className="health-card healthy">
                                <h3>🟢 Railway Deployment</h3>
                                <p className="health-status">Active</p>
                                <p className="health-detail">Last deploy: 5 min ago</p>
                                <p className="uptime">Build: Success</p>
                            </div>

                            <div className="health-card warning">
                                <h3>🟡 AI Studio</h3>
                                <p className="health-status">Offline</p>
                                <p className="health-detail">Awaiting API key setup</p>
                                <button className="action-btn">Configure</button>
                            </div>

                            <div className="health-card healthy">
                                <h3>🟢 Oracle Training</h3>
                                <p className="health-status">Active</p>
                                <p className="health-detail">1 agent in queue</p>
                                <p className="uptime">Next cycle: Weekly</p>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons">
                                <button className="action-btn primary">Deploy to Railway</button>
                                <button className="action-btn">View Logs</button>
                                <button className="action-btn">Backup Data</button>
                                <button className="action-btn">Clear Cache</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
