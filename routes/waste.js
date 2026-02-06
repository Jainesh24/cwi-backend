const express = require('express');
const router = express.Router();
const WasteEntry = require('../models/WasteEntry');
const aiAnalysisService = require('../services/aiAnalysisService');
const { verifyToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * POST /api/waste - Log new waste entry with AI analysis
 */
router.post('/', async (req, res) => {
  try {
    const wasteData = {
      userId: req.user.uid,
      organizationId: req.user.organizationId,
      department: req.body.department,
      wasteType: req.body.wasteType,
      quantity: parseFloat(req.body.quantity),
      procedureCategory: req.body.procedureCategory,
      disposalMethod: req.body.disposalMethod,
      shift: req.body.shift,
      notes: req.body.notes || ''
    };

    // Perform AI analysis
    const aiAnalysis = await aiAnalysisService.analyzeWasteEntry(
      wasteData,
      req.user.organizationId
    );

    // Create waste entry with AI analysis
    const wasteEntry = new WasteEntry({
      ...wasteData,
      aiAnalysis
    });

    await wasteEntry.save();

    res.status(201).json({
      success: true,
      data: wasteEntry,
      message: 'Waste entry logged successfully'
    });

  } catch (error) {
    console.error('Error logging waste:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to log waste entry'
    });
  }
});

/**
 * GET /api/waste - Get all waste entries for organization
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, department, limit = 100 } = req.query;
    
    const query = { organizationId: req.user.organizationId };
    
    // Add filters
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (department) {
      query.department = department;
    }

    const entries = await WasteEntry.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: entries,
      count: entries.length
    });

  } catch (error) {
    console.error('Error fetching waste entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch waste entries'
    });
  }
});

/**
 * GET /api/waste/stats - Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Total waste today
    const todayWaste = await WasteEntry.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Yesterday's waste for comparison
    const yesterdayWaste = await WasteEntry.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          timestamp: { $gte: yesterday, $lt: today }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Active alerts
    const activeAlerts = await WasteEntry.countDocuments({
      organizationId: req.user.organizationId,
      'aiAnalysis.anomalyDetected': true,
      timestamp: { $gte: sevenDaysAgo }
    });

    // Waste composition (last 7 days)
    const wasteComposition = await WasteEntry.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$wasteType',
          quantity: { $sum: '$quantity' }
        }
      }
    ]);

    // 7-day trend
    const sevenDayTrend = await WasteEntry.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            wasteType: '$wasteType'
          },
          quantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Department performance
    const departmentPerformance = await WasteEntry.aggregate([
      {
        $match: {
          organizationId: req.user.organizationId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$department',
          totalQuantity: { $sum: '$quantity' },
          alertCount: {
            $sum: { $cond: ['$aiAnalysis.anomalyDetected', 1, 0] }
          }
        }
      }
    ]);

    const todayTotal = todayWaste[0]?.totalQuantity || 0;
    const yesterdayTotal = yesterdayWaste[0]?.totalQuantity || 0;
    const percentChange = yesterdayTotal > 0 
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalWasteToday: todayTotal,
        percentChange: parseFloat(percentChange),
        activeAlerts,
        wasteComposition,
        sevenDayTrend,
        departmentPerformance
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/waste/alerts - Get active alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = {
      organizationId: req.user.organizationId,
      'aiAnalysis.anomalyDetected': true
    };

    if (status === 'active') {
      query.timestamp = { $gte: sevenDaysAgo };
    }

    const alerts = await WasteEntry.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

/**
 * DELETE /api/waste/reset - Reset all data for organization
 */
router.delete('/reset', async (req, res) => {
  try {
    const result = await WasteEntry.deleteMany({
      organizationId: req.user.organizationId
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} waste entries`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset data'
    });
  }
});

module.exports = router;
