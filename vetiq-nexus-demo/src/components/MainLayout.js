import React from 'react';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  AudioOutline,
  MessageOutline,
  UserOutline
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { key: '/dashboard', title: 'Dashboard', icon: <AppOutline /> },
    { key: '/transcribe', title: 'Transcribe', icon: <AudioOutline /> },
    { key: '/chat', title: 'Chat', icon: <MessageOutline /> },
    { key: '/profile', title: 'Profile', icon: <UserOutline /> }
  ];

  return (
    <div style={{ maxWidth: '430px', margin: 'auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
      <TabBar activeKey={location.pathname} onChange={value => navigate(value)}>
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default MainLayout;
