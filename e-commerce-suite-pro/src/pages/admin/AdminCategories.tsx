import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Edit, Trash, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddCategoryDialog from "@/components/form/AddCategoryDialog";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCategory, deleteCategory, categoryStatus } from "@/services/service";
import { formatDate } from "@/services/allFunction";
import DeleteModal from "@/card/DeleteModal";
import {getStatusVariant} from "@/services/allFunction";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { setCategoryList } from '@/redux-toolkit/slice/categorySlice';

const AdminCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  // const [categoryList, setCategoryList] = useState<any>([]);
  const [categoryListRefresh, setCategoryListRefresh] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const dispatch = useAppDispatch();
  const categoryList = useAppSelector((state)=> state?.category?.categoryList);

  const filteredCategories = categoryList.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (category.isActive === true ? "active" : "inactive") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async(id: string, status:boolean) =>{
     let obj = { userId: user?.id, shopId: user?.shopId, id: id, status };
       console.log(obj)
        if (!user?.id || !user?.shopId || !id) { return };
      
    try{
     const res = await categoryStatus(obj);
     console.log(res)
     if(res.status===200){
      toast({title:"Status Updated Successfully.", description:res.data.message});
      setCategoryListRefresh(true);
     }
     else{
     toast({title:"Status Update Failed.", description:res.data.message})
     }
    }
      catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" }); 
    }
  }

  const handleDeleteCategory = async () => {
    if (!user?.id || !user?.shopId || !deleteId) { return }
    let obj = { userId: user?.id, shopId: user?.shopId, id: deleteId }
    setIsDeleteLoading(true);
    try {
      const res = await deleteCategory(obj);
      console.log(res);
      if (res.status === 200) {
        toast({ title: "Delete Category.", description: res.data.message });
        setCategoryListRefresh(true);
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

  const handleGetCategory = async () => {
    if (!user?.id || !user?.shopId) { return }
    let obj = { userId: user?.id, shopId: user?.shopId }
    try {
      const res = await getCategory(obj);
      console.log(res);
      dispatch(setCategoryList(res.data.data));
      setCategoryListRefresh(false);
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  };

  useEffect(() => {
    if(categoryList?.length===0 || categoryListRefresh){
   handleGetCategory();
    } 
  }, [categoryListRefresh]);

  return (
    <>
      <AddCategoryDialog isOpen={isOpen} onClose={() => { setIsOpen(false) }} initialData={initialData} setCategoryListRefresh={setCategoryListRefresh} />
      <DeleteModal buttonName='Delete' isOpen={isDeleteDialogOpen} isDeleteLoading={isDeleteLoading} onClose={() => { setIsDeleteDialogOpen(false) }} onConfirm={handleDeleteCategory} title='Confirm Deletion.' description='This action will permanently delete the category. Are you sure you want to proceed?' />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex md:flex-row  gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 placeholder:text-xs md:placeholder:text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}  >
            <SelectTrigger className="w-[80px] md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className='w-[80px] md:w-full' >
              <SelectItem value="all" className='cursor-pointer'>All Categories</SelectItem>
              <SelectItem value="active" className='cursor-pointer'>Active</SelectItem>
              <SelectItem value="inactive" className='cursor-pointer'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Right side button */}
          <Button className="ml-auto w-[90px] text-xs md:w-[110px] md:text-sm " onClick={() => { setInitialData(null); setIsOpen(true) }}>
            Add Category
          </Button>
        </div>
        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-4 px-2 md:px-6 text-sm text-muted-foreground">
                      Category Name
                    </th>
                    <th className="text-left py-4 px-2 md:px-6 text-sm text-muted-foreground">
                      Products
                    </th>
                    <th className="text-left py-4 px-2 md:px-6 text-sm text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-4 px-2 md:px-6 text-sm text-muted-foreground hidden md:table-cell">
                      Created At
                    </th>
                    <th className="text-left py-4 px-2 md:px-6 text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-2 md:px-6 text-sm font-medium">
                        {category?.name?.charAt(0).toUpperCase() + category?.name?.slice(1)}
                      </td>
                      <td className="py-4 px-2 md:px-6 text-sm text-muted-foreground">
                        {category.product.length}
                      </td>

                      <td className="py-4 px-2 md:px-6">
                        <Badge variant={getStatusVariant(category.isActive === true ? "active" : "inactive")}>
                          {category.isActive === true ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      <td className="py-4 px-2 md:px-6 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(category.createdAt)}
                      </td>

                      <td className="py-4 px-2 md:px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {/* Status Change item */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className='cursor-pointer'> 
                                <Repeat className="h-4 w-4 mr-2" />
                                <span>Status Change</span>
                              </DropdownMenuSubTrigger>

                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem className='cursor-pointer' disabled={category.isActive===true} onClick={() => handleStatusChange(category?._id,true)}>
                                    Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className='cursor-pointer' disabled={category.isActive===false} onClick={() => handleStatusChange(category?._id,false)}>
                                    Inactive
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>


                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setInitialData(category);
                                setIsOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Category
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteId(category?._id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminCategories;
