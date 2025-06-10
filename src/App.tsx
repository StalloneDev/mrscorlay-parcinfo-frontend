import "./index.css";
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Equipment from "@/pages/equipment";
import Users from "@/pages/users";
import Employees from "@/pages/employees";
import Tickets from "@/pages/tickets";
import Inventory from "@/pages/inventory";
import Licenses from "@/pages/licenses";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Planning from "@/pages/planning";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/equipment" component={Equipment} />
          <Route path="/users" component={Users} />
          <Route path="/employees" component={Employees} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/licenses" component={Licenses} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
          <Route path="/planning" component={Planning} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
