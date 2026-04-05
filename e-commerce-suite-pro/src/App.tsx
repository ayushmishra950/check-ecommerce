import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

// Layouts
import { UserLayout } from "@/components/layout/UserLayout";
import AdminLayout from "@/pages/admin/AdminLayout";
import SuperAdminLayout from "@/pages/superadmin/SuperAdminLayout";
import { useAuth } from "@/context/AuthContext";

// User Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import WishlistPage from "./pages/WishlistPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrdersPage from "./pages/OrdersPage";
import UserSettings from "./pages/UserSettings";
import Category from "./pages/Category";
import LoginSuccess from "@/token/LoginSuccess";
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminSingleProduct from "@/pages/admin/AdminSingleProduct";
import AdminAppearanceBanner from "@/pages/admin/AdminAppearanceBanner";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminManagement from "./pages/superadmin/AdminManagement";
import RolesPermissions from "./pages/superadmin/RolesPermissions";
import RoleRoute from "@/routes/RoleRoute";
import ReviewPage from "./pages/ReviewPage";

const queryClient = new QueryClient();

const HomeRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Index /> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* User Routes */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login-success" element={<LoginSuccess />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ordersuccess" element={<OrderSuccess />} />
                <Route path="/orderpage" element={<OrdersPage />} />
                <Route path="/setting" element={<UserSettings />} />
                <Route path="/reviewpage" element={<ReviewPage />} />
                <Route path="/category" element={<Category />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="product/:id" element={<AdminSingleProduct />} />
                  <Route path="appearance" element={<AdminAppearanceBanner />} />
                </Route>
              </Route>

              {/* Super Admin Routes */}
              <Route element={<RoleRoute allowedRoles={["superadmin"]} />}>
                <Route path="/superadmin" element={<SuperAdminLayout />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="admins" element={<AdminManagement />} />
                  <Route path="roles" element={<RolesPermissions />} />
                  <Route path="activity" element={<SuperAdminDashboard />} />
                  <Route path="platform" element={<SuperAdminDashboard />} />
                  <Route path="reports" element={<SuperAdminDashboard />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;



