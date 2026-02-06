# Parkinson's Disease Datasets

This directory contains real-world Parkinson's Disease datasets used for training the ML models.

## Datasets Used

### 1. UCI Parkinson's Telemonitoring Dataset (ID: 189)
- **Source**: UCI Machine Learning Repository
- **Loaded via**: `ucimlrepo` Python package
- **Samples**: 5,875 voice recordings
- **Features**: 20+ biomedical voice measurements
- **Subjects**: 42 people (31 with PD, 11 healthy)
- **Target**: UPDRS (Unified Parkinson's Disease Rating Scale) scores
- **Collection**: Telemonitoring of motor and total UPDRS scores
- **Reference**: Athanasios Tsanas, Max A. Little, Patrick E. McSharry, Lorraine O. Ramig (2009)

**Features include**:
- Jitter (%)
- Jitter (Abs)
- Jitter:RAP
- Jitter:PPQ5
- Jitter:DDP
- Shimmer
- Shimmer (dB)
- Shimmer:APQ3
- Shimmer:APQ5
- Shimmer:APQ11
- Shimmer:DDA
- NHR (Noise-to-Harmonics Ratio)
- HNR (Harmonics-to-Noise Ratio)
- RPDE (Recurrence Period Density Entropy)
- DFA (Detrended Fluctuation Analysis)
- PPE (Pitch Period Entropy)

### 2. PD Speech Features Dataset
- **File**: `pd_speech_features.csv`
- **Source**: Istanbul University, Department of Neurology
- **Donated**: November 4, 2018
- **Samples**: 756 voice recordings from 252 subjects
  - 188 PD patients (107 male, 81 female, ages 33-87, mean 65.1±10.9)
  - 64 healthy controls (23 male, 41 female, ages 41-82, mean 61.1±8.9)
- **Features**: 754 acoustic features
- **Recording**: Sustained phonation of vowel /a/ at 44.1 KHz, 3 repetitions per subject
- **Binary Classification**: 0 = Healthy, 1 = Parkinson's Disease

**Feature Categories**:
1. **Baseline Features** (23 features)
   - PPE, DFA, RPDE
   - Jitter variants (local, absolute, RAP, PPQ5, DDP)
   - Shimmer variants (local, dB, APQ3, APQ5, APQ11, DDA)
   - Harmonicity measures

2. **Intensity Parameters** (3 features)
   - Min, max, mean intensity

3. **Formant Frequencies** (4 features)
   - F1, F2, F3, F4

4. **Bandwidth Parameters** (4 features)
   - B1, B2, B3, B4

5. **Vocal Fold Features** (49 features)
   - Glottal Quotient (GQ)
   - Glottal-to-Noise Excitation (GNE)
   - Vocal Fold Excitation Ratio (VFER)
   - Intrinsic Mode Functions (IMF)

6. **MFCC Features** (84 features)
   - Mean Log Energy
   - Mean MFCC coefficients (0-12)
   - Delta and Delta-Delta coefficients
   - Standard deviations

7. **Wavelet Transform Features** (182 features)
   - Energy (Ea, Ed)
   - Entropy (Shannon, Log)
   - TKEO (Teager-Kaiser Energy Operator)
   - Detail and Approximation coefficients

8. **TQWT Features** (432 features)
   - Tunable Q-Factor Wavelet Transform
   - Energy, Entropy (Shannon, Log)
   - TKEO statistics
   - Statistical measures (median, mean, std, min, max, skewness, kurtosis)
   - 36 decomposition levels each

## Training Configuration

The training script (`backend/training/train_models.py`) combines both datasets:

1. **Primary Training**: PD Speech Features dataset (754 features, 756 samples)
2. **Validation/Augmentation**: UCI Telemonitoring dataset for additional validation

**Data Preprocessing**:
- Missing values handled via forward/backward fill
- StandardScaler normalization
- 80/20 train-test split with stratification
- Binary classification: 0 = Healthy, 1 = Parkinson's Disease

**Models Trained**:
1. **LightGBM Classifier**
   - 150 estimators
   - L1/L2 regularization
   - Max depth: 7
   - Subsample: 0.8
   
2. **LSTM Neural Network**
   - 3 LSTM layers (256 → 128 → 64 units)
   - Dropout regularization (0.3-0.4)
   - Dense layers with ReLU activation
   - Binary cross-entropy loss
   - Early stopping (patience=15)

## Usage

To retrain models with these datasets:

```bash
# Install dependencies
pip install ucimlrepo pandas

# Run training script
python backend/training/train_models.py
```

The script will:
1. Fetch UCI dataset automatically via `ucimlrepo`
2. Load `pd_speech_features.csv` from this directory
3. Preprocess and combine datasets
4. Train both LightGBM and LSTM models
5. Save trained models to `backend/models/`
6. Display accuracy metrics and classification reports

## References

1. **UCI Parkinson's Telemonitoring**:
   - Tsanas, A., Little, M.A., McSharry, P.E., Ramig, L.O. (2009)
   - "Accurate telemonitoring of Parkinson's disease progression by non-invasive speech tests"
   - IEEE Transactions on Biomedical Engineering

2. **PD Speech Features**:
   - Istanbul University, Cerrahpaşa Faculty of Medicine
   - Department of Neurology
   - Various speech signal processing algorithms: Time-Frequency, MFCC, Wavelet, Vocal Fold, TQWT

## License

These datasets are used for research and educational purposes. Please cite the original sources when using them in publications.
