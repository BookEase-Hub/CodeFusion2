const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middlewares/auth');
const GitIntegration = require('../models/GitIntegration');

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

// Initiate GitHub OAuth flow
router.get('/github/auth', (req, res) => {
  const state = req.query.userId || Date.now().toString();
  const scope = 'repo,user,write:public_key';
  
  res.redirect(
    https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID} +
    &redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)} +
    &scope=${scope}&state=${state}
  );
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    // Exchange code for access token
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const { access_token: githubAccessToken } = data;

    // Get user info from GitHub
    const { data: userData } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: token ${githubAccessToken} }
    });

    // Save or update integration
    await GitIntegration.findOneAndUpdate(
      { userId },
      {
        githubAccessToken,
        githubUsername: userData.login,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.redirect(/dashboard?github_connected=1);
  } catch (err) {
    console.error('GitHub OAuth Error:', err);
    res.redirect('/dashboard?github_error=1');
  }
});

// Get GitHub repositories
router.get('/github/repos', protect, async (req, res) => {
  try {
    const integration = await GitIntegration.findOne({ userId: req.user.id });
    if (!integration) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const { data: repos } = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: token ${integration.githubAccessToken} },
      params: { 
        per_page: 100,
        affiliation: 'owner,collaborator'
      }
    });

    res.json(repos);
  } catch (err) {
    console.error('GitHub Repo Error:', err);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Clone repository
router.post('/github/clone', protect, async (req, res) => {
  try {
    const { repoUrl, projectId } = req.body;
    const integration = await GitIntegration.findOne({ 
      userId: req.user.id 
    });
    
    if (!integration) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    // Clone logic would go here
    // In production, you'd use simple-git or a child process
    // For the example, we'll simulate success
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    
    integration.linkedRepositories.push({
      repoId: Date.now().toString(), // Would be the GitHub repo ID in reality
      name: repoName,
      fullName: repoUrl,
      sshUrl: repoUrl,
      cloneUrl: repoUrl,
      lastSynced: new Date()
    });
    
    await integration.save();

    res.json({ 
      success: true, 
      message: 'Repository cloned successfully',
      repoName
    });
  } catch (err) {
    console.error('Clone Error:', err);
    res.status(500).json({ error: 'Failed to clone repository' });
  }
});

// Get repository status
router.get('/github/status/:repoId', protect, async (req, res) => {
  try {
    const integration = await GitIntegration.findOne({ 
      userId: req.user.id,
      'linkedRepositories.repoId': req.params.repoId 
    });
    
    if (!integration) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const repo = integration.linkedRepositories.find(
      r => r.repoId === req.params.repoId
    );

    res.json({
      branch: repo.defaultBranch,
      lastSynced: repo.lastSynced,
      status: 'clean' // Would check actual git status in production
    });
  } catch (err) {
    console.error('Status Error:', err);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;