-- Daily Transactions for User: 125c734a-6c16-41af-9263-f1dbcf87572d
-- Date Range: Jan 28, 2026 to Feb 24, 2026 (28 days)
-- Run this in Supabase SQL Editor

INSERT INTO public.transactions (id, user_id, amount, type, category, description, merchant, payment_method, status, is_anomaly, occurred_at, created_at) 
VALUES 

-- JANUARY 2026

-- Jan 28 - Tuesday
('d0010001-0000-0000-0000-000000000001', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Breakfast - Idli & Coffee', 'Local Cafe', 'cash', 'completed', false, '2026-01-28 08:30:00+05:30', NOW()),
('d0010002-0000-0000-0000-000000000002', '125c734a-6c16-41af-9263-f1dbcf87572d', 450.00, 'expense', 'Food', 'Lunch - Thali', 'Office Canteen', 'credit_card', 'completed', false, '2026-01-28 13:00:00+05:30', NOW()),
('d0010003-0000-0000-0000-000000000003', '125c734a-6c16-41af-9263-f1dbcf87572d', 220.00, 'expense', 'Transport', 'Metro to Office', 'Namma Metro', 'upi', 'completed', false, '2026-01-28 09:00:00+05:30', NOW()),

-- Jan 29 - Wednesday
('d0010004-0000-0000-0000-000000000004', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Food', 'Swiggy - Biryani', 'Swiggy', 'credit_card', 'completed', false, '2026-01-29 20:00:00+05:30', NOW()),
('d0010005-0000-0000-0000-000000000005', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Transport', 'Uber Auto', 'Uber', 'upi', 'completed', false, '2026-01-29 18:30:00+05:30', NOW()),
('d0010006-0000-0000-0000-000000000006', '125c734a-6c16-41af-9263-f1dbcf87572d', 1200.00, 'expense', 'Shopping', 'Groceries - BigBasket', 'BigBasket', 'credit_card', 'completed', false, '2026-01-29 19:00:00+05:30', NOW()),

-- Jan 30 - Thursday
('d0010007-0000-0000-0000-000000000007', '125c734a-6c16-41af-9263-f1dbcf87572d', 150.00, 'expense', 'Food', 'Tea & Snacks', 'Chai Point', 'cash', 'completed', false, '2026-01-30 16:00:00+05:30', NOW()),
('d0010008-0000-0000-0000-000000000008', '125c734a-6c16-41af-9263-f1dbcf87572d', 550.00, 'expense', 'Food', 'Dinner - Pizza', 'Dominos', 'credit_card', 'completed', false, '2026-01-30 21:00:00+05:30', NOW()),
('d0010009-0000-0000-0000-000000000009', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Rapido', 'Rapido', 'upi', 'completed', false, '2026-01-30 08:45:00+05:30', NOW()),

-- Jan 31 - Friday
('d0010010-0000-0000-0000-000000000010', '125c734a-6c16-41af-9263-f1dbcf87572d', 800.00, 'expense', 'Entertainment', 'Movie - Pushpa 2', 'PVR Cinemas', 'credit_card', 'completed', false, '2026-01-31 19:30:00+05:30', NOW()),
('d0010011-0000-0000-0000-000000000011', '125c734a-6c16-41af-9263-f1dbcf87572d', 420.00, 'expense', 'Food', 'Popcorn & Snacks', 'PVR', 'credit_card', 'completed', false, '2026-01-31 19:45:00+05:30', NOW()),
('d0010012-0000-0000-0000-000000000012', '125c734a-6c16-41af-9263-f1dbcf87572d', 2500.00, 'expense', 'Shopping', 'Clothes - Myntra', 'Myntra', 'credit_card', 'completed', false, '2026-01-31 14:00:00+05:30', NOW()),

-- FEBRUARY 2026

-- Feb 1 - Saturday
('d0010013-0000-0000-0000-000000000013', '125c734a-6c16-41af-9263-f1dbcf87572d', 650.00, 'expense', 'Food', 'Lunch - Family Restaurant', 'Truffles', 'credit_card', 'completed', false, '2026-02-01 13:30:00+05:30', NOW()),
('d0010014-0000-0000-0000-000000000014', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Transport', 'Ola - Weekend trip', 'Ola', 'upi', 'completed', false, '2026-02-01 10:00:00+05:30', NOW()),
('d0010015-0000-0000-0000-000000000015', '125c734a-6c16-41af-9263-f1dbcf87572d', 1800.00, 'expense', 'Shopping', 'Mobile Accessories', 'Amazon', 'credit_card', 'completed', false, '2026-02-01 17:00:00+05:30', NOW()),

-- Feb 2 - Sunday
('d0010016-0000-0000-0000-000000000016', '125c734a-6c16-41af-9263-f1dbcf87572d', 950.00, 'expense', 'Groceries', 'Weekly Grocery Run', 'DMart', 'credit_card', 'completed', false, '2026-02-02 11:00:00+05:30', NOW()),
('d0010017-0000-0000-0000-000000000017', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Breakfast - Dosa', 'Local Hotel', 'cash', 'completed', false, '2026-02-02 09:00:00+05:30', NOW()),
('d0010018-0000-0000-0000-000000000018', '125c734a-6c16-41af-9263-f1dbcf87572d', 499.00, 'expense', 'Entertainment', 'Spotify Annual Plan', 'Spotify', 'credit_card', 'completed', false, '2026-02-02 00:00:00+05:30', NOW()),

-- Feb 3 - Monday
('d0010019-0000-0000-0000-000000000019', '125c734a-6c16-41af-9263-f1dbcf87572d', 320.00, 'expense', 'Food', 'Lunch - Biryani', 'Zomato', 'credit_card', 'completed', false, '2026-02-03 12:30:00+05:30', NOW()),
('d0010020-0000-0000-0000-000000000020', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Metro Daily Pass', 'Namma Metro', 'upi', 'completed', false, '2026-02-03 08:00:00+05:30', NOW()),
('d0010021-0000-0000-0000-000000000021', '125c734a-6c16-41af-9263-f1dbcf87572d', 150.00, 'expense', 'Food', 'Evening Tea', 'Chai Point', 'cash', 'completed', false, '2026-02-03 16:30:00+05:30', NOW()),

-- Feb 4 - Tuesday
('d0010022-0000-0000-0000-000000000022', '125c734a-6c16-41af-9263-f1dbcf87572d', 450.00, 'expense', 'Food', 'Dinner - Chinese', 'Mainland China', 'credit_card', 'completed', false, '2026-02-04 20:00:00+05:30', NOW()),
('d0010023-0000-0000-0000-000000000023', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Transport', 'Uber Bike', 'Uber', 'upi', 'completed', false, '2026-02-04 08:30:00+05:30', NOW()),
('d0010024-0000-0000-0000-000000000024', '125c734a-6c16-41af-9263-f1dbcf87572d', 850.00, 'expense', 'Health', 'Medicines', 'PharmEasy', 'credit_card', 'completed', false, '2026-02-04 19:00:00+05:30', NOW()),

-- Feb 5 - Wednesday
('d0010025-0000-0000-0000-000000000025', '125c734a-6c16-41af-9263-f1dbcf87572d', 300.00, 'expense', 'Food', 'Lunch - Roti Curry', 'Office Canteen', 'credit_card', 'completed', false, '2026-02-05 12:45:00+05:30', NOW()),
('d0010026-0000-0000-0000-000000000026', '125c734a-6c16-41af-9263-f1dbcf87572d', 2200.00, 'expense', 'Shopping', 'Shoes - Nike', 'Nike Store', 'credit_card', 'completed', false, '2026-02-05 18:00:00+05:30', NOW()),
('d0010027-0000-0000-0000-000000000027', '125c734a-6c16-41af-9263-f1dbcf87572d', 250.00, 'expense', 'Transport', 'Ola Auto', 'Ola', 'upi', 'completed', false, '2026-02-05 18:45:00+05:30', NOW()),

-- Feb 6 - Thursday
('d0010028-0000-0000-0000-000000000028', '125c734a-6c16-41af-9263-f1dbcf87572d', 550.00, 'expense', 'Food', 'Team Dinner', 'Empire Restaurant', 'credit_card', 'completed', false, '2026-02-06 20:30:00+05:30', NOW()),
('d0010029-0000-0000-0000-000000000029', '125c734a-6c16-41af-9263-f1dbcf87572d', 1999.00, 'expense', 'Utilities', 'Jio Recharge', 'Jio', 'upi', 'completed', false, '2026-02-06 10:00:00+05:30', NOW()),
('d0010030-0000-0000-0000-000000000030', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Food', 'Ice Cream', 'Corner House', 'cash', 'completed', false, '2026-02-06 21:30:00+05:30', NOW()),

-- Feb 7 - Friday
('d0010031-0000-0000-0000-000000000031', '125c734a-6c16-41af-9263-f1dbcf87572d', 380.00, 'expense', 'Food', 'Lunch - Burger', 'Truffles', 'credit_card', 'completed', false, '2026-02-07 12:30:00+05:30', NOW()),
('d0010032-0000-0000-0000-000000000032', '125c734a-6c16-41af-9263-f1dbcf87572d', 3200.00, 'expense', 'Travel', 'Train Tickets - Bangalore to Chennai', 'IRCTC', 'credit_card', 'completed', false, '2026-02-07 09:00:00+05:30', NOW()),
('d0010033-0000-0000-0000-000000000033', '125c734a-6c16-41af-9263-f1dbcf87572d', 400.00, 'expense', 'Food', 'Dinner - Hotel', 'Empire', 'credit_card', 'completed', false, '2026-02-07 21:00:00+05:30', NOW()),

-- Feb 8 - Saturday
('d0010034-0000-0000-0000-000000000034', '125c734a-6c16-41af-9263-f1dbcf87572d', 750.00, 'expense', 'Food', 'Family Lunch', 'Kerala Kitchen', 'credit_card', 'completed', false, '2026-02-08 13:00:00+05:30', NOW()),
('d0010035-0000-0000-0000-000000000035', '125c734a-6c16-41af-9263-f1dbcf87572d', 1200.00, 'expense', 'Shopping', 'Household Items', 'DMart', 'credit_card', 'completed', false, '2026-02-08 11:30:00+05:30', NOW()),
('d0010036-0000-0000-0000-000000000036', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Evening Snacks', 'V V Puram Food Street', 'cash', 'completed', false, '2026-02-08 18:00:00+05:30', NOW()),

-- Feb 9 - Sunday
('d0010037-0000-0000-0000-000000000037', '125c734a-6c16-41af-9263-f1dbcf87572d', 1500.00, 'expense', 'Shopping', 'Flipkart Order', 'Flipkart', 'credit_card', 'completed', false, '2026-02-09 14:00:00+05:30', NOW()),
('d0010038-0000-0000-0000-000000000038', '125c734a-6c16-41af-9263-f1dbcf87572d', 299.00, 'expense', 'Entertainment', 'Netflix Monthly', 'Netflix', 'credit_card', 'completed', false, '2026-02-09 00:00:00+05:30', NOW()),
('d0010039-0000-0000-0000-000000000039', '125c734a-6c16-41af-9263-f1dbcf87572d', 450.00, 'expense', 'Food', 'Brunch', 'The Hole in the Wall Cafe', 'credit_card', 'completed', false, '2026-02-09 11:00:00+05:30', NOW()),

-- Feb 10 - Monday
('d0010040-0000-0000-0000-000000000040', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Lunch - Rice Bowl', 'Nandus', 'credit_card', 'completed', false, '2026-02-10 12:45:00+05:30', NOW()),
('d0010041-0000-0000-0000-000000000041', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Transport', 'Metro', 'Namma Metro', 'upi', 'completed', false, '2026-02-10 08:15:00+05:30', NOW()),
('d0010042-0000-0000-0000-000000000042', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Food', 'Dinner - Andhra Meals', 'Andhra Spice', 'credit_card', 'completed', false, '2026-02-10 20:00:00+05:30', NOW()),

-- Feb 11 - Tuesday
('d0010043-0000-0000-0000-000000000043', '125c734a-6c16-41af-9263-f1dbcf87572d', 320.00, 'expense', 'Food', 'Lunch - North Indian', 'Paradise Biryani', 'credit_card', 'completed', false, '2026-02-11 12:30:00+05:30', NOW()),
('d0010044-0000-0000-0000-000000000044', '125c734a-6c16-41af-9263-f1dbcf87572d', 1100.00, 'expense', 'Utilities', 'Electricity Bill', 'BESCOM', 'bank_transfer', 'completed', false, '2026-02-11 10:00:00+05:30', NOW()),
('d0010045-0000-0000-0000-000000000045', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Uber Auto', 'Uber', 'upi', 'completed', false, '2026-02-11 18:30:00+05:30', NOW()),

-- Feb 12 - Wednesday
('d0010046-0000-0000-0000-000000000046', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Breakfast', 'Cafe Coffee Day', 'credit_card', 'completed', false, '2026-02-12 08:30:00+05:30', NOW()),
('d0010047-0000-0000-0000-000000000047', '125c734a-6c16-41af-9263-f1dbcf87572d', 420.00, 'expense', 'Food', 'Lunch - Fish Curry', 'Mangalore Pearl', 'credit_card', 'completed', false, '2026-02-12 12:45:00+05:30', NOW()),
('d0010048-0000-0000-0000-000000000048', '125c734a-6c16-41af-9263-f1dbcf87572d', 600.00, 'expense', 'Health', 'Gym Membership', 'Cult.fit', 'credit_card', 'completed', false, '2026-02-12 18:00:00+05:30', NOW()),

-- Feb 13 - Thursday
('d0010049-0000-0000-0000-000000000049', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Food', 'Dinner - Kebabs', 'Empire', 'credit_card', 'completed', false, '2026-02-13 20:30:00+05:30', NOW()),
('d0010050-0000-0000-0000-000000000050', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Transport', 'Rapido', 'Rapido', 'upi', 'completed', false, '2026-02-13 08:45:00+05:30', NOW()),
('d0010051-0000-0000-0000-000000000051', '125c734a-6c16-41af-9263-f1dbcf87572d', 950.00, 'expense', 'Groceries', 'BigBasket Order', 'BigBasket', 'credit_card', 'completed', false, '2026-02-13 19:00:00+05:30', NOW()),

-- Feb 14 - Friday (Valentine's Day)
('d0010052-0000-0000-0000-000000000052', '125c734a-6c16-41af-9263-f1dbcf87572d', 1500.00, 'expense', 'Food', 'Special Dinner', 'The Oberoi', 'credit_card', 'completed', false, '2026-02-14 20:00:00+05:30', NOW()),
('d0010053-0000-0000-0000-000000000053', '125c734a-6c16-41af-9263-f1dbcf87572d', 2500.00, 'expense', 'Shopping', 'Gift - Perfume', 'Nykaa', 'credit_card', 'completed', false, '2026-02-14 17:00:00+05:30', NOW()),
('d0010054-0000-0000-0000-000000000054', '125c734a-6c16-41af-9263-f1dbcf87572d', 800.00, 'expense', 'Entertainment', 'Movie Date', 'INOX', 'credit_card', 'completed', false, '2026-02-14 18:30:00+05:30', NOW()),

-- Feb 15 - Saturday
('d0010055-0000-0000-0000-000000000055', '125c734a-6c16-41af-9263-f1dbcf87572d', 480.00, 'expense', 'Food', 'Brunch', 'Shiro', 'credit_card', 'completed', false, '2026-02-15 12:00:00+05:30', NOW()),
('d0010056-0000-0000-0000-000000000056', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Transport', 'Cab for Shopping', 'Uber', 'upi', 'completed', false, '2026-02-15 15:00:00+05:30', NOW()),
('d0010057-0000-0000-0000-000000000057', '125c734a-6c16-41af-9263-f1dbcf87572d', 1800.00, 'expense', 'Shopping', 'Clothes', 'Westside', 'credit_card', 'completed', false, '2026-02-15 16:00:00+05:30', NOW()),

-- Feb 16 - Sunday
('d0010058-0000-0000-0000-000000000058', '125c734a-6c16-41af-9263-f1dbcf87572d', 320.00, 'expense', 'Food', 'Breakfast - Filter Coffee', 'Indian Coffee House', 'cash', 'completed', false, '2026-02-16 09:00:00+05:30', NOW()),
('d0010059-0000-0000-0000-000000000059', '125c734a-6c16-41af-9263-f1dbcf87572d', 750.00, 'expense', 'Groceries', 'Weekly Shopping', 'More Supermarket', 'credit_card', 'completed', false, '2026-02-16 11:00:00+05:30', NOW()),
('d0010060-0000-0000-0000-000000000060', '125c734a-6c16-41af-9263-f1dbcf87572d', 450.00, 'expense', 'Food', 'Dinner - Momos', 'The Dimsum House', 'credit_card', 'completed', false, '2026-02-16 20:00:00+05:30', NOW()),

-- Feb 17 - Monday
('d0010061-0000-0000-0000-000000000061', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Lunch - Biryani', 'Meghana Foods', 'credit_card', 'completed', false, '2026-02-17 12:30:00+05:30', NOW()),
('d0010062-0000-0000-0000-000000000062', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Metro', 'Namma Metro', 'upi', 'completed', false, '2026-02-17 08:30:00+05:30', NOW()),
('d0010063-0000-0000-0000-000000000063', '125c734a-6c16-41af-9263-f1dbcf87572d', 150.00, 'expense', 'Food', 'Tea & Samosa', 'Local Bakery', 'cash', 'completed', false, '2026-02-17 16:30:00+05:30', NOW()),

-- Feb 18 - Tuesday
('d0010064-0000-0000-0000-000000000064', '125c734a-6c16-41af-9263-f1dbcf87572d', 380.00, 'expense', 'Food', 'Dinner - Pasta', 'Little Italy', 'credit_card', 'completed', false, '2026-02-18 20:00:00+05:30', NOW()),
('d0010065-0000-0000-0000-000000000065', '125c734a-6c16-41af-9263-f1dbcf87572d', 999.00, 'expense', 'Utilities', 'Broadband Bill', 'Airtel', 'upi', 'completed', false, '2026-02-18 10:00:00+05:30', NOW()),
('d0010066-0000-0000-0000-000000000066', '125c734a-6c16-41af-9263-f1dbcf87572d', 250.00, 'expense', 'Transport', 'Ola Auto', 'Ola', 'upi', 'completed', false, '2026-02-18 18:30:00+05:30', NOW()),

-- Feb 19 - Wednesday
('d0010067-0000-0000-0000-000000000067', '125c734a-6c16-41af-9263-f1dbcf87572d', 300.00, 'expense', 'Food', 'Lunch - South Indian', 'MTR', 'credit_card', 'completed', false, '2026-02-19 12:45:00+05:30', NOW()),
('d0010068-0000-0000-0000-000000000068', '125c734a-6c16-41af-9263-f1dbcf87572d', 1200.00, 'expense', 'Shopping', 'Books - Amazon', 'Amazon', 'credit_card', 'completed', false, '2026-02-19 19:00:00+05:30', NOW()),
('d0010069-0000-0000-0000-000000000069', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Rapido', 'Rapido', 'upi', 'completed', false, '2026-02-19 08:15:00+05:30', NOW()),

-- Feb 20 - Thursday
('d0010070-0000-0000-0000-000000000070', '125c734a-6c16-41af-9263-f1dbcf87572d', 550.00, 'expense', 'Food', 'Team Lunch', 'Barbeque Nation', 'credit_card', 'completed', false, '2026-02-20 13:00:00+05:30', NOW()),
('d0010071-0000-0000-0000-000000000071', '125c734a-6c16-41af-9263-f1dbcf87572d', 180.00, 'expense', 'Food', 'Ice Cream', 'Corner House', 'cash', 'completed', false, '2026-02-20 21:00:00+05:30', NOW()),
('d0010072-0000-0000-0000-000000000072', '125c734a-6c16-41af-9263-f1dbcf87572d', 220.00, 'expense', 'Transport', 'Metro', 'Namma Metro', 'upi', 'completed', false, '2026-02-20 08:30:00+05:30', NOW()),

-- Feb 21 - Friday
('d0010073-0000-0000-0000-000000000073', '125c734a-6c16-41af-9263-f1dbcf87572d', 420.00, 'expense', 'Food', 'Lunch - Burger', 'Hard Rock Cafe', 'credit_card', 'completed', false, '2026-02-21 12:30:00+05:30', NOW()),
('d0010074-0000-0000-0000-000000000074', '125c734a-6c16-41af-9263-f1dbcf87572d', 2800.00, 'expense', 'Travel', 'Flight Ticket - Mumbai', 'MakeMyTrip', 'credit_card', 'completed', false, '2026-02-21 20:00:00+05:30', NOW()),
('d0010075-0000-0000-0000-000000000075', '125c734a-6c16-41af-9263-f1dbcf87572d', 350.00, 'expense', 'Transport', 'Airport Cab', 'Uber', 'upi', 'completed', false, '2026-02-21 05:30:00+05:30', NOW()),

-- Feb 22 - Saturday
('d0010076-0000-0000-0000-000000000076', '125c734a-6c16-41af-9263-f1dbcf87572d', 2500.00, 'expense', 'Shopping', 'Electronics - Earbuds', 'Croma', 'credit_card', 'completed', false, '2026-02-22 16:00:00+05:30', NOW()),
('d0010077-0000-0000-0000-000000000077', '125c734a-6c16-41af-9263-f1dbcf87572d', 650.00, 'expense', 'Food', 'Family Dinner', 'Sagar Ratna', 'credit_card', 'completed', false, '2026-02-22 20:00:00+05:30', NOW()),
('d0010078-0000-0000-0000-000000000078', '125c734a-6c16-41af-9263-f1dbcf87572d', 300.00, 'expense', 'Food', 'Breakfast - Poori', 'Vasudev Adigas', 'credit_card', 'completed', false, '2026-02-22 09:00:00+05:30', NOW()),

-- Feb 23 - Sunday
('d0010079-0000-0000-0000-000000000079', '125c734a-6c16-41af-9263-f1dbcf87572d', 450.00, 'expense', 'Food', 'Brunch', 'The Fatty Bao', 'credit_card', 'completed', false, '2026-02-23 12:00:00+05:30', NOW()),
('d0010080-0000-0000-0000-000000000080', '125c734a-6c16-41af-9263-f1dbcf87572d', 1100.00, 'expense', 'Groceries', 'Monthly Stock', 'BigBasket', 'credit_card', 'completed', false, '2026-02-23 11:00:00+05:30', NOW()),
('d0010081-0000-0000-0000-000000000081', '125c734a-6c16-41af-9263-f1dbcf87572d', 250.00, 'expense', 'Transport', 'Cab', 'Uber', 'upi', 'completed', false, '2026-02-23 15:00:00+05:30', NOW()),

-- Feb 24 - Monday
('d0010082-0000-0000-0000-000000000082', '125c734a-6c16-41af-9263-f1dbcf87572d', 320.00, 'expense', 'Food', 'Lunch - Meals', 'Koramangala Social', 'credit_card', 'completed', false, '2026-02-24 12:30:00+05:30', NOW()),
('d0010083-0000-0000-0000-000000000083', '125c734a-6c16-41af-9263-f1dbcf87572d', 200.00, 'expense', 'Transport', 'Metro', 'Namma Metro', 'upi', 'completed', false, '2026-02-24 08:30:00+05:30', NOW()),
('d0010084-0000-0000-0000-000000000084', '125c734a-6c16-41af-9263-f1dbcf87572d', 280.00, 'expense', 'Food', 'Dinner - Noodles', 'Wok', 'credit_card', 'completed', false, '2026-02-24 20:00:00+05:30', NOW());

-- Total: 84 transactions over 28 days (Jan 28 - Feb 24, 2026)
-- Categories: Food, Transport, Shopping, Groceries, Entertainment, Utilities, Health, Travel
-- Payment Methods: credit_card, upi, cash, bank_transfer
