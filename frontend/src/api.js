import { normalizeImage } from "./imageProcessor";
import axios from "axios";

export const API_BASE=import.meta.env.VITE_API_URL||"https://backend-dun-three-20.vercel.app/api";
export const api=axios.create({baseURL:API_BASE});

api.interceptors.request.use(config=>{
  const token=localStorage.getItem("sid_token");
  if(token) config.headers.Authorization=`Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response=>response,
  error=>{
    if(error.response?.status===401){
      localStorage.removeItem("sid_token");
      localStorage.removeItem("sid_user");
      if(window.location.pathname!=="/login") window.location.href="/login";
    }
    return Promise.reject(error);
  }
);

export const errorMessage=error=>
  error.response?.data?.message||error.message||"Something went wrong";

export async function uploadImage(file,category){
  const body=new FormData();
  body.append("image",file);
  body.append("category",category);
  const response=await api.post("/uploads/image",body);
  return response.data.data.fileId;
}
