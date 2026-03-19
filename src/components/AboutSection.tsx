import { BrainCircuit, HeartHandshake, ShieldPlus } from "lucide-react";

const aboutPoints = [
  {
    icon: BrainCircuit,
    title: "What it is",
    description: "Emotion-based filtering reads mood signals and feed context to decide which posts are supportive, calming, or potentially overwhelming.",
  },
  {
    icon: HeartHandshake,
    title: "Why it matters",
    description: "Social feeds can intensify anxiety, stress, or sadness. A more emotionally aware feed creates a gentler digital environment.",
  },
  {
    icon: ShieldPlus,
    title: "How it helps",
    description: "Users receive more uplifting content, fewer emotionally harmful triggers, and a stronger sense of control over their online experience.",
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <p className="section-kicker">About the platform</p>
          <h2 className="section-title">A more compassionate algorithm for modern social spaces.</h2>
          <p className="section-copy">
            Emotion-Based Content Filtering is designed to reduce harmful digital overload by adapting content to a user’s emotional state.
            It makes the social experience feel more mindful, supportive, and emotionally safe.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {aboutPoints.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevated">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
