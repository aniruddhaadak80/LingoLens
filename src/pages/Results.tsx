import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { generateContent, translateText } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { Heart, Share2, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';

const Results = () => {
  const location = useLocation();
  const { transcriptionData } = location.state || {};
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState({ blog: '', social: '' });
  const [progress, setProgress] = useState({ transcription: 0, translation: 0, blog: 0, social: 0 });
  const [likes, setLikes] = useState({ blog: 0, social: 0 });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const languages = [
    'Spanish', 'French', 'German', 'Italian', 'Hindi', 
    'Urdu', 'Bengali', 'Chinese', 'Japanese', 'Korean',
    'Arabic', 'Russian', 'Portuguese'
  ];

  const handleShare = (type: 'blog' | 'social') => {
    if (navigator.share) {
      navigator.share({
        title: `LingoLens ${type} post`,
        text: generatedContent[type],
        url: window.location.href
      }).catch(() => {
        toast({
          title: "Sharing failed",
          description: "Could not share the content",
          variant: "destructive",
        });
      });
    } else {
      navigator.clipboard.writeText(generatedContent[type]);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
    }
  };

  const handleEdit = (type: 'blog' | 'social') => {
    // Implementation would depend on your editing UI
    toast({
      title: "Edit mode",
      description: `Editing ${type} post`,
    });
  };

  const handleDelete = (type: 'blog' | 'social') => {
    setGeneratedContent(prev => ({ ...prev, [type]: '' }));
    toast({
      title: "Deleted",
      description: `${type} post has been deleted`,
    });
  };

  const handleLike = (type: 'blog' | 'social') => {
    setLikes(prev => ({ ...prev, [type]: prev[type] + 1 }));
    toast({
      title: "Liked!",
      description: `You liked the ${type} post`,
    });
  };

  const handleTranslate = async () => {
    if (!selectedLanguage || !transcriptionData?.text) return;
    setProgress(prev => ({ ...prev, translation: 0 }));
    try {
      const translated = await translateText(transcriptionData.text, selectedLanguage, 
        (progress) => setProgress(prev => ({ ...prev, translation: progress }))
      );
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
    setProgress(prev => ({ ...prev, [type]: 0 }));
    try {
      const content = await generateContent(
        transcriptionData.text, 
        type,
        (progress) => setProgress(prev => ({ ...prev, [type]: progress }))
      );
      setGeneratedContent(prev => ({ ...prev, [type]: content }));
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
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex justify-end mb-8">
        <Select onValueChange={(value) => setTheme(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h1 className="text-3xl font-bold mb-8 dark:text-white">Results</h1>
      
      <div className="space-y-8">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 font-transcript dark:text-white">Transcript</h2>
          <p className="whitespace-pre-wrap font-transcript dark:text-gray-200">{transcriptionData?.text}</p>
          {progress.transcription > 0 && progress.transcription < 100 && (
            <Progress 
              value={progress.transcription} 
              className="mt-4"
              style={{ 
                background: `linear-gradient(90deg, var(--processing-transcription) ${progress.transcription}%, transparent ${progress.transcription}%)` 
              }}
            />
          )}
        </div>

        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 font-translation dark:text-white">Translation</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleTranslate}>Translate</Button>
            </div>
            {progress.translation > 0 && progress.translation < 100 && (
              <Progress 
                value={progress.translation} 
                className="w-full"
                style={{ 
                  background: `linear-gradient(90deg, var(--processing-translation) ${progress.translation}%, transparent ${progress.translation}%)` 
                }}
              />
            )}
            {translatedText && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 dark:text-white">Translated Text:</h3>
                <p className="whitespace-pre-wrap font-translation dark:text-gray-200">{translatedText}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 font-blog dark:text-white">Generated Content</h2>
          <div className="space-y-6">
            <div>
              <div className="flex gap-4 mb-4">
                <Button onClick={() => handleGenerateContent('blog')}>Generate Blog Post</Button>
                {generatedContent.blog && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShare('blog')}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit('blog')}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete('blog')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleLike('blog')}
                      className={likes.blog > 0 ? "text-pink-500" : ""}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    {likes.blog > 0 && <span className="text-sm">{likes.blog}</span>}
                  </div>
                )}
              </div>
              {progress.blog > 0 && progress.blog < 100 && (
                <Progress 
                  value={progress.blog} 
                  className="w-full"
                  style={{ 
                    background: `linear-gradient(90deg, var(--processing-blog) ${progress.blog}%, transparent ${progress.blog}%)` 
                  }}
                />
              )}
              {generatedContent.blog && (
                <div className="mt-4">
                  <p className="whitespace-pre-wrap font-blog dark:text-gray-200">{generatedContent.blog}</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex gap-4 mb-4">
                <Button onClick={() => handleGenerateContent('social')}>Generate Social Post</Button>
                {generatedContent.social && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShare('social')}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit('social')}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete('social')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleLike('social')}
                      className={likes.social > 0 ? "text-pink-500" : ""}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    {likes.social > 0 && <span className="text-sm">{likes.social}</span>}
                  </div>
                )}
              </div>
              {progress.social > 0 && progress.social < 100 && (
                <Progress 
                  value={progress.social} 
                  className="w-full"
                  style={{ 
                    background: `linear-gradient(90deg, var(--processing-social) ${progress.social}%, transparent ${progress.social}%)` 
                  }}
                />
              )}
              {generatedContent.social && (
                <div className="mt-4">
                  <p className="whitespace-pre-wrap font-social dark:text-gray-200">{generatedContent.social}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;