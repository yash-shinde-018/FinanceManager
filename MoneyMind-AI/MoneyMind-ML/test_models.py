# test_models.py
"""
Quick test script to verify all models work correctly
"""

import pandas as pd
import requests
import json

def test_models_locally():
    """Test models without API"""
    print("="*70)
    print("TESTING MODELS LOCALLY")
    print("="*70)
    
    # Test data
    test_transactions = pd.DataFrame([
        {
            'date': '2026-02-21',
            'description': 'swiggy order biryani',
            'amount': -450.00,
            'category': 'Food & Dining'
        },
        {
            'date': '2026-02-21',
            'description': 'flipkart electronics purchase',
            'amount': -45999.99,
            'category': 'Shopping'
        },
        {
            'date': '2026-02-22',
            'description': 'ola ride to airport',
            'amount': -850.00,
            'category': 'Transportation'
        }
    ])
    
    # Test Classifier
    print("\n1. TESTING EXPENSE CLASSIFIER")
    print("-"*70)
    try:
        from expense_classifier_v2 import ImprovedExpenseClassifier
        import joblib
        
        classifier = ImprovedExpenseClassifier()
        classifier.clf = joblib.load('expense_classifier.pkl')
        classifier.vectorizer = joblib.load('tfidf_vectorizer.pkl')
        
        for _, tx in test_transactions.iterrows():
            result = classifier.predict(tx['description'])
            print(f"\nDescription: {tx['description']}")
            print(f"Predicted: {result['category']} (confidence: {result['confidence']:.2%})")
            print(f"Top 3: {result['top_3'][:3]}")
        
        print("\n✓ Classifier working!")
    except Exception as e:
        print(f"\n✗ Classifier test failed: {e}")
    
    # Test Anomaly Detector
    print("\n2. TESTING ANOMALY DETECTOR")
    print("-"*70)
    try:
        from anomaly_detector_v2 import ImprovedAnomalyDetector
        import joblib
        
        detector = ImprovedAnomalyDetector()
        detector.model = joblib.load('anomaly_detector.pkl')
        detector.feature_engineer = joblib.load('feature_engineer.pkl')
        detector.category_stats = joblib.load('category_stats.pkl')
        detector.merchant_stats = joblib.load('merchant_stats.pkl')
        
        results = detector.predict(test_transactions)
        
        for i, (_, tx) in enumerate(test_transactions.iterrows()):
            result = results[i]
            print(f"\nTransaction: {tx['description']} - ${abs(tx['amount']):.2f}")
            print(f"Anomaly: {result['is_anomaly']} | Severity: {result['severity']}")
            
            if result['is_anomaly']:
                explanation = detector.explain_anomaly(tx)
                print("Reasons:")
                for exp in explanation['explanations'][:2]:
                    print(f"  • {exp}")
        
        print("\n✓ Anomaly detector working!")
    except Exception as e:
        print(f"\n✗ Anomaly detector test failed: {e}")
    
    # Test Forecaster
    print("\n3. TESTING SPENDING FORECASTER")
    print("-"*70)
    try:
        from spending_forecaster_v2 import ImprovedSpendingForecaster
        import joblib
        
        forecaster = ImprovedSpendingForecaster()
        
        if joblib.os.path.exists('sarimax_model.pkl'):
            forecaster.sarimax_model = joblib.load('sarimax_model.pkl')
            df = pd.read_csv('synthetic_transactions.csv')
            forecaster.daily_spending = forecaster.prepare_time_series(df)
            
            forecast = forecaster.forecast(7)
            
            print("\nNext 7 days forecast:")
            for i in range(7):
                date = forecast['dates'][i]
                value = forecast['forecast'][i]
                print(f"{date.strftime('%Y-%m-%d')}: ${value:.2f}")
            
            print(f"\nTotal predicted (7 days): ${forecast['forecast'].sum():.2f}")
            print(f"Model: {forecast['model']}")
            
            print("\n✓ Forecaster working!")
        else:
            print("\n⚠ No forecaster model found (sarimax_model.pkl)")
    
    except Exception as e:
        print(f"\n✗ Forecaster test failed: {e}")

def test_api():
    """Test API endpoints"""
    print("\n" + "="*70)
    print("TESTING API ENDPOINTS")
    print("="*70)
    print("\nMake sure API is running: python ml_api_v2.py")
    print("Testing at: http://localhost:8000")
    
    base_url = "http://localhost:8000"
    
    # Test health
    print("\n1. Testing /health")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        print("  Make sure API is running!")
        return
    
    # Test categorization
    print("\n2. Testing /categorize")
    try:
        transaction = {
            "date": "2026-02-21",
            "description": "swiggy biryani order",
            "amount": -450.50
        }
        response = requests.post(f"{base_url}/categorize", json=transaction, timeout=5)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Category: {result['category']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Is Anomaly: {result['is_anomaly']}")
    except Exception as e:
        print(f"✗ Categorization test failed: {e}")
    
    # Test insights
    print("\n3. Testing /insights")
    try:
        response = requests.get(f"{base_url}/insights", timeout=10)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Generated {len(result['insights'])} insights")
        for insight in result['insights'][:3]:
            print(f"  • [{insight['type']}] {insight['message']}")
    except Exception as e:
        print(f"✗ Insights test failed: {e}")
    
    print("\n✓ API tests complete!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "api":
        test_api()
    else:
        test_models_locally()
        print("\n" + "="*70)
        print("To test API endpoints, run: python test_models.py api")
        print("="*70)
