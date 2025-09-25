import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import HomePage from "@/pages/HomePage";
import ThreadDetail from "@/pages/ThreadDetail";
import CreateThread from "@/pages/CreateThread";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";
import { useAuth, useLogout, getUserDisplayName, getUserAvatar } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/create" component={CreateThread} />
      <Route path="/thread/:id" component={ThreadDetail} />
      <Route path="/:category" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UserMenu() {
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();

  if (isLoading) {
    return <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />;
  }

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" data-testid="button-login">
        <a href="/auth/login">
          <LogIn className="w-4 h-4 mr-2" />
          Вход
        </a>
      </Button>
    );
  }

  const displayName = getUserDisplayName(user);
  const avatar = getUserAvatar(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" data-testid="button-user-menu">
          <Avatar className="w-6 h-6">
            {avatar.type === 'image' ? (
              <AvatarImage src={avatar.value} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-xs">{avatar.value}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <div className="flex items-center gap-2 cursor-default">
            <User className="w-4 h-4" />
            <div>
              <div className="font-medium">{displayName}</div>
              {user.email && (
                <div className="text-xs text-muted-foreground">{user.email}</div>
              )}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => logout.mutate()}
          className="text-red-600 dark:text-red-400"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <UserMenu />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
