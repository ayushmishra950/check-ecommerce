import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {getDashboardSummary,getAllOrder,  getDashboardOverview} from "@/services/service";
import { useEffect, useState } from 'react';
import {setDashboardSummary, setDashboardOverview} from "@/redux-toolkit/slice/dashboardSlice";
import {setOrderList} from "@/redux-toolkit/slice/orderSlice";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';

const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4500 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 5500 },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', total: 299.99, status: 'delivered' },
  { id: '#ORD-002', customer: 'Jane Smith', total: 149.99, status: 'processing' },
  { id: '#ORD-003', customer: 'Mike Johnson', total: 449.99, status: 'shipped' },
  { id: '#ORD-004', customer: 'Sarah Wilson', total: 199.99, status: 'pending' },
  { id: '#ORD-005', customer: 'Tom Brown', total: 329.99, status: 'delivered' },
];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'delivered': return 'default';
    case 'processing': return 'secondary';
    case 'pending': return 'outline';
    case 'shipped': return 'secondary';
    default: return 'outline';
  }
};

const AdminDashboard = () => {
  // const [dashboardSummary,setDashboardSummary] = useState(null);
  // const [dashboardOverview, setDashboardOverview] = useState(null);
  //  const [orderList, setOrderList] = useState([]);
   const dispatch = useAppDispatch();
   const dashboardSummary = useAppSelector((state)=> state?.dashboard?.dashboardSummary);
   const dashboardOverview = useAppSelector((state)=> state?.dashboard?.dashboardOverview);
   const orderList = useAppSelector((state)=> state?.order?.orderList);
 
  const handleGetDashboardSummary = async() => {
    try{
     const res = await getDashboardSummary();
     console.log(res)
     if(res.status===200){
      // setDashboardSummary(res?.data?.data);
      dispatch(setDashboardSummary(res?.data?.data))
     }
    }
    catch(err){
      console.log(err);
    }
  }
  useEffect(()=>{
    if(dashboardSummary === null){
      handleGetDashboardSummary();
    }
  },[dashboardSummary])


  const handleGetDashboardOverview = async() => {
    try{
     const res = await getDashboardOverview();
     console.log(res);
     if(res.status===200){
      // setDashboardOverview(res?.data?.data)
      dispatch(setDashboardOverview(res?.data?.data));
     }
    }
    catch(err){
      console.log(err);
    }
  }
  useEffect(()=>{
        if(dashboardOverview===null){
          handleGetDashboardOverview();
        }
  },[dashboardOverview])


  const handleGetOrder = async() => {
       try{
         const res = await getAllOrder();
         console.log(res)
         if(res.status===200){
          // setOrderList(res.data?.data)
          dispatch(setOrderList(res?.data?.data));
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      if(orderList?.length===0){
 handleGetOrder()
      }
    },[orderList?.length])


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
     <div className="flex flex-col md:flex-row w-[370px] md:w-full gap-6">
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">₹{dashboardSummary?.revenue?.total}</p>
          <div className="flex items-center gap-1 mt-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">This Month’s Revenue: ₹{dashboardSummary?.revenue?.currentMonth}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <IndianRupee className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-foreground mt-1">{dashboardSummary?.orders?.total}</p>
          <div className="flex items-center gap-1 mt-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Orders This Month: {dashboardSummary?.orders?.currentMonth}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold text-foreground mt-1">{dashboardSummary?.customers?.total}</p>
          <div className="flex items-center gap-1 mt-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">New Customers This Month: {dashboardSummary?.customers?.currentMonth}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground mt-1">{dashboardSummary?.products?.total}</p>
          <div className="flex items-center gap-1 mt-2 text-destructive">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">Products Added This Month: {dashboardSummary?.products?.currentMonth}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* Charts */}
      <div className="grid lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Order ID</th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {orderList.slice(0,8).map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2 md:px-4 text-sm font-medium text-foreground hidden md:table-cell">ORD-{new Date().getFullYear()}-{order._id.slice(-4)}</td>
                    <td className="py-3 px-2 md:px-4 text-sm text-muted-foreground">{order.user?.name}</td>
                    <td className="py-3 px-2 md:px-4 text-sm font-medium text-foreground">₹{order.totalAmount}</td>
                    <td className="py-3 px-2 md:px-4">
                      <Badge variant={getStatusVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      <button className="text-primary hover:underline text-sm flex items-center gap-1">
                        View <ArrowUpRight className="h-3 w-3" />
                      </button>
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

export default AdminDashboard;
