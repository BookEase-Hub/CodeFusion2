const axios = require('axios');
const vcsConfig = require('../backend.configuration/vcs.config');

class VCSService {
  constructor() {
    this.githubClient = axios.create({
      baseURL: vcsConfig.github.apiUrl,
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    this.gitlabClient = axios.create({
      baseURL: vcsConfig.gitlab.apiUrl
    });
  }

  // GitHub Methods
  async getGithubUserProfile(accessToken) {
    try {
      const response = await this.githubClient.get('/user', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub get user profile error:', error);
      throw error;
    }
  }

  async getGithubRepositories(accessToken) {
    try {
      const response = await this.githubClient.get('/user/repos', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          sort: 'updated',
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub get repositories error:', error);
      throw error;
    }
  }

  async createGithubRepository(accessToken, data) {
    try {
      const response = await this.githubClient.post('/user/repos', data, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub create repository error:', error);
      throw error;
    }
  }

  async getGithubBranches(accessToken, owner, repo) {
    try {
      const response = await this.githubClient.get(`/repos/${owner}/${repo}/branches`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub get branches error:', error);
      throw error;
    }
  }

  async createGithubPullRequest(accessToken, owner, repo, data) {
    try {
      const response = await this.githubClient.post(
        `/repos/${owner}/${repo}/pulls`,
        data,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('GitHub create pull request error:', error);
      throw error;
    }
  }

  // GitLab Methods
  async getGitlabUserProfile(accessToken) {
    try {
      const response = await this.gitlabClient.get('/user', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitLab get user profile error:', error);
      throw error;
    }
  }

  async getGitlabProjects(accessToken) {
    try {
      const response = await this.gitlabClient.get('/projects', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          membership: true,
          order_by: 'last_activity_at',
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      console.error('GitLab get projects error:', error);
      throw error;
    }
  }

  async createGitlabProject(accessToken, data) {
    try {
      const response = await this.gitlabClient.post('/projects', data, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitLab create project error:', error);
      throw error;
    }
  }

  async getGitlabBranches(accessToken, projectId) {
    try {
      const response = await this.gitlabClient.get(`/projects/${projectId}/repository/branches`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('GitLab get branches error:', error);
      throw error;
    }
  }

  async createGitlabMergeRequest(accessToken, projectId, data) {
    try {
      const response = await this.gitlabClient.post(
        `/projects/${projectId}/merge_requests`,
        data,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('GitLab create merge request error:', error);
      throw error;
    }
  }

  // Common Methods
  async cloneRepository(accessToken, provider, repoUrl, branch = 'main') {
    try {
      // Implementation will depend on your server setup
      // You might want to use simple-git or similar library
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Clone repository error:', error);
      throw error;
    }
  }

  async commitAndPush(accessToken, provider, repoPath, message, branch = 'main') {
    try {
      // Implementation will depend on your server setup
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Commit and push error:', error);
      throw error;
    }
  }
}

module.exports = new VCSService(); 