const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-up">
            Transform Speech into
            <span className="text-primary"> Insights</span>
          </h1>
          <p className="text-xl text-secondary/60 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Real-time audio transcription, translation, and analytics powered by advanced AI technology.
          </p>
          <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <button className="button-primary">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;