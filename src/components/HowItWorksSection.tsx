import { ScanFace, SearchCode, SlidersHorizontal, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ScanFace,
    title: "Emotion Detection",
    description: "The system identifies current mood signals such as happiness, sadness, stress, or calmness.",
  },
  {
    icon: SearchCode,
    title: "Content Analysis",
    description: "Incoming content is scanned for tone, intensity, sentiment, and possible emotional triggers.",
  },
  {
    icon: SlidersHorizontal,
    title: "Smart Filtering",
    description: "The feed adjusts dynamically to reduce distressing material and prioritize emotionally safer posts.",
  },
  {
    icon: Sparkles,
    title: "Positive Recommendations",
    description: "Helpful, inspiring, and restorative content is recommended to encourage a healthier digital mood.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <div className="container space-y-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker justify-center">How it works</p>
          <h2 className="section-title text-center">Four calm, intelligent steps toward a better feed.</h2>
          <p className="section-copy mx-auto text-center">
            Each layer is designed to understand emotional context and respond with supportive recommendations instead of adding digital pressure.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="group rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-elevated"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
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
