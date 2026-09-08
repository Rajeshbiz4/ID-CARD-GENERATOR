import { useEffect,useState } from "react";
import { Alert,Box,Button,Card,CardContent,Grid,MenuItem,Stack,TextField,Typography } from "@mui/material";
import { SaveRounded,UploadFileRounded } from "@mui/icons-material";
import { useNavigate,useParams } from "react-router-dom";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api,errorMessage,uploadImage } from "../api";
import StoredImage from "../StoredImage";

const emptyStudent={
  name:"",admissionNo:"",rollNo:"",className:"",division:"",gender:"Male",dob:"",
  bloodGroup:"",academicYear:"2026-2027",parentName:"",parentMobile:"",emergencyContact:"",
  address:"",house:"",busRoute:"",photoFileId:null
};

export default function StudentFormPage({user,onLogout}){
  const {id}=useParams();
  const navigate=useNavigate();
  const [form,setForm]=useState(emptyStudent);
  const [error,setError]=useState("");
  const [uploading,setUploading]=useState(false);

  useEffect(()=>{
    if(!id)return;
    api.get(`/students/${id}`).then(r=>{
      const value=r.data.data;
      setForm({...emptyStudent,...value,dob:value.dob?value.dob.slice(0,10):""});
    });
  },[id]);

  const uploadPhoto=async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    setUploading(true);setError("");
    try{
      const fileId=await uploadImage(file,"student-photo");
      setForm(current=>({...current,photoFileId:fileId}));
    }catch(e){setError(errorMessage(e))}
    finally{setUploading(false)}
  };

  const save=async()=>{
    setError("");
    try{
      if(id)await api.put(`/students/${id}`,form);
      else await api.post("/students",form);
      navigate("/school/students");
    }catch(e){setError(errorMessage(e))}
  };

  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="Students" title={id?"Edit student":"Add student"} description="Upload the student photo directly. No image URL is required."/>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    <Card><CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Box sx={{minHeight:230,border:"1px solid #cbd5e1",bgcolor:"#f8fafc",display:"grid",placeItems:"center",p:2}}>
            {form.photoFileId?
              <StoredImage fileId={form.photoFileId} sx={{width:150,height:180,objectFit:"cover"}}/>:
              <Typography color="text.secondary">No photo</Typography>}
          </Box>
          <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileRounded/>} sx={{mt:1}} disabled={uploading}>
            {uploading?"Uploading...":"Upload photo"}
            <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto}/>
          </Button>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {[["name","Student name",8],["admissionNo","Admission number",4],["className","Class",3],["division","Division",3],
              ["rollNo","Roll no.",3],["bloodGroup","Blood group",3],["academicYear","Academic year",4],["parentName","Parent name",4],
              ["parentMobile","Parent mobile",4],["address","Address",12]
            ].map(([key,label,cols])=><Grid item xs={12} md={cols} key={key}>
              <TextField fullWidth multiline={key==="address"} label={label} value={form[key]||""}
                onChange={e=>setForm({...form,[key]:e.target.value})}/>
            </Grid>)}
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="date" label="DOB" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} InputLabelProps={{shrink:true}}/>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Gender" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                {["Male","Female","Other"].map(value=><MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="flex-end" sx={{mt:3}}>
        <Button variant="contained" startIcon={<SaveRounded/>} onClick={save}>{id?"Save changes":"Create student"}</Button>
      </Stack>
    </CardContent></Card>
  </Layout>
}
