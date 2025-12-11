/**
 * Agent Selector Component
 * Lists all available agents for editing
 */

import React, { useState } from 'react';

interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'published' | 'draft' | 'imported';
    source?: 'custom' | 'anthropic' | 'google';
}

interface AgentSelectorProps {
    agents: Agent[];
    selectedId: string | null;
    onSelect: (agentId: string) => void;
    onNew: () => void;
    onImport: () => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
    agents,
    selectedId,
    onSelect,
    onNew,
    onImport
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState<string>('all');

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterSource === 'all' || agent.source === filterSource;
        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status: Agent['status']) => {
        switch (status) {
            case 'published': return '✅';
            case 'draft': return '📝';
            case 'imported': return '📥';
            default: return '';
        }
    };

    const getSourceBadge = (source?: Agent['source']) => {
        if (!source || source === 'custom') return null;
        return (
            <span className={`source-badge source-${source}`}>
                {source === 'anthropic' ? 'A' : 'G'}
            </span>
        );
    };

    return (
        <div className="agent-selector">
            <div className="selector-header">
                <h3>Agents</h3>
                <div className="selector-actions">
                    <button onClick={onNew} className="btn-new" title="Create New Agent">
                        +
                    </button>
                    <button onClick={onImport} className="btn-import" title="Import from Marketplace">
                        📥
                    </button>
                </div>
            </div>

            <div className="selector-filters">
                <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Sources</option>
                    <option value="custom">Custom</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                </select>
            </div>

            <div className="agent-list">
                {filteredAgents.map(agent => (
                    <div
                        key={agent.id}
                        className={`agent-item ${selectedId === agent.id ? 'selected' : ''}`}
                        onClick={() => onSelect(agent.id)}
                    >
                        <div className="agent-item-header">
                            <span className="agent-status">{getStatusIcon(agent.status)}</span>
                            <span className="agent-name">{agent.name}</span>
                            {getSourceBadge(agent.source)}
                        </div>
                        <div className="agent-role">{agent.role}</div>
                    </div>
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="no-agents">
                    <p>No agents found</p>
                </div>
            )}
        </div>
    );
};

export default AgentSelector;
