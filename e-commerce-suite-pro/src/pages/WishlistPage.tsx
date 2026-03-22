import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2,
  ShoppingCart,
  Heart,
  Search,
  Filter,
  Share2,
  Star,
  ArrowLeft,
  Package,
  Sparkles,
  Check,
  X,
  Grid3x3,
  List,
  TrendingUp,
  Gift,
  BadgePercent
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook";
import { addToCart, removeFromCart } from '@/redux-toolkit/slice/cartSlice';
import { addAndRemoveWishList, setWishList } from '@/redux-toolkit/slice/wishListSlice';
import { addAndRemoveProductWishList, getProductToWishlist, clearWishList,allMoveToCart, moveToCart } from "@/services/service";
import { useAuth } from "@/context/AuthContext";


const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {user} = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [wishListRefresh, setWishListRefresh] = useState(false);
   const wishlist = useAppSelector((state)=> state?.wishList?.wishList);

  const handleGetProducts = async () => {
    try {
      const res = await getProductToWishlist();
       console.log(res)
      if (res.status === 200) {
        setWishList(res.data?.data);
        dispatch(setWishList(res?.data?.data));
        setWishListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  const handleProductRemoveFromWishlist = async (id) => {
    try {
      const res = await addAndRemoveProductWishList(id);
       console.log(res)
      if (res.status === 200) {
       toast({title:"Product remove from Wishlist.", description:res?.data?.message})
        setWishListRefresh(true);
      }
    }
    catch (err) {
      console.log(err);
      toast({title:"Error remove from Wishlist.", description:err?.response?.data?.message, variant:"destructive"})
    }
  };
   const handleClearWishList = async () => {
    try {
      const res = await clearWishList(user?.id);
       console.log(res)
      if (res.status === 200) {
       toast({title:"Product remove from Wishlist.", description:res?.data?.message})
        setWishListRefresh(true);
      }
    }
    catch (err) {
      console.log(err);
      toast({title:"Error remove from Wishlist.", description:err?.response?.data?.message, variant:"destructive"})
    }
  };

  useEffect(() => {
    if (wishListRefresh || wishlist?.length===0){
  handleGetProducts()
    }
  }, [wishListRefresh, wishlist?.length])

  // Filter and sort items
  const filteredItems = wishlist
    .filter((item) =>
      item?.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a?.product?.price - b?.product?.price;
        case 'price-high':
          return b?.product?.price - a?.product?.price;
        case 'name':
        default:
          return a?.product?.name.localeCompare(b?.product?.name);
      }
    });

  const handleMoveToCart = async(itemId:string) => {
         try{
      const res = await moveToCart(user?.id, itemId);
      if(res.status===200){
        toast({title:"Product Move To Cart.", description:res?.data?.message});
        setWishListRefresh(true);
        navigate("/cart");
      }
         }
         catch(err){
          toast({title:"Error Product Move Cart.", description:err?.response?.data?.message|| err?.message, variant:"destructive"})
         }
  };
  const handleAllMoveToCart = async() => {
         try{
      const res = await allMoveToCart(user?.id);
      if(res.status===200){
        toast({title:"All Products Move To Cart.", description:res?.data?.message});
        setWishListRefresh(true);
        navigate("/cart");
      }
         }
         catch(err){
          toast({title:"Error All Products Move Cart.", description:err?.response?.data?.message|| err?.message, variant:"destructive"})
         }
  };

  const calculateDiscount = (item: any) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return 0;
  };
  const totalValue = wishlist?.reduce((acc, item) => acc + item?.product?.price, 0);
  const totalSavings = wishlist?.reduce((acc, item) => {
  const price = item?.product?.price ?? 0;
  const discountValue = item?.product?.discount ?? 0;

  let saving = 0;

  if (item?.product?.discountType === "percentage") {
    saving = (price * discountValue) / 100;
  } else {
    saving = discountValue; // ✅ direct rupees discount
  }

  return acc + saving;
}, 0) ?? 0;

  if (filteredItems?.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative mb-8">
            <Heart className="h-24 w-24 mx-auto text-gray-300" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Save your favorite items here and never lose track of what you love!
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
            >
              <Link to="/products">
                <Heart className="mr-2 h-5 w-5" />
                Discover Products
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="h-10 w-10 text-yellow-600 fill-yellow-600" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {filteredItems?.length} {filteredItems?.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <Heart className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredItems?.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-3">
                  <BadgePercent className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">You Save</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalSavings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>

              {/* Share */}
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search to find what you're looking for</p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
          >
            {filteredItems.map((item) => {
              const discount = calculateDiscount(item);
              const isInStock = item?.product?.stock > 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/product/${item._id}`} className="block">
                      <div className={cn(
                        "overflow-hidden bg-gray-100",
                        viewMode === 'grid' ? "aspect-square" : "h-48"
                      )}>
                        <img
                          src={item?.product?.images[0]}
                          alt={item?.product?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        -{discount}% OFF
                      </div>
                    )}

                    {/* Stock Badge */}
                    {!isInStock && (
                      <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleProductRemoveFromWishlist(item?.product?._id)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-yellow-50 transition-colors group/btn"
                    >
                      <Heart className="h-5 w-5 text-yellow-600 fill-yellow-600 group-hover/btn:text-yellow-700" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-6">
                    <div className="mb-3">
                      <Link to={`/product/${item._id}`}>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 hover:text-yellow-600 transition-colors line-clamp-2">
                          {item?.product?.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">{item?.product?.category?.name || 'General'}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < Math.floor(item?.product?.rating?.length>0 ?item.product?.rating?.reduce((acc, r)=> acc + r.rating,0)/item?.product?.rating?.length : 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({item?.product?.rating?.length>0 ?item.product?.rating?.reduce((acc, r)=> acc + r.rating, 0)/item?.product?.rating?.length : 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{item?.product?.price?.toLocaleString()}
                      </span>
                      {/* {item.originalPrice && item.originalPrice > item.price && ( */}
                      <span className="text-sm text-gray-500 line-through">
                        {/* ₹{item.originalPrice.toLocaleString()} */}
                      </span>
                      {/* )} */}
                    </div>

                    {/* Stock Info */}
                    {isInStock && item?.product?.stock < 10 && (
                      <p className="text-xs text-orange-600 font-semibold mb-3 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Only {item?.product?.stock} left in stock!
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                        onClick={() => handleMoveToCart(item?.product?._id)}
                        disabled={!isInStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleProductRemoveFromWishlist(item?.product?._id)}
                        className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {filteredItems.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Gift className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Ready to checkout?</h3>
                  <p className="text-sm text-gray-600">
                    Move all items to cart and complete your purchase
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearWishList}
                  className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  onClick={handleAllMoveToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
