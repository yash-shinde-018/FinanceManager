-- STEP 1: Create the user
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, email_confirmed_at, confirmation_sent_at, last_sign_in_at, raw_app_meta_data, encrypted_password, aud, role, phone, phone_confirmed_at, phone_change, email_change, email_change_token_new, email_change_token_current, recovery_token, email_change_confirm_status, banned_until, reauthentication_sent_at, is_super_admin, instance_id) 
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'testuser@moneymind.ai', '{"name": "Test User"}'::jsonb, NOW() - INTERVAL '35 days', NOW(), NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', '{"provider": "email", "providers": ["email"]}'::jsonb, crypt('TestPassword123!', gen_salt('bf')), 'authenticated', 'authenticated', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, false, '00000000-0000-0000-0000-000000000000');

-- STEP 2: Create profile
INSERT INTO public.profiles (id, email, name, created_at, updated_at) 
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'testuser@moneymind.ai', 'Test User', NOW() - INTERVAL '35 days', NOW());

-- STEP 3: Create accounts
INSERT INTO public.accounts (id, user_id, type, name, institution, balance, currency, account_number, status, created_at) 
VALUES 
('a1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bank', 'HDFC Savings', 'HDFC Bank', 45000.00, 'INR', '4567', 'active', NOW() - INTERVAL '35 days'),
('a2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'card', 'ICICI Credit Card', 'ICICI Bank', -12500.00, 'INR', '8901', 'active', NOW() - INTERVAL '35 days');

-- STEP 4: Create transactions
INSERT INTO public.transactions (id, user_id, amount, type, category, description, merchant, payment_method, status, is_anomaly, occurred_at, created_at) 
VALUES 
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 50000.00, 'income', 'Salary', 'Monthly Salary', 'Employer', 'bank_transfer', 'completed', false, (NOW() - INTERVAL '35 days')::date + '09:00:00'::time, NOW()),
('11111111-1111-1111-1111-111111111112', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 850.00, 'expense', 'Groceries', 'BigBasket - Weekly groceries', 'BigBasket', 'credit_card', 'completed', false, (NOW() - INTERVAL '35 days')::date + '18:30:00'::time, NOW()),
('11111111-1111-1111-1111-111111111113', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 320.00, 'expense', 'Food', 'Swiggy - Lunch', 'Swiggy', 'credit_card', 'completed', false, (NOW() - INTERVAL '34 days')::date + '13:15:00'::time, NOW()),
('11111111-1111-1111-1111-111111111114', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 180.00, 'expense', 'Transport', 'Uber - Office commute', 'Uber', 'credit_card', 'completed', false, (NOW() - INTERVAL '34 days')::date + '08:45:00'::time, NOW()),
('11111111-1111-1111-1111-111111111115', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2100.00, 'expense', 'Shopping', 'Amazon - Electronics', 'Amazon', 'credit_card', 'completed', false, (NOW() - INTERVAL '33 days')::date + '20:00:00'::time, NOW()),
('11111111-1111-1111-1111-111111111116', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2400.00, 'expense', 'Utilities', 'Electricity Bill', 'BESCOM', 'bank_transfer', 'completed', false, (NOW() - INTERVAL '32 days')::date + '10:00:00'::time, NOW()),
('11111111-1111-1111-1111-111111111117', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 450.00, 'expense', 'Food', 'Zomato - Dinner', 'Zomato', 'credit_card', 'completed', false, (NOW() - INTERVAL '32 days')::date + '21:00:00'::time, NOW()),
('11111111-1111-1111-1111-111111111118', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 920.00, 'expense', 'Groceries', 'DMart - Vegetables', 'DMart', 'credit_card', 'completed', false, (NOW() - INTERVAL '31 days')::date + '17:00:00'::time, NOW()),
('11111111-1111-1111-1111-111111111119', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 650.00, 'expense', 'Entertainment', 'PVR - Movie tickets', 'PVR Cinemas', 'credit_card', 'completed', false, (NOW() - INTERVAL '30 days')::date + '19:30:00'::time, NOW()),
('11111111-1111-1111-1111-111111111120', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 380.00, 'expense', 'Food', 'McDonalds - Snacks', 'McDonalds', 'credit_card', 'completed', false, (NOW() - INTERVAL '30 days')::date + '16:00:00'::time, NOW());

-- STEP 5: Create budgets
INSERT INTO public.budgets (id, user_id, category, "limit", period, created_at) 
VALUES 
('b1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Food', 10000.00, 'monthly', NOW()),
('b2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Groceries', 8000.00, 'monthly', NOW());

-- STEP 6: Create goals (fixed UUIDs - no 'g' prefix)
INSERT INTO public.goals (id, user_id, name, target_amount, current_amount, deadline, category, icon, color, status, created_at) 
VALUES 
('a3111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Emergency Fund', 100000.00, 25000.00, NOW() + INTERVAL '6 months', 'Savings', 'shield', 'green', 'active', NOW()),
('a3222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'New Laptop', 80000.00, 15000.00, NOW() + INTERVAL '4 months', 'Electronics', 'laptop', 'blue', 'active', NOW());

-- LOGIN: testuser@moneymind.ai / TestPassword123!