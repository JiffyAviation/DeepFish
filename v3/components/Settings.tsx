import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { safeLocalStorage } from '../utils/storage';

interface APIKey {
    name: string;
    key: string;
    storageKey: string;
    description: string;
    getUrl: string;
    required: boolean;
}

const Settings: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([
        {
            name: 'OpenRouter',
            key: '',
            storageKey: 'deepfish_api_key_openrouter',
            description: 'Universal LLM router - auto-discovers models (Primary)',
            getUrl: 'https://openrouter.ai/keys',
            required: true
        },
        {
            name: 'Google Gemini',
            key: '',
            storageKey: 'deepfish_api_key_gemini',
            description: 'Direct Gemini API (Fallback)',
            getUrl: 'https://ai.google.dev/',
            required: false
        },
        {
            name: 'Anthropic Claude',
            key: '',
            storageKey: 'deepfish_api_key_anthropic',
            description: 'Direct Claude API (Optional)',
            getUrl: 'https://console.anthropic.com/',
            required: false
        },
        {
            name: 'ElevenLabs',
            key: '',
            storageKey: 'deepfish_api_key_elevenlabs',
            description: 'Text-to-speech for agent voices',
            getUrl: 'https://elevenlabs.io/',
            required: false
        }
    ]);

    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const [saved, setSaved] = useState(false);

    // Load API keys from localStorage on mount
    useEffect(() => {
        const loadedKeys = apiKeys.map(apiKey => ({
            ...apiKey,
            key: safeLocalStorage.getItem(apiKey.storageKey) || ''
        }));
        setApiKeys(loadedKeys);
    }, []);

    const handleKeyChange = (index: number, value: string) => {
        const updated = [...apiKeys];
        updated[index].key = value;
        setApiKeys(updated);
        setSaved(false);
    };

    const toggleShowKey = (storageKey: string) => {
        setShowKeys(prev => ({ ...prev, [storageKey]: !prev[storageKey] }));
    };

    const handleSave = () => {
        apiKeys.forEach(apiKey => {
            if (apiKey.key.trim()) {
                safeLocalStorage.setItem(apiKey.storageKey, apiKey.key.trim());
            } else {
                safeLocalStorage.removeItem(apiKey.storageKey);
            }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleClear = (index: number) => {
        const updated = [...apiKeys];
        updated[index].key = '';
        setApiKeys(updated);
        safeLocalStorage.removeItem(apiKeys[index].storageKey);
    };

    const maskKey = (key: string): string => {
        if (!key || key.length < 8) return key;
        return '•'.repeat(key.length - 4) + key.slice(-4);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="border-b border-zinc-800 bg-zinc-950">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <Icon name="Settings" className="w-8 h-8 text-blue-400" />
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-zinc-400 text-sm mt-1">Configure your API keys</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8 p-4 border border-yellow-900/50 bg-yellow-950/20 rounded-lg flex items-start gap-3">
                    <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-yellow-200 font-semibold mb-1">Security Notice</p>
                        <p className="text-yellow-100/80">
                            API keys are stored in your browser's localStorage.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Icon name="Key" className="w-5 h-5 text-blue-400" />
                        API Keys
                    </h2>

                    {apiKeys.map((apiKey, index) => (
                        <div key={apiKey.storageKey} className="border border-zinc-800 rounded-lg p-6 bg-zinc-950/50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {apiKey.name}
                                        {apiKey.required && (
                                            <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 border border-red-800 rounded">
                                                Required
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-zinc-400 mt-1">{apiKey.description}</p>
                                    <a
                                        href={apiKey.getUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1"
                                    >
                                        Get API Key <Icon name="ExternalLink" className="w-3 h-3" />
                                    </a>
                                </div>
                                {apiKey.key && (
                                    <button
                                        onClick={() => handleClear(index)}
                                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                    >
                                        <Icon name="Trash2" className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type={showKeys[apiKey.storageKey] ? 'text' : 'password'}
                                    value={apiKey.key}
                                    onChange={(e) => handleKeyChange(index, e.target.value)}
                                    placeholder={`Enter your ${apiKey.name} API key`}
                                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 pr-12 font-mono text-sm"
                                />
                                <button
                                    onClick={() => toggleShowKey(apiKey.storageKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                                >
                                    <Icon name={showKeys[apiKey.storageKey] ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
                                </button>
                            </div>

                            {apiKey.key && !showKeys[apiKey.storageKey] && (
                                <p className="text-xs text-zinc-500 mt-2 font-mono">
                                    Stored: {maskKey(apiKey.key)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Icon name="Save" className="w-5 h-5" />
                        Save Settings
                    </button>

                    {saved && (
                        <div className="flex items-center gap-2 text-green-400">
                            <Icon name="CheckCircle" className="w-5 h-5" />
                            <span className="text-sm font-medium">Saved!</span>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-800">
                    <a
                        href="/app"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm"
                    >
                        <Icon name="ArrowLeft" className="w-4 h-4" />
                        Back to DeepFish Studio
                    </a>
                </div>
            </main>
        </div>
    );
};

export default Settings;
