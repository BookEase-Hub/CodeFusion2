require('dotenv').config();

module.exports = {
  continue: {
    apiKey: process.env.CONTINUE_API_KEY,
    baseUrl: process.env.CONTINUE_API_URL || 'https://api.continue.dev/v1',
    defaultModel: process.env.CONTINUE_DEFAULT_MODEL || 'gpt-4',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      textGeneration: process.env.HUGGINGFACE_TEXT_MODEL || 'gpt2',
      imageGeneration: process.env.HUGGINGFACE_IMAGE_MODEL || 'stabilityai/stable-diffusion-2',
      textClassification: process.env.HUGGINGFACE_CLASSIFICATION_MODEL || 'facebook/bart-large-mnli',
      questionAnswering: process.env.HUGGINGFACE_QA_MODEL || 'deepset/roberta-base-squad2'
    }
  }
}; 