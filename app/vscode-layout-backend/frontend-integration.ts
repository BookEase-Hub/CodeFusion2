// components/VoiceCommandButton.tsx
import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition 
      || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        body: JSON.stringify({ transcript, sessionId: 'current-session' })
      });
      // Handle response
    };

    recognition.start();
    setIsListening(true);
    setRecognition(recognition);
  };

  const stopListening = () => {
    recognition?.stop();
    setIsListening(false);
  };

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? <MicOff /> : <Mic />}
    </button>
  );
}