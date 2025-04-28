// src/services/ShortcutManager.ts
interface ShortcutConfig {
    [userId: string]: {
      [shortcut: string]: string; // command
    };
  }
  
  export class ShortcutManager {
    private config: ShortcutConfig = {};
  
    public setShortcut(userId: string, shortcut: string, command: string) {
      if (!this.config[userId]) this.config[userId] = {};
      this.config[userId][shortcut] = command;
    }
  
    public getCommand(userId: string, shortcut: string): string | null {
      return this.config[userId]?.[shortcut] || null;
    }
  
    public getUserShortcuts(userId: string) {
      return this.config[userId] || {};
    }
  }