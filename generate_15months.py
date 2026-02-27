import uuid
import random
from datetime import datetime, timedelta

# Configuration
USER_ID = "959f7bea-9a36-4104-962d-e6cd34c5f97c"
START_DATE = datetime(2024, 1, 1)
NUM_MONTHS = 15
OUTPUT_FILE = "insert_15months_complete.sql"

# Categories and merchants
CATEGORIES = {
    'income': [('salary', 'Company', 'bank_transfer')],
    'food': [
        ('Swiggy - Biryani', 'Swiggy', 'credit_card'),
        ('Breakfast - Idli', 'Local Cafe', 'cash'),
        ('Lunch - Thali', 'Office Canteen', 'credit_card'),
        ('Grocery Shopping', 'BigBasket', 'credit_card'),
        ('Dinner - Pizza', 'Dominos', 'credit_card'),
        ('Tea & Snacks', 'Chai Point', 'cash'),
        ('Dinner - Chinese', 'Mainland China', 'credit_card'),
        ('Lunch - Burger', 'Truffles', 'credit_card'),
    ],
    'travel': [
        ('Metro to Office', 'Namma Metro', 'upi'),
        ('Uber Auto', 'Uber', 'upi'),
        ('Rapido', 'Rapido', 'upi'),
        ('Ola Trip', 'Ola', 'upi'),
        ('Uber Bike', 'Uber', 'upi'),
        ('Ola Auto', 'Ola', 'upi'),
    ],
    'bills': [
        ('Electricity Bill', 'BESCOM', 'bank_transfer'),
        ('Internet Bill', 'Airtel', 'upi'),
        ('Mobile Recharge', 'Jio', 'upi'),
    ],
    'emi': [('Car Loan EMI', 'Bank', 'bank_transfer')],
    'shopping': [
        ('Clothes - Myntra', 'Myntra', 'credit_card'),
        ('Mobile Accessories', 'Amazon', 'credit_card'),
        ('Shoes - Nike', 'Nike Store', 'credit_card'),
    ],
    'investment': [('SIP Investment', 'Mutual Fund', 'bank_transfer')],
    'healthcare': [
        ('Medicines', 'PharmEasy', 'credit_card'),
        ('Gym Membership', 'Cult.fit', 'credit_card'),
    ],
    'entertainment': [
        ('Movie Tickets', 'PVR Cinemas', 'credit_card'),
        ('Spotify Premium', 'Spotify', 'credit_card'),
        ('Netflix Monthly', 'Netflix', 'credit_card'),
    ],
    'subscription': [
        ('Amazon Prime', 'Amazon', 'credit_card'),
        ('YouTube Premium', 'Google', 'credit_card'),
    ],
    'transfer': [
        ('Bank Transfer', 'Bank', 'bank_transfer'),
        ('Money Transfer', 'Bank', 'bank_transfer'),
    ],
    'other': [
        ('Stationery', 'Local Shop', 'cash'),
        ('Donation', 'NGO', 'upi'),
        ('Personal Care', 'Salon', 'cash'),
    ],
}

AMOUNTS = {
    'income': (85000, 85000),
    'food': (200, 1500),
    'travel': (100, 400),
    'bills': (500, 2000),
    'emi': (12000, 12000),
    'shopping': (1000, 5000),
    'investment': (5000, 5000),
    'healthcare': (300, 1000),
    'entertainment': (200, 1000),
    'subscription': (150, 350),
    'transfer': (2000, 5000),
    'other': (100, 600),
}

def generate_transaction_id(date, seq):
    return f"{date.strftime('%Y%m%d')}-{seq:04d}-0000-0000-000000000000"

def generate_month_data(year, month, seq_start):
    transactions = []
    seq = seq_start
    
    # Salary on 1st of month
    date = datetime(year, month, 1)
    trans_id = generate_transaction_id(date, seq)
    transactions.append(f"('{trans_id}', '{USER_ID}', 85000.00, 'income', 'salary', 'Monthly Salary', 'Company', 'bank_transfer', 'completed', false, '{date.strftime('%Y-%m-%d')} 10:00:00+05:30', NOW())")
    seq += 1
    
    # Food - 8 transactions
    for _ in range(8):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['food'])
        amount = round(random.uniform(200, 1500), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(8, 22)}:{random.choice(['00', '15', '30', '45'])}:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'food', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Travel - 6 transactions
    for _ in range(6):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['travel'])
        amount = round(random.uniform(100, 400), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(8, 22)}:{random.choice(['00', '15', '30', '45'])}:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'travel', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Bills - 3 transactions (fixed days)
    bill_days = [5, 10, 15]
    for i, day in enumerate(bill_days):
        date = datetime(year, month, day)
        desc, merchant, payment = CATEGORIES['bills'][i]
        amount = round(random.uniform(500, 2000), 2)
        trans_id = generate_transaction_id(date, seq)
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'bills', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} 10:00:00+05:30', NOW())")
        seq += 1
    
    # EMI - 1 transaction
    date = datetime(year, month, 10)
    trans_id = generate_transaction_id(date, seq)
    transactions.append(f"('{trans_id}', '{USER_ID}', 12000.00, 'expense', 'emi', 'Car Loan EMI', 'Bank', 'bank_transfer', 'completed', false, '{date.strftime('%Y-%m-%d')} 10:00:00+05:30', NOW())")
    seq += 1
    
    # Shopping - 3 transactions
    for _ in range(3):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['shopping'])
        amount = round(random.uniform(1000, 5000), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(10, 20)}:00:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'shopping', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Investment - 1 transaction
    date = datetime(year, month, 15)
    trans_id = generate_transaction_id(date, seq)
    transactions.append(f"('{trans_id}', '{USER_ID}', 5000.00, 'expense', 'investment', 'SIP Investment', 'Mutual Fund', 'bank_transfer', 'completed', false, '{date.strftime('%Y-%m-%d')} 10:00:00+05:30', NOW())")
    seq += 1
    
    # Healthcare - 2 transactions
    for _ in range(2):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['healthcare'])
        amount = round(random.uniform(300, 1000), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(10, 20)}:00:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'healthcare', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Entertainment - 3 transactions
    for _ in range(3):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['entertainment'])
        amount = round(random.uniform(200, 1000), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(18, 22)}:00:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'entertainment', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Subscriptions - 2 transactions (1st of month)
    for i, (desc, merchant, payment) in enumerate(CATEGORIES['subscription'][:2]):
        date = datetime(year, month, 1)
        trans_id = generate_transaction_id(date, seq)
        amount = 299 if i == 1 else 199
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}.00, 'expense', 'subscription', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} 00:00:00+05:30', NOW())")
        seq += 1
    
    # Transfer - 2 transactions
    for _ in range(2):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['transfer'])
        amount = round(random.uniform(2000, 5000), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(10, 18)}:00:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'transfer', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    # Others - 3 transactions
    for _ in range(3):
        day = random.randint(1, 28)
        date = datetime(year, month, day)
        desc, merchant, payment = random.choice(CATEGORIES['other'])
        amount = round(random.uniform(100, 600), 2)
        trans_id = generate_transaction_id(date, seq)
        time = f"{random.randint(10, 18)}:00:00"
        transactions.append(f"('{trans_id}', '{USER_ID}', {amount}, 'expense', 'other', '{desc}', '{merchant}', '{payment}', 'completed', false, '{date.strftime('%Y-%m-%d')} {time}+05:30', NOW())")
        seq += 1
    
    return transactions, seq

def main():
    random.seed(42)  # For reproducibility
    
    all_transactions = []
    seq = 1
    
    current_date = START_DATE
    for month_idx in range(NUM_MONTHS):
        year = current_date.year
        month = current_date.month
        
        month_trans, seq = generate_month_data(year, month, seq)
        all_transactions.extend(month_trans)
        
        # Move to next month
        if month == 12:
            current_date = datetime(year + 1, 1, 1)
        else:
            current_date = datetime(year, month + 1, 1)
    
    # Write to SQL file
    with open(OUTPUT_FILE, 'w') as f:
        f.write(f"-- Insert 15 months of transaction data for user {USER_ID}\n")
        f.write(f"-- Date Range: January 2024 to March 2025 (15 months)\n")
        f.write(f"-- Total Transactions: {len(all_transactions)}\n\n")
        f.write("INSERT INTO public.transactions (id, user_id, amount, type, category, description, merchant, payment_method, status, is_anomaly, occurred_at, created_at) \n")
        f.write("VALUES \n")
        f.write(",\n".join(all_transactions))
        f.write(";\n\n")
        
        # Add verification query
        f.write("-- Verify the data was inserted\n")
        f.write(f"SELECT \n")
        f.write(f"  COUNT(*) as total_transactions,\n")
        f.write(f"  COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,\n")
        f.write(f"  COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,\n")
        f.write(f"  MIN(occurred_at::date) as earliest_date,\n")
        f.write(f"  MAX(occurred_at::date) as latest_date\n")
        f.write(f"FROM transactions \n")
        f.write(f"WHERE user_id = '{USER_ID}';\n")
    
    print(f"Generated {len(all_transactions)} transactions")
    print(f"SQL file written to: {OUTPUT_FILE}")
    print(f"\nBreakdown per month: ~35 transactions")
    print(f"  - 1 salary (income)")
    print(f"  - 8 food")
    print(f"  - 6 travel")
    print(f"  - 3 bills")
    print(f"  - 1 emi")
    print(f"  - 3 shopping")
    print(f"  - 1 investment")
    print(f"  - 2 healthcare")
    print(f"  - 3 entertainment")
    print(f"  - 2 subscription")
    print(f"  - 2 transfer")
    print(f"  - 3 other")

if __name__ == "__main__":
    main()
