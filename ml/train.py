# Trinetra ML Pipeline Entry Point
# Trains a Random Forest Classifier for Parametric Risk Evaluation.
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import os

def train_model():
    if not os.path.exists('artifacts/historical_data.csv'):
        print("❌ Error: historical_data.csv not found. Run generate_data.py first.")
        return

    print("Loading data and training Random Forest model...")
    df = pd.read_csv('artifacts/historical_data.csv')
    
    X = df[['temp', 'rain', 'wind', 'aqi', 'uptime']]
    y = df['risk_event']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluation
    predictions = model.predict(X_test)
    print("\nModel Performance Summary:")
    print(classification_report(y_test, predictions))
    
    # Save Model
    joblib.dump(model, 'artifacts/trinetra_risk_model.joblib')
    print("✅ Model serialized to artifacts/trinetra_risk_model.joblib")

if __name__ == "__main__":
    train_model()
