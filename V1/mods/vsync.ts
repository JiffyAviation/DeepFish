/**
 * VSync Module (Viseme Sync)
 * Real-time lip sync engine using 32 phoneme positions
 * 
 * Usage:
 *   const sync = new VSync({ agentId: 'oracle' });
 *   await sync.speak("Hello world");
 */

export interface VSyncConfig {
    agentId: string;
    frameRate?: number;
    ttsProvider?: 'web-speech' | 'elevenlabs';
}

export interface Phoneme {
    symbol: string;
    duration: number;
}

/**
 * 32 Phoneme to Viseme mapping
 * Based on IPA (International Phonetic Alphabet)
 */
const PHONEME_MAP: Record<string, string> = {
    // Vowels
    'AA': 'AA', // father
    'AE': 'AE', // cat
    'AH': 'AH', // but
    'AO': 'AO', // caught
    'AW': 'AW', // cow
    'AY': 'AY', // hide
    'EH': 'EH', // bed
    'ER': 'ER', // bird
    'EY': 'EY', // ate
    'IH': 'IH', // it
    'IY': 'IY', // eat
    'OW': 'OW', // oat
    'OY': 'OY', // toy
    'UH': 'UH', // book
    'UW': 'UW', // boot

    // Consonants
    'B': 'BP', 'P': 'BP', 'M': 'BP', // lips closed
    'F': 'FV', 'V': 'FV', // teeth on lip
    'TH': 'TH', 'DH': 'TH', // tongue between teeth
    'T': 'TD', 'D': 'TD', 'N': 'TD', // tongue on roof
    'S': 'SZ', 'Z': 'SZ', // teeth together
    'SH': 'SH', 'ZH': 'SH', // lips forward
    'CH': 'CH', 'JH': 'CH', // lips forward, stop
    'K': 'KG', 'G': 'KG', // back of throat
    'L': 'L', // tongue up
    'R': 'R', // lips rounded
    'W': 'W', // lips very rounded
    'Y': 'Y', // lips spread
    'H': 'H', // mouth open
    'NG': 'NG' // nasal
};

/**
 * Simple text to phoneme conversion
 * (Simplified version - production would use CMU dict)
 */
export const textToPhonemes = (text: string): Phoneme[] => {
    const words = text.toLowerCase().split(' ');
    const phonemes: Phoneme[] = [];

    // Simplified phoneme estimation
    // TODO: Use proper phoneme dictionary
    for (const word of words) {
        for (const char of word) {
            const phoneme = charToPhoneme(char);
            if (phoneme) {
                phonemes.push({ symbol: phoneme, duration: 0.1 });
            }
        }
    }

    return phonemes;
};

const charToPhoneme = (char: string): string | null => {
    const map: Record<string, string> = {
        'a': 'AE', 'e': 'EH', 'i': 'IH', 'o': 'OW', 'u': 'UH',
        'b': 'B', 'p': 'P', 'm': 'M', 'f': 'F', 'v': 'V',
        't': 'T', 'd': 'D', 'n': 'N', 's': 'S', 'z': 'Z',
        'k': 'K', 'g': 'G', 'l': 'L', 'r': 'R', 'w': 'W',
        'y': 'Y', 'h': 'H'
    };
    return map[char] || null;
};

/**
 * VSync Engine
 */
export class VSync {
    private agentId: string;
    private frameRate: number;
    private currentViseme: string = 'neutral';
    private onVisemeChange?: (viseme: string) => void;

    constructor(config: VSyncConfig) {
        this.agentId = config.agentId;
        this.frameRate = config.frameRate || 60;
    }

    /**
     * Register callback for viseme changes
     */
    onViseme(callback: (viseme: string) => void) {
        this.onVisemeChange = callback;
    }

    /**
     * Speak text with lip sync
     */
    async speak(text: string): Promise<void> {
        // Generate phonemes
        const phonemes = textToPhonemes(text);

        // Generate audio (using Web Speech API for now)
        const utterance = new SpeechSynthesisUtterance(text);
        const duration = this.estimateDuration(text);

        // Start animation
        this.animate(phonemes, duration);

        // Play audio
        return new Promise((resolve) => {
            utterance.onend = () => {
                this.currentViseme = 'neutral';
                this.onVisemeChange?.('neutral');
                resolve();
            };
            speechSynthesis.speak(utterance);
        });
    }

    /**
     * Animate visemes in sync with phonemes
     */
    private animate(phonemes: Phoneme[], totalDuration: number) {
        const startTime = Date.now();
        const timePerPhoneme = totalDuration / phonemes.length;

        let currentIndex = 0;

        const animationLoop = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const targetIndex = Math.floor(elapsed / timePerPhoneme);

            if (targetIndex >= phonemes.length) {
                clearInterval(animationLoop);
                return;
            }

            if (targetIndex !== currentIndex) {
                currentIndex = targetIndex;
                const phoneme = phonemes[currentIndex];
                const viseme = PHONEME_MAP[phoneme.symbol] || 'neutral';

                this.currentViseme = viseme;
                this.onVisemeChange?.(viseme);
            }
        }, 1000 / this.frameRate);
    }

    /**
     * Estimate speech duration (rough)
     */
    private estimateDuration(text: string): number {
        // Average: ~150 words per minute = 2.5 words per second
        const words = text.split(' ').length;
        return (words / 2.5);
    }

    /**
     * Get current viseme
     */
    getCurrentViseme(): string {
        return this.currentViseme;
    }
}

export default VSync;
