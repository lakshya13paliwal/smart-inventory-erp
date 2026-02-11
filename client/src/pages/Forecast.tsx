import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useProducts } from "@/hooks/use-inventory";
import { useForecast } from "@/hooks/use-forecast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { BrainCircuit, TrendingUp, AlertOctagon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Forecast() {
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const { data: forecast, isLoading } = useForecast(selectedProductId ? parseInt(selectedProductId) : null);

  // Combine historical and predicted data for the chart
  const chartData = forecast ? [
    ...forecast.historical.map(d => ({ date: d.date, actual: d.value, predicted: null })),
    ...forecast.predicted.map(d => ({ date: d.date, actual: null, predicted: d.value }))
  ] : [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <PageHeader 
          title="Demand Forecasting" 
          description="AI-powered inventory predictions using ARIMA/LSTM models."
        >
          <div className="w-[250px]">
            <Select onValueChange={setSelectedProductId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Product to Forecast" />
              </SelectTrigger>
              <SelectContent>
                {products?.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PageHeader>

        {!selectedProductId ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <BrainCircuit className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-600">Select a product to generate forecast</h3>
            <p>Our ML models will analyze historical sales to predict future demand.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        ) : forecast ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Sales Forecast: {forecast.productName}
                </CardTitle>
                <CardDescription>
                  Historical data (solid) vs ML Prediction (dashed)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      name="Historical Sales"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorActual)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      name="ML Prediction"
                      stroke="#8b5cf6" 
                      strokeDasharray="5 5"
                      fillOpacity={1} 
                      fill="url(#colorPredicted)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{forecast.recommendation}</div>
                  <p className="text-sm text-blue-600 mt-1">Based on projected demand</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Model Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{forecast.confidence}%</div>
                  <p className="text-sm text-purple-600 mt-1">Statistical probability</p>
                </CardContent>
              </Card>
              
              <Card className="bg-emerald-50 border-emerald-100">
                 <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-700">Next Month Demand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-900">
                    {Math.round(forecast.predicted.reduce((acc, curr) => acc + curr.value, 0))} Units
                  </div>
                  <p className="text-sm text-emerald-600 mt-1">Predicted total volume</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
