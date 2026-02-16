import { Bell, AlertTriangle, ShoppingCart } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function NotificationsBell() {
  const { data: products } = useProducts();
  
  const lowStockItems = products?.filter(p => p.currentStock <= p.reorderLevel) || [];
  const count = lowStockItems.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover-elevate active-elevate-2">
          <Bell className="h-5 w-5 text-slate-600" />
          {count > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 border-2 border-white"
            >
              {count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {count > 0 && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-red-600 border-red-200 bg-red-50">
              {count} Alerts
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {count === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No new alerts</p>
            </div>
          ) : (
            lowStockItems.map((item) => (
              <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1 p-3 cursor-default">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-slate-900">{item.name}</span>
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">
                    Low Stock
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span>Only {item.currentStock} remaining (Min: {item.reorderLevel})</span>
                </div>
                <div className="mt-2 w-full">
                  <Link href="/inventory">
                    <Button size="sm" className="w-full h-8 text-[11px] bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Create Purchase Order
                    </Button>
                  </Link>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {count > 0 && (
          <>
            <DropdownMenuSeparator />
            <Link href="/inventory">
              <DropdownMenuItem className="justify-center text-xs text-primary font-medium cursor-pointer">
                View All Inventory
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
