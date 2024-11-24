interface QAItem {
  question: string;
  answer: string;
  timestamp: string;
}

interface QAHistoryProps {
  items: QAItem[];
}

const QAHistory = ({ items }: QAHistoryProps) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="p-4 rounded-lg bg-card/80 backdrop-blur-sm dark:bg-gray-800/80">
          <p className="text-sm text-gray-500 mb-2">{item.timestamp}</p>
          <p className="font-medium mb-2">Q: {item.question}</p>
          <p className="text-gray-700 dark:text-gray-300">A: {item.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default QAHistory;