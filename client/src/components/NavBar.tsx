import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, User, LogIn, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export function NavBar() {
  const [location] = useLocation();
  const { authUser, isAuthenticating, signInWithGoogle, signOut } = useStore();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/app", label: "Sessions" },
    { href: "/host", label: "Host" },
    { href: "/donate", label: "❤️ Donate" },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-muted-foreground hover:text-foreground transition-colors ${
            location === link.href ? "text-foreground font-medium" : ""
          } ${mobile ? "block py-2" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" data-testid="logo-link">
            <Logo />
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            {authUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {authUser.photoURL ? (
                    <img 
                      src={authUser.photoURL} 
                      alt={authUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {authUser.displayName || authUser.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Button 
                  onClick={handleSignOut}
                  disabled={isAuthenticating}
                  size="sm"
                  data-testid="button-sign-out"
                >
                  {isAuthenticating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Sign Out"
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleSignIn}
                disabled={isAuthenticating}
                data-testid="button-sign-in"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2" />
                    Sign In with Google
                  </>
                )}
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks mobile />
                {authUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      {authUser.photoURL ? (
                        <img 
                          src={authUser.photoURL} 
                          alt={authUser.displayName || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <User size={20} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {authUser.displayName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {authUser.email}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSignOut}
                      disabled={isAuthenticating}
                      className="w-full"
                      data-testid="button-mobile-sign-out"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Signing out...
                        </>
                      ) : (
                        "Sign Out"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="w-full"
                    data-testid="button-mobile-sign-in"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} className="mr-2" />
                        Sign In with Google
                      </>
                    )}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
