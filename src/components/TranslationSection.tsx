import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TranslationDropdown from './TranslationDropdown';
import ProcessingBar from './ProcessingBar';
import { toast } from "sonner";

interface TranslationSectionProps {
  content: string;
  isTranslating: boolean;
  progress: number;
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  onTranslate: () => void;
  onSave: (content: string) => void;
}

const TranslationSection = ({
  content,
  isTranslating,
  progress,
  selectedLanguage,
  onLanguageSelect,
  onTranslate,
  onSave
}: TranslationSectionProps) => {
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
    toast.success("Translation saved successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Translation</h3>
        <div className="flex gap-2 items-center">
          <TranslationDropdown
            selectedLanguage={selectedLanguage}
            onLanguageSelect={onLanguageSelect}
          />
          <Button 
            onClick={onTranslate}
            disabled={isTranslating}
            className="bg-primary hover:bg-primary/90"
          >
            Translate
          </Button>
        </div>
      </div>
      
      {isTranslating && <ProcessingBar type="translation" progress={progress} />}
      
      {content && (
        <div className="space-y-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[100px] dark:bg-gray-800 dark:text-gray-200"
          />
          <Button onClick={handleSave}>Save Translation</Button>
        </div>
      )}
    </div>
  );
};

export default TranslationSection;