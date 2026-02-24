# expense_classifier_v2.py
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import SMOTE
import joblib
import warnings
warnings.filterwarnings('ignore')

class ImprovedExpenseClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            max_features=500,  # Reduced for faster training
            ngram_range=(1, 2),  # Include bigrams for better context
            stop_words='english',
            min_df=2  # Ignore very rare terms
        )
        
        self.clf = RandomForestClassifier(
            n_estimators=200,  # More trees for better performance
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',  # Handle imbalance
            random_state=42,
            n_jobs=-1  # Use all CPU cores
        )
        
        self.label_encoder = None
        self.class_weights = None
        
    def train(self, df, use_smote=True):
        """Train with class imbalance handling"""
        X = df['description']
        y = df['category']
        
        # Check class distribution
        print("Class distribution:")
        print(y.value_counts())
        
        # Vectorize text
        X_vectorized = self.vectorizer.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_vectorized, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Apply SMOTE for minority class oversampling (optional)
        if use_smote and len(y.unique()) > 2:
            try:
                smote = SMOTE(random_state=42, k_neighbors=3)
                X_train, y_train = smote.fit_resample(X_train, y_train)
                print(f"\nAfter SMOTE: {len(y_train)} samples")
            except Exception as e:
                print(f"SMOTE failed: {e}. Continuing without it.")
        
        # Train model
        print("\nTraining classifier...")
        self.clf.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.clf.predict(X_test)
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Cross-validation score
        cv_scores = cross_val_score(self.clf, X_train, y_train, cv=3, scoring='f1_weighted')
        print(f"\nCross-validation F1 scores: {cv_scores}")
        print(f"Mean CV F1: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
        
        # Save models
        joblib.dump(self.clf, 'expense_classifier.pkl')
        joblib.dump(self.vectorizer, 'tfidf_vectorizer.pkl')
        
        return self
    
    def predict(self, description):
        """Predict category for a single description"""
        desc_vectorized = self.vectorizer.transform([description])
        category = self.clf.predict(desc_vectorized)[0]
        
        # Get prediction confidence
        probabilities = self.clf.predict_proba(desc_vectorized)[0]
        confidence = probabilities.max()
        
        # Get top 3 predictions
        top_3_idx = probabilities.argsort()[-3:][::-1]
        top_3_categories = [(self.clf.classes_[i], probabilities[i]) for i in top_3_idx]
        
        return {
            'category': category,
            'confidence': float(confidence),
            'top_3': top_3_categories
        }
    
    def get_feature_importance(self, top_n=20):
        """Get most important words for classification"""
        feature_names = self.vectorizer.get_feature_names_out()
        importances = self.clf.feature_importances_
        
        indices = importances.argsort()[-top_n:][::-1]
        top_features = [(feature_names[i], importances[i]) for i in indices]
        
        return top_features

# Train the improved model
if __name__ == "__main__":
    df = pd.read_csv('synthetic_transactions.csv')
    
    classifier = ImprovedExpenseClassifier()
    classifier.train(df, use_smote=True)
    
    # Test predictions
    test_descriptions = [
        "ola ride to office",
        "swiggy dinner order",
        "flipkart electronics",
        "electricity bill payment"
    ]
    
    print("\n" + "="*50)
    print("Test Predictions:")
    print("="*50)
    for desc in test_descriptions:
        result = classifier.predict(desc)
        print(f"\nDescription: {desc}")
        print(f"Category: {result['category']} (confidence: {result['confidence']:.2%})")
        print(f"Top 3: {result['top_3']}")
    
    # Show important features
    print("\n" + "="*50)
    print("Top 20 Important Features:")
    print("="*50)
    for feature, importance in classifier.get_feature_importance(20):
        print(f"{feature}: {importance:.4f}")
