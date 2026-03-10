// "use client";

// import { useState } from "react";
// import { Star, CheckCircle2 } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { addRating, getRating } from "@/services/service";

// interface RatingModalProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   cartList?: [];
//   onSubmit?: (data: { rating: number; feedback: string }) => void;
// }

// const RatingModal = ({ isOpen, onOpenChange, cartList, onSubmit }: RatingModalProps) => {
//   const [rating, setRating] = useState(0);
//   const [hover, setHover] = useState(0);
//   const [feedback, setFeedback] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const stars = [1, 2, 3, 4, 5];

//   const getRatingText = (val: number) => {
//     switch (val) {
//       case 1: return "Poor";
//       case 2: return "Fair";
//       case 3: return "Good";
//       case 4: return "Very Good";
//       case 5: return "Excellent";
//       default: return "Select a rating";
//     }
//   };

//   const handleSubmit = async () => {
//     if (rating === 0) return;

//     setIsSubmitting(true);
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     if (onSubmit) {
//       onSubmit({ rating, feedback });
//     }

//     setIsSubmitting(false);
//     setIsSubmitted(true);

//     // Auto close after 2.5 seconds on success
//     setTimeout(() => {
//       onOpenChange(false);
//       // Reset state for next time
//       setTimeout(() => {
//         setIsSubmitted(false);
//         setRating(0);
//         setFeedback("");
//       }, 500);
//     }, 2500);
//   };

//   const handleGetRating = async () => {
//     const res = await getRating(productId);
//     setRating(res.data.rating);
//     setFeedback(res.data.feedback);
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md overflow-hidden border-none p-0 bg-white dark:bg-zinc-950 shadow-2xl rounded-2xl transform transition-all duration-300">
//         <div className={cn(
//           "transition-all duration-500 ease-in-out w-full",
//           isSubmitted ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
//         )}>
//           {!isSubmitted && (
//             <div className="p-6">
//               <DialogHeader className="mb-6">
//                 <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
//                   Rate Your Experience
//                 </DialogTitle>
//                 <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
//                   {productName ? `How was your experience with ${productName}?` : "We'd love to hear your feedback about your recent purchase."}
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="flex flex-col items-center justify-center space-y-4 py-4">
//                 <div className="flex items-center space-x-2">
//                   {stars.map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       onClick={() => setRating(star)}
//                       onMouseEnter={() => setHover(star)}
//                       onMouseLeave={() => setHover(0)}
//                       className="group relative transition-transform hover:scale-125 focus:outline-none"
//                     >
//                       <Star
//                         size={40}
//                         className={cn(
//                           "transition-all duration-300",
//                           (hover || rating) >= star
//                             ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
//                             : "fill-transparent text-zinc-300 dark:text-zinc-700 hover:text-yellow-200"
//                         )}
//                       />
//                     </button>
//                   ))}
//                 </div>

//                 <span className={cn(
//                   "text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 transform",
//                   rating > 0
//                     ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 scale-110 shadow-sm"
//                     : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
//                 )}>
//                   {getRatingText(hover || rating)}
//                 </span>
//               </div>

//               <div className="mt-6 space-y-2">
//                 <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
//                   Additional Feedback
//                 </label>
//                 <Textarea
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                   placeholder="Tell us what you liked or what we could improve..."
//                   className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 resize-none rounded-xl transition-all duration-200"
//                 />
//               </div>

//               <DialogFooter className="mt-8 sm:justify-center">
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={rating === 0 || isSubmitting}
//                   className="w-full sm:w-64 h-12 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-none rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale-[0.5]"
//                 >
//                   {isSubmitting ? (
//                     <div className="flex items-center">
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending...
//                     </div>
//                   ) : "Submit Rating"}
//                 </Button>
//               </DialogFooter>
//             </div>
//           )}
//         </div>

//         <div className={cn(
//           "transition-all duration-700 ease-out p-12 flex flex-col items-center text-center space-y-4 w-full",
//           isSubmitted ? "opacity-100 scale-100 relative" : "opacity-0 scale-90 absolute pointer-events-none"
//         )}>
//           {isSubmitted && (
//             <>
//               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500">
//                 <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
//               </div>
//               <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
//                 Thank You!
//               </DialogTitle>
//               <DialogDescription className="text-lg text-zinc-600 dark:text-zinc-400">
//                 Your feedback has been submitted successfully. We appreciate your support!
//               </DialogDescription>
//               <div className="w-full pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => onOpenChange(false)}
//                   className="rounded-xl px-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-zinc-200 dark:border-zinc-800"
//                 >
//                   Close
//                 </Button>
//               </div>
//             </>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default RatingModal;






























"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addRating } from "@/services/service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RatingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filteredCart?: any[];
  onSubmit?: (data: any) => void;
}

const RatingModal = ({
  isOpen,
  onOpenChange,
  filteredCart,
  onSubmit,
}: RatingModalProps) => {
  const stars = [1, 2, 3, 4, 5];
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hover, setHover] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allRatingList, setAllRatingList] = useState<any>([]);
  const [filteredCartList, setFilteredCartList] = useState<any[]>(filteredCart);
  console.log(filteredCart)

  if (!filteredCart || filteredCart.length === 0) {
    onOpenChange(false);
    navigate("/ordersuccess"); // or router.back()
    return;
  }

  const getRatingText = (val: number) => {
    switch (val) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select rating";
    }
  };

  const handleRating = (productId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
  };

  const handleFeedback = (productId: string, value: string) => {
    setFeedbacks((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const data =
      filteredCart?.map((product: any) => ({
        productId: product.product?._id,
        rating: ratings[product.product?._id] || 0,
        feedback: feedbacks[product.product?._id] || "",
        userId: user?.id,
      })) || [];

    await new Promise((resolve) => setTimeout(resolve, 1200));
    try {
      const res = await addRating(data);
      console.log(res)
    }
    catch (err) {
      console.log(err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      onOpenChange(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setRatings({});
        setFeedbacks({});
      }, 500);
    }, 2500);
  };
  console.log(filteredCart)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto border-none p-0 bg-white dark:bg-zinc-950 shadow-2xl rounded-2xl">

        {/* Rating Section */}
        <div
          className={cn(
            "transition-all duration-500 w-full",
            isSubmitted
              ? "opacity-0 scale-95 pointer-events-none absolute"
              : "opacity-100 scale-100"
          )}
        >
          {!isSubmitted && (
            <div className="p-6">

              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  Rate Your Experience
                </DialogTitle>
                <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
                  Please rate each product you purchased.
                </DialogDescription>
              </DialogHeader>

              {/* Product List */}
              <div className="space-y-6">

                {filteredCart?.map((product: any) => (
                  <div
                    key={product._id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4"
                  >

                    {/* Product Header */}
                    <div className="flex items-center gap-3">

                      {/* Product Image */}
                      <img
                        src={product.product?.images?.[0]}
                        alt={product.product?.name}
                        className="w-12 h-12 rounded-md object-cover border border-zinc-200"
                      />

                      {/* Product Name */}
                      <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">
                        {product.product?.name}
                      </h3>

                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-2">

                      {stars.map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(product?.product?._id, star)}
                          onMouseEnter={() =>
                            setHover((prev) => ({
                              ...prev,
                              [product?.product?._id]: star,
                            }))
                          }
                          onMouseLeave={() =>
                            setHover((prev) => ({
                              ...prev,
                              [product?.product?._id]: 0,
                            }))
                          }
                          className="transition-transform hover:scale-125"
                        >
                          <Star
                            size={28}
                            className={cn(
                              (hover[product?.product?._id] || ratings[product?.product?._id] || 0) >= star
                                ? "fill-yellow-400 text-yellow-500"
                                : "fill-transparent text-zinc-300 dark:text-zinc-700"
                            )}
                          />
                        </button>
                      ))}

                      <span className="ml-3 text-sm text-zinc-500">
                        {getRatingText(
                          hover[product?.product?._id] || ratings[product?.product?._id] || 0
                        )}
                      </span>

                    </div>

                    {/* Feedback */}
                    <Textarea
                      value={feedbacks[product?.product?._id] || ""}
                      onChange={(e) =>
                        handleFeedback(product?.product?._id, e.target.value)
                      }
                      placeholder="Write your feedback..."
                      className="min-h-[80px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg resize-none"
                    />

                  </div>
                ))}

              </div>

              {/* Submit Button */}
              <DialogFooter className="mt-8 sm:justify-center">

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-64 h-12 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl shadow-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ratings"}
                </Button>

              </DialogFooter>

            </div>
          )}
        </div>

        {/* Success Screen */}

        <div
          className={cn(
            "transition-all duration-700 ease-out p-12 flex flex-col items-center text-center space-y-4 w-full",
            isSubmitted
              ? "opacity-100 scale-100 relative"
              : "opacity-0 scale-90 absolute pointer-events-none"
          )}
        >
          {isSubmitted && (
            <>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>

              <DialogTitle className="text-2xl font-bold">
                Thank You!
              </DialogTitle>

              <DialogDescription>
                Your feedback has been submitted successfully.
              </DialogDescription>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-8"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
