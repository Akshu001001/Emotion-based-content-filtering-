import { useCallback, useEffect, useState } from "react";
import { Bookmark, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const MOOD_CATEGORIES = ["happy", "calm", "stressed", "sad", "general"] as const;
type MoodCategory = (typeof MOOD_CATEGORIES)[number];

const MOOD_COLORS: Record<MoodCategory, string> = {
  happy: "bg-primary/15 text-primary",
  calm: "bg-accent text-accent-foreground",
  stressed: "bg-destructive/15 text-destructive",
  sad: "bg-muted text-muted-foreground",
  general: "bg-secondary text-secondary-foreground",
};

type BookmarkItem = {
  id: string;
  title: string;
  url: string;
  mood_category: MoodCategory;
  note: string | null;
  created_at: string;
};

export const ContentBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMood, setFilterMood] = useState<MoodCategory | "all">("all");

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [mood, setMood] = useState<MoodCategory>("general");
  const [note, setNote] = useState("");

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("content_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load bookmarks", variant: "destructive" });
    } else {
      setBookmarks((data ?? []) as BookmarkItem[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = useCallback(async () => {
    if (!title.trim() || !url.trim() || !user) return;

    const { data, error } = await supabase
      .from("content_bookmarks")
      .insert({
        title: title.trim(),
        url: url.trim(),
        mood_category: mood,
        note: note.trim() || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Couldn't save bookmark", variant: "destructive" });
      return;
    }

    setBookmarks((prev) => [data as BookmarkItem, ...prev]);
    setTitle("");
    setUrl("");
    setNote("");
    setMood("general");
    setShowForm(false);
    toast({ title: "Bookmark saved!" });
  }, [title, url, mood, note, user, toast]);

  const removeBookmark = useCallback(
    async (id: string) => {
      await supabase.from("content_bookmarks").delete().eq("id", id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    },
    []
  );

  const filtered = filterMood === "all" ? bookmarks : bookmarks.filter((b) => b.mood_category === filterMood);

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-elevated backdrop-blur-xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Content bookmarks</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Save uplifting content organized by mood</p>
            </div>
          </div>
          <Button
            variant={showForm ? "ghost" : "hero"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="mr-1 h-3.5 w-3.5" /> : <Plus className="mr-1 h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "Add"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        {/* Add form */}
        {showForm && (
          <div className="space-y-3 rounded-[1.5rem] border border-border/60 bg-secondary/30 p-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. Morning motivation video)"
              className="rounded-full border-border/60 bg-background"
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL (e.g. https://youtube.com/...)"
              className="rounded-full border-border/60 bg-background"
            />
            <div className="flex gap-2">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="rounded-full border-border/60 bg-background"
              />
              <Select value={mood} onValueChange={(v) => setMood(v as MoodCategory)}>
                <SelectTrigger className="w-[120px] shrink-0 rounded-full border-border/60 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_CATEGORIES.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addBookmark} variant="hero" size="sm" className="w-full rounded-full">
              Save bookmark
            </Button>
          </div>
        )}

        {/* Mood filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterMood("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterMood === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
          >
            All ({bookmarks.length})
          </button>
          {MOOD_CATEGORIES.map((m) => {
            const count = bookmarks.filter((b) => b.mood_category === m).length;
            if (count === 0) return null;
            return (
              <button
                key={m}
                onClick={() => setFilterMood(m)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${filterMood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        {/* Bookmark list */}
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {bookmarks.length === 0
              ? "Save links to uplifting content you discover on social media."
              : "No bookmarks in this category."}
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.map((bm) => (
              <li
                key={bm.id}
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 transition-colors hover:bg-secondary/70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm font-semibold text-foreground hover:underline"
                    >
                      {bm.title}
                    </a>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  {bm.note && (
                    <p className="mt-1 text-xs text-muted-foreground">{bm.note}</p>
                  )}
                </div>
                <Badge variant="secondary" className={`shrink-0 capitalize ${MOOD_COLORS[bm.mood_category as MoodCategory]}`}>
                  {bm.mood_category}
                </Badge>
                <button
                  onClick={() => removeBookmark(bm.id)}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={`Delete ${bm.title}`}
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
