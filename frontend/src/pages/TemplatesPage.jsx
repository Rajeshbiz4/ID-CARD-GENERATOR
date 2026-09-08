import { useEffect,useMemo,useState } from "react";
import { Box,Button,Card,CardContent,Grid,Stack,Typography } from "@mui/material";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api } from "../api";
import TemplateRenderer from "../TemplateRenderer";

const sampleStudent={
  name:"Aarav Sharma",admissionNo:"GVPS001",rollNo:"12",className:"6",division:"A",
  dob:"2014-08-12",bloodGroup:"O+",academicYear:"2026-2027",parentName:"Rajesh Sharma",parentMobile:"9876543210"
};
const sampleSchool={
  name:"Green Valley Public School",schoolCode:"GVPS",tagline:"Learn • Grow • Achieve",academicYear:"2026-2027"
};

export default function TemplatesPage({user,onLogout}){
  const [templates,setTemplates]=useState([]);
  const [settings,setSettings]=useState({});
  const [category,setCategory]=useState("ALL");

  const load=async()=>{
    const [a,b]=await Promise.all([api.get("/templates"),api.get("/school/template-settings")]);
    setTemplates(a.data.data);
    setSettings(b.data.data);
  };
  useEffect(()=>{load()},[]);

  const categories=useMemo(()=>["ALL",...Array.from(new Set(templates.map(t=>t.type==="CUSTOM"?"Custom":t.category||"Other")))],[templates]);
  const filtered=category==="ALL"?templates:templates.filter(t=>(t.type==="CUSTOM"?"Custom":t.category)===category);
  const selectedId=settings.templateId?._id||settings.templateId;

  const choose=async template=>{
    const response=await api.put("/school/template-settings",{templateId:template._id});
    setSettings(response.data.data);
  };

  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="ID Studio" title={`${templates.length} templates available`}
      description="20 system templates use different layout structures, plus every school can create its own custom templates."/>
    <Stack direction="row" spacing={1} sx={{mb:2,flexWrap:"wrap",gap:1}}>
      {categories.map(item=><Button key={item} variant={category===item?"contained":"outlined"} onClick={()=>setCategory(item)}>{item}</Button>)}
    </Stack>

    <Grid container spacing={2}>
      {filtered.map(template=>{
        const selected=selectedId===template._id;
        const previewWidth=template.orientation==="landscape"?310:205;
        return <Grid item xs={12} md={6} xl={4} key={template._id}>
          <Card sx={{borderColor:selected?"primary.main":"#e2e8f0"}}>
            <CardContent>
              <Box sx={{minHeight:360,display:"grid",placeItems:"center",bgcolor:"#eef3f8",overflow:"hidden",p:2}}>
                <TemplateRenderer template={template} student={sampleStudent} school={sampleSchool} targetWidth={previewWidth}/>
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:2}}>
                <Box>
                  <Typography fontWeight={900}>{template.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.type} · {template.layoutFamily} · {template.orientation}
                  </Typography>
                </Box>
                <Button variant={selected?"contained":"outlined"} onClick={()=>choose(template)}>
                  {selected?"Selected":"Select"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      })}
    </Grid>
  </Layout>
}
