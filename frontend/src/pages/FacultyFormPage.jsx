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

const STAFF_TYPES = [
  ["Teacher", "Teacher / शिक्षक"],
  ["Principal", "Principal / मुख्याध्यापक"],
  ["Head Master", "Head Master / मुख्याध्यापक"],
  ["Office Staff", "Office Staff / कार्यालयीन कर्मचारी"],
  ["Clerk", "Clerk / लिपिक"],
  ["Support Staff", "Support Staff / सहाय्यक कर्मचारी"],
  ["Driver", "Driver / चालक"],
  ["Librarian", "Librarian / ग्रंथपाल"],
  ["Accountant", "Accountant / लेखापाल"],
  ["Other", "Other / इतर"],
];

const emptyFaculty = {
  name: "",
  employeeCode: "",
  staffType: "Teacher",
  designation: "",
  department: "",
  mobile: "",
  emergencyContact: "",
  bloodGroup: "",
  dob: "",
  joiningDate: "",
  qualification: "",
  address: "",
  photoFileId: null,
  status: "ACTIVE",
};

export default function FacultyFormPage({
  user,
  onLogout,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(emptyFaculty);
  const [error, setError] =
    useState("");
  const [uploading, setUploading] =
    useState(false);
  const [typingLanguage, setTypingLanguage] =
    useTypingLanguage();

  useEffect(() => {
    if (!id) return;

    api
      .get(`/faculty/${id}`)
      .then((response) => {
        const value =
          response.data.data;

        setForm({
          ...emptyFaculty,
          ...value,
          dob: value.dob
            ? value.dob.slice(0, 10)
            : "",
          joiningDate:
            value.joiningDate
              ? value.joiningDate.slice(
                  0,
                  10
                )
              : "",
        });
      })
      .catch((e) =>
        setError(
          errorMessage(e)
        )
      );
  }, [id]);

  const uploadPhoto =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      setUploading(true);
      setError("");

      try {
        const fileId =
          await uploadImage(
            file,
            "faculty-photo",
            "student"
          );

        setForm((current) => ({
          ...current,
          photoFileId: fileId,
        }));
      } catch (e) {
        setError(
          errorMessage(e)
        );
      } finally {
        setUploading(false);
      }
    };

  const save = async () => {
    setError("");

    if (!String(form.name || "").trim()) {
      setError(
        "Faculty name is required."
      );
      return;
    }

    if (!form.staffType) {
      setError(
        "Faculty type is required."
      );
      return;
    }

    try {
      if (id) {
        await api.put(
          `/faculty/${id}`,
          form
        );
      } else {
        await api.post(
          "/faculty",
          form
        );
      }

      navigate(
        "/school/faculty"
      );
    } catch (e) {
      setError(
        errorMessage(e)
      );
    }
  };

  const marathiFields =
    new Set([
      "name",
      "designation",
      "department",
      "qualification",
      "address",
    ]);

  const fields = [
    ["name", "Name / नाव *", 8],
    ["employeeCode", "Employee ID / कर्मचारी क्र.", 4],
    ["designation", "Designation / पद", 6],
    ["department", "Department / विभाग", 6],
    ["mobile", "Mobile / मोबाईल", 4],
    ["emergencyContact", "Emergency contact", 4],
    ["bloodGroup", "Blood group / रक्तगट", 4],
    ["qualification", "Qualification / पात्रता", 6],
    ["address", "Address / पत्ता", 12],
  ];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="Faculty & Staff"
        title={
          id
            ? "Edit faculty / staff"
            : "Add faculty / staff"
        }
        description="Name and faculty type are mandatory. Marathi text is stored exactly as entered."
      />

      <TypingLanguageBar
        value={typingLanguage}
        onChange={setTypingLanguage}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Card sx={{ overflow: "visible" }}>
        <CardContent sx={{ overflow: "visible" }}>
          <Grid
            container
            spacing={2}
            sx={{
              overflow: "visible",
              alignItems: "flex-start",
            }}
          >
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  minHeight: 230,
                  border:
                    "1px solid #cbd5e1",
                  bgcolor: "#f8fafc",
                  display: "grid",
                  placeItems: "center",
                  p: 2,
                }}
              >
                {form.photoFileId ? (
                  <StoredImage
                    fileId={form.photoFileId}
                    sx={{
                      width: 150,
                      height: 180,
                      objectFit: "cover",
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
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>

              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={<UploadFileRounded />}
                sx={{ mt: 1 }}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Upload photo"}

                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadPhoto}
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
                Optional. Photo is normalized to the same ID-photo format used for students.
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={9}
              sx={{ overflow: "visible" }}
            >
              <Grid
                container
                columnSpacing={2}
                rowSpacing={3}
                sx={{ overflow: "visible" }}
              >
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Faculty type / कर्मचारी प्रकार *"
                    value={form.staffType}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        staffType:
                          event.target.value,
                      })
                    }
                  >
                    {STAFF_TYPES.map(
                      ([value, label]) => (
                        <MenuItem
                          key={value}
                          value={value}
                        >
                          {label}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="DOB / जन्मतारीख"
                    value={form.dob || ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dob: event.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Joining date"
                    value={form.joiningDate || ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        joiningDate:
                          event.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {fields.map(
                  ([key, label, cols]) => (
                    <Grid
                      item
                      xs={12}
                      md={cols}
                      key={key}
                      sx={{
                        overflow: "visible",
                        position: "relative",
                      }}
                    >
                      {marathiFields.has(key) ? (
                        <MarathiTextField
                          typingLanguage={typingLanguage}
                          fullWidth
                          label={label}
                          value={form[key] || ""}
                          multiline={key === "address"}
                          minRows={key === "address" ? 2 : undefined}
                          onValueChange={(value) =>
                            setForm({
                              ...form,
                              [key]: value,
                            })
                          }
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label={label}
                          value={form[key] || ""}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              [key]:
                                event.target.value,
                            })
                          }
                        />
                      )}
                    </Grid>
                  )
                )}

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target.value,
                      })
                    }
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                sx={{ mt: 3 }}
              >
                <Button
                  onClick={() =>
                    navigate(
                      "/school/faculty"
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={save}
                >
                  {id
                    ? "Update faculty"
                    : "Create faculty"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Layout>
  );
}
