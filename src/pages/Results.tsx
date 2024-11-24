import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateContent, translateText } from '@/utils/api';
import { toast } from "sonner";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TranslationDropdown from '@/components/TranslationDropdown';
import ContentGenerationControls from '@/components/ContentGenerationControls';
import PostActions from '@/components/PostActions';
import VoiceInput from '@/components/VoiceInput';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';

const Results = () => {
  const location = useLocation();
  const { transcriptionData } = location.state || {};
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState({ blog: '', social: '' });
  const [progress, setProgress] = useState({ transcription: 0, translation: 0, blog: 0, social: 0 });
  const [isGenerating, setIsGenerating] = useState({ translation: false, blog: false, social: false });
  const [likes, setLikes] = useState({ blog: 0, social: 0 });
  const [isEditing, setIsEditing] = useState({ blog: false, social: false });
  const [editContent, setEditContent] = useState({ blog: '', social: '' });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { theme } = useTheme();

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      toast("Please select a language first");
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
      toast("Translation complete!");
    } catch (error) {
      toast("Failed to translate text");
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
      toast(`${type} post generated!`);
    } catch (error) {
      toast(`Failed to generate ${type} post`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleEdit = (type: 'blog' | 'social') => {
    if (isEditing[type]) {
      setGeneratedContent(prev => ({ ...prev, [type]: editContent[type] }));
      setIsEditing(prev => ({ ...prev, [type]: false }));
      toast("Changes saved", {
        description: `Your ${type} post has been updated`,
        duration: 3000,
      });
    } else {
      setEditContent(prev => ({ ...prev, [type]: generatedContent[type] }));
      setIsEditing(prev => ({ ...prev, [type]: true }));
    }
  };

  const handleDelete = (type: 'blog' | 'social') => {
    setGeneratedContent(prev => ({ ...prev, [type]: '' }));
    setIsEditing(prev => ({ ...prev, [type]: false }));
    toast("Content deleted", {
      description: `${type} post has been deleted`,
      duration: 3000,
    });
  };

  const handleLike = (type: 'blog' | 'social') => {
    setLikes(prev => ({ ...prev, [type]: prev[type] + 1 }));
    toast("Liked!", {
      description: `You liked the ${type} post`,
      duration: 3000,
    });
  };

  const handleSave = () => {
    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      transcript: transcriptionData?.text || '',
      blogPost: generatedContent.blog,
      socialPost: generatedContent.social,
      translation: translatedText
    };

    const savedHistory = JSON.parse(localStorage.getItem('lingoLensHistory') || '[]');
    localStorage.setItem('lingoLensHistory', JSON.stringify([historyItem, ...savedHistory]));

    toast("Content saved", {
      description: "Content has been saved to history",
      duration: 3000,
    });
  };

  const handleVoiceInput = async (transcript: string) => {
    setQuestion(transcript);
    await handleAskQuestion();
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast("Question required", {
        description: "Please enter a question",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await generateContent(
        `Question about this transcript: "${question}"\n\nTranscript: "${transcriptionData?.text}"`,
        'qa'
      );
      setAnswer(response);
      setQuestion('');
    } catch (error) {
      toast("Error", {
        description: "Failed to generate answer",
        duration: 3000,
      });
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

          {/* Content Generation Controls */}
          <ContentGenerationControls
            onTranslate={handleTranslate}
            onGenerateBlog={() => handleGenerateContent('blog')}
            onGenerateSocial={() => handleGenerateContent('social')}
            isTranslating={isGenerating.translation}
            isGeneratingBlog={isGenerating.blog}
            isGeneratingSocial={isGenerating.social}
            translationProgress={progress.translation}
            blogProgress={progress.blog}
            socialProgress={progress.social}
          />

          {/* Translation Section */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 font-translation dark:text-white">
              Translation
            </h2>
            <div className="space-y-4">
              <TranslationDropdown
                selectedLanguage={selectedLanguage}
                onLanguageSelect={setSelectedLanguage}
              />
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
            
            {/* Blog Post */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-gray-200">Blog Post</h3>
                <div className="flex gap-2">
                  <ShareDialog content={generatedContent.blog} type="blog" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit('blog')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete('blog')}
                  >
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
                  {likes.blog > 0 && (
                    <span className="text-sm dark:text-gray-200">{likes.blog}</span>
                  )}
                </div>
              </div>
              
              {progress.blog > 0 && progress.blog < 100 && (
                <ProcessingBar type="blog" progress={progress.blog} />
              )}
              
              {isEditing.blog ? (
                <Textarea
                  value={editContent.blog}
                  onChange={(e) => setEditContent(prev => ({ ...prev, blog: e.target.value }))}
                  className="min-h-[200px] font-blog dark:bg-gray-800 dark:text-gray-200"
                />
              ) : (
                generatedContent.blog && (
                  <p className="whitespace-pre-wrap font-blog dark:text-gray-200">
                    {generatedContent.blog}
                  </p>
                )
              )}
            </div>

            {/* Social Post */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-gray-200">Social Post</h3>
                <div className="flex gap-2">
                  <ShareDialog content={generatedContent.social} type="social" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit('social')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete('social')}
                  >
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
                  {likes.social > 0 && (
                    <span className="text-sm dark:text-gray-200">{likes.social}</span>
                  )}
                </div>
              </div>
              
              {progress.social > 0 && progress.social < 100 && (
                <ProcessingBar type="social" progress={progress.social} />
              )}
              
              {isEditing.social ? (
                <Textarea
                  value={editContent.social}
                  onChange={(e) => setEditContent(prev => ({ ...prev, social: e.target.value }))}
                  className="min-h-[100px] font-social dark:bg-gray-800 dark:text-gray-200"
                />
              ) : (
                generatedContent.social && (
                  <p className="whitespace-pre-wrap font-social dark:text-gray-200">
                    {generatedContent.social}
                  </p>
                )
              )}
            </div>
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save to History
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Results;
