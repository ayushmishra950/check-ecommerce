import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RatingModal from "@/card/RatingModal";
import {getRating} from "@/services/service"; 

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const location = useLocation();
  const cartList = location.state?.cartList;
const [filteredCartList, setFilteredCartList] = useState<any[]>([]);


  
  const handleGetRating = async () => {
    const productIds = cartList?.map((c) => c?.product?._id);
    if (!productIds || productIds.length === 0) return;
  
    try {
      const res = await getRating(productIds);
      if (res.status === 200) {
        const unratedIds = res.data.data; // IDs of unrated products
        const filteredCart = cartList?.filter((c) =>
          unratedIds.includes(c?.product?._id)
        );

  
        // If no unrated products, close modal / go back
        if (!filteredCart || filteredCart.length === 0) {
          setIsRatingOpen(false);
          return;
        }

        else{
          setIsRatingOpen(true);
        }
  
        // Optionally store filtered cart
        setFilteredCartList(filteredCart);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
  if (cartList && cartList.length > 0) {
    handleGetRating();
  }
}, [cartList]);


  return (
    <>
      <RatingModal isOpen={isRatingOpen} onOpenChange={setIsRatingOpen} filteredCart={filteredCartList} />
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Thank You!</h1>
        <p className="text-lg mb-6">Your order <span className="font-semibold">{orderId}</span> has been placed successfully.</p>

        <div className="space-y-4">
          <Link to="/" className="block">
            <Button>Continue Shopping</Button>
          </Link>
          <Link to="/orderpage" className="block">
            <Button variant="outline">View My Orders</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
