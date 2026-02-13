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
          {/* ... other metric cards ... */}
        </div>
        {/* ... existing rest of dashboard ... */}
      </main>
    </div>
  );
}
