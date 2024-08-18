import  { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore} from "redux-persist";
import userAuthReducer from "../Feature/Auth/userAuthSlice";
import storage from "redux-persist/lib/storage";


const rootReducer = combineReducers({
    authUser : userAuthReducer,
});


const persistConfig = {
    key : 'root',
    version : 1,
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer : persistedReducer,
    middleware : (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck : false,
    })
});


export const persistor = persistStore(store);