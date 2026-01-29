import os
import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import lightgbm as lgb
from sklearn.datasets import make_classification

# Configuration
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Generate Synthetic Data (Replace with real data loading)
# 95 features as per latest preprocess_utils.py (MFCC, Deltas, Chroma, Centroid, Jitter, Shimmer, HNR, Contrast)
print("Generating synthetic data...")
n_features = 95
X, y = make_classification(n_samples=1000, n_features=n_features, n_informative=60, n_redundant=15, random_state=42)

# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale Data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save Scaler (Optional but recommended for production to ensure same scaling)
joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

# --- Train LightGBM ---
print("Training LightGBM...")
# Adding regularization to prevent overfitting
lgb_clf = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.05,
    num_leaves=31,
    reg_alpha=0.1,  # L1 regularization
    reg_lambda=0.1, # L2 regularization
    random_state=42
)
lgb_clf.fit(X_train_scaled, y_train)
lgb_pred = lgb_clf.predict(X_test_scaled)
print("LightGBM Accuracy:", accuracy_score(y_test, lgb_pred))
print(classification_report(y_test, lgb_pred))

# Save LightGBM
joblib.dump(lgb_clf, os.path.join(MODEL_DIR, "lightgbm_model.pkl"))


# --- Train LSTM (Deep Learning) ---
print("Training LSTM...")

# Reshape for LSTM: (samples, time_steps, features)
X_train_reshape = X_train_scaled.reshape((X_train_scaled.shape[0], 1, n_features))
X_test_reshape = X_test_scaled.reshape((X_test_scaled.shape[0], 1, n_features))

model = Sequential()
model.add(Input(shape=(1, n_features)))
# Increased units and added Dropout for regularization
model.add(LSTM(128, return_sequences=True)) 
model.add(Dropout(0.3))
model.add(LSTM(64))
model.add(Dropout(0.3))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid'))

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Early stopping to prevent overfitting
early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(
    X_train_reshape, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    callbacks=[early_stop],
    verbose=1
)

loss, acc = model.evaluate(X_test_reshape, y_test)
print(f"LSTM Accuracy: {acc}")

# Save LSTM
model.save(os.path.join(MODEL_DIR, "lstm_attention_model.h5"))

print("Models saved successfully.")
