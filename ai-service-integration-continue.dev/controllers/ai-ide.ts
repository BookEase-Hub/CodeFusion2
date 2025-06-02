import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';

// Environment Configuration
const CONTINUE_API_ENDPOINT = 'https://api.continue.dev/v1';
const CONTINUE_API_KEY = 'your_api_key';
const SOCKET_SERVER_URL = 'http://localhost:3001';

// Type Definitions
interface CodeDocument {
  id: string;
  content: string;
  language: string;
}

interface AICompletionRequest {
  prompt: string;
  context: string;
  model?: string;
  temperature?: number;
}

interface User {
  id: string;
  name: string;
}

interface Delta {
  index: number;
  insert?: string;
  delete?: number;
}

// AI Service
class AIService {
  static async generateCode(request: AICompletionRequest): Promise<string> {
    try {
      const response = await axios.post(
        ${CONTINUE_API_ENDPOINT}/code/completions,
        {
          prompt: request.prompt,
          context: request.context,
          model: request.model || 'gpt-4',
          temperature: request.temperature || 0.7
        },
        { headers: { Authorization: Bearer ${CONTINUE_API_KEY} } }
      );
      return response.data.code;
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  }

  static async updateSettings(model: string, temperature: number): Promise<void> {
    try {
      await axios.post(
        ${CONTINUE_API_ENDPOINT}/settings,
        { model, temperature },
        { headers: { Authorization: Bearer ${CONTINUE_API_KEY} } }
      );
    } catch (error) {
      console.error('Settings Error:', error);
      throw error;
    }
  }
}

// Real-time Collaboration Service
class CollaborationService {
  private socket: Socket;
  private document: CodeDocument;
  private user: User;

  constructor(document: CodeDocument, user: User) {
    this.document = document;
    this.user = user;
    this.socket = io(SOCKET_SERVER_URL);
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to collaboration server');
      this.socket.emit('join-document', this.document.id, this.user);
    });

    this.socket.on('document-state', (content: string) => {
      console.log('Received document state:', content);
      // Update local document state
    });

    this.socket.on('text-change', (delta: Delta) => {
      console.log('Received remote change:', delta);
      // Apply remote changes to editor
    });

    this.socket.on('user-joined', (user: User) => {
      console.log('User joined:', user.name);
    });

    this.socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
    });
  }

  sendChange(delta: Delta) {
    this.socket.emit('text-change', delta, this.document.id);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Main Editor Component
const CodeFusionEditor: React.FC = () => {
  const [document, setDocument] = useState<CodeDocument>({
    id: 'default-doc',
    content: '// Start coding here...\nconsole.log("Hello, world!");',
    language: 'javascript'
  });
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [user] = useState<User>({ id: 'user1', name: 'Developer' });
  const editorRef = useRef<any>(null);
  const collabService = useRef<CollaborationService | null>(null);

  // Initialize collaboration service
  useEffect(() => {
    collabService.current = new CollaborationService(document, user);
    return () => {
      collabService.current?.disconnect();
    };
  }, [document.id]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    setDocument(prev => ({ ...prev, content: value }));
    
    // Send changes to collaborators
    if (collabService.current) {
      collabService.current.sendChange({
        index: 0, // Simplified - in real app would track position
        insert: value
      });
    }
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const code = await AIService.generateCode({
        prompt: aiPrompt,
        context: document.content,
        model,
        temperature
      });
      setAiResponse(code);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAIResponse = () => {
    if (editorRef.current && aiResponse) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      
      editor.executeEdits('ai', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: aiResponse,
        forceMoveMarkers: true
      }]);
    }
  };

  return (
    <div className="code-fusion-container">
      <div className="editor-section">
        <div className="toolbar">
          <select 
            value={document.language}
            onChange={(e) => setDocument(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          
          <div className="ai-settings">
            <label>
              Model:
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5</option>
              </select>
            </label>
            
            <label>
              Temperature:
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
              {temperature}
            </label>
          </div>
        </div>
        
        <MonacoEditor
          height="60vh"
          language={document.language}
          theme="vs-dark"
          value={document.content}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            automaticLayout: true
          }}
        />
      </div>
      
      <div className="ai-section">
        <h3>AI Assistant</h3>
        <div className="ai-prompt">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask the AI to generate or explain code..."
          />
          <button onClick={handleAIGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
        
        {aiResponse && (
          <div className="ai-response">
            <div className="response-header">
              <h4>AI Suggestion</h4>
              <button onClick={applyAIResponse}>Apply to Editor</button>
            </div>
            <pre>{aiResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles (included here for single-file completeness)
const styles = `
  .code-fusion-container {
    display: flex;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .editor-section {
    flex: 3;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ddd;
  }
  
  .toolbar {
    padding: 10px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
  }
  
  .ai-settings {
    display: flex;
    gap: 20px;
  }
  
  .ai-section {
    flex: 1;
    padding: 20px;
    background: #f9f9f9;
    overflow-y: auto;
  }
  
  .ai-prompt {
    margin-bottom: 20px;
  }
  
  .ai-prompt textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .ai-prompt button {
    padding: 8px 16px;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .ai-prompt button:disabled {
    background: #ccc;
  }
  
  .ai-response {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
  }
  
  .response-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .response-header button {
    padding: 4px 8px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  pre {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

// Render the app
const App: React.FC = () => {
  return (
    <>
      <style>{styles}</style>
      <CodeFusionEditor />
    </>
  );
};

export default App;
