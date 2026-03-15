import { useEffect, useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {getAllOrder, updateOrderStatus} from "@/services/service";
import {formatDate} from "@/services/allFunction";
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter} from "@/components/ui/dialog";
import {orderStages, getStatusColorFromOrder} from "@/services/allFunction";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';


const orders = [
  { id: '#ORD-001', customer: 'John Doe', email: 'john@example.com', items: 3, total: 299.99, status: 'delivered', date: '2024-01-20' },
  { id: '#ORD-002', customer: 'Jane Smith', email: 'jane@example.com', items: 1, total: 149.99, status: 'processing', date: '2024-01-19' },
  { id: '#ORD-003', customer: 'Mike Johnson', email: 'mike@example.com', items: 2, total: 449.99, status: 'shipped', date: '2024-01-18' },
  { id: '#ORD-004', customer: 'Sarah Wilson', email: 'sarah@example.com', items: 4, total: 199.99, status: 'pending', date: '2024-01-17' },
  { id: '#ORD-005', customer: 'Tom Brown', email: 'tom@example.com', items: 1, total: 329.99, status: 'delivered', date: '2024-01-16' },
  { id: '#ORD-006', customer: 'Emily Davis', email: 'emily@example.com', items: 2, total: 259.99, status: 'cancelled', date: '2024-01-15' },
];


const AdminOrders = () => {
  const {toast} = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderList, setOrderList] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const filteredOrders = orderList.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.name.toLowerCase().includes(searchQuery.toLowerCase())||
       order.shippingAddress?.phone.toLowerCase().includes(searchQuery.toLowerCase())||
        order.shippingAddress?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGetOrder = async() => {
     try{
       const res = await getAllOrder();
       console.log(res)
       if(res.status===200){
        setOrderList(res.data?.data)
       }
     }
     catch(err){
      console.log(err);
     }
  }
  useEffect(()=>{
    handleGetOrder()
  },[])

  const handleUpdateOrderStatus = async(id?:string, status?:string)=>{
   const finalOrderId = id || orderId;
  const finalStatus = status || currentStatus;

  let obj = { status: finalStatus, orderId: finalOrderId };
    try{
      setIsLoading(true);
      const res = await updateOrderStatus(obj);
      console.log(res);
      if(res.status===200){
        handleGetOrder();
        toast({title:"Order Status Updated.", description:`${(id && status)?"Order Cancelled Successfully." : "Order Updated Successfully." }`})
      }
    }
    catch(err){
      console.log(err);
      toast({title:"Update Order Status Failed.", description:err?.response?.data?.message|| err?.message, variant : "destructive"})

    }
    finally{
      setIsLoading(false);
      setStatusDialogOpen(false);
      setCurrentStatus("");
    }
  }
  console.log(orderData)
  return (
    <>
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={()=>{setOrderData(order); setOrderDialogOpen(true)}}>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">ORD-{new Date().getFullYear()}-{i+1}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.shippingAddress?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.shippingAddress?.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{order.orderItems?.length} items</td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">${order.subtotal}</td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColorFromOrder(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className='cursor-pointer'onClick={()=>{setOrderData(order); setOrderDialogOpen(true)}} >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        { order?.orderStatus !== "cancelled" && 
                        <>
                          <DropdownMenuItem onClick={(e)=>{e.stopPropagation(); setOrderId(order?._id);setCurrentStatus(order?.orderStatus);setStatusDialogOpen(true)}} className='cursor-pointer'>Update Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={(e)=>{e.stopPropagation(); handleUpdateOrderStatus(order?._id, "cancelled");}}>Cancel Order</DropdownMenuItem>
                     </>
                       }
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
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
  <DialogContent>
    
    <DialogHeader>
      <DialogTitle>Update Order Status</DialogTitle>
      <DialogDescription>
        Update the current status of this order to reflect its latest progress. 
        Select the appropriate stage from the list below and confirm to save the changes.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-2">
      <Label>Order Status</Label>

      <Select
        value={currentStatus}
        onValueChange={(value) => setCurrentStatus(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select order status" />
        </SelectTrigger>

        <SelectContent>
          {orderStages?.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {stage}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <DialogFooter>
      <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
        Cancel
      </Button>

      <Button type="button" variant="default" onClick={()=> {handleUpdateOrderStatus()}} disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Status"}
        {isLoading && <Loader2 className='animate-spin' />}
      </Button>
    </DialogFooter>

  </DialogContent>
</Dialog>

<Sheet open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
  <SheetContent className="overflow-y-auto w-[420px] sm:w-[540px]">

    <SheetHeader>
      <SheetTitle>Order Details</SheetTitle>
      <SheetDescription>
        Complete information about this order
      </SheetDescription>
    </SheetHeader>

    {orderData && (
      <div className="mt-6 space-y-6">

        {/* Order Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Order Info</h3>

          <div className="text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Order ID:</span> {orderData._id}</p>
            <p><span className="font-medium text-foreground">Status:</span>  <Badge className={getStatusColorFromOrder(orderData.orderStatus)}> {orderData.orderStatus}</Badge></p>
            <p><span className="font-medium text-foreground">Payment Method:</span> {orderData.paymentMethod}</p>
            <p><span className="font-medium text-foreground">Payment Status:</span> {orderData.paymentStatus}</p>
            <p><span className="font-medium text-foreground">Created:</span> {new Date(orderData.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Customer</h3>

          <div className="text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Name:</span> {orderData.user?.name}</p>
            <p><span className="font-medium text-foreground">Email:</span> {orderData.user?.email}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Shipping Address</h3>

          <div className="text-sm text-muted-foreground">
            <p>{orderData.shippingAddress?.name}</p>
            <p>{orderData.shippingAddress?.phone}</p>
            <p>{orderData.shippingAddress?.email}</p>
            <p>{orderData.shippingAddress?.address}</p>
            <p>{orderData.shippingAddress?.city}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Items</h3>

          <div className="space-y-3">
            {orderData.orderItems?.map((item:any) => (
              <div
                key={item._id}
                className="border rounded-lg p-3 flex justify-between"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>

                  {item.discount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Discount: {item.discount} {item.discountType}
                    </p>
                  )}
                </div>

                <div className="text-sm font-medium">
                  ₹{item.finalPrice}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Price Summary</h3>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{orderData.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{orderData.tax}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{orderData.shippingCharge}</span>
            </div>

            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>₹{orderData.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>
    )}

  </SheetContent>
</Sheet>
    </>
  );
};

export default AdminOrders;
