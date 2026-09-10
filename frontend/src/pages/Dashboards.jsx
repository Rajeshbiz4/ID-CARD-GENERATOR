import { useEffect,useState } from "react";
import { Grid } from "@mui/material";
import { BadgeRounded,DomainRounded,GroupsRounded,PaletteRounded,SchoolRounded } from "@mui/icons-material";
import Layout from "../Layout";
import { PageHeader,StatCard } from "../ui";
import { api } from "../api";

export function AdminDashboard({user,onLogout}){
  const [data,setData]=useState({});
  useEffect(()=>{api.get("/admin/dashboard").then(r=>setData(r.data.data))},[]);
  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow="Admin" title="Platform overview" description="Registered schools and student activity."/>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><StatCard label="Schools" value={data.totalSchools} icon={<DomainRounded/>}/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Active" value={data.activeSchools} icon={<SchoolRounded/>} accent="#10b981"/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Inactive" value={data.inactiveSchools} icon={<SchoolRounded/>} accent="#f59e0b"/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Students" value={data.totalStudents} icon={<GroupsRounded/>} accent="#0ea5e9"/></Grid>
    </Grid>
  </Layout>
}

export function SchoolDashboard({user,onLogout}){
  const [data,setData]=useState({});
  useEffect(()=>{api.get("/school/dashboard").then(r=>setData(r.data.data))},[]);
  return <Layout user={user} onLogout={onLogout}>
    <PageHeader eyebrow={data.schoolCode||"School"} title={data.schoolName||"School dashboard"} description={`Academic year ${data.academicYear||"—"}`}/>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><StatCard label="Students" value={data.totalStudents} icon={<GroupsRounded/>}/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Generated" value={data.generatedCards} icon={<BadgeRounded/>} accent="#0ea5e9"/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Pending" value={data.pendingCards} icon={<BadgeRounded/>} accent="#f59e0b"/></Grid>
      <Grid item xs={12} md={3}><StatCard label="Custom Templates" value={data.customTemplates} icon={<PaletteRounded/>} accent="#7c3aed"/></Grid>
      <Grid item xs={12} md={3}><StatCard label="ID Card Balance" value={data.idCardRemaining ?? 0} icon={<BadgeRounded/>} accent="#10b981"/></Grid>
    </Grid>
  </Layout>
}
