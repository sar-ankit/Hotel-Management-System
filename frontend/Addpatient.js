import React, { useState } from 'react';
import axios from 'axios';

const AddPatient = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', address: '', medicalHistory: '',
    emergencyContact: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/patients', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Patient added');
    } catch (err) {
      alert('Error adding patient');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Patient</h2>
      {Object.keys(form).map(key => (
        <input key={key} name={key} placeholder={key} value={form[key]} onChange={handleChange} required />
      ))}
      <button type="submit">Save</button>
    </form>
  );
};

export default AddPatient;
