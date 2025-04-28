const axios = require('axios');
const aiConfig = require('../backend.configuration/ai.config');

class AIService {
  constructor() {
    // Continue.dev client setup
    this.continueClient = axios.create({
      baseURL: aiConfig.continue.baseUrl,
      headers: {
        'Authorization': `Bearer ${aiConfig.continue.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Hugging Face client setup
    this.huggingfaceClient = axios.create({
      baseURL: aiConfig.huggingface.baseUrl,
      headers: {
        'Authorization': `Bearer ${aiConfig.huggingface.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Continue.dev Methods
  async generateCode(prompt, context = '', language = 'javascript') {
    try {
      const response = await this.continueClient.post('/generate', {
        prompt,
        context,
        language,
        model: aiConfig.continue.defaultModel
      });

      return response.data;
    } catch (error) {
      console.error('Code generation error:', error);
      throw error;
    }
  }

  async reviewCode(code, language = 'javascript') {
    try {
      const response = await this.continueClient.post('/review', {
        code,
        language,
        model: aiConfig.continue.defaultModel
      });

      return response.data;
    } catch (error) {
      console.error('Code review error:', error);
      throw error;
    }
  }

  async completeCode(code, cursor_position) {
    try {
      const response = await this.continueClient.post('/complete', {
        code,
        cursor_position,
        model: aiConfig.continue.defaultModel
      });

      return response.data;
    } catch (error) {
      console.error('Code completion error:', error);
      throw error;
    }
  }

  // Hugging Face Methods
  async generateText(prompt, max_length = 100) {
    try {
      const response = await this.huggingfaceClient.post(
        `/${aiConfig.huggingface.models.textGeneration}`,
        {
          inputs: prompt,
          parameters: {
            max_length,
            num_return_sequences: 1,
            temperature: 0.7
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.huggingfaceClient.post(
        `/${aiConfig.huggingface.models.imageGeneration}`,
        {
          inputs: prompt
        },
        {
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  async classifyText(text, labels) {
    try {
      const response = await this.huggingfaceClient.post(
        `/${aiConfig.huggingface.models.textClassification}`,
        {
          inputs: text,
          parameters: {
            candidate_labels: labels
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Text classification error:', error);
      throw error;
    }
  }

  async answerQuestion(question, context) {
    try {
      const response = await this.huggingfaceClient.post(
        `/${aiConfig.huggingface.models.questionAnswering}`,
        {
          inputs: {
            question,
            context
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Question answering error:', error);
      throw error;
    }
  }

  // Helper Methods
  async retryWithExponentialBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

module.exports = new AIService(); 