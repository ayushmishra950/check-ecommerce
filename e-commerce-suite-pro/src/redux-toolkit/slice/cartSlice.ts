import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types";

interface CartQuantity extends CartItem {
    quantity: number;
    totalPrice: number;
}
interface Carts {
    cartList: CartQuantity[];
    cartSummary: any;
}

const initialState: Carts = {
    cartList: [],
    cartSummary: null,
};


const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const item = state.cartList.find((v) => v?._id === action.payload._id);
            console.log(item)
            if (item) {
                item.quantity += 1;
                item.totalPrice = item.price * item.quantity;
            } else {
                state.cartList.push({ ...action.payload, quantity: 1, totalPrice: action.payload.price });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartList = state.cartList.filter((item) => item._id !== action.payload);
        },
        clearCart: (state) => {
            state.cartList = [];
        },

        incrementQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartList.find((v) => v._id === action.payload);
            if (item) {
                item.quantity += 1;
                item.totalPrice = item.price * item.quantity;
            }
        },
        decrementQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartList.find((v) => v._id === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                item.totalPrice = item.price * item.quantity;
            }
        },
        setCartList: (state, action) => {
            state.cartList = action.payload;
        },
        setCartSummary: (state, action) => {
            state.cartSummary = action.payload;
        }

    },
});

export const { addToCart, removeFromCart, setCartSummary, clearCart, incrementQuantity, decrementQuantity, setCartList } = cartSlice.actions;
export default cartSlice.reducer;