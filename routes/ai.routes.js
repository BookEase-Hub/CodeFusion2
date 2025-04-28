const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const aiController = require('../controllers/ai.controller');

// Continue.dev routes
router.post('/code/generate', verifyToken, aiController.generateCode);
router.post('/code/review', verifyToken, aiController.reviewCode);
router.post('/code/complete', verifyToken, aiController.completeCode);

// Hugging Face routes
router.post('/text/generate', verifyToken, aiController.generateText);
router.post('/image/generate', verifyToken, aiController.generateImage);
router.post('/text/classify', verifyToken, aiController.classifyText);
router.post('/qa/answer', verifyToken, aiController.answerQuestion);

module.exports = router; 