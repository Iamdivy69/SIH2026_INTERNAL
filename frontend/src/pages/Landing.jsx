import { Navbar } from "../components/parakh/Navbar";
import { Hero } from "../components/parakh/Hero";
import { TrustSection } from "../components/parakh/TrustSection";
import { ProblemSection } from "../components/parakh/ProblemSection";
import { PlatformSection } from "../components/parakh/PlatformSection";
import { AdaptiveEngine } from "../components/parakh/AdaptiveEngine";
import { AIQuestionGeneration } from "../components/parakh/AIQuestionGeneration";
import { InstitutionDashboard } from "../components/parakh/InstitutionDashboard";
import { SecuritySection } from "../components/parakh/SecuritySection";
import { Workflow } from "../components/parakh/Workflow";
import { TechStack } from "../components/parakh/TechStack";
import { VideoSection } from "../components/parakh/VideoSection";
import { FinalCTA } from "../components/parakh/FinalCTA";
import { Footer } from "../components/parakh/Footer";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustSection />
        <ProblemSection />
        <PlatformSection />
        <AdaptiveEngine />
        <AIQuestionGeneration />
        <InstitutionDashboard />
        <SecuritySection />
        <Workflow />
        <TechStack />
        <VideoSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
