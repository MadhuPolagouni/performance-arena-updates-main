import { useState } from "react";
import { Bell, Search, Rocket } from "lucide-react";
import { cn } from "../../lib/utils";
import NotificationPopup from "./NotificationPopup";
import { useAuth } from "../../contexts/AuthContext";

const AgentHeader = () => {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-lg">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {greeting}, {user?.name?.split(' ')[0] || 'Agent'}! <Rocket className="w-6 h-6 text-accent" />
        </h2>
        <p className="text-sm text-muted-foreground">
          Your daily performance overview is ready.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search missions, players..."
            className={cn(
              "w-64 pl-10 pr-4 py-2 rounded-lg",
              "bg-muted/50 border border-border",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
              "transition-all"
            )}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-2 rounded-lg",
              "bg-muted/50 border border-border",
              "hover:bg-muted transition-colors",
              showNotifications && "bg-muted border-primary/50"
            )}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPopup 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={() => setUnreadCount(0)}
          />
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 border-2 border-primary/30 flex items-center justify-center text-white font-bold">
          {user?.avatar || 'A'}
        </div>
      </div>
    </header>
  );
};

export default AgentHeader;
