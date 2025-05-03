import React from 'react';
import { NavBar, List, Card } from 'antd-mobile';
import { EditSOutline } from 'antd-mobile-icons';
import MobileWrapper from '../components/MobileWrapper';

const Profile = () => {
  const dogProfile = {
    name: 'Bella',
    breed: 'Golden Retriever',
    age: '3 years',
    weight: '30 kg',
    medications: ['Amoxicillin - 2x daily', 'Fish Oil - 1x daily'],
    allergies: ['Chicken', 'Beef'],
    lastCheckup: '2025-04-27'
  };

  return (
    <MobileWrapper active="profile">
      <NavBar
        back={null}
        right={
          <EditSOutline
            style={{ fontSize: 22, color: '#1677ff' }}
            onClick={() => alert('Edit profile coming soon')}
          />
        }
      >
        🐶 Pet Profile
      </NavBar>

      <div style={{ padding: 16 }}>
        <Card title="Pet Details" style={{ marginBottom: 16 }}>
          <List>
            <List.Item extra={dogProfile.name}>Name</List.Item>
            <List.Item extra={dogProfile.breed}>Breed</List.Item>
            <List.Item extra={dogProfile.age}>Age</List.Item>
            <List.Item extra={dogProfile.weight}>Weight</List.Item>
            <List.Item extra={dogProfile.lastCheckup}>Last Checkup</List.Item>
          </List>
        </Card>

        <Card title="Medications" style={{ marginBottom: 16 }}>
          <List>
            {dogProfile.medications.map((med, index) => (
              <List.Item key={index}>{med}</List.Item>
            ))}
          </List>
        </Card>

        <Card title="Allergies">
          <List>
            {dogProfile.allergies.map((item, index) => (
              <List.Item key={index}>{item}</List.Item>
            ))}
          </List>
        </Card>
      </div>
    </MobileWrapper>
  );
};

export default Profile;
