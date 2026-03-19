const recommendedContent = [
  { title: "Breathing exercises for stressful moments", tag: "Calm" },
  { title: "Gentle productivity routines for low-energy days", tag: "Supportive" },
  { title: "Short gratitude stories from your community", tag: "Positive" },
];

const moodBars = [
  { label: "Happy", value: "72%", height: "h-28" },
  { label: "Calm", value: "81%", height: "h-36" },
  { label: "Stressed", value: "29%", height: "h-16" },
  { label: "Sad", value: "18%", height: "h-12" },
];

export const DashboardPreviewSection = () => {
  return (
    <section id="dashboard" className="py-20 sm:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="space-y-5">
          <p className="section-kicker">Dashboard preview</p>
          <h2 className="section-title">Track mood shifts, content balance, and supportive recommendations.</h2>
          <p className="section-copy">
            A gentle dashboard helps users understand emotional patterns, discover healthier content, and feel more in control of their social media environment.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Emotion graph", "Visualize daily mood changes over time."],
              ["Mood stats", "Review calmness, stress, and positivity levels."],
              ["Recommendations", "Receive uplifting content based on your current state."],
              ["Content safety", "Reduce harmful emotional exposure automatically."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-soft">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-elevated backdrop-blur-xl">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] bg-secondary/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emotion graph</p>
                  <h3 className="mt-1 text-2xl font-semibold text-foreground">Weekly mood balance</h3>
                </div>
                <div className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">Live sync</div>
              </div>
              <div className="mt-8 flex h-52 items-end justify-between gap-4 rounded-[1.25rem] border border-border/60 bg-background/80 p-5">
                {moodBars.map((bar) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                    <div className={`w-full rounded-t-3xl bg-gradient-primary ${bar.height}`} />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">{bar.value}</p>
                      <p className="text-xs text-muted-foreground">{bar.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.5rem] bg-secondary/80 p-5">
                <p className="text-sm font-medium text-muted-foreground">Mood statistics</p>
                <div className="mt-4 space-y-4">
                  {[
                    ["Positive content ratio", "84%"],
                    ["Stress trigger reduction", "41%"],
                    ["Calm session streak", "12 days"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-secondary/80 p-5">
                <p className="text-sm font-medium text-muted-foreground">Recommended content</p>
                <div className="mt-4 space-y-3">
                  {recommendedContent.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-border/60 bg-background/80 p-4 transition-transform duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">{item.tag}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
