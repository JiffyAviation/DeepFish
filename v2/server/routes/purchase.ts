/**
 * Stripe Purchase Integration
 * Handles purchases and automatically updates entitlements
 */

import express from 'express';
import Stripe from 'stripe';
import { entitlementManager } from './utils/entitlementManager.js';
import { logger } from './utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
});

const router = express.Router();

/**
 * Create Stripe checkout session
 * Called when user clicks "Buy Now"
 */
router.post('/create-checkout', async (req, res) => {
    try {
        const { userId, productId, productType } = req.body;

        // Get product details
        const product = getProductDetails(productId, productType);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            description: product.description
                        },
                        unit_amount: product.price, // in cents
                        recurring: product.recurring ? {
                            interval: 'month'
                        } : undefined
                    },
                    quantity: 1
                }
            ],
            mode: product.recurring ? 'subscription' : 'payment',
            success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/cancel`,

            // Store metadata for webhook
            client_reference_id: userId,
            metadata: {
                userId,
                productId,
                productType
            }
        });

        logger.info(`[Purchase] Created checkout for ${userId}: ${productId}`);

        res.json({ checkoutUrl: session.url });

    } catch (error) {
        logger.error('[Purchase] Error creating checkout:', error);
        res.status(500).json({ error: 'Failed to create checkout' });
    }
});

/**
 * Stripe webhook handler
 * Called by Stripe when events occur (payment success, cancellation, etc.)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
        // Verify webhook is from Stripe
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        logger.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            default:
                logger.info(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        logger.error('[Webhook] Error processing event:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id!;
    const { productId, productType } = session.metadata!;

    logger.info(`[Purchase] User ${userId} purchased ${productId}`);

    // Check if already processed (idempotency)
    const alreadyProcessed = await checkIfProcessed(session.id);
    if (alreadyProcessed) {
        logger.info(`[Purchase] Already processed: ${session.id}`);
        return;
    }

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
        logger.warn(`[Purchase] Payment not completed: ${session.id}`);
        return;
    }

    // Grant access based on product type
    switch (productType) {
        case 'bot':
            const botId = productId.replace('bot-', '');
            await entitlementManager.grantAccess(userId, 'bots', botId);
            logger.info(`[Purchase] ✓ Granted bot access: ${botId} to ${userId}`);
            break;

        case 'room':
            const roomId = productId.replace('room-', '');
            await entitlementManager.grantAccess(userId, 'rooms', roomId);
            logger.info(`[Purchase] ✓ Granted room access: ${roomId} to ${userId}`);
            break;

        case 'tier':
            await entitlementManager.upgradeTier(userId, productId as any);
            logger.info(`[Purchase] ✓ Upgraded tier: ${productId} for ${userId}`);
            break;
    }

    // Mark as processed
    await markAsProcessed(session.id);

    // TODO: Send confirmation email
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const { userId, productId, productType } = subscription.metadata;

    logger.info(`[Cancellation] User ${userId} canceled ${productId}`);

    // Revoke access based on product type
    switch (productType) {
        case 'bot':
            const botId = productId.replace('bot-', '');
            await entitlementManager.revokeAccess(userId, 'bots', botId);
            logger.info(`[Cancellation] ✓ Revoked bot access: ${botId} from ${userId}`);
            break;

        case 'room':
            const roomId = productId.replace('room-', '');
            await entitlementManager.revokeAccess(userId, 'rooms', roomId);
            logger.info(`[Cancellation] ✓ Revoked room access: ${roomId} from ${userId}`);
            break;
    }
}

/**
 * Handle subscription update (upgrade/downgrade)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // TODO: Handle tier changes
    logger.info(`[Subscription] Updated: ${subscription.id}`);
}

/**
 * Get product details
 */
function getProductDetails(productId: string, productType: string): any {
    const products: Record<string, any> = {
        'bot-hanna': {
            name: 'Hanna - Design Lead',
            description: 'AI design assistant',
            price: 300, // $3.00
            recurring: true
        },
        'bot-oracle': {
            name: 'Oracle - System Architect',
            description: 'AI architecture expert',
            price: 500, // $5.00
            recurring: true
        },
        'room-exec': {
            name: 'Executive Office',
            description: 'Private executive room',
            price: 200, // $2.00
            recurring: true
        },
        'tier-pro': {
            name: 'Pro Tier',
            description: 'Full access to pro features',
            price: 900, // $9.00
            recurring: true
        },
        'tier-enterprise': {
            name: 'Enterprise Tier',
            description: 'Full access to all features',
            price: 4900, // $49.00
            recurring: true
        }
    };

    return products[productId];
}

/**
 * Check if webhook already processed (idempotency)
 */
async function checkIfProcessed(sessionId: string): Promise<boolean> {
    // TODO: Check database/file for processed session IDs
    // For now, return false
    return false;
}

/**
 * Mark webhook as processed
 */
async function markAsProcessed(sessionId: string): Promise<void> {
    // TODO: Store session ID in database/file
    logger.info(`[Purchase] Marked as processed: ${sessionId}`);
}

export default router;
