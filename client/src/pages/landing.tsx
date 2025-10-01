import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, BookOpen, Shield } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Find a study group by course—
            <span className="text-primary"> on campus, in real time.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Built for Wilfrid Laurier students. Privacy-first: building/floor only.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-4 text-lg font-semibold"
                data-testid="button-browse-sessions"
              >
                Browse Sessions
              </Button>
            </Link>
            <Link href="/host">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold"
                data-testid="button-host-session"
              >
                Host a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Find by Location</h3>
              <p className="text-muted-foreground">
                Browse study sessions by building and floor on campus
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Course-Specific</h3>
              <p className="text-muted-foreground">
                Filter by your exact course code to find relevant study groups
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                No GPS tracking - just building and floor for your safety
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">Not affiliated with WLU • Beta</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
