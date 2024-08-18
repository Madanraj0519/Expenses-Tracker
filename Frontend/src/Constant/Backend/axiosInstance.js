import axios from "axios";
import { BASE_BACKEND_URL } from "./constant";


const axiosInstance = axios.create({
    baseURL : BASE_BACKEND_URL,
    timeout : 10000,
    // withCredentials : true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default axiosInstance;