import { Progress } from "@/components/ui/progress";

interface ProcessingBarProps {
  type: 'transcription' | 'translation' | 'blog' | 'social';
  progress: number;
}

const ProcessingBar = ({ type, progress }: ProcessingBarProps) => {
  const colors = {
    transcription: 'var(--processing-transcription)',
    translation: 'var(--processing-translation)',
    blog: 'var(--processing-blog)',
    social: 'var(--processing-social)'
  };

  return (
    <Progress 
      value={progress} 
      className="w-full transition-all duration-300"
      style={{ 
        background: `linear-gradient(90deg, ${colors[type]} ${progress}%, transparent ${progress}%)` 
      }}
    />
  );
};

export default ProcessingBar;