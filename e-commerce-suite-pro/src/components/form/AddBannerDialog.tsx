import { useState, useEffect } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addBanner, updateBanner } from "@/services/service";

const AddBannerDialog = ({ isOpen, initialData, onClose, setBannerListRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setImageFile(null);
    setPreview("");
    setStatus("active");
  };

  // ✅ Prefill (edit mode)
  useEffect(() => {
    if (isEdit) {
      setTitle(initialData?.title || "");
      setPreview(initialData?.image || ""); // existing image
      setStatus(initialData?.isActive ? "active" : "inactive");
    } else {
      resetForm();
    }
  }, [initialData]);

  // ✅ Handle file change
  const handleImageChange = (file) => {
    if (!file) return;

    setImageFile(file);

    // preview generate
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("isActive", status);
    formData.append("userId", user?.id);
    formData.append("shopId", user?.shopId);

    if (imageFile) {
      formData.append("image", imageFile); // backend me multer handle karega
    }

    try {
      let res;
      if (isEdit) {
        res = await updateBanner(initialData?._id, formData);
      } else {
        res = await addBanner(formData);
      }

      if (res.status === 200 || res.status === 201) {
        toast({
          title: isEdit ? "Update Banner" : "Add Banner",
          description: res.data.message,
        });

        onClose();
        resetForm();
        setBannerListRefresh(true);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (loading) return;
          onClose();
          resetForm();
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="w-[430px]">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Edit Banner" : "Add Banner"}
              </DialogTitle>
            </DialogHeader>

            {/* Title */}
            <div className="space-y-2">
              <Label>Banner Title</Label>
              <Input
                placeholder="Enter banner title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Upload Image</Label>

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files[0])}
                disabled={loading}
              />

              {/* Preview */}
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Status */}
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

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                disabled={loading || !title || !preview}
                onClick={handleSubmit}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Saving..."
                  : isEdit
                  ? "Update"
                  : "Save"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AddBannerDialog;