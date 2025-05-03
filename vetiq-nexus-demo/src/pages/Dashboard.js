import React, { useState } from 'react';
import { CalendarOutline, CheckOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';
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
