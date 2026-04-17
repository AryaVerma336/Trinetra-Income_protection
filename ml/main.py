# Trinetra ML Pipeline Entry Point
import generate_data
import train
import os

def run_pipeline():
    print("🚀 Starting Trinetra ML Core Pipeline...")
    
    # 1. Generate Training Data
    generate_data.generate_historical_data()
    
    # 2. Train Model
    train.train_model()
    
    print("\n" + "="*40)
    print("✅ Pipeline execution complete.")
    print("Betterment AI is now backed by a Python-trained Random Forest model.")
    print("="*40)

if __name__ == "__main__":
    run_pipeline()
