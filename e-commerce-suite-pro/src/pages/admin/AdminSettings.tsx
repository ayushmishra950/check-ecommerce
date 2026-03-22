import { useEffect, useState } from 'react';
import { Save, Lock, Bell, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAdminData, updateAdminData } from "@/services/service";
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/hooks/hook';
import { setSettingList } from '@/redux-toolkit/slice/settingSlice';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeSettings, setStoreSettings] = useState({ storeName: '', storeEmail: '', currency: '', taxPercentage: "0", shippingCharge: "0", freeShippingAbove: "0", });
  // const [userData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [security, setSecurity] = useState({ twoFactorAuth: true });
  const [notifications, setNotifications] = useState({ orderUpdates: true, newCustomers: true, lowStock: false });
   const dispatch = useAppDispatch();
   const userData = useAppSelector((state)=> state?.setting?.settingData);

  const handleUpdateProfile = async () => {
    if (!user?.id || !user?.shopId || !storeSettings?.storeName || !storeSettings?.currency || !profile?.name) return;
    try {
      const res = await updateAdminData(user?.id, user?.shopId, storeSettings, profile);
      console.log(res);
      if (res.status === 200) {
        toast({ title: "Profile Updated.", description: res.data.message });
        handleGetUser();
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }
  const handleGetUser = async () => {
    if (!user?.id || !user?.shopId) return;
    try {
      const res = await getAdminData(user?.id, user?.shopId);
      console.log(res);
      if (res.status === 200) {
        // setUserData(res.data);
        dispatch(setSettingList(res?.data))
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    if (!userData) return;
    // Store
    console.log(userData)
    setStoreSettings({
      storeName: userData?.shopId?.name || "",
      storeEmail: userData?.shopId?.email || "",
      currency: userData?.shopId?.currency || "",
      taxPercentage: userData?.shopId?.taxPercentage || "0",
      shippingCharge: userData?.shopId?.shippingCharge || "0",
      freeShippingAbove: userData?.shopId?.freeShippingAbove || "0",
    });
    // Profile
    setProfile({
      name: userData?.name || "",
      email: userData?.email || "",
    });
    // Security
    setSecurity({
      twoFactorAuth: userData.admin?.twoFactorAuth ?? false,
    });
    // Notifications
    setNotifications({
      orderUpdates: userData.notifications?.orderUpdates ?? false,
      newCustomers: userData.notifications?.newCustomers ?? false,
      lowStock: userData.notifications?.lowStock ?? false,
    });

  }, [userData]);


  useEffect(() => {
    if(userData===null){
    handleGetUser();
    }
  }, [userData])

  return (
    <div className="space-y-6">
      {/* Store Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Store className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">

          <div className="space-y-1">
            <Label>Store Name</Label>
            <Input
              value={storeSettings.storeName}
              onChange={(e) =>
                setStoreSettings({ ...storeSettings, storeName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Store Email</Label>
            <Input
              type="email"
              disabled
              value={storeSettings.storeEmail}
            />
          </div>

          <div className="space-y-1">
            <Label>Currency</Label>
            <Input
              value={storeSettings.currency}
              onChange={(e) =>
                setStoreSettings({ ...storeSettings, currency: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Tax Percentage (%)</Label>
            <Input
              type="number"
              value={storeSettings.taxPercentage}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  taxPercentage: (e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Shipping Charge</Label>
            <Input
              type="number"
              value={storeSettings.shippingCharge}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  shippingCharge: (e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Free Shipping Above</Label>
            <Input
              type="number"
              value={storeSettings.freeShippingAbove}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  freeShippingAbove: (e.target.value),
                })
              }
            />
          </div>

        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-xl">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={profile.email}
              disabled
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <Label>Two-Factor Authentication</Label>
            <Switch
              checked={security.twoFactorAuth}
              onCheckedChange={(value) =>
                setSecurity({ ...security, twoFactorAuth: value })
              }
            />
          </div>

          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <Label>Order Updates</Label>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(value) =>
                setNotifications({ ...notifications, orderUpdates: value })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>New Customers</Label>
            <Switch
              checked={notifications.newCustomers}
              onCheckedChange={(value) =>
                setNotifications({ ...notifications, newCustomers: value })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Low Stock Alerts</Label>
            <Switch
              checked={notifications.lowStock}
              onCheckedChange={(value) =>
                setNotifications({ ...notifications, lowStock: value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end" onClick={handleUpdateProfile}>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
