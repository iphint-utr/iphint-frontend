import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/userSlice";
import userReducer from "./slices/userSlice";
import pricingReducer from "./slices/pricingSlice";
import dashboardReducer from "./slices/dashboardSlice"
import scanReducer from "./slices/scanSlice";
// Import your slices here
//import counterReducer from "./features/counterSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      scan: scanReducer,
      user:userReducer,
      pricing: pricingReducer,
      
    },
  });
};

// Infer types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
