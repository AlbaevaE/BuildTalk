import { PlusCircle, Settings, User } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Главная", url: "/" },
  { title: "Ответы", url: "/replies" },
  { title: "Мои обсуждения", url: "/my-threads" },
];

export default function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-8">
        <a href="/" className="text-xl font-semibold text-foreground">
          BuildTalk
        </a>
      </SidebarHeader>
      
      <SidebarContent className="px-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => {
                // Compare only pathname, ignore query strings and hash
                const currentPath = new URL(location, window.location.origin).pathname;
                const itemPath = new URL(item.url, window.location.origin).pathname;
                const isActive = currentPath === itemPath;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase()}`}
                      className="px-3 py-2 rounded-xl hover:bg-muted/50 hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium transition-all duration-200"
                    >
                      <a href={item.url} className="text-sm">
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <Button 
              asChild 
              variant="outline" 
              className="w-full justify-center border-border bg-background hover:bg-muted text-sm rounded-xl transition-all duration-200"
              data-testid="button-create-thread"
            >
              <a href="/create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Создать обсуждение
              </a>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-6 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-row gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  data-testid="button-settings"
                  className="rounded-xl hover:bg-muted/50 w-10 h-10 p-2"
                >
                  <Settings className="h-5 w-5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  data-testid="button-profile"
                  className="rounded-xl hover:bg-muted/50 w-10 h-10 p-2"
                >
                  <User className="h-5 w-5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}