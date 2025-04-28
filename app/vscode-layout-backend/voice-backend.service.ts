// src/services/VoiceProcessor.ts
import { CommandDispatcher } from './CommandDispatcher';
import natural from 'natural';

export class VoiceProcessor {
  private commandDispatcher: CommandDispatcher;
  private tokenizer = new natural.WordTokenizer();
  private classifier = new natural.BayesClassifier();

  constructor() {
    this.commandDispatcher = new CommandDispatcher();
    this.trainClassifier();
  }

  private trainClassifier() {
    // Training data for command recognition
    this.classifier.addDocument('create new file', 'createNewFile');
    this.classifier.addDocument('open file', 'openFileDialog');
    this.classifier.addDocument('save file', 'saveFile');
    // Add more training samples
    this.classifier.train();
  }

  public async processTranscript(transcript: string, context: any): Promise<any> {
    const tokens = this.tokenizer.tokenize(transcript.toLowerCase());
    const command = this.classifier.classify(tokens.join(' '));
    return this.commandDispatcher.executeCommand(command, context);
  }
}