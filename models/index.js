
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import DoctorList from './components/DoctorList';
import AddPatient from './components/AddPatient';

import User from './User.js';
import Patient from './Patient.js';
import Doctor from './Doctor.js';
import PatientDoctorMapping from './PatientDoctorMapping.js';

// Define associations
User.hasMany(Patient, { foreignKey: 'createdBy', as: 'patients' });
Patient.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Patient.belongsToMany(Doctor, { 
  through: PatientDoctorMapping, 
  foreignKey: 'patientId',
  otherKey: 'doctorId',
  as: 'doctors'
});

Doctor.belongsToMany(Patient, { 
  through: PatientDoctorMapping, 
  foreignKey: 'doctorId',
  otherKey: 'patientId',
  as: 'patients'
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DoctorList />} />
        <Route path="/add-patient" element={<AddPatient />} />
      </Routes>
    </BrowserRouter>
  );
}

PatientDoctorMapping.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
PatientDoctorMapping.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });







export {
  User,
  Patient,
  Doctor,
  PatientDoctorMapping
};

export default index;



