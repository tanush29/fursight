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

  // one session id per page-load
  const sessionIdRef = useRef(`${Date.now()}-${Math.floor(Math.random() * 1e5)}`);
  const patientId = sessionStorage.getItem('userName') || '';

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    // add user message locally
    const userMessage = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);
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

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      // append AI reply
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: data.reply },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      Toast.show({
        icon: 'fail',
        content: err.message || 'Error getting reply',
      });
    }
  };

  return (
    <MobileWrapper active="chat">
      <div className="chat-container">
        {/* Chat messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input area (fixed above footer) */}
        <div className="chat-input-fixed">
          <div className="chat-input-area">
            <button
              className="plain-icon-button"
              onClick={() => Toast.show({ content: 'Voice input coming soon' })}
            >
              <AudioOutline style={{ fontSize: 18, color: '#000' }} />
            </button>

            <button
              className="plain-icon-button"
              onClick={() => Toast.show({ content: 'Upload image coming soon' })}
            >
              <PictureOutline style={{ fontSize: 18, color: '#000' }} />
            </button>

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
