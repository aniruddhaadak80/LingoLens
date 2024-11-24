import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const languages = [
  { name: 'Spanish', color: 'bg-orange-100 hover:bg-orange-200' },
  { name: 'French', color: 'bg-blue-100 hover:bg-blue-200' },
  { name: 'German', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { name: 'Italian', color: 'bg-green-100 hover:bg-green-200' },
  { name: 'Hindi', color: 'bg-purple-100 hover:bg-purple-200' },
  { name: 'Urdu', color: 'bg-pink-100 hover:bg-pink-200' },
  { name: 'Bengali', color: 'bg-red-100 hover:bg-red-200' },
  { name: 'Chinese', color: 'bg-cyan-100 hover:bg-cyan-200' },
  { name: 'Japanese', color: 'bg-indigo-100 hover:bg-indigo-200' },
  { name: 'Korean', color: 'bg-violet-100 hover:bg-violet-200' },
  { name: 'Arabic', color: 'bg-amber-100 hover:bg-amber-200' },
  { name: 'Russian', color: 'bg-lime-100 hover:bg-lime-200' },
  { name: 'Portuguese', color: 'bg-teal-100 hover:bg-teal-200' }
];

interface TranslationDropdownProps {
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
}

const TranslationDropdown = ({ selectedLanguage, onLanguageSelect }: TranslationDropdownProps) => {
  return (
    <Select value={selectedLanguage} onValueChange={onLanguageSelect}>
      <SelectTrigger className="w-[200px] bg-card dark:bg-gray-800 cursor-pointer hover:bg-opacity-90 transition-colors">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.name} 
            value={lang.name}
            className={`cursor-pointer transition-all duration-200 ${lang.color} dark:text-gray-900 hover:scale-[1.02]`}
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TranslationDropdown;