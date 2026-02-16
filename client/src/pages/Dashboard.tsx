import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { useProducts } from "@/hooks/use-inventory";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { 
  IndianRupee, 
  Landmark,
  CircleAlert, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  
  const { data: settings } = useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  if (loadingProducts || loadingSuppliers) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </main>
    </div>
  );

  const totalValue = products?.reduce((acc, p) => acc + (Number(p.unitPrice) * p.currentStock), 0) || 0;
  const lowStockItems = products?.filter(p => p.currentStock <= p.reorderLevel) || [];
  const avgReliability = suppliers?.length 
    ? suppliers.reduce((acc, s) => acc + (s.reliabilityScore || 0), 0) / suppliers.length 
    : 100;

  const currencyCode = settings?.currency || "INR";
  const locale = settings?.country === "India" ? "en-IN" : "en-US";

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  });

  const Icon = currencyCode === "INR" ? IndianRupee : Landmark;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <PageHeader 
          title={settings?.organizationName || "Executive Overview"} 
          description={`Operational metrics for ${settings?.country || "India"}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Stock Value"
            value={formatter.format(totalValue)}
            icon={Icon}
            description={`In ${currencyCode}`}
            trend="up"
            trendValue="+12%"
            className="border-l-4 border-l-blue-500"
          />
          <MetricCard
            title="Low Stock Alerts"
            value={lowStockItems.length}
            icon={CircleAlert}
            description="Items below reorder level"
            trend={lowStockItems.length > 0 ? "down" : "neutral"}
            trendValue={lowStockItems.length > 0 ? "Action Needed" : "Healthy"}
            className="border-l-4 border-l-amber-500"
          />
          <MetricCard
            title="Supplier Reliability"
            value={`${Math.round(avgReliability)}%`}
            icon={Activity}
            description="Average fulfillment score"
            trend="up"
            trendValue="+2.5%"
            className="border-l-4 border-l-green-500"
          />
          <MetricCard
            title="Total Products"
            value={products?.length || 0}
            icon={TrendingUp}
            description="Active SKUs in system"
            className="border-l-4 border-l-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Revenue Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full w-full flex items-center justify-center text-muted-foreground italic text-sm">
                Revenue visualization loading...
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Stock Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full w-full flex items-center justify-center text-muted-foreground italic text-sm">
                Distribution chart loading...
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Inventory Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-green-500" />
                  <p>All stock levels are healthy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.slice(0, 5).map(item => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item.id} 
                      className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.name}</h4>
                          <p className="text-sm text-amber-700">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {item.currentStock} / {item.reorderLevel}
                        </p>
                        <p className="text-xs text-amber-600">Reorder Level</p>
                      </div>
                    </motion.div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      + {lowStockItems.length - 5} more items require attention
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Suppliers */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers?.slice(0, 5).map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                        {supplier.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.location}</p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                      {supplier.reliabilityScore}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
