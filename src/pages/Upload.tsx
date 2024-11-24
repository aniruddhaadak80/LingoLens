import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { transcribeAudio } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Upload as UploadIcon } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
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
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Upload Audio or Video</h1>
          
          <div className="glass-card p-8 rounded-lg space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 hover:border-primary transition-colors">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                <div className="text-center">
                  <p className="text-lg font-medium dark:text-white">
                    {file ? file.name : "Drop your file here or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports audio and video files
                  </p>
                </div>
              </label>
            </div>

            {progress > 0 && progress < 100 && (
              <div className="w-full">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                  Processing: {progress}%
                </p>
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
      <Footer />
    </div>
  );
};

export default Upload;