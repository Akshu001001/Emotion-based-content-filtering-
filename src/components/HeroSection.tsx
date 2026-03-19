import heroImage from "@/assets/emotion-filter-hero.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

const emotionChips = [
  { emoji: "😊", label: "Happy", position: "chip-1" },
  { emoji: "😢", label: "Sad", position: "chip-2" },
  { emoji: "😠", label: "Stressed", position: "chip-3" },
  { emoji: "😌", label: "Calm", position: "chip-4" },
];

export const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 space-y-8 animate-fade-in">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur-sm">
            AI-guided emotional wellness for healthier social media habits
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-balance font-display text-5xl leading-[0.94] text-foreground sm:text-6xl lg:text-7xl">
              Emotion-Based Content Filtering
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Detect emotional states like happy, sad, stressed, or calm and reshape the feed to surface safer, kinder,
              and more restorative content in real time.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <a href="/dashboard">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <a href="#about">
                <PlayCircle className="h-4 w-4" />
                Learn More
              </a>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["92%", "positive recommendation relevance"],
              ["4 moods", "emotion states recognized"],
              ["24/7", "supportive content adaptation"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-soft backdrop-blur-sm">
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl animate-scale-in">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />
          <div className="relative rounded-[2rem] border border-border/60 bg-card/75 p-4 shadow-elevated backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-secondary">
              <img src={heroImage} alt="Illustration of AI reading emotions to improve social media well-being" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-hero opacity-30" />
            </div>
            {emotionChips.map((chip) => (
              <div key={chip.label} className={`emotion-chip ${chip.position}`}>
                <span className="text-xl">{chip.emoji}</span>
                <span className="text-sm font-medium text-foreground">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
