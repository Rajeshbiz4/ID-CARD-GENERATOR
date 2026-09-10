import {
  useEffect,
  useMemo,
  useRef,
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
  DownloadRounded,
  PictureAsPdfRounded,
} from "@mui/icons-material";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import Layout from "../Layout";
import { PageHeader } from "../ui";

import {
  api,
  errorMessage,
} from "../api";

import TemplateRenderer from "../TemplateRenderer";

function fileBase(student) {
  const source =
    student?.admissionNo ||
    student?.name ||
    "student";

  return String(source)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
}

function studentLabel(student) {
  const classDivision = [
    student.className,
    student.division,
  ]
    .filter(Boolean)
    .join("-");

  return [
    student.name,
    classDivision,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function IdCardsPage({
  user,
  onLogout,
}) {
  const cardRef =
    useRef(null);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    school,
    setSchool,
  ] = useState({});

  const [
    templates,
    setTemplates,
  ] = useState([]);

  const [
    settings,
    setSettings,
  ] = useState({});

  const [
    studentId,
    setStudentId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/students"),
      api.get(
        "/school/profile"
      ),
      api.get("/templates"),
      api.get(
        "/school/template-settings"
      ),
    ])
      .then(
        ([
          studentsResponse,
          schoolResponse,
          templatesResponse,
          settingsResponse,
        ]) => {
          setStudents(
            studentsResponse
              .data.data ||
              []
          );

          setSchool(
            schoolResponse
              .data.data || {}
          );

          setTemplates(
            templatesResponse
              .data.data || []
          );

          setSettings(
            settingsResponse
              .data.data || {}
          );

          if (
            studentsResponse
              .data.data?.[0]
          ) {
            setStudentId(
              studentsResponse
                .data.data[0]
                ._id
            );
          }
        }
      )
      .catch((e) =>
        setError(
          errorMessage(e)
        )
      );
  }, []);

  const student =
    useMemo(
      () =>
        students.find(
          (item) =>
            item._id ===
            studentId
        ),
      [
        students,
        studentId,
      ]
    );

  const template =
    useMemo(() => {
      const selectedId =
        settings.templateId
          ?._id ||
        settings.templateId;

      return (
        templates.find(
          (item) =>
            item._id ===
            selectedId
        ) ||
        templates[0]
      );
    }, [
      templates,
      settings,
    ]);

  const selectTemplate =
    async (templateId) => {
      try {
        const response =
          await api.put(
            "/school/template-settings",
            {
              templateId,
            }
          );

        setSettings(
          response.data.data
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const capture =
    async () => {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            350
          )
      );

      return html2canvas(
        cardRef.current,
        {
          scale: 3,
          backgroundColor:
            "#fff",
          useCORS: true,
        }
      );
    };

  const downloadPng =
    async () => {
      try {
        const canvas =
          await capture();

        const link =
          document.createElement(
            "a"
          );

        link.download =
          `${fileBase(
            student
          )}-id-card.png`;

        link.href =
          canvas.toDataURL(
            "image/png"
          );

        link.click();

        await api.patch(
          `/students/${student._id}/card-generated`
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const downloadPdf =
    async () => {
      try {
        const canvas =
          await capture();

        const portrait =
          template.orientation !==
          "landscape";

        const width =
          portrait
            ? 53.98
            : 85.6;

        const height =
          portrait
            ? 85.6
            : 53.98;

        const pdf =
          new jsPDF({
            orientation:
              portrait
                ? "portrait"
                : "landscape",
            unit: "mm",
            format: [
              width,
              height,
            ],
          });

        pdf.addImage(
          canvas.toDataURL(
            "image/png"
          ),
          "PNG",
          0,
          0,
          width,
          height
        );

        pdf.save(
          `${fileBase(
            student
          )}-id-card.pdf`
        );

        await api.patch(
          `/students/${student._id}/card-generated`
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="ID Studio"
        title="Generate student ID card"
        description="Choose from 100 predefined templates or your school custom templates, then export PNG or PDF."
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
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
              <Stack
                spacing={2}
              >
                <TextField
                  select
                  label="Student"
                  value={
                    studentId
                  }
                  onChange={(
                    event
                  ) =>
                    setStudentId(
                      event.target
                        .value
                    )
                  }
                >
                  {students.map(
                    (item) => (
                      <MenuItem
                        key={
                          item._id
                        }
                        value={
                          item._id
                        }
                      >
                        {
                          studentLabel(
                            item
                          )
                        }
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  select
                  label="Template"
                  value={
                    template?._id ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    selectTemplate(
                      event.target
                        .value
                    )
                  }
                >
                  {templates.map(
                    (item) => (
                      <MenuItem
                        key={
                          item._id
                        }
                        value={
                          item._id
                        }
                      >
                        {
                          item.name
                        }{" "}
                        ·{" "}
                        {
                          item.type
                        }
                        {item.type ===
                          "SYSTEM" && (
                          <>
                            {" "}·{" "}
                            {item.language ===
                            "MR"
                              ? "मराठी"
                              : "English"}
                          </>
                        )}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <Button
                  variant="outlined"
                  startIcon={
                    <DownloadRounded />
                  }
                  disabled={
                    !student ||
                    !template
                  }
                  onClick={
                    downloadPng
                  }
                >
                  Download PNG
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    <PictureAsPdfRounded />
                  }
                  disabled={
                    !student ||
                    !template
                  }
                  onClick={
                    downloadPdf
                  }
                >
                  Download PDF
                </Button>
              </Stack>
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
              <Typography
                variant="h6"
              >
                Live preview
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {template?.name}
              </Typography>

              <Box
                sx={{
                  minHeight: 650,
                  display: "grid",
                  placeItems:
                    "center",
                  bgcolor:
                    "#eef3f8",
                  overflow: "auto",
                  p: 3,
                }}
              >
                {student &&
                template ? (
                  <Box
                    ref={
                      cardRef
                    }
                  >
                    <TemplateRenderer
                      template={
                        template
                      }
                      student={
                        student
                      }
                      school={
                        school
                      }
                      targetWidth={
                        template.orientation ===
                        "landscape"
                          ? 520
                          : 330
                      }
                    />
                  </Box>
                ) : (
                  <Typography
                    color="text.secondary"
                  >
                    Add a student first.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
