import React, { useState, useRef, useEffect } from 'react';
import { Input, Toast } from 'antd-mobile';
import { AudioOutline, PictureOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';
import '../index.css';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi there! Need help with your pet today? 🐶' },
  ]);
  const [listening, setListening] = useState(false);

  const sessionIdRef = useRef(`${Date.now()}-${Math.floor(Math.random() * 1e5)}`);
  const patientId = sessionStorage.getItem('userName') || '';
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onstart = () => setListening(true);
      recog.onend = () => setListening(false);
      recog.onerror = (err) => {
        console.error('Recognition error:', err);
        Toast.show({ icon: 'fail', content: 'Voice recognition error' });
        setListening(false);
      };
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleChat(transcript, /* speakResponse= */ true);
      };
      recognitionRef.current = recog;
    }
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };

  // Unified chat handler; speakResponse controls voice output
  const handleChat = async (question, speakResponse) => {
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          patient_id: patientId,
          question,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      if (speakResponse) speak(data.reply);
    } catch (err) {
      console.error('Chat error:', err);
      Toast.show({ icon: 'fail', content: err.message || 'Error getting reply' });
    }
  };

  const handleSend = () => {
    const question = input.trim();
    if (!question) return;
    setInput('');
    // Text input should not trigger speech synthesis:
    handleChat(question, /* speakResponse= */ false);
  };

  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      Toast.show({ icon: 'fail', content: 'Voice not supported' });
      return;
    }
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    Toast.show({ icon: 'loading', content: 'Analyzing image...' });
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `📷 Uploaded image: ${file.name}` },
    ]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(
        `http://127.0.0.1:8000/injury/predict?patient_id=${encodeURIComponent(patientId)}`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const reply = `🩹 Injury: ${data.injury}
Severity: ${data.severity}
Confidence: ${data.confidence}
${data.description}`;
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      // Speak injury analysis:
      speak(reply);
    } catch (err) {
      console.error('Image upload error:', err);
      Toast.show({ icon: 'fail', content: err.message || 'Image analysis failed' });
    }
  };

  const socketRef = useRef(null); // Add this at the top with other useRefs

  const startBookingAgent = async () => {
    const hospital = prompt("Enter hospital name:");
    const department = prompt("Enter department:");
    const doctor = prompt("Enter doctor name:");
    if (!hospital || !department || !doctor) {
      Toast.show({ icon: 'fail', content: 'All fields required.' });
      return;
    }
  
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/booking-agent");
    socketRef.current = socket;
  
    socket.onopen = () => {
      socket.send(JSON.stringify({ hospital, department, doctor }));
    };
  
    socket.onmessage = async (event) => {
      const msg = event.data;
      setMessages((prev) => [...prev, { sender: 'ai', text: msg }]);
  
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.onend = () => {
        if (msg.includes("bye")) {
          Toast.show({ icon: 'success', content: '✅ Appointment call ended' });
          socket.close();
          return;
        }
  
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
  
        recognition.onresult = (e) => {
          const spoken = e.results[0][0].transcript;
          setMessages((prev) => [...prev, { sender: 'user', text: spoken }]);
          if (socketRef.current?.readyState === 1) {
            socketRef.current.send(spoken);
          }
        };
  
        recognition.onerror = () => {
          Toast.show({ icon: 'fail', content: 'Speech recognition error' });
        };
  
        recognition.start();
      };
  
      window.speechSynthesis.speak(utterance);
    };
  
    socket.onclose = () => {
      console.log("WebSocket closed.");
    };
  };
  
  
  

  return (
    <MobileWrapper active="chat">
      <div className="chat-container">
        {/* Chat messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input & controls */}
        <div className="chat-input-fixed">
          <div className="chat-input-area">
            <button
              className="plain-icon-button"
              onClick={handleVoiceClick}
            >
              <AudioOutline style={{ fontSize: 18, color: listening ? '#1677ff' : '#000' }} />
            </button>

            <button
  className="plain-icon-button"
  onClick={startBookingAgent}
  style={{ fontSize: 12, marginLeft: 8, background: '#eee', padding: '4px 8px', borderRadius: 6 }}
>
  📞 Book via Agent
</button>


            <button
              className="plain-icon-button"
              onClick={handleImageClick}
            >
              <PictureOutline style={{ fontSize: 18 }} />
            </button>
            {/* hidden file input */}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <Input
              placeholder="Type your message..."
              className="chat-input"
              value={input}
              onChange={setInput}
              onEnterPress={handleSend}
              clearable
            />

            <button className="chat-icon-button black" onClick={handleSend}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="#000"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
};

export default Chat;
