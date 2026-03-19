import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

const sectionItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar = ({ isDark, onToggleTheme }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isDashboardPage = pathname === "/dashboard";
  const accountLabel = profile?.display_name ?? profile?.username ?? user?.email?.split("@")[0] ?? "Account";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    setIsOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <span className="text-lg font-semibold">😊</span>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Emotion Filter</p>
            <p className="text-base font-semibold text-foreground">Mental wellness feed</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {sectionItems.map((item) =>
            item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link key={item.label} to={item.href} className="story-link text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="story-link text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                {item.label}
              </a>
            )
          )}
          <Link to="/dashboard" className="story-link text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user && <span className="text-sm font-medium text-muted-foreground">{accountLabel}</span>}
          <Button variant="soft" size="icon" onClick={onToggleTheme} aria-label="Toggle dark mode">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Button variant="ghostGlow" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="hero" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghostGlow" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/signup">Signup</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="soft" size="icon" onClick={onToggleTheme} aria-label="Toggle dark mode">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="soft"
            size="icon"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="container flex flex-col gap-2 py-5">
            {sectionItems.map((item) =>
              item.href.startsWith("/") && !item.href.includes("#") ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}
            <Link
              to="/dashboard"
              className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            {user && <p className="px-4 pt-2 text-sm text-muted-foreground">Signed in as {accountLabel}</p>}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {user ? (
                <>
                  <Button variant="ghostGlow" asChild>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="hero" onClick={handleSignOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghostGlow" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      Signup
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
