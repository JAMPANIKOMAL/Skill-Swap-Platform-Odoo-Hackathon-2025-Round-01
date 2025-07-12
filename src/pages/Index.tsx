import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilterSection } from "@/components/FilterSection";
import { SkillsGrid } from "@/components/SkillsGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FilterSection />
      <SkillsGrid />
    </div>
  );
};

export default Index;
