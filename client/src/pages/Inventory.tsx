import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-inventory";
import { useSuppliers } from "@/hooks/use-suppliers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Edit, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

// Frontend schema for form (handling string -> number coercion)
const productFormSchema = insertProductSchema.extend({
  currentStock: z.coerce.number(),
  reorderLevel: z.coerce.number(),
  unitPrice: z.coerce.number(),
  supplierId: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: products } = useProducts();
  const { data: suppliers } = useSuppliers();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      currentStock: 0,
      reorderLevel: 10,
      unitPrice: 0,
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    createProduct(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <PageHeader 
          title="Inventory Management" 
          description="Track stock levels, prices, and product details."
        >
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input {...form.register("name")} placeholder="e.g. Wireless Mouse" />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input {...form.register("sku")} placeholder="e.g. WM-001" />
                    {form.formState.errors.sku && <p className="text-xs text-red-500">{form.formState.errors.sku.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input {...form.register("category")} placeholder="e.g. Electronics" />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select onValueChange={(val) => form.setValue("supplierId", parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Price (₹)</Label>
                    <Input type="number" step="0.01" {...form.register("unitPrice")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Stock</Label>
                    <Input type="number" {...form.register("currentStock")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reorder Level</Label>
                    <Input type="number" {...form.register("reorderLevel")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input {...form.register("description")} placeholder="Product details..." />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search products by name or SKU..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No products found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product) => {
                  const isLowStock = product.currentStock <= product.reorderLevel;
                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₹{product.unitPrice}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            In Stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                deleteProduct(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
