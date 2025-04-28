const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const File = require('../models/File');

describe('File Operations', () => {
  let token;
  let projectId;

  beforeAll(async () => {
    // Create test user and get token
    await request(app)
      .post('/api/v1/register')
      .send({
        name: 'File Test User',
        email: 'filetest@example.com',
        password: 'password123'
      });
    
    const loginRes = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'filetest@example.com',
        password: 'password123'
      });
    
    token = loginRes.body.token;

    // Create test project
    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', Bearer ${token})
      .send({
        name: 'Test Project',
        description: 'Test project for file operations',
        language: 'javascript'
      });
    
    projectId = projectRes.body._id;
  });

  it('should create a new file', async () => {
    const res = await request(app)
      .post('/api/v1/files')
      .set('Authorization', Bearer ${token})
      .send({
        name: 'test.js',
        projectId,
        content: 'console.log("Hello");',
        language: 'javascript'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id');
  });

  // Add more tests...
});