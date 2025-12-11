/**
 * SMS Integration for DeepFish V3
 * Enables text message communication with bots
 * Uses Twilio for SMS send/receive
 */

import twilio from 'twilio';

interface SMSConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string; // Twilio phone number
}

export class SMSIntegration {
    private client: twilio.Twilio;

    constructor(private config: SMSConfig) {
        this.client = twilio(config.accountSid, config.authToken);
    }

    /**
     * Send SMS
     */
    async sendSMS(to: string, message: string): Promise<boolean> {
        try {
            // SMS has 160 char limit - truncate if needed
            const truncated = message.length > 160
                ? message.substring(0, 157) + '...'
                : message;

            await this.client.messages.create({
                body: truncated,
                from: this.config.phoneNumber,
                to
            });

            console.log(`[SMS] Sent to ${to}: ${truncated}`);
            return true;
        } catch (error) {
            console.error('[SMS] Send failed:', error);
            return false;
        }
    }

    /**
     * Process incoming SMS (webhook handler)
     * Mount this as POST /api/sms/webhook in Express
     */
    async handleIncomingSMS(from: string, body: string): Promise<string> {
        console.log(`[SMS] Received from ${from}: ${body}`);

        // Route to Mei for short-form responses
        const botId = 'mei';

        // Create context
        const context = `
SMS from: ${from}
Message: ${body}
(Respond in 160 characters or less)
`;

        // TODO: Call bot to generate response
        const response = await this.callBot(botId, context);

        // Ensure response fits in SMS (160 chars)
        const truncated = response.length > 160
            ? response.substring(0, 157) + '...'
            : response;

        return truncated;
    }

    /**
     * Call bot to process message
     * TODO: Integrate with actual bot system
     */
    private async callBot(botId: string, message: string): Promise<string> {
        // Placeholder - integrate with EnhancedBotLoader
        return `Hi! Mei here. Got your message. Processing now!`;
    }

    /**
     * Setup webhook endpoint for incoming SMS
     * Add to Express server:
     * 
     * app.post('/api/sms/webhook', async (req, res) => {
     *   const { From, Body } = req.body;
     *   const response = await smsIntegration.handleIncomingSMS(From, Body);
     *   
     *   const twiml = new twilio.twiml.MessagingResponse();
     *   twiml.message(response);
     *   
     *   res.type('text/xml');
     *   res.send(twiml.toString());
     * });
     */
}

/**
 * Example configuration
 */
export const smsConfig: SMSConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
};

/**
 * Express webhook handler example
 */
export function createSMSWebhook(smsIntegration: SMSIntegration) {
    return async (req: any, res: any) => {
        const { From, Body } = req.body;

        if (!From || !Body) {
            return res.status(400).json({ error: 'Missing From or Body' });
        }

        const TwilioSDK = await import('twilio');
        const response = await smsIntegration.handleIncomingSMS(From, Body);

        const twiml = new TwilioSDK.twiml.MessagingResponse();
        twiml.message(response);

        res.type('text/xml');
        res.send(twiml.toString());
    };
}
