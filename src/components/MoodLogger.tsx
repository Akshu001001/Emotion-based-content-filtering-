import { useCallback, useState } from "react";
import { Smile, Leaf, AlertTriangle, Heart, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const MOODS = [
  { key: "happy", label: "Happy", icon: Smile, color: "bg-primary/15 text-primary" },
  { key: "calm", label: "Calm", icon: Leaf, color: "bg-accent text-accent-foreground" },
  { key: "stressed", label: "Stressed", icon: AlertTriangle, color: "bg-destructive/15 text-destructive" },
  { key: "sad", label: "Sad", icon: Heart, color: "bg-muted text-muted-foreground" },
] as const;

type MoodKey = (typeof MOODS)[number]["key"];

export const MoodLogger = ({ onLogged }: { onLogged?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLog = useCallback(async () => {
    if (!selectedMood || !user) return;
    setSaving(true);

    const today = new Date();
    const loggedAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood: selectedMood,
      intensity,
      note: note.trim() || null,
      logged_at: loggedAt,
    });

    if (error) {
      toast({ title: "Couldn't log mood", variant: "destructive" });
    } else {
      toast({ title: "Mood logged!" });
      setSelectedMood(null);
      setIntensity(50);
      setNote("");
      onLogged?.();
    }
    setSaving(false);
  }, [selectedMood, intensity, note, user, toast, onLogged]);

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Log your mood</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">How are you feeling right now?</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Mood selection */}
        <div className="grid grid-cols-4 gap-2">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const active = selectedMood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMood(m.key)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border/60 bg-secondary/40 hover:bg-secondary/70"
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Intensity slider */}
        {selectedMood && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Intensity</span>
                <span className="font-semibold text-foreground">{intensity}%</span>
              </div>
              <Slider
                value={[intensity]}
                onValueChange={([v]) => setIntensity(v)}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (e.g. after scrolling Twitter)"
              className="rounded-full border-border/60 bg-secondary/60"
            />

            <Button
              onClick={handleLog}
              variant="hero"
              className="w-full rounded-full"
              disabled={saving}
            >
              {saving ? "Saving…" : "Log mood"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
