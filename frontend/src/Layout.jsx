import {
  AppBar,Avatar,Box,Divider,Drawer,IconButton,List,ListItemButton,ListItemIcon,
  ListItemText,Toolbar,Typography
} from "@mui/material";
import {
  AddRounded,BadgeRounded,DashboardRounded,DomainRounded,LogoutRounded,
  PaletteRounded,PersonAddAlt1Rounded,SchoolRounded,SettingsRounded,ViewListRounded
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth=260;

export default function Layout({user,onLogout,children}){
  const navigate=useNavigate();
  const location=useLocation();
  const adminMenu=[
    ["Dashboard","/admin",<DashboardRounded/>],
    ["Schools","/admin/schools",<DomainRounded/>],
  ];
  const schoolMenu=[
    ["Dashboard","/school",<DashboardRounded/>],
    ["Students","/school/students",<ViewListRounded/>],
    ["Add Student","/school/students/new",<PersonAddAlt1Rounded/>],
    ["ID Cards","/school/id-cards",<BadgeRounded/>],
    ["Templates","/school/templates",<PaletteRounded/>],
    ["Custom Template","/school/custom-template",<AddRounded/>],
    ["School Profile","/school/profile",<SettingsRounded/>],
  ];
  const menu=user.role==="ADMIN"?adminMenu:schoolMenu;

  return <Box sx={{minHeight:"100vh"}}>
    <Drawer variant="permanent" sx={{
      width:drawerWidth,
      "& .MuiDrawer-paper":{width:drawerWidth,border:0,color:"#e5eefb",bgcolor:"#07101f"}
    }}>
      <Box sx={{p:2.5,display:"flex",alignItems:"center",gap:1.2}}>
        <Box sx={{width:42,height:42,display:"grid",placeItems:"center",bgcolor:"#4f46e5"}}><SchoolRounded/></Box>
        <Box><Typography fontWeight={950}>School ID</Typography><Typography variant="caption" sx={{color:"#8ea6c9"}}>Studio</Typography></Box>
      </Box>
      <Divider sx={{borderColor:"rgba(255,255,255,.08)"}}/>
      <List>
        {menu.map(([label,path,icon])=>{
          const active=(path==="/school"||path==="/admin")?location.pathname===path:location.pathname.startsWith(path);
          return <ListItemButton key={path} selected={active} onClick={()=>navigate(path)} sx={{
            color:active?"#fff":"#a9bddb",
            "&.Mui-selected":{bgcolor:"#4f46e5"},
            "&.Mui-selected:hover":{bgcolor:"#4f46e5"}
          }}>
            <ListItemIcon sx={{color:"inherit",minWidth:40}}>{icon}</ListItemIcon>
            <ListItemText primary={label}/>
          </ListItemButton>
        })}
      </List>
      <Box sx={{mt:"auto",p:2,bgcolor:"rgba(255,255,255,.04)",display:"flex",alignItems:"center",gap:1}}>
        <Avatar>{user.name?.[0]}</Avatar>
        <Box sx={{minWidth:0,flex:1}}>
          <Typography variant="body2" fontWeight={800} noWrap>{user.name}</Typography>
          <Typography variant="caption" sx={{color:"#8ea6c9"}}>{user.role}</Typography>
        </Box>
        <IconButton onClick={onLogout} sx={{color:"#a9bddb"}}><LogoutRounded/></IconButton>
      </Box>
    </Drawer>

    <Box sx={{ml:`${drawerWidth}px`,minHeight:"100vh"}}>
      <AppBar position="sticky" elevation={0} color="transparent" sx={{
        bgcolor:"rgba(244,247,251,.9)",backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(148,163,184,.18)"
      }}>
        <Toolbar>
          <Typography variant="body2" color="text.secondary" fontWeight={800}>
            {user.role==="ADMIN"?"Platform Administration":"School Workspace"}
          </Typography>
          <Box sx={{flex:1}}/>
          <Typography variant="body2" fontWeight={800}>{user.email}</Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{p:{xs:2,md:3.5},maxWidth:1550,mx:"auto"}}>{children}</Box>
    </Box>
  </Box>
}
