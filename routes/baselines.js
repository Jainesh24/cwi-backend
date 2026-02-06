const express = require('express');
const router = express.Router();
const Baseline = require('../models/Baseline');
const { verifyToken } = require('../middleware/auth');

// Apply auth middleware
router.use(verifyToken);

/**
 * POST /api/baselines - Create or update department baseline
 */
router.post('/', async (req, res) => {
  try {
    const baselineData = {
      organizationId: req.user.organizationId,
      department: req.body.department,
      expectedDaily: parseFloat(req.body.expectedDaily),
      riskThreshold: parseFloat(req.body.riskThreshold),
      infectiousRatio: parseFloat(req.body.infectiousRatio),
      sharpsRatio: parseFloat(req.body.sharpsRatio),
      costPerKg: parseFloat(req.body.costPerKg)
    };

    // Upsert (update or insert)
    const baseline = await Baseline.findOneAndUpdate(
      {
        organizationId: req.user.organizationId,
        department: req.body.department
      },
      baselineData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(201).json({
      success: true,
      data: baseline,
      message: 'Baseline saved successfully'
    });

  } catch (error) {
    console.error('Error saving baseline:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save baseline'
    });
  }
});

/**
 * GET /api/baselines - Get all baselines for organization
 */
router.get('/', async (req, res) => {
  try {
    const baselines = await Baseline.find({
      organizationId: req.user.organizationId
    }).sort({ department: 1 });

    res.json({
      success: true,
      data: baselines
    });

  } catch (error) {
    console.error('Error fetching baselines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch baselines'
    });
  }
});

/**
 * DELETE /api/baselines/:department - Delete a department baseline
 */
router.delete('/:department', async (req, res) => {
  try {
    const result = await Baseline.findOneAndDelete({
      organizationId: req.user.organizationId,
      department: req.params.department
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Baseline not found'
      });
    }

    res.json({
      success: true,
      message: 'Baseline deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting baseline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete baseline'
    });
  }
});

module.exports = router;
