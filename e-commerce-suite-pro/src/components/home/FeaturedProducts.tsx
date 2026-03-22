import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useToast } from '@/hooks/use-toast';
import {getProductsByUsers} from "@/services/service";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { setProductList } from '@/redux-toolkit/slice/productSlice';

export const FeaturedProducts = () => {
  const {toast} = useToast();
  // const [featuredProducts, setFeaturedProducts] = useState([]);
  const dispatch  = useAppDispatch();
  const featuredProducts = useAppSelector((state)=> state?.product?.productList);
  const handleGetProduct = async() => {
     try{
        const res = await getProductsByUsers();
        if(res.status===200){
            // setFeaturedProducts(res?.data?.data);
            dispatch(setProductList(res?.data?.data));
        }
     }
     catch(err){
      toast({title:"Error Product.", description:err?.response?.data?.message|| err?.message, variant:"destructive"})
     }
  }
  useEffect(()=>{
    if(featuredProducts?.length===0){
 handleGetProduct()
    }
  },[featuredProducts?.length])

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked items just for you</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
