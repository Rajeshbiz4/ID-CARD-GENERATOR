import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  SaveRounded,
  UploadFileRounded,
} from "@mui/icons-material";

import Layout from "../Layout";
import { PageHeader } from "../ui";

import {
  api,
  errorMessage,
  uploadImage,
} from "../api";

import StoredImage from "../StoredImage";

import {
  MarathiTextField,
  TypingLanguageBar,
  useTypingLanguage,
} from "../MarathiTyping";

export default function ProfilePage({
  user,
  onLogout,
}) {
  const [form, setForm] =
    useState({});

  const [error, setError] =
    useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    typingLanguage,
    setTypingLanguage,
  ] = useTypingLanguage();

  useEffect(() => {
    api
      .get(
        "/school/profile"
      )
      .then((response) =>
        setForm(
          response.data.data
        )
      )
      .catch((e) =>
        setError(
          errorMessage(e)
        )
      );
  }, []);

  const upload =
    async (
      event,
      category,
      field,
      preset
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError("");

      try {
        const fileId =
          await uploadImage(
            file,
            category,
            preset
          );

        setForm(
          (current) => ({
            ...current,
            [field]: fileId,
          })
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const save =
    async () => {
      setError("");
      setMessage("");

      try {
        const response =
          await api.put(
            "/school/profile",
            form
          );

        setForm(
          response.data.data
        );

        setMessage(
          "School profile saved."
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const fields = [
    [
      "name",
      "School name / शाळेचे नाव",
      8,
    ],
    [
      "tagline",
      "Tagline",
      4,
    ],
    [
      "registrationNo",
      "UDISE / Registration No.",
      4,
    ],
    [
      "academicYear",
      "Academic year",
      4,
    ],
    [
      "principalName",
      "Principal name / मुख्याध्यापक",
      4,
    ],
    [
      "mobile",
      "Mobile",
      4,
    ],
    [
      "email",
      "Email",
      6,
    ],
    [
      "website",
      "Website",
      6,
    ],
    [
      "address",
      "Address / पत्ता",
      12,
    ],
    [
      "city",
      "City / शहर",
      4,
    ],
    [
      "state",
      "State / राज्य",
      4,
    ],
    [
      "pinCode",
      "PIN",
      4,
    ],
  ];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="Branding"
        title="School profile"
        description="School logo and principal signature are shown on every ID-card layout. Upload them once here and all predefined/generated cards use them automatically. English and Marathi text are preserved as entered."
      />

      <TypingLanguageBar
        value={typingLanguage}
        onChange={
          setTypingLanguage
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={12}
          lg={4}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
              >
                School logo
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  minHeight: 180,
                  border:
                    "1px solid #cbd5e1",
                  display: "grid",
                  placeItems:
                    "center",
                  bgcolor:
                    "#f8fafc",
                  p: 2,
                }}
              >
                {form.logoFileId ? (
                  <StoredImage
                    fileId={
                      form.logoFileId
                    }
                    sx={{
                      width: 170,
                      height: 150,
                      objectFit:
                        "contain",
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src="/default-school-logo.svg"
                    alt=""
                    sx={{
                      width: 140,
                      height: 140,
                      objectFit:
                        "contain",
                    }}
                  />
                )}
              </Box>

              <Button
                fullWidth
                component="label"
                variant="outlined"
                startIcon={
                  <UploadFileRounded />
                }
                sx={{ mt: 1 }}
              >
                Upload logo

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(
                    event
                  ) =>
                    upload(
                      event,
                      "school-logo",
                      "logoFileId",
                      "logo"
                    )
                  }
                />
              </Button>

              <Typography
                variant="h6"
                sx={{ mt: 3 }}
              >
                Principal signature
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  minHeight: 110,
                  border:
                    "1px solid #cbd5e1",
                  display: "grid",
                  placeItems:
                    "center",
                  bgcolor:
                    "#f8fafc",
                  p: 2,
                }}
              >
                {form.principalSignatureFileId ? (
                  <StoredImage
                    fileId={
                      form.principalSignatureFileId
                    }
                    sx={{
                      width: 180,
                      height: 90,
                      objectFit:
                        "contain",
                    }}
                  />
                ) : (
                  <Typography
                    color="text.secondary"
                  >
                    No signature uploaded
                  </Typography>
                )}
              </Box>

              <Button
                fullWidth
                component="label"
                variant="outlined"
                startIcon={
                  <UploadFileRounded />
                }
                sx={{ mt: 1 }}
              >
                Upload signature

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(
                    event
                  ) =>
                    upload(
                      event,
                      "principal-signature",
                      "principalSignatureFileId",
                      "signature"
                    )
                  }
                />
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                Signature is automatically cropped to remove empty/white space, enlarged, and normalized to fit the ID-card signature area.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          lg={8}
        >
          <Card>
            <CardContent>
              <Grid
                container
                spacing={2}
              >
                {fields.map(
                  ([
                    key,
                    label,
                    cols,
                  ]) => (
                    <Grid
                      item
                      xs={12}
                      md={cols}
                      key={key}
                    >
                      {[
                        "name",
                        "tagline",
                        "principalName",
                        "address",
                        "city",
                        "state",
                      ].includes(key) ? (
                        <MarathiTextField
                          typingLanguage={
                            typingLanguage
                          }
                          multiline={
                            key ===
                            "address"
                          }
                          minRows={
                            key ===
                            "address"
                              ? 2
                              : undefined
                          }
                          label={label}
                          value={
                            form[key] ||
                            ""
                          }
                          onValueChange={(
                            value
                          ) =>
                            setForm({
                              ...form,
                              [key]:
                                value,
                            })
                          }
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label={label}
                          value={
                            form[key] ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setForm({
                              ...form,
                              [key]:
                                event
                                  .target
                                  .value,
                            })
                          }
                        />
                      )}
                    </Grid>
                  )
                )}
              </Grid>

              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="contained"
                  startIcon={
                    <SaveRounded />
                  }
                  onClick={save}
                >
                  Save profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
