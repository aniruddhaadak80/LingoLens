import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TranslationDropdown from './TranslationDropdown';
import ProcessingBar from './ProcessingBar';
import PostActions from './PostActions';
import { toast } from "sonner";

interface SocialPostSectionProps {
  content: string;
  isGenerating?: boolean;
  progress?: number;
  likes?: number;
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  onGenerate: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

const SocialPostSection = ({
  content,
  isGenerating = false,
  progress = 0,
  likes = 0,
  selectedLanguage,
  onLanguageSelect,
  onGenerate,
  onDelete,
  onLike
}: SocialPostSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleEdit = () => {
    if (isEditing) {
      setEditContent(content);
      toast.success("Social post saved successfully!");
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Social post saved successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Social Post</h3>
        <div className="flex gap-2 items-center">
          <TranslationDropdown
            selectedLanguage={selectedLanguage}
            onLanguageSelect={onLanguageSelect}
          />
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-accent hover:bg-accent/90"
          >
            Generate Social Post
          </Button>
        </div>
      </div>
      
      {isGenerating && <ProcessingBar type="social" progress={progress} />}
      
      {content && (
        <div className="space-y-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px] font-social dark:bg-gray-800 dark:text-gray-200"
            />
          ) : (
            <p className="whitespace-pre-wrap font-social dark:text-gray-200">
              {content}
            </p>
          )}
          
          <PostActions
            type="social"
            content={editContent}
            onEdit={handleEdit}
            onDelete={onDelete || (() => {})}
            onSave={handleSave}
            likes={likes}
            onLike={onLike || (() => {})}
            isEditing={isEditing}
          />
        </div>
      )}
    </div>
  );
};

export default SocialPostSection;