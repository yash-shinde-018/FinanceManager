# anomaly_detector_v2.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from feature_engineering import FeatureEngineer
import joblib
import json

class ImprovedAnomalyDetector:
    def __init__(self, contamination=0.05):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=150,
            max_samples='auto',
            max_features=1.0
        )
        self.feature_engineer = FeatureEngineer()
        self.category_stats = {}
        self.merchant_stats = {}
        
    def train(self, df):
        """Train anomaly detector with enhanced features"""
        # Fit feature engineer
        self.feature_engineer.fit(df)
        
        # Store statistics for explanations
        self.category_stats = df.groupby('category')['amount'].agg([
            'mean', 'std', 'min', 'max', 'median', 'count'
        ]).to_dict('index')
        
        df['merchant'] = df['description'].apply(self.feature_engineer.extract_merchant)
        self.merchant_stats = df.groupby('merchant')['amount'].agg([
            'mean', 'std', 'count'
        ]).to_dict('index')
        
        # Extract features
        X = self.feature_engineer.get_feature_matrix(df)
        
        # Train model
        self.model.fit(X)
        
        # Save everything
        joblib.dump(self.model, 'anomaly_detector.pkl')
        joblib.dump(self.feature_engineer, 'feature_engineer.pkl')
        joblib.dump(self.category_stats, 'category_stats.pkl')
        joblib.dump(self.merchant_stats, 'merchant_stats.pkl')
        
        print(f"Trained on {len(df)} transactions")
        print(f"Feature matrix shape: {X.shape}")
        
    def predict(self, df):
        """Predict anomalies with scores"""
        X = self.feature_engineer.get_feature_matrix(df)
        predictions = self.model.predict(X)
        scores = self.model.score_samples(X)  # Lower = more anomalous
        
        results = []
        for i, (pred, score) in enumerate(zip(predictions, scores)):
            is_anomaly = pred == -1
            results.append({
                'is_anomaly': is_anomaly,
                'anomaly_score': float(score),
                'severity': self._get_severity(score)
            })
        
        return results
    
    def _get_severity(self, score):
        """Convert anomaly score to severity level"""
        if score > -0.1:
            return 'normal'
        elif score > -0.2:
            return 'low'
        elif score > -0.3:
            return 'medium'
        else:
            return 'high'
    
    def explain_anomaly(self, transaction):
        """Generate detailed, actionable explanation"""
        amount = abs(transaction['amount'])
        category = transaction['category']
        description = transaction['description']
        date = pd.to_datetime(transaction['date'])
        
        merchant = self.feature_engineer.extract_merchant(description)
        
        explanations = []
        flags = []
        
        # Check category statistics
        if category in self.category_stats:
            stats = self.category_stats[category]
            mean_amount = stats['mean']
            std_amount = stats['std']
            median_amount = stats['median']
            
            # Amount-based checks
            z_score = (amount - mean_amount) / (std_amount + 1e-6)
            
            if z_score > 3:
                explanations.append(
                    f"This ₹{amount:.2f} transaction is {z_score:.1f} standard deviations "
                    f"above your typical {category} spending of ₹{mean_amount:.2f}"
                )
                flags.append('unusually_high_amount')
            elif z_score < -2:
                explanations.append(
                    f"This ₹{amount:.2f} is unusually low for {category} "
                    f"(typical: ₹{mean_amount:.2f})"
                )
                flags.append('unusually_low_amount')
            
            # Compare to median
            if amount > median_amount * 5:
                explanations.append(
                    f"Amount is 5x higher than your median {category} transaction "
                    f"(₹{median_amount:.2f})"
                )
                flags.append('extreme_outlier')
        
        # Check merchant patterns
        if merchant in self.merchant_stats:
            merchant_mean = self.merchant_stats[merchant]['mean']
            if abs(amount - merchant_mean) > merchant_mean * 2:
                explanations.append(
                    f"This amount differs significantly from your usual spending at "
                    f"{merchant} (typically ₹{merchant_mean:.2f})"
                )
                flags.append('unusual_merchant_amount')
        else:
            explanations.append(f"First time transaction with merchant: {merchant}")
            flags.append('new_merchant')
        
        # Temporal checks
        temporal_features = self.feature_engineer.extract_temporal_features(transaction['date'])
        
        if temporal_features['is_weekend'] and category in ['Bills & Utilities']:
            explanations.append("Unusual: Bill payment on weekend")
            flags.append('unusual_timing')
        
        if temporal_features['is_month_end'] and amount > 5000:
            explanations.append("Large transaction near month-end")
            flags.append('month_end_large_transaction')
        
        # Round number check (potential fraud indicator)
        if amount % 1000 == 0 and amount >= 10000:
            explanations.append(
                f"Large round number (₹{amount:.0f}) - verify this is legitimate"
            )
            flags.append('suspicious_round_number')
        
        # Default explanation if nothing specific found
        if not explanations:
            explanations.append(
                f"Transaction pattern deviates from your normal behavior based on "
                f"multiple factors (amount, timing, merchant)"
            )
            flags.append('general_anomaly')
        
        return {
            'explanations': explanations,
            'flags': flags,
            'details': {
                'amount': amount,
                'category': category,
                'merchant': merchant,
                'date': date.strftime('%Y-%m-%d'),
                'day_of_week': date.strftime('%A'),
                'category_mean': self.category_stats.get(category, {}).get('mean', 0),
                'category_median': self.category_stats.get(category, {}).get('median', 0)
            }
        }

# Example usage
if __name__ == "__main__":
    # Load training data
    df = pd.read_csv('synthetic_transactions.csv')
    
    # Train detector
    detector = ImprovedAnomalyDetector(contamination=0.05)
    detector.train(df)
    
    # Test on anomalous transactions
    test_transactions = pd.DataFrame([
        {
            'date': '2026-02-21',
            'description': 'flipkart purchase',
            'amount': -45999.99,
            'category': 'Shopping'
        },
        {
            'date': '2026-02-21',
            'description': 'swiggy biryani',
            'amount': -450.50,
            'category': 'Food & Dining'
        },
        {
            'date': '2026-02-22',
            'description': 'electricity bill',
            'amount': -8500.00,
            'category': 'Bills & Utilities'
        }
    ])
    
    # Predict
    results = detector.predict(test_transactions)
    
    print("\n" + "="*70)
    print("ANOMALY DETECTION RESULTS")
    print("="*70)
    
    for i, (_, transaction) in enumerate(test_transactions.iterrows()):
        result = results[i]
        print(f"\nTransaction {i+1}: {transaction['description']} - ${abs(transaction['amount']):.2f}")
        print(f"Anomaly: {result['is_anomaly']} | Severity: {result['severity']} | Score: {result['anomaly_score']:.3f}")
        
        if result['is_anomaly']:
            explanation = detector.explain_anomaly(transaction)
            print("\nExplanations:")
            for exp in explanation['explanations']:
                print(f"  • {exp}")
            print(f"\nFlags: {', '.join(explanation['flags'])}")
