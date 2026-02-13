import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UpdateSettingsRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Landmark, MapPin, Building2 } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (updates: UpdateSettingsRequest) => {
      const res = await fetch(api.settings.update.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({
        title: "Settings updated",
        description: "Your enterprise configurations have been saved.",
      });
    }
  });

  const [orgName, setOrgName] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (settings) {
      setOrgName(settings.organizationName);
      setCountry(settings.country);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const countries = [
    { name: "India", currency: "INR", format: "IN" },
    { name: "United States", currency: "USD", format: "US" },
    { name: "United Kingdom", currency: "GBP", format: "UK" },
    { name: "United Arab Emirates", currency: "AED", format: "UAE" },
    { name: "Australia", currency: "AUD", format: "AU" },
  ];

  const handleSave = () => {
    const selected = countries.find(c => c.name === country);
    mutation.mutate({
      organizationName: orgName,
      country: country,
      currency: selected?.currency || "INR",
      addressFormat: selected?.format || "IN"
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1">
        <PageHeader 
          title="Enterprise Settings" 
          description="Configure your organization's region and localization"
        />
        
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>General Information</CardTitle>
              </div>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input 
                  id="orgName" 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Smart Inventory Systems India"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <CardTitle>Regional & Localization</CardTitle>
              </div>
              <CardDescription>Select your country to update currency and address formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country / Region</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-100 border flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white text-primary">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">System Currency</p>
                    <p className="font-semibold text-slate-900">
                      {countries.find(c => c.name === country)?.currency || "INR"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-100 border flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Address Format</p>
                    <p className="font-semibold text-slate-900">
                      {countries.find(c => c.name === country)?.format || "IN"} Standard
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3 italic text-sm text-blue-700">
                <span>Note: Changing country will update terms and conditions references site-wide.</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={mutation.isPending}
              className="px-8"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
