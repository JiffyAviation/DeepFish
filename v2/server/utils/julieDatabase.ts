/**
 * Julie's Database Access
 * CFO has read-only access to financial data
 */

import { logger } from './logger.js';

export interface FinancialMetrics {
    users: {
        total: number;
        active: number;
        churned: number;
    };
    subscriptions: {
        free: number;
        pro: number;
        team: number;
        smsAddons: number;
    };
    revenue: {
        mrr: number;
        arr: number;
        churnRate: number;
    };
    usage: {
        totalMessages: number;
        smsMessagesSent: number;
        apiCalls: number;
    };
}

export class JulieDatabase {
    /**
     * Query financial metrics from database
     * Uses Railway PostgreSQL API
     */
    async getFinancialMetrics(): Promise<FinancialMetrics> {
        try {
            // TODO: Connect to Railway PostgreSQL
            // const { Pool } = require('pg');
            // const pool = new Pool({
            //   connectionString: process.env.DATABASE_URL
            // });

            // For now, return structure with mock data
            return {
                users: {
                    total: 0,
                    active: 0,
                    churned: 0
                },
                subscriptions: {
                    free: 0,
                    pro: 0,
                    team: 0,
                    smsAddons: 0
                },
                revenue: {
                    mrr: 0,      // Monthly Recurring Revenue
                    arr: 0,      // Annual Recurring Revenue
                    churnRate: 0 // Percentage
                },
                usage: {
                    totalMessages: 0,
                    smsMessagesSent: 0,
                    apiCalls: 0
                }
            };
        } catch (error) {
            logger.error('[JulieDatabase] Error querying metrics:', error);

            return {
                users: { total: 0, active: 0, churned: 0 },
                subscriptions: { free: 0, pro: 0, team: 0, smsAddons: 0 },
                revenue: { mrr: 0, arr: 0, churnRate: 0 },
                usage: { totalMessages: 0, smsMessagesSent: 0, apiCalls: 0 }
            };
        }
    }

    /**
     * Get user growth metrics
     */
    async getUserGrowth(): Promise<{ date: string; count: number }[]> {
        try {
            // TODO: Query user signups by date
            // SELECT DATE(created_at) as date, COUNT(*) as count
            // FROM users
            // GROUP BY DATE(created_at)
            // ORDER BY date DESC
            // LIMIT 30

            return [];
        } catch (error) {
            logger.error('[JulieDatabase] Error getting user growth:', error);
            return [];
        }
    }

    /**
     * Get revenue breakdown
     */
    async getRevenueBreakdown(): Promise<{
        subscriptions: number;
        smsAddons: number;
        oneTime: number;
    }> {
        try {
            // TODO: Query Stripe data from database
            // SELECT 
            //   SUM(CASE WHEN type = 'subscription' THEN amount END) as subscriptions,
            //   SUM(CASE WHEN type = 'sms_addon' THEN amount END) as sms_addons,
            //   SUM(CASE WHEN type = 'one_time' THEN amount END) as one_time
            // FROM invoices
            // WHERE status = 'paid'
            // AND created_at >= DATE_TRUNC('month', CURRENT_DATE)

            return {
                subscriptions: 0,
                smsAddons: 0,
                oneTime: 0
            };
        } catch (error) {
            logger.error('[JulieDatabase] Error getting revenue breakdown:', error);
            return { subscriptions: 0, smsAddons: 0, oneTime: 0 };
        }
    }

    /**
     * Get top customers by revenue
     */
    async getTopCustomers(limit: number = 10): Promise<Array<{
        userId: string;
        email: string;
        totalRevenue: number;
        plan: string;
    }>> {
        try {
            // TODO: Query top customers
            // SELECT u.id, u.email, SUM(i.amount) as total_revenue, s.plan
            // FROM users u
            // JOIN subscriptions s ON u.id = s.user_id
            // JOIN invoices i ON u.id = i.user_id
            // WHERE i.status = 'paid'
            // GROUP BY u.id, u.email, s.plan
            // ORDER BY total_revenue DESC
            // LIMIT $1

            return [];
        } catch (error) {
            logger.error('[JulieDatabase] Error getting top customers:', error);
            return [];
        }
    }

    /**
     * Calculate SMS profit margin
     */
    async getSMSProfitMargin(): Promise<{
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
    }> {
        try {
            // TODO: Calculate SMS economics
            // Revenue: Count of SMS add-ons × $5
            // Cost: SMS sent × $0.0075 + phone numbers × $1

            const smsAddons = 0; // From subscriptions table
            const smsSent = 0;   // From usage table
            const phoneNumbers = 0; // From twilio_numbers table

            const revenue = smsAddons * 5;
            const cost = (smsSent * 0.0075) + (phoneNumbers * 1);
            const profit = revenue - cost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return { revenue, cost, profit, margin };
        } catch (error) {
            logger.error('[JulieDatabase] Error calculating SMS margin:', error);
            return { revenue: 0, cost: 0, profit: 0, margin: 0 };
        }
    }
}

export const julieDatabase = new JulieDatabase();
