// import { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux-toolkit/store/store";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { useNavigate } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";
// import { getCart } from "@/services/service";
// import { calculateDiscount } from "@/services/allFunction";

// interface ShippingAddress {
//   fullName: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
// }

// const Checkout = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const items = useSelector((state: RootState) => state.cart.cartList);
//   const [cartList, setCartList] = useState([]);
//   const [cartListRefresh, setCartListRefresh] = useState(false);
//   const [shipping, setShipping] = useState<ShippingAddress>({
//     fullName: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "",
//   });
//   const [cartSummary, setCartSummary] = useState({
//     subtotal: 0,
//     tax: 0,
//     shipping: 0,
//     totalPrice: 0,
//     taxBreakdown: []
//   });

//   const handleGetCart = async () => {
//     try {
//       const res = await getCart();
//       console.log(res);
//       if (res.status === 200) {
//         setCartList(res?.data?.cart?.items);
//         setCartSummary({
//           subtotal: res?.data?.cart?.subtotal || 0,
//           tax: res?.data?.cart?.tax || 0,
//           shipping: res?.data?.cart?.shipping || 0,
//           totalPrice: res?.data?.cart?.totalPrice || 0,
//           taxBreakdown: res?.data?.cart?.taxBreakdown || [],
//         });
//         setCartListRefresh(false);
//       }
//     }
//     catch (err) {
//       console.log(err);
//       toast({ title: "Error Cart.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
//     }
//   }

//   useEffect(() => {
//     if (cartList?.length === 0 || cartListRefresh) {
//       handleGetCart();
//     }
//   }, [cartList?.length, cartListRefresh])


//   // 🔹 Handle Input Change
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setShipping({
//       ...shipping,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // 🔹 Price Calculation
//   const subtotal = cartList?.reduce(
//     (sum, item) => sum + item.totalPrice,
//     0
//   );

//   const shippingCost = subtotal > 1000 ? 0 : 99;
//   const tax = subtotal * 0.08;
//   const grandTotal = subtotal + shippingCost + tax;

//   // 🔹 Place Order
//   const handlePlaceOrder = () => {
//     if (
//       !shipping.fullName ||
//       !shipping.phone ||
//       !shipping.address ||
//       !shipping.city
//     ) {
//       alert("Please fill all required fields");
//       return;
//     }

//     console.log("Shipping Data:", shipping);
//     console.log("Order Items:", items);

//     alert("Order Placed Successfully!");
//     navigate("/ordersuccess");
//   };

//   if (cartList.length === 0) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-2xl font-bold mb-4">
//           No items to checkout
//         </h2>
//         <Button onClick={() => navigate("/products")}>
//           Go Shopping
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">
//         Checkout
//       </h1>

//       <div className="grid lg:grid-cols-3 gap-8">

//         {/* 🔹 Left Section */}
//         <div className="lg:col-span-2 space-y-6">

//           {/* Shipping Address */}
//           <Card>
//             <CardContent className="p-6 space-y-4">
//               <h2 className="text-xl font-semibold">
//                 Shipping Address
//               </h2>

//               <Input
//                 name="fullName"
//                 placeholder="Full Name"
//                 value={shipping.fullName}
//                 onChange={handleChange}
//               />

//               <Input
//                 name="phone"
//                 placeholder="Phone Number"
//                 value={shipping.phone}
//                 onChange={handleChange}
//               />

//               <Input
//                 name="address"
//                 placeholder="Street Address"
//                 value={shipping.address}
//                 onChange={handleChange}
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <Input
//                   name="city"
//                   placeholder="City"
//                   value={shipping.city}
//                   onChange={handleChange}
//                 />
//                 <Input
//                   name="state"
//                   placeholder="State"
//                   value={shipping.state}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <Input
//                   name="postalCode"
//                   placeholder="Postal Code"
//                   value={shipping.postalCode}
//                   onChange={handleChange}
//                 />
//                 <Input
//                   name="country"
//                   placeholder="Country"
//                   value={shipping.country}
//                   onChange={handleChange}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Order Items */}
//           <Card>
//             <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
//               <h2 className="text-xl font-semibold">
//                 Order Items
//               </h2>

//               {cartList?.map((item) => (
//                 <div
//                   key={item._id}
//                   className="flex justify-between"
//                 >
//                   <div>
//                     {item.product?.name} × {item.quantity}
//                   </div>
//                   <div>
//                     ₹{item.price * item.quantity}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>

//         {/* 🔹 Right Section - Summary */}
//         <div>
//           <Card className="sticky top-24">
//             <CardContent className="p-6 space-y-4">
//               <h2 className="text-xl font-semibold">
//                 Order Summary
//               </h2>

//               <div className="flex justify-between">
//                 <span>Subtotal({cartList.length} items)</span>
//                 <span>₹{cartSummary.subtotal.toLocaleString()}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span>Shipping</span>
//                 <span>
//                   {cartSummary?.shipping === 0
//                     ? "Free"
//                     : `₹${cartSummary?.shipping}`}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span>Tax</span>
//                 <span>₹{cartSummary?.tax}</span>
//               </div>
//               <div className="flex justify-between text-green-600">
//                 <span>Discount</span>
//                 <span>- ₹{cartList.reduce((acc, item) => acc + (calculateDiscount(item.product) * (item.quantity || 0)), 0).toLocaleString()}</span>
//               </div>

//               <Separator />

//               <div className="flex justify-between text-lg font-bold">
//                 <span>Total</span>
//                 <span className="text-yellow-600">₹{(cartSummary.totalPrice - cartList.reduce((acc, item) => acc + (calculateDiscount(item.product) * (item.quantity || 0)), 0)).toFixed(2)}</span>
//               </div>

//               <Button
//                 className="w-full"
//                 size="lg"
//                 onClick={handlePlaceOrder}
//               >
//                 Place Order
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Checkout;


























import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getCart, addOrder, getOrderById } from "@/services/service";
import { calculateDiscount } from "@/services/allFunction";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {user} = useAuth();
  const items = useSelector((state: RootState) => state.cart.cartList);
  const [cartList, setCartList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    totalPrice: 0,
    totalDiscount: 0,
    taxBreakdown: [],
  });
  const [shipping, setShipping] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [userAddressData, setUserAddressData] = useState(null);


  // 🔹 Fetch cart from backend
  const handleGetCart = async () => {
    try {
      const res = await getCart();
      if (res.status === 200) {
        const cartData = res.data.cart;
        setCartList(cartData.items || []);
        setCartSummary({
          subtotal: cartData.subtotal || 0,
          tax: cartData.tax || 0,
          shipping: cartData.shipping || 0,
          totalPrice: cartData.totalPrice || 0,
          totalDiscount: cartData.totalDiscount || 0,
          taxBreakdown: cartData.taxBreakdown || [],
        });
      }
    } catch (err: any) {
      console.log(err);
      toast({
        title: "Error Cart.",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (cartList.length === 0) handleGetCart();
  }, []);

  const handleGetUserAddress = async() => {
    try{
       const res = await getOrderById();
       console.log(res);
       if(res.status===200 && user?.id===res?.data?.order?.user){
        setUserAddressData(res.data?.order?.shippingAddress)
       }
    }
    catch(err){
      console.log(err);
    }
  }
  useEffect(()=>{
    handleGetUserAddress()
  },[]);
 
  const handleUseOldAddress = () => {
  if (userAddressData) {
    setShipping(userAddressData);
  }
};
  

  // 🔹 Shipping input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // 🔹 Place order
  const handlePlaceOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await addOrder(shipping, "COD");
      console.log(res);
      if (res.status === 201) {
        toast({
          title: "Success",
          description: res?.data?.message,
        });

        navigate("/ordersuccess");
      }
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive"
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  if (cartList.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">No items to checkout</h2>
        <Button onClick={() => navigate("/products")}>Go Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Shipping Address</h2>
              <Input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} />
              <Input name="phone" placeholder="Phone" value={shipping.phone} onChange={handleChange} />
              <Input name="address" placeholder="Street Address" value={shipping.address} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                <Input name="city" placeholder="City" value={shipping.city} onChange={handleChange} />
                <Input name="state" placeholder="State" value={shipping.state} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="postalCode" placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange} />
                <Input name="country" placeholder="Country" value={shipping.country} onChange={handleChange} />
              </div>
            { userAddressData !== null &&  <div className="flex justify-end" onClick={handleUseOldAddress}>
               <Button>Use Old Address</Button>
              </div>}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <h2 className="text-xl font-semibold">Order Items</h2>
              {cartList.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <div>{item.product?.name} × {item.quantity}</div>
                  <div>
                    ₹{item?.product?.price}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="flex justify-between">
                <span>Subtotal ({cartList.length} items)</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cartSummary.shipping === 0 ? "Free" : `₹${cartSummary.shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{cartSummary.tax}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{cartSummary.totalDiscount}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-yellow-600">₹{cartSummary.totalPrice}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isLoading}>
                {isLoading ? "Placing Order..." : "Place Order"}
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
