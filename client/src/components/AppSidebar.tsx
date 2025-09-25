import { PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Главная", url: "/", active: true },
  { title: "Строительство", url: "/construction" },
  { title: "Мебель", url: "/furniture" },
  { title: "Услуги", url: "/services" },
];

export default function AppSidebar() {
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
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.active}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                    className="px-0 py-3 hover:bg-transparent hover:text-foreground data-[active=true]:bg-transparent data-[active=true]:font-medium"
                  >
                    <a href={item.url} className="text-sm">
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <Button 
              asChild 
              variant="outline" 
              className="w-full justify-center border-border bg-background hover:bg-muted text-sm"
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
    </Sidebar>
  );
}