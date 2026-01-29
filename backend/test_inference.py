import requests
import numpy as np
import io
from scipy.io import wavfile

# Generate a simple test audio (1 second of random noise)
sample_rate = 44100
duration = 1  # seconds
samples = np.random.randn(sample_rate * duration) * 0.1

# Convert to 16-bit PCM
samples_int16 = np.int16(samples * 32767)

# Create WAV file in memory
wav_buffer = io.BytesIO()
wavfile.write(wav_buffer, sample_rate, samples_int16)
wav_buffer.seek(0)

# Test the API
url = "http://localhost:8000/api/v1/inference/run"
files = {'file': ('test.wav', wav_buffer, 'audio/wav')}

print("Testing inference endpoint...")
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ SUCCESS!")
        print(f"Message: {result['message']}")
        print(f"Prediction: {result['result']['label']}")
        print(f"Probability: {result['result']['probability']:.2%}")
        print(f"Prediction ID: {result['predictionId']}")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\n❌ EXCEPTION: {e}")
