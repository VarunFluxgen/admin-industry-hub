
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Factory, Wifi, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { hasFullAccess } = useAuth();

  const stats = [
    {
      title: "Industries",
      value: "View All",
      description: "Manage all industries",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/industries",
    },
    {
      title: "Create Industry",
      value: "Add New",
      description: "Create new industry",
      icon: Factory,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/industries/create",
      requiresFullAccess: true,
    },
    {
      title: "Offline Devices",
      value: "Coming Soon",
      description: "Monitor device status",
      icon: Wifi,
      color: "text-red-600",
      bgColor: "bg-red-50",
      link: "#",
      disabled: true,
    },
    {
      title: "Batch Processing",
      value: "Coming Soon",
      description: "Validation tools",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "#",
      disabled: true,
    },
  ];

  const filteredStats = stats.filter(stat => {
    if (stat.requiresFullAccess && !hasFullAccess()) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat, index) => (
          <Card key={index} className={`transition-shadow ${stat.disabled ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-3">
                {stat.description}
              </p>
              {!stat.disabled ? (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={stat.link}>
                    Go to {stat.title}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
