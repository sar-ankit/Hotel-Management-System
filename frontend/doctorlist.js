import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get('/api/doctors', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setDoctors(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Doctors</h2>
      <ul>
        {doctors.map(doc => (
          <li key={doc.id}>{doc.firstName} {doc.lastName} — {doc.specialization}</li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorList;
