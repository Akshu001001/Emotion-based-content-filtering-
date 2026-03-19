import { useMemo } from "react";
import { AlertTriangle, Heart, Leaf, Smile, Smartphone, Clock, Eye, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Mood = "happy" | "calm" | "stressed" | "sad";

const tips: Record<Mood, { icon: typeof Smile; tips: { title: string; body: string; platform: string }[] }> = {
  happy: {
    icon: Smile,
    tips: [
      { title: "Share mindfully", body: "Your positive energy is great! But avoid over-posting — research shows it can create comparison pressure for others.", platform: "Instagram / Facebook" },
      { title: "Curate your feed", body: "Follow accounts that maintain your positive state. Unfollow accounts that rely on outrage for engagement.", platform: "Twitter / X" },
      { title: "Set a scroll timer", body: "Even in a good mood, limit sessions to 20 minutes. Happiness can dip after prolonged scrolling.", platform: "TikTok / YouTube" },
    ],
  },
  calm: {
    icon: Leaf,
    tips: [
      { title: "Protect your calm", body: "Avoid trending topics and comment sections — they tend to spike cortisol even when you're relaxed.", platform: "Twitter / X" },
      { title: "Use mute filters", body: "Proactively mute keywords related to distressing news. Most platforms support keyword filtering.", platform: "Instagram / Facebook" },
      { title: "Schedule consumption", body: "Check social media at set times rather than passively scrolling throughout the day.", platform: "All platforms" },
    ],
  },
  stressed: {
    icon: AlertTriangle,
    tips: [
      { title: "Take a 30-min break", body: "When stressed, social media amplifies negative emotions. Step away and try a breathing exercise instead.", platform: "All platforms" },
      { title: "Turn off notifications", body: "Notifications create urgency loops. Disable non-essential alerts when you're feeling overwhelmed.", platform: "All platforms" },
      { title: "Avoid doom-scrolling", body: "Recognize the pattern: stress → scrolling for comfort → more stress. Break the cycle by switching to music or a walk.", platform: "TikTok / Twitter" },
    ],
  },
  sad: {
    icon: Heart,
    tips: [
      { title: "Avoid comparison traps", body: "Curated highlight reels on Instagram can worsen sadness. Remember: you're seeing everyone's best moments, not reality.", platform: "Instagram / Facebook" },
      { title: "Reach out instead", body: "Rather than passively scrolling, send a message to someone you trust. Real connection beats passive consumption.", platform: "WhatsApp / Messenger" },
      { title: "Switch to uplifting content", body: "Search for feel-good communities, pet videos, or gratitude journals. Actively choose what enters your mind.", platform: "Reddit / YouTube" },
    ],
  },
};

const PLATFORM_ICONS: Record<string, typeof Smartphone> = {
  "All platforms": Shield,
  "Instagram / Facebook": Eye,
  "Twitter / X": Smartphone,
  "TikTok / YouTube": Clock,
  "TikTok / Twitter": Clock,
  "WhatsApp / Messenger": Heart,
  "Reddit / YouTube": Smile,
};

export const MoodTips = ({ selectedMood, latestMood }: { selectedMood: string; latestMood?: string | null }) => {
  const moodKey = useMemo(() => {
    // Prefer the user's latest real mood; fall back to filter selection
    if (latestMood && ["happy", "calm", "stressed", "sad"].includes(latestMood)) return latestMood as Mood;
    const m = selectedMood.toLowerCase();
    if (m === "all moods") return "calm";
    return m as Mood;
  }, [selectedMood, latestMood]);

  const current = tips[moodKey];
  const MoodIcon = current.icon;

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <MoodIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Social media tips</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalized advice based on your <span className="font-semibold capitalize text-foreground">{moodKey}</span> mood
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {current.tips.map((tip) => {
          const PlatIcon = PLATFORM_ICONS[tip.platform] ?? Smartphone;
          return (
            <div
              key={tip.title}
              className="rounded-[1.5rem] border border-border/60 bg-gradient-panel p-5 shadow-soft transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">{tip.title}</h3>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <PlatIcon className="h-3 w-3" />
                  {tip.platform}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{tip.body}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
