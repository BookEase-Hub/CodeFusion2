// src/services/SessionManager.ts
import { UserSession } from '../models/UserSession';

export class SessionManager {
  private sessions: Record<string, UserSession> = {};

  public createSession(userId: string): UserSession {
    const session = new UserSession(userId);
    this.sessions[userId] = session;
    return session;
  }

  public getSession(userId: string): UserSession | undefined {
    return this.sessions[userId];
  }

  public endSession(userId: string): void {
    delete this.sessions[userId];
  }
}