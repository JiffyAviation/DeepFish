-- DeepFish PostgreSQL Schema
-- Julie's Financial Database

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' -- active, churned, suspended
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan VARCHAR(50) NOT NULL, -- free, pro, team
    status VARCHAR(50) DEFAULT 'active', -- active, canceled, past_due
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP
);

-- SMS Add-ons table
CREATE TABLE sms_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table (from Stripe)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    status VARCHAR(50), -- paid, pending, failed
    type VARCHAR(50), -- subscription, sms_addon, one_time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

-- SMS Usage table
CREATE TABLE sms_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(20),
    direction VARCHAR(10), -- inbound, outbound
    message_sid VARCHAR(255),
    cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Usage table
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    bot_id VARCHAR(50),
    provider VARCHAR(50), -- gemini, anthropic, elevenlabs
    tokens_used INTEGER,
    cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entitlements table
CREATE TABLE entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    feature VARCHAR(100), -- sms, custom_bots, api_access, etc.
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_sms_usage_user_id ON sms_usage(user_id);
CREATE INDEX idx_sms_usage_created_at ON sms_usage(created_at);
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);

-- Julie's read-only views
CREATE VIEW v_monthly_revenue AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(amount) as revenue,
    COUNT(*) as invoice_count
FROM invoices
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

CREATE VIEW v_active_subscriptions AS
SELECT 
    plan,
    COUNT(*) as count,
    SUM(CASE 
        WHEN plan = 'pro' THEN 10
        WHEN plan = 'team' THEN 50
        ELSE 0
    END) as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY plan;

CREATE VIEW v_sms_economics AS
SELECT 
    COUNT(DISTINCT sa.user_id) as sms_users,
    COUNT(DISTINCT sa.phone_number) as phone_numbers,
    COUNT(su.id) as messages_sent,
    SUM(su.cost) as twilio_cost,
    (COUNT(DISTINCT sa.user_id) * 5) as sms_revenue,
    ((COUNT(DISTINCT sa.user_id) * 5) - SUM(su.cost)) as sms_profit
FROM sms_addons sa
LEFT JOIN sms_usage su ON sa.user_id = su.user_id
WHERE sa.status = 'active';
