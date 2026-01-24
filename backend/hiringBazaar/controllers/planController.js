import { Plan } from '../models/Plan.js';

// @desc    Get all active plans
// @route   GET /api/plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new plan (Admin only)
// @route   POST /api/plans
export const createPlan = async (req, res) => {
  try {
    const { name, displayName, description, features } = req.body;

    const plan = await Plan.create({
      name,
      displayName,
      description,
      features
    });

    res.status(201).json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update plan (Admin only)
// @route   PUT /api/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const { displayName, description, features, isActive } = req.body;

    Object.assign(plan, { displayName, description, features, isActive });

    await plan.save();

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};