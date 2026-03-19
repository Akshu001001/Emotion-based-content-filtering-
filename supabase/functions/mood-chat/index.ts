import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MoodMate, a warm and supportive AI wellness companion built into the Emotion Filter platform...

(keep your same prompt here)`;

// 🔥 NEW: Emotion Detection
const detectEmotion = (text: string) => {
  const lower = text.toLowerCase();

  if (
    lower.includes("sad") ||
    lower.includes("tired") ||
    lower.includes("depressed") ||
    lower.includes("low")
  ) return "sad";

  if (
    lower.includes("happy") ||
    lower.includes("excited") ||
    lower.includes("great")
  ) return "happy";

  if (
    lower.includes("angry") ||
    lower.includes("frustrated")
  ) return "angry";

  return "neutral";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 🔥 Detect Emotion from last user message
    const lastMessage = messages[messages.length - 1]?.content || "";
    const emotion = detectEmotion(lastMessage);

    // 🔗 Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 💾 Save mood in DB
    await supabase.from("moods").insert([
      {
        user_id: userId,
        mood: emotion,
        text: lastMessage,
      },
    ]);

    // 🤖 AI Request
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Send emotion in headers (important trick)
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-user-emotion": emotion, // 🔥 KEY ADDITION
      },
    });

  } catch (e) {
    console.error("mood-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});