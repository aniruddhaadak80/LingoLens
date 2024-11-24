import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface SaveButtonProps {
  onSave: () => void;
  isEditing: boolean;
}

const SaveButton = ({ onSave, isEditing }: SaveButtonProps) => {
  const handleSave = () => {
    onSave();
    toast.success("Content saved successfully!");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSave}
      disabled={!isEditing}
    >
      <Save className="h-4 w-4" />
    </Button>
  );
};

export default SaveButton;