import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    customerList : [],
    blockList:[]
}


const userSlice = createSlice({
    name:"User",
    initialState,
    reducers:{
        setCustomerList : (state, action:PayloadAction<any>) => {
            state.customerList = action.payload
        },
        setBlockCustomerList : (state, action:PayloadAction<any>) => {
            console.log(action.payload)
            state.blockList = action.payload
        }
    }
})

export const {setCustomerList, setBlockCustomerList} = userSlice.actions;
export default userSlice.reducer;