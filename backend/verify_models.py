import sys
import os

# Ensure backend package is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.hybrid_model_loader import HybridModel
import numpy as np

try:
    model = HybridModel()
    print("Model initialized")
    if model.lightgbm_model is not None:
        print("LightGBM loaded: YES")
    else:
        print("LightGBM loaded: NO")
        
    if model.lstm_model is not None:
        print("LSTM loaded: YES")
    else:
        print("LSTM loaded: NO")
        
    # Test Prediction
    features = np.random.rand(26).tolist()
    res = model.predict(features)
    print("Prediction result:", res)
    
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
