import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="text-sm text-secondary/60">
           ♥️ Made with passion by Aniruddha Adak
          </div>
          <div className="mt-4 flex space-x-4">
            <a 
              href="https://github.com/aniruddhaadak80/LingoLens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary/60 hover:text-secondary transition-colors"
            >
              GitHub
            </a>
            <span className="text-secondary/60">•</span>
            <Link to="/contact" className="text-secondary/60 hover:text-secondary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
