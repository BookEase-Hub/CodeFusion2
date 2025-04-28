const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { validateUser, validateLogin, validateFile } = require('../middlewares/validation');
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
  createMessage,
  generateCode
} = require('../controllers/aiController');
const {
  getFiles,
  createFile,
  updateFile,
  executeCommand
} = require('../controllers/fileController');
const {
  createSubscription,
  handleWebhook
} = require('../controllers/billingController');

// Auth routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
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

// File routes
router.route('/files')
  .get(protect, getFiles)
  .post(protect, validateFile, createFile);

router.route('/files/:id')
  .put(protect, updateFile);

router.post('/execute', protect, executeCommand);

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

router.post('/ai/code', protect, generateCode);

// Billing routes
router.post('/subscribe', protect, createSubscription);
router.post('/webhook', handleWebhook);

module.exports = router;