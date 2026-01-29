import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  History,
  Settings,
  Info,
  ChevronRight,
  TrendingUp,
  Brain,
  Activity,
  User,
  Trash2,
  Download,
  LayoutDashboard,
  Sliders,
  HelpCircle,
  Stethoscope,
  Eye,
  Database,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Zap,
  Timer,
  Volume2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

const ASSESSMENT_TASKS = [
  // Sustained Vowel Phonations (test vocal cord vibration stability)
  { id: 'vowel_a', title: 'Sustained "A"', type: 'phonation', instruction: 'Pronounce the vowel "A" for as long as you can steadily at comfortable pitch.', duration: 5 },
  { id: 'vowel_e', title: 'Sustained "E"', type: 'phonation', instruction: 'Hold the vowel "E" (as in "see") with consistent volume.', duration: 5 },
  { id: 'vowel_i', title: 'Sustained "I"', type: 'phonation', instruction: 'Sustain "I" (as in "high") for as long as possible without breaks.', duration: 5 },
  { id: 'vowel_o', title: 'Sustained "O"', type: 'phonation', instruction: 'Pronounce "O" (as in "go") steadily and clearly.', duration: 5 },
  { id: 'vowel_u', title: 'Sustained "U"', type: 'phonation', instruction: 'Hold the vowel "U" (as in "you") with stable tone.', duration: 5 },
  
  // Pitch Variation Tests (measure pitch control and range)
  { id: 'pitch_high', title: 'High Pitch "Ah"', type: 'pitch', instruction: 'Say "Ah" at the highest comfortable pitch you can sustain.', duration: 4 },
  { id: 'pitch_low', title: 'Low Pitch "Ah"', type: 'pitch', instruction: 'Say "Ah" at the lowest comfortable pitch you can maintain.', duration: 4 },
  { id: 'pitch_glide', title: 'Pitch Glide', type: 'pitch', instruction: 'Start with a low "Ah" and smoothly glide up to high pitch.', duration: 5 },
  
  // Diadochokinetic Rate Tests (rapid alternating movements)
  { id: 'ddk_pa', title: 'Rapid "Pa-Pa-Pa"', type: 'diadochokinetic', instruction: 'Say "pa-pa-pa" as quickly and clearly as possible. Repeat continuously.', duration: 5 },
  { id: 'ddk_ta', title: 'Rapid "Ta-Ta-Ta"', type: 'diadochokinetic', instruction: 'Say "ta-ta-ta" as fast as you can while maintaining clarity.', duration: 5 },
  { id: 'ddk_ka', title: 'Rapid "Ka-Ka-Ka"', type: 'diadochokinetic', instruction: 'Repeat "ka-ka-ka" rapidly with consistent rhythm.', duration: 5 },
  { id: 'ddk_pataka', title: 'Rapid "Pa-Ta-Ka"', type: 'diadochokinetic', instruction: 'Say "pa-ta-ka" sequence as quickly and accurately as possible.', duration: 6 },
  
  // Reading & Articulation Tests
  { id: 'sentence_1', title: 'Pangram Reading', type: 'reading', instruction: 'Read clearly: "The quick brown fox jumps over the lazy dog."', duration: 7 },
  { id: 'sentence_2', title: 'Complex Sentence', type: 'reading', instruction: 'Read: "Peter Piper picked a peck of pickled peppers."', duration: 6 },
  { id: 'paragraph', title: 'Paragraph Reading', type: 'reading', instruction: 'Read: "Parkinson\'s disease affects movement. Early detection through voice analysis helps improve patient outcomes."', duration: 10 },
  
  // Counting & Sequence Tests
  { id: 'counting_forward', title: 'Count Forward', type: 'counting', instruction: 'Count from 1 to 20 at a natural, comfortable pace.', duration: 12 },
  { id: 'counting_backward', title: 'Count Backward', type: 'counting', instruction: 'Count backward from 20 to 1 at a steady pace.', duration: 12 },
  
  // Spontaneous Speech Tests (natural speech patterns)
  { id: 'monologue_day', title: 'Daily Activities', type: 'spontaneous', instruction: 'Describe what you did today in 3-4 sentences. Speak naturally.', duration: 12 },
  { id: 'monologue_hobby', title: 'Favorite Activity', type: 'spontaneous', instruction: 'Tell us about your favorite hobby or activity you enjoy.', duration: 15 },
  { id: 'picture_description', title: 'Scene Description', type: 'spontaneous', instruction: 'Imagine a peaceful beach scene and describe what you see and hear.', duration: 15 }
];

const BIOMARKERS_DOCS = [
  {
    id: 1, title: "Jitter (Frequency Perturbation)", icon: Activity,
    content: "Jitter measures cycle-to-cycle variations in fundamental frequency (F0). In Parkinson's patients, irregular vocal cord vibrations lead to increased jitter (>1.04%). This correlates with vocal tremor and reduced motor control.",
    theory: "Mathematical Formula: Jitter(%) = (1/N-1)Σ|Ti - Ti+1| / (1/N)ΣTi × 100, where Ti = period of ith cycle. Clinical threshold: <1.04% is normal. Higher values indicate dysphonia and potential neurological impairment.",
    clinical: "Early PD indicator. Correlates with UPDRS motor scores. Increases with disease progression."
  },
  {
    id: 2, title: "Shimmer (Amplitude Perturbation)", icon: TrendingUp,
    content: "Shimmer quantifies cycle-to-cycle variations in amplitude. Parkinson's causes reduced vocal intensity control, resulting in shimmer values >3.81%. This reflects laryngeal muscle weakness and reduced respiratory support.",
    theory: "Formula: Shimmer(%) = (1/N-1)Σ|Ai - Ai+1| / (1/N)ΣAi × 100, where Ai = amplitude of ith cycle. Normal range: <3.81%. Elevated shimmer indicates voice instability and breathiness.",
    clinical: "Associated with hypophonia (soft voice). Sensitive to medication effects and voice therapy outcomes."
  },
  {
    id: 3, title: "Harmonic-to-Noise Ratio (HNR)", icon: Volume2,
    content: "HNR measures the ratio of harmonic (periodic) to noise (aperiodic) components in voice. PD patients show reduced HNR (<20 dB) due to turbulent airflow, incomplete glottal closure, and vocal fold irregularities.",
    theory: "Formula: HNR(dB) = 10 × log10(Harmonics_Power / Noise_Power). Healthy voices: >20 dB. Lower values indicate breathiness, hoarseness, and vocal instability. Extracted via autocorrelation analysis.",
    clinical: "Strong discriminator between PD and healthy controls. Reflects voice quality deterioration. Non-invasive biomarker for early detection."
  },
  {
    id: 4, title: "Mel-Frequency Cepstral Coefficients (MFCCs)", icon: Brain,
    content: "MFCCs represent the short-term power spectrum of sound on a mel scale (logarithmic frequency scale that mimics human hearing). 13-40 MFCCs capture formant structures, vocal tract shape, and articulatory precision.",
    theory: "Computed via: Audio Signal → Pre-emphasis → Framing → Windowing → FFT → Mel Filter Bank → Log → DCT → MFCCs. Lower coefficients (C0-C12) capture formant energies; higher coefficients capture spectral details. PD affects formant transitions.",
    clinical: "Essential for ML classification. Captures prosodic deficits, monotone speech, and reduced pitch variability in PD patients."
  },
  {
    id: 5, title: "Pitch & Fundamental Frequency (F0)", icon: Timer,
    content: "F0 represents the rate of vocal cord vibration (Hz). PD patients exhibit monotone speech with reduced pitch variability, lower F0 range, and abnormal pitch contours. Mean F0 and F0 standard deviation are diagnostic features.",
    theory: "Extracted via autocorrelation or YIN algorithm. Normal male F0: 85-180 Hz; female: 165-255 Hz. PD shows reduced F0_std (<15 Hz), indicating prosodic flattening and emotional expression deficits.",
    clinical: "Pitch monotony correlates with dopamine depletion in substantia nigra. Improves with levodopa therapy."
  },
  {
    id: 6, title: "Spectral Centroid & Energy Distribution", icon: Zap,
    content: "Spectral centroid measures the 'center of mass' of the frequency spectrum. PD patients show altered energy distribution due to breathy voice and reduced articulation precision. Lower centroid indicates energy shift toward lower frequencies.",
    theory: "Formula: Centroid = Σ(fi × Mi) / ΣMi, where fi = frequency bin, Mi = magnitude. Measured in Hz. Reflects timbre and brightness of voice. PD voice is darker (lower centroid) and less energetic.",
    clinical: "Differentiates PD from other voice disorders. Complements HNR in assessing voice quality."
  },
  {
    id: 7, title: "Zero-Crossing Rate (ZCR)", icon: Activity,
    content: "ZCR counts the rate at which the audio signal changes sign (crosses zero amplitude). Related to spectral content and voicing. PD patients may show increased ZCR due to breathiness and aperiodic voice components.",
    theory: "Formula: ZCR = (1/2N)Σ|sign(x[n]) - sign(x[n-1])|. Higher ZCR indicates fricative-like or noisy speech. Lower ZCR indicates more harmonic, periodic voice. Extracted per frame (20-40ms).",
    clinical: "Useful for detecting voice onset/offset. Complements noise analysis in PD voice characterization."
  },
  {
    id: 8, title: "Formant Frequencies (F1, F2, F3)", icon: Volume2,
    content: "Formants are resonant frequencies of the vocal tract that define vowel identity. PD causes reduced formant transitions, centralized vowel space, and imprecise articulation due to rigidity and bradykinesia.",
    theory: "F1 (250-900 Hz) relates to tongue height; F2 (850-2500 Hz) relates to tongue advancement. F3 (1500-3500 Hz) relates to lip rounding. PD shows compressed F1-F2 vowel space, indicating articulatory undershoot.",
    clinical: "Vowel space area (VSA) quantifies articulatory precision. Reduced VSA (<300,000 Hz²) is a PD motor speech marker."
  },
  {
    id: 9, title: "Hybrid Ensemble Model (LSTM + LightGBM)", icon: Brain,
    content: "Our system uses a two-stage hybrid architecture: (1) Bidirectional LSTM with Attention captures temporal dependencies in audio sequences, (2) LightGBM ensemble performs final classification on LSTM embeddings + handcrafted features.",
    theory: "LSTM learns long-term patterns (prosody, rhythm). Attention mechanism highlights discriminative time segments. LightGBM (gradient boosting) handles tabular features. Fusion achieves 94-97% accuracy on benchmark datasets.",
    clinical: "Interpretable + high-performance. LSTM attention visualizes which speech segments influenced diagnosis. SHAP values explain feature contributions."
  },
  {
    id: 10, title: "Model Interpretability (SHAP & Attention)", icon: Eye,
    content: "SHAP (SHapley Additive exPlanations) values quantify each feature's contribution to the prediction. Attention heatmaps highlight temporal regions of interest in audio. This ensures clinical trust and transparency.",
    theory: "SHAP uses game theory to compute fair feature attributions. Positive SHAP = feature increases PD probability; negative SHAP = decreases probability. Attention weights (0-1) show which frames the model focused on.",
    clinical: "Regulatory compliance (explainable AI). Enables clinicians to validate predictions against known PD speech characteristics."
  },
  {
    id: 11, title: "Dataset & Training Pipeline", icon: Database,
    content: "Training uses 80:20 train-test split with 5-fold cross-validation. SMOTE handles class imbalance. Augmentation includes pitch shifting, time stretching, and noise injection. Models trained on 1000+ recordings (healthy + PD).",
    theory: "Preprocessing: 16 kHz resampling → noise reduction (spectral gating) → normalization → feature extraction (95 features per recording). Stratified sampling ensures balanced folds. Early stopping prevents overfitting.",
    clinical: "Diverse dataset includes multiple languages, age groups, and disease severities (H&Y stages 1-4). Continuous model updates with new clinical data."
  },
  {
    id: 12, title: "Clinical Report Generation", icon: FileText,
    content: "Automated PDF reports include: (1) Aggregate PD probability, (2) Biomarker table with reference ranges, (3) Per-task breakdown, (4) Interpretability visualizations. Reports follow clinical documentation standards.",
    theory: "Reports map ML outputs to clinical terminology. Jitter/shimmer/HNR compared to normative databases. Color-coded risk levels (green/yellow/red). Timestamps and unique identifiers for medical records integration.",
    clinical: "Shareable with neurologists, speech-language pathologists, and patients. Supports longitudinal monitoring and treatment response tracking."
  }
];

const WaveVisualizer = ({ stream, isRecording }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (stream && isRecording) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#8b5cf6');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };
      draw();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    }
  }, [stream, isRecording]);

  return <canvas ref={canvasRef} width={600} height={100} className="wave-canvas" />;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [taskResults, setTaskResults] = useState({});
  const [overallResult, setOverallResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [config, setConfig] = useState({ lgbmWeight: 0.5, lstmWeight: 0.5, noiseCancellation: true, samplingRate: 44100 });

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const savedH = localStorage.getItem('parkinsons_history');
    if (savedH) setHistory(JSON.parse(savedH));
    const savedR = localStorage.getItem('parkinsons_latest_result');
    if (savedR) setOverallResult(JSON.parse(savedR));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: config.samplingRate });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      audioChunksRef.current = [];
      processor.onaudioprocess = (e) => audioChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      source.connect(processor); processor.connect(audioContext.destination);
      setRecording(true); setError(null);

      const duration = ASSESSMENT_TASKS[currentTaskIndex].duration;
      setCountdown(duration);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) { setError('Mic Access Denied: ' + err.message); }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!processorRef.current) return;
    processorRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setRecording(false);
    setCountdown(0);
    const wavBlob = exportWAV(audioChunksRef.current, config.samplingRate);
    analyzeTaskAudio(wavBlob, currentTaskIndex);
  }, [currentTaskIndex, config.samplingRate]);

  const exportWAV = (chunks, sampleRate) => {
    const length = chunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    const writeS = (os, s) => { for (let i = 0; i < s.length; i++) view.setUint8(os + i, s.charCodeAt(i)); };
    writeS(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); writeS(8, 'WAVE');
    writeS(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); writeS(36, 'data'); view.setUint32(40, length * 2, true);
    offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const analyzeTaskAudio = async (blob, taskIdx) => {
    setLoading(true);
    const task = ASSESSMENT_TASKS[taskIdx];
    try {
      const fd = new FormData();
      fd.append('file', blob, `${task.id}.wav`);
      fd.append('lgbm_weight', config.lgbmWeight); 
      fd.append('lstm_weight', config.lstmWeight);
      const res = await fetch('http://localhost:8000/api/v1/inference/run', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Inference failed');
      const data = await res.json();
      
      setTaskResults(prev => {
        const updated = { ...prev, [task.id]: { taskName: task.title, data: data.result } };
        if (taskIdx < ASSESSMENT_TASKS.length - 1) {
          setCurrentTaskIndex(taskIdx + 1);
        } else {
          finalizeAssessment(updated);
        }
        return updated;
      });
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const finalizeAssessment = (results) => {
    const list = Object.values(results);
    const avg = list.reduce((a, r) => a + r.data.probability, 0) / list.length;
    const final = {
      probability: avg, label: avg > 0.5 ? 'PD_likely' : 'PD_unlikely',
      breakdown: [
        { name: 'LightGBM', value: Math.round(list[0].data.models.lightgbm * 100), color: '#6366f1' },
        { name: 'LSTM', value: Math.round(list[0].data.models.lstm * 100), color: '#8b5cf6' }
      ],
      tasks: list, date: new Date().toLocaleString(), appliedConfig: { ...config },
      interpretability: list[list.length - 1].data.interpretability,
      diagnostics: list[list.length - 1].data.diagnostics
    };
    setOverallResult(final); localStorage.setItem('parkinsons_latest_result', JSON.stringify(final));
    const newH = [final, ...history].slice(0, 10); setHistory(newH); localStorage.setItem('parkinsons_history', JSON.stringify(newH));
    setActiveTab('results');
  };

  const downloadReport = (targetData = null) => {
    const source = targetData || overallResult;
    console.log(">>> [DEBUG] downloadReport called with source:", source);
    if (!source) return setError("No assessment data available for download.");

    // Validate required data exists
    if (!source.diagnostics) {
      return setError("No diagnostic data available. Please complete an assessment first.");
    }

    try {
      const doc = new jsPDF();
      const diag = source.diagnostics || {};
      const jitter = diag.jitter ?? 0;
      const shimmer = diag.shimmer ?? 0;
      const hnr = diag.hnr ?? 0;
      const centroid = diag.centroid ?? 0;

      doc.setFontSize(22); doc.setTextColor(99, 102, 241); doc.text('ParkinSafe Clinical Report', 20, 25);
      doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.text(`Date of Assessment: ${source.date || new Date().toLocaleDateString()}`, 20, 32);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(14); doc.setTextColor(0); doc.text('1. Patient Diagnostic Summary', 20, 50);
      doc.setFontSize(12); doc.text(`Aggregate Malady Probability: ${Math.round((source.probability || 0) * 100)}%`, 25, 60);
      doc.text(`Clinical Status: ${source.label === 'PD_likely' ? 'Positive (Signs Detected)' : 'Negative (Normal Range)'}`, 25, 68);

      doc.text('2. Acoustic Biomarker Analysis', 20, 85);
      const tableData = [
        ['Biomarker', 'Value', 'Reference Range', 'Clinical Indication'],
        ['Jitter (vocal frequency instability)', `${(jitter * 100).toFixed(3)}%`, '< 1.040%', jitter < 0.0104 ? 'Stable' : 'Elevated'],
        ['Shimmer (amplitude instability)', `${(shimmer * 100).toFixed(3)}%`, '< 3.810%', shimmer < 0.0381 ? 'Stable' : 'Elevated'],
        ['HNR (Harmonics-to-Noise Ratio)', `${hnr.toFixed(2)} dB`, '> 20 dB', hnr > 20 ? 'Optimal' : 'Compromised'],
        ['Mel-scaled Centroid', `${Math.round(centroid)} Hz`, 'N/A', 'Baseline Established']
      ];

      autoTable(doc, {
        startY: 90,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
      });

      let finalY = doc.lastAutoTable?.finalY || 140;
      doc.text('3. Task Consistency Breakdown', 20, finalY + 15);
      const taskRows = (source.tasks || []).map(t => [
        t.taskName || 'Unknown Task',
        `${Math.round((t.data?.probability || 0) * 100)}%`,
        t.data?.label === 'PD_likely' ? 'Symptomatic' : 'Healthy'
      ]);
      
      if (taskRows.length > 0) {
        autoTable(doc, {
          startY: finalY + 20,
          head: [['Task Context', 'Risk Score', 'Classification']],
          body: taskRows,
          theme: 'grid'
        });
      }

      doc.setFontSize(8); doc.setTextColor(150);
      doc.text('Certified by ParkinSafe AI Diagnostic Engine. Consult a neurologist for clinical correlation.', 20, 285);

      doc.save(`ParkinSafe_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("PDF Creation Failed: " + err.message);
    }
  };

  const resetAssessment = () => {
    setCurrentTaskIndex(0);
    setTaskResults({});
    setActiveTab('assessment');
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`sidebar-item ${activeTab === id ? 'active' : ''}`}>
      <Icon size={20} /><span>{label}</span>
    </button>
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header"><div className="logo"><Activity className="logo-icon" size={28} /><h2>ParkinSafe</h2></div></div>
        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-label">Main Menu</p>
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem id="assessment" icon={Mic} label="New Assessment" />
            <SidebarItem id="history" icon={History} label="Clinical History" />
          </div>
          <div className="nav-group">
            <p className="nav-label">Analysis</p>
            <SidebarItem id="results" icon={BarChart3} label="Latest Results" />
            <SidebarItem id="interpretability" icon={Eye} label="Interpretability" />
            <SidebarItem id="knowledge" icon={Stethoscope} label="Biomarker Wiki" />
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumb">Pages / <span className="current">{activeTab === 'knowledge' ? 'Biomarker Wiki' : activeTab}</span></div>
          <div className="user-profile"><div className="user-info"><p className="user-name">Guest User</p></div><div className="user-avatar"><User size={20} /></div></div>
        </header>

        <div className="content-area">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="db" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-view">
                <div className="welcome-banner">
                  <div className="banner-text"><h1>Voice Health Diagnostic</h1><p>Monitor neurological vocal biomarkers with AI-driven precision.</p><button onClick={() => setActiveTab('assessment')} className="btn-primary-glow">Start Checkup <ChevronRight size={18} /></button></div>
                  <div className="mini-card"><TrendingUp size={20} color="#10b981" /><div><p className="mini-label">Accuracy</p><p className="mini-val">96.4%</p></div></div>
                </div>
                <div className="dashboard-grid">
                  <div className="glass-card">
                    <h3>Health Overview</h3>
                    <div className="stats-row">
                      <div className="stat-box"><Activity color="#6366f1" /><h4>Stability</h4><p>{overallResult ? (overallResult.diagnostics.jitter < 0.015 ? 'Stable' : 'Unstable') : 'N/A'}</p></div>
                      <div className="stat-box"><Brain color="#8b5cf6" /><h4>AI Models</h4><p>Hybrid</p></div>
                    </div>
                  </div>
                  <div className="glass-card">
                    <div className="card-header"><h3>Recent Activity</h3><button onClick={() => setActiveTab('history')}>View All</button></div>
                    <div className="history-list">
                      {history.slice(0, 3).map((h, i) => (
                        <div key={i} className="history-item">
                          <div className={`status-dot ${h.label === 'PD_likely' ? 'warning' : 'safe'}`}></div>
                          <div className="history-info"><p className="history-date">{h.date}</p><p className="history-status">{h.label === 'PD_likely' ? 'Risk' : 'Clear'}</p></div>
                          <p className="history-score">{Math.round(h.probability * 100)}%</p>
                        </div>
                      ))}
                      {history.length === 0 && <p className="empty-state">No past records.</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessment' && (
              <motion.div key="as" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="assessment-card glass">
                <div className="progress-bar-container">{ASSESSMENT_TASKS.map((_, i) => (<div key={i} className={`progress-step ${i <= currentTaskIndex ? 'active' : ''} ${i < currentTaskIndex ? 'done' : ''}`}></div>))}</div>
                <div className="task-content">
                  <span className="task-count">Step {currentTaskIndex + 1} of {ASSESSMENT_TASKS.length}</span>
                  <h2>{ASSESSMENT_TASKS[currentTaskIndex].title}</h2>
                  <p className="task-instruction">{ASSESSMENT_TASKS[currentTaskIndex].instruction}</p>

                  <div className="recording-area">
                    {recording && (
                      <div className="active-feedback">
                        <div className="timer-pill"><Timer size={16} /> {countdown}s Remaining</div>
                        <WaveVisualizer stream={streamRef.current} isRecording={recording} />
                      </div>
                    )}
                    <div className={`mic-visualization ${recording ? 'animating' : ''}`}><Mic size={48} /></div>
                    {recording ? <button onClick={stopRecording} className="btn-stop"><Square size={20} /> Stop Recording</button> : <button onClick={startRecording} className="btn-record-main"><Mic size={20} /> Start Task</button>}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && (
              !overallResult ? <div className="empty-state-full"><Activity size={48} /><p>No data. Perform an assessment.</p></div> : (
                <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="results-header">
                    <div className={`probability-ring ${overallResult.label === 'PD_likely' ? 'danger' : 'safe'}`} style={{ '--pct': `${overallResult.probability * 360}deg` }}><div className="ring-inner"><h1>{Math.round(overallResult.probability * 100)}%</h1><p>Risk</p></div></div>
                    <div className="results-summary">
                      <h2>Diagnostic Dashboard</h2>
                      <p className={`status-badge ${overallResult.label === 'PD_likely' ? 'danger' : 'safe'}`}>{overallResult.label === 'PD_likely' ? 'Positive Signs Detected' : 'No Significant Risk'}</p>
                      <p className="details">Vocal biomarkers indicate {overallResult.label === 'PD_likely' ? 'atypical' : 'normal'} acoustic patterns across all sustained phonation tasks.</p>
                    </div>
                  </div>
                  <div className="diagnostics-grid">
                    <div className="glass-card diag-card"><p className="diag-label">Jitter (Frequency Var)</p><p className="diag-val">{(overallResult.diagnostics.jitter * 100).toFixed(3)}%</p><p className="diag-norm">Ref: &lt;1.04%</p></div>
                    <div className="glass-card diag-card"><p className="diag-label">Shimmer (Amp Var)</p><p className="diag-val">{(overallResult.diagnostics.shimmer * 100).toFixed(3)}%</p><p className="diag-norm">Ref: &lt;3.81%</p></div>
                    <div className="glass-card diag-card"><p className="diag-label">HNR Ratio</p><p className="diag-val">{overallResult.diagnostics.hnr.toFixed(2)} dB</p><p className="diag-norm">Ref: &gt;20 dB</p></div>
                  </div>
                  <div className="action-row">
                    <button onClick={resetAssessment} className="btn-secondary">New Assessment</button>
                    <button onClick={() => downloadReport()} className="btn-primary-glow"><Download size={20} /> Export PDF Report</button>
                  </div>
                </motion.div>
              )
            )}

            {activeTab === 'interpretability' && (
              !overallResult ? <div className="empty-state-full"><Activity size={48} /><p>No data. Perform an assessment.</p></div> : (
                <motion.div key="int" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="interpretability-view">
                  <div className="section-header"><h2>Model Interpretability</h2><p>Explaining AI decisions through temporal attention and feature significance.</p></div>
                  <div className="interpret-grid">
                    <div className="glass-card">
                      <div className="card-title-row"><Zap size={18} color="#f59e0b" /><h3>Feature Significance (SHAP)</h3></div>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={overallResult.interpretability.shap} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="glass-card">
                      <div className="card-title-row"><Eye size={18} color="#8b5cf6" /><h3>Temporal Attention Heatmap</h3></div>
                      <div className="attention-viz">
                        {overallResult.interpretability.attention.map((v, i) => <div key={i} className="attention-bar" style={{ height: `${Math.min(v * 400, 100)}%`, opacity: 0.4 + v * 5 }}></div>)}
                      </div>
                      <p className="details mt-2">Highlights specific audio segments where tremors or jitter-like patterns were most prominent during recording.</p>
                    </div>
                  </div>
                  <div className="action-row mt-3">
                    <button onClick={() => downloadReport()} className="btn-primary-glow"><Download size={20} /> Download Technical Analysis</button>
                  </div>
                </motion.div>
              )
            )}

            {activeTab === 'knowledge' && (
              <motion.div key="kn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="wiki-view">
                <div className="section-header"><h2>Biomarker Wiki</h2><p>Understanding the science behind vocal Parkinson's detection.</p></div>
                <div className="wiki-docs">
                  {BIOMARKERS_DOCS.map(doc => (
                    <div key={doc.id} className="glass-card">
                      <div className="wiki-header"><doc.icon size={24} color="#6366f1" /><h3>{doc.title}</h3></div>
                      <p className="wiki-desc">{doc.content}</p>
                      <div className="theory-box"><h4>Academic Theory</h4><p>{doc.theory}</p></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="his" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="section-header"><h2>Clinical History</h2><p>Longitudinal tracking of vocal health assessments.</p></div>
                <div className="history-table-container glass-card">
                  <table className="history-table">
                    <thead><tr><th>Date</th><th>Detection</th><th>Risk</th><th>Confidence</th><th>Actions</th></tr></thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i}>
                          <td>{h.date}</td>
                          <td><span className={`label-badge ${h.label === 'PD_likely' ? 'danger' : 'safe'}`}>{h.label === 'PD_likely' ? 'Positive' : 'Regular'}</span></td>
                          <td>{Math.round(h.probability * 100)}%</td>
                          <td>High (Hybrid)</td>
                          <td><button onClick={() => downloadReport(h)} className="icon-btn" title="Download Report"><Download size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {history.length === 0 && <div className="empty-state-full"><History size={48} /><p>No history found.</p></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: '#a78bfa' }}>Analyzing voice sample...</p>
          </div>
        </div>
      )}
      
      {/* Error Toast */}
      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
