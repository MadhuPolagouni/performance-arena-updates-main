import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { 
  LayoutDashboard, 
  Gamepad2, 
  TrendingUp, 
  Trophy, 
  Gift, 
  Medal,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAgentDashboard } from "../../pages/agent/hooks.jsx";

const navItems = [
  { path: "/agent", icon: LayoutDashboard, label: "Dashboard", end: true },
  { path: "/agent/play", icon: Gamepad2, label: "Play Zone" },
  { path: "/agent/performance", icon: TrendingUp, label: "Performance" },
  { path: "/agent/leaderboard", icon: Trophy, label: "Leaderboard" },
  { path: "/agent/rewards", icon: Gift, label: "Rewards & Achievements", end: true },
  { path: "/agent/rewards-gallery", icon: Medal, label: "Rewards Gallery" },
];

export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const SIDEBAR_EXPANDED_WIDTH = 256;

const AgentSidebar = () => {
  const { collapsed, toggle } = useSidebar();
  const { user, logout } = useAuth();
  const { data: dashboardData } = useAgentDashboard(user?.id);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-30 blur-sm" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-orbitron font-bold text-foreground">
              ga<span className="text-primary">ME</span>trix
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Premium Suite
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive && "bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-sidebar-foreground")} />
              {!collapsed && (
                <span className={cn("font-medium", isActive ? "text-primary" : "text-sidebar-foreground")}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          "bg-gradient-to-r from-primary/10 to-secondary/10",
          "border border-primary/20"
        )}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.avatar || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-accent rounded text-[10px] font-bold text-accent-foreground">
              PRO
            </div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user?.name || 'Agent'}</p>
              <p className="text-xs text-muted-foreground">Level {dashboardData?.level || 1} Agent</p>
              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                  style={{ width: `${dashboardData?.levelProgress || 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{(dashboardData?.xp || 0).toLocaleString()} XP</span>
                <span>{(dashboardData?.nextLevelXP || 1000).toLocaleString()} XP</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full mt-3 flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            "transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className={cn(
          "absolute top-20 -right-3 w-6 h-6 rounded-full",
          "bg-card border border-border",
          "flex items-center justify-center",
          "hover:bg-muted transition-colors z-50",
          "shadow-lg"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
};

export default AgentSidebar;