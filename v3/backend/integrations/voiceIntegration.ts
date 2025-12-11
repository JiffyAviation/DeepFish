/**
 * Voice Call Integration for DeepFish V3
 * Vesper answers as operator, has light conversation, then routes
 */

import twilio from 'twilio';

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
     * Handle incoming call - Vesper answers conversationally
     */
    handleIncomingCall(): string {
        const twiml = new twilio.twiml.VoiceResponse();

        // Vesper's friendly greeting
        twiml.say({
            voice: 'Polly.Joanna'  // Vesper's warm, professional voice
        }, 'DeepFish. I\'m Vesper, how may I help you today?');

        // Gather natural conversation
        const gather = twiml.gather({
            input: ['speech'],
            timeout: 5,
            action: '/api/voice/conversation',
            method: 'POST',
            speechTimeout: 'auto',
            language: 'en-US'
        });

        return twiml.toString();
    }

    /**
     * Handle conversational flow - Vesper chats until bot name mentioned
     */
    handleConversation(speechResult: string, conversationTurn: number = 0): string {
        const twiml = new twilio.twiml.VoiceResponse();
        const lower = speechResult.toLowerCase();

        // Check if they mentioned a bot name
        const botMentioned = this.detectBotMention(lower);

        if (botMentioned) {
            // Route to that bot
            twiml.say({
                voice: 'Polly.Joanna'
            }, `Okay great, have a great day!`);

            twiml.pause({ length: 1 });

            twiml.say({
                voice: 'Polly.Joanna'
            }, `Please leave your message for ${botMentioned} after the beep.`);

            twiml.record({
                transcribe: true,
                transcribeCallback: `/api/voice/transcription?bot=${botMentioned}`,
                maxLength: 60,
                playBeep: true
            });
        } else {
            // Continue conversation - Vesper responds naturally
            const vesperResponse = this.getVesperResponse(lower, conversationTurn);

            twiml.say({
                voice: 'Polly.Joanna'
            }, vesperResponse);

            // Gather next response
            const gather = twiml.gather({
                input: ['speech'],
                timeout: 5,
                action: `/api/voice/conversation?turn=${conversationTurn + 1}`,
                method: 'POST',
                speechTimeout: 'auto',
                language: 'en-US'
            });

            // After 3 turns, gently ask who they need
            if (conversationTurn >= 2) {
                twiml.say({
                    voice: 'Polly.Joanna'
                }, 'By the way, is there someone specific on our team you\'d like to speak with?');
            }
        }

        return twiml.toString();
    }

    /**
     * Detect if caller mentioned a bot name
     */
    private detectBotMention(text: string): string | null {
        if (text.includes('hanna')) return 'hanna';
        if (text.includes('skillz') || text.includes('skills')) return 'skillz';
        if (text.includes('igor')) return 'igor';
        if (text.includes('oracle')) return 'oracle';
        if (text.includes('julie')) return 'julie';
        if (text.includes('mei')) return 'mei';
        if (text.includes('vesper')) return 'vesper';

        return null;
    }

    /**
     * Get Vesper's natural conversational responses
     */
    private getVesperResponse(userSaid: string, turn: number): string {
        // Vesper responds naturally based on what was said
        if (userSaid.includes('design') || userSaid.includes('ui') || userSaid.includes('look')) {
            return 'Oh wonderful! Our creative director Hanna would be perfect for that. Would you like to speak with her?';
        }

        if (userSaid.includes('code') || userSaid.includes('develop') || userSaid.includes('bug')) {
            return 'Ah, sounds like a technical matter. Skillz is our lead developer. Should I connect you?';
        }

        if (userSaid.includes('deploy') || userSaid.includes('server') || userSaid.includes('hosting')) {
            return 'Got it! Igor handles all our DevOps. Let me transfer you to him.';
        }

        if (userSaid.includes('research') || userSaid.includes('learn') || userSaid.includes('study')) {
            return 'Interesting! Oracle specializes in research and training. Shall I route you there?';
        }

        if (userSaid.includes('cost') || userSaid.includes('budget') || userSaid.includes('price')) {
            return 'Ah yes, Julie from accounting can help with that. Would you like to leave a message for her?';
        }

        if (userSaid.includes('project') || userSaid.includes('manage') || userSaid.includes('status')) {
            return 'Perfect! Mei is our project manager. She coordinates everything. Want me to connect you?';
        }

        // Generic friendly responses
        const genericResponses = [
            'I see! Tell me a bit more about what you need.',
            'Absolutely! Which member of our team can help you with that?',
            'That sounds great! Who would be the best person for this?',
            'Got it! We have designers, developers, and project managers. Who do you think would be best?'
        ];

        return genericResponses[turn % genericResponses.length];
    }

    /**
     * Process voicemail transcription
     */
    async processVoicemail(transcription: string, from: string, recordingUrl: string, botId: string = 'mei') {
        console.log(`[Voice] Voicemail for ${botId} from ${from}: ${transcription}`);

        const response = await this.callBot(botId, `
Voicemail from: ${from}
Message: ${transcription}
`);

        await this.scheduleCallback(from, response, botId);
    }

    /**
     * Make outbound call with TTS response from specific bot
     */
    async makeCallback(to: string, message: string, botId: string = 'mei'): Promise<boolean> {
        try {
            const voices: Record<string, string> = {
                'mei': 'Polly.Joanna',
                'hanna': 'Polly.Joanna',
                'skillz': 'Polly.Matthew',
                'igor': 'Polly.Matthew',
                'oracle': 'Polly.Brian',
                'julie': 'Polly.Joanna',
                'vesper': 'Polly.Joanna'
            };

            const voice = voices[botId] || 'Polly.Joanna';

            const call = await this.client.calls.create({
                twiml: `
          <Response>
            <Say voice="${voice}">
              ${this.escapeXml(message)}
            </Say>
            <Pause length="1"/>
            <Say voice="${voice}">
              If you need anything else, just call back. Goodbye!
            </Say>
          </Response>
        `,
                to,
                from: this.config.phoneNumber
            });

            console.log(`[Voice] ${botId} callback to ${to}: ${call.sid}`);
            return true;
        } catch (error) {
            console.error('[Voice] Callback failed:', error);
            return false;
        }
    }

    private async scheduleCallback(to: string, message: string, botId: string) {
        setTimeout(async () => {
            await this.makeCallback(to, message, botId);
        }, 5000);
    }

    private async callBot(botId: string, message: string): Promise<string> {
        const responses: Record<string, string> = {
            'mei': 'Hi, this is Mei from DeepFish. I got your message and I\'m on it!',
            'hanna': 'Hey! This is Hanna. I saw your design request and I\'m excited to work on it!',
            'skillz': 'Skillz here. Got your message about the code - I\'ll have something for you soon!',
            'igor': 'Igor from DevOps. I\'ll get that deployment sorted out right away.',
            'oracle': 'Oracle speaking. Interesting research question - I\'ll dive into it!',
            'julie': 'Hi, Julie from accounting. I\'ll pull those numbers for you.',
            'vesper': 'Vesper here. Thanks for calling DeepFish - I\'ll coordinate with the team!'
        };

        return responses[botId] || responses['mei'];
    }

    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

export function createVoiceWebhooks(voiceIntegration: VoiceIntegration) {
    return {
        incoming: (req: any, res: any) => {
            const twiml = voiceIntegration.handleIncomingCall();
            res.type('text/xml');
            res.send(twiml);
        },

        conversation: (req: any, res: any) => {
            const { SpeechResult } = req.body;
            const turn = parseInt(req.query.turn || '0');
            const twiml = voiceIntegration.handleConversation(SpeechResult || '', turn);
            res.type('text/xml');
            res.send(twiml);
        },

        transcription: async (req: any, res: any) => {
            const { From, TranscriptionText, RecordingUrl } = req.body;
            const botId = req.query.bot || 'mei';
            await voiceIntegration.processVoicemail(TranscriptionText, From, RecordingUrl, botId);
            res.sendStatus(200);
        }
    };
}

export const voiceConfig: VoiceConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
};
