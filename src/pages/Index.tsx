import { Mic, Globe, BarChart3 } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";

const Index = () => {
  const features = [
    {
      title: "Audio Transcription",
      description: "Convert speech to text with high accuracy using advanced AI technology.",
      icon: <Mic className="w-6 h-6" />
    },
    {
      title: "Real-time Translation",
      description: "Translate audio content into multiple languages instantly.",
      icon: <Globe className="w-6 h-6" />
    },
    {
      title: "Advanced Analytics",
      description: "Get detailed insights and analysis of your audio content.",
      icon: <BarChart3 className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.2}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;