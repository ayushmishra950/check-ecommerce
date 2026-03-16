import api from "@/api/axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL

// Admin Controllers for Only Admin Not Users==================================
//===============================================================================
//===============================================================================
//===============================================================================

export const registerUser = async (obj: any) => {
    const res = await api.post(`/api/user/auth/register`, obj);
    return res;
}


export const loginUser = async (obj: any) => {
    const res = await api.post(`/api/admin/auth/login`, obj);
    return res;
}

export const addCategory = async (obj: any) => {
    const res = await api.post(`/api/admin/category`, obj);
    return res;
}

export const updateCategory = async (obj: any) => {
    const res = await api.put(`/api/admin/category`, obj);
    return res;
}


export const deleteCategory = async (obj: any) => {
    const res = await api.delete(`/api/admin/category`, { params: obj });
    return res;
}


export const getCategory = async (obj: any) => {
    const res = await api.get(`/api/admin/category`, { params: obj });
    return res;
}


export const categoryStatus = async (obj: any) => {
    const res = await api.patch(`/api/admin/category/status`, obj);
    return res;
}


export const addProduct = async (obj: any) => {
    const res = await api.post(`/api/admin/product`, obj);
    return res;
}


export const getProduct = async (shopId: string, adminId: string) => {
    const res = await api.get(`/api/admin/product`, { params: { shopId, adminId } });
    return res;
}


export const updateProduct = async (obj: any, id: string) => {
    const res = await api.put(`/api/admin/product/${id}`, obj);
    return res;
}


export const deleteProduct = async (obj: any) => {
    const res = await api.delete(`/api/admin/product`, { params: obj });
    return res;
}


export const productStatus = async (obj: any) => {
    const res = await api.patch(`/api/admin/product/status`, obj);
    return res;
};

export const getAdminProductById = async (id: string) => {
    const res = await api.get(`/api/admin/product/${id}`);
    return res;
};

export const getAdminData = async (id: string, shopId: string) => {
    const res = await api.get(`/api/admin/auth/getbyid`, { params: { id, shopId } });
    return res;
}


export const updateAdminData = async (id: string, shopId: string, storeSettings: any, profile: any) => {
    const res = await api.put(`/api/admin/auth/update`, { id, shopId, storeSettings, profile });
    return res;
}


export const getAllOrder = async () => {
    const res = await api.get("/api/admin/order/get");
    return res;
}

export const updateOrderStatus = async (obj:any) => {
    const res = await api.put("/api/admin/order/status", obj);
    return res;
}


export const getAllCustomer = async () => {
    const res = await api.get("/api/admin/user/get");
    return res;
}


export const blockAndUnBlockCustomer = async (obj) => {
    const res = await api.patch("/api/admin/block/toggle", obj);
    return res;
}

export const getAllBlockCustomerList = async () => {
    const res = await api.get("/api/admin/block/get");
    return res;
}


export const getDashboardSummary = async () => {
    const res = await api.get("/api/admin/dashboard/dashboardsummary");
    return res;
}



export const getDashboardOverview = async () => {
    const res = await api.get("/api/admin/dashboard/dashboardoverveiw");
    return res;
}



// User Controllers for Only Users Not Admin==================================
//===============================================================================
//===============================================================================
//===============================================================================



export const getCategoryByUsers = async () => {
    const res = await api.get(`/api/user/product/category/allCategory`);
    return res;
}


export const getProductByCategoryId = async (id: string) => {
    const res = await api.get(`/api/user/product/allproduct/${id}`);
    return res;
}


export const getProductById = async (id: string) => {
    const res = await api.get(`/api/user/product/${id}`);
    return res;
}


export const getProductsByUsers = async () => {
    const res = await api.get(`/api/user/product`);
    return res;
}

export const addAndRemoveProductWishList = async (id: string) => {
    const res = await api.put(`/api/user/wishlist/toggle`, { productId: id });
    return res;
}



export const getProductToWishlist = async () => {
    const res = await api.get(`/api/user/wishlist/get`);
    return res;
}


export const clearWishList = async (userId: string) => {
    const res = await api.delete(`/api/user/wishlist/clear`, { params: { userId } });
    return res;
}

export const moveToCart = async (userId: string, productId: string) => {
    const res = await api.patch(`/api/user/wishlist/movetocart`, { userId, productId });
    return res;
}



export const allMoveToCart = async (userId: string) => {
    const res = await api.patch(`/api/user/wishlist/allmovetocart`, { userId });
    return res;
}



export const addCart = async (id: string, quantity: number) => {
    const res = await api.post(`/api/user/cart/add`, { productId: id, quantity: quantity });
    return res;
}


export const updateCart = async (obj) => {
    const res = await api.patch(`/api/user/cart/update`, obj);
    return res;
}

export const getCart = async () => {
    const res = await api.get(`/api/user/cart/get`);
    return res;
}


export const removeCart = async (id: string) => {
    const res = await api.delete(`/api/user/cart/remove/${id}`);
    return res;
}


export const clearCart = async () => {
    const res = await api.delete(`/api/user/cart/clear`);
    return res;
}






export const addOrder = async (shippingAddress: any, paymentMethod: any) => {
    const res = await api.post(`/api/user/order/add`, { shippingAddress, paymentMethod });
    return res;
}


export const updateOrder = async (obj) => {
    const res = await api.patch(`/api/user/order/update`, obj);
    return res;
}

export const getOrder = async () => {
    const res = await api.get(`/api/user/order/my-orders`);
    return res;
}


export const getOrderById = async () => {
    const res = await api.get(`/api/user/order/getbyid`);
    return res;
}



export const removeOrder = async (id: string) => {
    const res = await api.delete(`/api/user/order/remove/${id}`);
    return res;
}


export const clearOrder = async () => {
    const res = await api.delete(`/api/user/order/clear`);
    return res;
}


export const addRating = async (obj: any) => {
    const res = await api.post(`/api/user/rating/add`, obj);
    return res;
}


export const getAllRating = async () => {
    const res = await api.get(`/api/user/rating/allProduct`);
    return res;
}



export const getUnratedProduct = async (productIds: string[]) => {
    const res = await api.get(`/api/user/rating/product`, { params: { productIds: productIds } });
    return res;
}



export const updateRating = async (obj: any) => {
    const res = await api.put(`/api/user/rating/update`, obj);
    return res;
}



export const deleteRating = async (id: string) => {
    const res = await api.delete(`/api/user/rating/delete/${id}`);
    return res;
}




