import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ProcessingBar from "./ProcessingBar";

interface ContentGenerationControlsProps {
  onTranslate: () => void;
  onGenerateBlog: () => void;
  onGenerateSocial: () => void;
  isTranslating: boolean;
  isGeneratingBlog: boolean;
  isGeneratingSocial: boolean;
  translationProgress: number;
  blogProgress: number;
  socialProgress: number;
}

const ContentGenerationControls = ({
  onTranslate,
  onGenerateBlog,
  onGenerateSocial,
  isTranslating,
  isGeneratingBlog,
  isGeneratingSocial,
  translationProgress,
  blogProgress,
  socialProgress
}: ContentGenerationControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onTranslate}
          disabled={isTranslating}
          className="bg-primary hover:bg-primary/90"
        >
          {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Translate
        </Button>
        <Button 
          onClick={onGenerateBlog}
          disabled={isGeneratingBlog}
          className="bg-secondary hover:bg-secondary/90"
        >
          {isGeneratingBlog && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Blog Post
        </Button>
        <Button 
          onClick={onGenerateSocial}
          disabled={isGeneratingSocial}
          className="bg-accent hover:bg-accent/90"
        >
          {isGeneratingSocial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Social Post
        </Button>
      </div>
      
      {isTranslating && <ProcessingBar type="translation" progress={translationProgress} />}
      {isGeneratingBlog && <ProcessingBar type="blog" progress={blogProgress} />}
      {isGeneratingSocial && <ProcessingBar type="social" progress={socialProgress} />}
    </div>
  );
};

export default ContentGenerationControls;