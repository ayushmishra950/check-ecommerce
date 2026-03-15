import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Grid3x3, List, SlidersHorizontal, X, Search, ChevronDown, ChevronUp, Star, Package, ShoppingBag, ArrowUpDown, Tag, Sparkles, TrendingUp, Award, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getProductByCategoryId, getProductsByUsers } from "@/services/service";
import { Slider } from '@/components/ui/slider';
import { setProductList } from "@/redux-toolkit/slice/productSlice";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';

const Products = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const id = location?.state?.id;
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  // const [productList, setProductList] = useState<any>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const dispatch = useAppDispatch();
  const productList = useAppSelector((state) => state?.product?.productList)

  const categoryFilter = searchParams.get('category');
  const searchParamQuery = searchParams.get('search');

  // Get unique categories from products
  const categories = Array.from(new Set(productList.map((p: any) => p.category?.name).filter(Boolean)));

  // Filter products
  let filteredProducts = productList;

  // Category filter
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p: any) =>
      selectedCategories.includes(p.category?.name)
    );
  }

  // Search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Price range filter
  filteredProducts = filteredProducts.filter((p: any) =>
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // Rating filter
  // if (selectedRatings.length > 0) {
  //   filteredProducts = filteredProducts.filter((p: any) =>
  //     selectedRatings.some(rating => Math.floor(p.rating || 0) >= rating)
  //   );
  // }

  if (selectedRatings.length > 0) {
  filteredProducts = filteredProducts.filter((p: any) => {
    const avgRating =
      p.rating?.reduce((acc: number, r: any) => acc + r.rating, 0) /
        p.rating?.length || 0;

    return selectedRatings.some(rating => Math.floor(avgRating) >= rating);
  });
}

  // Sort products
  switch (sortBy) {
    case 'price-low':
      filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      filteredProducts = [...filteredProducts].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      break;
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleGetProduct = async () => {
    try {
      const res = await (id ? getProductByCategoryId(id) : getProductsByUsers());
      if (res.status === 200) {
        dispatch(setProductList(res?.data?.data));
      }
    } catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load products", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (productList.length === 0 || id) {
      handleGetProduct();
    }
  }, [id, productList.length]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRatings([]);
    setPriceRange([0, 100000]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true
  });

  const toggleSection = (section: 'categories' | 'price' | 'rating') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFiltersCount = selectedCategories.length + selectedRatings.length +
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {categoryFilter || searchParamQuery
                  ? `${categoryFilter || searchParamQuery}`
                  : 'All Products'}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{filteredProducts.length} products available</span>
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full sm:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {selectedCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="group flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {cat}
                    <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
                {selectedRatings.map(rating => (
                  <button
                    key={rating}
                    onClick={() => toggleRating(rating)}
                    className="group flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-600" />
                    {rating}+ Stars
                    <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
                {(priceRange[0] !== 0 || priceRange[1] !== 100000) && (
                  <button
                    onClick={() => setPriceRange([0, 100000])}
                    className="group flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </button>
                )}
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="p-5 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    Categories
                  </span>
                  {expandedSections.categories ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.categories && (
                  <div className="px-5 pb-4 space-y-1.5 max-h-60 overflow-y-auto">
                    {categories.map((cat: any) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">{cat}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {productList.filter((p: any) => p.category?.name === cat).length}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Price Range
                  </span>
                  {expandedSections.price ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.price && (
                  <div className="px-5 pb-5">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value);
                        setCurrentPage(1);
                      }}
                      max={100000}
                      step={1000}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        ₹{priceRange[0].toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">to</span>
                      <span className="text-sm font-semibold text-gray-700">
                        ₹{priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <button
                  onClick={() => toggleSection('rating')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    Rating
                  </span>
                  {expandedSections.rating ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.rating && (
                  <div className="px-5 pb-4 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rating)}
                          onChange={() => toggleRating(rating)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-3.5 h-3.5',
                                i < rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-900">& up</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Controls */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {currentProducts.length} of {filteredProducts.length} products
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">✨ Featured</SelectItem>
                      <SelectItem value="newest">🆕 Newest</SelectItem>
                      <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                      <SelectItem value="price-high">💸 Price: High to Low</SelectItem>
                      <SelectItem value="rating">⭐ Top Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <>
                <div
                  className={cn(
                    'grid gap-5',
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  )}
                >
                  {currentProducts.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-600">
                        Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                        <span className="font-semibold text-gray-900">{totalPages}</span>
                        {' '}({filteredProducts.length} total products)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="border-gray-200"
                        >
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Button
                                key={i}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={cn(
                                  'w-9',
                                  currentPage === pageNum
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'border-gray-200 hover:bg-gray-50'
                                )}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="border-gray-200"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
