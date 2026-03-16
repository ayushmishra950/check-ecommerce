import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw, Check, X, Share2, Facebook, Twitter, Copy, Package, Clock, ChevronRight, MessageCircle, ThumbsUp, StarHalf, Zap, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getProductById, getProductByCategoryId, addCart } from "@/services/service";
import { addToCart, incrementQuantity, decrementQuantity } from '@/redux-toolkit/slice/cartSlice';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { calculateDiscount } from "@/services/allFunction";

// Dummy Reviews Data
const dummyReviews = [
  {
    id: 1,
    author: "Rahul Sharma",
    rating: 5,
    date: "2026-02-10",
    title: "Excellent Product!",
    comment: "This product exceeded my expectations. The quality is outstanding and delivery was super fast. Highly recommended!",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    author: "Priya Singh",
    rating: 4,
    date: "2026-02-08",
    title: "Great value for money",
    comment: "Really good product for the price. Build quality is solid. Only minor issue is that the color was slightly different from the images.",
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    author: "Amit Kumar",
    rating: 5,
    date: "2026-02-05",
    title: "Perfect!",
    comment: "Absolutely love it! Using it daily and it works flawlessly. Customer service was also very helpful.",
    helpful: 32,
    verified: true,
  },
  {
    id: 4,
    author: "Sneha Patel",
    rating: 3,
    date: "2026-02-01",
    title: "Good but could be better",
    comment: "The product is decent but I expected more features at this price point. Still, it serves the purpose well.",
    helpful: 8,
    verified: false,
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  // const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any>([])
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state?.cart?.cartList);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  };

  const discount = product?.originalPrice
    ? Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100)
    : 0;

  const handleGetProduct = async () => {
    try {
      const res = await getProductById(id);
      if (res.status === 200) {
        setProduct(res?.data?.data);
        const id = res.data.data?.category?._id;
        if (!id) return;
        const productData = await getProductByCategoryId(id);
        console.log(productData);
        if (productData.status === 200) {
          setRelatedProducts(productData?.data?.data)
        }


      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load product", variant: "destructive" });
    }
  };

  useEffect(() => {
    handleGetProduct();
  }, []);



  const handleAddCart = async (product) => {
    let quantity = 1;
    try {
      const res = await addCart(product?._id, quantity);
      console.log(res)
      if (res.status === 201) {
        toast({ title: "Add Item To Cart.", description: res?.data?.message })
        dispatch(addToCart(product))

      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error Add Cart.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name}!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ title: "Link Copied!", description: "Product link copied to clipboard" });
        break;
    }
    setShowShareMenu(false);
  };

  const currentItem = items.find((i) => i?._id === product?._id);
  const currentQuantity = currentItem?.quantity || 0;

const averageRating = product?.rating?.length > 0 ? Number((product.rating.reduce((acc, r) => acc + r.rating, 0) / product.rating.length)) : 0; 
  //  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
  //   rating,
  //   count: dummyReviews.filter(r => r.rating === rating).length,
  //   percentage: (dummyReviews.filter(r => r.rating === rating).length / dummyReviews.length) * 100
  // }));

  const ratings = product?.rating || [];

const ratingDistribution = [5,4,3,2,1].map((star) => {
  const count = ratings.filter(r => r.rating === star).length;

  const percentage =
    ratings.length > 0 ? (count / ratings.length) * 100 : 0;

  return {
    rating: star,
    count,
    percentage
  };
});

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Product...</h2>
          <p className="text-gray-600">Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }
  console.log(product)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product?.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image with Zoom */}
              <div className="relative group">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-crosshair"
                  onMouseEnter={() => setShowZoom(true)}
                  onMouseLeave={() => setShowZoom(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={selectedImage}
                    alt={product?.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                      -{discount}% OFF
                    </div>
                  )}
                  {product?.stock < 10 && product?.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Only {product?.stock} left!
                    </div>
                  )}
                </div>

                {/* Zoom Preview */}
                {showZoom && (
                  <div
                    className="hidden lg:block absolute -right-[520px] top-0 w-[500px] h-[500px] rounded-2xl border-2 border-gray-200 shadow-2xl bg-white z-50"
                    style={{
                      backgroundImage: `url(${selectedImage})`,
                      backgroundSize: "250%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {product?.images?.slice(0, 4).map((img: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all transform hover:scale-105 ${selectedImage === img
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Share */}
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  {product?.category?.name || "Category"}
                </Badge>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                      >
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product?.name}</h1>
                {product?.stock > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {averageRating?averageRating.toFixed(1) :0 }
                </span>

                <span className="text-gray-600">
                  ({product?.rating?.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 pb-6 border-b border-gray-100">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  ₹{product?.price?.toLocaleString()}
                </span>
                {product?.originalPrice && (
                  <div className="flex flex-col">
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product?.originalPrice?.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      Save ₹{(product?.originalPrice - product?.price)?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{product?.description}</p>

              {/* Variants (if available) */}
              {product?.variants?.map((variant) => (
                <div key={variant?.id} className="space-y-3">
                  <p className="font-semibold text-gray-900">{variant?.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option, i) => (
                      <Button
                        key={option}
                        variant={i === 0 ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[60px]"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}


              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
                  disabled={!product?.stock}
                  onClick={() => {
                    handleAddCart(product)
                  }}
                >
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  {product?.stock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-14"
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast({
                      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
                      description: isWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist",
                    });
                  }}
                >
                  <Heart
                    className={cn(
                      'h-6 w-6',
                      isWishlisted && 'fill-red-500 text-red-500'
                    )}
                  />
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <Truck className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600 mt-1">On orders above ₹500</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                  <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">2 Year Warranty</p>
                  <p className="text-xs text-gray-600 mt-1">100% genuine</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                  <RotateCcw className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">30-Day Returns</p>
                  <p className="text-xs text-gray-600 mt-1">Easy returns</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Estimated Delivery</span>
                </div>
                <p className="text-gray-600 ml-8">3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <Tabs defaultValue="description" className="p-6 md:p-8">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="description" className="text-base">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="text-base">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="text-base">
                Reviews ({product?.rating?.length})
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product?.description}</p>
                <div className="mt-6 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">Key Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Premium quality materials and construction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Advanced features for enhanced performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Designed for durability and long-lasting use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Easy to use with intuitive controls</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{product?.category?.name || "General"}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Availability</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product?.stock > 0 ? `In Stock (${product?.stock} units)` : 'Out of Stock'}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">SKU</p>
                  <p className="text-lg font-semibold text-gray-900">{product?._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Brand</p>
                  <p className="text-lg font-semibold text-gray-900">{product?.brand || "Premium Brand"}</p>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-8">
              {/* Rating Summary */}
              <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-gray-200">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-gray-900">{averageRating? averageRating.toFixed(1) : 0 }</div>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-6 h-6',
                          i < Math.floor(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Based on {product?.rating?.length} reviews</p>
                </div>

                <div className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-12">{rating} Star</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {dummyReviews.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{review.author}</h4>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-4 h-4',
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                    <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.filter((p) => p?._id !== id).map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                onClick={() => navigate(`/product/${relatedProduct._id}`)}
                className="group cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={relatedProduct?.images?.[0]}
                    alt={relatedProduct?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 truncate">{relatedProduct?.name}</h3>
                  <div className="flex items-center gap-1">

                    {[...Array(5)].map((_, i) => {
                      return(
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < Math.floor(
                            relatedProduct?.rating?.reduce((acc, r) => acc + r.rating, 0) /
                            (relatedProduct?.rating?.length || 1)
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    )})}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{relatedProduct?.price - calculateDiscount(relatedProduct)}</span>
                    <span className="text-sm text-gray-400 line-through">₹{relatedProduct?.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
