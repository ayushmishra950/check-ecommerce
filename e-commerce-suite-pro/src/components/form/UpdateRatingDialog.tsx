import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { updateRating } from "@/services/service";
import { useToast } from "@/hooks/use-toast";



const UpdateRatingDialog = ({ isOpen, onOpenChange, initialData, setReviewsRefresh }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log(initialData)
        if (initialData && isOpen) {
            console.log(initialData)
            setFormData({
                productName: initialData?.productId?.name,
                rating: initialData?.rating,
                title:initialData?.title,
                feedback: initialData?.feedback
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let obj = { ...formData, id: initialData?._id }
        setIsLoading(true);
        console.log(obj)
        try {
            const res = await updateRating(obj);
            console.log(res)
            if (res.status === 200) {
                toast({ title: "Product Rating updated.", description: "product rating updated successfully" });
                onOpenChange(false);
                setReviewsRefresh(true);
            }
        } catch (error) {
            console.log(error);
            toast({ title: "Product Rating update failed.", description: error?.response?.data?.message || error?.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Review</DialogTitle>
                    <DialogDescription>
                        Update your feedback for {formData?.productName}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} id="updateRatingForm" className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                            id="productName"
                            value={formData?.productName}
                            disabled
                            className="col-span-3 bg-gray-50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`transition-colors ${formData?.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                    <Star fill={formData?.rating >= star ? "currentColor" : "none"} size={24} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="review">Title(Optional)</Label>
                        <Input
                            id="review"
                            value={formData?.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Update your title here..."
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="review">Feedback</Label>
                        <Textarea
                            id="review"
                            value={formData?.feedback}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                            placeholder="Update your review here..."
                            className="min-h-[80px]"
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="updateRatingForm" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Updating..." : "Update Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


export default UpdateRatingDialog;
