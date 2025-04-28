const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Project = require('../models/Project');

class GitService {
  constructor(projectId, userId) {
    this.projectId = projectId;
    this.userId = userId;
    this.git = simpleGit({
      baseDir: path.join(__dirname, ../../projects/${projectId}),
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    });
  }

  async init() {
    if (!fs.existsSync(this.git.baseDir)) {
      fs.mkdirSync(this.git.baseDir, { recursive: true });
    }
    return this.git.init();
  }

  async clone(repoUrl) {
    try {
      await this.git.clone(repoUrl, this.git.baseDir);
      return { success: true };
    } catch (err) {
      console.error('Clone Error:', err);
      return { success: false, error: err.message };
    }
  }

  async commit(message, files = []) {
    try {
      if (files.length > 0) {
        await this.git.add(files);
      } else {
        await this.git.add('./*');
      }
      
      const commit = await this.git.commit(message);
      return { 
        success: true, 
        commit: commit.summary 
      };
    } catch (err) {
      console.error('Commit Error:', err);
      return { success: false, error: err.message };
    }
  }

  async push() {
    try {
      const pushResult = await this.git.push();
      return { 
        success: true, 
        result: pushResult.summary 
      };
    } catch (err) {
      console.error('Push Error:', err);
      return { success: false, error: err.message };
    }
  }

  async pull() {
    try {
      const pullResult = await this.git.pull();
      return { 
        success: true, 
        result: pullResult.summary 
      };
    } catch (err) {
      console.error('Pull Error:', err);
      return { success: false, error: err.message };
    }
  }

  async createBranch(branchName) {
    try {
      const result = await this.git.checkoutLocalBranch(branchName);
      return { 
        success: true, 
        result: result.summary 
      };
    } catch (err) {
      console.error('Branch Error:', err);
      return { success: false, error: err.message };
    }
  }

  async getStatus() {
    try {
      const status = await this.git.status();
      return {
        current: status.current,
        tracking: status.tracking,
        files: status.files,
        ahead: status.ahead,
        behind: status.behind
      };
    } catch (err) {
      console.error('Status Error:', err);
      return { error: err.message };
    }
  }

  // GitHub-specific operations
  async createPullRequest(title, body, headBranch, baseBranch = 'main') {
    try {
      const project = await Project.findById(this.projectId);
      const repo = project.gitIntegration.linkedRepositories[0];
      
      const { data } = await axios.post(
        https://api.github.com/repos/${repo.fullName}/pulls,
        { title, body, head: headBranch, base: baseBranch },
        {
          headers: {
            Authorization: token ${repo.githubAccessToken},
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      
      return { success: true, pr: data };
    } catch (err) {
      console.error('PR Error:', err.response?.data || err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = GitService;