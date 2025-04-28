// components/ShortcutConfigurator.tsx
import { useState, useEffect } from 'react';
import { Button, Input, Table } from '@/components/ui';

export function ShortcutConfigurator({ userId }: { userId: string }) {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [newShortcut, setNewShortcut] = useState('');
  const [newCommand, setNewCommand] = useState('');

  useEffect(() => {
    fetch(/api/get-shortcuts/${userId})
      .then(res => res.json())
      .then(setShortcuts);
  }, [userId]);

  const saveShortcut = () => {
    fetch('/api/set-shortcut', {
      method: 'POST',
      body: JSON.stringify({ userId, shortcut: newShortcut, command: newCommand })
    }).then(() => {
      setShortcuts({ ...shortcuts, [newShortcut]: newCommand });
      setNewShortcut('');
      setNewCommand('');
    });
  };

  return (
    <div className="p-4">
      <Table>
        <thead>
          <tr>
            <th>Shortcut</th>
            <th>Command</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(shortcuts).map(([shortcut, command]) => (
            <tr key={shortcut}>
              <td>{shortcut}</td>
              <td>{command}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div className="mt-4 flex gap-2">
        <Input 
          placeholder="Ctrl+Shift+M" 
          value={newShortcut} 
          onChange={(e) => setNewShortcut(e.target.value)} 
        />
        <Input 
          placeholder="commandName" 
          value={newCommand} 
          onChange={(e) => setNewCommand(e.target.value)} 
        />
        <Button onClick={saveShortcut}>Add Shortcut</Button>
      </div>
    </div>
  );
}