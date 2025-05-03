// src/components/MobileWrapper.js
import React from 'react';
import TabBarFooter from './TabBarFooter';

const MobileWrapper = ({ children, active, hideFooter = false }) => (
  <div style={styles.wrapper}>
    <div style={styles.content}>{children}</div>
    { !hideFooter && (
      <div style={styles.footer}>
        <TabBarFooter active={active} />
      </div>
    )}
  </div>
);

const styles = {
  wrapper: {
    maxWidth: '430px',
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    position: 'relative',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '60px', // avoid overlap when footer is shown
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    background: '#fff',
    borderTop: '1px solid #eee',
    zIndex: 999,
  },
};

export default MobileWrapper;
