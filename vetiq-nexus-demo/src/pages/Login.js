import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';

const Login = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const onChange = (field, val) => setFormData({ ...formData, [field]: val });

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Toast.show({ icon: 'fail', content: 'Please fill all fields' });
      return;
    }

    // TEMP: Skip backend for now
    Toast.show({ icon: 'success', content: 'Login successful!' });
    setTimeout(() => navigate('/dashboard'), 1000);

    // When backend is ready, use this instead:
    /*
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        Toast.show({ icon: 'success', content: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        Toast.show({ icon: 'fail', content: data.message || 'Login failed' });
      }
    } catch (err) {
      Toast.show({ icon: 'fail', content: 'Server error' });
    }
    */
  };

  return (
    <MobileWrapper>
      <div style={{ padding: 24, textAlign: 'center', width: '100%' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="logo"
          style={{ width: 64, marginBottom: 12 }}
        />
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Welcome Back 🐾</h1>
        <p style={{ color: '#888' }}>Login to continue</p>

        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="Email">
            <Input
              placeholder="you@example.com"
              value={formData.email}
              onChange={(val) => onChange('email', val)}
            />
          </Form.Item>
          <Form.Item label="Password">
            <Input
              placeholder="••••••••"
              value={formData.password}
              type={visible ? 'text' : 'password'}
              onChange={(val) => onChange('password', val)}
              extra={
                visible ? (
                  <EyeOutline onClick={() => setVisible(false)} />
                ) : (
                  <EyeInvisibleOutline onClick={() => setVisible(true)} />
                )
              }
            />
          </Form.Item>
        </Form>

        <Button
          block
          color="primary"
          size="large"
          style={{ marginTop: 20 }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          block
          fill="none"
          style={{ marginTop: 10 }}
          onClick={() => navigate('/role-selection')}
        >
          Don’t have an account? Sign Up
        </Button>
      </div>
    </MobileWrapper>
  );
};

export default Login;
