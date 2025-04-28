const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const vcsController = require('../controllers/vcs.controller');

// GitHub routes
router.get('/github/profile', verifyToken, vcsController.getGithubProfile);
router.get('/github/repositories', verifyToken, vcsController.getGithubRepositories);
router.post('/github/repositories', verifyToken, vcsController.createGithubRepository);
router.get('/github/repositories/:owner/:repo/branches', verifyToken, vcsController.getGithubBranches);
router.post('/github/repositories/:owner/:repo/pulls', verifyToken, vcsController.createGithubPullRequest);

// GitLab routes
router.get('/gitlab/profile', verifyToken, vcsController.getGitlabProfile);
router.get('/gitlab/projects', verifyToken, vcsController.getGitlabProjects);
router.post('/gitlab/projects', verifyToken, vcsController.createGitlabProject);
router.get('/gitlab/projects/:projectId/branches', verifyToken, vcsController.getGitlabBranches);
router.post('/gitlab/projects/:projectId/merge_requests', verifyToken, vcsController.createGitlabMergeRequest);

// OAuth routes
router.get('/github/callback', verifyToken, vcsController.handleGithubCallback);
router.get('/gitlab/callback', verifyToken, vcsController.handleGitlabCallback);

module.exports = router; 