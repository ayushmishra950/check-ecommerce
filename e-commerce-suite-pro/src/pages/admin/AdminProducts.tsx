import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import AddProductDialog from "@/components/form/AddProductDialog";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProduct, deleteProduct, productStatus } from "@/services/service";
import DeleteModal from "@/card/DeleteModal";

import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [ProductList, setProductList] = useState<any>([]);
  const [productListRefresh, setProductListRefresh] = useState<boolean>(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredProducts = ProductList?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleStatusChange = async (id: string, status: boolean) => {
    let obj = { adminId: user?.id, shopId: user?.shopId, productId: id, status };
    console.log(obj)
    if (!user?.id || !user?.shopId || !id) { return };

    try {
      const res = await productStatus(obj);
      console.log(res)
      if (res.status === 200) {
        toast({ title: "Status Updated Successfully.", description: res.data.message });
        setProductListRefresh(true);
      }
      else {
        toast({ title: "Status Update Failed.", description: res.data.message })
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" });
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
  }

  const handleGetProduct = async () => {
    try {
      const res = await getProduct(user?.shopId, user?.id);
      console.log(res);
      if (res.status === 200) {
        setProductList(res.data.data);
        setProductListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    handleGetProduct();
  }, [productListRefresh])

  return (
    <>
      <DeleteModal buttonName='Delete' isOpen={isDeleteDialogOpen} isDeleteLoading={isDeleteLoading} onClose={() => { setIsDeleteDialogOpen(false) }} onConfirm={handleDeleteProduct} title='Confirm Deletion.' description='This action will permanently delete the Product. Are you sure you want to proceed?' />
      <AddProductDialog open={productDialogOpen} setProductListRefresh={setProductListRefresh} initialData={initialData} onOpenChange={() => { setProductDialogOpen(false) }} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Left: Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Right: Add Product Button */}
          <Button onClick={() => { setInitialData(null); setProductDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.length > 0 ? (
            filteredProducts.map((product) => (

              <Card key={product._id} className="overflow-hidden flex flex-col cursor-pointer transition-all hover:ring-2 hover:ring-zinc-900 dark:hover:ring-zinc-100" onClick={() => navigate(`/admin/product/${product._id}`)}>
                <div className="aspect-square relative bg-muted overflow-hidden group">
                  <img
                    src={product?.images[0]}
                    alt={product?.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="shadow-sm"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-36 sm:w-28 sm:ml-20">
                        <DropdownMenuItem
                          onClick={() => { setInitialData(product); setProductDialogOpen(true) }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => { setDeleteId(product?._id); setIsDeleteDialogOpen(true) }}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="cursor-pointer flex items-center justify-between">
                            Change Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleStatusChange(product._id, true)}
                              disabled={product.isActive === true}
                            >
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleStatusChange(product._id, false)}
                              disabled={product.isActive === false}
                            >
                              Inactive
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4 flex flex-col flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    <h3 className="font-semibold text-foreground line-clamp-1">{product?.name}</h3>
                  </div>

                  {/* Fixed bottom row */}
                  <div className="flex items-center justify-between mt-auto gap-2">
                    <span className="font-bold text-foreground">₹{product.price}</span>
                    <div className="flex gap-1">
                      <Badge
                        variant={product.stock ? 'default' : 'secondary'}
                        className="text-xs px-2 py-0.5"
                      >
                        {product.stock ? 'In Stock' : 'Out of Stock'}
                      </Badge>

                      <Badge
                        className={`text-xs px-2 py-0.5 ${product.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}
                      >
                        {product.isActive ? 'Active' : 'In-Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

            ))
          ) :
            <div className='col-span-full flex justify-center items-center mt-[140px]'>
              <p className='text-gray-500 font-medium'>No Product Found.</p>
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default AdminProducts;
