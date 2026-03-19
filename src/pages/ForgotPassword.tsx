import { Link } from "react-router-dom";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetRequest = async (values: ForgotPasswordValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset link sent.");
    form.reset();
  };

  return (
    <AuthShell
      eyebrow="Reset"
      title="Send yourself a fresh start link."
      description="We’ll email you a secure recovery link so you can choose a new password and get back into your dashboard."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered it? {" "}
          <Link to="/login" className="font-semibold text-foreground transition-opacity hover:opacity-80">
            Back to login
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Forgot password</h2>
          <p className="text-sm leading-6 text-muted-foreground">Enter your email and we’ll send the recovery link.</p>
        </div>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(handleResetRequest)}>
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

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
