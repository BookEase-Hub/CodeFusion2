const vscode = require('vscode');
const axios = require('axios');

class CodeFusionExtension {
  constructor(context) {
    this.context = context;
    this.apiClient = axios.create({
      baseURL: vscode.workspace.getConfiguration('codefusion').get('apiUrl'),
    });

    this.registerCommands();
    this.setupStatusBar();
  }

  registerCommands() {
    // Login Command
    this.context.subscriptions.push(
      vscode.commands.registerCommand('codefusion.login', async () => {
        try {
          const token = await this.getAuthToken();
          await this.updateToken(token);
          vscode.window.showInformationMessage('Successfully logged in to CodeFusion!');
        } catch (error) {
          vscode.window.showErrorMessage('Failed to login: ' + error.message);
        }
      })
    );

    // Analyze Command
    this.context.subscriptions.push(
      vscode.commands.registerCommand('codefusion.analyze', async () => {
        try {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            throw new Error('No active editor');
          }

          const document = editor.document;
          const text = document.getText();
          const language = document.languageId;

          const response = await this.apiClient.post('/api/analyze', {
            code: text,
            language,
            file: document.fileName,
          }, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
          });

          this.showAnalysisResults(response.data);
        } catch (error) {
          vscode.window.showErrorMessage('Analysis failed: ' + error.message);
        }
      })
    );

    // Create Repository Command
    this.context.subscriptions.push(
      vscode.commands.registerCommand('codefusion.createRepository', async () => {
        try {
          const name = await vscode.window.showInputBox({
            prompt: 'Enter repository name',
            placeHolder: 'my-awesome-project'
          });

          if (!name) return;

          const isPrivate = await vscode.window.showQuickPick(['Public', 'Private'], {
            placeHolder: 'Select repository visibility'
          });

          if (!isPrivate) return;

          const response = await this.apiClient.post('/api/repositories', {
            name,
            private: isPrivate === 'Private'
          }, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
          });

          vscode.window.showInformationMessage(`Repository ${name} created successfully!`);
        } catch (error) {
          vscode.window.showErrorMessage('Failed to create repository: ' + error.message);
        }
      })
    );

    // Sync Repository Command
    this.context.subscriptions.push(
      vscode.commands.registerCommand('codefusion.syncRepository', async () => {
        try {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            throw new Error('No workspace folder open');
          }

          await this.apiClient.post('/api/sync', {
            path: workspaceFolder.uri.fsPath
          }, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
          });

          vscode.window.showInformationMessage('Repository synced successfully!');
        } catch (error) {
          vscode.window.showErrorMessage('Sync failed: ' + error.message);
        }
      })
    );
  }

  setupStatusBar() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );

    this.statusBarItem.text = '$(rocket) CodeFusion';
    this.statusBarItem.command = 'codefusion.login';
    this.statusBarItem.show();

    this.context.subscriptions.push(this.statusBarItem);
  }

  async getAuthToken() {
    const url = `${vscode.workspace.getConfiguration('codefusion').get('apiUrl')}/auth/vscode`;
    vscode.env.openExternal(vscode.Uri.parse(url));

    const token = await vscode.window.showInputBox({
      prompt: 'Enter the token from the browser',
      password: true
    });

    if (!token) {
      throw new Error('Authentication cancelled');
    }

    return token;
  }

  getToken() {
    return vscode.workspace.getConfiguration('codefusion').get('token');
  }

  async updateToken(token) {
    await vscode.workspace.getConfiguration('codefusion').update('token', token, true);
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  showAnalysisResults(results) {
    const panel = vscode.window.createWebviewPanel(
      'codefusionAnalysis',
      'CodeFusion Analysis',
      vscode.ViewColumn.Two,
      {
        enableScripts: true
      }
    );

    panel.webview.html = this.getAnalysisWebviewContent(results);
  }

  getAnalysisWebviewContent(results) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CodeFusion Analysis</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .result { margin-bottom: 20px; }
            .issue { padding: 10px; border-left: 4px solid #f00; margin: 10px 0; }
            .suggestion { padding: 10px; border-left: 4px solid #0f0; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Analysis Results</h1>
          ${this.renderAnalysisResults(results)}
        </body>
      </html>
    `;
  }

  renderAnalysisResults(results) {
    return `
      <div class="results">
        ${results.issues?.map(issue => `
          <div class="issue">
            <h3>${issue.title}</h3>
            <p>${issue.description}</p>
            <code>${issue.code}</code>
          </div>
        `).join('') || ''}
        
        ${results.suggestions?.map(suggestion => `
          <div class="suggestion">
            <h3>${suggestion.title}</h3>
            <p>${suggestion.description}</p>
            <code>${suggestion.code}</code>
          </div>
        `).join('') || ''}
      </div>
    `;
  }
}

function activate(context) {
  new CodeFusionExtension(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 