const vcsService = require('../services/vcs.service');
const User = require('../models/user.model');

// GitHub Controllers
exports.getGithubProfile = async (req, res) => {
  try {
    const profile = await vcsService.getGithubUserProfile(req.user.githubToken);
    res.json(profile);
  } catch (error) {
    console.error('Get GitHub profile error:', error);
    res.status(500).json({ message: 'Error fetching GitHub profile' });
  }
};

exports.getGithubRepositories = async (req, res) => {
  try {
    const repositories = await vcsService.getGithubRepositories(req.user.githubToken);
    res.json(repositories);
  } catch (error) {
    console.error('Get GitHub repositories error:', error);
    res.status(500).json({ message: 'Error fetching GitHub repositories' });
  }
};

exports.createGithubRepository = async (req, res) => {
  try {
    const repository = await vcsService.createGithubRepository(req.user.githubToken, req.body);
    res.json(repository);
  } catch (error) {
    console.error('Create GitHub repository error:', error);
    res.status(500).json({ message: 'Error creating GitHub repository' });
  }
};

exports.getGithubBranches = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branches = await vcsService.getGithubBranches(req.user.githubToken, owner, repo);
    res.json(branches);
  } catch (error) {
    console.error('Get GitHub branches error:', error);
    res.status(500).json({ message: 'Error fetching GitHub branches' });
  }
};

exports.createGithubPullRequest = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const pullRequest = await vcsService.createGithubPullRequest(
      req.user.githubToken,
      owner,
      repo,
      req.body
    );
    res.json(pullRequest);
  } catch (error) {
    console.error('Create GitHub pull request error:', error);
    res.status(500).json({ message: 'Error creating GitHub pull request' });
  }
};

// GitLab Controllers
exports.getGitlabProfile = async (req, res) => {
  try {
    const profile = await vcsService.getGitlabUserProfile(req.user.gitlabToken);
    res.json(profile);
  } catch (error) {
    console.error('Get GitLab profile error:', error);
    res.status(500).json({ message: 'Error fetching GitLab profile' });
  }
};

exports.getGitlabProjects = async (req, res) => {
  try {
    const projects = await vcsService.getGitlabProjects(req.user.gitlabToken);
    res.json(projects);
  } catch (error) {
    console.error('Get GitLab projects error:', error);
    res.status(500).json({ message: 'Error fetching GitLab projects' });
  }
};

exports.createGitlabProject = async (req, res) => {
  try {
    const project = await vcsService.createGitlabProject(req.user.gitlabToken, req.body);
    res.json(project);
  } catch (error) {
    console.error('Create GitLab project error:', error);
    res.status(500).json({ message: 'Error creating GitLab project' });
  }
};

exports.getGitlabBranches = async (req, res) => {
  try {
    const { projectId } = req.params;
    const branches = await vcsService.getGitlabBranches(req.user.gitlabToken, projectId);
    res.json(branches);
  } catch (error) {
    console.error('Get GitLab branches error:', error);
    res.status(500).json({ message: 'Error fetching GitLab branches' });
  }
};

exports.createGitlabMergeRequest = async (req, res) => {
  try {
    const { projectId } = req.params;
    const mergeRequest = await vcsService.createGitlabMergeRequest(
      req.user.gitlabToken,
      projectId,
      req.body
    );
    res.json(mergeRequest);
  } catch (error) {
    console.error('Create GitLab merge request error:', error);
    res.status(500).json({ message: 'Error creating GitLab merge request' });
  }
};

// OAuth Callbacks
exports.handleGithubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: vcsConfig.github.clientId,
      client_secret: vcsConfig.github.clientSecret,
      code,
      redirect_uri: vcsConfig.github.redirectUri
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    // Update user with GitHub token
    await User.findByIdAndUpdate(req.user.id, {
      githubToken: access_token
    });

    res.redirect('/dashboard/repositories');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect('/dashboard/repositories?error=github_auth_failed');
  }
};

exports.handleGitlabCallback = async (req, res) => {
  try {
    const { code } = req.query;
    // Exchange code for access token
    const tokenResponse = await axios.post('https://gitlab.com/oauth/token', {
      client_id: vcsConfig.gitlab.clientId,
      client_secret: vcsConfig.gitlab.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: vcsConfig.gitlab.redirectUri
    });

    const { access_token } = tokenResponse.data;

    // Update user with GitLab token
    await User.findByIdAndUpdate(req.user.id, {
      gitlabToken: access_token
    });

    res.redirect('/dashboard/repositories');
  } catch (error) {
    console.error('GitLab OAuth callback error:', error);
    res.redirect('/dashboard/repositories?error=gitlab_auth_failed');
  }
}; 