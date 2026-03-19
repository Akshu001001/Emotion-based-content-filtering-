import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Brain,
  CalendarRange,
  Filter,
  HeartPulse,
  Info,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBookmarks } from "@/components/ContentBookmarks";
import { FooterSection } from "@/components/FooterSection";
import { HabitsCalendar } from "@/components/HabitsCalendar";
import { HabitsTracker } from "@/components/HabitsTracker";
import { MoodChatbot } from "@/components/MoodChatbot";
import { MoodLogger } from "@/components/MoodLogger";
import { MoodTips } from "@/components/MoodTips";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Constants ─── */
const filterOptions = ["All moods", "Happy", "Calm", "Stressed", "Sad"] as const;
const rangeOptions = ["7d", "30d", "90d"] as const;

type MoodFilter = (typeof filterOptions)[number];
type RangeFilter = (typeof rangeOptions)[number];

type MoodEntry = {
  day: string;
  happy: number;
  calm: number;
  stressed: number;
  sad: number;
};

const SAMPLE_DATA: Record<RangeFilter, MoodEntry[]> = {
  "7d": [
    { day: "Mon", happy: 62, calm: 78, stressed: 26, sad: 18 },
    { day: "Tue", happy: 68, calm: 74, stressed: 31, sad: 16 },
    { day: "Wed", happy: 70, calm: 80, stressed: 22, sad: 14 },
    { day: "Thu", happy: 65, calm: 76, stressed: 30, sad: 20 },
    { day: "Fri", happy: 72, calm: 82, stressed: 18, sad: 11 },
    { day: "Sat", happy: 79, calm: 85, stressed: 16, sad: 10 },
    { day: "Sun", happy: 75, calm: 88, stressed: 14, sad: 9 },
  ],
  "30d": [
    { day: "W1", happy: 61, calm: 72, stressed: 34, sad: 22 },
    { day: "W2", happy: 66, calm: 77, stressed: 28, sad: 18 },
    { day: "W3", happy: 71, calm: 81, stressed: 24, sad: 15 },
    { day: "W4", happy: 76, calm: 86, stressed: 19, sad: 11 },
  ],
  "90d": [
    { day: "Jan", happy: 57, calm: 69, stressed: 39, sad: 25 },
    { day: "Feb", happy: 64, calm: 74, stressed: 31, sad: 21 },
    { day: "Mar", happy: 69, calm: 79, stressed: 26, sad: 16 },
  ],
};

const recommendationLibrary = {
  "All moods": [
    { title: "Mindful creator list", tag: "Curated", copy: "A calmer set of voices with supportive posting patterns and lower outrage frequency." },
    { title: "Evening reset playlist", tag: "Audio", copy: "Short ambient clips and gentle music to reduce emotional carryover after scrolling." },
    { title: "Healthy feed nudges", tag: "Habit", copy: "Prompts to pause, breathe, and switch to restorative content when intensity rises." },
  ],
  Happy: [
    { title: "Momentum journal prompts", tag: "Reflect", copy: "Capture what is working today and reinforce the habits behind your positive mood." },
    { title: "Shareable wins feed", tag: "Uplift", copy: "Balanced, optimistic content from communities focused on gratitude and progress." },
    { title: "Energy-preserving breaks", tag: "Care", copy: "Light reminders to avoid overconsumption and keep a healthy digital rhythm." },
  ],
  Calm: [
    { title: "Deep focus stream", tag: "Focus", copy: "Low-noise content blocks that protect concentration and maintain emotional steadiness." },
    { title: "Slow reading queue", tag: "Read", copy: "Thoughtful articles and community stories selected for clarity and emotional balance." },
    { title: "Nature micro-moments", tag: "Reset", copy: "Short visual breaks designed to preserve your calm without pulling attention away." },
  ],
  Stressed: [
    { title: "Stress trigger shield", tag: "Protect", copy: "Temporarily downranks conflict-heavy or urgency-driven posts while you recover." },
    { title: "Two-minute breath coach", tag: "Calm", copy: "A quick guided exercise paired with softer content recommendations for decompression." },
    { title: "Supportive community picks", tag: "Support", copy: "Warmer, lower-pressure spaces that feel helpful rather than demanding." },
  ],
  Sad: [
    { title: "Gentle encouragement feed", tag: "Care", copy: "Compassionate stories and soft content chosen to avoid emotional overload." },
    { title: "Connection reminders", tag: "Reach out", copy: "Prompts to engage with trusted people and supportive communities at your own pace." },
    { title: "Low-stimulation mode", tag: "Relief", copy: "A lighter content mix with reduced intensity, fewer comparisons, and calmer pacing." },
  ],
} satisfies Record<MoodFilter, { title: string; tag: string; copy: string }[]>;

const moodMeta = {
  happy: { label: "Happy", color: "hsl(var(--primary))" },
  calm: { label: "Calm", color: "hsl(var(--primary-glow))" },
  stressed: { label: "Stressed", color: "hsl(var(--destructive))" },
  sad: { label: "Sad", color: "hsl(var(--muted-foreground))" },
} as const;

type MoodKey = keyof typeof moodMeta;

const trendChartConfig = {
  happy: { label: "Happy", color: "hsl(var(--primary))" },
  calm: { label: "Calm", color: "hsl(var(--primary-glow))" },
  stressed: { label: "Stressed", color: "hsl(var(--destructive))" },
  sad: { label: "Sad", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

const distributionChartConfig = {
  value: { label: "Share", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const RANGE_DAYS: Record<RangeFilter, number> = { "7d": 7, "30d": 30, "90d": 90 };

const SampleDataBanner = () => (
  <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-primary">
    <Info className="h-3.5 w-3.5 shrink-0" />
    <span><strong>Sample data</strong> — Log your mood to see your real stats here.</span>
  </div>
);

/* ─── Helpers to aggregate DB rows into chart data ─── */
type RawMoodRow = { mood: string; intensity: number; logged_at: string };

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function aggregateToChart(rows: RawMoodRow[], range: RangeFilter): MoodEntry[] {
  if (range === "7d") {
    // Group by day of week
    const buckets: Record<string, { happy: number[]; calm: number[]; stressed: number[]; sad: number[] }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatLocalDate(d);
      const label = DAY_LABELS[d.getDay()];
      buckets[key] = { happy: [], calm: [], stressed: [], sad: [] };
    }

    rows.forEach((r) => {
      if (buckets[r.logged_at]) {
        const m = r.mood as MoodKey;
        buckets[r.logged_at][m].push(r.intensity);
      }
    });

    return Object.entries(buckets).map(([dateStr, moods]) => {
      const d = new Date(dateStr + "T00:00:00");
      return {
        day: DAY_LABELS[d.getDay()],
        happy: moods.happy.length ? Math.round(moods.happy.reduce((a, b) => a + b, 0) / moods.happy.length) : 0,
        calm: moods.calm.length ? Math.round(moods.calm.reduce((a, b) => a + b, 0) / moods.calm.length) : 0,
        stressed: moods.stressed.length ? Math.round(moods.stressed.reduce((a, b) => a + b, 0) / moods.stressed.length) : 0,
        sad: moods.sad.length ? Math.round(moods.sad.reduce((a, b) => a + b, 0) / moods.sad.length) : 0,
      };
    });
  }

  if (range === "30d") {
    // Group into 4 weeks
    const today = new Date();
    const weeks: MoodEntry[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (w + 1) * 7 + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - w * 7);

      const startStr = formatLocalDate(weekStart);
      const endStr = formatLocalDate(weekEnd);

      const weekRows = rows.filter((r) => r.logged_at >= startStr && r.logged_at <= endStr);
      const byMood: Record<MoodKey, number[]> = { happy: [], calm: [], stressed: [], sad: [] };
      weekRows.forEach((r) => byMood[r.mood as MoodKey].push(r.intensity));

      weeks.push({
        day: `W${4 - w}`,
        happy: byMood.happy.length ? Math.round(byMood.happy.reduce((a, b) => a + b, 0) / byMood.happy.length) : 0,
        calm: byMood.calm.length ? Math.round(byMood.calm.reduce((a, b) => a + b, 0) / byMood.calm.length) : 0,
        stressed: byMood.stressed.length ? Math.round(byMood.stressed.reduce((a, b) => a + b, 0) / byMood.stressed.length) : 0,
        sad: byMood.sad.length ? Math.round(byMood.sad.reduce((a, b) => a + b, 0) / byMood.sad.length) : 0,
      });
    }
    return weeks;
  }

  // 90d - group by month
  const today = new Date();
  const months: MoodEntry[] = [];
  for (let m = 2; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - m + 1, 0);
    const startStr = formatLocalDate(monthDate);
    const endStr = formatLocalDate(monthEnd);
    const label = monthDate.toLocaleDateString("en-US", { month: "short" });

    const monthRows = rows.filter((r) => r.logged_at >= startStr && r.logged_at <= endStr);
    const byMood: Record<MoodKey, number[]> = { happy: [], calm: [], stressed: [], sad: [] };
    monthRows.forEach((r) => byMood[r.mood as MoodKey].push(r.intensity));

    months.push({
      day: label,
      happy: byMood.happy.length ? Math.round(byMood.happy.reduce((a, b) => a + b, 0) / byMood.happy.length) : 0,
      calm: byMood.calm.length ? Math.round(byMood.calm.reduce((a, b) => a + b, 0) / byMood.calm.length) : 0,
      stressed: byMood.stressed.length ? Math.round(byMood.stressed.reduce((a, b) => a + b, 0) / byMood.stressed.length) : 0,
      sad: byMood.sad.length ? Math.round(byMood.sad.reduce((a, b) => a + b, 0) / byMood.sad.length) : 0,
    });
  }
  return months;
}

/* ─── Dashboard ─── */
const Dashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodFilter>("All moods");
  const [selectedRange, setSelectedRange] = useState<RangeFilter>("7d");
  const { user, profile } = useAuth();

  // Real mood data
  const [rawMoodRows, setRawMoodRows] = useState<RawMoodRow[]>([]);
  const [moodLoading, setMoodLoading] = useState(true);
  const hasRealData = rawMoodRows.length > 0;

  // Latest mood from DB for tips & recommendations
  const latestMood = useMemo(() => {
    if (!hasRealData) return null;
    // Most recent entry (rows are sorted ascending, so last one)
    return rawMoodRows[rawMoodRows.length - 1].mood;
  }, [hasRealData, rawMoodRows]);

  const fetchMoodData = useCallback(async () => {
    if (!user) return;
    setMoodLoading(true);
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 90);

    const { data } = await supabase
      .from("mood_entries")
      .select("mood, intensity, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", formatLocalDate(start))
      .lte("logged_at", formatLocalDate(today))
      .order("logged_at", { ascending: true });

    setRawMoodRows((data as RawMoodRow[]) ?? []);
    setMoodLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

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

  // Use real data if available, else sample
  const moodData = useMemo(() => {
    if (!hasRealData) return SAMPLE_DATA[selectedRange];
    // Filter rows to selected range
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - RANGE_DAYS[selectedRange]);
    const startStr = formatLocalDate(start);
    const filtered = rawMoodRows.filter((r) => r.logged_at >= startStr);
    const aggregated = aggregateToChart(filtered, selectedRange);
    // If aggregation has all zeros (no entries in range), fall back to sample
    const hasValues = aggregated.some((e) => e.happy + e.calm + e.stressed + e.sad > 0);
    return hasValues ? aggregated : SAMPLE_DATA[selectedRange];
  }, [hasRealData, rawMoodRows, selectedRange]);

  // Whether to show sample banner for this range
  const isSampleForRange = useMemo(() => {
    if (!hasRealData) return true;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - RANGE_DAYS[selectedRange]);
    const startStr = formatLocalDate(start);
    return !rawMoodRows.some((r) => r.logged_at >= startStr);
  }, [hasRealData, rawMoodRows, selectedRange]);

  const displayName = profile?.display_name ?? profile?.username ?? user?.email?.split("@")[0] ?? "there";

  const trendData = useMemo(() => {
    if (selectedMood === "All moods") return moodData;
    const moodKey = selectedMood.toLowerCase() as MoodKey;
    return moodData.map((entry) => ({ day: entry.day, [moodKey]: entry[moodKey] }));
  }, [moodData, selectedMood]);

  const distributionData = useMemo(() => {
    const totals = moodData.reduce(
      (acc, entry) => {
        acc.happy += entry.happy;
        acc.calm += entry.calm;
        acc.stressed += entry.stressed;
        acc.sad += entry.sad;
        return acc;
      },
      { happy: 0, calm: 0, stressed: 0, sad: 0 },
    );

    const entries = Object.entries(totals).map(([key, value]) => ({
      mood: moodMeta[key as MoodKey].label,
      value,
      fill: moodMeta[key as MoodKey].color,
    }));

    return selectedMood === "All moods"
      ? entries
      : entries.filter((item) => item.mood === selectedMood);
  }, [moodData, selectedMood]);

  const averageCalm = Math.round(moodData.reduce((sum, entry) => sum + entry.calm, 0) / moodData.length);
  const averageStress = Math.round(moodData.reduce((sum, entry) => sum + entry.stressed, 0) / moodData.length);
  const strongestMood = distributionData.reduce((prev, current) => (current.value > prev.value ? current : prev), distributionData[0]);

  // Dynamic metric cards based on real data
  const totalEntries = rawMoodRows.length;
  const metricCards = useMemo(() => {
    if (!hasRealData) {
      return [
        { title: "Mood entries", value: "0", copy: "Start logging moods to track your emotional patterns.", icon: Activity },
        { title: "Dominant mood", value: "—", copy: "Your most frequent mood will appear here.", icon: Brain },
        { title: "Average intensity", value: "—", copy: "See how intense your emotions are on average.", icon: Sparkles },
        { title: "Tracking days", value: "0", copy: "Number of unique days you've logged a mood.", icon: HeartPulse },
      ];
    }

    // Calculate real metrics
    const moodCounts: Record<string, number> = {};
    let totalIntensity = 0;
    const uniqueDays = new Set<string>();

    rawMoodRows.forEach((r) => {
      moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1;
      totalIntensity += r.intensity;
      uniqueDays.add(r.logged_at);
    });

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const avgIntensity = Math.round(totalIntensity / rawMoodRows.length);

    return [
      { title: "Mood entries", value: String(totalEntries), copy: `You've logged ${totalEntries} mood ${totalEntries === 1 ? "entry" : "entries"} so far.`, icon: Activity },
      { title: "Dominant mood", value: dominantMood ? dominantMood[0].charAt(0).toUpperCase() + dominantMood[0].slice(1) : "—", copy: dominantMood ? `${dominantMood[0]} appeared ${dominantMood[1]} times in your logs.` : "Log more to see trends.", icon: Brain },
      { title: "Average intensity", value: `${avgIntensity}%`, copy: avgIntensity > 60 ? "Your emotions tend to run strong." : "Your emotional intensity is moderate.", icon: Sparkles },
      { title: "Tracking days", value: String(uniqueDays.size), copy: `Active on ${uniqueDays.size} unique ${uniqueDays.size === 1 ? "day" : "days"}.`, icon: HeartPulse },
    ];
  }, [hasRealData, rawMoodRows, totalEntries]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <Navbar isDark={isDark} onToggleTheme={handleToggleTheme} />
        <main className="pb-16">
          <section className="border-b border-border/60 pb-10 pt-10 sm:pb-14 sm:pt-14">
            <div className="container space-y-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-5">
                  <p className="section-kicker">Mood dashboard</p>
                  <h1 className="section-title mt-0">Welcome back, {displayName}. Track emotional patterns, tune filters, and surface healthier content in real time.</h1>
                  <p className="section-copy mt-0">
                    This dedicated workspace turns emotional signals into actionable feed controls, clearer trends, and personalized recommendations for a healthier social experience.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="rounded-[1.75rem] border-border/60 bg-gradient-panel shadow-elevated">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dominant mood</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">{strongestMood?.mood ?? "—"}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-[1.75rem] border-border/60 bg-gradient-panel shadow-elevated">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Calm baseline</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">{averageCalm}%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-elevated backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <Filter className="h-4 w-4" />
                  </div>
                  <p>Filter by mood and timeframe to compare emotional balance, exposure levels, and recommendations.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <Button
                        key={option}
                        variant={selectedMood === option ? "hero" : "glass"}
                        size="sm"
                        onClick={() => setSelectedMood(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <Tabs value={selectedRange} onValueChange={(value) => setSelectedRange(value as RangeFilter)}>
                    <TabsList className="h-auto rounded-full bg-secondary/80 p-1">
                      {rangeOptions.map((range) => (
                        <TabsTrigger key={range} value={range} className="rounded-full px-4 data-[state=active]:shadow-soft">
                          {range}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </section>

          {/* Metric cards */}
          <section className="py-10 sm:py-14">
            <div className="container space-y-5">
              {isSampleForRange && !hasRealData && <SampleDataBanner />}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map(({ title, value, copy, icon: Icon }) => (
                  <Card key={title} className="rounded-[1.75rem] border-border/60 bg-card/80 shadow-soft backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{title}</p>
                          <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="pb-10 sm:pb-14">
            <div className="container space-y-5">
              {isSampleForRange && <SampleDataBanner />}
              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-2xl">Mood trend overview</CardTitle>
                    <CardDescription>Review how emotional states change across the selected period and use the filters above to isolate specific moods.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ChartContainer config={trendChartConfig} className="h-[320px] w-full">
                      <AreaChart data={trendData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="happyFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-happy)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-happy)" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="calmFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-calm)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-calm)" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="stressedFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-stressed)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-stressed)" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="sadFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-sad)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-sad)" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={32} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {selectedMood === "All moods" ? (
                          <>
                            <Area type="monotone" dataKey="calm" stroke="var(--color-calm)" strokeWidth={2.5} fill="url(#calmFill)" />
                            <Area type="monotone" dataKey="happy" stroke="var(--color-happy)" strokeWidth={2.5} fill="url(#happyFill)" />
                            <Area type="monotone" dataKey="stressed" stroke="var(--color-stressed)" strokeWidth={2.5} fill="url(#stressedFill)" />
                            <Area type="monotone" dataKey="sad" stroke="var(--color-sad)" strokeWidth={2.5} fill="url(#sadFill)" />
                          </>
                        ) : (
                          <Area
                            type="monotone"
                            dataKey={selectedMood.toLowerCase()}
                            stroke={`var(--color-${selectedMood.toLowerCase()})`}
                            strokeWidth={3}
                            fill={`url(#${selectedMood.toLowerCase()}Fill)`}
                          />
                        )}
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-2xl">Mood distribution</CardTitle>
                    <CardDescription>See which emotional state is taking the most space in your recent digital experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ChartContainer config={distributionChartConfig} className="h-[320px] w-full">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="mood" />} />
                        <Pie data={distributionData} dataKey="value" nameKey="mood" innerRadius={72} outerRadius={108} paddingAngle={4}>
                          {distributionData.map((entry) => (
                            <Cell key={entry.mood} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="mt-6 grid gap-3">
                      {distributionData.map((item) => (
                        <div key={item.mood} className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-sm font-medium text-foreground">{item.mood}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Stress & Recommendations */}
          <section className="pb-10 sm:pb-14">
            <div className="container space-y-5">
              {isSampleForRange && <SampleDataBanner />}
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-2xl">Stress reduction snapshot</CardTitle>
                    <CardDescription>Compare calm and stress levels to decide when filtering should become more protective.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ChartContainer config={trendChartConfig} className="h-[300px] w-full">
                      <BarChart data={moodData} barGap={10}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={32} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="calm" fill="hsl(var(--primary-glow))" radius={[999, 999, 0, 0]} />
                        <Bar dataKey="stressed" fill="hsl(var(--destructive))" radius={[999, 999, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                    <div className="mt-5 rounded-[1.5rem] border border-border/60 bg-secondary/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Average stress exposure</p>
                          <p className="mt-1 text-sm text-muted-foreground">Protective filtering becomes more aggressive when stress rises above your comfort baseline.</p>
                        </div>
                        <div className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft">
                          {averageStress}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-2xl">Personalized recommendation panels</CardTitle>
                    <CardDescription>Content suggestions adapt to your selected mood so the feed feels more restorative and intentional.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs value={hasRealData && selectedMood === "All moods" && latestMood ? (latestMood.charAt(0).toUpperCase() + latestMood.slice(1)) as MoodFilter : selectedMood} onValueChange={(value) => setSelectedMood(value as MoodFilter)}>
                      <TabsList className="mb-6 h-auto flex-wrap justify-start gap-2 rounded-[1.5rem] bg-secondary/70 p-2">
                        {filterOptions.map((option) => (
                          <TabsTrigger key={option} value={option} className="rounded-full px-4 data-[state=active]:shadow-soft">
                            {option}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {filterOptions.map((option) => (
                        <TabsContent key={option} value={option} className="mt-0">
                          <div className="grid gap-4">
                            {recommendationLibrary[option].map((item) => (
                              <article key={item.title} className="rounded-[1.5rem] border border-border/60 bg-gradient-panel p-5 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                                    {item.tag}
                                  </span>
                                  <CalendarRange className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                              </article>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Mood Logger + Habits */}
          <section className="pb-10 sm:pb-14">
            <div className="container grid gap-6 xl:grid-cols-2">
              <MoodLogger onLogged={fetchMoodData} />
              <HabitsTracker />
            </div>
          </section>


          <section className="pb-10 sm:pb-14">
            <div className="container grid gap-6 xl:grid-cols-2">
              <MoodTips selectedMood={selectedMood} latestMood={latestMood} />
              <ContentBookmarks />
            </div>
          </section>
        </main>
        <FooterSection />
        <MoodChatbot />
      </div>
    </div>
  );
};

export default Dashboard;
