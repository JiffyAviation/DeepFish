/**
 * API Retry Logic with Circuit Breaker
 */

interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    timeout: number;
}

interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
}

const DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    timeout: 30000
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Exponential backoff delay
 */
function getDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get or create circuit breaker for endpoint
 */
function getCircuitBreaker(endpoint: string): CircuitBreakerState {
    if (!circuitBreakers.has(endpoint)) {
        circuitBreakers.set(endpoint, {
            failures: 0,
            lastFailure: 0,
            state: 'closed'
        });
    }
    return circuitBreakers.get(endpoint)!;
}

/**
 * Check if circuit breaker allows request
 */
function canMakeRequest(endpoint: string): boolean {
    const breaker = getCircuitBreaker(endpoint);

    if (breaker.state === 'closed') {
        return true;
    }

    if (breaker.state === 'open') {
        const timeSinceFailure = Date.now() - breaker.lastFailure;
        if (timeSinceFailure > CIRCUIT_BREAKER_TIMEOUT) {
            breaker.state = 'half-open';
            return true;
        }
        return false;
    }

    // half-open: allow one request to test
    return true;
}

/**
 * Record success for circuit breaker
 */
function recordSuccess(endpoint: string): void {
    const breaker = getCircuitBreaker(endpoint);
    breaker.failures = 0;
    breaker.state = 'closed';
}

/**
 * Record failure for circuit breaker
 */
function recordFailure(endpoint: string): void {
    const breaker = getCircuitBreaker(endpoint);
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        breaker.state = 'open';
        console.warn(`Circuit breaker OPEN for ${endpoint}`);
    }
}

/**
 * Fetch with retry and circuit breaker
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    config: Partial<RetryConfig> = {}
): Promise<Response> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Check circuit breaker
    if (!canMakeRequest(url)) {
        throw new Error(`Circuit breaker open for ${url}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Success
            recordSuccess(url);
            return response;

        } catch (error: any) {
            lastError = error;

            // Don't retry on abort (user cancelled)
            if (error.name === 'AbortError' && !error.message?.includes('timeout')) {
                throw error;
            }

            // Last attempt, don't wait
            if (attempt === finalConfig.maxAttempts - 1) {
                break;
            }

            // Wait before retry
            const delay = getDelay(attempt, finalConfig);
            console.warn(`Request failed (attempt ${attempt + 1}/${finalConfig.maxAttempts}), retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }

    // All attempts failed
    recordFailure(url);
    throw lastError || new Error('Request failed after retries');
}

/**
 * Reset circuit breaker (for testing or manual recovery)
 */
export function resetCircuitBreaker(endpoint: string): void {
    circuitBreakers.delete(endpoint);
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus(endpoint: string): CircuitBreakerState {
    return getCircuitBreaker(endpoint);
}
