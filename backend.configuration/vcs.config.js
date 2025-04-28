require('dotenv').config();

module.exports = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/vcs/github/callback',
    scope: ['repo', 'user', 'workflow'],
    apiUrl: 'https://api.github.com'
  },
  gitlab: {
    clientId: process.env.GITLAB_CLIENT_ID,
    clientSecret: process.env.GITLAB_CLIENT_SECRET,
    redirectUri: process.env.GITLAB_REDIRECT_URI || 'http://localhost:3000/api/vcs/gitlab/callback',
    scope: ['api', 'read_user', 'read_repository', 'write_repository'],
    apiUrl: process.env.GITLAB_URL || 'https://gitlab.com/api/v4'
  }
}; 