# feature_engineering.py
import pandas as pd
import numpy as np
from datetime import datetime

class FeatureEngineer:
    """Enhanced feature extraction for transaction data"""
    
    def __init__(self):
        self.category_stats = {}
        self.merchant_stats = {}
        
    def extract_merchant(self, description):
        """Extract merchant name from description"""
        # Simple extraction - take first word
        return description.lower().split()[0] if description else 'unknown'
    
    def extract_temporal_features(self, date):
        """Extract rich temporal features"""
        dt = pd.to_datetime(date)
        return {
            'day_of_month': dt.day,
            'day_of_week': dt.dayofweek,
            'is_weekend': int(dt.dayofweek >= 5),
            'is_month_start': int(dt.day <= 5),
            'is_month_end': int(dt.day >= 25),
            'week_of_month': (dt.day - 1) // 7 + 1,
            'month': dt.month,
            'quarter': dt.quarter,
            'is_holiday_season': int(dt.month in [11, 12]),  # Nov-Dec
        }
    
    def extract_amount_features(self, amount, category=None):
        """Extract features from transaction amount"""
        abs_amount = abs(amount)
        features = {
            'amount': amount,
            'abs_amount': abs_amount,
            'amount_log': np.log1p(abs_amount),  # Log transform for skewed data
            'is_round_number': int(abs_amount % 10 == 0),
            'amount_cents': abs_amount % 1,
        }
        
        # Add category-relative features if available
        if category and category in self.category_stats:
            stats = self.category_stats[category]
            features['amount_vs_category_mean'] = abs_amount / (stats['mean'] + 1e-6)
            features['amount_zscore'] = (abs_amount - stats['mean']) / (stats['std'] + 1e-6)
        
        return features
    
    def extract_description_features(self, description):
        """Extract features from transaction description"""
        desc_lower = description.lower()
        return {
            'desc_length': len(description),
            'desc_word_count': len(description.split()),
            'has_numbers': int(any(c.isdigit() for c in description)),
            'has_special_chars': int(any(c in '#*@' for c in description)),
            'merchant': self.extract_merchant(description),
        }
    
    def fit(self, df):
        """Learn statistics from training data"""
        # Category statistics
        self.category_stats = df.groupby('category')['amount'].agg([
            'mean', 'std', 'min', 'max', 'median'
        ]).to_dict('index')
        
        # Merchant statistics
        df['merchant'] = df['description'].apply(self.extract_merchant)
        self.merchant_stats = df.groupby('merchant')['amount'].agg([
            'mean', 'count'
        ]).to_dict('index')
        
        return self
    
    def transform(self, df):
        """Transform dataframe with all features"""
        features_list = []
        
        for _, row in df.iterrows():
            features = {}
            
            # Temporal features
            features.update(self.extract_temporal_features(row['date']))
            
            # Amount features
            category = row.get('category', None)
            features.update(self.extract_amount_features(row['amount'], category))
            
            # Description features
            features.update(self.extract_description_features(row['description']))
            
            # Merchant frequency (if seen during training)
            merchant = features['merchant']
            if merchant in self.merchant_stats:
                features['merchant_frequency'] = self.merchant_stats[merchant]['count']
                features['merchant_avg_amount'] = self.merchant_stats[merchant]['mean']
            else:
                features['merchant_frequency'] = 0
                features['merchant_avg_amount'] = 0
            
            features_list.append(features)
        
        return pd.DataFrame(features_list)
    
    def get_feature_matrix(self, df, exclude_cols=None):
        """Get numerical feature matrix for ML models"""
        features_df = self.transform(df)
        
        # Drop non-numeric columns
        exclude = exclude_cols or ['merchant']
        numeric_features = features_df.select_dtypes(include=[np.number])
        
        return numeric_features.values
