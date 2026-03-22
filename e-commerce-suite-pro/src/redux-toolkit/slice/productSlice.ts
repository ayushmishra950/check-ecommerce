import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    productList : [],
    singleProduct : null,
    relatedProduct:[]
}


const productSlice = createSlice({
    name:"Products",
    initialState,
    reducers : {
         setProductList : (state, action:PayloadAction<any>) => {
            state.productList = action?.payload;
         },
          setSingleProduct : (state, action:PayloadAction<any>) => {
            state.singleProduct = action?.payload;
         },
         setRelatedProduct : (state, action:PayloadAction<any>) => {
            state.relatedProduct = action?.payload;
         },

    }
})

export const {setProductList, setSingleProduct, setRelatedProduct} = productSlice?.actions;

export default productSlice.reducer;