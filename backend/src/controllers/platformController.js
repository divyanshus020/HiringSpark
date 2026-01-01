import { Platform } from '../models/Platform.js';

// @desc    Get all active platforms
// @route   GET /api/platforms
export const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find({ isActive: true });
    
    res.json({
      success: true,
      count: platforms.length,
      platforms
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single platform
// @route   GET /api/platforms/:id
export const getPlatform = async (req, res) => {
  try {
    const platform = await Platform.findById(req.params.id);
    
    if (!platform) {
      return res.status(404).json({ 
        success: false, 
        message: 'Platform not found' 
      });
    }
    
    res.json({
      success: true,
      platform
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};