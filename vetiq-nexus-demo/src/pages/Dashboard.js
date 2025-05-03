import React, { useState } from 'react';
import { CalendarOutline, CheckOutline } from 'antd-mobile-icons';
import { Input, Button, Toast } from 'antd-mobile';
import MobileWrapper from '../components/MobileWrapper';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import '../index.css';

const defaultTodos = [
  { text: 'Give Bella antibiotics at 9 AM', done: false },
  { text: 'Schedule annual checkup', done: false },
  { text: 'Order prescription refill', done: true },
];

const Dashboard = () => {
  const [view, setView] = useState('upcoming');
  const [todos, setTodos] = useState(() => {
    const stored = sessionStorage.getItem('todos');
    return stored ? JSON.parse(stored) : defaultTodos;
  });

  const [query, setQuery] = useState('');
  const [chartInfo, setChartInfo] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);

  const appointments = [
    { date: '2025-05-04', time: '10:00 AM', vet: 'Dr. Smith', pet: 'Bella', notes: 'Follow-up on ear infection' },
    { date: '2025-05-01', time: '3:00 PM',  vet: 'Dr. Jane',  pet: 'Bella', notes: 'Vaccination' },
    { date: '2025-04-27', time: '1:00 PM',  vet: 'Dr. Raj',   pet: 'Bella', notes: 'Dental cleaning' },
  ];

  const toggleTodo = (index) => {
    const updated = [...todos];
    updated[index].done = !updated[index].done;
    updated.sort((a, b) => a.done - b.done);
    setTodos(updated);
    sessionStorage.setItem('todos', JSON.stringify(updated));
  };

  const handleVisualize = async () => {
    if (!query.trim()) {
      Toast.show({ icon: 'fail', content: 'Please enter a question.' });
      return;
    }
    setLoadingChart(true);
    try {
      const patient_id = sessionStorage.getItem('userName') || '';
      const res = await fetch('http://127.0.0.1:8000/chart-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id, question: query.trim() })
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setChartInfo(data.chart);
    } catch (err) {
      console.error(err);
      Toast.show({ icon: 'fail', content: err.message || 'Visualization failed' });
    } finally {
      setLoadingChart(false);
    }
  };

  const renderChart = () => {
    if (!chartInfo) return null;
    const data = chartInfo.labels.map((label, i) => ({
      name: label,
      value: chartInfo.values[i] ?? 0,
    }));
    switch (chartInfo.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1677ff" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1677ff" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#1677ff"
                label
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={['#1677ff','#888888'][index % 2]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <MobileWrapper active="dashboard">
      <div className="dashboard-page">
        {/* Toggle */}
        <div className="dashboard-toggle-wrapper">
          <div className="dashboard-toggle-card">
            <button
              className={`toggle-pill ${view === 'upcoming' ? 'active' : ''}`}
              onClick={() => setView('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`toggle-pill ${view === 'past' ? 'active' : ''}`}
              onClick={() => setView('past')}
            >
              Past
            </button>
          </div>
        </div>

        {/* Appointments */}
        <div className="calendar-section">
          <h3>
            <CalendarOutline style={{ marginRight: 6 }} />
            {view === 'upcoming' ? 'Upcoming Appointments' : 'Past Appointments'}
          </h3>
          <div className="calendar-block">
            {appointments
              .filter((a) =>
                view === 'upcoming'
                  ? new Date(a.date) >= new Date()
                  : new Date(a.date) < new Date()
              )
              .map((a, i) => (
                <div key={i} className="calendar-card">
                  <strong>{a.pet}</strong> with {a.vet}<br/>
                  {a.date} @ {a.time}
                  <div className="calendar-notes">{a.notes}</div>
                </div>
              ))}
          </div>
        </div>

        {/* To-Do List */}
        <div className="todo-section">
          <h3><CheckOutline style={{ marginRight: 6 }} />To-Do List</h3>
          <ul className="todo-list">
            {todos.map((task, i) => (
              <li
                key={i}
                className={`todo-item ${task.done ? 'done' : ''}`}
                onClick={() => toggleTodo(i)}
              >
                <input type="checkbox" checked={task.done} readOnly />
                <span>{task.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visualization Box */}
        <div className="chart-section" style={{ padding: '16px' }}>
          <h3>Visualize Data</h3>
          <Input
            placeholder="Enter question to visualize"
            value={query}
            onChange={setQuery}
            clearable
            style={{ marginBottom: 8 }}
          />
          <Button
            block
            color="primary"
            size="small"
            onClick={handleVisualize}
            loading={loadingChart}
          >
            Visualize
          </Button>
          {chartInfo && (
            <div className="chart-box" style={{ marginTop: 16 }}>
              <h4 style={{ textAlign: 'center' }}>{chartInfo.title}</h4>
              {renderChart()}
            </div>
          )}
        </div>

        {/* Doctors */}
        <div className="nearby-doctors">
          <h3>Your Doctors</h3>
          <div className="doctor-card">👩‍⚕️ Dr. Maya – PetCare SF</div>
          <div className="doctor-card">👨‍⚕️ Dr. Arjun – BayVet Clinic</div>
        </div>
      </div>
    </MobileWrapper>
  );
};

export default Dashboard;
