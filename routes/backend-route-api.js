const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  updateSubscription
} = require('../controllers/authController');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const {
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration
} = require('../controllers/integrationController');
const {
  getMessages,
  createMessage
} = require('../controllers/aiController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, updateAvatar);
router.put('/subscription', protect, updateSubscription);

// Project routes
router.route('/projects')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/projects/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Integration routes
router.route('/integrations')
  .get(protect, getIntegrations)
  .post(protect, createIntegration);

router.route('/integrations/:id')
  .put(protect, updateIntegration)
  .delete(protect, deleteIntegration);

// AI routes
router.route('/ai/messages')
  .get(protect, getMessages)
  .post(protect, createMessage);

module.exports = router;