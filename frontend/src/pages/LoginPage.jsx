import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  EmailRounded,
  LockRounded,
  SchoolRounded,
  VerifiedUserRounded,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

import {
  api,
  errorMessage,
} from "../api";

export default function LoginPage({
  onLogin,
}) {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const submit =
    async (event) => {
      event.preventDefault();
      setError("");
      setBusy(true);

      try {
        const response =
          await api.post(
            "/auth/login",
            {
              email,
              password,
            }
          );

        const data =
          response.data.data;

        localStorage.setItem(
          "sid_token",
          data.token
        );

        localStorage.setItem(
          "sid_user",
          JSON.stringify(
            data.user
          )
        );

        onLogin(data.user);

        navigate(
          data.user.role ===
            "ADMIN"
            ? "/admin"
            : "/school"
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      } finally {
        setBusy(false);
      }
    };

  return (
    <Box
      sx={{
        minHeight: {
          xs: "100vh",
          md: "100dvh",
        },
        height: {
          xs: "auto",
          md: "100dvh",
        },
        bgcolor:
          "#eef3f8",
        display: "flex",
        flexDirection:
          "column",
        overflow: {
          xs: "visible",
          md: "hidden",
        },
      }}
    >
      {/* Official-style top accent */}
      <Box
        sx={{
          height: 5,
          background:
            "linear-gradient(90deg,#f59e0b 0 33.33%,#ffffff 33.33% 66.66%,#138808 66.66% 100%)",
          borderBottom:
            "1px solid #d8e0e8",
        }}
      />

      {/* Government-portal inspired header */}
      <Box
        component="header"
        sx={{
          bgcolor:
            "#ffffff",
          borderBottom:
            "1px solid #cfd8e3",
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            width: "100%",
            px: {
              xs: 2,
              sm: 3,
            },
            py: {
              xs: 1.4,
              sm: 1.5,
              md: 1.25,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.8}
          >
            <Box
              component="img"
              src="/default-school-logo.svg"
              alt="School ID Studio"
              sx={{
                width: {
                  xs: 48,
                  sm: 58,
                },
                height: {
                  xs: 48,
                  sm: 58,
                },
                objectFit:
                  "contain",
                bgcolor:
                  "#ffffff",
                border:
                  "1px solid #d7dee8",
                p: 0.5,
                flexShrink: 0,
              }}
            />

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 19,
                    sm: 24,
                  },
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color:
                    "#12355b",
                }}
              >
                School Identity Management Portal
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: {
                    xs: 12,
                    sm: 13,
                  },
                  color:
                    "#5d7088",
                }}
              >
                School ID Studio · Secure Student Identity Services
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Notice band */}
      <Box
        sx={{
          bgcolor:
            "#12355b",
          color:
            "#ffffff",
          borderBottom:
            "4px solid #f59e0b",
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            px: {
              xs: 2,
              sm: 3,
            },
            py: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <VerifiedUserRounded
              sx={{
                fontSize: 18,
                color:
                  "#fde68a",
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: 12,
                  sm: 13,
                },
                fontWeight: 700,
              }}
            >
              Authorized access for registered administrators and schools only
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Main login area */}
      <Box
        component="main"
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "grid",
          placeItems:
            "center",
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 3,
            md: 2,
            lg: 2.25,
          },
          overflow: {
            xs: "visible",
            md: "hidden",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1120,
            display:
              "grid",
            gridTemplateColumns:
              {
                xs:
                  "1fr",
                md:
                  "1.05fr .95fr",
              },
            border:
              "1px solid #cfd8e3",
            bgcolor:
              "#ffffff",
            boxShadow:
              "0 14px 38px rgba(15,23,42,.08)",
            maxHeight: {
              xs: "none",
              md: "100%",
            },
            overflow: {
              xs: "visible",
              md: "hidden",
            },
          }}
        >
          {/* Left information section */}
          <Box
            sx={{
              display: {
                xs:
                  "none",
                md:
                  "block",
              },
              p: {
                md: 3,
                lg: 3.5,
              },
              bgcolor:
                "#f7f9fc",
              borderRight:
                "1px solid #d8e0e8",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color:
                  "#b45309",
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              OFFICIAL SCHOOL SERVICES
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontSize: {
                  md: 28,
                  lg: 32,
                },
                lineHeight: 1.16,
                fontWeight: 900,
                color:
                  "#12355b",
              }}
            >
              Secure School ID Card Management System
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                color:
                  "#52657c",
                lineHeight: 1.7,
                fontSize: 15,
                maxWidth: 520,
              }}
            >
              Manage student records, school information, ID-card templates and print-ready identity cards from one secure portal.
            </Typography>

            <Divider
              sx={{
                my: 2,
              }}
            />

            <Stack
              spacing={1.15}
            >
              {[
                "100 professional English and Marathi ID-card templates",
                "Secure administrator and school login",
                "Student photo, school logo and principal signature support",
                "Custom templates and print-ready PDF/PNG generation",
              ].map(
                (text) => (
                  <Stack
                    key={text}
                    direction="row"
                    spacing={1.1}
                    alignItems="flex-start"
                  >
                    <VerifiedUserRounded
                      sx={{
                        mt: 0.2,
                        fontSize: 19,
                        color:
                          "#138808",
                        flexShrink: 0,
                      }}
                    />

                    <Typography
                      sx={{
                        color:
                          "#334155",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {text}
                    </Typography>
                  </Stack>
                )
              )}
            </Stack>

            <Box
              sx={{
                mt: 2.2,
                p: 1.5,
                borderLeft:
                  "4px solid #f59e0b",
                bgcolor:
                  "#fffaf0",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color:
                    "#6b4f1d",
                  lineHeight: 1.55,
                }}
              >
                For security, do not share your account password or login credentials with unauthorized persons.
              </Typography>
            </Box>
          </Box>

          {/* Login panel */}
          <Box
            sx={{
              p: {
                xs: 2.5,
                sm: 3,
                md: 3,
                lg: 3.5,
              },
            }}
          >
            <Box
              sx={{
                mb: 1.8,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <SchoolRounded
                  sx={{
                    color:
                      "#12355b",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 900,
                    color:
                      "#12355b",
                    letterSpacing:
                      ".06em",
                  }}
                >
                  USER LOGIN
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.8,
                  fontSize: {
                    xs: 27,
                    sm: 30,
                  },
                  fontWeight: 900,
                  color:
                    "#111827",
                }}
              >
                Sign in to your account
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color:
                    "#64748b",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Enter your registered email address and password.
              </Typography>
            </Box>

            <Divider
              sx={{
                mb: 1.8,
              }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={
                submit
              }
            >
              <Stack
                spacing={1.5}
              >
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Registered Email Address"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  autoComplete="username"
                  InputProps={{
                    startAdornment:
                      (
                        <InputAdornment position="start">
                          <EmailRounded
                            sx={{
                              color:
                                "#64748b",
                            }}
                          />
                        </InputAdornment>
                      ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment:
                      (
                        <InputAdornment position="start">
                          <LockRounded
                            sx={{
                              color:
                                "#64748b",
                            }}
                          />
                        </InputAdornment>
                      ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    busy
                  }
                  sx={{
                    minHeight: 48,
                    bgcolor:
                      "#12355b",
                    fontWeight: 900,
                    "&:hover": {
                      bgcolor:
                        "#0b2949",
                    },
                  }}
                >
                  {busy
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 1.25,
                bgcolor:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12.5,
                  color:
                    "#64748b",
                  lineHeight: 1.55,
                }}
              >
                If you are unable to sign in, contact your school administrator or system administrator for account assistance.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor:
            "#ffffff",
          borderTop:
            "1px solid #cfd8e3",
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            px: {
              xs: 2,
              sm: 3,
            },
            py: {
              xs: 1.2,
              md: 0.8,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={0.5}
            justifyContent="space-between"
          >
            <Typography
              sx={{
                fontSize: 12,
                color:
                  "#64748b",
              }}
            >
              School ID Studio · Student Identity Management Portal
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color:
                  "#64748b",
              }}
            >
              Secure access · Authorized users only
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
