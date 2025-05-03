import React, { useState, useRef } from 'react';
import { Input, Toast } from 'antd-mobile';
import { AudioOutline, PictureOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';
import '../index.css';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi there! Need help with your pet today? 🐶' },
  ]);

  // one session per mount
  const sessionIdRef = useRef(`${Date.now()}-${Math.floor(Math.random() * 1e5)}`);
  const patientId = sessionStorage.getItem('userName') || '';

  // text chat
  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setInput('');

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
    } catch (err) {
      console.error('Chat error:', err);
      Toast.show({ icon: 'fail', content: err.message || 'Error getting reply' });
    }
  };

  // image upload
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset input

    // show loading
    Toast.show({ icon: 'loading', content: 'Analyzing image...' });
    // add user message
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

      // add AI message
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🩹 Injury: ${data.injury}
Severity: ${data.severity}
Confidence: ${data.confidence}
${data.description}`,
        },
      ]);
    } catch (err) {
      console.error('Image upload error:', err);
      Toast.show({ icon: 'fail', content: err.message || 'Image analysis failed' });
    }
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
              onClick={() => Toast.show({ content: 'Voice input coming soon' })}
            >
              <AudioOutline style={{ fontSize: 18 }} />
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
