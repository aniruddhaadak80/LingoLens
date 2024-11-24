import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface HistoryItem {
  id: string;
  date: string;
  transcript: string;
  blogPost: string;
  socialPost: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("lingoLensHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">History</h1>
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="glass-card p-6 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {new Date(item.date).toLocaleString()}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 dark:text-white">Transcript</h3>
                  <p className="font-transcript dark:text-gray-300">{item.transcript}</p>
                </div>
                {item.blogPost && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Blog Post</h3>
                    <p className="font-blog dark:text-gray-300">{item.blogPost}</p>
                  </div>
                )}
                {item.socialPost && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Social Post</h3>
                    <p className="font-social dark:text-gray-300">{item.socialPost}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default History;