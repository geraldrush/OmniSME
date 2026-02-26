-- SME E-commerce Enabler Database Initialization Script
-- This script creates all necessary tables for the multi-tenant platform

-- Extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TENANT MANAGEMENT
-- ============================================

-- SME Stores (Tenants)
CREATE TABLE IF NOT EXISTS sme_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    owner_id UUID NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    logo_url VARCHAR(512),
    banner_url VARCHAR(512),
    country VARCHAR(2) DEFAULT 'ZA',
    province VARCHAR(3),
    city VARCHAR(100),
    address VARCHAR(255),
    postal_code VARCHAR(10),
    tax_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_plan VARCHAR(50),
    subscription_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_sme_stores_owner_id ON sme_stores (owner_id);

CREATE INDEX idx_sme_stores_store_slug ON sme_stores (store_slug);

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Users (SME Owners and Customers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID REFERENCES sme_stores (id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(512),
    user_type VARCHAR(50) NOT NULL, -- 'sme_owner', 'customer', 'admin'
    role VARCHAR(50) DEFAULT 'user', -- 'owner', 'admin', 'editor', 'user'
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_tenant_id ON users (tenant_id);

CREATE INDEX idx_users_user_type ON users (user_type);

-- User Authentication Tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id),
    token_type VARCHAR(50), -- 'refresh', 'api_key', 'email_verification'
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_user_tokens_user_id ON user_tokens (user_id);

CREATE INDEX idx_user_tokens_token_hash ON user_tokens (token_hash);

-- ============================================
-- PRODUCTS
-- ============================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES product_categories (id),
    image_url VARCHAR(512),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_categories_tenant_id ON product_categories (tenant_id);

CREATE INDEX idx_product_categories_slug ON product_categories (tenant_id, slug);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    category_id UUID REFERENCES product_categories (id),
    sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    quantity_in_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    image_url VARCHAR(512),
    thumbnail_url VARCHAR(512),
    is_featured BOOLEAN DEFAULT false,
    weight_kg DECIMAL(8, 2),
    dimensions_json JSONB, -- {length, width, height, unit}
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_products_tenant_id ON products (tenant_id);

CREATE INDEX idx_products_slug ON products (tenant_id, slug);

CREATE INDEX idx_products_category_id ON products (category_id);

CREATE INDEX idx_products_is_active ON products (is_active);

-- Product Variants (e.g., size, color)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    product_id UUID NOT NULL REFERENCES products (id),
    sku_variant VARCHAR(100),
    variant_name VARCHAR(255),
    variant_attributes JSONB, -- {size: 'M', color: 'Blue'}
    price DECIMAL(12, 2),
    quantity_in_stock INTEGER,
    image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

-- ============================================
-- ORDERS & CART
-- ============================================

-- Shopping Carts
CREATE TABLE IF NOT EXISTS shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    user_id UUID REFERENCES users (id),
    session_id VARCHAR(255),
    expires_at TIMESTAMP DEFAULT(
        CURRENT_TIMESTAMP + INTERVAL '7 days'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shopping_carts_tenant_id_user_id ON shopping_carts (tenant_id, user_id);

CREATE INDEX idx_shopping_carts_session_id ON shopping_carts (session_id);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    cart_id UUID NOT NULL REFERENCES shopping_carts (id),
    product_id UUID NOT NULL REFERENCES products (id),
    variant_id UUID REFERENCES product_variants (id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES sme_stores(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),

-- Billing Address
billing_address_line1 VARCHAR(255) NOT NULL,
billing_address_line2 VARCHAR(255),
billing_city VARCHAR(100) NOT NULL,
billing_state VARCHAR(100),
billing_postal_code VARCHAR(10) NOT NULL,
billing_country VARCHAR(2) DEFAULT 'ZA' NOT NULL,

-- Shipping Address
shipping_address_line1 VARCHAR(255) NOT NULL,
shipping_address_line2 VARCHAR(255),
shipping_city VARCHAR(100) NOT NULL,
shipping_state VARCHAR(100),
shipping_postal_code VARCHAR(10) NOT NULL,
shipping_country VARCHAR(2) DEFAULT 'ZA' NOT NULL,

-- Order Totals
subtotal DECIMAL(12, 2) NOT NULL,
tax_amount DECIMAL(12, 2) DEFAULT 0,
shipping_cost DECIMAL(12, 2) DEFAULT 0,
discount_amount DECIMAL(12, 2) DEFAULT 0,
total_amount DECIMAL(12, 2) NOT NULL,
currency VARCHAR(3) DEFAULT 'ZAR',

-- Status
order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, refunded

-- Payment & Shipping
payment_method VARCHAR(50),  -- payfast, ozow, card, bank_transfer
    shipping_method VARCHAR(100),
    shipping_reference VARCHAR(100),
    tracking_number VARCHAR(100),
    
    notes TEXT,
    customer_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_orders_tenant_id ON orders (tenant_id);

CREATE INDEX idx_orders_user_id ON orders (user_id);

CREATE INDEX idx_orders_order_number ON orders (order_number);

CREATE INDEX idx_orders_order_status ON orders (order_status);

CREATE INDEX idx_orders_payment_status ON orders (payment_status);

CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    order_id UUID NOT NULL REFERENCES orders (id),
    product_id UUID NOT NULL REFERENCES products (id),
    variant_id UUID REFERENCES product_variants (id),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- ============================================
-- PAYMENTS
-- ============================================

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    order_id UUID NOT NULL REFERENCES orders (id),
    payment_gateway VARCHAR(50) NOT NULL, -- payfast, ozow, card, bank_transfer
    gateway_transaction_id VARCHAR(255),
    gateway_reference VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    payment_method VARCHAR(100),
    gateway_response JSONB,
    error_message TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_tenant_id ON payments (tenant_id);

CREATE INDEX idx_payments_order_id ON payments (order_id);

CREATE INDEX idx_payments_gateway_transaction_id ON payments (gateway_transaction_id);

CREATE INDEX idx_payments_payment_status ON payments (payment_status);

-- Payment Webhooks (for audit trail)
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    payment_id UUID REFERENCES payments (id),
    payment_gateway VARCHAR(50),
    webhook_event VARCHAR(100),
    webhook_payload JSONB,
    authentication_status VARCHAR(50), -- verified, failed
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_webhooks_payment_id ON payment_webhooks (payment_id);

-- ============================================
-- SHIPPING
-- ============================================

-- Shipping Labels
CREATE TABLE IF NOT EXISTS shipping_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    order_id UUID NOT NULL REFERENCES orders (id),
    carrier VARCHAR(100) NOT NULL, -- courier_guy, bob_go, pargo
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(512),
    label_url VARCHAR(512),
    weight_kg DECIMAL(8, 2),
    dimensions JSONB,
    shipment_status VARCHAR(50), -- created, picked_up, in_transit, delivered, failed
    cost DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_labels_tenant_id ON shipping_labels (tenant_id);

CREATE INDEX idx_shipping_labels_order_id ON shipping_labels (order_id);

CREATE INDEX idx_shipping_labels_tracking_number ON shipping_labels (tracking_number);

-- Shipping Quotes (history of quotes for comparison)
CREATE TABLE IF NOT EXISTS shipping_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    order_id UUID REFERENCES orders (id),
    carrier VARCHAR(100),
    quote_reference VARCHAR(255),
    from_address JSONB NOT NULL,
    to_address JSONB NOT NULL,
    weight_kg DECIMAL(8, 2),
    dimensions JSONB,
    cost DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    estimated_delivery_days INTEGER,
    service_name VARCHAR(255),
    is_selected BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_quotes_tenant_id ON shipping_quotes (tenant_id);

CREATE INDEX idx_shipping_quotes_order_id ON shipping_quotes (order_id);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(12, 2) NOT NULL,
    annual_price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'ZAR',

-- Features
max_products INTEGER DEFAULT 100,
    max_categories INTEGER DEFAULT 10,
    max_users INTEGER DEFAULT 1,
    storage_gb DECIMAL(10, 2) DEFAULT 1,
    bandwidth_gb DECIMAL(10, 2) DEFAULT 10,
    custom_domain BOOLEAN DEFAULT false,
    api_access BOOLEAN DEFAULT false,
    
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    plan_id UUID NOT NULL REFERENCES subscription_plans (id),
    status VARCHAR(50) DEFAULT 'active', -- active, paused, canceled, past_due
    billing_cycle VARCHAR(50) DEFAULT 'monthly', -- monthly, annual
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    next_billing_date TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    auto_renew BOOLEAN DEFAULT true,
    recurring_payment_gateway_id VARCHAR(255), -- for PayFast recurring payments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_tenant_id ON subscriptions (tenant_id);

CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- Subscription Payments (invoices)
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    subscription_id UUID NOT NULL REFERENCES subscriptions (id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    gateway_invoice_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX idx_subscription_payments_subscription_id ON subscription_payments (subscription_id);

-- ============================================
-- JOB BOARD INTEGRATION
-- ============================================

-- Job Board Leads
CREATE TABLE IF NOT EXISTS job_board_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES sme_stores(id),
    lead_status VARCHAR(50) DEFAULT 'identified',  -- identified, submitted, accepted, rejected

-- Qualification Criteria
total_orders INTEGER,
total_revenue DECIMAL(15, 2),
monthly_average_orders DECIMAL(10, 2),
growth_rate DECIMAL(5, 2),
days_operational INTEGER,

-- Lead Info
lead_description TEXT,
qualification_score DECIMAL(5, 2), -- 0-100

-- Job Board Integration
job_board_id VARCHAR(255),
    submitted_at TIMESTAMP,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_board_leads_tenant_id ON job_board_leads (tenant_id);

CREATE INDEX idx_job_board_leads_lead_status ON job_board_leads (lead_status);

-- ============================================
-- ANALYTICS & AUDIT
-- ============================================

-- Store Statistics (denormalized for performance)
CREATE TABLE IF NOT EXISTS store_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL REFERENCES sme_stores (id),
    total_products INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    average_order_value DECIMAL(12, 2) DEFAULT 0,
    monthly_orders INTEGER DEFAULT 0,
    monthly_revenue DECIMAL(15, 2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    repeat_customer_rate DECIMAL(5, 2) DEFAULT 0,
    last_calculated_at TIMESTAMP,
    UNIQUE (tenant_id)
);

CREATE INDEX idx_store_statistics_tenant_id ON store_statistics (tenant_id);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID REFERENCES sme_stores (id),
    user_id UUID REFERENCES users (id),
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    action VARCHAR(50), -- create, update, delete
    changes JSONB, -- before/after values
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs (tenant_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);

CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);