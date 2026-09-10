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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  SaveRounded,
  UploadFileRounded,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

const emptyStudent = {
  name: "",
  admissionNo: "",
  rollNo: "",
  className: "",
  division: "",
  gender: "",
  dob: "",
  bloodGroup: "",
  academicYear: "",
  parentName: "",
  parentMobile: "",
  emergencyContact: "",
  address: "",
  house: "",
  busRoute: "",
  photoFileId: null,
};

export default function StudentFormPage({
  user,
  onLogout,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(emptyStudent);

  const [error, setError] =
    useState("");

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    typingLanguage,
    setTypingLanguage,
  ] = useTypingLanguage();

  useEffect(() => {
    if (!id) {
      return;
    }

    api
      .get(`/students/${id}`)
      .then((response) => {
        const value =
          response.data.data;

        setForm({
          ...emptyStudent,
          ...value,
          dob:
            value.dob
              ? value.dob.slice(
                  0,
                  10
                )
              : "",
        });
      })
      .catch((e) => {
        setError(
          errorMessage(e)
        );
      });
  }, [id]);

  const uploadPhoto =
    async (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setUploading(true);
      setError("");

      try {
        const fileId =
          await uploadImage(
            file,
            "student-photo",
            "student"
          );

        setForm(
          (current) => ({
            ...current,
            photoFileId:
              fileId,
          })
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      } finally {
        setUploading(false);
      }
    };

  const save =
    async () => {
      setError("");

      if (
        !String(
          form.name || ""
        ).trim()
      ) {
        setError(
          "Student name is required."
        );
        return;
      }

      try {
        if (id) {
          await api.put(
            `/students/${id}`,
            form
          );
        } else {
          await api.post(
            "/students",
            form
          );
        }

        navigate(
          "/school/students"
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
      "Student name / विद्यार्थ्याचे नाव *",
      8,
    ],
    [
      "admissionNo",
      "Admission number",
      4,
    ],
    [
      "className",
      "Class / इयत्ता",
      3,
    ],
    [
      "division",
      "Division / तुकडी",
      3,
    ],
    [
      "rollNo",
      "Roll / Register no.",
      3,
    ],
    [
      "bloodGroup",
      "Blood group",
      3,
    ],
    [
      "academicYear",
      "Academic year",
      4,
    ],
    [
      "parentName",
      "Parent name / पालकाचे नाव",
      4,
    ],
    [
      "parentMobile",
      "Parent mobile / मोबाईल",
      4,
    ],
    [
      "emergencyContact",
      "Emergency contact",
      4,
    ],
    [
      "house",
      "House",
      4,
    ],
    [
      "busRoute",
      "Bus route",
      4,
    ],
    [
      "address",
      "Address / पत्ता",
      12,
    ],
  ];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="Students"
        title={
          id
            ? "Edit student"
            : "Add student"
        }
        description="Only student name is mandatory. Other details and photo are optional. Marathi text is stored exactly as entered."
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

      <Card
        sx={{
          overflow: "visible",
        }}
      >
        <CardContent
          sx={{
            overflow: "visible",
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{
              overflow: "visible",
              alignItems: "flex-start",
            }}
          >
            <Grid
              item
              xs={12}
              md={3}
            >
              <Box
                sx={{
                  minHeight: 230,
                  border:
                    "1px solid #cbd5e1",
                  bgcolor:
                    "#f8fafc",
                  display: "grid",
                  placeItems:
                    "center",
                  p: 2,
                }}
              >
                {form.photoFileId ? (
                  <StoredImage
                    fileId={
                      form.photoFileId
                    }
                    sx={{
                      width: 150,
                      height: 180,
                      objectFit:
                        "cover",
                      objectPosition:
                        "center top",
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src="/default-student-photo.svg"
                    alt=""
                    sx={{
                      width: 150,
                      height: 180,
                      objectFit:
                        "cover",
                    }}
                  />
                )}
              </Box>

              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={
                  <UploadFileRounded />
                }
                sx={{ mt: 1 }}
                disabled={
                  uploading
                }
              >
                {uploading
                  ? "Uploading..."
                  : "Upload photo"}

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    uploadPhoto
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
                Optional. Photo is automatically resized to a standard ID-photo format.
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={9}
              sx={{
                overflow: "visible",
              }}
            >
              <Grid
                container
                columnSpacing={2}
                rowSpacing={3}
                sx={{
                  overflow: "visible",
                }}
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
                      sx={{
                        position: "relative",
                        overflow: "visible",
                        zIndex:
                          [
                            "name",
                            "className",
                            "division",
                            "parentName",
                            "address",
                            "house",
                            "busRoute",
                          ].includes(key)
                            ? 20
                            : 1,
                      }}
                    >
                      {[
                        "name",
                        "className",
                        "division",
                        "parentName",
                        "address",
                        "house",
                        "busRoute",
                      ].includes(key) ? (
                        <MarathiTextField
                          typingLanguage={
                            typingLanguage
                          }
                          required={
                            key === "name"
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
                          sx={{
                            "& .MuiInputBase-root": {
                              minHeight:
                                key === "name"
                                  ? 64
                                  : 56,
                            },
                          }}
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

                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <TextField
                    fullWidth
                    type="date"
                    label="DOB / जन्मतारीख"
                    value={
                      form.dob || ""
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        dob:
                          event.target
                            .value,
                      })
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    value={
                      form.gender ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,
                        gender:
                          event.target
                            .value,
                      })
                    }
                  >
                    <MenuItem value="">
                      Not specified
                    </MenuItem>

                    {[
                      "Male",
                      "Female",
                      "Other",
                    ].map(
                      (value) => (
                        <MenuItem
                          key={
                            value
                          }
                          value={
                            value
                          }
                        >
                          {value}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
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
              {id
                ? "Save changes"
                : "Create student"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Layout>
  );
}
