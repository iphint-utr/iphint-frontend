import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import pricingReducer from "./slices/pricingSlice";
import dashboardReducer from "./slices/dashboardSlice"
// Import your slices here
//import counterReducer from "./features/counterSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user:userReducer,
      pricing: pricingReducer,
      dashboard: dashboardReducer
    },
  });
};

// Infer types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
