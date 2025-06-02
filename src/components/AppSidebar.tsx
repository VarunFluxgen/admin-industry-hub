
import { Building2, Home, Factory, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Industries",
    url: "/industries",
    icon: Building2,
  },
  {
    title: "Create Industry",
    url: "/industries/create",
    icon: Factory,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout, hasFullAccess, canOnlyViewAndUpdateUnitMeta } = useAuth();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Hide "Create Industry" for users with limited access
                if (item.url === "/industries/create" && canOnlyViewAndUpdateUnitMeta()) {
                  return null;
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">
                  {hasFullAccess() ? 'Admin Access' : 'Limited Access'}
                </p>
              </div>
            </div>
            <Button 
              onClick={logout} 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
