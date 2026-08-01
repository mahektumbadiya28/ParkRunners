import mongoose from 'mongoose';

// @desc    Get system health status
// @route   GET /api/health
// @access  Public
export const getHealthStatus = async (req, res) => {
  try {
    // Check DB Connection
    const isDbConnected = mongoose.connection.readyState === 1;
    let collectionNames = [];

    if (isDbConnected) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      collectionNames = collections.map(col => col.name);
    }

    // Memory Usage
    const memoryUsage = process.memoryUsage();
    const formatMemory = (bytes) => `${Math.round((bytes / 1024 / 1024) * 100) / 100} MB`;

    const healthStatus = {
      status: isDbConnected ? 'healthy' : 'degraded',
      database: isDbConnected ? 'connected' : 'disconnected',
      uptime: `${Math.floor(process.uptime())} seconds`,
      collections: collectionNames,
      memoryUsage: {
        rss: formatMemory(memoryUsage.rss),
        heapTotal: formatMemory(memoryUsage.heapTotal),
        heapUsed: formatMemory(memoryUsage.heapUsed),
      },
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(isDbConnected ? 200 : 503).json(healthStatus);
  } catch (error) {
    console.error('Health Check Error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
};
