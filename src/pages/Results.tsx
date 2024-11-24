import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateContent, translateText } from '@/utils/api';
import { toast } from "sonner";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TranslationDropdown from '@/components/TranslationDropdown';
import VoiceInput from '@/components/VoiceInput';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import ProcessingBar from '@/components/ProcessingBar';
import BlogPostSection from '@/components/BlogPostSection';
import SocialPostSection from '@/components/SocialPostSection';

const Results = () => {
  const location = useLocation();
  const { transcriptionData } = location.state || {};
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState({ blog: '', social: '' });
  const [progress, setProgress] = useState({ translation: 0, blog: 0, social: 0 });
  const [isGenerating, setIsGenerating] = useState({ translation: false, blog: false, social: false });
  const [likes, setLikes] = useState({ blog: 0, social: 0 });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const { theme } = useTheme();

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      toast.error("Please select a language first");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, translation: true }));
    try {
      const translated = await translateText(
        transcriptionData?.text,
        selectedLanguage,
        (progress) => setProgress(prev => ({ ...prev, translation: progress }))
      );
      setTranslatedText(translated);
      toast.success("Translation complete!");
    } catch (error) {
      toast.error("Failed to translate text");
    } finally {
      setIsGenerating(prev => ({ ...prev, translation: false }));
    }
  };

  const handleGenerateContent = async (type: 'blog' | 'social') => {
    setIsGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const content = await generateContent(
        transcriptionData?.text,
        type,
        (progress) => setProgress(prev => ({ ...prev, [type]: progress }))
      );
      setGeneratedContent(prev => ({ ...prev, [type]: content }));
      toast.success(`${type} post generated!`);
    } catch (error) {
      toast.error(`Failed to generate ${type} post`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    setQuestion(transcript);
    await handleAskQuestion();
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      if (!hasAskedQuestion) {
        toast.error("Please enter a question");
      }
      return;
    }

    try {
      const response = await generateContent(
        `Question about this transcript: "${question}"\n\nTranscript: "${transcriptionData?.text}"`,
        'qa'
      );
      setAnswer(response);
      setQuestion('');
      setHasAskedQuestion(true);
    } catch (error) {
      if (!hasAskedQuestion) {
        toast.error("Failed to generate answer");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8">
          {/* Transcript Section */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 font-transcript dark:text-white">
              Transcript
            </h2>
            <p className="whitespace-pre-wrap font-transcript dark:text-gray-200">
              {transcriptionData?.text}
            </p>
          </div>

          {/* Translation Section */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 font-translation dark:text-white">
              Translation
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <TranslationDropdown
                  selectedLanguage={selectedLanguage}
                  onLanguageSelect={setSelectedLanguage}
                />
                <Button
                  onClick={handleTranslate}
                  disabled={isGenerating.translation}
                  className="bg-primary hover:bg-primary/90"
                >
                  Translate
                </Button>
              </div>
              {isGenerating.translation && (
                <ProcessingBar type="translation" progress={progress.translation} />
              )}
              {translatedText && (
                <p className="whitespace-pre-wrap font-translation dark:text-gray-200">
                  {translatedText}
                </p>
              )}
            </div>
          </div>

          {/* Generated Content Section */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 font-blog dark:text-white">
              Generated Content
            </h2>
            
            <BlogPostSection
              content={generatedContent.blog}
              isGenerating={isGenerating.blog}
              progress={progress.blog}
              likes={likes.blog}
              onGenerate={() => handleGenerateContent('blog')}
              onEdit={() => {}}
              onDelete={() => setGeneratedContent(prev => ({ ...prev, blog: '' }))}
              onLike={() => setLikes(prev => ({ ...prev, blog: prev.blog + 1 }))}
              onSave={(content) => setGeneratedContent(prev => ({ ...prev, blog: content }))}
            />

            <SocialPostSection
              content={generatedContent.social}
              isGenerating={isGenerating.social}
              progress={progress.social}
              likes={likes.social}
              onGenerate={() => handleGenerateContent('social')}
              onEdit={() => {}}
              onDelete={() => setGeneratedContent(prev => ({ ...prev, social: '' }))}
              onLike={() => setLikes(prev => ({ ...prev, social: prev.social + 1 }))}
              onSave={(content) => setGeneratedContent(prev => ({ ...prev, social: content }))}
            />
          </div>

          {/* Q&A Section */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Ask Questions
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about the transcript..."
                  className="flex-1 dark:bg-gray-800 dark:text-gray-200"
                />
                <VoiceInput onTranscript={handleVoiceInput} />
                <Button onClick={handleAskQuestion}>Ask</Button>
              </div>
              {answer && (
                <div className="p-4 rounded-lg bg-card/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <p className="dark:text-gray-200">{answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Results;