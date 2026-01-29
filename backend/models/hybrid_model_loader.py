from typing import List, Dict, Any
import os
import logging
import numpy as np

try:
    import joblib
except Exception:
    joblib = None

try:
    from tensorflow.keras.models import load_model
except Exception:
    load_model = None


class HybridModel:
    """Hybrid model loader that combines LightGBM and a deep model.

    If model files are not available this class will return a dummy prediction
    so the service can be run and extended.
    """

    def __init__(self, ml_path: str = None, deep_path: str = None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.ml_path = ml_path or os.path.join(base_dir, "lightgbm_model.pkl")
        self.deep_path = deep_path or os.path.join(base_dir, "lstm_attention_model.h5")
        self.lightgbm_model = None
        self.lstm_model = None
        self._load_models()

    def _load_models(self):
        if joblib and os.path.exists(self.ml_path):
            try:
                self.lightgbm_model = joblib.load(self.ml_path)
            except Exception:
                logging.exception("Failed to load LightGBM model")

        if load_model and os.path.exists(self.deep_path):
            try:
                self.lstm_model = load_model(self.deep_path)
            except Exception:
                logging.exception("Failed to load deep LSTM model")

    def predict(self, features: List[float], lgbm_weight: float = 0.5, lstm_weight: float = 0.5) -> Dict[str, Any]:
        """Return a combined probability and label.
        
        lgbm_weight and lstm_weight are used to balance the ensemble.
        """
        ml_pred = 0.5
        deep_pred = 0.5

        x = np.array(features, dtype=float)

        if self.lightgbm_model is not None:
            try:
                ml_pred = float(self.lightgbm_model.predict_proba([x])[0][1])
            except Exception:
                logging.exception("LightGBM predict failed, using fallback 0.5")

        if self.lstm_model is not None:
            try:
                deep_pred = float(self.lstm_model.predict(np.expand_dims(x, axis=0))[0][0])
            except Exception:
                logging.exception("LSTM predict failed, using fallback 0.5")

        total_weight = lgbm_weight + lstm_weight
        if total_weight > 0:
            w1 = lgbm_weight / total_weight
            w2 = lstm_weight / total_weight
            final_score = (ml_pred * w1) + (deep_pred * w2)
        else:
            final_score = (ml_pred + deep_pred) / 2.0
            
        label = "PD_likely" if final_score > 0.5 else "PD_unlikely"

        # Interpretability metadata (indices mapping to feature importance)
        important_features = {
            "MFCC 1": float(abs(x[0])),
            "Jitter": float(abs(x[78])),
            "Shimmer": float(abs(x[79])),
            "HNR": float(abs(x[80])),
            "Spectral Contrast": float(abs(x[81]))
        }
        
        # Sort and take top 5 for "SHAP" visualization
        shap_mock = sorted([{"name": k, "value": v} for k, v in important_features.items()], key=lambda x: x["value"], reverse=True)

        return {
            "probability": float(final_score),
            "label": label,
            "models": {
                "lightgbm": float(ml_pred),
                "lstm": float(deep_pred)
            },
            "interpretability": {
                "shap": shap_mock,
                "attention": [float(val) for val in np.random.dirichlet(np.ones(10), size=1)[0]], # Mock temporal attention
            },
            "diagnostics": {
                "jitter": float(x[78]),
                "shimmer": float(x[79]),
                "hnr": float(x[80]),
                "centroid": float(x[76])
            }
        }
