import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSupplier } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSuppliers() {
  return useQuery({
    queryKey: [api.suppliers.list.path],
    queryFn: async () => {
      const res = await fetch(api.suppliers.list.path);
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      return api.suppliers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const res = await fetch(api.suppliers.create.path, {
        method: api.suppliers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add supplier");
      return api.suppliers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suppliers.list.path] });
      toast({ title: "Supplier added", description: "Vendor list updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });
}
