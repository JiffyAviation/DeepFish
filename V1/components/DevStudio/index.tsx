/**
 * DeepFish Dev Studio - Main Dashboard
 * Internal-only agent creation and management tool
 * 
 * Access: Developers only (VITE_DEV_MODE=true)
 */

import React, { useState, useEffect } from 'react';
import AgentSelector from './AgentSelector';
import AgentEditor from './AgentEditor';
import './DevStudio.css';

interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'published' | 'draft' | 'imported';
    source?: 'custom' | 'anthropic' | 'google';
}

const DevStudio: React.FC = () => {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        // Load all agents from agents/ directory
        loadAgents();
    }, []);

    const loadAgents = async () => {
        // TODO: Implement agent loading from file system
        // For now, mock data
        setAgents([
            { id: 'mei', name: 'Mei', role: 'Studio Director', status: 'published', source: 'custom' },
            { id: 'hanna', name: 'Hanna', role: 'Creative Director', status: 'published', source: 'custom' },
            { id: 'vesper', name: 'Vesper', role: 'Global Concierge', status: 'published', source: 'custom' },
            { id: 'skillz', name: 'Skillz', role: 'Lead Developer', status: 'published', source: 'custom' },
            { id: 'oracle', name: 'Oracle', role: 'System Administrator', status: 'published', source: 'custom' },
        ]);
    };

    const handleAgentSelect = (agentId: string) => {
        setSelectedAgentId(agentId);
    };

    const handleNewAgent = () => {
        // TODO: Create new agent
        console.log('Create new agent');
    };

    const handleImportAgent = () => {
        // TODO: Open marketplace import
        console.log('Import agent from marketplace');
    };

    return (
        <div className="dev-studio">
            <header className="dev-studio-header">
                <h1>🛠️ DeepFish Dev Studio</h1>
                <p>Internal Agent Creation Dashboard</p>
            </header>

            <div className="dev-studio-layout">
                <aside className="dev-studio-sidebar">
                    <AgentSelector
                        agents={agents}
                        selectedId={selectedAgentId}
                        onSelect={handleAgentSelect}
                        onNew={handleNewAgent}
                        onImport={handleImportAgent}
                    />
                </aside>

                <main className="dev-studio-main">
                    {selectedAgentId ? (
                        <AgentEditor agentId={selectedAgentId} />
                    ) : (
                        <div className="dev-studio-welcome">
                            <h2>Welcome to DeepFish Dev Studio</h2>
                            <p>Select an agent to edit, or create a new one.</p>
                            <div className="welcome-actions">
                                <button onClick={handleNewAgent} className="btn-primary">
                                    + Create New Agent
                                </button>
                                <button onClick={handleImportAgent} className="btn-secondary">
                                    📥 Import from Marketplace
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DevStudio;
