const aiService = require('../services/ai.service');

// Continue.dev endpoints
exports.generateCode = async (req, res) => {
  try {
    const { prompt, context, language } = req.body;
    const result = await aiService.generateCode(prompt, context, language);
    res.json(result);
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: 'Error generating code' });
  }
};

exports.reviewCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await aiService.reviewCode(code, language);
    res.json(result);
  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({ message: 'Error reviewing code' });
  }
};

exports.completeCode = async (req, res) => {
  try {
    const { code, cursor_position } = req.body;
    const result = await aiService.completeCode(code, cursor_position);
    res.json(result);
  } catch (error) {
    console.error('Code completion error:', error);
    res.status(500).json({ message: 'Error completing code' });
  }
};

// Hugging Face endpoints
exports.generateText = async (req, res) => {
  try {
    const { prompt, max_length } = req.body;
    const result = await aiService.generateText(prompt, max_length);
    res.json(result);
  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ message: 'Error generating text' });
  }
};

exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBuffer = await aiService.generateImage(prompt);
    
    // Convert buffer to base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    res.json({ image: base64Image });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ message: 'Error generating image' });
  }
};

exports.classifyText = async (req, res) => {
  try {
    const { text, labels } = req.body;
    const result = await aiService.classifyText(text, labels);
    res.json(result);
  } catch (error) {
    console.error('Text classification error:', error);
    res.status(500).json({ message: 'Error classifying text' });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;
    const result = await aiService.answerQuestion(question, context);
    res.json(result);
  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({ message: 'Error answering question' });
  }
}; 