import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useSuppliers, useCreateSupplier } from "@/hooks/use-suppliers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Phone, Mail, Award } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupplierSchema } from "@shared/schema";
import { z } from "zod";

const supplierFormSchema = insertSupplierSchema.extend({
  reliabilityScore: z.coerce.number().default(100),
});
type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export default function Suppliers() {
  const { data: suppliers } = useSuppliers();
  const { mutate: createSupplier, isPending } = useCreateSupplier();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: { name: "", contactPerson: "", email: "", phone: "", location: "", reliabilityScore: 100 }
  });

  const onSubmit = (data: SupplierFormValues) => {
    createSupplier(data, { onSuccess: () => setIsOpen(false) });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <PageHeader title="Supplier Network" description="Manage vendor relationships and performance.">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="w-4 h-4 mr-2" /> Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input {...form.register("name")} placeholder="Global Corp" required />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input {...form.register("contactPerson")} placeholder="Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...form.register("email")} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...form.register("phone")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...form.register("location")} placeholder="Mumbai, Maharashtra" />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Supplier"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers?.map(supplier => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <CardDescription>{supplier.contactPerson}</CardDescription>
                </div>
                <div className="flex flex-col items-center">
                   <div className={`text-sm font-bold px-2 py-1 rounded ${
                     (supplier.reliabilityScore || 0) > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {supplier.reliabilityScore}%
                   </div>
                   <span className="text-[10px] text-muted-foreground mt-1">Score</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-2 opacity-70" />
                  {supplier.location || "No location"}
                </div>
                <div className="flex items-center text-slate-600">
                  <Phone className="w-4 h-4 mr-2 opacity-70" />
                  {supplier.phone || "No phone"}
                </div>
                <div className="flex items-center text-slate-600">
                  <Mail className="w-4 h-4 mr-2 opacity-70" />
                  {supplier.email || "No email"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
