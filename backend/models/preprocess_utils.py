from typing import Tuple, List
import io
import numpy as np
import librosa


def load_audio_from_bytes(data: bytes, sr: int = 44100) -> Tuple[np.ndarray, int]:
    if not data:
        raise ValueError("Empty audio data received")
    
    print(f"[DEBUG] Received audio data size: {len(data)} bytes")
    # Check first few bytes for format identification
    header = data[:12].hex()
    print(f"[DEBUG] Audio header (hex): {header}")
    
    try:
        # Try loading with librosa
        audio, sample_rate = librosa.load(io.BytesIO(data), sr=sr)
        return audio, sample_rate
    except Exception as e:
        print(f"[ERROR] Audio loading failed: {e}")
        
        # Specific help for common browser issues
        if "ebm" in header.lower() or "1a45dfa3" in header.lower():
            raise RuntimeError("The recorded audio is in WebM format (the browser default), which the server cannot decode. Please upload a .wav file or use a browser that supports WAV recording.")
        
        raise RuntimeError(f"Could not decode audio data (Header: {header}). Please ensure you are uploading a valid audio file (e.g. .wav). Error: {e}")


def extract_features(audio: np.ndarray, sr: int, n_mfcc: int = 13) -> List[float]:
    # 1. Fundamental Frequency (F0) for Jitter/Shimmer
    f0, voiced_flag, voiced_probs = librosa.pyin(audio, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    f0_voiced = f0[voiced_flag]
    
    # Jitter (Frequency instability)
    jitter = np.mean(np.abs(np.diff(f0_voiced))) / np.mean(f0_voiced) if len(f0_voiced) > 1 else 0
        
    # Shimmer (Amplitude instability)
    voiced_indices = np.where(voiced_flag)[0]
    shimmer = 0
    if len(voiced_indices) > 0:
        hop_length = 512
        frames = librosa.util.frame(audio, frame_length=2048, hop_length=hop_length)
        voiced_frames = frames[:, voiced_indices[voiced_indices < frames.shape[1]]]
        if voiced_frames.size > 0:
            peak_amps = np.max(np.abs(voiced_frames), axis=0)
            shimmer = np.mean(np.abs(np.diff(peak_amps))) / np.mean(peak_amps) if np.mean(peak_amps) > 0 else 0

    # 2. MFCC & Deltas
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = mfcc.mean(axis=1)
    mfcc_std = mfcc.std(axis=1)
    mfcc_delta = librosa.feature.delta(mfcc)
    mfcc_delta_mean = mfcc_delta.mean(axis=1)
    mfcc_delta_std = mfcc_delta.std(axis=1)
    
    # 3. Chroma
    chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
    chroma_mean = chroma.mean(axis=1)
    chroma_std = chroma.std(axis=1)
    
    # 4. Spectral Features
    cent = librosa.feature.spectral_centroid(y=audio, sr=sr)
    cent_mean = cent.mean()
    cent_std = cent.std()
    
    contrast = librosa.feature.spectral_contrast(y=audio, sr=sr)
    contrast_mean = contrast.mean(axis=1)
    contrast_std = contrast.std(axis=1)

    # 5. HNR (Harmonics-to-Noise Ratio)
    autocorr = librosa.autocorrelate(audio)
    hnr = np.max(autocorr[1:]) / (autocorr[0] - np.max(autocorr[1:])) if autocorr[0] > np.max(autocorr[1:]) else 0

    # Concatenate all features (95 features total)
    features = np.concatenate([
        mfcc_mean, mfcc_std,
        mfcc_delta_mean, mfcc_delta_std,
        chroma_mean, chroma_std,
        [cent_mean, cent_std, jitter, shimmer, hnr],
        contrast_mean, contrast_std
    ])
    return features.tolist()
