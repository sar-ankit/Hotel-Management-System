import express from 'express';
import { PatientDoctorMapping, Patient, Doctor } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, mappingSchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create patient-doctor mapping
router.post('/', validateRequest(mappingSchemas.create), async (req, res) => {
  try {
    const { patientId, doctorId, notes } = req.body;

    // Verify patient exists and belongs to authenticated user
    const patient = await Patient.findOne({
      where: {
        id: patientId,
        createdBy: req.user.id
      }
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found or access denied'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Check if mapping already exists
    const existingMapping = await PatientDoctorMapping.findOne({
      where: { patientId, doctorId }
    });

    if (existingMapping) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient is already assigned to this doctor'
      });
    }

    // Create mapping
    const mapping = await PatientDoctorMapping.create({
      patientId,
      doctorId,
      notes
    });

    // Fetch mapping with related data
    const mappingWithDetails = await PatientDoctorMapping.findByPk(mapping.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Patient assigned to doctor successfully',
      data: { mapping: mappingWithDetails }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create mapping',
      error: error.message
    });
  }
});

// Get all patient-doctor mappings
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: mappings } = await PatientDoctorMapping.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Patient, 
          as: 'patient',
          where: { createdBy: req.user.id }
        },
        { model: Doctor, as: 'doctor' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        mappings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve mappings',
      error: error.message
    });
  }
});

// Get all doctors assigned to a specific patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists and belongs to authenticated user
    const patient = await Patient.findOne({
      where: {
        id: patientId,
        createdBy: req.user.id
      }
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found or access denied'
      });
    }

    const mappings = await PatientDoctorMapping.findAll({
      where: { patientId },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { mappings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient mappings',
      error: error.message
    });
  }
});

// Remove doctor from patient
router.delete('/:id', async (req, res) => {
  try {
    const mapping = await PatientDoctorMapping.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          where: { createdBy: req.user.id }
        }
      ]
    });

    if (!mapping) {
      return res.status(404).json({
        status: 'error',
        message: 'Mapping not found or access denied'
      });
    }

    await mapping.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Doctor removed from patient successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove mapping',
      error: error.message
    });
  }
});

export default router;