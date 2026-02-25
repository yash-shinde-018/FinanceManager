# data_generator.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Define categories and keywords (Indian context)
categories = {
    'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'dominos', 'mcdonalds', 'kfc', 'biryani', 'dosa', 'lunch', 'dinner'],
    'Groceries': ['dmart', 'bigbasket', 'reliance fresh', 'more', 'supermarket', 'grocery', 'blinkit', 'zepto'],
    'Transportation': ['uber', 'ola', 'rapido', 'auto', 'metro', 'bus', 'petrol', 'diesel', 'indian oil'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'clothing', 'electronics', 'meesho'],
    'Bills & Utilities': ['electricity', 'water', 'internet', 'phone', 'airtel', 'jio', 'bsnl', 'gas cylinder'],
    'Entertainment': ['netflix', 'prime video', 'hotstar', 'spotify', 'movie', 'cinema', 'pvr', 'inox'],
    'Health': ['pharmacy', 'apollo', 'fortis', 'doctor', 'hospital', 'dentist', 'medplus', 'netmeds'],
    'Income': ['salary', 'payroll', 'deposit', 'transfer', 'freelance'],
    'Other': []
}

# Generate 5000 synthetic transactions
def generate_transactions(n=5000):
    transactions = []
    start_date = datetime(2025, 1, 1)
    
    for i in range(n):
        # Random date within last 12 months
        date = start_date + timedelta(days=random.randint(0, 365))
        
        # Choose random category
        category = random.choice(list(categories.keys()))
        
        # Generate description based on category
        if category != 'Other' and categories[category]:
            keyword = random.choice(categories[category])
        else:
            keyword = f"transaction_{i}"
        
        # Generate amount based on category (in INR)
        if category == 'Income':
            # Indian salary range: ₹40,000 - ₹1,00,000
            amount = random.uniform(40000, 100000)
        elif category == 'Bills & Utilities':
            # Bills: ₹500 - ₹5,000
            amount = random.uniform(500, 5000)
        elif category == 'Shopping':
            # Shopping: ₹300 - ₹8,000
            amount = random.uniform(300, 8000)
        elif category == 'Food & Dining':
            # Food: ₹100 - ₹2,000
            amount = random.uniform(100, 2000)
        elif category == 'Groceries':
            # Groceries: ₹500 - ₹5,000
            amount = random.uniform(500, 5000)
        elif category == 'Transportation':
            # Transport: ₹50 - ₹1,500
            amount = random.uniform(50, 1500)
        elif category == 'Entertainment':
            # Entertainment: ₹200 - ₹2,000
            amount = random.uniform(200, 2000)
        elif category == 'Health':
            # Health: ₹300 - ₹5,000
            amount = random.uniform(300, 5000)
        else:
            # Other: ₹100 - ₹3,000
            amount = random.uniform(100, 3000)
        
        # Make expenses negative (except income)
        if category != 'Income':
            amount = -amount
            
        transactions.append({
            'date': date.strftime('%Y-%m-%d'),
            'description': f"{keyword} #{i}",
            'amount': round(amount, 2),
            'category': category
        })
    
    return pd.DataFrame(transactions)

df = generate_transactions(5000)
df.to_csv('synthetic_transactions.csv', index=False)
print(f"Generated {len(df)} transactions in INR (₹)")
print(f"\nSample transactions:")
print(df.head(10))
print(f"\nAmount statistics:")
print(f"Total income: ₹{df[df['amount'] > 0]['amount'].sum():,.2f}")
print(f"Total expenses: ₹{abs(df[df['amount'] < 0]['amount'].sum()):,.2f}")