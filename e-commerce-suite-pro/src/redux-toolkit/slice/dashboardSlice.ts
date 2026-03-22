import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    dashboardSummary : null,
    dashboardOverview:null
}


const dashboardSlice = createSlice({
    name:"Dashboard",
    initialState,
    reducers:{
        setDashboardSummary : (state, action:PayloadAction<any>) => {
            state.dashboardSummary = action.payload
        },
         setDashboardOverview : (state, action:PayloadAction<any>) => {
            state.dashboardOverview = action.payload
        }
    }
})

export const {setDashboardSummary, setDashboardOverview} = dashboardSlice.actions;
export default dashboardSlice.reducer;