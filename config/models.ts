/**
 * Model Configuration with Fallback Chains
 */

export interface ModelConfig {
    provider: 'google' | 'anthropic' | 'openai';
    openRouterModel: string;
    directFallback: string[];
    apiEndpoint: string;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
    gemini: {
        provider: 'google',
        openRouterModel: 'google/gemini-2.5-flash',
        directFallback: [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-pro'
        ],
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta'
    },
    claude: {
        provider: 'anthropic',
        openRouterModel: 'anthropic/claude-3-5-sonnet',
        directFallback: [
            'claude-3-5-sonnet-latest',
            'claude-3-5-sonnet-20241022',
            'claude-3-sonnet-20240229'
        ],
        apiEndpoint: 'https://api.anthropic.com/v1'
    },
    gpt: {
        provider: 'openai',
        openRouterModel: 'openai/gpt-4-turbo',
        directFallback: [
            'gpt-4-turbo',
            'gpt-4',
            'gpt-3.5-turbo'
        ],
        apiEndpoint: 'https://api.openai.com/v1'
    }
};

export const REQUEST_TIMEOUT_MS = 5000;
export const MODEL_CACHE_TTL_MS = 3600000; // 1 hour
