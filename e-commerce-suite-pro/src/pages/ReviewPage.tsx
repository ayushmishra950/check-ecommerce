import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Search, Star, MessageSquare, SortAsc, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getAllRating, deleteRating } from "@/services/service";
import UpdateRatingDialog from "@/components/form/UpdateRatingDialog";
import { formatDate } from "@/services/allFunction";
import { useToast } from "@/hooks/use-toast";
import DeleteModal from "@/card/DeleteModal";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook";
import { setReviewList } from "@/redux-toolkit/slice/reviewSlice";

const ReviewPage: React.FC = () => {
    const { toast } = useToast();
    // const [reviews, setReviews] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [initialData, setInitialData] = useState<any>([]);
    const [reviewsRefresh, setReviewsRefresh] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const dispatch = useAppDispatch();
    const reviews = useAppSelector((state)=> state?.review?.reviewList);

    const filteredReviews = useMemo(() => {
        return reviews?.filter(r =>
            r.productId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r?.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reviews, searchTerm]);


    const handleDelete = async () => {
        if (!deleteId) return toast({ title: "deleteId Not Found." });
        setIsDeleteLoading(true);
        try {
            const res = await deleteRating(deleteId);
            console.log(res)
            if (res.status === 200) {
                toast({ title: "Review Product Deleted.", description: res.data?.message });
                setDeleteDialogOpen(false);
                setReviewsRefresh(true);
                setDeleteId(null);
            }
        }
        catch (err) {
            console.log(err);
            toast({ title: "Delete Review Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" });
        }
        finally {
            setIsDeleteLoading(false);
        }
    };

    const handleGetReview = async () => {
        const res = await getAllRating();
        console.log(res);
        if (res.status === 200) {
            dispatch(setReviewList(res?.data?.data));
            setReviewsRefresh(false);
        }
    };
    console.log(deleteId)

    useEffect(() => {
        if (reviewsRefresh || reviews.length === 0) {
        handleGetReview();
        }
    }, [reviewsRefresh, reviews?.length]);

    return (
        <>
            <DeleteModal isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false) }} onConfirm={handleDelete} buttonName="Delete" isDeleteLoading={isDeleteLoading} title="Delete Review" description="Are you sure you want to delete your review? This action cannot be undone and your rating and feedback will be permanently removed." />
            <UpdateRatingDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} initialData={initialData} setReviewsRefresh={setReviewsRefresh} />
            <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 italic">Manage My Reviews</h1>
                        <p className="text-muted-foreground mt-1">Edit or delete your past product reviews here.</p>
                    </div>

                    <div className="hidden md:block">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                            {reviews?.length} Total Reviews
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Filters */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Search size={16} /> Search
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="Search reviews..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white dark:bg-black"
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Filter size={16} /> Filter by Rating
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div key={star} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                            <Star size={14} className="text-yellow-500" fill="currentColor" />
                                            <span>{star} Stars</span>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {reviews.filter(r => r.rating === star).length}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reviews List */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Showing {filteredReviews?.length} reviews</span>
                            <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                                <SortAsc size={16} />
                                <span>Newest First</span>
                            </div>
                        </div>

                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((item) => (
                                <Card
                                    key={item?._id}
                                    className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900"
                                >
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row gap-4 p-5">
                                            <div className="flex-shrink-0">
                                                <Avatar className="h-20 w-20 rounded-xl border-2 border-muted overflow-hidden">
                                                    <AvatarImage src={item?.productId?.images?.[0]} className="object-cover" />
                                                    <AvatarFallback className="rounded-xl">PR</AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <div className="flex-grow space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                                                            {item?.productId?.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={i < item?.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-muted-foreground ml-2 font-medium">
                                                                Verified Purchase
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" >
                                                            <DropdownMenuItem onClick={() => { setInitialData(item); setIsDialogOpen(true) }} className="cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => { setDeleteId(item?._id); setDeleteDialogOpen(true) }} >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-lg mt-2">
                                                    <MessageSquare size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm italic italic leading-relaxed">
                                                        "{item.feedback}"
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                        Reviewed on {formatDate(item?.createdAt)}
                                                    </span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
                                                        <Button variant="ghost" size="icon" className="cursor-pointer">
                                                            <Pencil size={16} className="text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                                <div className="p-4 bg-muted rounded-full">
                                    <Search size={40} className="text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">No reviews found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                                </div>
                                <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReviewPage;
