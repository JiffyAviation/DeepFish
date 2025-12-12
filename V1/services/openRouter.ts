/**
 * OpenRouter Integration
 * Primary LLM routing with automatic fallback to direct APIs
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const REQUEST_TIMEOUT = 5000; // 5 seconds

interface OpenRouterModel {
    id: string;
    name: string;
    pricing: {
        prompt: string;
        completion: string;
    };
    context_length: number;
}

let modelCache: OpenRouterModel[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch available models from OpenRouter
 */
export async function fetchAvailableModels(apiKey: string): Promise<OpenRouterModel[]> {
    const now = Date.now();

    // Return cached if still valid
    if (modelCache.length > 0 && (now - lastCacheUpdate) < CACHE_TTL) {
        return modelCache;
    }

    try {
        const response = await fetch(`${OPENROUTER_API_URL}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        modelCache = data.data || [];
        lastCacheUpdate = now;

        console.log(`✅ Updated model cache: ${modelCache.length} models available`);
        return modelCache;
    } catch (error) {
        console.error('❌ OpenRouter model fetch failed:', error);
        // Return stale cache if available
        return modelCache;
    }
}

/**
 * Send request via OpenRouter with timeout
 */
export async function sendViaOpenRouter(
    model: string,
    messages: any[],
    apiKey: string
): Promise<{ text: string; provider: 'openrouter' }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://deepfish.app',
                'X-Title': 'DeepFish AI Studio'
            },
            body: JSON.stringify({
                model,
                messages
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        return {
            text: data.choices[0]?.message?.content || '',
            provider: 'openrouter'
        };
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('OpenRouter timeout - will fallback to direct API');
        }
        throw error;
    }
}

/**
 * Get recommended model for a provider
 */
export function getRecommendedModel(provider: 'google' | 'anthropic' | 'openai'): string {
    const recommendations = {
        google: 'google/gemini-2.5-flash',
        anthropic: 'anthropic/claude-3-5-sonnet',
        openai: 'openai/gpt-4-turbo'
    };

    return recommendations[provider];
}
