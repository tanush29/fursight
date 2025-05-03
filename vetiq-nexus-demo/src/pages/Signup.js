import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Form, Toast } from 'antd-mobile';
import MobileWrapper from '../components/MobileWrapper';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'doctor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const onChange = (field, val) =>
    setFormData({ ...formData, [field]: val });

  const handleSignup = async () => {
    const { name, email, password } = formData;
    if (!name || !email || !password) {
      Toast.show({ icon: 'fail', content: 'Please fill all fields' });
      return;
    }

    Toast.show({ icon: 'loading', content: 'Signing up...' });

    try {
      const res = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (data.success) {
        Toast.show({ icon: 'success', content: 'Signup successful!' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        Toast.show({ icon: 'fail', content: data.message || 'Signup failed' });
      }
    } catch (err) {
      Toast.show({ icon: 'fail', content: 'Server error' });
    }
  };

  return (
    <MobileWrapper>
      <div style={{ padding: 24, textAlign: 'center', width: '100%' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="logo"
          style={{ width: 64, marginBottom: 12 }}
        />
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create Account</h1>
        <p style={{ color: '#888' }}>as a {role === 'doctor' ? 'Doctor' : 'Pet Owner'}</p>

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
        >
          Sign Up
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
