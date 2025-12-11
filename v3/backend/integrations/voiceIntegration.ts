/**
 * Voice Call Integration for DeepFish V3
 * Vesper answers as operator, routes to specialists
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
     * Handle incoming call - Vesper answers as operator
     */
    handleIncomingCall(): string {
        const twiml = new twilio.twiml.VoiceResponse();

        // Vesper's operator greeting
        twiml.say({
            voice: 'Polly.Joanna'  // Vesper's professional voice
        }, 'DeepFish. I\'m Vesper, may I ask whom you are calling for?');

        // Gather response (who they want to talk to)
        const gather = twiml.gather({
            input: ['speech'],
            timeout: 5,
            action: '/api/voice/route',
            method: 'POST',
            speechTimeout: 'auto'
        });

        // If no response, offer voicemail
        twiml.say({
            voice: 'Polly.Joanna'
        }, 'I didn\'t catch that. Please leave a message after the beep.');

        twiml.record({
            transcribe: true,
            transcribeCallback: '/api/voice/transcription',
            maxLength: 60,
            playBeep: true
        });

        return twiml.toString();
    }

    /**
     * Route call based on bot name mentioned
     */
    routeToBot(speechResult: string): string {
        const twiml = new twilio.twiml.VoiceResponse();
        const lower = speechResult.toLowerCase();

        // Detect bot name
        let targetBot = 'mei'; // default
        if (lower.includes('hanna')) targetBot = 'hanna';
        else if (lower.includes('skillz') || lower.includes('skills')) targetBot = 'skillz';
        else if (lower.includes('igor')) targetBot = 'igor';
        else if (lower.includes('oracle')) targetBot = 'oracle';
        else if (lower.includes('julie')) targetBot = 'julie';
        else if (lower.includes('mei')) targetBot = 'mei';
        else if (lower.includes('vesper')) targetBot = 'vesper';

        // Vesper's transfer message
        twiml.say({
            voice: 'Polly.Joanna'
        }, `Okay great, have a great day!`);

        twiml.pause({ length: 1 });

        // Ask caller to leave message for the bot
        twiml.say({
            voice: 'Polly.Joanna'
        }, `Please leave your message for ${targetBot} after the beep.`);

        // Record message
        twiml.record({
            transcribe: true,
            transcribeCallback: `/api/voice/transcription?bot=${targetBot}`,
            maxLength: 60,
            playBeep: true
        });

        return twiml.toString();
    }

    /**
     * Process voicemail transcription
     */
    async processVoicemail(transcription: string, from: string, recordingUrl: string, botId: string = 'mei') {
        console.log(`[Voice] Voicemail for ${botId} from ${from}: ${transcription}`);

        // Get bot's response
        const response = await this.callBot(botId, `
Voicemail from: ${from}
Message: ${transcription}
(Prepare callback response)
`);

        // Schedule callback from that specific bot
        await this.scheduleCallback(from, response, botId);
    }

    /**
     * Make outbound call with TTS response from specific bot
     */
    async makeCallback(to: string, message: string, botId: string = 'mei'): Promise<boolean> {
        try {
            // Bot voice mapping
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

    /**
     * Schedule callback
     */
    private async scheduleCallback(to: string, message: string, botId: string) {
        setTimeout(async () => {
            await this.makeCallback(to, message, botId);
        }, 5000); // 5 second delay
    }

    /**
     * Call bot to process message
     */
    private async callBot(botId: string, message: string): Promise<string> {
        // TODO: Integrate with EnhancedBotLoader
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
        // Incoming call - Vesper answers
        incoming: (req: any, res: any) => {
            const twiml = voiceIntegration.handleIncomingCall();
            res.type('text/xml');
            res.send(twiml);
        },

        // Route to bot based on speech
        route: (req: any, res: any) => {
            const { SpeechResult } = req.body;
            const twiml = voiceIntegration.routeToBot(SpeechResult || '');
            res.type('text/xml');
            res.send(twiml);
        },

        // Voicemail transcription received
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
