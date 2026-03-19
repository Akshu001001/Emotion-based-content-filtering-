import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export const AuthShell = ({ eyebrow, title, description, children, footer }: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell min-h-screen">
        <main className="container grid min-h-screen items-center gap-12 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <section className="order-2 space-y-6 lg:order-1 lg:max-w-xl">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                <span className="text-lg font-semibold">😊</span>
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Emotion Filter</p>
                <p className="text-base font-semibold text-foreground">Mental wellness feed</p>
              </div>
            </Link>

            <div className="space-y-4">
              <p className="section-kicker">{eyebrow}</p>
              <h1 className="section-title mt-0 max-w-xl">{title}</h1>
              <p className="section-copy mt-0">{description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Private", "Your mood data stays tied to your account."],
                ["Adaptive", "Recommendations change with your emotional state."],
                ["Secure", "Protected routes keep the dashboard user-only."],
              ].map(([label, text]) => (
                <div key={label} className="rounded-[1.5rem] border border-border/60 bg-card/75 p-4 shadow-soft backdrop-blur-xl">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
              {children}
              <div className="mt-6 border-t border-border/60 pt-6">{footer}</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
