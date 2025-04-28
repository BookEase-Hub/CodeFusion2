const Message = require('../models/Message');
const axios = require('axios');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new message
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

    // Call AI service (simplified example)  
    let aiResponse;  
    if (content.toLowerCase().includes('function') || content.toLowerCase().includes('code')) {  
      aiResponse = {  
        role: 'assistant',  
        content: "Here's an optimized version of the function you requested:",  
        code: {  
          language: "javascript",  
          value: `function fetchUserData(userId) {  
// Input validation
if (!userId || typeof userId !== 'string') {
  throw new Error('Invalid user ID');
}

return fetch(\/api/users/\${userId}\)
  .then(response => {
    if (!response.ok) {
      throw new Error(\HTTP error! status: \${response.status}\);
    }
    return response.json();
  })
  .then(data => {
    // Process and transform the data
    return {
      ...data,
      fullName: \\${data.firstName} \${data.lastName}\,
      isActive: Boolean(data.status === 'active')
    };
  })
  .catch(error => {
    console.error('Error fetching user data:', error);
    throw error;
  });
}`  
        }
      };
    } else {
      aiResponse = {
        role: 'assistant',
        content: "I can help with that! Would you like me to generate some code for this task or explain the concept in more detail?"
      };
    }

    // Save AI response  
    const aiMessage = new Message({  
      ...aiResponse,  
      userId: req.user.id  
    });  

    await aiMessage.save();  

    res.json([userMessage, aiMessage]);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};