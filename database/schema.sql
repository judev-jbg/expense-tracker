-- =====================================================
-- EXPENSE TRACKER DATABASE SCHEMA
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This creates all necessary tables and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EXPENSE TYPES TABLE
-- =====================================================
-- Categories like "Food", "Transport", "Utilities", etc.
CREATE TABLE IF NOT EXISTS expense_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '💰',
    color VARCHAR(7) DEFAULT '#6200ea', -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT expense_types_name_unique_per_user UNIQUE (name, created_by)
);

-- =====================================================
-- ENTITIES TABLE
-- =====================================================
-- Specific providers/companies like "Mercadona", "Endesa", etc.
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    expense_type_id UUID NOT NULL REFERENCES expense_types(id) ON DELETE CASCADE,
    contact_info JSONB, -- Store phone, email, website, etc.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT entities_name_unique_per_type_user UNIQUE (name, expense_type_id, created_by)
);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
-- Main expense records
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL,
    expense_type_id UUID NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    tags TEXT[], -- Array of tags for additional categorization
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CHECK (year >= 1900 AND year <= 2100)
);

-- =====================================================
-- EXPENSE DOCUMENTS TABLE
-- =====================================================
-- File attachments stored in Google Drive
CREATE TABLE IF NOT EXISTS expense_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    google_drive_file_id VARCHAR(255) NOT NULL,
    google_drive_url TEXT NOT NULL,
    google_drive_folder_id VARCHAR(255),
    is_receipt BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_google_drive_file UNIQUE (google_drive_file_id)
);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
-- Store user-specific settings and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    currency VARCHAR(3) DEFAULT 'EUR',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    default_expense_type_id UUID REFERENCES expense_types(id),
    notification_settings JSONB DEFAULT '{"email": true, "push": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT user_preferences_user_unique UNIQUE (user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Expenses indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type_id);
CREATE INDEX IF NOT EXISTS idx_expenses_entity ON expenses(entity_id);
CREATE INDEX IF NOT EXISTS idx_expenses_year_month ON expenses(year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_amount ON expenses(amount);

-- Expense types indexes
CREATE INDEX IF NOT EXISTS idx_expense_types_created_by ON expense_types(created_by);
CREATE INDEX IF NOT EXISTS idx_expense_types_active ON expense_types(is_active);

-- Entities indexes
CREATE INDEX IF NOT EXISTS idx_entities_created_by ON entities(created_by);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(expense_type_id);
CREATE INDEX IF NOT EXISTS idx_entities_active ON entities(is_active);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_expense_documents_expense_id ON expense_documents(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_documents_uploaded_by ON expense_documents(uploaded_by);

-- User preferences index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EXPENSE TYPES POLICIES
-- =====================================================

-- Users can view their own expense types
CREATE POLICY "Users can view own expense types" ON expense_types
    FOR SELECT USING (auth.uid() = created_by);

-- Users can insert their own expense types
CREATE POLICY "Users can insert own expense types" ON expense_types
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own expense types
CREATE POLICY "Users can update own expense types" ON expense_types
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own expense types
CREATE POLICY "Users can delete own expense types" ON expense_types
    FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- ENTITIES POLICIES
-- =====================================================

-- Users can view their own entities
CREATE POLICY "Users can view own entities" ON entities
    FOR SELECT USING (auth.uid() = created_by);

-- Users can insert their own entities
CREATE POLICY "Users can insert own entities" ON entities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own entities
CREATE POLICY "Users can update own entities" ON entities
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own entities
CREATE POLICY "Users can delete own entities" ON entities
    FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================

-- Users can view their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = created_by);

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- EXPENSE DOCUMENTS POLICIES
-- =====================================================

-- Users can view documents for their own expenses
CREATE POLICY "Users can view own expense documents" ON expense_documents
    FOR SELECT USING (
        auth.uid() = uploaded_by OR 
        auth.uid() = (SELECT created_by FROM expenses WHERE id = expense_documents.expense_id)
    );

-- Users can insert documents for their own expenses
CREATE POLICY "Users can insert own expense documents" ON expense_documents
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        auth.uid() = (SELECT created_by FROM expenses WHERE id = expense_documents.expense_id)
    );

-- Users can update their own expense documents
CREATE POLICY "Users can update own expense documents" ON expense_documents
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Users can delete their own expense documents
CREATE POLICY "Users can delete own expense documents" ON expense_documents
    FOR DELETE USING (auth.uid() = uploaded_by);

-- =====================================================
-- USER PREFERENCES POLICIES
-- =====================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the function to all tables with updated_at column
CREATE TRIGGER update_expense_types_updated_at 
    BEFORE UPDATE ON expense_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at 
    BEFORE UPDATE ON entities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set year and month from expense_date
CREATE OR REPLACE FUNCTION set_expense_year_month()
RETURNS TRIGGER AS $$
BEGIN
    NEW.year = EXTRACT(YEAR FROM NEW.expense_date);
    NEW.month = EXTRACT(MONTH FROM NEW.expense_date);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the function to expenses table
CREATE TRIGGER set_expenses_year_month
    BEFORE INSERT OR UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION set_expense_year_month();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- This function will be called after a user signs up to create default data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    food_type_id UUID;
    transport_type_id UUID;
    utilities_type_id UUID;
    entertainment_type_id UUID;
    health_type_id UUID;
BEGIN
    -- Insert default expense types for new user
    INSERT INTO expense_types (name, description, icon, color, created_by)
    VALUES 
        ('Food & Dining', 'Groceries, restaurants, food delivery', '🍽️', '#4CAF50', NEW.id),
        ('Transportation', 'Gas, public transport, car maintenance', '🚗', '#2196F3', NEW.id),
        ('Utilities', 'Electricity, water, gas, internet', '💡', '#FF9800', NEW.id),
        ('Entertainment', 'Movies, games, subscriptions', '🎬', '#9C27B0', NEW.id),
        ('Healthcare', 'Medical expenses, pharmacy, insurance', '🏥', '#F44336', NEW.id),
        ('Shopping', 'Clothing, electronics, household items', '🛍️', '#607D8B', NEW.id)
    RETURNING id INTO food_type_id;

    -- Get the IDs of created expense types
    SELECT id INTO food_type_id FROM expense_types WHERE name = 'Food & Dining' AND created_by = NEW.id;
    SELECT id INTO transport_type_id FROM expense_types WHERE name = 'Transportation' AND created_by = NEW.id;
    SELECT id INTO utilities_type_id FROM expense_types WHERE name = 'Utilities' AND created_by = NEW.id;
    SELECT id INTO entertainment_type_id FROM expense_types WHERE name = 'Entertainment' AND created_by = NEW.id;
    SELECT id INTO health_type_id FROM expense_types WHERE name = 'Healthcare' AND created_by = NEW.id;

    -- Insert some default entities
    INSERT INTO entities (name, description, expense_type_id, created_by)
    VALUES 
        ('Supermarket', 'General grocery shopping', food_type_id, NEW.id),
        ('Gas Station', 'Fuel for vehicles', transport_type_id, NEW.id),
        ('Electric Company', 'Electricity bills', utilities_type_id, NEW.id),
        ('Internet Provider', 'Internet and cable services', utilities_type_id, NEW.id),
        ('Streaming Service', 'Netflix, Spotify, etc.', entertainment_type_id, NEW.id),
        ('Pharmacy', 'Medications and health supplies', health_type_id, NEW.id);

    -- Insert default user preferences
    INSERT INTO user_preferences (user_id, theme, currency, default_expense_type_id)
    VALUES (NEW.id, 'dark', 'EUR', food_type_id);

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- USEFUL VIEWS FOR REPORTING
-- =====================================================

-- Monthly expense summary view
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT 
    e.created_by as user_id,
    e.year,
    e.month,
    et.name as expense_type,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount,
    MIN(e.amount) as min_amount,
    MAX(e.amount) as max_amount
FROM expenses e
JOIN expense_types et ON e.expense_type_id = et.id
GROUP BY e.created_by, e.year, e.month, et.name, et.id
ORDER BY e.year DESC, e.month DESC, total_amount DESC;

-- Recent expenses view (last 30 days)
CREATE OR REPLACE VIEW recent_expenses AS
SELECT 
    e.id,
    e.amount,
    e.description,
    e.expense_date,
    et.name as expense_type,
    et.icon as expense_type_icon,
    ent.name as entity,
    e.created_by as user_id,
    e.created_at
FROM expenses e
JOIN expense_types et ON e.expense_type_id = et.id
JOIN entities ent ON e.entity_id = ent.id
WHERE e.expense_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY e.expense_date DESC, e.created_at DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log successful schema creation
DO $$
BEGIN
    RAISE NOTICE '✅ Expense Tracker database schema created successfully!';
    RAISE NOTICE '📊 Tables created: expense_types, entities, expenses, expense_documents, user_preferences';
    RAISE NOTICE '🔒 Row Level Security policies applied';
    RAISE NOTICE '⚡ Indexes created for optimal performance';
    RAISE NOTICE '🔧 Triggers and functions configured';
    RAISE NOTICE '👤 New user signup automation enabled';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your database is ready for the Expense Tracker application!';
END $$;