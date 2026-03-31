import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../slice/cartSlice";
import wishListReducer from "../slice/wishListSlice";
import categoryReducer from "../slice/categorySlice";
import productReducer from "../slice/productSlice";
import userReducer from "../slice/userSlice";
import orderReducer from "../slice/orderSlice";
import dashboardReducer from "../slice/dashboardSlice";
import settingReducer from "../slice/settingSlice";
import reviewReducer from "../slice/reviewSlice";
import shopReducer from "../slice/shopSlice";


export const store = configureStore({
    reducer: {
        cart: cartReducer,
        wishList: wishListReducer,
        category:categoryReducer,
        product: productReducer,
        user: userReducer,
        order: orderReducer,
        dashboard:dashboardReducer,
        setting: settingReducer,
        review: reviewReducer,
        shop: shopReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;