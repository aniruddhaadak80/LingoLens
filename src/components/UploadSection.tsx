import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
}

const UploadSection = ({ onFileUpload }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        onFileUpload(selectedFile);
      } else {
        toast.error("Please select an audio or video file");
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Upload New File
        </label>
        {file && <span className="text-sm text-gray-500">{file.name}</span>}
      </div>
    </div>
  );
};

export default UploadSection;