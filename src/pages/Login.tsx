import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Chrome } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

// ✅ Validation Schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/dashboard";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, navigate, redirectTo, user]);

  // 🔥 NEW: Save userId for personalization
  useEffect(() => {
    const saveUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        localStorage.setItem("userId", data.user.id);
      }
    };

    saveUser();
  }, []);

  // 🔥 Updated Email Login
  const handleEmailLogin = async (values: LoginValues) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // ✅ Store userId
    if (data?.user) {
      localStorage.setItem("userId", data.user.id);
    }

    toast.success("Welcome back.");
    navigate(redirectTo, { replace: true });
  };

  // 🔥 Google Login (same UI)
  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthShell
      eyebrow="Login"
      title="Return to your healthier feed controls."
      description="Sign in to review mood trends, personalized recommendations, and content filters tuned to your emotional state."
      footer={
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground transition-opacity hover:opacity-80"
          >
            Create one
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Sign in
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use email or continue with Google.
          </p>
        </div>

        <Button
          type="button"
          variant="glass"
          size="lg"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(handleEmailLogin)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Password</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-foreground transition-opacity hover:opacity-80"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Signing in..."
                : "Login"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
};

export default Login;