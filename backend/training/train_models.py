import os
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import lightgbm as lgb
from ucimlrepo import fetch_ucirepo

# Configuration
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load Real Parkinson's Datasets
print("Loading real Parkinson's datasets...")

# Dataset 1: UCI Parkinson's Telemonitoring Dataset (Optional)
X_uci = None
y_uci_binary = None
try:
    print("Fetching UCI Parkinson's Telemonitoring dataset (ID: 189)...")
    parkinsons_telemonitoring = fetch_ucirepo(id=189)
    X_uci = parkinsons_telemonitoring.data.features
    y_uci = parkinsons_telemonitoring.data.targets

    # Convert UCI target to binary (0=healthy, 1=PD)
    # The telemonitoring dataset has motor_UPDRS and total_UPDRS scores
    # Higher scores indicate more severe Parkinson's symptoms
    # We'll use total_UPDRS > 30 as threshold for PD classification
    if 'total_UPDRS' in y_uci.columns:
        y_uci_binary = (y_uci['total_UPDRS'] > 30).astype(int)
    elif 'motor_UPDRS' in y_uci.columns:
        y_uci_binary = (y_uci['motor_UPDRS'] > 25).astype(int)
    else:
        y_uci_binary = (y_uci.iloc[:, 0] > y_uci.iloc[:, 0].median()).astype(int)

    print(f"UCI dataset shape: {X_uci.shape}")
    print(f"UCI labels: {y_uci_binary.value_counts().to_dict()}")
except Exception as e:
    print(f"Warning: Could not fetch UCI dataset: {e}")
    print("Continuing with PD Speech Features dataset only...")

# Dataset 2: PD Speech Features Dataset
print("Loading PD Speech Features dataset...")
csv_path = os.path.join(DATASETS_DIR, "pd_speech_features.csv")
pd_speech_df = pd.read_csv(csv_path, skiprows=[0])  # Skip first description row

# Last column 'class' is the label (0=healthy, 1=PD)
y_speech = pd_speech_df['class'].astype(int)
X_speech = pd_speech_df.drop(columns=['class', 'id', 'gender'], errors='ignore').apply(pd.to_numeric, errors='coerce')

# Handle missing values by forward fill then backward fill
X_speech = X_speech.fillna(method='ffill').fillna(method='bfill')

print(f"PD Speech dataset shape: {X_speech.shape}")
print(f"PD Speech labels: {y_speech.value_counts().to_dict()}")

# Standardize feature counts - use feature selection or padding
# We'll use the larger feature set and add selected features from UCI
print("\nCombining datasets...")

# For simplicity, we'll train on the PD Speech dataset (754 features) which is more comprehensive
# and use UCI dataset for validation/augmentation
X = X_speech.values
y = y_speech.values
n_features = X.shape[1]

print(f"Final combined dataset shape: {X.shape}")
print(f"Feature count: {n_features}")
print(f"Label distribution: PD={np.sum(y==1)}, Healthy={np.sum(y==0)}")

# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"\nTrain set: {X_train.shape}, Test set: {X_test.shape}")
print(f"Train labels: PD={np.sum(y_train==1)}, Healthy={np.sum(y_train==0)}")
print(f"Test labels: PD={np.sum(y_test==1)}, Healthy={np.sum(y_test==0)}")

# Scale Data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save Scaler
scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
joblib.dump(scaler, scaler_path)
print(f"Scaler saved to {scaler_path}")

# --- Train LightGBM ---
print("\nTraining LightGBM with real Parkinson's data...")
# Adding regularization to prevent overfitting
lgb_clf = lgb.LGBMClassifier(
    n_estimators=150,
    learning_rate=0.05,
    num_leaves=31,
    max_depth=7,
    reg_alpha=0.1,  # L1 regularization
    reg_lambda=0.1, # L2 regularization
    min_child_samples=20,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbose=-1
)
lgb_clf.fit(X_train_scaled, y_train)
lgb_pred = lgb_clf.predict(X_test_scaled)
lgb_acc = accuracy_score(y_test, lgb_pred)
print(f"LightGBM Test Accuracy: {lgb_acc:.4f}")
print("LightGBM Classification Report:")
print(classification_report(y_test, lgb_pred, target_names=['Healthy', 'Parkinson\'s']))

# Save LightGBM
lgb_path = os.path.join(MODEL_DIR, "lightgbm_model.pkl")
joblib.dump(lgb_clf, lgb_path)
print(f"LightGBM model saved to {lgb_path}")


# --- Train LSTM (Deep Learning) ---
print("\nTraining LSTM with real Parkinson's data...")

# Reshape for LSTM: (samples, time_steps, features)
X_train_reshape = X_train_scaled.reshape((X_train_scaled.shape[0], 1, n_features))
X_test_reshape = X_test_scaled.reshape((X_test_scaled.shape[0], 1, n_features))

model = Sequential()
model.add(Input(shape=(1, n_features)))
# Increased units and added Dropout for regularization
model.add(LSTM(256, return_sequences=True)) 
model.add(Dropout(0.4))
model.add(LSTM(128, return_sequences=True))
model.add(Dropout(0.3))
model.add(LSTM(64))
model.add(Dropout(0.3))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid'))

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.summary()

# Early stopping to prevent overfitting
early_stop = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True, verbose=1)

model.fit(
    X_train_reshape, y_train,
    epochs=100,
    batch_size=32,
    validation_split=0.2,
    callbacks=[early_stop],
    verbose=1
)

loss, acc = model.evaluate(X_test_reshape, y_test, verbose=0)
print(f"\nLSTM Test Accuracy: {acc:.4f}")
print(f"LSTM Test Loss: {loss:.4f}")

# Predict and show classification report
lstm_pred_probs = model.predict(X_test_reshape, verbose=0)
lstm_pred = (lstm_pred_probs > 0.5).astype(int).flatten()
print("\nLSTM Classification Report:")
print(classification_report(y_test, lstm_pred, target_names=['Healthy', 'Parkinson\'s']))

# Save LSTM
lstm_path = os.path.join(MODEL_DIR, "lstm_attention_model.h5")
model.save(lstm_path)
print(f"LSTM model saved to {lstm_path}")

print("\n" + "="*60)
print("✓ Training Complete!")
print("="*60)
print(f"Models trained on {len(X)} real Parkinson's disease samples")
print(f"Feature dimension: {n_features}")
print(f"LightGBM Accuracy: {lgb_acc:.4f}")
print(f"LSTM Accuracy: {acc:.4f}")
print("="*60)
