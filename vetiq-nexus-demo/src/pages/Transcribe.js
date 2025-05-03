import React, { useState } from 'react';
import { AudioOutline } from 'antd-mobile-icons';
import TabBarFooter from '../components/TabBarFooter';
import MobileWrapper from '../components/MobileWrapper';
import '../index.css';

const Transcribe = () => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return (
    <MobileWrapper>
      <div style={styles.page}>
        {/* Top Section - Profiles */}
        <div style={styles.header}>
          <div style={styles.profile}>
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Doctor"
              style={styles.avatar}
            />
            <div style={styles.nameBlock}>
              <div style={styles.name}>Dr. Smith</div>
              <div style={styles.sub}>Veterinarian</div>
            </div>
          </div>
          <div style={styles.profile}>
            <img
              src="https://placedog.net/100/100?id=1"
              alt="Bella"
              style={styles.avatar}
            />
            <div style={styles.nameBlock}>
              <div style={styles.name}>Bella</div>
              <div style={styles.sub}>Golden Retriever</div>
            </div>
          </div>
        </div>

        {/* Mic Section */}
        <div style={styles.content}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {isListening && <div className="pulse-circle" />}
            <div
              style={{
                ...styles.micButton,
                backgroundColor: isListening ? '#1677ff' : '#ccc',
              }}
              onClick={toggleListening}
            >
              <AudioOutline style={{ fontSize: 32, color: 'white' }} />
            </div>
          </div>
          <p style={styles.statusText}>
            {isListening ? 'Taking notes...' : 'Tap the mic to start'}
          </p>
        </div>

        
      </div>
    </MobileWrapper>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '20px 16px 0',
  },
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: 4,
  },
  nameBlock: {
    textAlign: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  sub: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
  },
  statusText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  footer: {
    borderTop: '1px solid #eee',
  },
};

export default Transcribe;
