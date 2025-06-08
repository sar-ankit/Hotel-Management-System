import express from 'express';
import { Op } from 'sequelize';
import { Doctor } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest, doctorSchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new doctor
router.post('/', validateRequest(doctorSchemas.create), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Doctor created successfully',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create doctor',
      error: error.message
    });
  }
});

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialization, department } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { specialization: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    if (department) {
      whereClause.department = { [Op.iLike]: `%${department}%` };
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        doctors,
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
      message: 'Failed to retrieve doctors',
      error: error.message
    });
  }
});

// Get specific doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve doctor',
      error: error.message
    });
  }
});

// Update doctor
router.put('/:id', validateRequest(doctorSchemas.update), async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    await doctor.update(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Doctor updated successfully',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update doctor',
      error: error.message
    });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    await doctor.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
});

export default router;