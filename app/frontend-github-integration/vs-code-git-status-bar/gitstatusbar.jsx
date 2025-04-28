import { GitBranch, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GitStatusBar({ projectId }) {
  const [branch, setBranch] = useState('main');
  const [changes, setChanges] = useState(0);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    // Poll for git status changes
    const interval = setInterval(() => {
      fetch(/api/projects/${projectId}/git/status)
        .then(res => res.json())
        .then(data => {
          if (data.current) {
            setBranch(data.current);
            setChanges(data.files?.length || 0);
            setSynced(data.ahead === 0);
          }
        })
        .catch(err => console.error('Status fetch failed:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-1 text-xs bg-gray-100 border-t">
      <div className="flex items-center gap-1">
        <GitBranch className="w-3 h-3" />
        <span>{branch}</span>
        {!synced && <span className="text-yellow-600">↑</span>}
      </div>
      
      {changes > 0 && (
        <span className="text-blue-600">{changes} changes</span>
      )}
      
      <button 
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
}