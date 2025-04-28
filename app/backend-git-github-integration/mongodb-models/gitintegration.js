const mongoose = require('mongoose');

const gitIntegrationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  githubAccessToken: { 
    type: String, 
    required: true 
  },
  githubUsername: { 
    type: String, 
    required: true 
  },
  linkedRepositories: [{
    repoId: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    private: { type: Boolean, default: false },
    defaultBranch: { type: String, default: 'main' },
    sshUrl: { type: String },
    cloneUrl: { type: String },
    lastSynced: { type: Date },
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster querying
gitIntegrationSchema.index({ userId: 1 }, { unique: true });
gitIntegrationSchema.index({ 'linkedRepositories.repoId': 1 });

module.exports = mongoose.model('GitIntegration', gitIntegrationSchema);