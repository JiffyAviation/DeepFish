/**
 * Agent Marketplace React Component
 * Gacha-style UI with FOMO mechanics
 */

import React, { useState } from 'react';
import { marketplace, AgentRarity, type MarketplaceAgent } from '../../backend/marketplace/marketplaceService';

export const AgentMarketplace: React.FC = () => {
    const [featured, setFeatured] = useState<MarketplaceAgent[]>([]);
    const [gachaResults, setGachaResults] = useState<MarketplaceAgent[]>([]);

    const rarityColors = {
        [AgentRarity.COMMON]: 'text-gray-400',
        [AgentRarity.RARE]: 'text-blue-400',
        [AgentRarity.EPIC]: 'text-purple-400',
        [AgentRarity.LEGENDARY]: 'text-yellow-400',
        [AgentRarity.MYTHIC]: 'text-red-400'
    };

    const handleGachaPull = async (type: 'single' | 'ten-pull') => {
        const results = marketplace.gachaPull(type);
        setGachaResults(results);

        // Animate pull
        // TODO: Add gacha animation
    };

    const handlePurchase = async (agentId: string, license: 'personal' | 'commercial' | 'enterprise') => {
        try {
            const result = await marketplace.purchaseAgent(agentId, license, 'user-123');
            alert(`Agent purchased! Download: ${result.fshPath}`);
        } catch (error: any) {
            alert(`Purchase failed: ${error.message}`);
        }
    };

    return (
        <div className="marketplace-container">
            {/* Featured Section (FOMO) */}
            <section className="featured-section">
                <h2 className="text-2xl font-bold mb-4">
                    🔥 Limited Time - Featured Agents
                </h2>
                <div className="featured-timer text-red-400 mb-4">
                    ⏰ Expires in: 3d 12h 45m
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {featured.map(agent => (
                        <div key={agent.id} className="agent-card border p-4 rounded">
                            <div className={`rarity-badge ${rarityColors[agent.rarity]}`}>
                                {agent.rarity.toUpperCase()}
                            </div>
                            <h3>{agent.name}</h3>
                            <p>${agent.price.personal}</p>
                            {agent.isLimitedEdition && (
                                <span className="limited-badge bg-red-500 text-white px-2 py-1 text-xs">
                                    LIMITED
                                </span>
                            )}
                            <button onClick={() => handlePurchase(agent.id, 'personal')}>
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Gacha Section */}
            <section className="gacha-section mt-8">
                <h2 className="text-2xl font-bold mb-4">
                    🎰 Agent Gacha
                </h2>
                <div className="gacha-rates text-sm text-gray-400 mb-4">
                    <div>Mythic: 0.5% | Legendary: 4.5% | Epic: 15%</div>
                    <div>Rare: 30% | Common: 50%</div>
                </div>
                <div className="gacha-buttons flex gap-4">
                    <button
                        onClick={() => handleGachaPull('single')}
                        className="bg-blue-500 px-4 py-2 rounded"
                    >
                        Single Pull - $5
                    </button>
                    <button
                        onClick={() => handleGachaPull('ten-pull')}
                        className="bg-purple-500 px-4 py-2 rounded"
                    >
                        10x Pull - $40 (Guaranteed Epic+)
                    </button>
                </div>

                {/* Gacha Results */}
                {gachaResults.length > 0 && (
                    <div className="gacha-results mt-4 grid grid-cols-5 gap-2">
                        {gachaResults.map((agent, i) => (
                            <div
                                key={i}
                                className={`result-card border p-2 rounded ${rarityColors[agent.rarity]}`}
                            >
                                <div className="text-xl">⭐</div>
                                <div className="text-xs">{agent.name}</div>
                                <div className="text-xs">{agent.rarity}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Trending Section */}
            <section className="trending-section mt-8">
                <h2 className="text-2xl font-bold mb-4">
                    📈 Trending Agents
                </h2>
                {/* Agent list */}
            </section>
        </div>
    );
};
