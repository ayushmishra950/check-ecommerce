import { useEffect, useState } from 'react';
import { Search, Eye, MoreHorizontal, UserX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {getAllCustomer, blockAndUnBlockCustomer, getAllBlockCustomerList} from "@/services/service";
import {formatDate} from "@/services/allFunction";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';

const customers = [
  {
    id: '#CUST-001',
    name: 'John Doe',
    email: 'john@example.com',
    orders: 5,
    totalSpent: 1299.99,
    status: 'active',
    joined: '2023-12-10',
  },
  {
    id: '#CUST-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    orders: 2,
    totalSpent: 349.99,
    status: 'inactive',
    joined: '2024-01-05',
  },
  {
    id: '#CUST-003',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    orders: 8,
    totalSpent: 2299.99,
    status: 'active',
    joined: '2023-11-22',
  },
];

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
  const [customerList, setCustomerList] = useState([]);
  const [blockCustomerList, setBlockCustomerList] = useState([]);
  const [customerDetailOpen,setCustomerDetailOpen] = useState(false);
    const [blockDetailOpen,setBlockDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [blockListRefresh, setBlockListRefresh] = useState(false);
  const [isBlock, setIsBlock] = useState(false);
const [reason, setReason] = useState("");
const[blockLoading, setBlockLoading] = useState(false);
const currentDate = new Date().toISOString().split("T")[0];

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
          setBlockCustomerList(res?.data?.blockList);
          setBlockListRefresh(false);
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      if(blockListRefresh || blockCustomerList?.length === 0){
      handleGetBlockCustomerList()
      }
    },[blockListRefresh, blockCustomerList.length])
  
    const handleGetCustomer = async() => {
       try{
         const res = await getAllCustomer();
         console.log(res)
         if(res.status===200){
          setCustomerList(res?.data?.data)
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      handleGetCustomer()
    },[])
  
  console.log(selectedCustomer)
  return (
    <>
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Customer</th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Orders</th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Total Spent</th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Joined</th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">Actions</th>
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
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium">{customer?.shippingAddress?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer?.shippingAddress?.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm">{customer?.orderItems?.length}</td>

                    <td className="py-4 px-6 text-sm font-medium">
                      ₹{customer?.totalAmount}
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={getStatusVariant(isBlocked?"blocked":"active")}>
                        {isBlocked?"Block":"Active"}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDate(customer?.createdAt)}
                    </td>

                    <td className="py-4 px-6">
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
    <DialogHeader>
      <DialogTitle>{isBlock?"UnBlock":"Block"} Customer</DialogTitle>
      <DialogDescription>
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
  <SheetContent className="overflow-y-auto w-[500px]">
    <SheetHeader>
      <SheetTitle className='flex justify-between mt-4'>
        <span>Customer Detail</span>
        <div> <Badge variant={getStatusVariant(isBlock?"blocked":"active")}>
                        {isBlock?"Block":"Active"} </Badge></div>
      </SheetTitle>
      <SheetDescription>Order Information</SheetDescription>
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
        <div className="border rounded-lg p-4">
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
