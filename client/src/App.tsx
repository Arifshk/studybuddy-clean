import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavBar from "@/components/NavBar";
import Landing from "@/pages/Landing";
import Sessions from "@/pages/Sessions";
import Host from "@/pages/Host";
import Donate from "@/pages/Donate";
import Moderate from "@/pages/Moderate";
import NotFound from "@/pages/not-found";
import { useStore } from "@/store/useStore";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/app" component={Sessions} />
        <Route path="/host" component={Host} />
        <Route path="/donate" component={Donate} />
        <Route path="/moderate" component={Moderate} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const { initializeLocalStorage, initializeFirebase, initializeAuth, cleanup } = useStore();

  useEffect(() => {
    initializeLocalStorage();
    initializeFirebase();
    initializeAuth();
    
    return () => {
      cleanup();
    };
  }, [initializeLocalStorage, initializeFirebase, initializeAuth, cleanup]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
