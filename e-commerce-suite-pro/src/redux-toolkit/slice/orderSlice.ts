import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    orderList : [],
    singleOrderList: [],
}


const orderSlice = createSlice({
    name:"Order",
    initialState,
    reducers:{
        setOrderList : (state, action:PayloadAction<any>) => {
            state.orderList = action.payload
        },
        setMyOrderList: (state, action) => {
            state.singleOrderList = action.payload;
        }
    }
})

export const {setOrderList, setMyOrderList} = orderSlice.actions;
export default orderSlice.reducer;