import React, { useEffect, useState } from "react";
import {getCategoryByUsers} from "@/services/service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook";
import { setCategoryList } from "@/redux-toolkit/slice/categorySlice";
type Category = {
  id: number;
  name: string;
  slug: string;
};
const dummyCategories: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Men Clothing", slug: "men-clothing" },
  { id: 3, name: "Women Fashion", slug: "women-fashion" },
  { id: 4, name: "Shoes", slug: "shoes" },
  { id: 5, name: "Home & Kitchen", slug: "home-kitchen" },
];

const Category: React.FC = () => {
  const {user} = useAuth();
  const {toast} = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state)=> state?.category?.categoryList)

  const handleGetCategory = async() => {
    try{
      const res = await getCategoryByUsers();
      if(res.status === 200){
        dispatch(setCategoryList(res?.data?.data))
      }
    }
    catch(err){
      console.log(err);
     toast({title:"Error", description:err.response.data.message, variant:"destructive"})
    }
  }

  useEffect(()=>{
    if(categories?.length===0 || user){
 handleGetCategory()
    }
  },[categories.length])
  return (
    // <div className="w-44 bg-white border border-gray-200 shadow-lg rounded-md max-h-[200px] md:w-full md:max-h-[600px] overflow-y-auto">
    //   {categories?.map((category) => (
    //     <a
    //       key={category._id}
    //       onClick={()=>{navigate("/products", {state:{id:category?._id}})}}
    //       className="block px-4 py-2 hover:bg-gray-100 transition capitalize cursor-pointer"
    //     >
    //       {category.name}
    //     </a>
    //   ))}
    // </div>


    <div className="w-74 bg-white border border-gray-200 shadow-lg rounded-md">

  {/* 📱 Mobile Title */}
  <div className="block md:hidden px-4 py-2 font-semibold border-b bg-gray-50">
    Categories
  </div>
  <div className="max-h-[600px] md:w-full md:max-h-[600px] overflow-y-auto">
  {categories?.map((category) => (
    <a
      key={category._id}
      onClick={() => {
        navigate("/products", { state: { id: category?._id } });
      }}
      className="block px-4 py-2 hover:bg-gray-100 transition capitalize cursor-pointer"
    >
      {category.name}
    </a>
  ))}
  </div>
</div>
  );
};


export default Category;
