import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateContent } from "@/utils/api";
import { toast } from "sonner";

interface TranscriptQuestionsProps {
  transcript: string;
}

const TranscriptQuestions = ({ transcript }: TranscriptQuestionsProps) => {
  const [userQuestion, setUserQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateContent(
        `Question about this transcript: "${userQuestion}"\n\nTranscript: "${transcript}"`,
        "qa"
      );
      setAnswer(response);
    } catch (error) {
      toast.error("Failed to generate answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold dark:text-white">Ask Questions</h3>
      <div className="flex gap-2">
        <Input
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask a question about the transcript..."
          className="flex-1"
        />
        <Button onClick={handleAskQuestion} disabled={isLoading}>
          {isLoading ? "Processing..." : "Ask"}
        </Button>
      </div>
      {answer && (
        <div className="p-4 rounded-lg bg-card/80 backdrop-blur-sm dark:bg-gray-800/80">
          <p className="dark:text-white">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptQuestions;