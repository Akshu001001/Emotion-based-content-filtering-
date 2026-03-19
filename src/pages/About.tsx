import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Eye,
  HeartHandshake,
  Lightbulb,
  Shield,
  ShieldPlus,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { FooterSection } from "@/components/FooterSection";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

const coreValues = [
  {
    icon: BrainCircuit,
    title: "What it is",
    description:
      "Emotion-based filtering reads mood signals and feed context to decide which posts are supportive, calming, or potentially overwhelming.",
  },
  {
    icon: HeartHandshake,
    title: "Why it matters",
    description:
      "Social feeds can intensify anxiety, stress, or sadness. A more emotionally aware feed creates a gentler digital environment.",
  },
  {
    icon: ShieldPlus,
    title: "How it helps",
    description:
      "Users receive more uplifting content, fewer emotionally harmful triggers, and a stronger sense of control over their online experience.",
  },
];

const principles = [
  {
    icon: Shield,
    title: "Privacy first",
    description:
      "All mood data stays private and encrypted. We never share emotional profiles with advertisers or third parties.",
  },
  {
    icon: Eye,
    title: "Full transparency",
    description:
      "Every filtering decision is explainable. Users can see exactly why certain content was surfaced or hidden.",
  },
  {
    icon: Target,
    title: "User control",
    description:
      "Override any filter at any time. The system suggests — you decide what appears in your feed.",
  },
  {
    icon: Sparkles,
    title: "Continuous learning",
    description:
      "The algorithm improves with every interaction, becoming more attuned to your emotional patterns over time.",
  },
];

const teamValues = [
  {
    icon: Users,
    title: "Built for people",
    description:
      "We design for real emotional needs, not engagement metrics. Every feature is tested against wellbeing outcomes.",
  },
  {
    icon: Lightbulb,
    title: "Research-driven",
    description:
      "Grounded in affective computing and positive psychology research to ensure every recommendation genuinely helps.",
  },
];

const About = () => {
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
        <main className="pb-16">
          {/* Hero */}
          <section className="border-b border-border/60 py-20 sm:py-28">
            <div className="container max-w-4xl space-y-6 text-center">
              <p className="section-kicker">About the platform</p>
              <h1 className="section-title mt-0">
                A more compassionate algorithm for modern social spaces.
              </h1>
              <p className="section-copy mx-auto mt-0 max-w-2xl">
                Emotion-Based Content Filtering is designed to reduce harmful digital
                overload by adapting content to a user's emotional state. It makes the
                social experience feel more mindful, supportive, and emotionally safe.
              </p>
            </div>
          </section>

          {/* Core values */}
          <section className="py-16 sm:py-20">
            <div className="container space-y-10">
              <div className="max-w-xl space-y-4">
                <p className="section-kicker">Core pillars</p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Understanding the foundation
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {coreValues.map(({ icon: Icon, title, description }) => (
                  <Card
                    key={title}
                    className="rounded-[1.75rem] border-border/60 bg-card/80 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <CardContent className="p-6">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Principles */}
          <section className="border-t border-border/60 py-16 sm:py-20">
            <div className="container space-y-10">
              <div className="max-w-xl space-y-4">
                <p className="section-kicker">Our principles</p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Designed around trust and transparency
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {principles.map(({ icon: Icon, title, description }) => (
                  <Card
                    key={title}
                    className="rounded-[1.75rem] border-border/60 bg-card/80 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <CardContent className="p-6">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Team values */}
          <section className="border-t border-border/60 py-16 sm:py-20">
            <div className="container space-y-10">
              <div className="max-w-xl space-y-4">
                <p className="section-kicker">Our approach</p>
                <h2 className="text-3xl font-semibold text-foreground">
                  People over engagement
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {teamValues.map(({ icon: Icon, title, description }) => (
                  <Card
                    key={title}
                    className="rounded-[2rem] border-border/60 bg-gradient-panel shadow-elevated"
                  >
                    <CardContent className="flex items-start gap-5 p-8">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>
        <FooterSection />
      </div>
    </div>
  );
};

export default About;
