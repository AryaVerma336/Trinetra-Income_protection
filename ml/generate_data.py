# Trinetra ML Model Training
# Trains a Random Forest Classifier for Parametric Risk Evaluation.
import pandas as pd
import numpy as np
import os

def generate_historical_data():
    print("Generating synthetic gig-worker insurance data...")
    num_samples = 1000
    
    # 1. Environment Features
    temp = np.random.uniform(20, 48, num_samples)
    rain = np.random.uniform(0, 30, num_samples)
    wind = np.random.uniform(5, 60, num_samples)
    aqi = np.random.uniform(10, 450, num_samples)
    platform_uptime = np.random.uniform(0.7, 1.0, num_samples)
    
    # 2. Risk Evaluation (Target Variable)
    # Risk increases with high rain, extreme heat, and high AQI
    risk_score = (
        (rain > 12).astype(int) * 0.4 + 
        (temp > 42).astype(int) * 0.3 + 
        (aqi > 250).astype(int) * 0.3 + 
        (platform_uptime < 0.85).astype(int) * 0.2
    )
    # Clip and binarize
    risk_event = (risk_score > 0.5).astype(int)
    
    df = pd.DataFrame({
        'temp': temp,
        'rain': rain,
        'wind': wind,
        'aqi': aqi,
        'uptime': platform_uptime,
        'risk_event': risk_event
    })
    
    os.makedirs('artifacts', exist_ok=True)
    df.to_csv('artifacts/historical_data.csv', index=False)
    print(f"✅ Generated {num_samples} samples in artifacts/historical_data.csv")

if __name__ == "__main__":
    generate_historical_data()
