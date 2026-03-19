import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Chrome } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or less.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, or underscores only."),
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(60, "Display name is too long."),
  avatarUrl: z.union([z.string().url("Enter a valid URL.").trim(), z.literal("")]),
  preferences: z.string().max(240, "Keep preferences under 240 characters.").optional(),
});

type SignupValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      displayName: "",
      avatarUrl: "",
      preferences: "positive creators, calmer content, mindful prompts",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  // ✅ FIXED EMAIL SIGNUP (same UI, better logic)
  const handleEmailSignup = async (values: SignupValues) => {
    const preferenceList = values.preferences
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          username: values.username,
          display_name: values.displayName,
          avatar_url: values.avatarUrl || null,
          preferences: {
            interests: preferenceList ?? [],
          },
        },
      },
    });

    console.log("SIGNUP DATA:", data);

    if (error) {
      toast.error(error.message);
      return;
    }

    // ✅ Store userId
    if (data?.user) {
      localStorage.setItem("userId", data.user.id);
    }

    toast.success("Account created successfully 🎉");
    navigate("/dashboard", { replace: true });
  };

  // ✅ FIXED GOOGLE SIGNUP (removed lovable)
  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthShell
      eyebrow="Signup"
      title="Create a calmer, more supportive social experience."
      description="Set up your account so your dashboard, recommendations, and filtering preferences stay personal and protected."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-foreground transition-opacity hover:opacity-80">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
          <p className="text-sm leading-6 text-muted-foreground">Use email or start instantly with Google.</p>
        </div>

        <Button type="button" variant="glass" size="lg" className="w-full" onClick={handleGoogleSignup}>
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Or create with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(handleEmailSignup)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amina Noor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" placeholder="amina_noor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/avatar.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferences</FormLabel>
                    <FormControl>
                      <Textarea placeholder="positive creators, calmer content, mindful prompts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating account..." : "Signup"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
};

export default Signup;