// src/services/CommandDispatcher.ts
import { FileService } from './FileService';

export class CommandDispatcher {
  private commandMap: Record<string, Function>;

  constructor() {
    this.commandMap = {
      createNewFile: FileService.newFile,
      openFileDialog: FileService.openDialog,
      saveFile: FileService.save,
      find: FileService.find,
      // Add more commands here
    };
  }

  public async executeCommand(command: string, context: any): Promise<any> {
    const action = this.commandMap[command];
    if (action) {
      return await action(context);
    } else {
      throw new Error(Command not found: ${command});
    }
  }
}