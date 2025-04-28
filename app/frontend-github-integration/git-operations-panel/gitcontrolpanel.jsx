import { useState, useEffect } from 'react';
import { 
  GitCommit, GitPullRequest, GitBranch, 
  RefreshCw, Upload, Download 
} from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';

export default function GitControlPanel({ projectId }) {
  const [status, setStatus] = useState(null);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [showPRModal, setShowPRModal] = useState(false);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch(/api/github/status/${projectId});
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Status fetch failed:', err);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    try {
      const res = await fetch(/api/projects/${projectId}/git/commit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${localStorage.getItem('token')}
        },
        body: JSON.stringify({ message: commitMessage })
      });
      
      const data = await res.json();
      if (data.success) {
        setCommitMessage('');
        fetchStatus();
      }
    } catch (err) {
      console.error('Commit failed:', err);
    }
  };

  const handlePush = async () => {
    try {
      const res = await fetch(/api/projects/${projectId}/git/push, {
        method: 'POST',
        headers: {
          Authorization: Bearer ${localStorage.getItem('token')}
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
      }
    } catch (err) {
      console.error('Push failed:', err);
    }
  };

  const handlePull = async () => {
    try {
      const res = await fetch(/api/projects/${projectId}/git/pull, {
        method: 'POST',
        headers: {
          Authorization: Bearer ${localStorage.getItem('token')}
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
        // In production, you'd refresh the file system here
      }
    } catch (err) {
      console.error('Pull failed:', err);
    }
  };

  const createPR = async () => {
    try {
      const res = await fetch(/api/projects/${projectId}/git/pr, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${localStorage.getItem('token')}
        },
        body: JSON.stringify({
          title: prTitle,
          description: prDescription,
          branch: currentBranch
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowPRModal(false);
        // Show success notification
      }
    } catch (err) {
      console.error('PR creation failed:', err);
    }
  };

  useEffect(() => {
    if (projectId) fetchStatus();
  }, [projectId]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-gray-700" />
          <select 
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value)}
            className="bg-gray-100 rounded px-2 py-1 text-sm"
          >
            <option value="main">main</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchStatus}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePull}
            className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
            title="Pull changes"
          >
            <Download className="w-4 h-4" />
            <span>Pull</span>
          </button>
          
          <button
            onClick={handlePush}
            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded text-sm"
            title="Push changes"
            disabled={!status?.ahead}
          >
            <Upload className="w-4 h-4" />
            <span>Push</span>
          </button>
        </div>
      </div>
      
      {status && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Branch {currentBranch} is {status.ahead ? ${status.ahead} ahead : 'up to date'}
          </div>
          
          {status.files && status.files.length > 0 && (
            <div className="border rounded divide-y max-h-32 overflow-y-auto">
              {status.files.map((file) => (
                <div key={file.path} className="p-2 text-sm flex items-center">
                  <span className="mr-2">
                    {file.index === '?' ? '🆕' : 
                     file.working_dir === 'M' ? '✏' : '✅'}
                  </span>
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message"
          className="flex-1 border rounded px-3 py-2 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleCommit()}
        />
        
        <Button
          onClick={handleCommit}
          disabled={!commitMessage.trim()}
          className="text-sm py-2"
        >
          <GitCommit className="w-4 h-4 mr-1" />
          Commit
        </Button>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowPRModal(true)}
          className="text-sm"
        >
          <GitPullRequest className="w-4 h-4 mr-1" />
          Create Pull Request
        </Button>
      </div>
      
      {/* PR Creation Modal */}
      <Modal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        title="Create Pull Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="PR title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={prDescription}
              onChange={(e) => setPrDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Describe your changes..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPRModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createPR}
              disabled={!prTitle.trim()}
            >
              Create PR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}