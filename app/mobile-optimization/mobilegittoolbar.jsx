import { 
    GitCommit, GitPullRequest, GitBranch,
    RefreshCw, Upload, Download 
  } from 'lucide-react';
  import { useState } from 'react';
  
  export default function MobileGitToolbar({ projectId }) {
    const [activeTab, setActiveTab] = useState('status');
    
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 flex items-center justify-center ${
              activeTab === 'status' ? 'text-blue-600 border-b-2 border-blue-600' : ''
            }`}
          >
            <GitBranch className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('commit')}
            className={`flex-1 py-2 flex items-center justify-center ${
              activeTab === 'commit' ? 'text-blue-600 border-b-2 border-blue-600' : ''
            }`}
          >
            <GitCommit className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 flex items-center justify-center ${
              activeTab === 'sync' ? 'text-blue-600 border-b-2 border-blue-600' : ''
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('pr')}
            className={`flex-1 py-2 flex items-center justify-center ${
              activeTab === 'pr' ? 'text-blue-600 border-b-2 border-blue-600' : ''
            }`}
          >
            <GitPullRequest className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-2">
          {activeTab === 'status' && <StatusView projectId={projectId} />}
          {activeTab === 'commit' && <CommitView projectId={projectId} />}
          {activeTab === 'sync' && <SyncView projectId={projectId} />}
          {activeTab === 'pr' && <PRView projectId={projectId} />}
        </div>
      </div>
    );
  }