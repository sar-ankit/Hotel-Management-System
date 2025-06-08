import express from 'express';
import { Patient } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, patientSchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new patient
router.post('/', validateRequest(patientSchemas.create), async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      createdBy: req.user.id
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      status: 'success',
      message: 'Patient created successfully',
      data: { patient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create patient',
      error: error.message
    });
  }
});

// Get all patients created by authenticated user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { createdBy: req.user.id };
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        patients,
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
      message: 'Failed to retrieve patients',
      error: error.message
    });
  }
});

// Get specific patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient',
      error: error.message
    });
  }
});

// Update patient
router.put('/:id', validateRequest(patientSchemas.update), async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    await patient.update(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Patient updated successfully',
      data: { patient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update patient',
      error: error.message
    });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    await patient.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete patient',
      error: error.message
    });
  }
});

export default router;