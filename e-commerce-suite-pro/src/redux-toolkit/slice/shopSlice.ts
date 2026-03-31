import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ShopState {
    shopData: any;
}

const initialState: ShopState = {
    shopData : {}
}


const shopSlice = createSlice({
    name:"Shop",
    initialState,
    reducers:{
        setShopData : (state, action:PayloadAction<any>) => {
            state.shopData = action.payload
        }
    }
})

export const {setShopData} = shopSlice.actions;
export default shopSlice.reducer;