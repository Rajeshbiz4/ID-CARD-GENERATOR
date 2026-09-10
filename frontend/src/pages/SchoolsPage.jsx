import { useEffect,useState } from "react";
import { Alert,Box,Button,Chip,Dialog,DialogActions,DialogContent,DialogTitle,Grid,IconButton,TextField } from "@mui/material";
import { AddRounded,PowerSettingsNewRounded } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api,errorMessage } from "../api";
import {
  MarathiTextField,
  TypingLanguageBar,
  useTypingLanguage,
} from "../MarathiTyping";

const blank={name:"",schoolCode:"",contactPersonName:"",email:"",mobile:"",address:"",city:"",state:"",pinCode:"",password:"School@123"};

export default function SchoolsPage({user,onLogout}){
  const [rows,setRows]=useState([]),[open,setOpen]=useState(false),[form,setForm]=useState(blank),[error,setError]=useState("");
  const [typingLanguage,setTypingLanguage]=useTypingLanguage();
  const load=()=>api.get("/admin/schools").then(r=>setRows(r.data.data));
  useEffect(()=>{load()},[]);

  const create=async()=>{
    setError("");
    try{await api.post("/admin/schools",form);setForm(blank);setOpen(false);load()}
    catch(e){setError(errorMessage(e))}
  };
  const toggle=async row=>{
    await api.patch(`/admin/schools/${row._id}/status`,{status:row.status==="ACTIVE"?"INACTIVE":"ACTIVE"});
    load();
  };
  const columns=[
    {field:"schoolCode",headerName:"School Code",width:140},
    {field:"name",headerName:"School Name",minWidth:230,flex:1},
    {field:"email",headerName:"Login Email",minWidth:230,flex:1},
    {field:"status",headerName:"Status",width:120,renderCell:({value})=><Chip label={value} size="small" color={value==="ACTIVE"?"success":"default"} variant="outlined"/>},
    {field:"action",headerName:"",width:70,renderCell:({row})=><IconButton onClick={()=>toggle(row)}><PowerSettingsNewRounded/></IconButton>}
  ];
  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="Admin" title="Schools" description="Register schools and manage school login access."
      action={<Button variant="contained" startIcon={<AddRounded/>} onClick={()=>setOpen(true)}>Register school</Button>}/>
    <Box sx={{height:620,bgcolor:"#fff",border:"1px solid #e2e8f0"}}>
      <DataGrid rows={rows} getRowId={row=>row._id} columns={columns} disableRowSelectionOnClick/>
    </Box>
    <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Register school</DialogTitle>
      <DialogContent dividers>
        {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
        <TypingLanguageBar value={typingLanguage} onChange={setTypingLanguage}/>
        <Grid container spacing={2}>
          {[["name","School name",8],["schoolCode","School code",4],["contactPersonName","Contact person",6],["email","Login email",6],
            ["mobile","Mobile",6],["password","Temporary password",6],["address","Address",12],["city","City",4],["state","State",4],["pinCode","PIN",4]
          ].map(([key,label,cols])=><Grid item xs={12} md={cols} key={key}>
            {["name","contactPersonName","address","city","state"].includes(key) ? (
              <MarathiTextField
                typingLanguage={typingLanguage}
                label={label}
                value={form[key]}
                onValueChange={value=>setForm({...form,[key]:value})}
              />
            ) : (
              <TextField
                fullWidth
                label={label}
                value={form[key]}
                onChange={e=>setForm({...form,[key]:e.target.value})}
              />
            )}
          </Grid>)}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={create}>Create</Button>
      </DialogActions>
    </Dialog>
  </Layout>
}
