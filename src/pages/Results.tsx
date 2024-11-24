import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TranslationDropdown from '@/components/TranslationDropdown';
import VoiceInput from '@/components/VoiceInput';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogPostSection from '@/components/BlogPostSection';
import SocialPostSection from '@/components/SocialPostSection';
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
  
  const [qaHistory, setQAHistory] = useState<QAItem[]>([]);
  const [question, setQuestion] = useState('');
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);

  const handleTranslate = async (type: 'transcript' | 'blog' | 'social', text: string) => {
    try {
      const translated = await translateText(text, selectedLanguages[type]);
      if (type === 'transcript') {
        setContents(prev => ({ ...prev, translatedText: translated }));
      } else {
        setContents(prev => ({ ...prev, [type]: translated }));
      }
      toast.success(`${type} translated successfully!`);
    } catch (error) {
      toast.error(`Failed to translate ${type}`);
    }
  };

  const handleGenerateContent = async (type: 'blog' | 'social') => {
    try {
      const content = await generateContent(transcriptionData?.text, type);
      setContents(prev => ({ ...prev, [type]: content }));
      toast.success(`${type} post generated!`);
    } catch (error) {
      toast.error(`Failed to generate ${type} post`);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() && !hasAskedQuestion) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const answer = await generateContent(
        `Question about this transcript: "${question}"\n\nTranscript: "${transcriptionData?.text}"`,
        'qa'
      );
      
      const newQAItem: QAItem = {
        question,
        answer,
        timestamp: new Date().toLocaleString()
      };
      
      setQAHistory(prev => [...prev, newQAItem]);
      setQuestion('');
      setHasAskedQuestion(true);
    } catch (error) {
      if (!hasAskedQuestion) {
        toast.error("Failed to generate answer");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    // Implement file upload logic here
    toast.success("New file uploaded successfully!");
  };

  useEffect(() => {
    // Save QA history to localStorage
    const savedHistory = localStorage.getItem('qaHistory');
    if (savedHistory) {
      setQAHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qaHistory', JSON.stringify(qaHistory));
  }, [qaHistory]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8">
          <UploadSection onFileUpload={handleFileUpload} />

          {/* Transcript Section */}
          <div className="glass-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-transcript dark:text-white">
                Transcript
              </h2>
              <div className="flex gap-2">
                <TranslationDropdown
                  selectedLanguage={selectedLanguages.transcript}
                  onLanguageSelect={(lang) => {
                    setSelectedLanguages(prev => ({ ...prev, transcript: lang }));
                    handleTranslate('transcript', transcriptionData?.text);
                  }}
                />
              </div>
            </div>
            <p className="whitespace-pre-wrap font-transcript dark:text-gray-200">
              {contents.translatedText || transcriptionData?.text}
            </p>
          </div>

          <BlogPostSection
            content={contents.blog}
            selectedLanguage={selectedLanguages.blog}
            onLanguageSelect={(lang) => {
              setSelectedLanguages(prev => ({ ...prev, blog: lang }));
              if (contents.blog) {
                handleTranslate('blog', contents.blog);
              }
            }}
            onGenerate={() => handleGenerateContent('blog')}
          />

          <SocialPostSection
            content={contents.social}
            selectedLanguage={selectedLanguages.social}
            onLanguageSelect={(lang) => {
              setSelectedLanguages(prev => ({ ...prev, social: lang }));
              if (contents.social) {
                handleTranslate('social', contents.social);
              }
            }}
            onGenerate={() => handleGenerateContent('social')}
          />

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
                <VoiceInput onTranscript={(text) => {
                  setQuestion(text);
                  handleAskQuestion();
                }} />
                <Button onClick={handleAskQuestion}>Ask</Button>
              </div>
              <QAHistory items={qaHistory} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Results;