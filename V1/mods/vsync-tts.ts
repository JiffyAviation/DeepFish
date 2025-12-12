/**
 * VSync with TTS Integration
 * Combines lip sync animation with text-to-speech
 */

import { Phoneme, textToPhonemes } from './vsync';
import { ElevenLabsTTS, WebSpeechTTS, AGENT_VOICES } from './tts';

export interface VSyncTTSConfig {
    agentId: string;
    enableAnimation?: boolean; // Only true for Hanna
    ttsProvider: 'elevenlabs' | 'web-speech';
    elevenLabsApiKey?: string;
}

/**
 * VSync + TTS Combined Engine
 */
export class VSyncTTS {
    private agentId: string;
    private enableAnimation: boolean;
    private ttsProvider: 'elevenlabs' | 'web-speech';
    private elevenLabs?: ElevenLabsTTS;
    private webSpeech: WebSpeechTTS;
    private currentViseme: string = 'neutral';
    private onVisemeChange?: (viseme: string) => void;

    constructor(config: VSyncTTSConfig) {
        this.agentId = config.agentId;
        this.enableAnimation = config.enableAnimation ?? false;
        this.ttsProvider = config.ttsProvider;

        if (config.ttsProvider === 'elevenlabs' && config.elevenLabsApiKey) {
            this.elevenLabs = new ElevenLabsTTS(config.elevenLabsApiKey);
        }

        this.webSpeech = new WebSpeechTTS();
    }

    /**
     * Register callback for viseme changes (for animation)
     */
    onViseme(callback: (viseme: string) => void) {
        this.onVisemeChange = callback;
    }

    /**
     * Speak text with optional lip sync
     */
    async speak(text: string): Promise<void> {
        console.log(`[VSyncTTS] ${this.agentId} speaking: "${text}"`);

        if (this.ttsProvider === 'elevenlabs' && this.elevenLabs) {
            await this.speakElevenLabs(text);
        } else {
            await this.speakWebSpeech(text);
        }
    }

    /**
     * Speak using ElevenLabs
     */
    private async speakElevenLabs(text: string): Promise<void> {
        const voiceId = AGENT_VOICES[this.agentId];
        if (!voiceId) {
            console.warn(`[VSyncTTS] No voice assigned for ${this.agentId}, using web speech`);
            return this.speakWebSpeech(text);
        }

        try {
            // Generate audio
            const audioData = await this.elevenLabs!.speak(text, voiceId);
            const duration = await this.elevenLabs!.getAudioDuration(audioData);

            // Start animation if enabled (Hanna only)
            if (this.enableAnimation) {
                const phonemes = textToPhonemes(text);
                this.animatePhonemes(phonemes, duration);
            }

            // Play audio
            await this.elevenLabs!.playAudio(audioData);

            // Reset to neutral
            if (this.enableAnimation) {
                this.currentViseme = 'neutral';
                this.onVisemeChange?.('neutral');
            }

        } catch (error) {
            console.error('[VSyncTTS] ElevenLabs error:', error);
            // Fallback to web speech
            await this.speakWebSpeech(text);
        }
    }

    /**
     * Speak using Web Speech API (fallback)
     */
    private async speakWebSpeech(text: string): Promise<void> {
        const duration = this.webSpeech.estimateDuration(text);

        // Start animation if enabled
        if (this.enableAnimation) {
            const phonemes = textToPhonemes(text);
            this.animatePhonemes(phonemes, duration);
        }

        // Play audio
        await this.webSpeech.speak(text);

        // Reset to neutral
        if (this.enableAnimation) {
            this.currentViseme = 'neutral';
            this.onVisemeChange?.('neutral');
        }
    }

    /**
     * Animate phonemes (only if animation enabled)
     */
    private animatePhonemes(phonemes: Phoneme[], totalDuration: number) {
        const startTime = Date.now();
        const timePerPhoneme = totalDuration / phonemes.length;

        let currentIndex = 0;

        const PHONEME_MAP: Record<string, string> = {
            'AA': 'AA', 'AE': 'AE', 'AH': 'AH', 'AO': 'AO', 'AW': 'AW',
            'AY': 'AY', 'EH': 'EH', 'ER': 'ER', 'EY': 'EY', 'IH': 'IH',
            'IY': 'IY', 'OW': 'OW', 'OY': 'OY', 'UH': 'UH', 'UW': 'UW',
            'B': 'BP', 'P': 'BP', 'M': 'BP',
            'F': 'FV', 'V': 'FV',
            'TH': 'TH', 'DH': 'TH',
            'T': 'TD', 'D': 'TD', 'N': 'TD',
            'S': 'SZ', 'Z': 'SZ',
            'SH': 'SH', 'ZH': 'SH',
            'CH': 'CH', 'JH': 'CH',
            'K': 'KG', 'G': 'KG',
            'L': 'L', 'R': 'R', 'W': 'W', 'Y': 'Y', 'H': 'H', 'NG': 'NG'
        };

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
        }, 1000 / 60); // 60fps
    }

    /**
     * Get current viseme
     */
    getCurrentViseme(): string {
        return this.currentViseme;
    }
}

export default VSyncTTS;
