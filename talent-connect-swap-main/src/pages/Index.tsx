import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SkillsGrid } from "@/components/SkillsGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SkillsGrid />
    </div>
  );
};

export default Index;
