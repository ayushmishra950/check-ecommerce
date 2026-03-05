import { useEffect, useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {getAllOrder} from "@/services/service";
import {formatDate} from "@/services/allFunction";

const orders = [
  { id: '#ORD-001', customer: 'John Doe', email: 'john@example.com', items: 3, total: 299.99, status: 'delivered', date: '2024-01-20' },
  { id: '#ORD-002', customer: 'Jane Smith', email: 'jane@example.com', items: 1, total: 149.99, status: 'processing', date: '2024-01-19' },
  { id: '#ORD-003', customer: 'Mike Johnson', email: 'mike@example.com', items: 2, total: 449.99, status: 'shipped', date: '2024-01-18' },
  { id: '#ORD-004', customer: 'Sarah Wilson', email: 'sarah@example.com', items: 4, total: 199.99, status: 'pending', date: '2024-01-17' },
  { id: '#ORD-005', customer: 'Tom Brown', email: 'tom@example.com', items: 1, total: 329.99, status: 'delivered', date: '2024-01-16' },
  { id: '#ORD-006', customer: 'Emily Davis', email: 'emily@example.com', items: 2, total: 259.99, status: 'cancelled', date: '2024-01-15' },
];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'delivered': return 'default';
    case 'processing': return 'secondary';
    case 'pending': return 'outline';
    case 'shipped': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderList, setOrderList] = useState([]);

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

  console.log(filteredOrders)

  return (
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
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
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
                      <Badge variant={getStatusVariant(order.orderStatus)}>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
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
  );
};

export default AdminOrders;
