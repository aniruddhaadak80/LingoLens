import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  content: string;
  type: 'blog' | 'social';
}

const ShareDialog = ({ content, type }: ShareDialogProps) => {
  const platforms = [
    {
      name: 'Twitter',
      icon: Twitter,
      share: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      share: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(content)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      share: () => {
        const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(`LingoLens ${type} post`)}&summary=${encodeURIComponent(content)}`;
        window.open(url, '_blank');
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {type} post</DialogTitle>
        </DialogHeader>
        <div className="flex space-x-2">
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              size="icon"
              onClick={platform.share}
              className="hover:scale-105 transition-transform"
            >
              <platform.icon className="h-4 w-4" />
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="hover:scale-105 transition-transform"
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;