const analytics = require('../services/analytics.service');

const analyticsMiddleware = (req, res, next) => {
  try {
    if (req.user) {
      // Track page views for authenticated users
      analytics.trackPageView(req.user.id, req.path, {
        method: req.method,
        query: req.query,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
      });

      // Update user's last seen timestamp
      analytics.updateUserProfile(req.user, {
        last_path: req.path,
        last_activity: new Date(),
      });
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't block the request if analytics fails
  }

  next();
};

module.exports = analyticsMiddleware; 