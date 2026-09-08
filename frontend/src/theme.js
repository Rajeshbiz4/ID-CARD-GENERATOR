import { createTheme } from "@mui/material/styles";

export const theme=createTheme({
  palette:{
    primary:{main:"#4f46e5"},
    secondary:{main:"#0ea5e9"},
    success:{main:"#10b981"},
    background:{default:"#f4f7fb",paper:"#ffffff"},
    text:{primary:"#0f172a",secondary:"#64748b"}
  },
  shape:{borderRadius:0},
  typography:{
    fontFamily:'Inter,"Segoe UI",Roboto,Arial,sans-serif',
    h4:{fontWeight:900,letterSpacing:"-.04em"},
    h5:{fontWeight:850},
    h6:{fontWeight:800},
    button:{textTransform:"none",fontWeight:800}
  },
  components:{
    MuiPaper:{styleOverrides:{root:{borderRadius:"0 !important"}}},
    MuiCard:{styleOverrides:{root:{borderRadius:"0 !important",border:"1px solid rgba(148,163,184,.22)",boxShadow:"0 12px 35px rgba(15,23,42,.06)"}}},
    MuiButton:{styleOverrides:{root:{borderRadius:"0 !important",minHeight:42,boxShadow:"none"}}},
    MuiOutlinedInput:{styleOverrides:{root:{borderRadius:"0 !important",background:"#fff"}}},
    MuiDialog:{styleOverrides:{paper:{borderRadius:"0 !important"}}},
    MuiListItemButton:{styleOverrides:{root:{borderRadius:"0 !important"}}},
    MuiChip:{styleOverrides:{root:{borderRadius:"0 !important"}}},
    MuiAvatar:{styleOverrides:{root:{borderRadius:"0 !important"}}}
  }
});
