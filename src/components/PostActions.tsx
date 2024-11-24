import { Share2, Edit2, Trash2, Heart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PostActionsProps {
  type: 'blog' | 'social';
  content: string;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  likes: number;
  onLike: () => void;
  isEditing: boolean;
}

const PostActions = ({ 
  type, 
  content, 
  onEdit, 
  onDelete, 
  onSave,
  likes, 
  onLike,
  isEditing 
}: PostActionsProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LingoLens ${type} post`,
          text: content,
          url: window.location.href
        });
        toast.success("Content shared successfully!");
      } catch (error) {
        toast.error("Failed to share content");
      }
    } else {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onEdit}>
        {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
      </Button>
      <Button variant="outline" size="icon" onClick={onDelete}>
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
      {likes > 0 && <span className="text-sm">{likes}</span>}
    </div>
  );
};

export default PostActions;