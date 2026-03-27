import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { addToCart, removeFromCart } from '@/redux-toolkit/slice/cartSlice';
import { addAndRemoveWishList, setWishList } from '@/redux-toolkit/slice/wishListSlice';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { addAndRemoveProductWishList, getProductToWishlist, addCart } from "@/services/service";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { calculateDiscount } from "@/services/allFunction";
import socket from "@/socket/socket";

export const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // const [wishList, setWishList] = useState([]);
  const [wishListRefresh, setWishListRefresh] = useState(false);
  const dispatch = useAppDispatch();
  const wishList = useAppSelector((state)=> state?.wishList?.wishList);

  // const wishList = useAppSelector((state) => state?.wishList?.wishList);
  const isWishlisted = Boolean(wishList?.find((v) => v?.product?._id === product?._id));
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddAndRemoveWishlist = async (product) => {
    console.log("product", product, "wishlist", wishList)

    const item = wishList.find((v) => v?.product?._id === product?._id);
    try {
      let res = null;
      res = await addAndRemoveProductWishList(product?._id);
    
      if (res.status === 200 || res.status === 201) {
        socket.emit("addAndRemovewishList", product)
        setWishListRefresh(true)
        toast({ title: item?.product?._id ? "Remove Item To Wishlist." : "Add Item To Wishlist.", description: res?.data?.message })
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error Wishlist Product.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleAddCart = async (product) => {
    let quantity = 1;
    try {
      const res = await addCart(product?._id, quantity);
      console.log(res)
      if (res.status === 201) {
        toast({ title: "Add Item To Cart.", description: res?.data?.message })
        // socket.emit("addCart",user?.id, product);
        socket.emit("order");

      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error Add Cart.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  
    const handleGetWishlistProducts = async () => {
      try {
        const res = await getProductToWishlist();
        if (res.status === 200) {
          // setWishList(res.data?.data);
          dispatch(setWishList(res?.data?.data));
          setWishListRefresh(false);
        }
      }
      catch (err) {
        console.log(err);
  
      }
    };
  
    useEffect(() => {
      if (wishListRefresh || wishList?.length===0){
    handleGetWishlistProducts()
      }
    }, [wishListRefresh, wishList?.length])
  
  if (!product) return null;


  return (
    <Card
      className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product/${product._id}`}>
          <img
            src={product?.images?.[0]}
            alt={product?.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500',
              isHovered && 'scale-110'
            )}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product?.discount > 0 && (
            <Badge variant="destructive" className="font-semibold text-[9px] px-1 py-[1px] rounded-sm">
              -{product?.discount}{product?.discountType==="percentage"?"%":"₹"} OFF
            </Badge>
          )}
          {!product.stock && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity',
            isWishlisted && 'opacity-100'
          )}
          onClick={() => { handleAddAndRemoveWishlist(product) }}
        >
          <Heart
            className={cn('h-4 w-4', isWishlisted && 'fill-destructive text-destructive')}
          />
        </Button>

        {/* Quick Add Button */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent',
            'translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300'
   
          )}
        >
          <Button
            className="w-full"
            size="sm"
            disabled={!product.stock}
            onClick={() => { handleAddCart(product) }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/product/${product._id}`}>
          <p className="text-sm text-muted-foreground mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
<span className="text-sm font-medium">
  {product?.rating?.length
    ? (product.rating.reduce((acc, r) => acc + r.rating, 0) / product.rating.length).toFixed(1)
    : 0}
</span>          </div>
          <span className="text-sm text-muted-foreground">({product.rating.length}) reviews</span>
        </div>

       <div className="flex items-center gap-2">
  {product?.discount > 0 ? (
    <>
      {/* Discounted Price */}
      <span className="text-lg font-bold text-foreground">
        ₹{product.price - calculateDiscount(product)}
      </span>

      {/* Original Price */}
      <span className="text-sm text-muted-foreground line-through">
        ₹{product.price}
      </span>
    </>
  ) : (
    /* No Discount → Only Original Price */
    <span className="text-lg font-bold text-foreground">
      ₹{product?.price}
    </span>
  )}
</div>
      </CardContent>
    </Card>
  );
};
