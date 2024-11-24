import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, Heart, Save } from "lucide-react";
import ShareDialog from './ShareDialog';
import TranslationDropdown from './TranslationDropdown';
import ProcessingBar from './ProcessingBar';
import { toast } from "sonner";

interface SocialPostSectionProps {
  content: string;
  isGenerating: boolean;
  progress: number;
  likes: number;
  onGenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLike: () => void;
  onSave: (content: string) => void;
}

const SocialPostSection = ({
  content,
  isGenerating,
  progress,
  likes,
  onGenerate,
  onEdit,
  onDelete,
  onLike,
  onSave
}: SocialPostSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleEdit = () => {
    if (isEditing) {
      onSave(editContent);
      setIsEditing(false);
      toast.success("Social post saved successfully!");
    } else {
      setEditContent(content);
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Social Post</h3>
        <div className="flex gap-2 items-center">
          <TranslationDropdown
            selectedLanguage={selectedLanguage}
            onLanguageSelect={setSelectedLanguage}
          />
          <Button
            variant="outline"
            onClick={onGenerate}
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
          
          <div className="flex gap-2">
            <ShareDialog content={editContent} type="social" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdit}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onLike}
              className={likes > 0 ? "text-pink-500" : ""}
            >
              <Heart className="h-4 w-4" />
            </Button>
            {likes > 0 && (
              <span className="text-sm dark:text-gray-200">{likes}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPostSection;