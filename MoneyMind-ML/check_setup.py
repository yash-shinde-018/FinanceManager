# check_setup.py
"""
Quick setup checker for hackathon
Verifies all dependencies and models are ready
"""

import sys
import os

def check_dependencies():
    """Check if all required packages are installed"""
    print("="*70)
    print("CHECKING DEPENDENCIES")
    print("="*70)
    
    required_packages = [
        ('pandas', 'pandas'),
        ('numpy', 'numpy'),
        ('sklearn', 'scikit-learn'),
        ('joblib', 'joblib'),
        ('statsmodels', 'statsmodels'),
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('pydantic', 'pydantic'),
    ]
    
    optional_packages = [
        ('prophet', 'prophet'),
        ('imblearn', 'imbalanced-learn'),
    ]
    
    missing = []
    
    for module, package in required_packages:
        try:
            __import__(module)
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} - MISSING")
            missing.append(package)
    
    print("\nOptional packages:")
    for module, package in optional_packages:
        try:
            __import__(module)
            print(f"✓ {package}")
        except ImportError:
            print(f"⚠ {package} - not installed (optional)")
    
    if missing:
        print(f"\n❌ Missing {len(missing)} required packages!")
        print("Run: pip install -r requirements.txt")
        return False
    else:
        print("\n✅ All required dependencies installed!")
        return True

def check_data():
    """Check if training data exists"""
    print("\n" + "="*70)
    print("CHECKING DATA")
    print("="*70)
    
    if os.path.exists('synthetic_transactions.csv'):
        import pandas as pd
        df = pd.read_csv('synthetic_transactions.csv')
        print(f"✓ synthetic_transactions.csv found ({len(df)} transactions)")
        
        # Check data quality
        required_cols = ['date', 'description', 'amount', 'category']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            print(f"✗ Missing columns: {missing_cols}")
            return False
        else:
            print(f"✓ All required columns present")
            print(f"  Categories: {df['category'].nunique()}")
            print(f"  Date range: {df['date'].min()} to {df['date'].max()}")
            return True
    else:
        print("✗ synthetic_transactions.csv not found")
        print("Run: python data_generator.py")
        return False

def check_models():
    """Check if trained models exist"""
    print("\n" + "="*70)
    print("CHECKING MODELS")
    print("="*70)
    
    required_models = [
        'expense_classifier.pkl',
        'tfidf_vectorizer.pkl',
    ]
    
    optional_models = [
        'anomaly_detector.pkl',
        'feature_engineer.pkl',
        'category_stats.pkl',
        'merchant_stats.pkl',
        'sarimax_model.pkl',
        'ets_model.pkl',
    ]
    
    missing = []
    
    for model in required_models:
        if os.path.exists(model):
            size = os.path.getsize(model) / 1024  # KB
            print(f"✓ {model} ({size:.1f} KB)")
        else:
            print(f"✗ {model} - MISSING")
            missing.append(model)
    
    print("\nOptional models:")
    for model in optional_models:
        if os.path.exists(model):
            size = os.path.getsize(model) / 1024  # KB
            print(f"✓ {model} ({size:.1f} KB)")
        else:
            print(f"⚠ {model} - not found")
    
    if missing:
        print(f"\n❌ Missing {len(missing)} required models!")
        print("Run: python train_all_models.py")
        return False
    else:
        print("\n✅ All required models found!")
        return True

def check_code_files():
    """Check if all code files exist"""
    print("\n" + "="*70)
    print("CHECKING CODE FILES")
    print("="*70)
    
    required_files = [
        'feature_engineering.py',
        'expense_classifier_v2.py',
        'anomaly_detector_v2.py',
        'spending_forecaster_v2.py',
        'ml_api_v2.py',
        'train_all_models.py',
        'test_models.py',
    ]
    
    missing = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            print(f"✗ {file} - MISSING")
            missing.append(file)
    
    if missing:
        print(f"\n❌ Missing {len(missing)} code files!")
        return False
    else:
        print("\n✅ All code files present!")
        return True

def test_quick_import():
    """Try importing the modules"""
    print("\n" + "="*70)
    print("TESTING IMPORTS")
    print("="*70)
    
    tests = [
        ('feature_engineering', 'FeatureEngineer'),
        ('expense_classifier_v2', 'ImprovedExpenseClassifier'),
        ('anomaly_detector_v2', 'ImprovedAnomalyDetector'),
        ('spending_forecaster_v2', 'ImprovedSpendingForecaster'),
    ]
    
    failed = []
    
    for module, class_name in tests:
        try:
            mod = __import__(module)
            cls = getattr(mod, class_name)
            print(f"✓ {module}.{class_name}")
        except Exception as e:
            print(f"✗ {module}.{class_name} - {str(e)[:50]}")
            failed.append(module)
    
    if failed:
        print(f"\n❌ {len(failed)} imports failed!")
        return False
    else:
        print("\n✅ All imports successful!")
        return True

def main():
    print("\n" + "="*70)
    print("MONEYMIND AI - SETUP CHECKER")
    print("="*70)
    
    results = {
        'dependencies': check_dependencies(),
        'data': check_data(),
        'code': check_code_files(),
        'imports': test_quick_import(),
        'models': check_models(),
    }
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check.upper():<20} {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n" + "="*70)
        print("🎉 ALL CHECKS PASSED - READY FOR HACKATHON!")
        print("="*70)
        print("\nNext steps:")
        print("1. python ml_api_v2.py          # Start API")
        print("2. python test_models.py api    # Test endpoints")
        print("3. Open http://localhost:8000/docs")
        print("\nGood luck! 🚀")
    else:
        print("\n" + "="*70)
        print("⚠️  SETUP INCOMPLETE")
        print("="*70)
        print("\nFix the issues above, then:")
        
        if not results['dependencies']:
            print("→ pip install -r requirements.txt")
        if not results['data']:
            print("→ python data_generator.py")
        if not results['models']:
            print("→ python train_all_models.py")
        
        print("\nThen run: python check_setup.py")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())