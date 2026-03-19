import { Activity, BadgeCheck, Brain, ShieldCheck, Sparkle } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Emotion Detection",
    description: "Understands emotional patterns and turns them into safer feed decisions.",
  },
  {
    icon: Sparkle,
    title: "Personalized Feed",
    description: "Shapes recommendations around each user’s emotional context and needs.",
  },
  {
    icon: ShieldCheck,
    title: "Smart Content Filtering",
    description: "Reduces exposure to content likely to amplify distress or emotional fatigue.",
  },
  {
    icon: Activity,
    title: "Mood Tracking Dashboard",
    description: "Visualize changes in mood trends and monitor emotional balance over time.",
  },
  {
    icon: BadgeCheck,
    title: "Mental Health Friendly",
    description: "Designed to support healthier online habits with comfort-first recommendations.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="container space-y-10">
        <div className="max-w-3xl">
          <p className="section-kicker">Features</p>
          <h2 className="section-title">A frontend experience built to feel calm, clear, and emotionally aware.</h2>
          <p className="section-copy">
            Every feature is designed to support emotional well-being while still keeping content discovery intuitive and engaging.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
