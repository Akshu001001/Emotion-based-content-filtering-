import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type CompletionMap = Record<string, Set<string>>; // date -> Set<habitId>
type HabitInfo = { id: string; label: string };

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const chartConfig = {
  completed: { label: "Completed", color: "hsl(var(--primary))" },
  total: { label: "Total", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDates(baseDate: Date, weekOffset: number): Date[] {
  const ws = startOfWeek(baseDate);
  ws.setDate(ws.getDate() + weekOffset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const WEEK_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--destructive))",
  "hsl(var(--accent-foreground))",
];

export const HabitsCalendar = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitInfo[]>([]);
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayStr = formatDate(today);

  // Get the month we're viewing
  const viewMonth = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  }, [today, monthOffset]);

  // Get all weeks that overlap with this month
  const weeks = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const result: Date[][] = [];
    let current = startOfWeek(firstDay);

    while (current <= lastDay) {
      const weekDates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        d.setDate(current.getDate() + i);
        weekDates.push(d);
      }
      result.push(weekDates);
      current.setDate(current.getDate() + 7);
    }
    return result;
  }, [viewMonth]);

  // Date range for fetching
  const dateRange = useMemo(() => {
    if (weeks.length === 0) return { start: "", end: "" };
    return {
      start: formatDate(weeks[0][0]),
      end: formatDate(weeks[weeks.length - 1][6]),
    };
  }, [weeks]);

  const fetchData = useCallback(async () => {
    if (!user || !dateRange.start) return;
    setLoading(true);

    const [{ data: habitsData }, { data: compData }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, label")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("habit_completions")
        .select("habit_id, completed_date")
        .eq("user_id", user.id)
        .gte("completed_date", dateRange.start)
        .lte("completed_date", dateRange.end),
    ]);

    setHabits(habitsData ?? []);

    const map: CompletionMap = {};
    (compData ?? []).forEach((c) => {
      if (!map[c.completed_date]) map[c.completed_date] = new Set();
      map[c.completed_date].add(c.habit_id);
    });
    setCompletions(map);
    setLoading(false);
  }, [user, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headerLabel = useMemo(() => {
    return viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [viewMonth]);

  const totalHabits = habits.length;

  // Overview chart data: one bar per day across all weeks
  const overviewData = useMemo(() => {
    return weeks.flatMap((week, wi) =>
      week.map((d) => {
        const ds = formatDate(d);
        const count = completions[ds]?.size ?? 0;
        return {
          date: ds,
          day: d.getDate(),
          completed: count,
          total: totalHabits,
          weekIndex: wi,
        };
      })
    );
  }, [weeks, completions, totalHabits]);

  // Weekly progress summary
  const weekSummaries = useMemo(() => {
    return weeks.map((week, wi) => {
      const daysUpToToday = week.filter((d) => formatDate(d) <= todayStr).length;
      const possible = totalHabits * daysUpToToday;
      const done = week.reduce((sum, d) => {
        if (formatDate(d) > todayStr) return sum;
        return sum + (completions[formatDate(d)]?.size ?? 0);
      }, 0);
      const pct = possible > 0 ? Math.round((done / possible) * 100) : 0;
      return { weekIndex: wi, done, possible, pct };
    });
  }, [weeks, completions, totalHabits, todayStr]);

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Daily habit tracker</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">{headerLabel}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset((o) => o + 1)}
              disabled={monthOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : habits.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Add habits in the tracker above to see your overview.
          </p>
        ) : (
          <>
            {/* ─── OVERVIEW SECTION ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Overview chart</h3>
                <div className="flex gap-3">
                  {weeks.map((_, wi) => (
                    <span key={wi} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: WEEK_COLORS[wi % WEEK_COLORS.length] }} />
                      Week {wi + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color-coded week strip */}
              <div className="flex gap-0.5 overflow-hidden rounded-xl">
                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    className="flex flex-1 items-center justify-center py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground"
                    style={{ backgroundColor: WEEK_COLORS[wi % WEEK_COLORS.length] }}
                  >
                    W{wi + 1}
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <BarChart data={overviewData} barCategoryGap="15%">
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} width={24} tick={{ fontSize: 10 }} domain={[0, totalHabits]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                    {overviewData.map((entry, index) => (
                      <Cell key={index} fill={WEEK_COLORS[entry.weekIndex % WEEK_COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            {/* ─── WEEKLY PROGRESS ─── */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Weekly progress</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {weekSummaries.map((ws) => (
                  <div
                    key={ws.weekIndex}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-primary-foreground"
                      style={{ backgroundColor: WEEK_COLORS[ws.weekIndex % WEEK_COLORS.length] }}
                    >
                      W{ws.weekIndex + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{ws.done}/{ws.possible}</span>
                        <span className="text-xs font-semibold text-foreground">{ws.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${ws.pct}%`,
                            backgroundColor: WEEK_COLORS[ws.weekIndex % WEEK_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── DAILY HABITS GRID ─── */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Daily habits</h3>
              <div className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 min-w-[120px] border-b border-r border-border/60 bg-card/95 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                        Habit
                      </th>
                      {weeks.map((week, wi) => (
                        <th
                          key={wi}
                          colSpan={7}
                          className="border-b border-border/60 px-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-primary-foreground"
                          style={{ backgroundColor: WEEK_COLORS[wi % WEEK_COLORS.length] }}
                        >
                          Week {wi + 1}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="sticky left-0 z-10 border-b border-r border-border/60 bg-card/95 px-3 py-1 backdrop-blur-sm" />
                      {weeks.flatMap((week) =>
                        week.map((d) => {
                          const ds = formatDate(d);
                          const isToday = ds === todayStr;
                          return (
                            <th
                              key={ds}
                              className={cn(
                                "border-b border-border/60 px-1 py-1 text-center text-[9px] font-medium",
                                isToday ? "bg-primary/10 text-foreground" : "text-muted-foreground"
                              )}
                            >
                              <div>{DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1].charAt(0)}</div>
                              <div className={cn("text-[10px]", isToday && "font-bold")}>{d.getDate()}</div>
                            </th>
                          );
                        })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit, hi) => (
                      <tr key={habit.id} className={hi % 2 === 0 ? "bg-secondary/20" : ""}>
                        <td className="sticky left-0 z-10 border-r border-border/60 bg-card/95 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
                          <span className="block max-w-[110px] truncate">{habit.label}</span>
                        </td>
                        {weeks.flatMap((week) =>
                          week.map((d) => {
                            const ds = formatDate(d);
                            const done = completions[ds]?.has(habit.id);
                            const isToday = ds === todayStr;
                            return (
                              <td key={ds} className={cn("px-1 py-1.5 text-center", isToday && "bg-primary/5")}>
                                <div className="flex items-center justify-center">
                                  {done ? (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/80">
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                  ) : (
                                    <div className="h-5 w-5 rounded-md border border-border/60 bg-secondary/40" />
                                  )}
                                </div>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
