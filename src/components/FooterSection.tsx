import { Github, Instagram, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export const FooterSection = () => {
  return (
    <footer id="contact" className="border-t border-border/60 py-12">
      <div className="container grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground">Emotion Filter</p>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Emotion-Based Content Filtering is a mental-health aware social media platform concept focused on emotionally safe recommendations,
            supportive content discovery, and healthier online experiences.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:justify-items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
            <a href="mailto:hello@emotionfilter.app" className="flex items-center gap-2 text-sm text-foreground/85 transition-colors hover:text-foreground">
              <Mail className="h-4 w-4" />
              hello@emotionfilter.app
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-foreground/85 transition-colors hover:text-foreground">
              github.com/emotion-filter
            </a>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Follow</p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card text-foreground/80 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:text-foreground hover:shadow-elevated"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
