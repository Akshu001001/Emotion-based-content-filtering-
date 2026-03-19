import { useCallback, useEffect, useState } from "react";
import { Flame, Plus, Trash2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["general", "wellness", "productivity", "social", "fitness"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  general: "bg-muted text-muted-foreground",
  wellness: "bg-primary/15 text-primary",
  productivity: "bg-accent text-accent-foreground",
  social: "bg-secondary text-secondary-foreground",
  fitness: "bg-destructive/15 text-destructive",
};

type Habit = {
  id: string;
  label: string;
  category: Category;
  done: boolean;
  streak: number;
};

export const HabitsTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: habitsData, error: habitsErr } = await supabase
      .from("habits")
      .select("id, label, created_at, category")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (habitsErr) {
      toast({ title: "Failed to load habits", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!habitsData || habitsData.length === 0) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const { data: completions } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("completed_date", todayStr);

    const completedIds = new Set((completions ?? []).map((c) => c.habit_id));

    const habitsWithStreaks: Habit[] = await Promise.all(
      habitsData.map(async (h) => {
        const { data: streakData } = await supabase.rpc("get_habit_streak", {
          p_habit_id: h.id,
        });
        return {
          id: h.id,
          label: h.label,
          category: (h.category as Category) ?? "general",
          done: completedIds.has(h.id),
          streak: typeof streakData === "number" ? streakData : 0,
        };
      })
    );

    setHabits(habitsWithStreaks);
    setLoading(false);
  }, [user, todayStr, toast]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = useCallback(async () => {
    const label = input.trim();
    if (!label || !user) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ label, user_id: user.id, category })
      .select("id, label, category")
      .single();

    if (error) {
      toast({ title: "Couldn't add habit", variant: "destructive" });
      return;
    }

    setHabits((prev) => [...prev, { id: data.id, label: data.label, category: (data.category as Category) ?? "general", done: false, streak: 0 }]);
    setInput("");
  }, [input, user, toast, category]);

  const toggleHabit = useCallback(
    async (id: string, currentlyDone: boolean) => {
      if (!user) return;

      if (currentlyDone) {
        await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", id)
          .eq("completed_date", todayStr);
      } else {
        await supabase
          .from("habit_completions")
          .insert({ habit_id: id, user_id: user.id, completed_date: todayStr });
      }

      const { data: streakData } = await supabase.rpc("get_habit_streak", {
        p_habit_id: id,
      });

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, done: !currentlyDone, streak: typeof streakData === "number" ? streakData : 0 }
            : h
        )
      );
    },
    [user, todayStr]
  );

  const removeHabit = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("habits").delete().eq("id", id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    },
    [user]
  );

  const filteredHabits = filterCategory === "all" ? habits : habits.filter((h) => h.category === filterCategory);
  const completed = habits.filter((h) => h.done).length;
  const progress = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Daily habits</CardTitle>
          {maxStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground shadow-soft">
              <Flame className="h-4 w-4 text-destructive" />
              {maxStreak}d best streak
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : habits.length === 0
              ? "Add habits to start tracking your daily routine."
              : `${completed} of ${habits.length} completed today`}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 rounded-full bg-secondary" />
          </div>
        )}

        {/* Add habit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addHabit();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Meditate for 5 min"
            className="rounded-full border-border/60 bg-secondary/60"
          />
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="w-[130px] shrink-0 rounded-full border-border/60 bg-secondary/60">
              <Tag className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="icon" variant="hero" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Category filter */}
        {habits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const count = habits.filter((h) => h.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${filterCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Habit list */}
        {filteredHabits.length > 0 && (
          <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredHabits.map((habit) => (
              <li
                key={habit.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 transition-colors duration-200 hover:bg-secondary/70"
              >
                <Checkbox
                  checked={habit.done}
                  onCheckedChange={() => toggleHabit(habit.id, habit.done)}
                  className="h-5 w-5 rounded-md"
                />
                <span
                  className={`flex-1 text-sm font-medium transition-all duration-200 ${
                    habit.done ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {habit.label}
                </span>
                <Badge variant="secondary" className={`text-[10px] capitalize ${CATEGORY_COLORS[habit.category]}`}>
                  {habit.category}
                </Badge>
                {habit.streak > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-soft">
                    <Flame className="h-3 w-3 text-destructive" />
                    {habit.streak}d
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${habit.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
