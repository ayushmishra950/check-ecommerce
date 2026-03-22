import { useEffect, useState } from 'react';
import { Search, Eye, MoreHorizontal, UserX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {getAllCustomer, blockAndUnBlockCustomer, getAllBlockCustomerList} from "@/services/service";
import {formatDate} from "@/services/allFunction";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { setCustomerList, setBlockCustomerList } from '@/redux-toolkit/slice/userSlice';

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'outline';
    case 'blocked':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const AdminCustomers = () => {
  const {toast} = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // const [customerList, setCustomerList] = useState([]);
  // const [blockCustomerList, setBlockCustomerList] = useState([]);
  const [customerDetailOpen,setCustomerDetailOpen] = useState(false);
    const [blockDetailOpen,setBlockDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [blockListRefresh, setBlockListRefresh] = useState(false);
  const [isBlock, setIsBlock] = useState(false);
const [reason, setReason] = useState("");
const[blockLoading, setBlockLoading] = useState(false);
const currentDate = new Date().toISOString().split("T")[0];
const dispatch = useAppDispatch();
const customerList = useAppSelector((state)=> state?.user?.customerList);
const blockCustomerList = useAppSelector((state)=> state?.user?.blockList);

  const filteredCustomers = customerList?.filter((customer) => {
    const matchesSearch =
      customer?.shippingAddress?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.shippingAddress?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.shippingAddress?.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBlockAndUnBlockCustomer = async() => {
    try{
       let obj = {shopId:selectedCustomer?.shop, userId:selectedCustomer?.user, reason:reason};
       setBlockLoading(true);
       const res =await blockAndUnBlockCustomer(obj);
       console.log(res)
    }
    catch(err){
        console.log(err);
        toast({title:"Block Customer Failed.", description:err?.response?.data?.message || err?.message, variant:"destructive"})
       }
       finally{
        setBlockLoading(false);
        setBlockDetailOpen(false);
        setBlockListRefresh(true);
       }
  }

  const handleGetBlockCustomerList = async() => {
       try{
         const res = await getAllBlockCustomerList();
         console.log(res)
         if(res.status===200){
          // setBlockCustomerList(res?.data?.blockList);
          dispatch(setBlockCustomerList(res?.data?.blockList));
          setBlockListRefresh(false);
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      if( blockListRefresh){
      handleGetBlockCustomerList()
      }
    },[blockListRefresh])
  
    const handleGetCustomer = async() => {
       try{
         const res = await getAllCustomer();
         console.log(res)
         if(res.status===200){
          dispatch(setCustomerList(res?.data?.data));
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      if(customerList?.length===0 || blockListRefresh)
     { 
      handleGetCustomer()
     }
    },[blockListRefresh, customerList?.length])
  
  return (
    <>
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex  gap-4">
        <div className="relative w-[225px] md:w-[780px] ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card className='w-[360px] md:w-full'>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-[357px] md:w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-3 md:px-6 text-sm text-muted-foreground">Customer</th>
                  <th className="text-left py-4 px-3 md:px-6 text-sm text-muted-foreground">Orders</th>
                  <th className="text-left py-4 px-3 md:px-6 text-sm text-muted-foreground hidden md:table-cell">Total Spent</th>
                  <th className="text-left py-4 px-3 md:px-6 text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-3 md:-6 text-sm text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="text-left py-4 px-3 md:px-6 text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const isBlocked = blockCustomerList.find((v)=> v?.user===customer?.user);
                  return(
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={()=>{setIsBlock(isBlocked?true:false);setSelectedCustomer(customer);setCustomerDetailOpen(true)}}
                  >
                    <td className="py-4 px-3 md:px-6">
                      <div>
                        <p className="text-sm font-medium">{customer?.shippingAddress?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer?.shippingAddress?.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-3 md:px-6 text-sm">{customer?.orderItems?.length}</td>

                    <td className="py-4 px-3 md:px-6 text-sm font-medium hidden md:table-cell">
                      ₹{customer?.totalAmount}
                    </td>

                    <td className="py-4 px-3 md:px-6">
                      <Badge variant={getStatusVariant(isBlocked?"blocked":"active")}>
                        {isBlocked?"Block":"Active"}
                      </Badge>
                    </td>

                    <td className="py-4 px-3 md:px-6 text-sm text-muted-foreground hidden md:table-cell">
                      {formatDate(customer?.createdAt)}
                    </td>

                    <td className="py-4 px-3 md:px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e)=>{e.stopPropagation();setIsBlock(isBlocked?true:false);setSelectedCustomer(customer);setCustomerDetailOpen(true)}} className='cursor-pointer'>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {e.stopPropagation();setIsBlock(isBlocked?true:false);setSelectedCustomer(customer);setBlockDetailOpen(true)}} className='cursor-pointer'>
                            <UserX className="h-4 w-4 mr-2 " />
                           {isBlocked?"UnBlock":"Block"} Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )}
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
   <Dialog open={blockDetailOpen} onOpenChange={setBlockDetailOpen}>
  <DialogContent>
    <DialogHeader >
      <DialogTitle className='flex'>{isBlock?"UnBlock":"Block"} Customer</DialogTitle>
      <DialogDescription className='flex'>
        Please provide the details before {isBlock?"UnBlock":"Block"} this customer.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 mt-4">

      {/* Block Date */}
      <div>
        <label className="text-sm font-medium">Customer Name</label>
        <input
          type="text"
          value={selectedCustomer?.shippingAddress?.name}
          className="w-full border rounded-md px-3 py-2 mt-1"
          readOnly
        />
      </div>
      <div>
        <label className="text-sm font-medium">{isBlock?"UnBlock":"Block"} Date</label>
        <input
          type="date"
          defaultValue={currentDate}
          className="w-full border rounded-md px-3 py-2 mt-1"
          readOnly
        />
      </div>

      {/* Reason */}
      <div>
        <label className="text-sm font-medium">Reason</label>
        <textarea
          placeholder={`Enter reason for ${isBlock?"UnBlock":"Block"} this customer...`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mt-1 min-h-[100px]"
        />
      </div>

      {/* Button */}
      <div className="flex justify-end">
        <button
        disabled={blockLoading || !reason}
        onClick={handleBlockAndUnBlockCustomer}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-4 py-2 rounded-md"
        >
          {blockLoading && <Loader2 className='animate-spin h-4 w-4 text-center' />}
          {isBlock?"UnBlock":"Block"} Customer
        </button>
      </div>

    </div>
  </DialogContent>
</Dialog>
   <Sheet open={customerDetailOpen} onOpenChange={setCustomerDetailOpen}>
  <SheetContent className="overflow-y-auto md:w-[500px]">
    <SheetHeader>
      <SheetTitle className='flex justify-between mt-4'>
        <span>Customer Detail</span>
        <div> <Badge variant={getStatusVariant(isBlock?"blocked":"active")}>
                        {isBlock?"Block":"Active"} </Badge></div>
      </SheetTitle>
      <SheetDescription className='flex'>Order Information</SheetDescription>
    </SheetHeader>

    {selectedCustomer && (
      <div className="mt-6 space-y-6">

        {/* Customer Info */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Customer Info</h3>
          <p><b>Name:</b> {selectedCustomer.shippingAddress?.name}</p>
          <p><b>Email:</b> {selectedCustomer.shippingAddress?.email}</p>
          <p><b>Phone:</b> {selectedCustomer.shippingAddress?.phone}</p>
        </div>

        {/* Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
          <p>{selectedCustomer.shippingAddress?.address}</p>
          <p>{selectedCustomer.shippingAddress?.city}</p>
        </div>

        {/* Order Items */}
        <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-3">Order Items</h3>

          {selectedCustomer.orderItems?.map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b py-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} | Price: ₹{item.price}
                </p>
                <p className="text-sm text-gray-500">
                  Discount: {item.discount} {item.discountType==="percentage"?"%" :"₹"}
                </p>
              </div>

              <div className="font-semibold">
                ₹{item.finalPrice}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Payment Info</h3>
          <p><b>Method:</b> {selectedCustomer.paymentMethod}</p>
          <p><b>Status:</b> {selectedCustomer.paymentStatus}</p>
          <p><b>Order Status:</b> {selectedCustomer.orderStatus}</p>
        </div>

        {/* Price Summary */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Price Summary</h3>
          <p>Subtotal: ₹{selectedCustomer.subtotal}</p>
          <p>Tax: ₹{selectedCustomer.tax}</p>
          <p>Shipping: ₹{selectedCustomer.shippingCharge}</p>
          <p className="font-bold text-lg">
            Total: ₹{selectedCustomer.totalAmount}
          </p>
        </div>

      </div>
    )}
  </SheetContent>
</Sheet>
    </>
  );
};

export default AdminCustomers;
