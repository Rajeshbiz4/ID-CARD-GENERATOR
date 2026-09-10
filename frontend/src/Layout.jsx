import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  AddRounded,
  BadgeRounded,
  DashboardRounded,
  DomainRounded,
  LogoutRounded,
  MenuRounded,
  PaletteRounded,
  PersonAddAlt1Rounded,
  SchoolRounded,
  SettingsRounded,
  ViewListRounded,
} from "@mui/icons-material";

import {
  useTheme,
} from "@mui/material/styles";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

const drawerWidth = 260;

export default function Layout({
  user,
  onLogout,
  children,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const theme =
    useTheme();

  const desktop =
    useMediaQuery(
      theme.breakpoints.up(
        "md"
      )
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const adminMenu = [
    [
      "Dashboard",
      "/admin",
      <DashboardRounded />,
    ],
    [
      "Schools",
      "/admin/schools",
      <DomainRounded />,
    ],
  ];

  const schoolMenu = [
    [
      "Dashboard",
      "/school",
      <DashboardRounded />,
    ],
    [
      "Students",
      "/school/students",
      <ViewListRounded />,
    ],
    [
      "Add Student",
      "/school/students/new",
      <PersonAddAlt1Rounded />,
    ],
    [
      "ID Cards",
      "/school/id-cards",
      <BadgeRounded />,
    ],
    [
      "Templates",
      "/school/templates",
      <PaletteRounded />,
    ],
    [
      "Custom Template",
      "/school/custom-template",
      <AddRounded />,
    ],
    [
      "School Profile",
      "/school/profile",
      <SettingsRounded />,
    ],
  ];

  const menu =
    user.role === "ADMIN"
      ? adminMenu
      : schoolMenu;

  const goTo = (
    path
  ) => {
    navigate(path);

    if (!desktop) {
      setMobileOpen(false);
    }
  };

  const activeMenuPath =
    menu
      .filter(
        ([
          _label,
          path,
        ]) => {
          if (
            path === "/school" ||
            path === "/admin"
          ) {
            return (
              location.pathname ===
              path
            );
          }

          return (
            location.pathname ===
              path ||
            location.pathname.startsWith(
              `${path}/`
            )
          );
        }
      )
      .sort(
        (a, b) =>
          b[1].length -
          a[1].length
      )[0]?.[1] || "";

  const drawerContent = (
    <>
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            bgcolor: "#4f46e5",
          }}
        >
          <SchoolRounded />
        </Box>

        <Box>
          <Typography
            fontWeight={950}
          >
            School ID
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "#8ea6c9",
            }}
          >
            Studio
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor:
            "rgba(255,255,255,.08)",
        }}
      />

      <List>
        {menu.map(
          ([
            label,
            path,
            icon,
          ]) => {
            const active =
              path ===
              activeMenuPath;

            return (
              <ListItemButton
                key={path}
                selected={
                  active
                }
                onClick={() =>
                  goTo(path)
                }
                sx={{
                  color:
                    active
                      ? "#fff"
                      : "#a9bddb",
                  "&.Mui-selected":
                    {
                      bgcolor:
                        "#4f46e5",
                    },
                  "&.Mui-selected:hover":
                    {
                      bgcolor:
                        "#4f46e5",
                    },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      "inherit",
                    minWidth: 40,
                  }}
                >
                  {icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    label
                  }
                />
              </ListItemButton>
            );
          }
        )}
      </List>

      <Box
        sx={{
          mt: "auto",
          p: 2,
          bgcolor:
            "rgba(255,255,255,.04)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar>
          {user.name?.[0]}
        </Avatar>

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={800}
            noWrap
          >
            {user.name}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "#8ea6c9",
            }}
          >
            {user.role}
          </Typography>
        </Box>

        <IconButton
          onClick={
            onLogout
          }
          sx={{
            color: "#a9bddb",
          }}
        >
          <LogoutRounded />
        </IconButton>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        minHeight:
          "100vh",
        width: "100%",
        overflowX:
          "hidden",
      }}
    >
      <Drawer
        variant={
          desktop
            ? "permanent"
            : "temporary"
        }
        open={
          desktop ||
          mobileOpen
        }
        onClose={() =>
          setMobileOpen(false)
        }
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width:
            desktop
              ? drawerWidth
              : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper":
            {
              width:
                drawerWidth,
              border: 0,
              color:
                "#e5eefb",
              bgcolor:
                "#07101f",
              display:
                "flex",
            },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          ml: {
            xs: 0,
            md:
              `${drawerWidth}px`,
          },
          minHeight:
            "100vh",
          minWidth: 0,
          width: {
            xs: "100%",
            md:
              `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            bgcolor:
              "rgba(244,247,251,.9)",
            backdropFilter:
              "blur(14px)",
            borderBottom:
              "1px solid rgba(148,163,184,.18)",
          }}
        >
          <Toolbar
            sx={{
              minWidth: 0,
            }}
          >
            {!desktop && (
              <IconButton
                edge="start"
                onClick={() =>
                  setMobileOpen(
                    true
                  )
                }
                sx={{
                  mr: 1,
                }}
              >
                <MenuRounded />
              </IconButton>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={800}
              noWrap
            >
              {user.role ===
              "ADMIN"
                ? "Platform Administration"
                : "School Workspace"}
            </Typography>

            <Box
              sx={{
                flex: 1,
                minWidth: 8,
              }}
            />

            <Typography
              variant="body2"
              fontWeight={800}
              noWrap
              sx={{
                maxWidth: {
                  xs: 150,
                  sm: 280,
                },
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
              }}
            >
              {user.email}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            p: {
              xs: 2,
              md: 3.5,
            },
            width: "100%",
            maxWidth: 1550,
            mx: "auto",
            minWidth: 0,
            overflowX:
              "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
