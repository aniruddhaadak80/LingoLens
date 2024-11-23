import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="space-y-4">
            <h1 className="text-4xl font-bold text-secondary">About LingoLens</h1>
            <p className="text-lg text-secondary/80">
              LingoLens is a powerful audio and video transcription platform that leverages cutting-edge AI technology to transform your media into actionable insights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary">Our Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-secondary">LEMUR AI</h3>
                <p className="text-secondary/70">
                  Powered by AssemblyAI's LEMUR API for accurate transcription and summarization of audio and video content.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-secondary">Google Gemini</h3>
                <p className="text-secondary/70">
                  Advanced language translation and content generation capabilities using Google's Gemini AI.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-secondary/70">
              <li>Real-time audio and video transcription</li>
              <li>Multi-language translation support</li>
              <li>Automated blog and social media content generation</li>
              <li>Smart summarization and key points extraction</li>
              <li>Speaker diarization for multi-speaker content</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;