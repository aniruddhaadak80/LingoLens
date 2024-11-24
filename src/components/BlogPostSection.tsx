import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, Heart, Save } from "lucide-react";
import ShareDialog from './ShareDialog';
import TranslationDropdown from './TranslationDropdown';
import ProcessingBar from './ProcessingBar';
import { toast } from "sonner";

interface BlogPostSectionProps {
  content: string;
  isGenerating?: boolean;
  progress?: number;
  likes?: number;
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  onGenerate: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  onSave?: (content: string) => void;
}

const BlogPostSection = ({
  content,
  isGenerating = false,
  progress = 0,
  likes = 0,
  selectedLanguage,
  onLanguageSelect,
  onGenerate,
  onEdit,
  onDelete,
  onLike,
  onSave
}: BlogPostSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleEdit = () => {
    if (isEditing && onSave) {
      onSave(editContent);
      setIsEditing(false);
      toast.success("Blog post saved successfully!");
    } else {
      setEditContent(content);
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Blog Post</h3>
        <div className="flex gap-2 items-center">
          <TranslationDropdown
            selectedLanguage={selectedLanguage}
            onLanguageSelect={onLanguageSelect}
          />
          <Button
            variant="outline"
            onClick={onGenerate}
            className="bg-secondary hover:bg-secondary/90"
          >
            Generate Blog Post
          </Button>
        </div>
      </div>
      
      {isGenerating && <ProcessingBar type="blog" progress={progress} />}
      
      {content && (
        <div className="space-y-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] font-blog dark:bg-gray-800 dark:text-gray-200"
            />
          ) : (
            <p className="whitespace-pre-wrap font-blog dark:text-gray-200">
              {content}
            </p>
          )}
          
          <div className="flex gap-2">
            <ShareDialog content={editContent} type="blog" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleEdit}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {onLike && (
              <Button
                variant="outline"
                size="icon"
                onClick={onLike}
                className={likes > 0 ? "text-pink-500" : ""}
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
            {likes > 0 && (
              <span className="text-sm dark:text-gray-200">{likes}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostSection;