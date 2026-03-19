import { useEffect, useState } from "react";
import { Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { FooterSection } from "@/components/FooterSection";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactInfo = [
  {
    icon: Mail,
    title: "Email us",
    value: "hello@emotionfilter.app",
    href: "mailto:hello@emotionfilter.app",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Remote-first, worldwide",
    href: undefined,
  },
  {
    icon: MessageCircle,
    title: "Community",
    value: "Join the conversation",
    href: "https://github.com",
  },
];

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

const Contact = () => {
  const [isDark, setIsDark] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <Navbar isDark={isDark} onToggleTheme={handleToggleTheme} />
        <main className="pb-16">
          {/* Hero */}
          <section className="border-b border-border/60 py-20 sm:py-28">
            <div className="container max-w-4xl space-y-6 text-center">
              <p className="section-kicker">Get in touch</p>
              <h1 className="section-title mt-0">
                We'd love to hear from you.
              </h1>
              <p className="section-copy mx-auto mt-0 max-w-2xl">
                Whether you have a question about features, need support, or want to
                collaborate — our team is ready to help.
              </p>
            </div>
          </section>

          {/* Contact cards */}
          <section className="py-16 sm:py-20">
            <div className="container grid gap-6 md:grid-cols-3">
              {contactInfo.map(({ icon: Icon, title, value, href }) => (
                <Card
                  key={title}
                  className="rounded-[1.75rem] border-border/60 bg-card/80 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevated"
                >
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-soft">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Form + socials */}
          <section className="border-t border-border/60 py-16 sm:py-20">
            <div className="container grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              {/* Contact form */}
              <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-foreground">Send a message</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fill out the form and we'll respond within 24 hours.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Name
                      </label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="rounded-xl border-border/60 bg-secondary/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-xl border-border/60 bg-secondary/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        rows={5}
                        className="rounded-xl border-border/60 bg-secondary/60"
                      />
                    </div>
                    <Button type="submit" variant="hero" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Social links */}
              <div className="space-y-8">
                <Card className="rounded-[2rem] border-border/60 bg-gradient-panel shadow-elevated">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-foreground">Follow us</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Stay updated on new features, wellness tips, and community events.
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      {socialLinks.map(({ icon: Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={label}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card text-foreground/80 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:text-foreground hover:shadow-elevated"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-soft">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-foreground">FAQ</h3>
                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Is my mood data private?</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Absolutely. All emotional data is encrypted and never shared with third parties.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Can I export my data?</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Yes — you can download all your mood entries and habit logs at any time.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Is it free to use?</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          The core mood tracking and filtering features are completely free.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <FooterSection />
      </div>
    </div>
  );
};

export default Contact;
