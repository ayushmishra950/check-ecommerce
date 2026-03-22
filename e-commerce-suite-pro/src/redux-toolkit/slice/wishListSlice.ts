import {createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    wishList: []
};

const wishListSlice = createSlice({
    name: "wishList",
    initialState,
    reducers: {
        addAndRemoveWishList:(state, action: PayloadAction<any>) => {
            const item = state.wishList.find((v) => v._id === action.payload._id);
            if (item) {
                state.wishList = state.wishList.filter((v) => v._id !== action.payload._id);
        
            } else {
                state.wishList.push(action.payload);
               
            }
        },
        setWishList : (state, action) => {
         state.wishList = action.payload;
        },
    },
}); 

export const { addAndRemoveWishList, setWishList } = wishListSlice.actions;
export default wishListSlice.reducer;