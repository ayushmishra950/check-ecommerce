"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Edit,
    Trash2,
    Plus,
    Image as ImageIcon,
    Tag,
    DollarSign,
    IndianRupee,
    Package,
    Eye,
    TrendingUp,
    ChevronLeft,
    MoreVertical,
    CheckCircle,
    XCircle,
    Copy,
    ExternalLink,
    Search,
    BarChart3,
    Layers,
    Globe,
    ShieldCheck,
    ShoppingBag,
    Star,
    ChevronRight,
    RotateCcw,
    Printer,
    Download,
    Loader2,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAdminProductById, productStatus, deleteProduct } from "@/services/service";
import { useAuth } from "@/context/AuthContext";
import AddProductDialog from "@/components/form/AddProductDialog";
import { useToast } from "@/hooks/use-toast";
import DeleteModal from "@/card/DeleteModal";


const AdminSingleProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {toast} = useToast();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [productListRefresh, setProductListRefresh] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await getAdminProductById(id);
                console.log(res)
                if (res.data.success) {
                    setProduct(res.data.data);
                    if (res.data.data.images?.length > 0) {
                        setActiveImage(res.data.data.images[0]);
                    }
                }
            } catch (err: any) {
                console.error(err);
                navigate("/admin/products");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate, productListRefresh]);

    const handleUpdateStatus = async () => {
        if (!product || !user) return;
        setIsUpdating(true);
        try {
            const newStatus = !product.isActive;
            const obj = {
                adminId: user.id,
                shopId: user.shopId,
                productId: product._id,
                status: newStatus
            };
            const res = await productStatus(obj);
            if (res.status === 200) {
                setProduct({ ...product, isActive: newStatus });
               
            }
        } catch (err: any) {
           toast({title:"Product Status Update Failed.", description:err?.response?.data?.message|| err?.message , variant:"destructive"})
        } finally {
            setIsUpdating(false);
        }
    };

    
      const handleDeleteProduct = async () => {
        if (!user?.id || !user?.shopId || !deleteId) { return }
        let obj = { adminId: user?.id, shopId: user?.shopId, id: deleteId }
        setIsDeleteLoading(true);
        try {
          const res = await deleteProduct(obj);
          console.log(res);
          if (res.status === 200) {
            toast({ title: "Delete Product.", description: res.data.message });
            setProductListRefresh(true);
            navigate("/admin/products")
          }
        }
        catch (err) {
          console.log(err);
          toast({ title: "Error", description: err.response.data.message, variant: "destructive" });
          setIsDeleteLoading(false);
        }
        finally {
          setIsDeleteLoading(false);
          setIsDeleteDialogOpen(false);
        }
      };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({title:"Copy to Clipboard.", description:"Copy To ClipBoard."})
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
                <p className="text-zinc-500 font-medium animate-pulse">Syncing product intelligence...</p>
            </div>
        );
    }
    console.log(product)

    if (!product) return null;

    const discountAmount = product.discountType === "percentage"
        ? (product.price * product.discount) / 100
        : product.discount;
    const finalPrice = product.price - discountAmount;

    return (
        <>
      <DeleteModal buttonName='Delete' isOpen={isDeleteDialogOpen} isDeleteLoading={isDeleteLoading} onClose={() => { setIsDeleteDialogOpen(false) }} onConfirm={handleDeleteProduct} title='Confirm Deletion.' description='This action will permanently delete the Product. Are you sure you want to proceed?' />
      <AddProductDialog open={productDialogOpen} setProductListRefresh={setProductListRefresh} initialData={initialData} onOpenChange={() => { setProductDialogOpen(false) }} />
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Top Navigation / Breadcrumbs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                onClick={() => navigate("/admin/products")}
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px] sm:max-w-md">
                                        {product.name}
                                    </h1>
                                    <Badge variant={product.isActive ? "default" : "secondary"} className={cn(
                                        "text-[10px] h-5",
                                        product.isActive ? "bg-green-500 hover:bg-green-600" : ""
                                    )}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span className="font-mono">PD-Id:{product._id}</span>
                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                    <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
                                <Eye size={16} /> <span className="hidden xs:inline">Preview Shop</span>
                            </Button>
                            <Button onClick={() => { setInitialData(product); setProductDialogOpen(true) }} className="rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 flex items-center gap-2">
                                <Edit size={16} /> <span>Edit Details</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Inventory Level", value: product.stock, icon: Package, color: "text-blue-500", suffix: "Units" },
                            { label: "Feedback Score", value: product.rating.length ? product?.rating.reduce((acc, r) => acc + r.rating, 0) / product?.rating?.length : 0, icon: Star, color: "text-yellow-500", suffix: "/ 5.0" },
                            { label: "Review Count", value: product.rating.length, icon: ShoppingBag, color: "text-purple-500", suffix: "Reviews" },
                            { label: "Price Point", value: `₹${product.price}`, icon: IndianRupee, color: "text-green-500", suffix: "Retail" },
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm bg-white dark:bg-zinc-900 transition-all hover:shadow-md cursor-default">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                                            {stat.value}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-medium lowercase italic">{stat.suffix}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Side - Visuals & Shortcuts */}
                        <div className="space-y-6">
                            {/* Media Gallery */}
                            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                                <CardHeader className="p-5 pb-0">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <ImageIcon size={16} className="text-zinc-400" /> Catalog Visuals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-800 group relative">
                                        {activeImage ? (
                                            <img
                                                src={activeImage}
                                                alt="Product Preview"
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <ImageIcon size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <Badge className="absolute top-4 left-4 bg-white/80 dark:bg-black/80 backdrop-blur-md text-zinc-900 dark:text-white border-none shadow-sm">Main View</Badge>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {product.images?.slice(0,4).map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(img)}
                                                className={cn(
                                                    "w-16 h-16 rounded-xl border-2 transition-all shrink-0 overflow-hidden",
                                                    activeImage === img ? "border-zinc-900 dark:border-zinc-50 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <img src={img} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                        <button className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 shrink-0">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventory Pulse */}
                            <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader className="p-5 pb-0">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Package size={16} className="text-zinc-400" /> Stock Velocity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-semibold text-zinc-500">Inventory Health</span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            product.stock < 10 ? "text-red-500" : "text-green-500"
                                        )}>
                                            {product.stock < 10 ? "Low Stock" : "In Stock"} ({product.stock})
                                        </span>
                                    </div>
                                    <Progress value={Math.min((product.stock / 50) * 100, 100)} className="h-2 rounded-full" />
                                    <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                                        <ShieldCheck size={14} className="text-green-500" />
                                        <span>Syncing with shop intelligence...</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-3">
                                <Button
                                onClick={()=>{setDeleteId(product?._id);setIsDeleteDialogOpen(true)}}
                                    variant="outline"
                                    className="flex-1 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/50 flex items-center justify-center gap-2 h-11"
                                >
                                    <Trash2 size={16} /> Delete
                                </Button>
                                <Button
                                    onClick={handleUpdateStatus}
                                    disabled={isUpdating}
                                    className={cn(
                                        "flex-1 rounded-xl h-11 text-white border-none transition-all flex items-center justify-center gap-2",
                                        product.isActive ? "bg-zinc-400 hover:bg-zinc-500" : "bg-green-500 hover:bg-green-600"
                                    )}
                                >
                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : product.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                    {product.isActive ? "Deactivate" : "Activate"}
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - Details & Controls */}
                        <div className="lg:col-span-2">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl w-full sm:w-auto h-auto grid grid-cols-2 sm:flex sm:flex-nowrap gap-1">
                                    <TabsTrigger value="overview" className="rounded-lg py-2 px-4 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none">Overview</TabsTrigger>
                                    <TabsTrigger value="marketing" className="rounded-lg py-2 px-4 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">Marketing</TabsTrigger>
                                    <TabsTrigger value="reviews" className="rounded-lg py-2 px-4 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800">Feedback</TabsTrigger>
                                </TabsList>

                                <div className="mt-6 space-y-6">
                                    {/* Overview Content */}
                                    <TabsContent value="overview" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                                            <CardHeader>
                                                <CardTitle className="text-base">Product Genome</CardTitle>
                                                <CardDescription>Primary identification and classification data.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Internal Hash ID</label>
                                                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                            <span className="text-xs font-mono font-medium truncate max-w-[150px]">{product._id}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(product._id)}>
                                                                <Copy size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Classification</label>
                                                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm font-bold">
                                                            <Layers size={14} className="text-zinc-400" /> {product.category?.name || "Uncategorized"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Executive Description</label>
                                                    <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 min-h-[100px]">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                                            <CardHeader>
                                                <CardTitle className="text-base">Commercial Values</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">List Price</p>
                                                        <p className="text-xl font-bold text-zinc-300 line-through">₹{product.price}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900 dark:bg-zinc-50 rounded-2xl border-none shadow-lg scale-105">
                                                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Current Value</p>
                                                        <p className="text-2xl font-black text-white dark:text-zinc-900">₹{finalPrice}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Discount Gain</p>
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 font-bold">
                                                            -{product.discount}{product.discountType === "percentage" ? "%" : " OFF"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Marketing Content */}
                                    <TabsContent value="marketing" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                                            <CardHeader>
                                                <CardTitle className="text-base">Digital Presence</CardTitle>
                                                <CardDescription>Product visibility and search intelligence.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 opacity-60">
                                                        <Globe size={12} /> SHOP_INDEX &gt; {product.category?.name || "PRODUCTS"} &gt; {product._id}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{product.name} | Buy Online</h3>
                                                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 italic">"{product.description}"</p>
                                                </div>

                                                <Separator />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Search size={14} className="text-zinc-400" />
                                                            <span className="text-xs font-medium">Search Discoverable</span>
                                                        </div>
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    </div>
                                                    <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <ArrowUpRight size={14} className="text-zinc-400" />
                                                            <span className="text-xs font-medium">Social Optimization</span>
                                                        </div>
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Feedback Content */}
                                    <TabsContent
                                        value="reviews"
                                        className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    >
                                        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base font-bold">Customer Loyalty</CardTitle>
                                                        <CardDescription>
                                                            Market reception and feedback metrics.
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-right">
                                                        {/* Calculate average rating */}
                                                        {(() => {
                                                            const ratingsArray = product.rating || [];
                                                            const averageRating =
                                                                ratingsArray.length > 0
                                                                    ? (
                                                                        ratingsArray.reduce((acc, r) => acc + (r.rating || 0), 0) /
                                                                        ratingsArray.length
                                                                    ).toFixed(1)
                                                                    : 0;
                                                            return (
                                                                <>
                                                                    <div className="text-3xl font-black text-zinc-900 dark:text-white">
                                                                        {averageRating}
                                                                    </div>
                                                                    <div className="flex justify-end gap-0.5 text-yellow-400 mt-1">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <Star
                                                                                key={s}
                                                                                size={12}
                                                                                fill={s <= Number(averageRating) ? "currentColor" : "none"}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
                                                            {product.rating.length || 0} Total Reviews
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="space-y-4">
                                                    {/* Star distribution bars */}
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const ratingsArray = product.rating || [];
                                                        const total = ratingsArray.length;
                                                        const count = ratingsArray.filter((r) => r.rating === star).length;
                                                        const percentage = total > 0 ? (count / total) * 100 : 0;

                                                        return (
                                                            <div key={star} className="flex items-center gap-4 text-xs">
                                                                <span className="w-4 font-bold">{star}</span>
                                                                <Star size={12} className="text-yellow-400 fill-current" />
                                                                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-yellow-400 rounded-full"
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="w-10 text-right text-zinc-400">
                                                                    {percentage.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        );
                                                    })}

                                                    <Separator className="mt-8" />

                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-xl border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 h-10 mt-2"
                                                    >
                                                        Download Comprehensive Feedback Report
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>


                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSingleProduct;
