/**
 * Example: How to integrate purchase buttons in React
 */

import React, { useState } from 'react';

interface Bot {
    id: string;
    name: string;
    title: string;
    price: number;
    owned: boolean;
}

export function BotStore({ userId }: { userId: string }) {
    const [loading, setLoading] = useState<string | null>(null);

    const bots: Bot[] = [
        {
            id: 'hanna',
            name: 'Hanna',
            title: 'Design Lead',
            price: 3,
            owned: false
        },
        {
            id: 'oracle',
            name: 'Oracle',
            title: 'System Architect',
            price: 5,
            owned: false
        }
    ];

    const handlePurchase = async (botId: string) => {
        setLoading(botId);

        try {
            // Call your server to create Stripe checkout
            const response = await fetch('/api/purchase/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    productId: `bot-${botId}`,
                    productType: 'bot'
                })
            });

            const { checkoutUrl } = await response.json();

            // Redirect to Stripe checkout
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Failed to start checkout. Please try again.');
            setLoading(null);
        }
    };

    return (
        <div className="bot-store">
            <h2>Unlock More Bots</h2>

            <div className="bot-grid">
                {bots.map(bot => (
                    <div key={bot.id} className="bot-card">
                        <h3>{bot.name}</h3>
                        <p>{bot.title}</p>
                        <p className="price">${bot.price}/month</p>

                        {bot.owned ? (
                            <button disabled>Owned</button>
                        ) : (
                            <button
                                onClick={() => handlePurchase(bot.id)}
                                disabled={loading === bot.id}
                            >
                                {loading === bot.id ? 'Loading...' : 'Buy Now'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Success page after purchase
 */
export function PurchaseSuccess() {
    return (
        <div className="success-page">
            <h1>🎉 Purchase Successful!</h1>
            <p>Your new bot is now available.</p>
            <a href="/chat">Start Chatting →</a>
        </div>
    );
}

/**
 * Cancel page if user cancels
 */
export function PurchaseCancel() {
    return (
        <div className="cancel-page">
            <h1>Purchase Canceled</h1>
            <p>No worries! You can purchase anytime.</p>
            <a href="/store">Back to Store →</a>
        </div>
    );
}
