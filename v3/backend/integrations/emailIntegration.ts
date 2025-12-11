/**
 * Email Integration for DeepFish V3
 * Enables email-based communication with bots (primarily Mei)
 * Uses IMAP for receiving, SMTP for sending
 */

import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { assetBus, AssetType } from '../assetBus/assetBusService';

interface EmailConfig {
    imap: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    fromAddress: string;
    botEmail: string; // e.g., mei@deepfish.ai
}

export class EmailIntegration {
    private imapClient?: ImapFlow;
    private smtpTransport: nodemailer.Transporter;

    constructor(private config: EmailConfig) {
        // Setup SMTP for sending
        this.smtpTransport = nodemailer.createTransport(config.smtp);
    }

    /**
     * Start listening for incoming emails
     */
    async startListening() {
        this.imapClient = new ImapFlow({
            host: this.config.imap.host,
            port: this.config.imap.port,
            secure: this.config.imap.secure,
            auth: this.config.imap.auth,
            logger: false
        });

        await this.imapClient.connect();
        console.log(`[Email] Listening for emails to ${this.config.botEmail}`);

        // Listen for new messages
        this.imapClient.on('exists', async (data) => {
            await this.checkNewEmails();
        });

        // Initial check
        await this.checkNewEmails();
    }

    /**
     * Check for new unread emails
     */
    private async checkNewEmails() {
        if (!this.imapClient) return;

        const lock = await this.imapClient.getMailboxLock('INBOX');

        try {
            // Search for unseen messages
            const messages = this.imapClient.fetch('1:*', {
                envelope: true,
                source: true,
                flags: true
            }, { uid: true });

            for await (const message of messages) {
                if (message.flags?.has('\\Seen')) continue;

                // Parse email
                const parsed = await simpleParser(message.source);

                // Process email
                await this.processIncomingEmail({
                    from: parsed.from?.text || '',
                    subject: parsed.subject || '',
                    text: parsed.text || '',
                    html: parsed.html || '',
                    messageId: message.uid
                });

                // Mark as read
                await this.imapClient.messageFlagsAdd(message.uid, ['\\Seen'], { uid: true });
            }
        } finally {
            lock.release();
        }
    }

    /**
     * Process incoming email and route to bot (usually Mei)
     */
    private async processIncomingEmail(email: {
        from: string;
        subject: string;
        text: string;
        html: string;
        messageId: number;
    }) {
        console.log(`[Email] Received from ${email.from}: ${email.subject}`);

        // Extract sender email
        const senderMatch = email.from.match(/<(.+?)>/);
        const senderEmail = senderMatch ? senderMatch[1] : email.from;

        // Route to Mei (project manager)
        const botId = 'mei';

        // Create context for bot
        const context = `
Email from: ${email.from}
Subject: ${email.subject}
Message:
${email.text}
`;

        // TODO: Call bot to generate response
        const response = await this.callBot(botId, context);

        // Send email response
        await this.sendEmail(
            senderEmail,
            `Re: ${email.subject}`,
            response
        );

        console.log(`[Email] Mei replied to ${senderEmail}`);
    }

    /**
     * Send email
     */
    async sendEmail(to: string, subject: string, body: string) {
        try {
            await this.smtpTransport.sendMail({
                from: `${this.config.fromAddress}`,
                to,
                subject,
                text: body,
                html: `<div style="font-family: sans-serif;">${body.replace(/\n/g, '<br>')}</div>`
            });

            console.log(`[Email] Sent to ${to}: ${subject}`);
            return true;
        } catch (error) {
            console.error('[Email] Send failed:', error);
            return false;
        }
    }

    /**
     * Call bot to process message
     * TODO: Integrate with actual bot system
     */
    private async callBot(botId: string, message: string): Promise<string> {
        // Placeholder - integrate with EnhancedBotLoader
        return `Hi! This is Mei. I received your message: "${message}". I'm processing it now and will get back to you shortly.`;
    }

    /**
     * Stop listening
     */
    async stop() {
        if (this.imapClient) {
            await this.imapClient.logout();
        }
    }
}

/**
 * Example configuration
 */
export const emailConfig: EmailConfig = {
    imap: {
        host: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASSWORD || ''
        }
    },
    smtp: {
        host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASSWORD || ''
        }
    },
    fromAddress: process.env.EMAIL_FROM || 'Mei <mei@deepfish.ai>',
    botEmail: process.env.EMAIL_BOT_ADDRESS || 'mei@deepfish.ai'
};
