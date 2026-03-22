import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addCategory, updateCategory, getCategory } from "@/services/service"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { setCategoryList } from "@/redux-toolkit/slice/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/hooks/hook"

const AddCategoryDialog = ({ isOpen, initialData, onClose, setCategoryListRefresh }) => {
  const { user } = useAuth()
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  // const [categoryList, setCategoryList] = useState<any>([])
  const isEdit = Boolean(initialData);
  const dispatch = useAppDispatch();
    const categoryList = useAppSelector((state) => state?.category?.categoryList);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
  }

  // ✅ Prefill data in edit mode
  useEffect(() => {
    if (isEdit) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setStatus(initialData.status || "active")
    } else {
      setName("")
      setDescription("")
      setStatus("active")
    }
  }, [initialData, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const categoryData = {id:initialData?._id, name, description, status, userId: user?.id, shopId: user?.shopId }
    let res = null;
    try {
      if (isEdit) {
        res = await updateCategory(categoryData);
      } else {
        res = await addCategory(categoryData);
      }
      console.log(res)
      if (res.status === 201 || res.status === 200) {
        toast({ title: isEdit ? "Update Category" : "Add Category", description: res.data.message })
        onClose?.()
        resetForm();
        setCategoryListRefresh(true);
      }
    } finally {
      setLoading(false)
    }
  };

  
    const handleGetCategory = async () => {
      if (!user?.id || !user?.shopId) { return alert("missing")}
      let obj = { userId: user?.id, shopId: user?.shopId }
      try {
        const res = await getCategory(obj);
        dispatch(setCategoryList(res.data.data));
      }
      catch (err) {
        console.log(err);
        toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
      }
    };
  
    useEffect(() => {
      if(categoryList?.length===0){
handleGetCategory();
      }
    }, [categoryList?.length]);

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => { if (loading) return onClose(); resetForm() }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <Dialog open={isOpen} onOpenChange={onClose} >
          <DialogContent className="w-[430px]">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>

          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter category description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading || !name || !description} onClick={handleSubmit} >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? isEdit ? "Updating..." : "Saving..."
                : isEdit ? "Update" : "Save"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => { onClose; resetForm }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
       
         </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default AddCategoryDialog;
