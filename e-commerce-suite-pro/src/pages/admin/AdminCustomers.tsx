import { useEffect, useState } from 'react';
import { Search, Eye, MoreHorizontal, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerList, setCustomerList] = useState([]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  
    const handleGetCustomer = async() => {
       try{
         const res = await getAllOrder();
         console.log(res)
         if(res.status===200){
          setCustomerList(res.data?.data)
         }
       }
       catch(err){
        console.log(err);
       }
    }
    useEffect(()=>{
      handleGetCustomer()
    },[])
  

  return (
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
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm">{customer.orders}</td>

                    <td className="py-4 px-6 text-sm font-medium">
                      ${customer.totalSpent}
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={getStatusVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {customer.joined}
                    </td>

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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="h-4 w-4 mr-2" />
                            Block Customer
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
  );
};

export default AdminCustomers;
