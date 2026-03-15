import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, Loader2, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { addProduct, updateProduct, getCategory } from "@/services/service";
import AddCategoryDialog from "./AddCategoryDialog"
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook"
import { setCategoryList } from "@/redux-toolkit/slice/categorySlice"

type FormChangeEvent = | React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>

const AddProductDialog = ({ open, onOpenChange, initialData, setProductListRefresh }) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false);
  const [categoryListRefresh, setCategoryListRefresh] = useState(false);
  const [loading, setLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState([])
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef(null);
  // const [categoryList, setCategoryList] = useState<any>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    images: [], // 👈 array
    isActive: false,
    discount: 0,
    brand:"",
    discountType: "percentage"
  })
  const dispatch = useAppDispatch();
  const categoryList = useAppSelector((state) => state?.category?.categoryList);

  const isEdit = Boolean(initialData);


  const [showArrow, setShowArrow] = useState(true);

  const handleScroll = () => {
    if (!formRef.current) return;

    if (formRef.current.scrollTop > 10) {
      setShowArrow(false);
    } else {
      setShowArrow(true);
    }
  };

  useEffect(() => {
    console.log(initialData)
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || "",
        category: initialData?.category?._id || "",
        price: initialData.price || "",
        stock: initialData.stock || "",
        description: initialData.description || "",
        images: initialData?.images || [],
        isActive: initialData?.isActive || false,
        discount: initialData?.discount || 0,
        discountType: initialData?.discountType || "percentage",
        brand: initialData?.brand || "",
      })
      setImagePreviews(initialData?.images)
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      brand:"",
      stock: "",
      description: "",
      images: [],
      isActive: false,
      discount: initialData?.discount || 0,
      discountType: initialData?.discountType || "percentage"
    })
    setImagePreviews([])
  }

  const handleChange = (e: FormChangeEvent) => {
    const { name, value, files } = e.target as HTMLInputElement

    if (name === "images" && files && files.length > 0) {
      const filesArray: File[] = Array.from(files)

      const previews = filesArray.map((file: File) => ({
        file,
        url: URL.createObjectURL(file), // ✅ no error now
      }))

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filesArray],
      }))

      setImagePreviews((prev) => [...prev, ...previews])
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].url)

    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))

    if (imagePreviews.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true);
    let obj = { ...formData, shopId: user?.shopId, adminId: user?.id }

    try {
      const payload = new FormData()

      Object.entries(obj).forEach(([key, value]) => {
        if (value === null) return

        if (key === "images" && Array.isArray(value)) {
          value.forEach((file: File) => {
            payload.append("images", file)
          })
        } else {
          payload.append(key, String(value))
        }
      })
      Object.entries(obj).forEach(([key, value]) => {
        console.log(key, value)
      });

      const res = isEdit ? await updateProduct(payload, initialData?._id) : await addProduct(payload)
      console.log(res)
      if (res.status === 200 || res.status === 201) {
        toast({ title: isEdit ? "Update Product" : "Add Product", description: res.data.message });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" })
    }
    finally {
      setLoading(false);
      setProductListRefresh(true);
      onOpenChange();
      resetForm();
    }
  };


  const handleGetCategory = async () => {
    if (!user?.id || !user?.shopId) { return }
    let obj = { userId: user?.id, shopId: user?.shopId }
    try {
      const res = await getCategory(obj);
      // setCategoryList(res?.data?.data);
      dispatch(setCategoryList(res.data.data));
      setCategoryListRefresh(false);
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  };

  useEffect(() => {
    if (categoryList?.length === 0 || categoryListRefresh) {
      handleGetCategory();
    }
  }, [categoryListRefresh, categoryList?.length]);

  return (
    <>
      <AddCategoryDialog isOpen={isOpen} onClose={() => { setIsOpen(false) }} initialData={null} setCategoryListRefresh={setCategoryListRefresh} />
      <Dialog open={open} onOpenChange={(open) => { resetForm(); onOpenChange(open); }}>
        <DialogContent className="max-w-md  p-4">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-sm font-semibold">
              {isEdit ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form ref={formRef} onScroll={handleScroll} className="relative space-y-1 text-sm max-h-[450px] overflow-y-auto no-scrollbar" onSubmit={handleSubmit}>

            {/* Name + Category */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Product Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-8 px-2 text-xs placeholder:text-[12px]"
                  placeholder="Product name"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={formData?.category}
                  onValueChange={(value) => { if (value === "add") { setIsOpen(true) } else { setFormData({ ...formData, category: value }) } }} >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {
                      categoryList?.length > 0 && (
                        categoryList?.map((v) => (
                          <SelectItem value={v?._id} className="text-xs cursor-pointer">{v?.name}</SelectItem>
                        ))
                      )
                    }
                    <SelectItem value="add" className="bg-blue-500 text-white text-xs cursor-pointer pl-16">Add Category</SelectItem>

                  </SelectContent>
                </Select>
                {
                  categoryList?.length === 0 && (
                    <div>
                      <p className="text-xs text-red-500 mt-1">Please Add At List One Category.</p>
                      <button onClick={() => { setIsOpen(true) }} className="bg-blue-500 p-1 text-white rounded  text-xs w-[200px]" type="button">Add Category</button>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Price</Label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="h-8 px-2 text-xs"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Stock</Label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  className="h-8 px-2 text-xs"
                  placeholder="0"
                />
              </div>
            </div>
            {/* Discount + Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
                <Input
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  className="h-8 px-2 text-xs"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Discount Type</Label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="h-8 w-full rounded-md border px-2 text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Brand Name</Label>
              <Input
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                className="h-8 px-2 text-xs"
                placeholder="ex--"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="p-2 text-xs"
                placeholder="Product description"
              />
            </div>

            {/* Image + Status */}
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="space-y-1">
                <Label className="text-xs">Images</Label>
                <Input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  ref={fileInputRef}
                  disabled={formData?.images.length === 4}
                  className="h-8 text-xs placeholder:text-[2px]"
                />
                {formData?.images.length === 4 && <p className="text-xs text-red-500">Max allow 4 Select Image.</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`w-9 h-5 rounded-full transition ${formData.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition transform ${formData.isActive ? "translate-x-4" : "translate-x-1"
                        }`}
                    />
                  </button>
                  <span className="text-xs">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative w-14 h-14 border rounded">
                    <img
                      src={img.url || img}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => { resetForm(); onOpenChange(false); }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-8 px-3 text-xs"
                disabled={loading || !formData?.category || !formData?.description || !formData?.name || !formData?.price || !formData?.stock}
              >
                {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {isEdit ? "Update" : "Add"} Product
              </Button>
            </div>

            {imagePreviews.length !== 0 && showArrow && <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
              <ChevronDown className="h-6 w-6 animate-bounce text-gray-500" />
            </div>}

          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddProductDialog
