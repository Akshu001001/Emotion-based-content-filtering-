import { useEffect, useState } from "react";
import { BenefitsSection } from "@/components/BenefitsSection";
import { DashboardPreviewSection } from "@/components/DashboardPreviewSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FooterSection } from "@/components/FooterSection";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("emotion-filter-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("emotion-filter-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <Navbar isDark={isDark} onToggleTheme={handleToggleTheme} />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DashboardPreviewSection />
          <BenefitsSection />
        </main>
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
