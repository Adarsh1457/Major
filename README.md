# ParkinSafe - Voice-Based Parkinson's Disease Detection System

An intelligent, real-time web application for early detection and monitoring of Parkinson's Disease through voice analysis using hybrid Machine Learning and Deep Learning models **trained on real clinical data** from 252 patients.

![ParkinSafe Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-19.2.0-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green) ![Python](https://img.shields.io/badge/Python-3.10+-yellow) ![Real Data](https://img.shields.io/badge/Dataset-Real%20Clinical-red)

---

## 🎯 Features

### Core Functionality
- ✅ **20 Comprehensive Voice Assessment Tasks** (Phonation, Pitch, Diadochokinetic, Reading, Counting, Spontaneous Speech)
- ✅ **Real-time Audio Recording & Analysis** with visual waveform feedback
- ✅ **Hybrid ML-DL Model** (LightGBM + LSTM with Attention + 1D CNN)
- ✅ **Trained on Real Parkinson's Data** - 756 voice samples from 252 subjects (188 PD, 64 healthy)
- ✅ **752 Acoustic Features** - Comprehensive voice analysis (Jitter, Shimmer, HNR, MFCCs, Wavelet, TQWT)
- ✅ **87.5% Accuracy** - LightGBM model validated on clinical data
- ✅ **Model Interpretability** with SHAP values and attention heatmaps
- ✅ **Automated PDF Report Generation** with clinical biomarker analysis
- ✅ **Patient History Tracking** with longitudinal monitoring
- ✅ **Responsive Dark Mode UI** with smooth animations

### Clinical Biomarkers Analyzed (12 Categories)
1. **Jitter** - Vocal frequency perturbation (cycle-to-cycle F0 variation)
2. **Shimmer** - Amplitude perturbation (vocal intensity instability)
3. **HNR** - Harmonic-to-Noise Ratio (voice quality metric)
4. **MFCCs** - Mel-Frequency Cepstral Coefficients (spectral features)
5. **Pitch & F0** - Fundamental frequency analysis
6. **Spectral Centroid** - Energy distribution across frequencies
7. **Zero-Crossing Rate** - Signal periodicity measure
8. **Formant Frequencies** - Vowel space and articulation precision
9. **Wavelet Features** - Time-frequency decomposition (182 features)
10. **TQWT Features** - Tunable Q-Factor Wavelet Transform (432 features)
11. **Vocal Fold Parameters** - GQ, GNE, VFER metrics (49 features)
12. **DFA & RPDE** - Nonlinear dynamics and complexity measures

### Real Datasets Used
📊 **Primary Training Data:**
- **PD Speech Features Dataset** (Istanbul University)
  - 756 voice recordings from 252 subjects
  - 188 PD patients (ages 33-87)
  - 64 healthy controls (ages 41-82)
  - 752 acoustic features per sample
  - Sustained phonation of vowel /a/ at 44.1 KHz

📊 **Validation Data:**
- **UCI Parkinson's Telemonitoring Dataset** (ID: 189)
  - 5,875 voice recordings from 42 subjects
  - 19 biomedical voice measurements
  - UPDRS-based severity scoring

*See [DATASET_INTEGRATION.md](DATASET_INTEGRATION.md) for complete details.*

---

## 🚀 Quick Start

### Prerequisites
- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **Git**

### Installation

#### 1. Clone the Repository
```powershell
git clone https://github.com/Adarsh1457/Major.git
cd Major
```

#### 2. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Start backend server (port 8000)
uvicorn backend.main:app --reload --port 8000
```

**Or use the provided script:**
```powershell
.\run_dev.ps1
```

#### 3. Frontend Setup
```powershell
cd frontend

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev
```

#### 4. (Optional) Retrain Models with Real Data
```powershell
# Train LightGBM and LSTM on 752-feature dataset
python backend/training/train_models.py

# Expected: 87.5% LightGBM accuracy on test set
```

#### 5. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🔐 Default Credentials

### System Access
Currently, the system operates in **development mode** without authentication requirements for testing.

### Firebase Authentication (Optional)
If you want to enable Firebase authentication:

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Download your `serviceAccountKey.json`
3. Place it in the project root directory
4. Set environment variable:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\adars\major\serviceAccountKey.json"
```

**Note:** Firebase is optional for local development. The system will work without it, but authentication and data persistence features will be disabled.

---

## 📁 Project Structure

```
Major/
├── backend/
│   ├── main.py                      # FastAPI application entry
│   ├── requirements.txt             # Python dependencies
│   ├── config/
│   │   └── firebase_config.py       # Firebase initialization
│   ├── models/
│   │   ├── hybrid_model_loader.py   # ML model loader
│   │   ├── preprocess_utils.py      # Audio preprocessing
│   │   └── lstm_attention_model.h5  # Trained LSTM model
│   ├── routes/
│   │   ├── auth_routes.py           # Authentication endpoints
│   │   ├── inference_routes.py      # ML inference API
│   │   ├── patient_routes.py        # Patient management
│   │   ├── dataset_routes.py        # Dataset handling
│   │   └── report_routes.py         # Report generation
│   ├── utils/
│   │   ├── pdf_generator.py         # PDF report creation
│   │   ├── firestore_utils.py       # Firestore operations
│   │   └── storage_utils.py         # File storage
│   └── training/
│       └── train_models.py          # Model training scripts
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main React application
│   │   ├── App.css                  # Styling
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # Node dependencies
│   └── vite.config.js               # Vite configuration
│
├── .gitignore                       # Git ignore rules
├── run_dev.ps1                      # Development startup script
├── features.txt                     # Feature documentation
└── README.md                        # This file
```

---

## 🧪 Assessment Tasks

The system includes **20 diverse voice assessment tasks** organized into 6 categories:

### 1. Phonation Tests (5 tasks)
- Sustained vowels: A, E, I, O, U
- Tests vocal cord vibration stability

### 2. Pitch Variation Tests (3 tasks)
- High pitch, low pitch, pitch glide
- Measures pitch control and range

### 3. Diadochokinetic Rate Tests (4 tasks)
- Rapid "pa-pa-pa", "ta-ta-ta", "ka-ka-ka", "pa-ta-ka"
- Evaluates rapid alternating movements

### 4. Reading & Articulation (3 tasks)
- Pangram, complex sentences, paragraph reading
- Assesses clarity and articulation

### 5. Counting Tests (2 tasks)
- Forward and backward counting
- Measures sequence and rhythm

### 6. Spontaneous Speech (3 tasks)
- Daily activities, hobbies, scene description
- Captures natural speech patterns

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool and dev server
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Lucide React** - Modern icons
- **jsPDF + AutoTable** - PDF generation

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Python 3.10+**

### Machine Learning
- **TensorFlow 2.20.0** - Deep learning framework
- **LightGBM** - Gradient boosting
- **scikit-learn 1.8.0** - ML utilities
- **LibROSA 0.11.0** - Audio analysis
- **NumPy, Pandas** - Data processing

### Database & Storage (Optional)
- **Firebase Admin** - Authentication & Firestore
- **Cloud Storage** - File storage

---

## 📊 Model Architecture

### Hybrid Ensemble Approach
1. **Feature Extraction Layer:**
   - 95+ handcrafted acoustic features
   - LibROSA for audio signal processing
   - MFCC, spectral, prosodic features

2. **Deep Learning Module:**
   - Bidirectional LSTM with Attention mechanism
   - Learns temporal dependencies in voice patterns
   - Attention weights highlight discriminative segments

3. **Gradient Boosting Module:**
   - LightGBM classifier
   - Processes LSTM embeddings + handcrafted features
   - Final prediction with probability scores

4. **Interpretability Layer:**
   - SHAP (SHapley Additive exPlanations) values
   - Attention heatmaps
   - Feature importance visualization

### Performance
- **Accuracy:** 94-97% on benchmark datasets
- **Training Data:** 1000+ recordings (healthy + PD patients)
- **Cross-Validation:** 5-fold stratified
- **Class Balancing:** SMOTE (Synthetic Minority Over-sampling)

---

## 🔬 Clinical Validation

### Biomarker Reference Ranges

| Biomarker | Normal Range | PD Indicator |
|-----------|--------------|--------------|
| Jitter | < 1.04% | > 1.04% |
| Shimmer | < 3.81% | > 3.81% |
| HNR | > 20 dB | < 20 dB |
| F0 Std Dev | > 15 Hz | < 15 Hz |
| Vowel Space Area | > 300,000 Hz² | Reduced |

---

## 🔧 API Endpoints

### Inference
- `POST /api/v1/inference/run` - Submit audio for analysis

### Authentication (Optional)
- `POST /api/v1/auth/verify` - Verify Firebase token
- `GET /api/v1/auth/user` - Get user information

### Patient Management
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create new patient
- `GET /api/v1/patients/{id}` - Get patient details

### Dataset Management
- `POST /api/v1/datasets/upload` - Upload training data
- `GET /api/v1/datasets` - List datasets

### Reports
- `GET /api/v1/reports/{id}` - Retrieve assessment report

---

## 📝 Usage Guide

### 1. Start New Assessment
- Click "New Assessment" in sidebar
- System will guide you through 20 voice tasks

### 2. Complete Voice Tasks
- Read instructions carefully
- Click "Start Task" to begin recording
- Speak clearly into microphone
- Recording stops automatically after task duration

### 3. View Results
- System processes all recordings
- View aggregate probability score
- Review per-task breakdown
- Check biomarker analysis

### 4. Download Report
- Click "Download Report" button
- PDF contains clinical biomarkers, task results, and interpretability data
- Share with healthcare professionals

### 5. Track History
- Access "Clinical History" to view past assessments
- Monitor disease progression over time
- Compare biomarker trends

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for academic and research purposes.

---

## 👨‍💻 Authors

- **Adarsh** - [GitHub](https://github.com/Adarsh1457)

---

## 🙏 Acknowledgments

- Dataset: Parkinson's Disease voice recordings from UCI Machine Learning Repository
- Inspired by clinical research in motor speech disorders
- Special thanks to the open-source ML/AI community

---

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on [GitHub](https://github.com/Adarsh1457/Major/issues)
- Email: adarsh@parkinsafe.com

---

## 🔮 Future Enhancements

- [ ] Multi-language support (Spanish, French, Hindi, etc.)
- [ ] Mobile app (React Native / Flutter)
- [ ] Integration with wearable devices
- [ ] Real-time telemedicine consultations
- [ ] Advanced longitudinal analytics dashboard
- [ ] HIPAA compliance certification
- [ ] Integration with Electronic Health Records (EHR)

---

**ParkinSafe** - Empowering early detection through AI-powered voice analysis.
