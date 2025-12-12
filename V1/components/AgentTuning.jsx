import React, { useState } from 'react';
import './AgentTuning.css';

const AGENTS_LIST = [
    { id: 'einstein', name: 'Einstein', role: 'Theoretical Physicist' },
    { id: 'oracle', name: 'The Architect', role: 'Omniscient System' },
    { id: 'hanna', name: 'Hanna', role: 'Senior Art Director' },
    { id: 'mei', name: 'Mei', role: 'Studio Director' },
    { id: 'it', name: 'IT', role: 'Principal Architect' },
    { id: 'vesper', name: 'Vesper', role: 'Global Concierge' },
    { id: 'abacus', name: 'ABACUS', role: 'Strategic Owner' },
];

const AgentTuning = () => {
    const [selectedAgent, setSelectedAgent] = useState('einstein');
    const [materialType, setMaterialType] = useState('youtube');
    const [materialUrl, setMaterialUrl] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('high');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const trainingMaterial = {
            agent: selectedAgent,
            agentName: AGENTS_LIST.find(a => a.id === selectedAgent)?.name,
            materialType,
            url: materialUrl,
            description,
            priority,
            addedBy: 'manual',
            bypassOracle: true,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Download as JSON
        const blob = new Blob([JSON.stringify(trainingMaterial, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedAgent}-manual-training-${Date.now()}.json`;
        a.click();

        setSubmitted(true);
        setTimeout(() => {
            setMaterialUrl('');
            setDescription('');
            setSubmitted(false);
        }, 3000);
    };

    const selectedAgentInfo = AGENTS_LIST.find(a => a.id === selectedAgent);

    return (
        <div className="agent-tuning-container">
            <div className="tuning-header">
                <h2>🎯 Manual Agent Training</h2>
                <p>Push specific materials directly to agents (bypasses Oracle)</p>
            </div>

            {submitted && (
                <div className="success-banner">
                    ✅ Training material queued for {selectedAgentInfo?.name}! Material will be processed immediately.
                </div>
            )}

            <form onSubmit={handleSubmit} className="tuning-form">
                {/* Agent Selection */}
                <div className="form-section">
                    <h3>Select Agent</h3>
                    <div className="agent-selector">
                        {AGENTS_LIST.map(agent => (
                            <div
                                key={agent.id}
                                className={`agent-option ${selectedAgent === agent.id ? 'selected' : ''}`}
                                onClick={() => setSelectedAgent(agent.id)}
                            >
                                <div className="agent-option-name">{agent.name}</div>
                                <div className="agent-option-role">{agent.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Material Details */}
                <div className="form-section">
                    <h3>Training Material</h3>

                    <div className="form-group">
                        <label>Material Type</label>
                        <select
                            value={materialType}
                            onChange={(e) => setMaterialType(e.target.value)}
                            className="form-select"
                        >
                            <option value="youtube">YouTube Video</option>
                            <option value="youtube_channel">YouTube Channel</option>
                            <option value="website">Website/Article</option>
                            <option value="pdf">PDF Document</option>
                            <option value="text">Plain Text</option>
                            <option value="book">Book/eBook</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>URL or File Path *</label>
                        <input
                            type="text"
                            value={materialUrl}
                            onChange={(e) => setMaterialUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>What should {selectedAgentInfo?.name} learn from this?</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Advanced quantum mechanics concepts, Strategic thinking frameworks..."
                            className="form-textarea"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Training Priority</label>
                        <div className="priority-selector">
                            <button
                                type="button"
                                className={`priority-btn ${priority === 'immediate' ? 'selected' : ''}`}
                                onClick={() => setPriority('immediate')}
                            >
                                🔴 Immediate
                            </button>
                            <button
                                type="button"
                                className={`priority-btn ${priority === 'high' ? 'selected' : ''}`}
                                onClick={() => setPriority('high')}
                            >
                                🟠 High
                            </button>
                            <button
                                type="button"
                                className={`priority-btn ${priority === 'normal' ? 'selected' : ''}`}
                                onClick={() => setPriority('normal')}
                            >
                                🟢 Normal
                            </button>
                        </div>
                    </div>
                </div>

                <div className="tuning-info">
                    <p><strong>Note:</strong> This material will bypass Oracle's automated distribution and go directly to {selectedAgentInfo?.name}'s training queue.</p>
                </div>

                <button type="submit" className="submit-btn">
                    Push to {selectedAgentInfo?.name} Training Queue
                </button>
            </form>

            {/* Recent Manual Uploads */}
            <div className="recent-uploads">
                <h3>Recent Manual Uploads</h3>
                <div className="uploads-list">
                    <div className="upload-item">
                        <div className="upload-agent">Einstein</div>
                        <div className="upload-desc">YouTube: Advanced Physics Lecture</div>
                        <div className="upload-time">2 hours ago</div>
                        <span className="upload-status processing">Processing</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTuning;
