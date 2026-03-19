import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setIsRecoverySession(hashParams.get("type") === "recovery");
  }, []);

  const description = useMemo(
    () =>
      isRecoverySession
        ? "Enter a new password to restore access to your account."
        : "Open this page from the recovery link in your email to securely set a new password.",
    [isRecoverySession],
  );

  const handlePasswordUpdate = async (values: ResetPasswordValues) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated. Please sign in.");
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Recovery"
      title="Choose a new password."
      description="Finish the recovery flow and get back to your personalized dashboard."
      footer={
        <p className="text-sm text-muted-foreground">
          Need a new email? {" "}
          <Link to="/forgot-password" className="font-semibold text-foreground transition-opacity hover:opacity-80">
            Request another link
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Reset password</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(handlePasswordUpdate)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={!isRecoverySession || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
};

export default ResetPassword;
