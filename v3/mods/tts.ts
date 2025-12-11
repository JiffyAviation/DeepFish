/**
 * ElevenLabs TTS Integration
 * Text-to-speech for all agents
 */

export interface TTSConfig {
    apiKey: string;
    voiceId: string;
    modelId?: string;
}

export interface TTSVoice {
    id: string;
    name: string;
    description: string;
}

/**
 * ElevenLabs Voice IDs (temporary assignments)
 */
export const AGENT_VOICES: Record<string, string> = {
    hanna: '21m00Tcm4TlvDq8ikWAM',    // Rachel - friendly, professional
    oracle: 'pNInz6obpgDQGcFmaJgB',   // Adam - deep, authoritative
    mei: 'MF3mGyEYCl7XYWbV9V6O',      // Elli - clear, professional
    vesper: 'XB0fDUnXU5powFXDhCwa',   // Charlotte - elegant, refined
    hr: 'jsCqWAovK2LkecY7zXl4',       // Freya - warm, caring
    abacus: '2EiwWnXFnvU5JabPnv8n',   // Clyde - calm, measured
    root: 'TxGEqnHWrfWFTfGW9XjX'      // Josh - clear, technical
};

/**
 * ElevenLabs TTS Engine
 */
export class ElevenLabsTTS {
    private apiKey: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Generate speech from text
     */
    async speak(text: string, voiceId: string): Promise<ArrayBuffer> {
        const url = `${this.baseUrl}/text-to-speech/${voiceId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.apiKey
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }

        return await response.arrayBuffer();
    }

    /**
     * Play audio from ArrayBuffer
     */
    async playAudio(audioData: ArrayBuffer): Promise<void> {
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        return new Promise((resolve) => {
            source.onended = () => resolve();
            source.start(0);
        });
    }

    /**
     * Get audio duration
     */
    async getAudioDuration(audioData: ArrayBuffer): Promise<number> {
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));
        return audioBuffer.duration;
    }
}

/**
 * Fallback: Web Speech API (free, but robotic)
 */
export class WebSpeechTTS {
    async speak(text: string, voiceName?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            if (voiceName) {
                const voices = speechSynthesis.getVoices();
                const voice = voices.find(v => v.name.includes(voiceName));
                if (voice) utterance.voice = voice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);

            speechSynthesis.speak(utterance);
        });
    }

    estimateDuration(text: string): number {
        // Average: ~150 words per minute = 2.5 words per second
        const words = text.split(' ').length;
        return words / 2.5;
    }
}

export default ElevenLabsTTS;
