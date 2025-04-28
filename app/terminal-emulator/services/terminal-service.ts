import { spawn } from 'node-pty';

export function startTerminalSession() {
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  return ptyProcess;
}