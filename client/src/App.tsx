import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import "@/lib/i18n";

import Home from "@/pages/Home";
import Platforms from "@/pages/Platforms";
import Tutorials from "@/pages/Tutorials";
import BotGuide from "@/pages/BotGuide";
import Announcements from "@/pages/Announcements";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/platforms" component={Platforms} />
      <Route path="/platforms/:id" component={Platforms} />
      <Route path="/tutorials" component={Tutorials} />
      <Route path="/tutorials/:id" component={Tutorials} />
      <Route path="/bot-guide" component={BotGuide} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:section" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
