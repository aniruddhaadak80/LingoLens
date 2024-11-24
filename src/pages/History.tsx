import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  transcript: string;
  blogPost: string;
  socialPost: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("lingoLensHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">History</h1>
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="glass-card p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.date).toLocaleString()}
                </div>
                <Link 
                  to={`/results?id=${item.id}`}
                  className="flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="mr-1">View Details</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold mb-2 dark:text-white">Transcript</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-center gap-1"
                    >
                      {expandedItems.includes(item.id) ? (
                        <>
                          See Less <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="font-transcript dark:text-gray-300">
                    {expandedItems.includes(item.id) 
                      ? item.transcript
                      : truncateText(item.transcript)
                    }
                  </p>
                </div>
                {item.blogPost && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Blog Post</h3>
                    <p className="font-blog dark:text-gray-300">
                      {expandedItems.includes(item.id) 
                        ? item.blogPost
                        : truncateText(item.blogPost)
                      }
                    </p>
                  </div>
                )}
                {item.socialPost && (
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Social Post</h3>
                    <p className="font-social dark:text-gray-300">
                      {expandedItems.includes(item.id) 
                        ? item.socialPost
                        : truncateText(item.socialPost)
                      }
                    </p>
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