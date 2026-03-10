import { Product } from '@/types';
import headphonesImg from '@/assets/products/headphones.jpg';
import smartwatchImg from '@/assets/products/smartwatch.jpg';
import sneakersImg from '@/assets/products/sneakers.jpg';
import backpackImg from '@/assets/products/backpack.jpg';
import sunglassesImg from '@/assets/products/sunglasses.jpg';


export const categories = [
  { id: '1', name: 'Electronics', count: 45, icon: 'Smartphone' },
  { id: '2', name: 'Fashion', count: 128, icon: 'Shirt' },
  { id: '3', name: 'Accessories', count: 67, icon: 'Watch' },
  { id: '4', name: 'Home & Living', count: 89, icon: 'Home' },
  { id: '5', name: 'Sports', count: 34, icon: 'Dumbbell' },
  { id: '6', name: 'Beauty', count: 56, icon: 'Sparkles' }
];








export interface RatingItem {
  id: number;
  productName: string;
  image: string;
  rating: number;
  review: string;
}

export const ratings: RatingItem[] = [
  {
    id: 1,
    productName: "iPhone 14",
    image: "https://via.placeholder.com/80",
    rating: 5,
    review: "Amazing phone with great camera."
  },
  {
    id: 2,
    productName: "Nike Running Shoes",
    image: "https://via.placeholder.com/80",
    rating: 4,
    review: "Very comfortable for running."
  },
  {
    id: 3,
    productName: "Sony Headphones",
    image: "https://via.placeholder.com/80",
    rating: 4,
    review: "Sound quality is excellent."
  }
];