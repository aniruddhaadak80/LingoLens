import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogPostSection from '@/components/BlogPostSection';
import SocialPostSection from '@/components/SocialPostSection';
import TranslationSection from '@/components/TranslationSection';
import UploadSection from '@/components/UploadSection';
import QAHistory from '@/components/QAHistory';
import { generateContent, translateText } from '@/utils/api';

interface QAItem {
  question: string;
  answer: string;
  timestamp: string;
}

const Results = () => {
  const location = useLocation();
  const { transcriptionData } = location.state || {};
  
  const [selectedLanguages, setSelectedLanguages] = useState({
    transcript: 'English',
    blog: 'English',
    social: 'English'
  });
  
  const [contents, setContents] = useState({
    translatedText: '',
    blog: '',
    social: ''
  });

  const [isGenerating, setIsGenerating] = useState({
    translation: false,
    blog: false,
    social: false
  });

  const [progress, setProgress] = useState({
    translation: 0,
    blog: 0,
    social: 0
  });

  const [likes, setLikes] = useState({
    blog: 0,
    social: 0
  });
  
  const [qaHistory, setQAHistory] = useState<QAItem[]>([]);

  const handleTranslate = async (type: 'transcript' | 'blog' | 'social', text: string, targetLanguage: string) => {
    setIsGenerating(prev => ({ ...prev, translation: true }));
    try {
      const translated = await translateText(text, targetLanguage, (progress) => {
        setProgress(prev => ({ ...prev, translation: progress }));
      });
      if (type === 'transcript') {
        setContents(prev => ({ ...prev, translatedText: translated }));
      } else {
        setContents(prev => ({ ...prev, [type]: translated }));
      }
      toast.success(`${type} translated successfully!`);
    } catch (error) {
      toast.error(`Failed to translate ${type}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, translation: false }));
    }
  };

  const handleSaveToHistory = () => {
    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      transcript: transcriptionData?.text || '',
      translatedText: contents.translatedText,
      blogPost: contents.blog,
      socialPost: contents.social,
      qaHistory
    };

    const savedHistory = localStorage.getItem('lingoLensHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    history.push(historyItem);
    localStorage.setItem('lingoLensHistory', JSON.stringify(history));
    toast.success('Content saved to history!');
  };

  const handleGenerateContent = async (type: 'blog' | 'social') => {
    setIsGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const content = await generateContent(transcriptionData?.text, type, (progress) => {
        setProgress(prev => ({ ...prev, [type]: progress }));
      });
      setContents(prev => ({ ...prev, [type]: content }));
      toast.success(`${type} post generated!`);
    } catch (error) {
      toast.error(`Failed to generate ${type} post`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDelete = (type: 'blog' | 'social') => {
    setContents(prev => ({ ...prev, [type]: '' }));
    toast.success(`${type} post deleted`);
  };

  const handleLike = (type: 'blog' | 'social') => {
    setLikes(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8">
          <UploadSection onFileUpload={(file) => {
            toast.success("New file uploaded successfully!");
          }} />

          <TranslationSection
            content={transcriptionData?.text || ''}
            isTranslating={isGenerating.translation}
            progress={progress.translation}
            selectedLanguage={selectedLanguages.transcript}
            onLanguageSelect={(lang) => {
              setSelectedLanguages(prev => ({ ...prev, transcript: lang }));
              handleTranslate('transcript', transcriptionData?.text, lang);
            }}
            onTranslate={() => handleTranslate('transcript', transcriptionData?.text, selectedLanguages.transcript)}
            onSave={handleSaveToHistory}
          />

          <BlogPostSection
            content={contents.blog}
            isGenerating={isGenerating.blog}
            progress={progress.blog}
            selectedLanguage={selectedLanguages.blog}
            onLanguageSelect={(lang) => {
              setSelectedLanguages(prev => ({ ...prev, blog: lang }));
              if (contents.blog) {
                handleTranslate('blog', contents.blog, lang);
              }
            }}
            onGenerate={() => handleGenerateContent('blog')}
            onDelete={() => handleDelete('blog')}
            onLike={() => handleLike('blog')}
            likes={likes.blog}
          />

          <SocialPostSection
            content={contents.social}
            isGenerating={isGenerating.social}
            progress={progress.social}
            selectedLanguage={selectedLanguages.social}
            onLanguageSelect={(lang) => {
              setSelectedLanguages(prev => ({ ...prev, social: lang }));
              if (contents.social) {
                handleTranslate('social', contents.social, lang);
              }
            }}
            onGenerate={() => handleGenerateContent('social')}
            onDelete={() => handleDelete('social')}
            onLike={() => handleLike('social')}
            likes={likes.social}
          />

          <QAHistory items={qaHistory} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Results;