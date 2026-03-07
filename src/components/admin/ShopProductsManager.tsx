import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, ShoppingCart, Eye, DollarSign } from "lucide-react";
import { SHOP_CATEGORIES } from "@/types/Shop";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  category: string;
  stock: number;
  is_published: boolean;
  is_featured: boolean;
  images: string[];
}

const defaultForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compare_price: null,
  category: "accessories",
  stock: 0,
  is_published: false,
  is_featured: false,
  images: [],
};

export const ShopProductsManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [imageUrl, setImageUrl] = useState("");
  const [activeView, setActiveView] = useState<"products" | "orders">("products");

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, ordRes] = await Promise.all([
      supabase.from("shop_products").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (ordRes.data) setOrders(ordRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0) {
      toast.error("Nom et prix requis");
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description,
      price: form.price,
      compare_price: form.compare_price,
      category: form.category,
      stock: form.stock,
      is_published: form.is_published,
      is_featured: form.is_featured,
      images: form.images,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("shop_products").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("shop_products").insert(payload));
    }

    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success(editId ? "Produit mis à jour" : "Produit créé");
      setDialogOpen(false);
      setForm(defaultForm);
      setEditId(null);
      fetchData();
    }
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      compare_price: product.compare_price,
      category: product.category,
      stock: product.stock,
      is_published: product.is_published,
      is_featured: product.is_featured,
      images: Array.isArray(product.images) ? product.images : [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("shop_products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Produit supprimé"); fetchData(); }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm(prev => ({ ...prev, images: [...prev.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("shop_orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Statut mis à jour"); fetchData(); }
  };

  const totalRevenue = orders
    .filter(o => o.payment_status === "paid")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Package className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-xs text-muted-foreground">Produits</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Eye className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{products.filter(p => p.is_published).length}</p>
          <p className="text-xs text-muted-foreground">Publiés</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <ShoppingCart className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Commandes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(0)}€</p>
          <p className="text-xs text-muted-foreground">Revenus</p>
        </CardContent></Card>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <Button variant={activeView === "products" ? "default" : "outline"} size="sm" onClick={() => setActiveView("products")}>
          <Package className="h-4 w-4 mr-1" /> Produits
        </Button>
        <Button variant={activeView === "orders" ? "default" : "outline"} size="sm" onClick={() => setActiveView("orders")}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Commandes
        </Button>
      </div>

      {activeView === "products" ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Produits ({products.length})</h3>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditId(null); setForm(defaultForm); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Nouveau produit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editId ? "Modifier" : "Nouveau"} produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nom *</label>
                    <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Slug</label>
                    <Input value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Prix (€) *</label>
                      <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Prix barré (€)</label>
                      <Input type="number" step="0.01" value={form.compare_price || ""} onChange={(e) => setForm(prev => ({ ...prev, compare_price: parseFloat(e.target.value) || null }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Catégorie</label>
                      <Select value={form.category} onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SHOP_CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Stock</label>
                      <Input type="number" value={form.stock} onChange={(e) => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  {/* Images */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Images</label>
                    <div className="flex gap-2">
                      <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL de l'image" />
                      <Button type="button" size="sm" onClick={addImage}>+</Button>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={img} alt="" className="w-full h-full object-cover rounded" />
                          <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={form.is_published} onCheckedChange={(val) => setForm(prev => ({ ...prev, is_published: val }))} />
                      <span className="text-sm text-foreground">Publié</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={form.is_featured} onCheckedChange={(val) => setForm(prev => ({ ...prev, is_featured: val }))} />
                      <span className="text-sm text-foreground">Vedette</span>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">{editId ? "Mettre à jour" : "Créer"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                <img
                  src={Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "/placeholder.svg"}
                  alt={product.name}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{product.name}</h4>
                  <div className="flex gap-2 items-center text-xs text-muted-foreground">
                    <span>{product.price}€</span>
                    <span>·</span>
                    <span>Stock: {product.stock}</span>
                    {product.is_published ? (
                      <Badge variant="default" className="text-[10px]">Publié</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Brouillon</Badge>
                    )}
                    {product.is_featured && <Badge variant="secondary" className="text-[10px]">⭐</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(product)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Commandes ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune commande pour le moment</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')} · {order.total_price}€
                  </p>
                </div>
                <Badge variant={order.payment_status === "paid" ? "default" : "outline"} className="text-[10px]">
                  {order.payment_status}
                </Badge>
                <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="shipped">Expédié</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
