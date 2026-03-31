import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, CreditCard, Calendar } from "lucide-react";
import { getOrder } from "@/services/service";
import { useToast } from "@/hooks/use-toast";
import OrderProductDetailModal, { OrderProduct } from "@/card/OrderProductDetailModal";
import {getStatusColorFromOrder} from "@/services/allFunction";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook";
import { setMyOrderList } from "@/redux-toolkit/slice/orderSlice";
import socket from "@/socket/socket";

type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled" | "Returned";
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
};

const dummyOrders: Order[] = [
  {
    id: "ORD12345",
    date: "2026-02-15",
    status: "Delivered",
    total: 2499,
    items: [
      {
        id: "1",
        name: "Wireless Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        price: 1999,
        quantity: 1,
      },
      {
        id: "2",
        name: "Phone Case",
        image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=500",
        price: 500,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
    },
    paymentMethod: "Credit Card ****4532",
    trackingNumber: "TRK9876543210",
  },
  {
    id: "ORD67890",
    date: "2026-02-10",
    status: "Processing",
    total: 1299,
    items: [
      {
        id: "3",
        name: "Bluetooth Speaker",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        price: 1299,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
    },
    paymentMethod: "UPI - Google Pay",
  },
  {
    id: "ORD54321",
    date: "2026-02-08",
    status: "Shipped",
    total: 4999,
    items: [
      {
        id: "4",
        name: "Smart Watch",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        price: 4999,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "456 Park Street",
      city: "Delhi",
      state: "Delhi",
      zip: "110001",
    },
    paymentMethod: "Debit Card ****8765",
    trackingNumber: "TRK1234567890",
  },
  {
    id: "ORD11111",
    date: "2026-02-05",
    status: "Cancelled",
    total: 799,
    items: [
      {
        id: "5",
        name: "USB Cable",
        image: "https://images.unsplash.com/photo-1591290619762-d1c8d27a2f8e?w=500",
        price: 799,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
    },
    paymentMethod: "Cash on Delivery",
  },
  {
    id: "ORD22222",
    date: "2026-01-28",
    status: "Delivered",
    total: 15999,
    items: [
      {
        id: "6",
        name: "Gaming Mouse",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
        price: 2999,
        quantity: 1,
      },
      {
        id: "7",
        name: "Mechanical Keyboard",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
        price: 8999,
        quantity: 1,
      },
      {
        id: "8",
        name: "Mouse Pad",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
        price: 999,
        quantity: 1,
      },
      {
        id: "9",
        name: "Gaming Headset",
        image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=500",
        price: 3499,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "789 Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560001",
    },
    paymentMethod: "Credit Card ****4532",
    trackingNumber: "TRK5555555555",
  },
  {
    id: "ORD33333",
    date: "2026-01-20",
    status: "Returned",
    total: 2499,
    items: [
      {
        id: "10",
        name: "Laptop Stand",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        price: 2499,
        quantity: 1,
      },
    ],
    shippingAddress: {
      name: "Ayush Mishra",
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
    },
    paymentMethod: "UPI - PhonePe",
  },
];

const getStatusConfig = (status: Order["status"]) => {
  const configs = {
    Delivered: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
      dotColor: "bg-emerald-500",
    },
    Processing: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Package,
      dotColor: "bg-amber-500",
    },
    Shipped: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Truck,
      dotColor: "bg-blue-500",
    },
    Cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      dotColor: "bg-red-500",
    },
    Returned: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: Package,
      dotColor: "bg-gray-500",
    },
  };
  return configs[status];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OrdersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "price-desc" | "price-asc">("date-desc");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  // const [orderList, setOrderList] = useState([]);
  const [orderListRefresh, setOrderListRefresh] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderProduct | undefined>(undefined);
  const dispatch = useAppDispatch();
  const orderList = useAppSelector((state)=> state?.order?.singleOrderList);

  const openProductModal = (order: any, item: any) => {
    const productData: OrderProduct = {
      id: item.product?._id || item._id,
      productName: item.product?.name || item.name,
      brand: item.product?.brand || "Brand",
      image: item.product?.images?.[0] || item.product?.image || item.image,
      description: item.product?.description || "High quality product.",
      price: item.finalPrice || item.price,
      quantity: item.quantity,
      orderId: order._id,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      status: order.orderStatus?.toLowerCase() || "placed",
      paymentMethod: order.paymentMethod,
      address: order.shippingAddress?.address || "Address",
      city: order.shippingAddress?.city,
      zipCode: order.shippingAddress?.postalCode || order.shippingAddress?.zip,
      deliveryDate: "Expected in 5-7 days",
      trackingNumber: order.trackingNumber || "N/A",
      discount: (item.price - item.finalPrice) || 0,
      shipping: order.shippingCharge || 0,
      tax: order.tax || 0,
    };
    setSelectedProduct(productData);
    setIsProductModalOpen(true);
  };
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orderList;

    // Filter by search term (Order ID or Product Name)
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderItems.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "price-desc":
          return b.total - a.total;
        case "price-asc":
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return sorted;
  }, [orderList, searchTerm, statusFilter, sortBy]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const statusCounts = useMemo(() => {
    return {
      All: dummyOrders.length,
      Processing: dummyOrders.filter((o) => o.status === "Processing").length,
      Shipped: dummyOrders.filter((o) => o.status === "Shipped").length,
      Delivered: dummyOrders.filter((o) => o.status === "Delivered").length,
      Cancelled: dummyOrders.filter((o) => o.status === "Cancelled").length,
      Returned: dummyOrders.filter((o) => o.status === "Returned").length,
    };
  }, []);


  useEffect(()=>{
    socket.on("orderStatusUpdate", () => {
      setOrderListRefresh(true);
    });

    return () =>{
      socket.off("orderStatusUpdate");
    }
  },[])



  const handleGetOrder = async () => {
    try {
      const res = await getOrder();
      console.log(res);
      if (res.status === 200) {
        // setOrderList(res?.data?.updatedOrders);
        dispatch(setMyOrderList(res?.data?.updatedOrders));
  
        setOrderListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error Cart.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    if (orderList?.length === 0 || orderListRefresh) {
      handleGetOrder();
    }
  }, [orderList?.length, orderListRefresh])


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Track, manage and view all your orders</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID or Product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-desc">Highest Price</option>
                <option value="price-asc">Lowest Price</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(["All", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${statusFilter === status
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {status} ({statusCounts[status]})
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredAndSortedOrders?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders?.map((order) => {
              const statusConfig = getStatusConfig(order?.status);
              // const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrderId === order?._id;

              return (
                <div
                  key={order?._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Order Header */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">ORD-{order?._id?.slice(-4)}</h3>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig?.color}`}>
                            <div className={`w-2 h-2 rounded-full ${statusConfig?.dotColor} animate-pulse`} />
                            {/* <StatusIcon className="w-4 h-4" /> */}
                            <span><Badge className={getStatusColorFromOrder(order?.orderStatus)}>{order?.orderStatus}</Badge></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order?.createdAt)}</span>
                          </div>
                          {order?.trackingNumber && (
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-4 h-4" />
                              <span className="font-mono text-xs">{order?.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">₹{order?.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order?.orderItems?.map((item, index) => (
                        <div
                          key={item._id}
                          onClick={() => openProductModal(order, item)}
                          className={`flex items-center gap-4 cursor-pointer hover:bg-gray-50/80 p-2 rounded-xl transition-all ${index !== order?.orderItems?.length - 1 ? "pb-4 border-b border-gray-100" : ""
                            }`}
                        >
                          <div className="relative group/img">
                            <img
                              src={item?.product?.images?.[0]}
                              alt={item?.product?.name}
                              className="w-20 h-20 rounded-xl object-cover ring-2 ring-gray-100 group-hover/img:ring-blue-400 transition-all"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-xl transition-all" />

                            {/* Discount Badge */}
                            {item?.product?.discount > 0 && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md">
                                {item.product.discount}{item?.discountType === "percentage" ? "%" : "₹"} OFF
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {item?.product?.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Qty: <span className="font-medium text-gray-700">{item?.quantity}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {/* Discounted Price */}
                              <p className="text-lg font-bold text-gray-900">
                                ₹{item?.finalPrice?.toLocaleString()}
                              </p>
                            </div>
                            {item?.quantity > 1 && (
                              <p className="text-xs text-gray-500">₹{(item?.price / item?.quantity).toLocaleString()} each</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>Shipping Address</span>
                          </div>
                          <div className="pl-7 space-y-1 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            <span>Payment Method</span>
                          </div>
                          <div className="pl-7 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all group/btn"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 group-hover/btn:translate-y-[2px] transition-transform" />
                      )}
                    </button>

                    {order.status === "Delivered" && (
                      <button className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Re-order
                      </button>
                    )}
                    {order.status === "Shipped" && (
                      <button className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">
                        Track Order
                      </button>
                    )}
                    {order.status === "Processing" && (
                      <button className="px-5 py-2.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {filteredAndSortedOrders.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredAndSortedOrders.length} of {dummyOrders.length} orders
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <OrderProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        data={selectedProduct}
      />
    </div>
  );
};

export default OrdersPage;
