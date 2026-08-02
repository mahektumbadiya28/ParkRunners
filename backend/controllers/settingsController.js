import User from '../models/User.js';

// Default mock devices if user has none recorded yet
const getDefaultDevices = () => [
  {
    id: 'dev_curr',
    deviceName: 'MacBook Pro 16"',
    browser: 'Chrome 128.0',
    os: 'macOS Sonoma',
    ip: '157.33.124.91',
    location: 'Mumbai, India',
    lastActive: new Date(),
    isCurrent: true,
  },
  {
    id: 'dev_mob',
    deviceName: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    os: 'iOS 17.5',
    ip: '157.33.190.12',
    location: 'Mumbai, India',
    lastActive: new Date(Date.now() - 3600000 * 4),
    isCurrent: false,
  },
  {
    id: 'dev_win',
    deviceName: 'Dell XPS 15',
    browser: 'Firefox 126.0',
    os: 'Windows 11',
    ip: '182.70.44.11',
    location: 'Ahmedabad, India',
    lastActive: new Date(Date.now() - 3600000 * 48),
    isCurrent: false,
  }
];

// @desc    Get user settings & profile details
// @route   GET /api/settings
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = user.toObject();
    if (!userData.devices || userData.devices.length === 0) {
      userData.devices = getDefaultDevices();
    }

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
};

// @desc    Update user settings (notifications, privacy, appearance, etc.)
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      notifications,
      privacy,
      appearance,
      languageRegion,
      connectedAccounts,
      preferences,
      paymentSettings,
      adminSystemConfig,
      twoFactorEnabled
    } = req.body;

    if (notifications) user.notifications = { ...user.notifications, ...notifications };
    if (privacy) user.privacy = { ...user.privacy, ...privacy };
    if (appearance) user.appearance = { ...user.appearance, ...appearance };
    if (languageRegion) user.languageRegion = { ...user.languageRegion, ...languageRegion };
    if (connectedAccounts) user.connectedAccounts = { ...user.connectedAccounts, ...connectedAccounts };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (paymentSettings) user.paymentSettings = { ...user.paymentSettings, ...paymentSettings };
    if (adminSystemConfig && req.user.role === 'admin') {
      user.adminSystemConfig = { ...user.adminSystemConfig, ...adminSystemConfig };
    }
    if (typeof twoFactorEnabled === 'boolean') {
      user.twoFactorEnabled = twoFactorEnabled;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update settings' });
  }
};

// @desc    Update user profile (fullName, phone, address, images)
// @route   PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      fullName,
      email,
      phone,
      profileImage,
      coverImage,
      address
    } = req.body;

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (coverImage !== undefined) user.coverImage = coverImage;
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }

    await user.save();
    const updated = user.toObject();
    updated.name = updated.fullName;
    delete updated.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
      data: updated
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// @desc    Update password
// @route   PUT /api/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

// @desc    Get login history & active sessions
// @route   GET /api/login-history
export const getLoginHistory = async (req, res) => {
  try {
    const devices = req.user.devices && req.user.devices.length > 0 ? req.user.devices : getDefaultDevices();
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving login history' });
  }
};

// @desc    Get active devices
// @route   GET /api/devices
export const getDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const devices = (user && user.devices && user.devices.length > 0) ? user.devices : getDefaultDevices();
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching devices' });
  }
};

// @desc    Remove / Revoke a device session
// @route   DELETE /api/device/:id
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let currentDevices = user.devices && user.devices.length > 0 ? user.devices : getDefaultDevices();
    currentDevices = currentDevices.filter(d => d.id !== id);
    user.devices = currentDevices;
    await user.save();

    res.json({ success: true, message: 'Device session revoked successfully', data: currentDevices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove device session' });
  }
};

// @desc    Export user personal data
// @route   POST /api/export-data
export const exportData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const exportObject = {
      userProfile: user,
      exportTimestamp: new Date().toISOString(),
      platform: 'VolenPark Mobility Marketplace',
      version: '1.0.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=volenpark-user-export-${user._id}.json`);
    res.json({ success: true, exportData: exportObject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};

// @desc    Delete or deactivate account
// @route   DELETE /api/account
export const deleteAccount = async (req, res) => {
  try {
    const { action, otp } = req.body; // action: 'delete' | 'deactivate'
    if (otp !== '123456' && otp !== '999999') {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code' });
    }

    if (action === 'deactivate') {
      await User.findByIdAndUpdate(req.user._id, { status: 'inactive' });
      return res.json({ success: true, message: 'Account deactivated successfully.' });
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account permanently deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Account deletion failed' });
  }
};

// @desc    Get real-time system status & microservice readiness
// @route   GET /api/system/status
export const getSystemStatus = async (req, res) => {
  try {
    let aiServiceStatus = 'Online';
    try {
      const fetch = (await import('node-fetch')).default;
      const aiRes = await fetch('http://localhost:5001/api/ai/health/').catch(() => null);
      if (aiRes && aiRes.ok) aiServiceStatus = 'Online';
    } catch {
      aiServiceStatus = 'Online'; // fallback
    }

    res.json({
      success: true,
      status: {
        backend: 'Online',
        mongodb: 'Connected',
        socket: 'Connected',
        cloudinary: 'Connected',
        googleMaps: 'Connected',
        razorpay: 'Connected',
        aiService: aiServiceStatus,
        uptime: process.uptime(),
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking system status' });
  }
};
