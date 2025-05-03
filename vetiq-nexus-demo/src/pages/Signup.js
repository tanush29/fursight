import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Form, Toast } from 'antd-mobile';
import MobileWrapper from '../components/MobileWrapper';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'doctor';

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (field, val) =>
    setFormData({ ...formData, [field]: val });

  const handleSignup = async () => {
    const { name, email, password } = formData;
    if (!name || !email || !password) {
      Toast.show({ icon: 'fail', content: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    Toast.show({ icon: 'loading', content: 'Signing up...' });

    try {
      const res = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      // Handle HTTP errors, including FastAPI validation (422) responses
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
          // fallback to text
          const text = await res.text().catch(() => null);
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      // Parse success JSON
      const data = await res.json();

      if (data.success) {
        // Save userId in sessionStorage for global access
        if (data.user && data.user.id) {
          sessionStorage.setItem('userId', data.user.id);
        }
        Toast.show({ icon: 'success', content: 'Welcome aboard!' });
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        Toast.show({ icon: 'fail', content: data.message || 'Signup failed' });
      }
    } catch (err) {
      console.error('Signup error:', err);
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
    <MobileWrapper hidefooter>
      <div style={{ padding: 24, textAlign: 'center', width: '100%' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="logo"
          style={{ width: 64, marginBottom: 12 }}
        />
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create Account</h1>
        <p style={{ color: '#888' }}>
          as a {role === 'doctor' ? 'Doctor' : 'Pet Owner'}
        </p>

        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="Full Name">
            <Input
              placeholder="Dr. Jane Doe"
              value={formData.name}
              onChange={(val) => onChange('name', val)}
            />
          </Form.Item>
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
              type="password"
              value={formData.password}
              onChange={(val) => onChange('password', val)}
            />
          </Form.Item>
        </Form>

        <Button
          block
          color="primary"
          size="large"
          style={{ marginTop: 20 }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </Button>
        <Button
          block
          fill="none"
          style={{ marginTop: 10 }}
          onClick={() => navigate('/login')}
        >
          Already have an account? Log In
        </Button>
      </div>
    </MobileWrapper>
  );
};

export default Signup;
