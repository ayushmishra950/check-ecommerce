import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    settingData : null
}


const settingSlice = createSlice({
    name:"Settings",
    initialState,
    reducers : {
         setSettingList : (state, action:PayloadAction<any>) => {
            state.settingData = action?.payload;
         }
    }
})

export const {setSettingList} = settingSlice?.actions;

export default settingSlice.reducer;