const axios = require('axios');
const Message = require('../models/Message');

// Configure Continue.dev API
const CONTINUE_API = 'https://api.continue.dev/v1';
const CONTINUE_API_KEY = process.env.CONTINUE_API_KEY;

exports.getMessages = async (req, res) => {
  // ... existing implementation ...
};

exports.createMessage = async (req, res) => {
  try {
    const { content, code } = req.body;

    // Save user message
    const userMessage = new Message({
      role: 'user',
      content,
      code,
      userId: req.user.id
    });
    await userMessage.save();

    // Call Continue.dev API
    const response = await axios.post(
      ${CONTINUE_API}/chat/completions,
      {
        messages: [{
          role: 'user',
          content: content,
          ...(code && { code: code.value })
        }],
        model: 'continue-model', // Your preferred model
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': Bearer ${CONTINUE_API_KEY},
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message;

    // Save AI response
    const aiMessage = new Message({
      role: 'assistant',
      content: aiResponse.content,
      code: aiResponse.code ? {
        language: code?.language || 'javascript',
        value: aiResponse.code
      } : undefined,
      userId: req.user.id
    });
    await aiMessage.save();

    res.json([userMessage, aiMessage]);
  } catch (err) {
    console.error('AI Error:', err.response?.data || err.message);
    res.status(500).send('AI service error');
  }
};

// Additional AI endpoints
exports.generateCode = async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    const response = await axios.post(
      ${CONTINUE_API}/code/completions,
      {
        prompt,
        context,
        language: req.body.language || 'javascript',
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': Bearer ${CONTINUE_API_KEY},
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Code Generation Error:', err.response?.data || err.message);
    res.status(500).send('Code generation failed');
  }
};