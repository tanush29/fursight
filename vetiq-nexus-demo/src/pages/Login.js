import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';

const Login = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (field, val) =>
    setFormData({ ...formData, [field]: val });

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      Toast.show({ icon: 'fail', content: 'Please fill all fields' });
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      return;
    }

    setLoading(true);
    Toast.show({ icon: 'loading', content: 'Logging in...' });

    try {
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMessage = `Server returned ${res.status}`;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errorData = await res.json().catch(() => null);
          if (errorData) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => err.msg).join(', ');
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } else {
          const text = await res.text().catch(() => null);
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (data.success && data.user) {
        sessionStorage.removeItem('todos');
        // 1) store userId if it exists
        if (data.user.id) {
          sessionStorage.setItem('userId', data.user.id);
        }
        // 2) store userName (guaranteed to exist)
        sessionStorage.setItem('userName', data.user.name);

        Toast.show({ icon: 'success', content: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        Toast.show({ icon: 'fail', content: data.message || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error:', err);
      Toast.show({
        icon: 'fail',
        content: err.message?.includes('NetworkError')
          ? 'Network error – please check your connection'
          : err.message || 'Unexpected error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileWrapper hideFooter>
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
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Login'}
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
