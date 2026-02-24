# train_all_models.py
"""
Quick script to train all models for the hackathon
Run this once to generate all .pkl files
"""

import pandas as pd
import time
import sys

def train_all():
    print("="*70)
    print("MONEYMIND AI - MODEL TRAINING PIPELINE")
    print("="*70)
    
    # Check if data exists
    try:
        df = pd.read_csv('synthetic_transactions.csv')
        print(f"\n✓ Loaded {len(df)} transactions")
    except FileNotFoundError:
        print("\n✗ synthetic_transactions.csv not found!")
        print("  Run data_generator.py first to create training data")
        sys.exit(1)
    
    # 1. Train Expense Classifier
    print("\n" + "-"*70)
    print("1. TRAINING EXPENSE CLASSIFIER")
    print("-"*70)
    start = time.time()
    
    try:
        from expense_classifier_v2 import ImprovedExpenseClassifier
        classifier = ImprovedExpenseClassifier()
        classifier.train(df, use_smote=True)
        print(f"✓ Classifier trained in {time.time() - start:.2f}s")
    except Exception as e:
        print(f"✗ Classifier training failed: {e}")
    
    # 2. Train Anomaly Detector
    print("\n" + "-"*70)
    print("2. TRAINING ANOMALY DETECTOR")
    print("-"*70)
    start = time.time()
    
    try:
        from anomaly_detector_v2 import ImprovedAnomalyDetector
        detector = ImprovedAnomalyDetector(contamination=0.05)
        detector.train(df)
        print(f"✓ Anomaly detector trained in {time.time() - start:.2f}s")
    except Exception as e:
        print(f"✗ Anomaly detector training failed: {e}")
    
    # 3. Train Forecaster
    print("\n" + "-"*70)
    print("3. TRAINING SPENDING FORECASTER")
    print("-"*70)
    start = time.time()
    
    try:
        from spending_forecaster_v2 import ImprovedSpendingForecaster
        forecaster = ImprovedSpendingForecaster()
        forecaster.train_sarimax(df)
        print(f"✓ Forecaster trained in {time.time() - start:.2f}s")
    except Exception as e:
        print(f"✗ Forecaster training failed: {e}")
    
    print("\n" + "="*70)
    print("TRAINING COMPLETE!")
    print("="*70)
    print("\nGenerated model files:")
    print("  • expense_classifier.pkl")
    print("  • tfidf_vectorizer.pkl")
    print("  • anomaly_detector.pkl")
    print("  • feature_engineer.pkl")
    print("  • category_stats.pkl")
    print("  • merchant_stats.pkl")
    print("  • sarimax_model.pkl (or ets_model.pkl)")
    print("\nYou can now run: python ml_api_v2.py")
    print("API will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")

if __name__ == "__main__":
    train_all()
