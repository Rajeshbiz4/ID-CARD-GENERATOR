import { useEffect,useMemo,useRef,useState } from "react";
import { Box,Button,Card,CardContent,Grid,MenuItem,Stack,TextField,Typography } from "@mui/material";
import { DownloadRounded,PictureAsPdfRounded } from "@mui/icons-material";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api } from "../api";
import TemplateRenderer from "../TemplateRenderer";

export default function IdCardsPage({user,onLogout}){
  const cardRef=useRef(null);
  const [students,setStudents]=useState([]);
  const [school,setSchool]=useState({});
  const [templates,setTemplates]=useState([]);
  const [settings,setSettings]=useState({});
  const [studentId,setStudentId]=useState("");

  useEffect(()=>{
    Promise.all([api.get("/students"),api.get("/school/profile"),api.get("/templates"),api.get("/school/template-settings")])
      .then(([a,b,c,d])=>{
        setStudents(a.data.data);setSchool(b.data.data);setTemplates(c.data.data);setSettings(d.data.data);
        if(a.data.data[0])setStudentId(a.data.data[0]._id);
      });
  },[]);

  const student=useMemo(()=>students.find(item=>item._id===studentId),[students,studentId]);
  const template=useMemo(()=>{
    const selectedId=settings.templateId?._id||settings.templateId;
    return templates.find(item=>item._id===selectedId)||templates[0];
  },[templates,settings]);

  const selectTemplate=async templateId=>{
    const response=await api.put("/school/template-settings",{templateId});
    setSettings(response.data.data);
  };

  const capture=async()=>{
    await new Promise(resolve=>setTimeout(resolve,300));
    return html2canvas(cardRef.current,{scale:3,backgroundColor:"#fff",useCORS:true});
  };

  const downloadPng=async()=>{
    const canvas=await capture();
    const link=document.createElement("a");
    link.download=`${student.admissionNo}-id-card.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
    await api.patch(`/students/${student._id}/card-generated`);
  };

  const downloadPdf=async()=>{
    const canvas=await capture();
    const portrait=template.orientation!=="landscape";
    const width=portrait?53.98:85.6;
    const height=portrait?85.6:53.98;
    const pdf=new jsPDF({orientation:portrait?"portrait":"landscape",unit:"mm",format:[width,height]});
    pdf.addImage(canvas.toDataURL("image/png"),"PNG",0,0,width,height);
    pdf.save(`${student.admissionNo}-id-card.pdf`);
    await api.patch(`/students/${student._id}/card-generated`);
  };

  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="ID Studio" title="Generate student ID card"
      description="Choose from all system and school custom templates, then export PNG or PDF."/>
    <Grid container spacing={2}>
      <Grid item xs={12} lg={4}>
        <Card><CardContent>
          <Stack spacing={2}>
            <TextField select label="Student" value={studentId} onChange={e=>setStudentId(e.target.value)}>
              {students.map(item=><MenuItem key={item._id} value={item._id}>{item.name} · {item.className}-{item.division}</MenuItem>)}
            </TextField>
            <TextField select label="Template" value={template?._id||""} onChange={e=>selectTemplate(e.target.value)}>
              {templates.map(item=><MenuItem key={item._id} value={item._id}>{item.name} · {item.type}</MenuItem>)}
            </TextField>
            <Button variant="outlined" startIcon={<DownloadRounded/>} disabled={!student} onClick={downloadPng}>Download PNG</Button>
            <Button variant="contained" startIcon={<PictureAsPdfRounded/>} disabled={!student} onClick={downloadPdf}>Download PDF</Button>
          </Stack>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Card><CardContent>
          <Typography variant="h6">Live preview</Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb:2}}>{template?.name}</Typography>
          <Box sx={{minHeight:650,display:"grid",placeItems:"center",bgcolor:"#eef3f8",overflow:"auto",p:3}}>
            {student&&template?<Box ref={cardRef}>
              <TemplateRenderer template={template} student={student} school={school} targetWidth={template.orientation==="landscape"?520:330}/>
            </Box>:<Typography color="text.secondary">Add a student first.</Typography>}
          </Box>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Layout>
}
