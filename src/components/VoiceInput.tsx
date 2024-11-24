import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

// Define the SpeechRecognition types
interface IWindow extends Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const startRecording = () => {
    const windowWithSpeech = window as IWindow;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast("Speech recognition not supported", {
        description: "Your browser doesn't support speech recognition",
        duration: 3000,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map(result => result.transcript)
        .join('');
      
      onTranscript(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      toast("Recognition Error", {
        description: "Error occurred in recognition: " + event.error,
        duration: 3000,
      });
    };

    recognition.start();
    setIsRecording(true);
    setRecognition(recognition);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className={`transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-primary/90'}`}
    >
      {isRecording ? (
        <MicOff className="h-4 w-4 text-white" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export default VoiceInput;