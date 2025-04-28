// src/services/CloudSyncService.ts
import { FileService } from './FileService';

interface SyncSession {
  projectId: string;
  files: Record<string, {
    content: string;
    lastSync: Date;
  }>;
  connections: string[]; // Device/session IDs
}

export class CloudSyncService {
  private sessions: Record<string, SyncSession> = {};
  private syncInterval = 5000; // 5 seconds

  public startSyncSession(projectId: string, sessionId: string) {
    if (!this.sessions[projectId]) {
      this.sessions[projectId] = {
        projectId,
        files: {},
        connections: []
      };
    }
    
    this.sessions[projectId].connections.push(sessionId);
    
    // Start sync loop for this project
    setInterval(() => this.syncProject(projectId), this.syncInterval);
  }

  private async syncProject(projectId: string) {
    const session = this.sessions[projectId];
    if (!session) return;

    // Get current project files
    const files = await FileService.listProjectFiles(projectId);
    
    // Update synchronization
    for (const file of files) {
      const content = await FileService.readFile(file.path);
      session.files[file.path] = {
        content,
        lastSync: new Date()
      };
    }
  }

  public getFileState(projectId: string, filePath: string) {
    return this.sessions[projectId]?.files[filePath];
  }

  public getProjectState(projectId: string) {
    return this.sessions[projectId];
  }
}