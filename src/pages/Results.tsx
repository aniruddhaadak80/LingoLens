import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { generateContent, translateText } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';

const Results = () => {
  const location = useLocation();
  const { transcriptionData } = location.state || {};
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!selectedLanguage || !transcriptionData?.text) return;
    setProgress(0);
    try {
      const translated = await translateText(transcriptionData.text, selectedLanguage, setProgress);
      setTranslatedText(translated);
      toast({
        title: "Success",
        description: "Text translated successfully",
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to translate text',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateContent = async (type: 'blog' | 'social') => {
    if (!transcriptionData?.text) return;
    setProgress(0);
    try {
      const content = await generateContent(transcriptionData.text, type, setProgress);
      setGeneratedContent(content);
      toast({
        title: "Success",
        description: `${type === 'blog' ? 'Blog' : 'Social media'} post generated successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Results</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <p className="whitespace-pre-wrap">{transcriptionData?.text}</p>
        </div>

        {transcriptionData?.summary_points && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <ul className="list-disc pl-6 space-y-2">
              {transcriptionData.summary_points.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Translation</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleTranslate}>Translate</Button>
            </div>
            {progress > 0 && progress < 100 && (
              <div className="w-full">
                <Progress value={progress} className="w-full" />
              </div>
            )}
            {translatedText && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Translated Text:</h3>
                <p className="whitespace-pre-wrap">{translatedText}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generate Content</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={() => handleGenerateContent('blog')}>Generate Blog Post</Button>
              <Button onClick={() => handleGenerateContent('social')}>Generate Social Post</Button>
            </div>
            {progress > 0 && progress < 100 && (
              <div className="w-full">
                <Progress value={progress} className="w-full" />
              </div>
            )}
            {generatedContent && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Generated Content:</h3>
                <p className="whitespace-pre-wrap">{generatedContent}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;