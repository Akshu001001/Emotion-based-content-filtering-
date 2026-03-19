import { HeartPulse, Leaf, ShieldPlus } from "lucide-react";

const benefits = [
  {
    icon: ShieldPlus,
    title: "Reduce negative emotional impact",
    description: "Lower exposure to emotionally harmful posts and create a safer daily scrolling environment.",
  },
  {
    icon: HeartPulse,
    title: "Improve mental well-being",
    description: "Support more stable moods with calming content, supportive recommendations, and emotional balance tools.",
  },
  {
    icon: Leaf,
    title: "Promote healthier usage",
    description: "Encourage a more intentional relationship with social platforms through wellness-first personalization.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="container">
        <div className="rounded-[2rem] border border-border/60 bg-gradient-panel p-8 shadow-elevated sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            <p className="section-kicker">Benefits</p>
            <h2 className="section-title">Mental-health centered filtering that makes everyday scrolling feel lighter.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
