
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
  const [titles, setTitles] = useState<Record<string, string>>({});

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

  const handleTitle = (productId: string, value: string) => {
    setTitles((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const data =
      filteredCart?.map((product: any) => ({
        productId: product.product?._id,
        rating: ratings[product.product?._id] || 0,
        feedback: feedbacks[product.product?._id] || "",
        title: titles[product?.product?._id] || "",
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

                    {/* Title */}
                    <input
                      type="text"
                      value={titles[product?.product?._id] || ""}
                      onChange={(e) =>
                        handleTitle(product?.product?._id, e.target.value)
                      }
                      placeholder="Write review title..."
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none"
                    />

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
