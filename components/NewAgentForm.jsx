import React, { useState } from 'react';
import './NewAgentForm.css';

const NewAgentForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        specialty: '',
        color: '#00d4ff',
        trainingSources: [{ type: 'youtube', url: '', description: '' }]
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSourceChange = (index, field, value) => {
        const newSources = [...formData.trainingSources];
        newSources[index][field] = value;
        setFormData({ ...formData, trainingSources: newSources });
    };

    const addSource = () => {
        setFormData({
            ...formData,
            trainingSources: [...formData.trainingSources, { type: 'youtube', url: '', description: '' }]
        });
    };

    const removeSource = (index) => {
        const newSources = formData.trainingSources.filter((_, i) => i !== index);
        setFormData({ ...formData, trainingSources: newSources });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create training config
        const trainingConfig = {
            agent: formData.name.toLowerCase().replace(/\s+/g, '-'),
            agentName: formData.name,
            agentRole: formData.role,
            trainingStatus: 'queued',
            trainingSources: formData.trainingSources.map(source => ({
                type: source.type,
                url: source.url,
                description: source.description,
                priority: 'high',
                extractionMethod: source.type === 'youtube' ? 'transcripts' : 'text',
                updateFrequency: 'weekly'
            })),
            trainingParameters: {
                specialty: formData.specialty,
                contextWindow: 'extended',
                learningStyle: 'analytical',
                outputFormat: 'detailed_explanations'
            },
            oracleAssignment: {
                monitored: true,
                autoUpdate: true,
                reportingCadence: 'monthly',
                notes: 'Oracle will process this agent in the next training cycle'
            },
            deploymentTrigger: 'next_oracle_cycle',
            createdDate: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            color: formData.color
        };

        // Download as JSON (user can commit to repo)
        const blob = new Blob([JSON.stringify(trainingConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trainingConfig.agent}-training-config.json`;
        a.click();

        setSubmitted(true);
        setTimeout(() => {
            setFormData({
                name: '',
                role: '',
                specialty: '',
                color: '#00d4ff',
                trainingSources: [{ type: 'youtube', url: '', description: '' }]
            });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <div className="new-agent-form-container">
            <div className="form-header">
                <h2>Add New Team Member</h2>
                <p>Oracle will train this agent in the next cycle</p>
            </div>

            {submitted && (
                <div className="success-message">
                    ✅ Agent queued! Config file downloaded. Add it to /agents/ folder and commit to GitHub.
                </div>
            )}

            <form onSubmit={handleSubmit} className="new-agent-form">
                <div className="form-section">
                    <h3>Agent Details</h3>

                    <div className="form-group">
                        <label>Agent Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Einstein, Sally, Newton"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Role/Title *</label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="e.g., Theoretical Physicist, Marketing Director"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Specialty/Focus *</label>
                        <textarea
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            placeholder="What does this agent specialize in?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Agent Color</label>
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Training Materials</h3>

                    {formData.trainingSources.map((source, index) => (
                        <div key={index} className="training-source">
                            <div className="source-header">
                                <h4>Source {index + 1}</h4>
                                {formData.trainingSources.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSource(index)}
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Source Type</label>
                                <select
                                    value={source.type}
                                    onChange={(e) => handleSourceChange(index, 'type', e.target.value)}
                                >
                                    <option value="youtube">YouTube Channel</option>
                                    <option value="youtube_video">Single YouTube Video</option>
                                    <option value="website">Website</option>
                                    <option value="document">Document/PDF</option>
                                    <option value="book">Book</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>URL/Link *</label>
                                <input
                                    type="url"
                                    value={source.url}
                                    onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={source.description}
                                    onChange={(e) => handleSourceChange(index, 'description', e.target.value)}
                                    placeholder="What should the agent learn from this?"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addSource}
                        className="add-source-btn"
                    >
                        + Add Another Source
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Queue Agent for Training
                </button>
            </form>
        </div>
    );
};

export default NewAgentForm;
