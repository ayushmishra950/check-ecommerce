import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveBanners } from "@/services/service";
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';

export const HeroSection = () => {
  const { toast } = useToast();
  const [bannerList, setBannerList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGetBanners = async () => {
    try {
      const res = await getActiveBanners();
      if (res.status === 200) {
        setBannerList(res?.data?.data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(()=>{
    handleGetBanners()
  },[])

  // Auto-slide every 3.5 sec
  useEffect(() => {
    if (bannerList.length <= 1) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerList.length);
    }, 3500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, bannerList]);

  return (
    <section className="relative">
      {/* Hero Carousel */}
<div className="relative h-[500px] md:h-[600px] overflow-hidden">
  <div className="w-full h-full relative">
    {bannerList.length > 0 ? (
      bannerList.map((banner, index) => (
        <img
          key={index}
          src={banner.image} // Make sure API field is correct
          alt={`Banner ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 ease-in-out 
            ${index === currentIndex ? 'translate-x-0 z-20' : 'translate-x-full z-10'}`}
        />
      ))
    ) : (
      <img
        src="/hero-banner.jpg" // fallback
        alt="ShopFlow Hero"
        className="w-full h-full object-cover"
      />
    )}

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

    {/* Hero text */}
    <div className="absolute inset-0 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-xl">
          <span className="inline-block px-4 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-primary/30">
            New Season Collection
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-4 leading-tight">
            Discover Your
            <br />
            <span className="text-primary">Perfect Style</span>
          </h1>
          <p className="text-lg text-accent/80 mb-8 max-w-md">
            Explore our curated collection of premium products designed for the modern lifestyle.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 hover:text-accent"
              asChild
            >
              <Link to="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Center Dots */}
    {bannerList.length > 1 && (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {bannerList.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary' : 'bg-primary/50'
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    )}
  </div>
</div>
    </section>
  );
};