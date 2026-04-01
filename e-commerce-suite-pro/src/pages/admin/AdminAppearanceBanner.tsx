import { useEffect, useState } from "react";
import { Search, MoreHorizontal, Edit, Trash, Image, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddBannerDialog from "@/components/form/AddBannerDialog";
import {getAllBanners} from "@/services/service";

const AdminAppearanceBanner = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerList, setBannerList] = useState<any[]>([]);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [bannerListRefresh, setBannerListRefresh] = useState(false);

  
  const filteredBanners = bannerList.filter((banner) =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleGetAllBanners = async () => {
    if(!user?.shopId) return;
    try {
      const res = await getAllBanners(user?.shopId);
      console.log(res.data);
      if(res.status === 200){
        setBannerList(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    if(bannerList?.length===0 || bannerListRefresh){
    handleGetAllBanners();
    }
  }, [bannerListRefresh]);

  return (
    <>
    <AddBannerDialog isOpen={bannerDialogOpen} onClose={() => setBannerDialogOpen(false)} initialData={initialData} setBannerListRefresh={setBannerListRefresh} />
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Appearance - Banner</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button className="ml-auto" onClick={()=>{setInitialData(null); setBannerDialogOpen(true)}}>
          + Add Banner
        </Button>
      </div>

      {/* Banner Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">
                    Banner
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBanners.map((banner) => (
                  <tr
                    key={banner._id}
                    className="border-b hover:bg-muted/30"
                  >
                    {/* Image */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={banner.image}
                          alt="banner"
                          className="h-12 w-20 object-cover rounded-md border"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-6 text-sm font-medium">
                      {banner.title}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => {setInitialData(banner); setBannerDialogOpen(true)}}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Banner
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-destructive cursor-pointer">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Banner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AdminAppearanceBanner;