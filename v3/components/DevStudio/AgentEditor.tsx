/**
 * Agent Editor Component
 * Edit agent properties, voice, visual identity, and training
 */

import React, { useState, useEffect } from 'react';

interface AgentEditorProps {
    agentId: string;
}

const AgentEditor: React.FC<AgentEditorProps> = ({ agentId }) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'personality' | 'voice' | 'visual' | 'training' | 'advanced'>('basic');
    const [agentData, setAgentData] = useState<any>(null);

    useEffect(() => {
        // Load agent data
        loadAgent(agentId);
    }, [agentId]);

    const loadAgent = async (id: string) => {
        // TODO: Load agent from file system
        // For now, mock data
        setAgentData({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            role: 'Agent Role',
            model: 'claude-sonnet-4',
            basePrompt: 'You are a helpful AI assistant...',
        });
    };

    const handleSave = () => {
        // TODO: Save agent to file system
        console.log('Saving agent:', agentData);
    };

    if (!agentData) {
        return <div className="agent-editor-loading">Loading agent...</div>;
    }

    return (
        <div className="agent-editor">
            <div className="editor-header">
                <h2>Editing: {agentData.name}</h2>
                <button onClick={handleSave} className="btn-save">
                    💾 Save Agent
                </button>
            </div>

            <div className="editor-tabs">
                <button
                    className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Info
                </button>
                <button
                    className={`tab ${activeTab === 'personality' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personality')}
                >
                    Personality
                </button>
                <button
                    className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
                    onClick={() => setActiveTab('voice')}
                >
                    Voice
                </button>
                <button
                    className={`tab ${activeTab === 'visual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('visual')}
                >
                    Visual
                </button>
                <button
                    className={`tab ${activeTab === 'training' ? 'active' : ''}`}
                    onClick={() => setActiveTab('training')}
                >
                    Training
                </button>
                <button
                    className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    Advanced
                </button>
            </div>

            <div className="editor-content">
                {activeTab === 'basic' && (
                    <div className="tab-content">
                        <h3>Basic Information</h3>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={agentData.name}
                                onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role/Title</label>
                            <input
                                type="text"
                                value={agentData.role}
                                onChange={(e) => setAgentData({ ...agentData, role: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <select
                                value={agentData.model}
                                onChange={(e) => setAgentData({ ...agentData, model: e.target.value })}
                            >
                                <option value="claude-sonnet-4">Claude Sonnet 4</option>
                                <option value="claude-opus-4.5">Claude Opus 4.5</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'personality' && (
                    <div className="tab-content">
                        <h3>Personality & Behavior</h3>
                        <div className="form-group">
                            <label>Base Prompt (System Instruction)</label>
                            <textarea
                                value={agentData.basePrompt}
                                onChange={(e) => setAgentData({ ...agentData, basePrompt: e.target.value })}
                                rows={10}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'voice' && (
                    <div className="tab-content">
                        <h3>Voice Configuration</h3>
                        <p>🔊 ElevenLabs voice selector coming soon...</p>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <div className="tab-content">
                        <h3>Visual Identity</h3>
                        <p>🎨 Image uploader and color picker coming soon...</p>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="tab-content">
                        <h3>Training Materials</h3>
                        <p>📚 Training panel coming soon...</p>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="tab-content">
                        <h3>Advanced Settings</h3>
                        <p>⚙️ JSON editor coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentEditor;
