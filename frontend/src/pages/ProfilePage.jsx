import { useEffect,useState } from "react";
import { Alert,Box,Button,Card,CardContent,Grid,Stack,TextField,Typography } from "@mui/material";
import { SaveRounded,UploadFileRounded } from "@mui/icons-material";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api,errorMessage,uploadImage } from "../api";
import StoredImage from "../StoredImage";

export default function ProfilePage({user,onLogout}){
  const [form,setForm]=useState({});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  useEffect(()=>{api.get("/school/profile").then(r=>setForm(r.data.data))},[]);

  const upload=async(event,category,field)=>{
    const file=event.target.files?.[0];
    if(!file)return;
    setError("");
    try{
      const fileId=await uploadImage(file,category);
      setForm(current=>({...current,[field]:fileId}));
    }catch(e){setError(errorMessage(e))}
  };

  const save=async()=>{
    setError("");setMessage("");
    try{
      const r=await api.put("/school/profile",form);
      setForm(r.data.data);
      setMessage("School profile saved.");
    }catch(e){setError(errorMessage(e))}
  };

  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="Branding" title="School profile" description="Logo and principal signature are uploaded into MongoDB GridFS."/>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    {message&&<Alert severity="success" sx={{mb:2}}>{message}</Alert>}

    <Grid container spacing={2}>
      <Grid item xs={12} lg={4}>
        <Card><CardContent>
          <Typography variant="h6">School logo</Typography>
          <Box sx={{mt:2,minHeight:180,border:"1px solid #cbd5e1",display:"grid",placeItems:"center",bgcolor:"#f8fafc"}}>
            {form.logoFileId?<StoredImage fileId={form.logoFileId} sx={{maxWidth:170,maxHeight:150,objectFit:"contain"}}/>:<Typography color="text.secondary">No logo</Typography>}
          </Box>
          <Button fullWidth component="label" variant="outlined" startIcon={<UploadFileRounded/>} sx={{mt:1}}>
            Upload logo
            <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e,"school-logo","logoFileId")}/>
          </Button>

          <Typography variant="h6" sx={{mt:3}}>Principal signature</Typography>
          <Box sx={{mt:2,minHeight:110,border:"1px solid #cbd5e1",display:"grid",placeItems:"center",bgcolor:"#f8fafc"}}>
            {form.principalSignatureFileId?<StoredImage fileId={form.principalSignatureFileId} sx={{maxWidth:180,maxHeight:90,objectFit:"contain"}}/>:<Typography color="text.secondary">No signature</Typography>}
          </Box>
          <Button fullWidth component="label" variant="outlined" startIcon={<UploadFileRounded/>} sx={{mt:1}}>
            Upload signature
            <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e,"principal-signature","principalSignatureFileId")}/>
          </Button>
        </CardContent></Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card><CardContent>
          <Grid container spacing={2}>
            {[["name","School name",8],["tagline","Tagline",4],["academicYear","Academic year",4],["principalName","Principal name",4],
              ["mobile","Mobile",4],["email","Email",6],["website","Website",6],["address","Address",12],["city","City",4],["state","State",4],["pinCode","PIN",4]
            ].map(([key,label,cols])=><Grid item xs={12} md={cols} key={key}>
              <TextField fullWidth label={label} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/>
            </Grid>)}
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{mt:3}}>
            <Button variant="contained" startIcon={<SaveRounded/>} onClick={save}>Save profile</Button>
          </Stack>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Layout>
}
