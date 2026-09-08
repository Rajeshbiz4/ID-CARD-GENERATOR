import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data.data;

      localStorage.setItem("sid_token", data.token);
      localStorage.setItem("sid_user", JSON.stringify(data.user));
      onLogin(data.user);

      navigate(data.user.role === "ADMIN" ? "/admin" : "/school");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "1.06fr .94fr",
        },
        bgcolor: "#eef2f7",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          minHeight: "100vh",
          color: "#ffffff",
          p: 7,
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg,#07111f 0%,#102847 55%,#1f4f78 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            component="img"
            src="/default-school-logo.svg"
            alt="School ID Studio"
            sx={{
              width: 58,
              height: 58,
              bgcolor: "#ffffff",
              p: 0.5,
            }}
          />

          <Box>
            <Typography variant="h6" fontWeight={900}>
              School ID Studio
            </Typography>
            <Typography sx={{ color: "#b8c9dc", fontSize: 13 }}>
              Student Identity Management Platform
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ maxWidth: 690 }}>
          <Typography
            sx={{
              fontSize: { lg: 52, xl: 60 },
              lineHeight: 1.05,
              letterSpacing: "-.045em",
              fontWeight: 950,
            }}
          >
            Professional school
            <br />
            identity cards,
            <br />
            managed securely.
          </Typography>

          <Typography
            sx={{
              mt: 3,
              maxWidth: 600,
              fontSize: 17,
              lineHeight: 1.65,
              color: "#c6d5e5",
            }}
          >
            Manage students, school branding, professional card layouts,
            custom templates and print-ready IDs from one secure workspace.
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            sx={{ mt: 4 }}
          >
            {[
              "Secure school access",
              "20 professional layouts",
              "Custom template designer",
            ].map((label) => (
              <Stack
                key={label}
                direction="row"
                spacing={0.8}
                alignItems="center"
              >
                <VerifiedUserRounded sx={{ fontSize: 18, color: "#7dd3fc" }} />
                <Typography sx={{ fontSize: 13, color: "#dbeafe" }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ fontSize: 12, color: "#8ca4bd" }}>
          Authorized users only · Admin and school accounts
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          px: { xs: 2, sm: 5 },
          py: 5,
          bgcolor: "#f7f9fc",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 450 }}>
          <Box sx={{ mb: 3, display: { xs: "block", lg: "none" } }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <SchoolRounded color="primary" />
              <Typography fontWeight={900}>School ID Studio</Typography>
            </Stack>
          </Box>

          <Card sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={900}
              sx={{ letterSpacing: 1.1 }}
            >
              SECURE SIGN IN
            </Typography>

            <Typography variant="h4" sx={{ mt: 0.5 }}>
              Welcome back
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Sign in with the credentials provided for your account.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                <TextField
                  label="Email address"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy}
                  sx={{ py: 1.25 }}
                >
                  {busy ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Typography
              sx={{
                mt: 3,
                fontSize: 12,
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              If you do not have login access, contact your school administrator.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
