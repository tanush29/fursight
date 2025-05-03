import React, { useState, useRef } from 'react';
import { AudioOutline } from 'antd-mobile-icons';
import { Toast } from 'antd-mobile';
import MobileWrapper from '../components/MobileWrapper';
import '../index.css';

const Transcribe = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const sessionIdRef = useRef(`${Date.now()}-${Math.floor(Math.random() * 1e5)}`);

  const doctor = {
    name: 'Dr. Smith',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    title: 'Veterinarian',
  };
  const patient = {
    name: sessionStorage.getItem('userName') || 'Bella',
    avatar: 'https://placedog.net/100/100?id=1',
    breed: 'Persian cat',
  };

  const handleRecordingStop = async () => {
    // assemble audio & stop tracks
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());

    setIsProcessing(true);
    setTranscription('');

    try {
      // 1️⃣ Transcribe audio
      const formData = new FormData();
      formData.append('audio_file', blob, 'recording.webm');
      formData.append('session_id', sessionIdRef.current);
      formData.append('doctor_id', sessionStorage.getItem('userId') || '');
      formData.append('patient_id', patient.name);

      const tRes = await fetch('http://127.0.0.1:8000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
      if (!tRes.ok) throw new Error(`Transcribe returned ${tRes.status}`);
      const tData = await tRes.json();
      if (!tData.success) throw new Error(tData.message || 'Transcription failed');

      setTranscription(tData.transcription);

      // 2️⃣ Generate new todos via query string params
      const stored = sessionStorage.getItem('todos');
      const pastList = stored
        ? JSON.parse(stored).map(item => item.text).join(',')
        : '';

      // build URL with encoded params
      const qs = new URLSearchParams({
        patient_id: patient.name,
        past_todo: pastList,
      }).toString();

      const genRes = await fetch(
        `http://127.0.0.1:8000/generate-todo?${qs}`,
        { method: 'POST' }
      );

      if (!genRes.ok) {
        // try parsing JSON errors
        const errJson = await genRes.json().catch(() => null);
        let msg = `Generate TODO returned ${genRes.status}`;
        if (errJson) {
          if (Array.isArray(errJson.detail)) {
            msg = errJson.detail.map(e => e.msg).join(', ');
          } else if (errJson.message) {
            msg = errJson.message;
          }
        }
        throw new Error(msg);
      }

      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.message || 'Generate TODO failed');

      // parse and store new todos
      const items = genData.updated_todo
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);
      const newTodos = items.map(text => ({ text, done: false }));
      sessionStorage.setItem('todos', JSON.stringify(newTodos));
      Toast.show({ icon: 'success', content: 'To-do list updated!' });

    } catch (err) {
      console.error('Error in transcription/todo flow:', err);
      Toast.show({ icon: 'fail', content: err.message || 'Something went wrong' });
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const toggleListening = async () => {
    if (!isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
        recorder.onstop = handleRecordingStop;
        recorder.start();
        setIsListening(true);
      } catch {
        Toast.show({ icon: 'fail', content: 'Microphone access denied' });
      }
    } else {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <MobileWrapper>
      <div style={styles.page}>
        <div style={styles.header}>
          <ProfileBlock {...doctor} label="title" />
          <ProfileBlock {...patient} label="breed" />
        </div>

        <div style={styles.content}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {isListening && (
              <div className="pulse-circle" style={{ pointerEvents: 'none', zIndex: 1 }} />
            )}
            <div
              onClick={toggleListening}
              style={{
                ...styles.micButton,
                position: 'relative',
                zIndex: 2,
                backgroundColor: isListening ? '#1677ff' : '#ccc',
              }}
            >
              <AudioOutline style={{ fontSize: 32, color: 'white' }} />
            </div>
          </div>

          <p style={styles.statusText}>
            {isListening
              ? 'Recording…'
              : isProcessing
              ? 'Transcribing…'
              : 'Tap the mic to start'}
          </p>

          {transcription && (
            <div style={styles.transcriptionBox}>
              <h3>Transcription</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>
      </div>
    </MobileWrapper>
  );
};

const ProfileBlock = ({ name, avatar, title, breed }) => (
  <div style={styles.profile}>
    <img src={avatar} alt={name} style={styles.avatar} />
    <div style={styles.nameBlock}>
      <div style={styles.name}>{name}</div>
      <div style={styles.sub}>{title || breed}</div>
    </div>
  </div>
);

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh' },
  header: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px 16px 0',
  },
  profile: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 4 },
  nameBlock: { textAlign: 'center' },
  name: { fontWeight: 'bold', fontSize: 14 },
  sub: { fontSize: 12, color: '#888' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  micButton: { width: 90, height: 90, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  statusText: { color: '#666', fontSize: 16, marginTop: 12 },
  transcriptionBox: { marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, width: '90%' },
};

export default Transcribe;
