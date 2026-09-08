import { Box, Card, CardContent, Typography } from "@mui/material";

export function PageHeader({eyebrow,title,description,action}){
  return <Box sx={{mb:3,display:"flex",justifyContent:"space-between",gap:2,alignItems:{xs:"flex-start",md:"center"},flexDirection:{xs:"column",md:"row"}}}>
    <Box>
      {eyebrow&&<Typography variant="overline" color="primary" fontWeight={900}>{eyebrow}</Typography>}
      <Typography variant="h4">{title}</Typography>
      {description&&<Typography color="text.secondary" sx={{mt:.5,maxWidth:800}}>{description}</Typography>}
    </Box>
    {action}
  </Box>
}

export function StatCard({label,value,icon,accent="#4f46e5"}){
  return <Card><CardContent>
    <Box sx={{display:"flex",justifyContent:"space-between"}}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={800}>{label}</Typography>
        <Typography variant="h4" sx={{mt:.5}}>{value??"—"}</Typography>
      </Box>
      <Box sx={{width:48,height:48,display:"grid",placeItems:"center",color:accent,bgcolor:`${accent}16`}}>{icon}</Box>
    </Box>
  </CardContent></Card>
}
