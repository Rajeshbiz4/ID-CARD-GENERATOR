import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { api } from "./api";

export function useStoredImage(fileId){
  const [src,setSrc]=useState("");
  useEffect(()=>{
    let active=true;
    let objectUrl="";
    if(!fileId){setSrc("");return;}
    api.get(`/files/${fileId}`,{responseType:"blob"})
      .then(response=>{
        if(!active)return;
        objectUrl=URL.createObjectURL(response.data);
        setSrc(objectUrl);
      })
      .catch(()=>active&&setSrc(""));
    return ()=>{
      active=false;
      if(objectUrl)URL.revokeObjectURL(objectUrl);
    };
  },[fileId]);
  return src;
}

export default function StoredImage({fileId,alt="",sx,fallback}){
  const src=useStoredImage(fileId);
  if(!src&&fallback)return fallback;
  if(!src)return null;
  return <Box component="img" src={src} alt={alt} sx={sx}/>;
}
