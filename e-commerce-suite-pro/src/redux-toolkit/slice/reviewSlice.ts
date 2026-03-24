import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    reviewList : [],
}


const reviewSlice = createSlice({
    name:"Review",
    initialState,
    reducers:{
        setReviewList : (state, action:PayloadAction<any>) => {
            state.reviewList = action.payload
        }
    }
})

export const {setReviewList} = reviewSlice.actions;
export default reviewSlice.reducer;