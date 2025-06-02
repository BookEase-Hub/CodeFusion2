type CommandHandler = (args?: any) => void | Promise<void>;

interface Command {
  id: string;
  name: string;
  handler: CommandHandler;
  shortcut?: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode; // Use React components for icons
}

class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private shortcuts: Map<string, string> = new Map();

  register(command: Command) {
    this.commands.set(command.id, command);
    if (command.shortcut) {
      this.shortcuts.set(command.shortcut, command.id);
    }
  }

  unregister(commandId: string) {
    const command = this.commands.get(commandId);
    if (command) {
      this.commands.delete(commandId);
      if (command.shortcut) {
        this.shortcuts.delete(command.shortcut);
      }
    }
  }

  execute(commandId: string, args?: any) {
    try {
      const command = this.commands.get(commandId);
      if (command) {
        return command.handler(args);
      } else {
        console.error(Command not found: ${commandId});
      }
    } catch (error) {
      console.error(Error executing command ${commandId}:, error);
    }
  }

  getCommandById(id: string): Command | undefined {
    return this.commands.get(id);
  }

  getCommandsByCategory(category: string): Command[] {
    return Array.from(this.commands.values()).filter((cmd) => cmd.category === category);
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  getShortcutHandler(shortcut: string): CommandHandler | undefined {
    const commandId = this.shortcuts.get(shortcut);
    if (commandId) {
      return this.commands.get(commandId)?.handler;
    }
  }
}

export const commandRegistry = new CommandRegistry();

export function initializeKeyboardShortcuts() {
  window.addEventListener('keydown', (event) => {
    // Build shortcut string
    const keys = [];
    if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (event.key.length === 1) {
      keys.push(event.key.toUpperCase());
    } else {
      keys.push(event.key);
    }

    const shortcut = keys.join('+');
    const handler = commandRegistry.getShortcutHandler(shortcut);

    if (handler) {
      event.preventDefault();
      handler();
    }
  });
}

import { useEffect, useState, useRef } from 'react';
import { FiFile, FiGitCommit, FiGitPush, FiSearch } from 'react-icons/fi'; // Example icons

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState(commandRegistry.getAllCommands());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const filtered = commandRegistry.getAllCommands().filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(query.toLowerCase()) ||
          (cmd.description && cmd.description.toLowerCase().includes(query.toLowerCase()))
      );
      setCommands(filtered);
      setSelectedIndex(0); // Reset selection on query change
    }
  }, [query, isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      setSelectedIndex((prev) => Math.min(prev + 1, commands.length - 1));
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      const command = commands[selectedIndex];
      if (command) {
        command.handler();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-lg">
        <div className="flex items-center p-4 border-b dark:border-gray-700">
          <FiSearch className="text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            className="w-full ml-2 bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
          />
        </div>
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
          role="listbox"
          aria-label="Command list"
        >
          {commands.map((cmd, index) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.handler();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {cmd.icon || <FiFile />} {/* Default icon if not provided */}
              <div>
                <p className="font-medium">{cmd.name}</p>
                {cmd.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cmd.description}</p>
                )}
              </div>
              {cmd.shortcut && (
                <div className="ml-auto flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  {cmd.shortcut.split('+').map((key) => (
                    <kbd key={key} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {key}
                    </kbd>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Plugin {
  id: string;
  name: string;
  version: string;
  commands?: Command[];
  initialize?: () => void;
  cleanup?: () => void;
}

class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();

  constructor() {
    this.loadPlugins();
  }

  private loadPlugins() {
    const savedPlugins = localStorage.getItem('plugins');
    if (savedPlugins) {
      const plugins = JSON.parse(savedPlugins) as Plugin[];
      plugins.forEach((plugin) => this.register(plugin));
    }
  }

  private savePlugins() {
    const plugins = Array.from(this.plugins.values());
    localStorage.setItem('plugins', JSON.stringify(plugins));
  }

  register(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    plugin.commands?.forEach((cmd) => commandRegistry.register(cmd));
    plugin.initialize?.();
    this.savePlugins();
  }

  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.cleanup?.();
      plugin.commands?.forEach((cmd) => commandRegistry.unregister(cmd.id));
      this.plugins.delete(pluginId);
      this.savePlugins();
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginSystem = new PluginSystem();

// Example plugin
pluginSystem.register({
  id: 'git-integration',
  name: 'Git Integration',
  version: '1.0.0',
  commands: [
    {
      id: 'git-commit',
      name: 'Git Commit',
      handler: () => console.log('Committing changes...'),
      category: 'Version Control',
      icon: <FiGitCommit />,
    },
    {
      id: 'git-push',
      name: 'Git Push',
      handler: () => console.log('Pushing changes...'),
      category: 'Version Control',
      icon: <FiGitPush />,
    },
  ],
});

import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initializeKeyboardShortcuts();
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <CommandPalette />
    </>
  );
}

export default MyApp;
