// src/services/BotEngine.ts
import natural from 'natural';
import { CommandDispatcher } from './CommandDispatcher';

interface CommandPattern {
  pattern: RegExp;
  command: string;
  extractPath?: boolean;
}

export class BotEngine {
  private dispatcher: CommandDispatcher;
  private patterns: CommandPattern[] = [
    { pattern: /create (?:new )?file (?:in )?(.*)/i, command: 'createNewFile', extractPath: true },
    { pattern: /save (?:file )?(?:in )?(.*)/i, command: 'saveFile', extractPath: true },
    { pattern: /open (?:file )?(?:in )?(.*)/i, command: 'openFileDialog', extractPath: true }
  ];

  constructor() {
    this.dispatcher = new CommandDispatcher();
  }

  public async processQuery(query: string) {
    const normalized = query.toLowerCase().trim();
    
    for (const { pattern, command, extractPath } of this.patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const path = extractPath ? match[1] : undefined;
        return this.dispatcher.executeCommand(command, { path });
      }
    }
    
    throw new Error('No matching command found');
  }
}