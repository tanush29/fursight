import React from 'react';
import { Button, Space } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import MobileWrapper from '../components/MobileWrapper';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <MobileWrapper hideFooter>
      <div style={styles.container}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="VetIQ Logo"
          style={styles.logo}
        />
        <h1 style={styles.heading}>Welcome to VetIQ Nexus</h1>
        <p style={styles.subheading}>Select your role to get started</p>

        <Space direction="vertical" block style={{ width: '100%', marginTop: 32 }}>
          <Button
            block
            color="primary"
            size="large"
            onClick={() => navigate('/signup?role=doctor')}
          >
            👩‍⚕️ I'm a Doctor
          </Button>
          <Button
            block
            color="default"
            size="large"
            onClick={() => navigate('/signup?role=patient')}
          >
            🐶 I'm a Pet Owner
          </Button>
        </Space>
      </div>
    </MobileWrapper>
  );
};

const styles = {
  container: {
    padding: 24,
    textAlign: 'center',
    width: '100%',
  },
  logo: {
    width: 72,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    marginBottom: 4,
  },
  subheading: {
    color: '#888',
  },
};

export default RoleSelection;
