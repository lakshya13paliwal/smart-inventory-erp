import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp, 
  LogOut, 
  Info,
  Menu,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/forecast", label: "Demand Forecast", icon: TrendingUp },
  { href: "/team", label: "Team & Credits", icon: Info },
  { href: "/settings", label: "Settings", icon: Landmark },
];

export function Sidebar() {
  const [location] = useLocation();
  const { mutate: logout } = useLogout();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold text-white tracking-wider flex items-center gap-2">
          <span className="bg-gradient-to-tr from-blue-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">
            SI
          </span>
          SmartERP
        </h1>
        <p className="text-xs text-slate-400 mt-2 ml-1">Intelligent Inventory System</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <div
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-blue-600/20 text-blue-300 shadow-sm border border-blue-500/10"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"
                  )}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          onClick={() => logout()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800 border-slate-700">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-r-slate-800">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
