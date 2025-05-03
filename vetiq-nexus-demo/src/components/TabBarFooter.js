import React from 'react';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  MessageOutline,
  UserOutline,
  AudioOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const TabBarFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = location.pathname.replace('/', '') || 'dashboard';

  return (
    <TabBar activeKey={activeKey} onChange={(key) => navigate(`/${key}`)}>
      <TabBar.Item key="dashboard" icon={<AppOutline />} title="Dashboard" />
      <TabBar.Item key="transcribe" icon={<AudioOutline />} title="Transcribe" />
      <TabBar.Item key="chat" icon={<MessageOutline />} title="Chat" />
      <TabBar.Item key="profile" icon={<UserOutline />} title="Profile" />
    </TabBar>
  );
};

export default TabBarFooter;
