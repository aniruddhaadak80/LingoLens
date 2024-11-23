import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { transcribeAudio } from '@/utils/api';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check if file is audio or video
      if (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Error',
          description: 'Please select an audio or video file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    try {
      const result = await transcribeAudio(file, setProgress);
      navigate('/results', { state: { transcriptionData: result } });
      toast({
        title: "Success",
        description: "File transcribed successfully",
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to transcribe file',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Audio or Video</h1>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-4">
          <Input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
          />
          {progress > 0 && progress < 100 && (
            <div className="w-full">
              <Progress value={progress} className="w-full" />
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Upload and Transcribe'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;