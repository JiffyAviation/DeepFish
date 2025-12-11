/**
 * Voice Call Integration for DeepFish V3
 * Answering machine + TTS callback using Twilio Voice
 */

import twilio from 'twilio';
import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse';

interface VoiceConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

export class VoiceIntegration {
    private client: twilio.Twilio;

    constructor(private config: VoiceConfig) {
        this.client = twilio(config.accountSid, config.authToken);
    }

    /**
     * Handle incoming call (answering machine)
     * Twilio webhook: POST /api/voice/incoming
     */
    handleIncomingCall(): string {
        const twiml = new VoiceResponse();

        // Greeting
        twiml.say({
            voice: 'Polly.Joanna' // Female voice
        }, 'Hello! You\'ve reached DeepFish AI Studio. This is Mei, your project manager.');

        // Record voicemail
        twiml.say('Please leave a message after the tone, and I\'ll call you back shortly.');

        twiml.record({
            action: '/api/voice/recording',
            transcribe: true,
            transcribeCallback: '/api/voice/transcription',
            maxLength: 120, // 2 minutes max
            playBeep: true
        });

        // Hangup
        twiml.say('Thank you! I\'ll get back to you soon.');
        twiml.hangUp();

        return twiml.toString();
    }

    /**
     * Process voicemail transcription
     * Twilio webhook: POST /api/voice/transcription
     */
    async processVoicemail(transcription: string, from: string, recordingUrl: string) {
        console.log(`[Voice] Voicemail from ${from}: ${transcription}`);

        // Route to Mei
        const botId = 'mei';
        const response = await this.callBot(botId, `
Voicemail from: ${from}
Message: ${transcription}
(Prepare callback response)
`);

        // Schedule callback
        await this.scheduleCallback(from, response);
    }

    /**
     * Make outbound call with TTS response
     */
    async makeCallback(to: string, message: string, botVoiceId?: string): Promise<boolean> {
        try {
            // Use bot's voice from .fsh file (e.g., Mei's ElevenLabs voice)
            // For Twilio, we'll use their TTS voices
            const voice = botVoiceId === 'mei' ? 'Polly.Joanna' : 'Polly.Matthew';

            const call = await this.client.calls.create({
                twiml: `
          <Response>
            <Say voice="${voice}">
              ${this.escapeXml(message)}
            </Say>
            <Pause length="2"/>
            <Say voice="${voice}">
              If you need anything else, just call back or text me. Goodbye!
            </Say>
          </Response>
        `,
                to,
                from: this.config.phoneNumber
            });

            console.log(`[Voice] Callback initiated to ${to}: ${call.sid}`);
            return true;
        } catch (error) {
            console.error('[Voice] Callback failed:', error);
            return false;
        }
    }

    /**
     * Interactive voice conversation (IVR)
     * For real-time back-and-forth
     */
    handleInteractiveCall(userSpeech: string): string {
        const twiml = new VoiceResponse();

        // Gather user speech
        const gather = twiml.gather({
            input: ['speech'],
            action: '/api/voice/interactive',
            speechTimeout: 3,
            language: 'en-US'
        });

        // Bot response (would come from LLM)
        gather.say({
            voice: 'Polly.Joanna'
        }, 'I understand. Let me help you with that.');

        // Continue conversation
        twiml.say('Is there anything else?');

        // Loop back for more input
        twiml.redirect('/api/voice/interactive');

        return twiml.toString();
    }

    /**
     * Schedule callback (could be immediate or delayed)
     */
    private async scheduleCallback(to: string, message: string) {
        // Immediate callback
        setTimeout(async () => {
            await this.makeCallback(to, message, 'mei');
        }, 5000); // 5 second delay
    }

    /**
     * Call bot to process message
     * TODO: Integrate with actual bot system
     */
    private async callBot(botId: string, message: string): Promise<string> {
        // Placeholder - integrate with EnhancedBotLoader
        return `Hi, this is Mei from DeepFish. I got your voicemail and I'm working on it right now. I'll send you an update via email within the hour. Thanks for calling!`;
    }

    /**
     * Escape XML for TwiML
     */
    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

/**
 * Express webhook handlers
 */
export function createVoiceWebhooks(voiceIntegration: VoiceIntegration) {
    return {
        // Incoming call
        incoming: (req: any, res: any) => {
            const twiml = voiceIntegration.handleIncomingCall();
            res.type('text/xml');
            res.send(twiml);
        },

        // Voicemail transcription received
        transcription: async (req: any, res: any) => {
            const { From, TranscriptionText, RecordingUrl } = req.body;
            await voiceIntegration.processVoicemail(TranscriptionText, From, RecordingUrl);
            res.sendStatus(200);
        },

        // Interactive conversation
        interactive: async (req: any, res: any) => {
            const { SpeechResult } = req.body;
            const twiml = voiceIntegration.handleInteractiveCall(SpeechResult || '');
            res.type('text/xml');
            res.send(twiml);
        }
    };
}

export const voiceConfig: VoiceConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
};
