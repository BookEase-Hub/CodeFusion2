import { useState } from 'react';
import { GitHub, GitFork, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function GitHubConnectButton({ projectId }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const openModal = async () => {
    setIsOpen(true);
    if (!user.githubConnected) {
      // Redirect to OAuth flow
      window.location.href = /api/github/auth?userId=${user.id};
      return;
    }
    await fetchRepos();
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/repos', {
        headers: { Authorization: Bearer ${localStorage.getItem('token')} }
      });
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error('Failed to fetch repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/github/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${localStorage.getItem('token')}
        },
        body: JSON.stringify({
          repoUrl: selectedRepo.clone_url,
          projectId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        window.location.reload(); // Refresh to show cloned files
      }
    } catch (err) {
      console.error('Clone failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
      >
        <GitHub className="w-5 h-5" />
        <span>{user.githubConnected ? 'GitHub' : 'Connect GitHub'}</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="GitHub Repositories"
      >
        {user.githubConnected ? (
          <>
            {loading && !repos.length ? (
              <div className="py-8 text-center">Loading repositories...</div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto mb-4">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`p-3 border rounded mb-2 cursor-pointer ${
                        selectedRepo?.id === repo.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{repo.name}</div>
                      <div className="text-sm text-gray-600">{repo.description}</div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <GitFork className="w-4 h-4 mr-1" />
                        <span className="mr-3">{repo.forks_count}</span>
                        <GitBranch className="w-4 h-4 mr-1" />
                        <span>{repo.default_branch}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClone}
                    disabled={!selectedRepo || loading}
                    loading={loading}
                  >
                    {selectedRepo ? Clone ${selectedRepo.name} : 'Select a repo'}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center p-6">
            <GitHub className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <h3 className="text-lg font-medium mb-2">Connect GitHub</h3>
            <p className="text-gray-600 mb-6">
              Connect your GitHub account to clone repositories and sync your work.
            </p>
            <Button
              onClick={() => {
                window.location.href = /api/github/auth?userId=${user.id};
              }}
            >
              Connect GitHub
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}